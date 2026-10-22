using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Common;
using WealthWise.API.Services;

namespace WealthWise.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly IAssetService _assetService;

        public AssetsController(IAssetService assetService)
        {
            _assetService = assetService;
        }

        [HttpGet("stocks")]
        public async Task<IActionResult> GetStocks([FromQuery] string? search = null)
        {
            var list = await _assetService.GetStocksAsync(search);
            return Ok(ApiResponse<List<AssetMarketDto>>.Ok(list));
        }

        [HttpGet("bonds")]
        public async Task<IActionResult> GetBonds([FromQuery] string? category = null)
        {
            var list = await _assetService.GetBondsAsync(category);
            return Ok(ApiResponse<List<AssetMarketDto>>.Ok(list));
        }

        [HttpGet("mutual-funds")]
        public async Task<IActionResult> GetMutualFunds([FromQuery] string? category = null)
        {
            var list = await _assetService.GetMutualFundsAsync(category);
            return Ok(ApiResponse<List<AssetMarketDto>>.Ok(list));
        }

        [HttpGet("etfs")]
        public async Task<IActionResult> GetETFs([FromQuery] string? search = null)
        {
            var list = await _assetService.GetETFsAsync(search);
            return Ok(ApiResponse<List<AssetMarketDto>>.Ok(list));
        }

        [HttpGet("{ticker}")]
        public async Task<IActionResult> GetAssetByTicker(string ticker)
        {
            var asset = await _assetService.GetAssetByTickerAsync(ticker);
            if (asset == null)
                return NotFound(ApiResponse<string>.Fail($"Asset with ticker '{ticker}' was not found."));

            return Ok(ApiResponse<AssetMarketDto>.Ok(asset));
        }

        [HttpPost("bonds/calculate")]
        public IActionResult CalculateBondYield([FromBody] BondCalculationRequest request)
        {
            var result = _assetService.CalculateBondYield(request);
            return Ok(ApiResponse<BondCalculationResult>.Ok(result));
        }
    }
}
