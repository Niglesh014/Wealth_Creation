using System.Collections.Generic;
using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface IWatchlistService
    {
        Task<List<AssetMarketDto>> GetWatchlistAsync(int userId, string? search = null, string? sortBy = null);
        Task<bool> AddToWatchlistAsync(int userId, string ticker);
        Task<bool> RemoveFromWatchlistAsync(int userId, string ticker);
    }
}
