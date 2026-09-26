using Alaik.Api.Dtos;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Alaik.Api.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController(AlaikDbContext db, IWebHostEnvironment env) : ControllerBase
{
    // Dev-only: flip Alaik Plus on/off so the premium experience can be tested
    // without a real App Store / RevenueCat purchase. In production, premium is
    // granted via the store webhook below.
    [Authorize]
    [HttpPost("dev-upgrade")]
    public async Task<IActionResult> DevUpgrade()
    {
        if (!env.IsDevelopment()) return NotFound();
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        user.PremiumUntil = DateTimeOffset.UtcNow.AddYears(1);
        await db.SaveChangesAsync();
        return Ok(new { isPremium = user.IsPremium, premiumUntil = user.PremiumUntil });
    }

    [Authorize]
    [HttpPost("dev-downgrade")]
    public async Task<IActionResult> DevDowngrade()
    {
        if (!env.IsDevelopment()) return NotFound();
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        user.PremiumUntil = null;
        await db.SaveChangesAsync();
        return Ok(new { isPremium = user.IsPremium, premiumUntil = user.PremiumUntil });
    }

    // Production entitlement webhook. Point RevenueCat (or App Store Server
    // Notifications) here to grant/revoke Alaik Plus.
    // TODO before go-live:
    //   1. Verify the request signature / Authorization header from the provider.
    //   2. Map the provider's app_user_id to our User.Id.
    //   3. Set PremiumUntil from the entitlement's expiration date.
    [AllowAnonymous]
    [HttpPost("webhook")]
    public IActionResult Webhook()
    {
        // Not yet wired to a provider — acknowledge so the endpoint exists.
        return Ok(new { received = true });
    }
}
