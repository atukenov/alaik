namespace Alaik.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Recipient — the event owner.
    public Guid UserId { get; set; }

    public Guid EventId { get; set; }
    public Event? Event { get; set; }

    // Reservation-progress threshold that triggered this notification (50, 80, 100).
    public int Threshold { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
