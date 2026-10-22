using System.Collections.Generic;
using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface IAssetService
    {
        Task<List<AssetMarketDto>> GetStocksAsync(string? search = null);
        Task<List<AssetMarketDto>> GetBondsAsync(string? category = null);
        Task<List<AssetMarketDto>> GetMutualFundsAsync(string? category = null);
        Task<List<AssetMarketDto>> GetETFsAsync(string? search = null);
        Task<AssetMarketDto?> GetAssetByTickerAsync(string ticker);
        BondCalculationResult CalculateBondYield(BondCalculationRequest request);
    }
}
