using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Common;
using WealthWise.API.Services;

namespace WealthWise.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WatchlistController : ControllerBase
    {
        private readonly IWatchlistService _watchlistService;

        public WatchlistController(IWatchlistService watchlistService)
        {
            _watchlistService = watchlistService;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            return 1;
        }

        [HttpGet]
        public async Task<IActionResult> GetWatchlist([FromQuery] string? search = null, [FromQuery] string? sortBy = null)
        {
            int userId = GetCurrentUserId();
            var list = await _watchlistService.GetWatchlistAsync(userId, search, sortBy);
            return Ok(ApiResponse<List<AssetMarketDto>>.Ok(list));
        }

        [HttpPost("{ticker}")]
        public async Task<IActionResult> AddToWatchlist(string ticker)
        {
            int userId = GetCurrentUserId();
            bool result = await _watchlistService.AddToWatchlistAsync(userId, ticker);
            if (!result)
                return NotFound(ApiResponse<string>.Fail($"Asset with ticker '{ticker}' was not found."));

            return Ok(ApiResponse<string>.Ok($"Added '{ticker}' to your watchlist."));
        }

        [HttpDelete("{ticker}")]
        public async Task<IActionResult> RemoveFromWatchlist(string ticker)
        {
            int userId = GetCurrentUserId();
            bool result = await _watchlistService.RemoveFromWatchlistAsync(userId, ticker);
            if (!result)
                return NotFound(ApiResponse<string>.Fail($"Asset with ticker '{ticker}' was not in your watchlist."));

            return Ok(ApiResponse<string>.Ok($"Removed '{ticker}' from your watchlist."));
        }
    }
}
