using System.Text.Json;
using Alaik.Domain.Enums;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Api.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController(
    AlaikDbContext db,
    IWebHostEnvironment env,
    IConfiguration config,
    ILogger<BillingController> logger) : ControllerBase
{
    // Dev-only: set the tier so the paid experience can be tested without a real
    // App Store / RevenueCat purchase. In production, tiers come from the webhook.
    public record SetTierDto(string Tier);

    [Authorize]
    [HttpPost("dev-set-tier")]
    public async Task<IActionResult> DevSetTier(SetTierDto dto)
    {
        // Enabled in Development, or on any host when Billing:AllowDevTier=true.
        // Turn the flag OFF before public launch — it lets a user set their own tier.
        if (!env.IsDevelopment() && !config.GetValue<bool>("Billing:AllowDevTier"))
            return NotFound();
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        if (!Enum.TryParse<SubscriptionTier>(dto.Tier, ignoreCase: true, out var tier))
            return BadRequest(new { error = "bad_tier" });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        user.Tier = tier;
        user.SubscriptionUntil = tier == SubscriptionTier.Free
            ? null
            : DateTimeOffset.UtcNow.AddYears(1);
        await db.SaveChangesAsync();
        return Ok(new { tier = user.EffectiveTier.ToString(), subscriptionUntil = user.SubscriptionUntil });
    }

    // RevenueCat entitlement webhook. Configure it in the RevenueCat dashboard:
    //   URL:  https://<your-api>/api/billing/webhook
    //   Header Authorization: <a shared secret you also put in RevenueCat:AuthHeader>
    // Set the app_user_id in the app to our User.Id (Purchases.logIn(userId)), and map
    // entitlement ids to tiers via RevenueCat:PlusEntitlement / RevenueCat:MaxEntitlement.
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] JsonElement payload)
    {
        var expected = config["RevenueCat:AuthHeader"];
        if (!string.IsNullOrEmpty(expected) &&
            Request.Headers.Authorization.ToString() != expected)
            return Unauthorized();

        if (!payload.TryGetProperty("event", out var ev)) return Ok(new { ignored = true });

        var appUserId = ev.TryGetProperty("app_user_id", out var a) ? a.GetString() : null;
        if (!Guid.TryParse(appUserId, out var userId)) return Ok(new { ignored = true });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Ok(new { ignored = true });

        var plusId = config["RevenueCat:PlusEntitlement"] ?? "plus";
        var maxId = config["RevenueCat:MaxEntitlement"] ?? "max";

        var entitlements = ev.TryGetProperty("entitlement_ids", out var e) && e.ValueKind == JsonValueKind.Array
            ? e.EnumerateArray().Select(x => x.GetString()).ToHashSet()
            : new HashSet<string?>();

        var tier = entitlements.Contains(maxId) ? SubscriptionTier.Max
            : entitlements.Contains(plusId) ? SubscriptionTier.Plus
            : SubscriptionTier.Free;

        var type = ev.TryGetProperty("type", out var t) ? t.GetString() : null;
        if (type is "EXPIRATION" or "CANCELLATION")
            tier = SubscriptionTier.Free;

        user.Tier = tier;
        user.SubscriptionUntil = tier == SubscriptionTier.Free
            ? null
            : ev.TryGetProperty("expiration_at_ms", out var exp) && exp.TryGetInt64(out var ms)
                ? DateTimeOffset.FromUnixTimeMilliseconds(ms)
                : DateTimeOffset.UtcNow.AddMonths(1);

        await db.SaveChangesAsync();
        logger.LogInformation("Billing: user {User} set to {Tier}", userId, tier);
        return Ok(new { received = true });
    }
}
