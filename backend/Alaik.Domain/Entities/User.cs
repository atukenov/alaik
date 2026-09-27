using Alaik.Domain.Enums;

namespace Alaik.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Purchased subscription tier and when it expires. The tier only applies while
    // SubscriptionUntil is in the future; otherwise the user falls back to Free.
    public SubscriptionTier Tier { get; set; } = SubscriptionTier.Free;
    public DateTimeOffset? SubscriptionUntil { get; set; }

    public SubscriptionTier EffectiveTier =>
        SubscriptionUntil.HasValue && SubscriptionUntil.Value > DateTimeOffset.UtcNow
            ? Tier
            : SubscriptionTier.Free;

    public bool IsPremium => EffectiveTier != SubscriptionTier.Free;

    public ICollection<Event> Events { get; set; } = new List<Event>();
}
