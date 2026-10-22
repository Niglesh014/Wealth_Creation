using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Derived MutualFund asset class representing pooled investment schemes.
    /// </summary>
    public class MutualFund : Asset
    {
        public string FundCategory { get; set; } = "Large Cap"; // Large Cap, Mid Cap, Small Cap, Flexi Cap, Debt, Hybrid
        public decimal Nav { get; set; } // Current Net Asset Value
        public string RiskCategory { get; set; } = "Moderate"; // Low, Moderately Low, Moderate, Moderately High, High, Very High
        public decimal ExpenseRatio { get; set; } // e.g. 0.75 for 0.75%
        public decimal FundAum { get; set; } // Assets Under Management in Crores INR

        public MutualFund()
        {
            AssetType = "MutualFund";
        }

        /// <summary>
        /// Calculates return percentage based on NAV appreciation against purchase NAV.
        /// </summary>
        public override decimal CalculateReturn(Investment investment)
        {
            if (investment == null || investment.Quantity <= 0 || investment.AveragePurchasePrice <= 0)
                return 0m;

            decimal effectivePrice = Nav > 0 ? Nav : CurrentPrice;
            decimal totalInvested = investment.Quantity * investment.AveragePurchasePrice;
            decimal currentValue = investment.Quantity * effectivePrice;
            decimal profitOrLoss = currentValue - totalInvested;

            return Math.Round((profitOrLoss / totalInvested) * 100m, 2);
        }

        public override string GetAssetSummary()
        {
            return base.GetAssetSummary() + $" | NAV: ₹{Nav:N2} | Category: {FundCategory} | Risk: {RiskCategory}";
        }
    }
}
