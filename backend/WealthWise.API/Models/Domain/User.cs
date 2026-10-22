using System;
using System.Collections.Generic;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// User account model with credentials and personal settings.
    /// </summary>
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Investor";
        public string PreferredCurrency { get; set; } = "INR";
        public string ThemePreference { get; set; } = "light"; // "light" or "dark"
        public string DateFormat { get; set; } = "DD/MM/YYYY";
        public bool EmailNotifications { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }

        // Navigation properties
        public List<Portfolio> Portfolios { get; set; } = new();
        public List<FinancialGoal> FinancialGoals { get; set; } = new();
        public List<WatchlistItem> WatchlistItems { get; set; } = new();
    }
}
