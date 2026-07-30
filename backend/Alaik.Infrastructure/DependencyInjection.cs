using System.Net;
using Alaik.Domain.Entities;
using Alaik.Infrastructure.Auth;
using Alaik.Infrastructure.Data;
using Alaik.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Alaik.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Default")
            ?? "Host=localhost;Port=5442;Database=alaik;Username=alaik;Password=alaik";

        services.AddDbContext<AlaikDbContext>(o => o.UseNpgsql(connectionString));

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
}
