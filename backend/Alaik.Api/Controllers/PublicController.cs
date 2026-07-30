using Alaik.Api.Dtos;
using Alaik.Domain.Entities;
using Alaik.Domain.Enums;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Api.Controllers;

// No [Authorize]: guests open the list without an account. If a JWT is present it is
// used to attribute the reservation to that user, but it is never required.
[ApiController]
[Route("api/public")]
public class PublicController(AlaikDbContext db) : ControllerBase
{
    [HttpGet("events/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string? guestKey)
    {
        var userId = User.GetUserId();

        var ev = await db.Events
            .Include(e => e.Owner)
            .Include(e => e.Items).ThenInclude(i => i.Reservation)
            .FirstOrDefaultAsync(e => e.Slug == slug);
        if (ev is null) return NotFound();

        var items = ev.Items
            .OrderBy(i => i.Priority).ThenBy(i => i.CreatedAt)
            .Select(i =>
            {
                var active = i.Reservation is { Status: ReservationStatus.Reserved };
                var mine = active && IsMine(i.Reservation!, userId, guestKey);
                return new GuestItemDto(
                    i.Id, i.Title, i.Store, i.ImageUrl, i.Price, i.Currency, i.PurchaseLink, active, mine);
            })
            .ToList();

        var chosen = items.Count(i => i.IsReserved);
        var dto = new GuestEventDto(
            ev.Slug, ev.Title, ev.Type, ev.EventDate,
            ev.Owner?.Name ?? "", ev.Items.Count, chosen, items);
        return Ok(dto);
    }

    [HttpPost("items/{itemId:guid}/reserve")]
    public async Task<IActionResult> Reserve(Guid itemId, ReserveDto dto)
    {
        var userId = User.GetUserId();

        var item = await db.WishlistItems
            .Include(i => i.Reservation)
            .FirstOrDefaultAsync(i => i.Id == itemId);
        if (item is null) return NotFound();

        if (item.Reservation is { Status: ReservationStatus.Reserved })
            return Conflict(new { error = "already_reserved" });

        // One reservation per person per event. A logged-in user is identified by
        // their id; an anonymous guest by a per-event key stored in their browser.
        var eventId = item.EventId;
        string? guestKey = userId is null ? dto.GuestToken : null;

        var alreadyHasOne = await db.WishlistItems.AnyAsync(other =>
            other.EventId == eventId &&
            other.Id != item.Id &&
            other.Reservation != null &&
            other.Reservation.Status == ReservationStatus.Reserved &&
            (userId != null
                ? other.Reservation.ReservedByUserId == userId
                : guestKey != null && other.Reservation.GuestToken == guestKey));

        if (alreadyHasOne)
            return Conflict(new { error = "event_limit" });

        // New anonymous guest reserving for the first time in this event.
        if (userId is null && guestKey is null)
            guestKey = Guid.NewGuid().ToString("N");

        if (item.Reservation is null)
        {
            db.Reservations.Add(new Reservation
            {
                ItemId = item.Id,
                ReservedByUserId = userId,
                ReservedByName = dto.Name,
                GuestToken = guestKey,
                Status = ReservationStatus.Reserved
            });
        }
        else
        {
            // A previously cancelled reservation row exists — re-activate it.
            item.Reservation.Status = ReservationStatus.Reserved;
            item.Reservation.ReservedByUserId = userId;
            item.Reservation.ReservedByName = dto.Name;
            item.Reservation.GuestToken = guestKey;
            item.Reservation.ReservedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync();
        await NotifyThresholdsAsync(eventId);
        return Ok(new ReserveResult(true, guestKey));
    }

    // After a reservation, notify the event owner the first time coverage crosses
    // 50%, 80% and 100%. One notification per threshold per event (deduped by a
    // unique index on EventId+Threshold).
    private async Task NotifyThresholdsAsync(Guid eventId)
    {
        var ev = await db.Events
            .Include(e => e.Items).ThenInclude(i => i.Reservation)
            .FirstOrDefaultAsync(e => e.Id == eventId);
        if (ev is null || ev.Items.Count == 0) return;

        var total = ev.Items.Count;
        var covered = ev.Items.Count(i =>
            i.Reservation is { Status: ReservationStatus.Reserved });
        var pct = (int)Math.Floor(covered * 100.0 / total);

        var existing = await db.Notifications
            .Where(n => n.EventId == eventId)
            .Select(n => n.Threshold)
            .ToListAsync();

        var added = false;
        foreach (var threshold in new[] { 50, 80, 100 })
        {
            if (pct >= threshold && !existing.Contains(threshold))
            {
                db.Notifications.Add(new Notification
                {
                    UserId = ev.OwnerId,
                    EventId = ev.Id,
                    Threshold = threshold,
                    Title = ev.Title,
                    Body = threshold == 100
                        ? $"Все подарки забронированы ({covered} из {total})."
                        : $"Забронировано {threshold}% подарков ({covered} из {total}).",
                });
                added = true;
            }
        }

        if (added) await db.SaveChangesAsync();
    }

    [HttpPost("items/{itemId:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid itemId, ReserveDto dto)
    {
        var userId = User.GetUserId();

        var item = await db.WishlistItems
            .Include(i => i.Reservation)
            .FirstOrDefaultAsync(i => i.Id == itemId);
        if (item?.Reservation is null || item.Reservation.Status != ReservationStatus.Reserved)
            return NotFound();

        if (!IsMine(item.Reservation, userId, dto.GuestToken))
            return Forbid();

        db.Reservations.Remove(item.Reservation);
        await db.SaveChangesAsync();
        return Ok(new ReserveResult(false, null));
    }

    private static bool IsMine(Reservation r, Guid? userId, string? guestKey) =>
        (userId is not null && r.ReservedByUserId == userId) ||
        (guestKey is not null && r.GuestToken == guestKey);
}
