using System.Net;
using Alaik.Domain.Entities;
using Alaik.Infrastructure.Auth;
using Alaik.Infrastructure.Data;
using Alaik.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Alaik.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AlaikDbContext>(o => o.UseNpgsql(ResolveConnectionString(config)));

        services.Configure<JwtOptions>(config.GetSection(JwtOptions.SectionName));
        services.AddScoped<ITokenService, TokenService>();
        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddSingleton<ISlugGenerator, SlugGenerator>();

        services.AddScoped<ILinkPreviewService, LinkPreviewService>();
        services.AddHttpClient("linkPreview", c =>
        {
            c.Timeout = TimeSpan.FromSeconds(8);
            c.MaxResponseContentBufferSize = 1024 * 1024;
            c.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (compatible; AlaikBot/1.0; +https://alaik.app)");
            c.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml");
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AllowAutoRedirect = true,
            MaxAutomaticRedirections = 5,
            AutomaticDecompression = DecompressionMethods.All,
        });

        return services;
    }

    // Prefer a managed-host DATABASE_URL (Railway/Render/Heroku style
    // "postgres://user:pass@host:port/db"); fall back to ConnectionStrings:Default,
    // then a local-dev default.
    private static string ResolveConnectionString(IConfiguration config)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl) &&
            Uri.TryCreate(databaseUrl, UriKind.Absolute, out var uri) &&
            (uri.Scheme == "postgres" || uri.Scheme == "postgresql"))
        {
            var userInfo = uri.UserInfo.Split(':', 2);
            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.Port > 0 ? uri.Port : 5432,
                Username = Uri.UnescapeDataString(userInfo[0]),
                Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
                Database = uri.AbsolutePath.TrimStart('/'),
                SslMode = SslMode.Prefer,
            };
            return builder.ConnectionString;
        }

        return config.GetConnectionString("Default")
            ?? "Host=localhost;Port=5442;Database=alaik;Username=alaik;Password=alaik";
    }
}
