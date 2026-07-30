using Alaik.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Infrastructure.Data;

public class AlaikDbContext(DbContextOptions<AlaikDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Name).HasMaxLength(120);
            e.Property(x => x.Email).HasMaxLength(160).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(32);
        });

        b.Entity<Event>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(160);
            e.Property(x => x.Slug).HasMaxLength(40);
            e.HasOne(x => x.Owner)
                .WithMany(u => u.Events)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<WishlistItem>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Price).HasPrecision(12, 2);
            e.HasOne(x => x.Event)
                .WithMany(ev => ev.Items)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Reservation>(e =>
        {
            // One active reservation per item enforced in app logic; unique index on ItemId.
            e.HasIndex(x => x.ItemId).IsUnique();
            e.HasOne(x => x.Item)
                .WithOne(i => i.Reservation)
                .HasForeignKey<Reservation>(x => x.ItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<RefreshToken>(e =>
        {
            e.HasIndex(x => x.Token).IsUnique();
            e.Property(x => x.Token).HasMaxLength(200);
        });

        b.Entity<Notification>(e =>
        {
            e.HasIndex(x => new { x.EventId, x.Threshold }).IsUnique();
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Body).HasMaxLength(400);
            e.HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
