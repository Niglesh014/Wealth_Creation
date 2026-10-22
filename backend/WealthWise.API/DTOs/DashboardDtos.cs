using System;
using System.Collections.Generic;

namespace WealthWise.API.DTOs
{
    public class DashboardSummaryDto
    {
        public decimal TotalPortfolioValue { get; set; }
        public decimal TotalInvestment { get; set; }
        public decimal TotalProfitLoss { get; set; }
        public decimal PercentageReturn { get; set; }
        public decimal TodayProfitLoss { get; set; }
        public decimal TodayPercentageChange { get; set; }
        public decimal AvailableCash { get; set; }
        public string Currency { get; set; } = "INR";
        public DateTime AsOfDate { get; set; } = DateTime.UtcNow;
    }

    public class PerformancePointDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public decimal Invested { get; set; }
        public decimal ProfitLoss { get; set; }
    }

    public class AllocationItemDto
    {
        public string Category { get; set; } = string.Empty; // Stocks, Bonds, Mutual Funds, ETFs, Cash
        public decimal Value { get; set; }
        public decimal Percentage { get; set; }
        public string Color { get; set; } = "#16A34A";
    }

    public class TopHoldingDto
    {
        public int Id { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal AveragePurchasePrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal MarketValue { get; set; }
        public decimal ProfitLoss { get; set; }
        public decimal ReturnPercentage { get; set; }
        public decimal DailyChangePercent { get; set; }
    }
}
