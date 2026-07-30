using Alaik.Domain.Enums;

namespace Alaik.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemId { get; set; }
    public WishlistItem? Item { get; set; }

    // Who reserved. Nullable for anonymous guests; never exposed to the event owner.
    public Guid? ReservedByUserId { get; set; }
    public string? ReservedByName { get; set; }

    // Opaque token given to an anonymous guest so they (and only they) can cancel.
    public string? GuestToken { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Reserved;
    public DateTimeOffset ReservedAt { get; set; } = DateTimeOffset.UtcNow;
}
