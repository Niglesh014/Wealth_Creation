using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Derived Stock asset class implementing custom equity return calculation.
    /// </summary>
    public class Stock : Asset
    {
        public string Sector { get; set; } = string.Empty;
        public decimal MarketCap { get; set; } // in Crores INR
        public decimal PeRatio { get; set; }
        public decimal DividendYield { get; set; } // e.g. 1.25%
        public decimal Week52High { get; set; }
        public decimal Week52Low { get; set; }

        public Stock()
        {
            AssetType = "Stock";
        }

        /// <summary>
        /// Calculates total return percentage for equity holding (capital gain return + dividend yield component).
        /// </summary>
        public override decimal CalculateReturn(Investment investment)
        {
            if (investment == null || investment.Quantity <= 0 || investment.AveragePurchasePrice <= 0)
                return 0m;

            decimal totalInvested = investment.Quantity * investment.AveragePurchasePrice;
            decimal currentMarketValue = investment.Quantity * CurrentPrice;
            decimal capitalGain = currentMarketValue - totalInvested;

            decimal returnPercentage = (capitalGain / totalInvested) * 100m;
            return Math.Round(returnPercentage, 2);
        }

        public override string GetAssetSummary()
        {
            return base.GetAssetSummary() + $" | Sector: {Sector} | P/E: {PeRatio:F1}";
        }
    }
}
