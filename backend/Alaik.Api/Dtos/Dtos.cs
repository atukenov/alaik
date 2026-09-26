using Alaik.Domain.Enums;

namespace Alaik.Api.Dtos;

// ---- Auth ----
public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);
public record RefreshDto(string RefreshToken);
public record AuthResponse(string AccessToken, string RefreshToken, UserDto User);
public record UserDto(
    Guid Id, string Name, string Email, string? Phone, string? AvatarUrl,
    bool IsPremium, DateTimeOffset? PremiumUntil);

// ---- Notifications ----
public record NotificationDto(
    Guid Id,
    Guid EventId,
    string EventTitle,
    int Threshold,
    string Title,
    string Body,
    bool IsRead,
    DateTimeOffset CreatedAt);

// ---- Events (owner) ----
public record CreateEventDto(string Title, EventType Type, DateOnly? EventDate);
public record UpdateEventDto(string Title, EventType Type, DateOnly? EventDate);

public record EventSummaryDto(
    Guid Id,
    string Title,
    EventType Type,
    DateOnly? EventDate,
    string Slug,
    int TotalItems,
    int CoveredItems,
    int? ReservedByMe);

public record OwnerEventDto(
    Guid Id,
    string Title,
    EventType Type,
    DateOnly? EventDate,
    string Slug,
    int TotalItems,
    int CoveredItems,
    IReadOnlyList<OwnerItemDto> Items);

// Owner never sees reservation identity — only the item data.
public record OwnerItemDto(
    Guid Id,
    string Title,
    string? Description,
    string? ImageUrl,
    string? Store,
    decimal? Price,
    string? Currency,
    string? PurchaseLink,
    int Priority);

// ---- Items ----
public record CreateItemDto(
    string Title,
    string? Description,
    string? ImageUrl,
    string? Store,
    decimal? Price,
    string? Currency,
    string? PurchaseLink,
    int Priority);

public record UpdateItemDto(
    string Title,
    string? Description,
    string? ImageUrl,
    string? Store,
    decimal? Price,
    string? Currency,
    string? PurchaseLink,
    int Priority);

// ---- Public / guest ----
public record GuestEventDto(
    string Slug,
    string Title,
    EventType Type,
    DateOnly? EventDate,
    string OwnerName,
    int TotalItems,
    int ChosenItems,
    IReadOnlyList<GuestItemDto> Items);

// Guests see whether an item is taken, never who took it.
public record GuestItemDto(
    Guid Id,
    string Title,
    string? Store,
    string? ImageUrl,
    decimal? Price,
    string? Currency,
    string? PurchaseLink,
    bool IsReserved,
    bool ReservedByMe);

public record ReserveDto(string? Name, string? GuestToken);
public record ReserveResult(bool IsReserved, string? GuestToken);

// ---- Link preview ----
public record LinkPreviewRequest(string Url);
public record LinkPreviewResponse(
    string? Title,
    string? ImageUrl,
    string? Store,
    decimal? Price,
    string? Currency);
