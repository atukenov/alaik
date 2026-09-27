using Alaik.Api.Dtos;
using Alaik.Domain.Entities;
using Alaik.Infrastructure.Auth;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Alaik.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AlaikDbContext db,
    ITokenService tokens,
    IPasswordHasher<User> hasher) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = NormalizeEmail(dto.Email);
        if (!IsValidEmail(email))
            return BadRequest(new { error = "invalid_email" });
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { error = "weak_password" });

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "email_taken" });

        var user = new User
        {
            Email = email,
            Name = string.IsNullOrWhiteSpace(dto.Name) ? email.Split('@')[0] : dto.Name.Trim(),
        };
        user.PasswordHash = hasher.HashPassword(user, dto.Password);
        db.Users.Add(user);

        var response = await IssueTokens(user);
        await db.SaveChangesAsync();
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = NormalizeEmail(dto.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
            return Unauthorized(new { error = "invalid_credentials" });

        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { error = "invalid_credentials" });

        var response = await IssueTokens(user);
        await db.SaveChangesAsync();
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshDto dto)
    {
        var stored = await db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == dto.RefreshToken && !t.Revoked);

        if (stored is null || stored.ExpiresAt < DateTimeOffset.UtcNow)
            return Unauthorized(new { error = "invalid_refresh_token" });

        var user = await db.Users.FindAsync(stored.UserId);
        if (user is null) return Unauthorized(new { error = "invalid_refresh_token" });

        stored.Revoked = true;
        var response = await IssueTokens(user);
        await db.SaveChangesAsync();
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var user = await db.Users.FindAsync(userId);
        return user is null ? Unauthorized() : Ok(ToDto(user));
    }

    [Authorize]
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Unauthorized();

        // Detach the user's reservations on OTHER people's events so those gifts stay
        // reserved (owners shouldn't see gifts suddenly freed) but lose the user link.
        var reservations = await db.Reservations
            .Where(r => r.ReservedByUserId == userId)
            .ToListAsync();
        foreach (var r in reservations)
            r.ReservedByUserId = null;

        // Owned events cascade to their items and reservations; refresh tokens go too.
        var refreshTokens = await db.RefreshTokens.Where(t => t.UserId == userId).ToListAsync();
        db.RefreshTokens.RemoveRange(refreshTokens);
        db.Users.Remove(user);

        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<AuthResponse> IssueTokens(User user)
    {
        var access = tokens.CreateAccessToken(user);
        var (refresh, expires) = tokens.CreateRefreshToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refresh,
            ExpiresAt = expires
        });
        return new AuthResponse(access, refresh, ToDto(user));
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Name, u.Email, u.Phone, u.AvatarUrl,
            u.EffectiveTier, u.IsPremium, u.SubscriptionUntil);

    private static string NormalizeEmail(string email) =>
        (email ?? string.Empty).Trim().ToLowerInvariant();

    private static bool IsValidEmail(string email) =>
        !string.IsNullOrWhiteSpace(email) &&
        System.Text.RegularExpressions.Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
}
