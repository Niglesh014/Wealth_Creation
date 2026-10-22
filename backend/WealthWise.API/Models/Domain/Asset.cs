using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Abstract base class representing any tradeable or investable financial asset.
    /// Demonstrates Inheritance, Polymorphism, and Encapsulation.
    /// </summary>
    public abstract class Asset
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty; // "Stock", "Bond", "MutualFund", "ETF"
        
        // Monetary values must use decimal for financial precision
        public decimal CurrentPrice { get; set; }
        public decimal PreviousClosePrice { get; set; }
        public decimal DailyChange { get; set; }
        public decimal DailyChangePercent { get; set; }
        public string Currency { get; set; } = "INR";
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Polymorphic method overridden by derived asset classes to calculate specific investment return percentage.
        /// </summary>
        /// <param name="investment">The specific portfolio holding.</param>
        /// <returns>Return percentage (e.g. 15.25 for +15.25%).</returns>
        public abstract decimal CalculateReturn(Investment investment);

        /// <summary>
        /// Virtual summary representation of the asset.
        /// </summary>
        public virtual string GetAssetSummary()
        {
            return $"{Name} ({Ticker}) - ₹{CurrentPrice:N2} ({DailyChangePercent:+0.00;-0.00;0.00}%)";
        }
    }
}
