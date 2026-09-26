using System.Text;
using System.Text.Json.Serialization;
using Alaik.Domain.Entities;
using Alaik.Infrastructure;
using Alaik.Infrastructure.Auth;
using Alaik.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// PaaS hosts (Railway, Render, …) assign the listening port via $PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers().AddJsonOptions(o =>
{
    // Serialize enums as strings ("Wedding") so the frontend deals in readable values.
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddInfrastructure(builder.Configuration);

var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
          ?? new JwtOptions();

// In production the JWT signing key MUST be provided via configuration/env
// (Jwt__Key) and must not be the checked-in dev placeholder.
if (builder.Environment.IsProduction() &&
    (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Contains("dev-only") || jwt.Key.Length < 32))
{
    throw new InvalidOperationException(
        "Jwt:Key must be set to a strong secret (>= 32 chars) in production. " +
        "Provide it via the Jwt__Key environment variable.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key))
        };
    });
builder.Services.AddAuthorization();

const string CorsPolicy = "AlaikCors";
// Vite dev server + Capacitor WebView origins, plus any extra production web
// origins from config (Cors__Origins="https://app.example.com,https://…").
string[] defaultOrigins =
[
    "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173",
    "capacitor://localhost", "ionic://localhost", "http://localhost",
];
var extraOrigins = builder.Configuration["Cors:Origins"]
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? [];
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p =>
    p.WithOrigins([.. defaultOrigins, .. extraOrigins])
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();

// Apply migrations on startup so the stack is runnable out of the box in dev.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AlaikDbContext>();
    db.Database.Migrate();
    DbSeeder.Seed(
        db,
        scope.ServiceProvider.GetRequiredService<ISlugGenerator>(),
        scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>());
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
