using System;
using WealthWise.API.Models.Domain;
using Xunit;

namespace WealthWise.Tests
{
    public class DomainCalculationTests
    {
        [Fact]
        public void PortfolioIndexer_ReturnsAndStoresHoldingByTicker()
        {
            // Arrange
            var portfolio = new Portfolio { Name = "Test Portfolio" };
            var investment = new Investment
            {
                Ticker = "TCS",
                AssetName = "Tata Consultancy Services",
                Quantity = 10,
                AveragePurchasePrice = 3500.00m,
                CurrentMarketPrice = 3850.00m
            };

            // Act - Set using Indexer
            portfolio["TCS"] = investment;

            // Assert - Get using Indexer (case-insensitive)
            var retrieved = portfolio["tcs"];
            Assert.NotNull(retrieved);
            Assert.Equal("TCS", retrieved.Ticker);
            Assert.Equal(10, retrieved.Quantity);
            Assert.Equal(35000.00m, retrieved.TotalInvested);
            Assert.Equal(38500.00m, retrieved.CurrentMarketValue);
            Assert.Equal(3500.00m, retrieved.UnrealizedProfitLoss);
            Assert.Equal(10.00m, retrieved.ReturnPercentage);
        }

        [Fact]
        public void StockPolymorphicReturn_CalculatesCapitalGainCorrectly()
        {
            // Arrange
            var stock = new Stock
            {
                Ticker = "INFY",
                Name = "Infosys Limited",
                CurrentPrice = 1740.00m,
                DividendYield = 2.0m
            };

            var holding = new Investment
            {
                Ticker = "INFY",
                Quantity = 15,
                AveragePurchasePrice = 1450.00m,
                CurrentMarketPrice = 1740.00m
            };

            // Act - Call Polymorphic CalculateReturn
            decimal calculatedReturn = stock.CalculateReturn(holding);

            // Assert: (1740 - 1450) / 1450 * 100 = 290 / 1450 * 100 = 20.00%
            Assert.Equal(20.00m, calculatedReturn);
        }

        [Fact]
        public void BondPolymorphicReturn_IncludesCouponRateYield()
        {
            // Arrange
            var bond = new Bond
            {
                Ticker = "DEMO-BOND",
                Name = "Sample Corporate Bond",
                CurrentPrice = 10000.00m,
                FaceValue = 10000.00m,
                CouponRate = 8.25m,
                InterestFrequency = "Annual"
            };

            var holding = new Investment
            {
                Ticker = "DEMO-BOND",
                Quantity = 1,
                AveragePurchasePrice = 10000.00m,
                CurrentMarketPrice = 10000.00m
            };

            // Act
            decimal couponPayout = bond.CalculateCouponPayout(10000m);
            decimal totalReturn = bond.CalculateReturn(holding);

            // Assert
            Assert.Equal(825.00m, couponPayout); // 8.25% of 10,000
            Assert.Equal(8.25m, totalReturn);
        }

        [Fact]
        public void PortfolioAggregations_CalculateTotalInvestedAndMarketValueAccurately()
        {
            // Arrange
            var portfolio = new Portfolio { CashBalance = 50000m };
            portfolio["TCS"] = new Investment
            {
                Ticker = "TCS",
                Quantity = 10,
                AveragePurchasePrice = 3500m, // 35,000
                CurrentMarketPrice = 3850m    // 38,500
            };
            portfolio["INFY"] = new Investment
            {
                Ticker = "INFY",
                Quantity = 15,
                AveragePurchasePrice = 1450m, // 21,750
                CurrentMarketPrice = 1580m    // 23,700
            };

            // Act
            decimal totalInvested = portfolio.CalculateTotalInvested();
            decimal totalHoldingsValue = portfolio.CalculateCurrentHoldingsValue();
            decimal totalPortfolioValue = portfolio.CalculateTotalPortfolioValue();
            decimal profitLoss = portfolio.CalculateTotalProfitLoss();

            // Assert
            Assert.Equal(56750m, totalInvested);
            Assert.Equal(62200m, totalHoldingsValue);
            Assert.Equal(112200m, totalPortfolioValue); // 62,200 + 50,000 cash
            Assert.Equal(5450m, profitLoss);
        }
    }
}
