using System;

namespace WealthWise.API.DTOs
{
    public class BondCalculationRequest
    {
        public decimal PrincipalAmount { get; set; }
        public decimal AnnualCouponRate { get; set; } // in % e.g. 7.5
        public string PaymentFrequency { get; set; } = "Annual"; // Annual, Semi-Annual, Quarterly, Monthly
        public int DurationYears { get; set; } = 5;
    }

    public class BondCalculationResult
    {
        public decimal PrincipalAmount { get; set; }
        public decimal AnnualCouponRate { get; set; }
        public string PaymentFrequency { get; set; } = string.Empty;
        public int DurationYears { get; set; }
        public decimal PeriodicCouponPayment { get; set; }
        public decimal AnnualCouponIncome { get; set; }
        public decimal TotalCouponIncome { get; set; }
        public decimal MaturityValue { get; set; }
        public string Disclaimer { get; set; } = "Coupon income is not the same as total investment return. Bond returns are illustrative and subject to market interest rates and issuer credit risk.";
    }

    public class AssetMarketDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public decimal PreviousClosePrice { get; set; }
        public decimal DailyChange { get; set; }
        public decimal DailyChangePercent { get; set; }
        public bool IsWatchlisted { get; set; }
        
        // Stock fields
        public string? Sector { get; set; }
        public decimal? MarketCap { get; set; }
        public decimal? PeRatio { get; set; }
        public decimal? DividendYield { get; set; }
        public decimal? Week52High { get; set; }
        public decimal? Week52Low { get; set; }

        // Bond fields
        public string? Issuer { get; set; }
        public string? CreditRating { get; set; }
        public decimal? CouponRate { get; set; }
        public decimal? FaceValue { get; set; }
        public DateTime? MaturityDate { get; set; }
        public string? InterestFrequency { get; set; }
        public string? BondCategory { get; set; }

        // Mutual Fund fields
        public string? FundCategory { get; set; }
        public decimal? Nav { get; set; }
        public string? RiskCategory { get; set; }
        public decimal? ExpenseRatio { get; set; }
        public decimal? FundAum { get; set; }

        // ETF fields
        public string? BenchmarkIndex { get; set; }
        public decimal? TrackingError { get; set; }
    }
}
