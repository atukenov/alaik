using Alaik.Api.Dtos;
using Alaik.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Alaik.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/link")]
public class LinkController(ILinkPreviewService preview) : ControllerBase
{
    [HttpPost("preview")]
    public async Task<IActionResult> Preview(LinkPreviewRequest dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Url))
            return BadRequest(new { error = "url_required" });

        var result = await preview.FetchAsync(dto.Url, ct);
        if (result is null)
            return Ok(new LinkPreviewResponse(null, null, null, null, null));

        return Ok(new LinkPreviewResponse(
            result.Title, result.ImageUrl, result.Store, result.Price, result.Currency));
    }
}
