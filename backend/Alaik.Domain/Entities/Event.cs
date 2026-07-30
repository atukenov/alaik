using Alaik.Domain.Enums;

namespace Alaik.Domain.Entities;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public User? Owner { get; set; }

    public string Title { get; set; } = string.Empty;
    public EventType Type { get; set; }
    public DateOnly? EventDate { get; set; }
    public string? CoverImageUrl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}
