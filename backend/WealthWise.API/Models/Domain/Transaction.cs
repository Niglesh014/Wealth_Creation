using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Financial transaction record: Buy, Sell, Dividend, Interest, Deposit, Withdrawal.
    /// </summary>
    public class Transaction
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public string TransactionType { get; set; } = "Buy"; // Buy, Sell, Dividend, Interest, Deposit, Withdrawal
        public string AssetName { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = "Stock"; // Stock, Bond, MutualFund, ETF, Cash
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Fees { get; set; } = 0m;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed"; // Completed, Pending, Cancelled
        public string Notes { get; set; } = string.Empty;

        // Navigation property
        public Portfolio? Portfolio { get; set; }
    }
}
