using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public interface ITransactionService
    {
        Task<List<TransactionDetailDto>> GetTransactionsAsync(int userId, string? type = null, DateTime? startDate = null, DateTime? endDate = null, string? search = null);
        Task<TransactionDetailDto> RecordTransactionAsync(int userId, CreateTransactionDto dto);
        Task<TransactionSummaryDto> GetTransactionSummaryAsync(int userId);
        Task<byte[]> ExportTransactionsCsvAsync(int userId);
    }
}
