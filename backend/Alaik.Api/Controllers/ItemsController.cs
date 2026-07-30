using Alaik.Api.Dtos;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/items")]
public class ItemsController(AlaikDbContext db) : ControllerBase
{
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateItemDto dto)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var item = await db.WishlistItems
            .Include(i => i.Event)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (item is null || item.Event!.OwnerId != userId) return NotFound();
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { error = "title_required" });

        item.Title = dto.Title.Trim();
        item.Description = dto.Description;
        item.ImageUrl = dto.ImageUrl;
        item.Store = dto.Store;
        item.Price = dto.Price;
        item.Currency = dto.Currency ?? "KZT";
        item.PurchaseLink = dto.PurchaseLink;
        item.Priority = dto.Priority;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var item = await db.WishlistItems
            .Include(i => i.Event)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (item is null || item.Event!.OwnerId != userId) return NotFound();

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
