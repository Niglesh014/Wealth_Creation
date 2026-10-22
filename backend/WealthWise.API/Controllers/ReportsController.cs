using System;
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
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
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

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            int userId = GetCurrentUserId();
            var report = await _reportService.GetFinancialReportAsync(userId);
            return Ok(ApiResponse<FinancialReportDto>.Ok(report));
        }

        [HttpGet("export-csv")]
        public async Task<IActionResult> ExportCsv()
        {
            int userId = GetCurrentUserId();
            byte[] fileBytes = await _reportService.ExportFinancialReportCsvAsync(userId);
            return File(fileBytes, "text/csv", $"WealthWise_FinancialReport_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
