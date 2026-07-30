using Alaik.Domain.Entities;
using Alaik.Domain.Enums;
using Alaik.Infrastructure.Auth;
using Microsoft.AspNetCore.Identity;

namespace Alaik.Infrastructure.Data;

public static class DbSeeder
{
    public static void Seed(AlaikDbContext db, ISlugGenerator slugs, IPasswordHasher<User> hasher)
    {
        if (db.Users.Any()) return;

        // Demo account: ayana@alaik.app / alaik123
        var ayana = new User { Name = "Аяна Смагулова", Email = "ayana@alaik.app" };
        ayana.PasswordHash = hasher.HashPassword(ayana, "alaik123");
        db.Users.Add(ayana);

        var birthday = new Event
        {
            OwnerId = ayana.Id,
            Title = "Данияру — 30!",
            Type = EventType.Birthday,
            EventDate = new DateOnly(2026, 8, 15),
            Slug = slugs.New(),
            Items =
            {
                new WishlistItem { Title = "Наушники Sony WH-1000XM5", Store = "meloman.kz", Price = 149900, Currency = "KZT", Priority = 0 },
                new WishlistItem { Title = "Кофемашина De'Longhi", Store = "technodom.kz", Price = 89000, Currency = "KZT", Priority = 1 },
                new WishlistItem { Title = "Книга «Атлас мира»", Store = "meloman.kz", Price = 12500, Currency = "KZT", Priority = 2 },
                new WishlistItem { Title = "Сертификат в СПА", Store = "spa-almaty.kz", Price = 30000, Currency = "KZT", Priority = 3 },
                new WishlistItem { Title = "Умная колонка Яндекс", Store = "technodom.kz", Price = 45000, Currency = "KZT", Priority = 4 },
            }
        };

        var wedding = new Event
        {
            OwnerId = ayana.Id,
            Title = "Свадьба Айгерим и Данияра",
            Type = EventType.Wedding,
            EventDate = new DateOnly(2026, 9, 2),
            Slug = slugs.New(),
            Items =
            {
                new WishlistItem { Title = "Набор посуды", Store = "technodom.kz", Price = 65000, Currency = "KZT", Priority = 0 },
                new WishlistItem { Title = "Робот-пылесос", Store = "technodom.kz", Price = 120000, Currency = "KZT", Priority = 1 },
                new WishlistItem { Title = "Постельное бельё", Store = "hoff.kz", Price = 35000, Currency = "KZT", Priority = 2 },
            }
        };

        var housewarming = new Event
        {
            OwnerId = ayana.Id,
            Title = "Новоселье на Абая",
            Type = EventType.Housewarming,
            EventDate = new DateOnly(2026, 10, 10),
            Slug = slugs.New(),
            Items =
            {
                new WishlistItem { Title = "Торшер", Store = "hoff.kz", Price = 28000, Currency = "KZT", Priority = 0 },
                new WishlistItem { Title = "Кофейный столик", Store = "hoff.kz", Price = 42000, Currency = "KZT", Priority = 1 },
            }
        };

        db.Events.AddRange(birthday, wedding, housewarming);

        // A couple of the birthday items are pre-reserved so the owner progress bar is non-zero.
        db.SaveChanges();
        var reserved = birthday.Items.OrderBy(i => i.Priority).Take(2).ToList();
        foreach (var it in reserved)
            db.Reservations.Add(new Reservation
            {
                ItemId = it.Id,
                ReservedByName = "Гость",
                GuestToken = Guid.NewGuid().ToString("N"),
                Status = ReservationStatus.Reserved
            });

        db.SaveChanges();
    }
}
