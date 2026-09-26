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

    // Alaik Plus subscription: premium while this is in the future (null/past = free tier).
    public DateTimeOffset? PremiumUntil { get; set; }

    public bool IsPremium => PremiumUntil.HasValue && PremiumUntil.Value > DateTimeOffset.UtcNow;

    public ICollection<Event> Events { get; set; } = new List<Event>();
}
