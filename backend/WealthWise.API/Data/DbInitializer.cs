using System;
using System.Collections.Generic;
using System.Linq;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(WealthWiseDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
            {
                return; // Database has already been seeded
            }

            // 1. Seed Demo User
            var demoUser = new User
            {
                FullName = "Niglesh Sundhar",
                Email = "investor@wealthwise.com",
                PasswordHash = BCryptOrSha256("Wealth@123"),
                Role = "Investor",
                PreferredCurrency = "INR",
                ThemePreference = "light",
                DateFormat = "DD/MM/YYYY",
                EmailNotifications = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-12)
            };
            context.Users.Add(demoUser);
            context.SaveChanges();

            // 2. Seed Assets Catalog
            var stocks = new List<Stock>
            {
                new() { Name = "Tata Consultancy Services", Ticker = "TCS", CurrentPrice = 3850.00m, PreviousClosePrice = 3820.00m, DailyChange = 30.00m, DailyChangePercent = 0.79m, Sector = "Information Technology", MarketCap = 1395000m, PeRatio = 29.5m, DividendYield = 1.35m, Week52High = 4592.25m, Week52Low = 3313.00m },
                new() { Name = "Infosys Limited", Ticker = "INFY", CurrentPrice = 1580.00m, PreviousClosePrice = 1595.00m, DailyChange = -15.00m, DailyChangePercent = -0.94m, Sector = "Information Technology", MarketCap = 655000m, PeRatio = 25.8m, DividendYield = 2.10m, Week52High = 1991.45m, Week52Low = 1358.35m },
                new() { Name = "Reliance Industries Ltd", Ticker = "RELIANCE", CurrentPrice = 2920.00m, PreviousClosePrice = 2895.00m, DailyChange = 25.00m, DailyChangePercent = 0.86m, Sector = "Energy & Conglomerate", MarketCap = 1975000m, PeRatio = 27.2m, DividendYield = 0.35m, Week52High = 3217.90m, Week52Low = 2221.05m },
                new() { Name = "HDFC Bank Limited", Ticker = "HDFCBANK", CurrentPrice = 1675.00m, PreviousClosePrice = 1660.00m, DailyChange = 15.00m, DailyChangePercent = 0.90m, Sector = "Financial Services", MarketCap = 1270000m, PeRatio = 18.9m, DividendYield = 1.15m, Week52High = 1794.00m, Week52Low = 1363.45m },
                new() { Name = "ITC Limited", Ticker = "ITC", CurrentPrice = 440.00m, PreviousClosePrice = 438.50m, DailyChange = 1.50m, DailyChangePercent = 0.34m, Sector = "Consumer Goods", MarketCap = 548000m, PeRatio = 26.1m, DividendYield = 3.20m, Week52High = 528.50m, Week52Low = 399.30m },
                new() { Name = "Wipro Limited", Ticker = "WIPRO", CurrentPrice = 490.00m, PreviousClosePrice = 496.00m, DailyChange = -6.00m, DailyChangePercent = -1.21m, Sector = "Information Technology", MarketCap = 256000m, PeRatio = 21.4m, DividendYield = 0.20m, Week52High = 582.00m, Week52Low = 375.05m },
                new() { Name = "NTPC Limited", Ticker = "NTPC", CurrentPrice = 375.00m, PreviousClosePrice = 371.50m, DailyChange = 3.50m, DailyChangePercent = 0.94m, Sector = "Power Generation", MarketCap = 363000m, PeRatio = 16.5m, DividendYield = 2.05m, Week52High = 448.45m, Week52Low = 228.10m },
                new() { Name = "Indian Railway Finance Corp", Ticker = "IRFC", CurrentPrice = 165.00m, PreviousClosePrice = 162.00m, DailyChange = 3.00m, DailyChangePercent = 1.85m, Sector = "Financials & Railways", MarketCap = 215000m, PeRatio = 31.2m, DividendYield = 0.95m, Week52High = 229.00m, Week52Low = 65.75m }
            };
            context.Stocks.AddRange(stocks);

            var bonds = new List<Bond>
            {
                new() { Name = "Sample Corporate Bond", Ticker = "DEMO-BOND", CurrentPrice = 10150.00m, PreviousClosePrice = 10140.00m, DailyChange = 10.00m, DailyChangePercent = 0.10m, Issuer = "Tata Sons Pvt Ltd", CreditRating = "CRISIL AAA", CouponRate = 8.25m, FaceValue = 10000m, MaturityDate = DateTime.UtcNow.AddYears(5), InterestFrequency = "Annual", MinimumInvestment = 10000m, BondCategory = "Corporate" },
                new() { Name = "7.35% GOI 2034 Bond", Ticker = "GS2034", CurrentPrice = 10080.00m, PreviousClosePrice = 10075.00m, DailyChange = 5.00m, DailyChangePercent = 0.05m, Issuer = "Government of India", CreditRating = "SOVEREIGN", CouponRate = 7.35m, FaceValue = 10000m, MaturityDate = DateTime.UtcNow.AddYears(8), InterestFrequency = "Semi-Annual", MinimumInvestment = 10000m, BondCategory = "Government" },
                new() { Name = "HDFC Bank Tier-II Bond", Ticker = "HDFC-BOND", CurrentPrice = 10050.00m, PreviousClosePrice = 10050.00m, DailyChange = 0.00m, DailyChangePercent = 0.00m, Issuer = "HDFC Bank Ltd", CreditRating = "CARE AAA", CouponRate = 7.95m, FaceValue = 10000m, MaturityDate = DateTime.UtcNow.AddYears(7), InterestFrequency = "Annual", MinimumInvestment = 10000m, BondCategory = "Senior Secured" },
                new() { Name = "L&T Finance Senior Unsecured", Ticker = "LT-UNSEC", CurrentPrice = 9980.00m, PreviousClosePrice = 9990.00m, DailyChange = -10.00m, DailyChangePercent = -0.10m, Issuer = "L&T Finance Holdings", CreditRating = "ICRA AA+", CouponRate = 8.50m, FaceValue = 10000m, MaturityDate = DateTime.UtcNow.AddYears(3), InterestFrequency = "Quarterly", MinimumInvestment = 10000m, BondCategory = "Senior Unsecured" }
            };
            context.Bonds.AddRange(bonds);

            var mutualFunds = new List<MutualFund>
            {
                new() { Name = "Parag Parikh Flexi Cap Fund", Ticker = "PPFAS-FC", CurrentPrice = 84.50m, PreviousClosePrice = 83.90m, DailyChange = 0.60m, DailyChangePercent = 0.72m, FundCategory = "Flexi Cap", Nav = 84.50m, RiskCategory = "Very High", ExpenseRatio = 0.68m, FundAum = 68500m },
                new() { Name = "Mirae Asset Large Cap Fund", Ticker = "MIRAE-LC", CurrentPrice = 112.30m, PreviousClosePrice = 111.80m, DailyChange = 0.50m, DailyChangePercent = 0.45m, FundCategory = "Large Cap", Nav = 112.30m, RiskCategory = "High", ExpenseRatio = 0.54m, FundAum = 42100m },
                new() { Name = "HDFC Balanced Advantage Fund", Ticker = "HDFC-BAF", CurrentPrice = 445.20m, PreviousClosePrice = 444.00m, DailyChange = 1.20m, DailyChangePercent = 0.27m, FundCategory = "Hybrid", Nav = 445.20m, RiskCategory = "Moderate", ExpenseRatio = 0.82m, FundAum = 78900m },
                new() { Name = "SBI Small Cap Fund", Ticker = "SBI-SC", CurrentPrice = 178.60m, PreviousClosePrice = 180.10m, DailyChange = -1.50m, DailyChangePercent = -0.83m, FundCategory = "Small Cap", Nav = 178.60m, RiskCategory = "Very High", ExpenseRatio = 0.71m, FundAum = 31200m }
            };
            context.MutualFunds.AddRange(mutualFunds);

            var etfs = new List<ETF>
            {
                new() { Name = "Sample Nifty ETF", Ticker = "DEMO-ETF", CurrentPrice = 275.50m, PreviousClosePrice = 273.20m, DailyChange = 2.30m, DailyChangePercent = 0.84m, BenchmarkIndex = "Nifty 50", ExpenseRatio = 0.05m, TrackingError = 0.02m },
                new() { Name = "Nippon India ETF Nifty 50 BeES", Ticker = "NIFTYBEES", CurrentPrice = 275.50m, PreviousClosePrice = 273.20m, DailyChange = 2.30m, DailyChangePercent = 0.84m, BenchmarkIndex = "Nifty 50", ExpenseRatio = 0.04m, TrackingError = 0.02m },
                new() { Name = "SBI Nifty Bank ETF", Ticker = "SETFNIFBK", CurrentPrice = 525.80m, PreviousClosePrice = 521.10m, DailyChange = 4.70m, DailyChangePercent = 0.90m, BenchmarkIndex = "Nifty Bank", ExpenseRatio = 0.12m, TrackingError = 0.04m },
                new() { Name = "Nippon India ETF Gold BeES", Ticker = "GOLDBEES", CurrentPrice = 68.20m, PreviousClosePrice = 67.90m, DailyChange = 0.30m, DailyChangePercent = 0.44m, BenchmarkIndex = "Domestic Gold", ExpenseRatio = 0.79m, TrackingError = 0.06m }
            };
            context.ETFs.AddRange(etfs);
            context.SaveChanges();

            // 3. Seed Portfolio
            var portfolio = new Portfolio
            {
                UserId = demoUser.Id,
                Name = "Primary Wealth Portfolio",
                CashBalance = 50000.00m,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow
            };
            context.Portfolios.Add(portfolio);
            context.SaveChanges();

            // 4. Seed Investments (strictly according to Section 19 sample data)
            var tcsAsset = stocks.First(s => s.Ticker == "TCS");
            var infyAsset = stocks.First(s => s.Ticker == "INFY");
            var ntpcAsset = stocks.First(s => s.Ticker == "NTPC");
            var irfcAsset = stocks.First(s => s.Ticker == "IRFC");
            var demoBondAsset = bonds.First(b => b.Ticker == "DEMO-BOND");
            var demoEtfAsset = etfs.First(e => e.Ticker == "DEMO-ETF");

            var investments = new List<Investment>
            {
                new() { PortfolioId = portfolio.Id, AssetId = tcsAsset.Id, AssetName = tcsAsset.Name, Ticker = "TCS", AssetType = "Stock", Quantity = 10, AveragePurchasePrice = 3500.00m, CurrentMarketPrice = tcsAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-5) },
                new() { PortfolioId = portfolio.Id, AssetId = infyAsset.Id, AssetName = infyAsset.Name, Ticker = "INFY", AssetType = "Stock", Quantity = 15, AveragePurchasePrice = 1450.00m, CurrentMarketPrice = infyAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-4) },
                new() { PortfolioId = portfolio.Id, AssetId = ntpcAsset.Id, AssetName = ntpcAsset.Name, Ticker = "NTPC", AssetType = "Stock", Quantity = 20, AveragePurchasePrice = 320.00m, CurrentMarketPrice = ntpcAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-3) },
                new() { PortfolioId = portfolio.Id, AssetId = irfcAsset.Id, AssetName = irfcAsset.Name, Ticker = "IRFC", AssetType = "Stock", Quantity = 50, AveragePurchasePrice = 120.00m, CurrentMarketPrice = irfcAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-2) },
                new() { PortfolioId = portfolio.Id, AssetId = demoBondAsset.Id, AssetName = demoBondAsset.Name, Ticker = "DEMO-BOND", AssetType = "Bond", Quantity = 1, AveragePurchasePrice = 10000.00m, CurrentMarketPrice = demoBondAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-5) },
                new() { PortfolioId = portfolio.Id, AssetId = demoEtfAsset.Id, AssetName = demoEtfAsset.Name, Ticker = "DEMO-ETF", AssetType = "ETF", Quantity = 10, AveragePurchasePrice = 250.00m, CurrentMarketPrice = demoEtfAsset.CurrentPrice, PurchaseDate = DateTime.UtcNow.AddMonths(-3) }
            };
            context.Investments.AddRange(investments);

            // 5. Seed Transactions (Buy, Sell, Dividend, Interest, Deposit)
            var transactions = new List<Transaction>
            {
                new() { PortfolioId = portfolio.Id, TransactionType = "Deposit", AssetName = "Bank Transfer", Ticker = "CASH", AssetType = "Cash", Quantity = 1, Price = 150000.00m, TotalAmount = 150000.00m, TransactionDate = DateTime.UtcNow.AddMonths(-6), Status = "Completed", Notes = "Initial account funding" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "Tata Consultancy Services", Ticker = "TCS", AssetType = "Stock", Quantity = 10, Price = 3500.00m, TotalAmount = 35000.00m, TransactionDate = DateTime.UtcNow.AddMonths(-5), Status = "Completed", Notes = "Long-term tech allocation" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "Sample Corporate Bond", Ticker = "DEMO-BOND", AssetType = "Bond", Quantity = 1, Price = 10000.00m, TotalAmount = 10000.00m, TransactionDate = DateTime.UtcNow.AddMonths(-5), Status = "Completed", Notes = "Fixed income diversification" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "Infosys Limited", Ticker = "INFY", AssetType = "Stock", Quantity = 15, Price = 1450.00m, TotalAmount = 21750.00m, TransactionDate = DateTime.UtcNow.AddMonths(-4), Status = "Completed", Notes = "Accumulation on dip" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "Sample Nifty ETF", Ticker = "DEMO-ETF", AssetType = "ETF", Quantity = 10, Price = 250.00m, TotalAmount = 2500.00m, TransactionDate = DateTime.UtcNow.AddMonths(-3), Status = "Completed", Notes = "Index SIP allocation" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "NTPC Limited", Ticker = "NTPC", AssetType = "Stock", Quantity = 20, Price = 320.00m, TotalAmount = 6400.00m, TransactionDate = DateTime.UtcNow.AddMonths(-3), Status = "Completed", Notes = "Power sector theme" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Buy", AssetName = "Indian Railway Finance Corp", Ticker = "IRFC", AssetType = "Stock", Quantity = 50, Price = 120.00m, TotalAmount = 6000.00m, TransactionDate = DateTime.UtcNow.AddMonths(-2), Status = "Completed", Notes = "Infra & railway finance" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Dividend", AssetName = "Tata Consultancy Services", Ticker = "TCS", AssetType = "Stock", Quantity = 10, Price = 28.00m, TotalAmount = 280.00m, TransactionDate = DateTime.UtcNow.AddMonths(-1), Status = "Completed", Notes = "Interim dividend credited" },
                new() { PortfolioId = portfolio.Id, TransactionType = "Interest", AssetName = "Sample Corporate Bond", Ticker = "DEMO-BOND", AssetType = "Bond", Quantity = 1, Price = 825.00m, TotalAmount = 825.00m, TransactionDate = DateTime.UtcNow.AddMonths(-1), Status = "Completed", Notes = "Annual coupon credit (8.25%)" }
            };
            context.Transactions.AddRange(transactions);

            // 6. Seed Financial Goals
            var goals = new List<FinancialGoal>
            {
                new() { UserId = demoUser.Id, Title = "Emergency Fund", Category = "Emergency Fund", TargetAmount = 300000m, CurrentSavings = 180000m, TargetDate = DateTime.UtcNow.AddMonths(8) },
                new() { UserId = demoUser.Id, Title = "House Down Payment", Category = "House", TargetAmount = 2500000m, CurrentSavings = 850000m, TargetDate = DateTime.UtcNow.AddMonths(36) },
                new() { UserId = demoUser.Id, Title = "Long-Term Wealth Creation", Category = "Wealth Creation", TargetAmount = 10000000m, CurrentSavings = 2200000m, TargetDate = DateTime.UtcNow.AddYears(10) }
            };
            context.FinancialGoals.AddRange(goals);

            // 7. Seed Watchlist
            var watchlist = new List<WatchlistItem>
            {
                new() { UserId = demoUser.Id, AssetId = stocks.First(s => s.Ticker == "RELIANCE").Id, Ticker = "RELIANCE", AssetName = "Reliance Industries Ltd", AssetType = "Stock", TargetBuyPrice = 2850m },
                new() { UserId = demoUser.Id, AssetId = stocks.First(s => s.Ticker == "HDFCBANK").Id, Ticker = "HDFCBANK", AssetName = "HDFC Bank Limited", AssetType = "Stock", TargetBuyPrice = 1600m },
                new() { UserId = demoUser.Id, AssetId = etfs.First(e => e.Ticker == "GOLDBEES").Id, Ticker = "GOLDBEES", AssetName = "Nippon India ETF Gold BeES", AssetType = "ETF", TargetBuyPrice = 65m }
            };
            context.WatchlistItems.AddRange(watchlist);

            context.SaveChanges();
        }

        private static string BCryptOrSha256(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password + "_wealthwise_salt");
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
