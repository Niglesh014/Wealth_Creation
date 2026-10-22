using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Derived ETF (Exchange-Traded Fund) asset class.
    /// </summary>
    public class ETF : Asset
    {
        public string BenchmarkIndex { get; set; } = "Nifty 50"; // Nifty 50, Nifty Bank, Gold BeES, etc.
        public decimal ExpenseRatio { get; set; } // e.g. 0.05%
        public decimal TrackingError { get; set; } // e.g. 0.02%

        public ETF()
        {
            AssetType = "ETF";
        }

        /// <summary>
        /// Calculates return percentage for ETF holding.
        /// </summary>
        public override decimal CalculateReturn(Investment investment)
        {
            if (investment == null || investment.Quantity <= 0 || investment.AveragePurchasePrice <= 0)
                return 0m;

            decimal totalInvested = investment.Quantity * investment.AveragePurchasePrice;
            decimal currentValue = investment.Quantity * CurrentPrice;
            decimal returnAmt = currentValue - totalInvested;

            return Math.Round((returnAmt / totalInvested) * 100m, 2);
        }

        public override string GetAssetSummary()
        {
            return base.GetAssetSummary() + $" | Benchmark: {BenchmarkIndex} | TER: {ExpenseRatio}%";
        }
    }
}
