using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface IReportService
    {
        Task<FinancialReportDto> GetFinancialReportAsync(int userId);
        Task<byte[]> ExportFinancialReportCsvAsync(int userId);
    }
}
