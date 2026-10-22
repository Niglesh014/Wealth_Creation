using System;
using System.Collections.Generic;

namespace WealthWise.API.DTOs
{
    public class FinancialReportDto
    {
        public decimal TotalPortfolioValue { get; set; }
        public decimal TotalInvestedCapital { get; set; }
        public decimal UnrealizedProfitLoss { get; set; }
        public decimal RealizedProfitLoss { get; set; }
        public decimal TotalDividendIncome { get; set; }
        public decimal TotalBondInterestIncome { get; set; }
        public decimal OverallReturnPercentage { get; set; }
        public List<MonthlyActivityDto> MonthlyActivities { get; set; } = new();
        public List<AssetClassComparisonDto> AssetClassPerformances { get; set; } = new();
    }

    public class MonthlyActivityDto
    {
        public string Month { get; set; } = string.Empty; // e.g. "May 2026"
        public decimal InvestedAmount { get; set; }
        public decimal RealizedGains { get; set; }
        public decimal DividendIncome { get; set; }
        public decimal InterestIncome { get; set; }
    }

    public class AssetClassComparisonDto
    {
        public string AssetClass { get; set; } = string.Empty; // Stocks, Bonds, Mutual Funds, ETFs
        public decimal Invested { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal ProfitLoss { get; set; }
        public decimal ReturnPercentage { get; set; }
        public decimal PortfolioSharePercentage { get; set; }
    }
}
