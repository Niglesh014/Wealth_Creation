using System.Collections.Generic;
using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface IPortfolioService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId);
        Task<List<InvestmentDetailDto>> GetInvestmentsAsync(int userId, string? assetType = null, string? search = null, string? sortBy = null);
        Task<InvestmentDetailDto?> GetInvestmentByIdAsync(int userId, int investmentId);
        Task<InvestmentDetailDto> AddInvestmentAsync(int userId, CreateInvestmentDto dto);
        Task<InvestmentDetailDto?> UpdateInvestmentAsync(int userId, int investmentId, UpdateInvestmentDto dto);
        Task<bool> DeleteInvestmentAsync(int userId, int investmentId);
        Task<List<AllocationItemDto>> GetAssetAllocationAsync(int userId);
        Task<List<PerformancePointDto>> GetPerformanceHistoryAsync(int userId, string range = "1M");
        Task<List<TopHoldingDto>> GetTopHoldingsAsync(int userId, int limit = 5);
    }
}
