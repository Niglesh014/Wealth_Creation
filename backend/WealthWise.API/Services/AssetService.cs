using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WealthWise.API.Data;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Services
{
    public class AssetService : IAssetService
    {
        private readonly WealthWiseDbContext _context;

        public AssetService(WealthWiseDbContext context)
        {
            _context = context;
        }

        public async Task<List<AssetMarketDto>> GetStocksAsync(string? search = null)
        {
            var query = _context.Stocks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim();
                query = query.Where(st => st.Name.Contains(s) || st.Ticker.Contains(s) || st.Sector.Contains(s));
            }

            var stocks = await query.ToListAsync();
            return stocks.Select(st => new AssetMarketDto
            {
                Id = st.Id,
                Name = st.Name,
                Ticker = st.Ticker,
                AssetType = "Stock",
                CurrentPrice = st.CurrentPrice,
                PreviousClosePrice = st.PreviousClosePrice,
                DailyChange = st.DailyChange,
                DailyChangePercent = st.DailyChangePercent,
                Sector = st.Sector,
                MarketCap = st.MarketCap,
                PeRatio = st.PeRatio,
                DividendYield = st.DividendYield,
                Week52High = st.Week52High,
                Week52Low = st.Week52Low
            }).ToList();
        }

        public async Task<List<AssetMarketDto>> GetBondsAsync(string? category = null)
        {
            var query = _context.Bonds.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.BondCategory.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            var bonds = await query.ToListAsync();
            return bonds.Select(b => new AssetMarketDto
            {
                Id = b.Id,
                Name = b.Name,
                Ticker = b.Ticker,
                AssetType = "Bond",
                CurrentPrice = b.CurrentPrice,
                PreviousClosePrice = b.PreviousClosePrice,
                DailyChange = b.DailyChange,
                DailyChangePercent = b.DailyChangePercent,
                Issuer = b.Issuer,
                CreditRating = b.CreditRating,
                CouponRate = b.CouponRate,
                FaceValue = b.FaceValue,
                MaturityDate = b.MaturityDate,
                InterestFrequency = b.InterestFrequency,
                BondCategory = b.BondCategory
            }).ToList();
        }

        public async Task<List<AssetMarketDto>> GetMutualFundsAsync(string? category = null)
        {
            var query = _context.MutualFunds.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(mf => mf.FundCategory.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            var mfs = await query.ToListAsync();
            return mfs.Select(mf => new AssetMarketDto
            {
                Id = mf.Id,
                Name = mf.Name,
                Ticker = mf.Ticker,
                AssetType = "MutualFund",
                CurrentPrice = mf.CurrentPrice,
                PreviousClosePrice = mf.PreviousClosePrice,
                DailyChange = mf.DailyChange,
                DailyChangePercent = mf.DailyChangePercent,
                FundCategory = mf.FundCategory,
                Nav = mf.Nav,
                RiskCategory = mf.RiskCategory,
                ExpenseRatio = mf.ExpenseRatio,
                FundAum = mf.FundAum
            }).ToList();
        }

        public async Task<List<AssetMarketDto>> GetETFsAsync(string? search = null)
        {
            var query = _context.ETFs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim();
                query = query.Where(etf => etf.Name.Contains(s) || etf.Ticker.Contains(s) || etf.BenchmarkIndex.Contains(s));
            }

            var etfs = await query.ToListAsync();
            return etfs.Select(etf => new AssetMarketDto
            {
                Id = etf.Id,
                Name = etf.Name,
                Ticker = etf.Ticker,
                AssetType = "ETF",
                CurrentPrice = etf.CurrentPrice,
                PreviousClosePrice = etf.PreviousClosePrice,
                DailyChange = etf.DailyChange,
                DailyChangePercent = etf.DailyChangePercent,
                BenchmarkIndex = etf.BenchmarkIndex,
                ExpenseRatio = etf.ExpenseRatio,
                TrackingError = etf.TrackingError
            }).ToList();
        }

        public async Task<AssetMarketDto?> GetAssetByTickerAsync(string ticker)
        {
            var cleanTicker = ticker.Trim().ToUpperInvariant();
            var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == cleanTicker);
            if (asset == null) return null;

            var dto = new AssetMarketDto
            {
                Id = asset.Id,
                Name = asset.Name,
                Ticker = asset.Ticker,
                AssetType = asset.AssetType,
                CurrentPrice = asset.CurrentPrice,
                PreviousClosePrice = asset.PreviousClosePrice,
                DailyChange = asset.DailyChange,
                DailyChangePercent = asset.DailyChangePercent
            };

            if (asset is Stock st)
            {
                dto.Sector = st.Sector;
                dto.MarketCap = st.MarketCap;
                dto.PeRatio = st.PeRatio;
                dto.DividendYield = st.DividendYield;
                dto.Week52High = st.Week52High;
                dto.Week52Low = st.Week52Low;
            }
            else if (asset is Bond b)
            {
                dto.Issuer = b.Issuer;
                dto.CreditRating = b.CreditRating;
                dto.CouponRate = b.CouponRate;
                dto.FaceValue = b.FaceValue;
                dto.MaturityDate = b.MaturityDate;
                dto.InterestFrequency = b.InterestFrequency;
                dto.BondCategory = b.BondCategory;
            }
            else if (asset is MutualFund mf)
            {
                dto.FundCategory = mf.FundCategory;
                dto.Nav = mf.Nav;
                dto.RiskCategory = mf.RiskCategory;
                dto.ExpenseRatio = mf.ExpenseRatio;
                dto.FundAum = mf.FundAum;
            }
            else if (asset is ETF etf)
            {
                dto.BenchmarkIndex = etf.BenchmarkIndex;
                dto.ExpenseRatio = etf.ExpenseRatio;
                dto.TrackingError = etf.TrackingError;
            }

            return dto;
        }

        /// <summary>
        /// Bond Calculator: Calculates annual coupon income, periodic payments, and total returns.
        /// Formula from Section 8: Annual Coupon Income = Principal * Annual Coupon Rate / 100
        /// </summary>
        public BondCalculationResult CalculateBondYield(BondCalculationRequest request)
        {
            if (request.PrincipalAmount <= 0) request.PrincipalAmount = 10000m;
            if (request.AnnualCouponRate <= 0) request.AnnualCouponRate = 7.5m;
            if (request.DurationYears <= 0) request.DurationYears = 5;

            int periodsPerYear = request.PaymentFrequency.ToLowerInvariant() switch
            {
                "monthly" => 12,
                "quarterly" => 4,
                "semi-annual" => 2,
                _ => 1
            };

            decimal annualCouponIncome = request.PrincipalAmount * (request.AnnualCouponRate / 100m);
            decimal periodicCouponPayment = Math.Round(annualCouponIncome / periodsPerYear, 2);
            decimal totalCouponIncome = Math.Round(annualCouponIncome * request.DurationYears, 2);
            decimal maturityValue = request.PrincipalAmount + totalCouponIncome;

            return new BondCalculationResult
            {
                PrincipalAmount = request.PrincipalAmount,
                AnnualCouponRate = request.AnnualCouponRate,
                PaymentFrequency = request.PaymentFrequency,
                DurationYears = request.DurationYears,
                PeriodicCouponPayment = periodicCouponPayment,
                AnnualCouponIncome = Math.Round(annualCouponIncome, 2),
                TotalCouponIncome = totalCouponIncome,
                MaturityValue = maturityValue,
                Disclaimer = "Coupon income represents periodic interest payouts and does not account for credit default risk or reinvestment rates. All illustrative rates do not guarantee returns."
            };
        }
    }
}
