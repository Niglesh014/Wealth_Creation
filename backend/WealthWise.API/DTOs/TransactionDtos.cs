using System;

namespace WealthWise.API.DTOs
{
    public class CreateTransactionDto
    {
        public string TransactionType { get; set; } = "Buy"; // Buy, Sell, Dividend, Interest, Deposit, Withdrawal
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = "Stock";
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Fees { get; set; } = 0m;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; } = string.Empty;
    }

    public class TransactionDetailDto
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Fees { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Status { get; set; } = "Completed";
        public string Notes { get; set; } = string.Empty;
    }

    public class TransactionSummaryDto
    {
        public decimal TotalInvestedInBuys { get; set; }
        public decimal TotalRealizedFromSells { get; set; }
        public decimal TotalDividendsReceived { get; set; }
        public decimal TotalInterestReceived { get; set; }
        public decimal TotalDeposited { get; set; }
        public decimal TotalWithdrawn { get; set; }
    }
}
