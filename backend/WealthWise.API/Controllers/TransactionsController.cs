using System;
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
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
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
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string? type = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? search = null)
        {
            int userId = GetCurrentUserId();
            var list = await _transactionService.GetTransactionsAsync(userId, type, startDate, endDate, search);
            return Ok(ApiResponse<List<TransactionDetailDto>>.Ok(list));
        }

        [HttpPost]
        public async Task<IActionResult> RecordTransaction([FromBody] CreateTransactionDto dto)
        {
            int userId = GetCurrentUserId();
            var result = await _transactionService.RecordTransactionAsync(userId, dto);
            return Ok(ApiResponse<TransactionDetailDto>.Ok(result, "Transaction recorded successfully."));
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            int userId = GetCurrentUserId();
            var summary = await _transactionService.GetTransactionSummaryAsync(userId);
            return Ok(ApiResponse<TransactionSummaryDto>.Ok(summary));
        }

        [HttpGet("export-csv")]
        public async Task<IActionResult> ExportCsv()
        {
            int userId = GetCurrentUserId();
            byte[] fileBytes = await _transactionService.ExportTransactionsCsvAsync(userId);
            return File(fileBytes, "text/csv", $"WealthWise_Transactions_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
