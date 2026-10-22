using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Derived Bond asset class representing fixed-income instruments.
    /// Supports Government, Corporate, Senior Secured, and Senior Unsecured bonds.
    /// </summary>
    public class Bond : Asset
    {
        public string Issuer { get; set; } = string.Empty;
        public string CreditRating { get; set; } = "AAA"; // AAA, AA+, Sovereign, etc.
        public decimal CouponRate { get; set; } // e.g. 7.35 for 7.35%
        public decimal FaceValue { get; set; } = 10000m; // Default ₹10,000 face value
        public DateTime MaturityDate { get; set; }
        public string InterestFrequency { get; set; } = "Annual"; // Annual, Semi-Annual, Quarterly, Monthly
        public decimal MinimumInvestment { get; set; } = 10000m;
        public string BondCategory { get; set; } = "Government"; // Government, Corporate, Senior Secured, Senior Unsecured

        public Bond()
        {
            AssetType = "Bond";
        }

        /// <summary>
        /// Calculates estimated periodic coupon payout based on principal and payment frequency.
        /// </summary>
        public decimal CalculateCouponPayout(decimal principal)
        {
            if (principal <= 0 || CouponRate <= 0) return 0m;

            int periodsPerYear = InterestFrequency.ToLower() switch
            {
                "monthly" => 12,
                "quarterly" => 4,
                "semi-annual" => 2,
                _ => 1 // Annual
            };

            decimal annualIncome = principal * (CouponRate / 100m);
            return Math.Round(annualIncome / periodsPerYear, 2);
        }

        /// <summary>
        /// Calculates total return percentage for bond investment considering coupon yield and capital variance.
        /// </summary>
        public override decimal CalculateReturn(Investment investment)
        {
            if (investment == null || investment.Quantity <= 0 || investment.AveragePurchasePrice <= 0)
                return 0m;

            decimal totalInvested = investment.Quantity * investment.AveragePurchasePrice;
            decimal currentMarketValue = investment.Quantity * CurrentPrice;
            decimal capitalGain = currentMarketValue - totalInvested;

            // Approximate coupon yield earned so far (annual rate)
            decimal annualCouponIncome = (investment.Quantity * FaceValue) * (CouponRate / 100m);
            decimal totalEstimatedReturn = capitalGain + annualCouponIncome;

            return Math.Round((totalEstimatedReturn / totalInvested) * 100m, 2);
        }

        public override string GetAssetSummary()
        {
            return base.GetAssetSummary() + $" | Rating: {CreditRating} | Coupon: {CouponRate}% ({InterestFrequency})";
        }
    }
}
