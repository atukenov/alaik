namespace Alaik.Domain.Entities;

public class WishlistItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Event? Event { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? Store { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; } = "KZT";
    public string? PurchaseLink { get; set; }
    public int Priority { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Reservation? Reservation { get; set; }
}
