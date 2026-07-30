using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace Alaik.Infrastructure.Services;

public record LinkPreview(string? Title, string? ImageUrl, string? Store, decimal? Price, string? Currency);

public interface ILinkPreviewService
{
    Task<LinkPreview?> FetchAsync(string url, CancellationToken ct = default);
}

/// <summary>
/// Fetches a product page server-side and extracts OpenGraph metadata
/// (title, image, price). Guards against SSRF by rejecting non-public hosts.
/// </summary>
public class LinkPreviewService(IHttpClientFactory httpFactory, ILogger<LinkPreviewService> logger)
    : ILinkPreviewService
{
    private const int MaxBytes = 512 * 1024; // read at most 512 KB of HTML

    public async Task<LinkPreview?> FetchAsync(string url, CancellationToken ct = default)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return null;

        if (await IsBlockedHostAsync(uri.Host, ct))
        {
            logger.LogWarning("Blocked link-preview request to non-public host {Host}", uri.Host);
            return null;
        }

        try
        {
            var client = httpFactory.CreateClient("linkPreview");
            using var resp = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!resp.IsSuccessStatusCode) return null;

            var contentType = resp.Content.Headers.ContentType?.MediaType ?? "";
            if (!contentType.Contains("html")) return null;

            var html = await ReadCappedAsync(resp, ct);

            var title = Meta(html, "og:title") ?? Meta(html, "twitter:title") ?? TitleTag(html);
            var image = AbsoluteUrl(uri, Meta(html, "og:image") ?? Meta(html, "twitter:image"));
            var (price, currency) = ParsePrice(html);
            var store = uri.Host.Replace("www.", "");

            if (title is null && image is null) return null;
            return new LinkPreview(Trim(title), image, store, price, currency);
        }
        catch (Exception ex)
        {
            logger.LogInformation(ex, "Link preview failed for {Url}", uri);
            return null;
        }
    }

    private static async Task<string> ReadCappedAsync(HttpResponseMessage resp, CancellationToken ct)
    {
        await using var stream = await resp.Content.ReadAsStreamAsync(ct);
        var buffer = new byte[MaxBytes];
        var total = 0;
        int read;
        while (total < MaxBytes &&
               (read = await stream.ReadAsync(buffer.AsMemory(total, MaxBytes - total), ct)) > 0)
            total += read;
        return System.Text.Encoding.UTF8.GetString(buffer, 0, total);
    }

    private static string? Meta(string html, string property)
    {
        // Match <meta property="og:image" content="..."> with attributes in any order.
        var m = Regex.Match(html,
            $"<meta[^>]+(?:property|name)=[\"']{Regex.Escape(property)}[\"'][^>]*content=[\"']([^\"']+)[\"']",
            RegexOptions.IgnoreCase);
        if (m.Success) return WebUtility.HtmlDecode(m.Groups[1].Value);

        m = Regex.Match(html,
            $"<meta[^>]+content=[\"']([^\"']+)[\"'][^>]*(?:property|name)=[\"']{Regex.Escape(property)}[\"']",
            RegexOptions.IgnoreCase);
        return m.Success ? WebUtility.HtmlDecode(m.Groups[1].Value) : null;
    }

    private static string? TitleTag(string html)
    {
        var m = Regex.Match(html, "<title[^>]*>([^<]+)</title>", RegexOptions.IgnoreCase);
        return m.Success ? WebUtility.HtmlDecode(m.Groups[1].Value) : null;
    }

    private static (decimal?, string?) ParsePrice(string html)
    {
        var amount = Meta(html, "product:price:amount") ?? Meta(html, "og:price:amount");
        var currency = Meta(html, "product:price:currency") ?? Meta(html, "og:price:currency");
        if (amount is not null &&
            decimal.TryParse(amount, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var p))
            return (p, currency);
        return (null, null);
    }

    private static string? AbsoluteUrl(Uri baseUri, string? maybe)
    {
        if (string.IsNullOrWhiteSpace(maybe)) return null;
        return Uri.TryCreate(baseUri, maybe, out var abs) ? abs.ToString() : maybe;
    }

    private static string? Trim(string? s) =>
        string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    // Reject loopback / private / link-local addresses to prevent SSRF.
    private static async Task<bool> IsBlockedHostAsync(string host, CancellationToken ct)
    {
        if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
            host.EndsWith(".local", StringComparison.OrdinalIgnoreCase))
            return true;

        try
        {
            var addrs = await Dns.GetHostAddressesAsync(host, ct);
            return addrs.Length == 0 || addrs.Any(IsPrivate);
        }
        catch
        {
            return true; // if it doesn't resolve, don't fetch it
        }
    }

    private static bool IsPrivate(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip)) return true;
        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            var b = ip.GetAddressBytes();
            return b[0] == 10
                || (b[0] == 172 && b[1] >= 16 && b[1] <= 31)
                || (b[0] == 192 && b[1] == 168)
                || (b[0] == 169 && b[1] == 254)
                || b[0] == 127;
        }
        if (ip.AddressFamily == AddressFamily.InterNetworkV6)
            return ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal ||
                   ip.Equals(IPAddress.IPv6Loopback);
        return false;
    }
}
