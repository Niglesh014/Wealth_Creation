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
    public class DashboardController : ControllerBase
    {
        private readonly IPortfolioService _portfolioService;

        public DashboardController(IPortfolioService portfolioService)
        {
            _portfolioService = portfolioService;
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

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            int userId = GetCurrentUserId();
            var summary = await _portfolioService.GetDashboardSummaryAsync(userId);
            return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
        }

        [HttpGet("performance")]
        public async Task<IActionResult> GetPerformance([FromQuery] string range = "1M")
        {
            int userId = GetCurrentUserId();
            var points = await _portfolioService.GetPerformanceHistoryAsync(userId, range);
            return Ok(ApiResponse<List<PerformancePointDto>>.Ok(points));
        }

        [HttpGet("allocation")]
        public async Task<IActionResult> GetAllocation()
        {
            int userId = GetCurrentUserId();
            var allocation = await _portfolioService.GetAssetAllocationAsync(userId);
            return Ok(ApiResponse<List<AllocationItemDto>>.Ok(allocation));
        }

        [HttpGet("top-holdings")]
        public async Task<IActionResult> GetTopHoldings([FromQuery] int limit = 5)
        {
            int userId = GetCurrentUserId();
            var holdings = await _portfolioService.GetTopHoldingsAsync(userId, limit);
            return Ok(ApiResponse<List<TopHoldingDto>>.Ok(holdings));
        }
    }
}
