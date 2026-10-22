using System;
using System.Collections.Generic;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// Represents an investor's overall portfolio container.
    /// Demonstrates C# Indexers, Collections (List<T>, Dictionary<TKey, TValue>),
    /// foreach aggregation, and Encapsulation.
    /// </summary>
    public class Portfolio
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = "Primary Wealth Portfolio";
        public decimal CashBalance { get; set; } = 50000.00m; // Available cash in INR
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public List<Investment> Investments { get; set; } = new();
        public List<Transaction> Transactions { get; set; } = new();

        // Internal Dictionary for O(1) ticker-based lookup as required by OOP indexer spec
        private readonly Dictionary<string, Investment> _tickerIndex = new(StringComparer.OrdinalIgnoreCase);
        private bool _isIndexSynced = false;

        /// <summary>
        /// Synchronizes the internal Dictionary lookup cache from the Investments List.
        /// Demonstrates foreach loop iteration over List<T>.
        /// </summary>
        public void SyncLookupIndex()
        {
            _tickerIndex.Clear();
            foreach (var holding in Investments)
            {
                if (!string.IsNullOrWhiteSpace(holding.Ticker))
                {
                    _tickerIndex[holding.Ticker.Trim()] = holding;
                }
            }
            _isIndexSynced = true;
        }

        /// <summary>
        /// C# Indexer: Allows retrieving or updating an investment using its ticker symbol.
        /// Usage Example: portfolio["TCS"]
        /// </summary>
        public Investment? this[string ticker]
        {
            get
            {
                if (string.IsNullOrWhiteSpace(ticker)) return null;
                if (!_isIndexSynced) SyncLookupIndex();

                return _tickerIndex.TryGetValue(ticker.Trim(), out var investment) ? investment : null;
            }
            set
            {
                if (string.IsNullOrWhiteSpace(ticker))
                    throw new ArgumentException("Ticker cannot be null or whitespace", nameof(ticker));

                string cleanTicker = ticker.Trim().ToUpperInvariant();

                if (value == null)
                {
                    // Removing holding
                    _tickerIndex.Remove(cleanTicker);
                    Investments.RemoveAll(i => i.Ticker.Equals(cleanTicker, StringComparison.OrdinalIgnoreCase));
                }
                else
                {
                    // Adding or updating holding
                    value.Ticker = cleanTicker;
                    _tickerIndex[cleanTicker] = value;

                    int existingIndex = Investments.FindIndex(i => i.Ticker.Equals(cleanTicker, StringComparison.OrdinalIgnoreCase));
                    if (existingIndex >= 0)
                    {
                        Investments[existingIndex] = value;
                    }
                    else
                    {
                        Investments.Add(value);
                    }
                }
                UpdatedAt = DateTime.UtcNow;
            }
        }

        #region Encapsulated Portfolio Methods & Aggregations

        /// <summary>
        /// Calculates total invested capital across all holdings using foreach loop.
        /// </summary>
        public decimal CalculateTotalInvested()
        {
            decimal totalInvested = 0m;
            foreach (var holding in Investments)
            {
                totalInvested += holding.TotalInvested;
            }
            return totalInvested;
        }

        /// <summary>
        /// Calculates current market value of all holdings using foreach loop.
        /// </summary>
        public decimal CalculateCurrentHoldingsValue()
        {
            decimal totalMarketValue = 0m;
            foreach (var holding in Investments)
            {
                totalMarketValue += holding.CurrentMarketValue;
            }
            return totalMarketValue;
        }

        /// <summary>
        /// Calculates grand total portfolio value (Holdings + Available Cash).
        /// </summary>
        public decimal CalculateTotalPortfolioValue()
        {
            return CalculateCurrentHoldingsValue() + CashBalance;
        }

        /// <summary>
        /// Calculates total unrealized profit or loss across all holdings.
        /// </summary>
        public decimal CalculateTotalProfitLoss()
        {
            return CalculateCurrentHoldingsValue() - CalculateTotalInvested();
        }

        /// <summary>
        /// Calculates overall portfolio return percentage.
        /// </summary>
        public decimal CalculateOverallReturnPercentage()
        {
            decimal invested = CalculateTotalInvested();
            if (invested <= 0) return 0m;

            decimal profitLoss = CalculateTotalProfitLoss();
            return Math.Round((profitLoss / invested) * 100m, 2);
        }

        /// <summary>
        /// Encapsulated method to safely deposit cash.
        /// </summary>
        public void DepositCash(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Deposit amount must be positive", nameof(amount));

            CashBalance += amount;
            UpdatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Encapsulated method to safely withdraw cash with balance validation.
        /// </summary>
        public bool TryWithdrawCash(decimal amount)
        {
            if (amount <= 0 || CashBalance < amount)
                return false;

            CashBalance -= amount;
            UpdatedAt = DateTime.UtcNow;
            return true;
        }

        #endregion
    }
}
