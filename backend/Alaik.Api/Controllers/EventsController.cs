using Alaik.Api.Dtos;
using Alaik.Domain;
using Alaik.Domain.Entities;
using Alaik.Domain.Enums;
using Alaik.Infrastructure.Auth;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/events")]
public class EventsController(AlaikDbContext db, ISlugGenerator slugs) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string filter = "mine")
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (filter == "reserved")
        {
            // Events (not owned by me) where I hold at least one active reservation.
            var events = await db.Events
                .Where(e => e.OwnerId != userId &&
                            e.Items.Any(i => i.Reservation != null &&
                                             i.Reservation.Status == ReservationStatus.Reserved &&
                                             i.Reservation.ReservedByUserId == userId))
                .Select(e => new EventSummaryDto(
                    e.Id, e.Title, e.Type, e.EventDate, e.Slug,
                    e.Items.Count,
                    e.Items.Count(i => i.Reservation != null && i.Reservation.Status == ReservationStatus.Reserved),
                    e.Items.Count(i => i.Reservation != null &&
                                       i.Reservation.Status == ReservationStatus.Reserved &&
                                       i.Reservation.ReservedByUserId == userId)))
                .ToListAsync();
            return Ok(events);
        }

        var mine = await db.Events
            .Where(e => e.OwnerId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EventSummaryDto(
                e.Id, e.Title, e.Type, e.EventDate, e.Slug,
                e.Items.Count,
                e.Items.Count(i => i.Reservation != null && i.Reservation.Status == ReservationStatus.Reserved),
                null))
            .ToListAsync();
        return Ok(mine);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEventDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { error = "title_required" });

        // Per-tier cap on the number of events.
        var user = await db.Users.FindAsync(userId);
        var (maxEvents, _) = PlanLimits.For(user?.EffectiveTier ?? SubscriptionTier.Free);
        if (await db.Events.CountAsync(e => e.OwnerId == userId) >= maxEvents)
            return StatusCode(StatusCodes.Status402PaymentRequired,
                new { error = "free_limit_events", limit = maxEvents, tier = user?.EffectiveTier.ToString() });

        var ev = new Event
        {
            OwnerId = userId.Value,
            Title = dto.Title.Trim(),
            Type = dto.Type,
            EventDate = dto.EventDate,
            Slug = await UniqueSlug()
        };
        db.Events.Add(ev);
        await db.SaveChangesAsync();
        return Ok(await BuildOwnerDto(ev.Id, userId.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var dto = await BuildOwnerDto(id, userId.Value);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateEventDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == id && e.OwnerId == userId);
        if (ev is null) return NotFound();

        ev.Title = dto.Title.Trim();
        ev.Type = dto.Type;
        ev.EventDate = dto.EventDate;
        await db.SaveChangesAsync();
        return Ok(await BuildOwnerDto(ev.Id, userId.Value));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == id && e.OwnerId == userId);
        if (ev is null) return NotFound();

        db.Events.Remove(ev);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- Items owned within an event ----
    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, CreateItemDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var ev = await db.Events.FirstOrDefaultAsync(e => e.Id == id && e.OwnerId == userId);
        if (ev is null) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { error = "title_required" });

        // Per-tier cap on gifts per event.
        var user = await db.Users.FindAsync(userId);
        var (_, maxGifts) = PlanLimits.For(user?.EffectiveTier ?? SubscriptionTier.Free);
        if (await db.WishlistItems.CountAsync(i => i.EventId == ev.Id) >= maxGifts)
            return StatusCode(StatusCodes.Status402PaymentRequired,
                new { error = "free_limit_gifts", limit = maxGifts, tier = user?.EffectiveTier.ToString() });

        db.WishlistItems.Add(new WishlistItem
        {
            EventId = ev.Id,
            Title = dto.Title.Trim(),
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            Store = dto.Store,
            Price = dto.Price,
            Currency = dto.Currency ?? "KZT",
            PurchaseLink = dto.PurchaseLink,
            Priority = dto.Priority
        });
        await db.SaveChangesAsync();
        return Ok(await BuildOwnerDto(ev.Id, userId.Value));
    }

    private async Task<string> UniqueSlug()
    {
        while (true)
        {
            var s = slugs.New();
            if (!await db.Events.AnyAsync(e => e.Slug == s)) return s;
        }
    }

    private async Task<OwnerEventDto?> BuildOwnerDto(Guid eventId, Guid userId)
    {
        var ev = await db.Events
            .Include(e => e.Items).ThenInclude(i => i.Reservation)
            .FirstOrDefaultAsync(e => e.Id == eventId && e.OwnerId == userId);
        if (ev is null) return null;

        var items = ev.Items
            .OrderBy(i => i.Priority).ThenBy(i => i.CreatedAt)
            .Select(i => new OwnerItemDto(
                i.Id, i.Title, i.Description, i.ImageUrl, i.Store,
                i.Price, i.Currency, i.PurchaseLink, i.Priority))
            .ToList();

        var covered = ev.Items.Count(i =>
            i.Reservation != null && i.Reservation.Status == ReservationStatus.Reserved);

        return new OwnerEventDto(
            ev.Id, ev.Title, ev.Type, ev.EventDate, ev.Slug,
            ev.Items.Count, covered, items);
    }
}
