using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Represents an investor's targeted financial milestone (Emergency fund, Education, House, etc.).
    /// </summary>
    public class FinancialGoal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = "General"; // Emergency Fund, Education, Vehicle, House, Retirement, Wealth Creation
        public decimal TargetAmount { get; set; }
        public decimal CurrentSavings { get; set; }
        public DateTime TargetDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }

        public decimal RemainingAmount => Math.Max(0m, TargetAmount - CurrentSavings);

        public decimal ProgressPercentage
        {
            get
            {
                if (TargetAmount <= 0) return 0m;
                decimal pct = (CurrentSavings / TargetAmount) * 100m;
                return Math.Min(100m, Math.Round(pct, 1));
            }
        }

        /// <summary>
        /// Calculates estimated monthly savings required to meet the goal by target date.
        /// Projections are estimates and not guaranteed outcomes.
        /// </summary>
        public decimal CalculateEstimatedMonthlySavings()
        {
            if (RemainingAmount <= 0) return 0m;

            var today = DateTime.UtcNow;
            int totalMonths = ((TargetDate.Year - today.Year) * 12) + TargetDate.Month - today.Month;
            if (totalMonths <= 0) return RemainingAmount;

            return Math.Round(RemainingAmount / totalMonths, 2);
        }
    }
}
