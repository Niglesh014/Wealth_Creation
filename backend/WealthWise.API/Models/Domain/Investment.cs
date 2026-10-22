using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Represents an active asset holding inside an investor's portfolio.
    /// Demonstrates encapsulation and precise financial decimal arithmetic.
    /// </summary>
    public class Investment
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty; // "Stock", "Bond", "MutualFund", "ETF"
        
        // Whole-number quantity for current version, extensible data model
        public int Quantity { get; set; }
        public decimal AveragePurchasePrice { get; set; }
        public decimal CurrentMarketPrice { get; set; }
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Portfolio? Portfolio { get; set; }

        // Financial calculated properties
        public decimal TotalInvested => Quantity * AveragePurchasePrice;
        
        public decimal CurrentMarketValue => Quantity * CurrentMarketPrice;

        public decimal UnrealizedProfitLoss => CurrentMarketValue - TotalInvested;

        public decimal ReturnPercentage
        {
            get
            {
                if (TotalInvested <= 0) return 0m;
                return Math.Round((UnrealizedProfitLoss / TotalInvested) * 100m, 2);
            }
        }

        public decimal DailyProfitLoss(decimal previousClosePrice)
        {
            if (Quantity <= 0) return 0m;
            return Quantity * (CurrentMarketPrice - previousClosePrice);
        }
    }
}
