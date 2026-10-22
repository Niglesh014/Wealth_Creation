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
    public class PortfolioController : ControllerBase
    {
        private readonly IPortfolioService _portfolioService;

        public PortfolioController(IPortfolioService portfolioService)
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

        [HttpGet("investments")]
        public async Task<IActionResult> GetInvestments([FromQuery] string? assetType = null, [FromQuery] string? search = null, [FromQuery] string? sortBy = null)
        {
            int userId = GetCurrentUserId();
            var list = await _portfolioService.GetInvestmentsAsync(userId, assetType, search, sortBy);
            return Ok(ApiResponse<List<InvestmentDetailDto>>.Ok(list));
        }

        [HttpGet("investments/{id:int}")]
        public async Task<IActionResult> GetInvestmentById(int id)
        {
            int userId = GetCurrentUserId();
            var investment = await _portfolioService.GetInvestmentByIdAsync(userId, id);
            if (investment == null)
                return NotFound(ApiResponse<string>.Fail("Investment holding not found."));

            return Ok(ApiResponse<InvestmentDetailDto>.Ok(investment));
        }

        [HttpPost("investments")]
        public async Task<IActionResult> AddInvestment([FromBody] CreateInvestmentDto dto)
        {
            if (dto.Quantity <= 0 || dto.PurchasePrice <= 0 || string.IsNullOrWhiteSpace(dto.Ticker))
                return BadRequest(ApiResponse<string>.Fail("Invalid investment holding parameters."));

            int userId = GetCurrentUserId();
            var created = await _portfolioService.AddInvestmentAsync(userId, dto);
            return CreatedAtAction(nameof(GetInvestmentById), new { id = created.Id }, ApiResponse<InvestmentDetailDto>.Ok(created, "Investment holding saved successfully."));
        }

        [HttpPut("investments/{id:int}")]
        public async Task<IActionResult> UpdateInvestment(int id, [FromBody] UpdateInvestmentDto dto)
        {
            int userId = GetCurrentUserId();
            var updated = await _portfolioService.UpdateInvestmentAsync(userId, id, dto);
            if (updated == null)
                return NotFound(ApiResponse<string>.Fail("Investment holding not found."));

            return Ok(ApiResponse<InvestmentDetailDto>.Ok(updated, "Investment updated successfully."));
        }

        [HttpDelete("investments/{id:int}")]
        public async Task<IActionResult> DeleteInvestment(int id)
        {
            int userId = GetCurrentUserId();
            bool deleted = await _portfolioService.DeleteInvestmentAsync(userId, id);
            if (!deleted)
                return NotFound(ApiResponse<string>.Fail("Investment holding not found."));

            return Ok(ApiResponse<string>.Ok("Investment holding deleted successfully."));
        }
    }
}
