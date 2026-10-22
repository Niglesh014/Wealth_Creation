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
    public class PortfolioService : IPortfolioService
    {
        private readonly WealthWiseDbContext _context;

        public PortfolioService(WealthWiseDbContext context)
        {
            _context = context;
        }

        private async Task<Portfolio> GetOrCreateUserPortfolioAsync(int userId)
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.Investments)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (portfolio == null)
            {
                portfolio = new Portfolio
                {
                    UserId = userId,
                    Name = "Primary Wealth Portfolio",
                    CashBalance = 50000m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Portfolios.Add(portfolio);
                await _context.SaveChangesAsync();
            }

            // Sync indexer lookup cache
            portfolio.SyncLookupIndex();
            return portfolio;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            
            // Collect all current asset prices
            var assets = await _context.Assets.ToListAsync();
            var assetMap = assets.ToDictionary(a => a.Ticker, StringComparer.OrdinalIgnoreCase);

            decimal totalInvested = 0m;
            decimal totalCurrentHoldingsValue = 0m;
            decimal todayProfitLoss = 0m;

            // Demonstrates required Collections and foreach loop calculation
            foreach (var holding in portfolio.Investments)
            {
                if (assetMap.TryGetValue(holding.Ticker, out var asset))
                {
                    holding.CurrentMarketPrice = asset.CurrentPrice;
                }

                totalInvested += holding.TotalInvested;
                totalCurrentHoldingsValue += holding.CurrentMarketValue;

                if (asset != null)
                {
                    decimal prevPrice = asset.PreviousClosePrice > 0 ? asset.PreviousClosePrice : asset.CurrentPrice;
                    todayProfitLoss += holding.Quantity * (holding.CurrentMarketPrice - prevPrice);
                }
            }

            decimal totalPortfolioValue = totalCurrentHoldingsValue + portfolio.CashBalance;
            decimal totalProfitLoss = totalCurrentHoldingsValue - totalInvested;
            decimal returnPercentage = totalInvested > 0 ? Math.Round((totalProfitLoss / totalInvested) * 100m, 2) : 0m;
            decimal todayPercentageChange = (totalPortfolioValue - todayProfitLoss) > 0 
                ? Math.Round((todayProfitLoss / (totalPortfolioValue - todayProfitLoss)) * 100m, 2) 
                : 0m;

            return new DashboardSummaryDto
            {
                TotalPortfolioValue = Math.Round(totalPortfolioValue, 2),
                TotalInvestment = Math.Round(totalInvested, 2),
                TotalProfitLoss = Math.Round(totalProfitLoss, 2),
                PercentageReturn = returnPercentage,
                TodayProfitLoss = Math.Round(todayProfitLoss, 2),
                TodayPercentageChange = todayPercentageChange,
                AvailableCash = Math.Round(portfolio.CashBalance, 2),
                Currency = "INR",
                AsOfDate = DateTime.UtcNow
            };
        }

        public async Task<List<InvestmentDetailDto>> GetInvestmentsAsync(int userId, string? assetType = null, string? search = null, string? sortBy = null)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var assets = await _context.Assets.ToListAsync();
            var assetMap = assets.ToDictionary(a => a.Ticker, StringComparer.OrdinalIgnoreCase);

            var list = new List<InvestmentDetailDto>();

            // Demonstrates foreach loop and polymorphic return calculation
            foreach (var inv in portfolio.Investments)
            {
                assetMap.TryGetValue(inv.Ticker, out var asset);
                if (asset != null)
                {
                    inv.CurrentMarketPrice = asset.CurrentPrice;
                }

                // Polymorphic calculation
                decimal customReturn = asset != null ? asset.CalculateReturn(inv) : inv.ReturnPercentage;

                list.Add(new InvestmentDetailDto
                {
                    Id = inv.Id,
                    PortfolioId = inv.PortfolioId,
                    AssetId = inv.AssetId,
                    AssetName = inv.AssetName,
                    Ticker = inv.Ticker,
                    AssetType = inv.AssetType,
                    Quantity = inv.Quantity,
                    AveragePurchasePrice = inv.AveragePurchasePrice,
                    CurrentMarketPrice = inv.CurrentMarketPrice,
                    TotalInvested = inv.TotalInvested,
                    CurrentMarketValue = inv.CurrentMarketValue,
                    UnrealizedProfitLoss = inv.UnrealizedProfitLoss,
                    ReturnPercentage = customReturn,
                    DailyChange = asset?.DailyChange ?? 0m,
                    DailyChangePercent = asset?.DailyChangePercent ?? 0m,
                    PurchaseDate = inv.PurchaseDate,
                    LastUpdated = inv.LastUpdated
                });
            }

            // Filtering
            var query = list.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(assetType) && !assetType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(i => i.AssetType.Equals(assetType, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim();
                query = query.Where(i => i.AssetName.Contains(s, StringComparison.OrdinalIgnoreCase) || 
                                         i.Ticker.Contains(s, StringComparison.OrdinalIgnoreCase));
            }

            // Sorting
            query = sortBy?.ToLower() switch
            {
                "marketvalue_desc" => query.OrderByDescending(i => i.CurrentMarketValue),
                "marketvalue_asc" => query.OrderBy(i => i.CurrentMarketValue),
                "profitloss_desc" => query.OrderByDescending(i => i.UnrealizedProfitLoss),
                "profitloss_asc" => query.OrderBy(i => i.UnrealizedProfitLoss),
                "return_desc" => query.OrderByDescending(i => i.ReturnPercentage),
                "return_asc" => query.OrderBy(i => i.ReturnPercentage),
                "name" => query.OrderBy(i => i.AssetName),
                _ => query.OrderByDescending(i => i.CurrentMarketValue)
            };

            return query.ToList();
        }

        public async Task<InvestmentDetailDto?> GetInvestmentByIdAsync(int userId, int investmentId)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var inv = portfolio.Investments.FirstOrDefault(i => i.Id == investmentId);
            if (inv == null) return null;

            var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == inv.Ticker);
            if (asset != null) inv.CurrentMarketPrice = asset.CurrentPrice;

            return new InvestmentDetailDto
            {
                Id = inv.Id,
                PortfolioId = inv.PortfolioId,
                AssetId = inv.AssetId,
                AssetName = inv.AssetName,
                Ticker = inv.Ticker,
                AssetType = inv.AssetType,
                Quantity = inv.Quantity,
                AveragePurchasePrice = inv.AveragePurchasePrice,
                CurrentMarketPrice = inv.CurrentMarketPrice,
                TotalInvested = inv.TotalInvested,
                CurrentMarketValue = inv.CurrentMarketValue,
                UnrealizedProfitLoss = inv.UnrealizedProfitLoss,
                ReturnPercentage = asset != null ? asset.CalculateReturn(inv) : inv.ReturnPercentage,
                DailyChange = asset?.DailyChange ?? 0m,
                DailyChangePercent = asset?.DailyChangePercent ?? 0m,
                PurchaseDate = inv.PurchaseDate,
                LastUpdated = inv.LastUpdated
            };
        }

        public async Task<InvestmentDetailDto> AddInvestmentAsync(int userId, CreateInvestmentDto dto)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == dto.Ticker.Trim().ToUpperInvariant());

            // Demonstrates required C# Portfolio Indexer: portfolio["TCS"]
            var existingHolding = portfolio[dto.Ticker];

            if (existingHolding != null)
            {
                // Update average purchase price and quantity
                int newQuantity = existingHolding.Quantity + dto.Quantity;
                decimal newTotalCost = (existingHolding.Quantity * existingHolding.AveragePurchasePrice) + (dto.Quantity * dto.PurchasePrice);
                existingHolding.Quantity = newQuantity;
                existingHolding.AveragePurchasePrice = Math.Round(newTotalCost / newQuantity, 2);
                existingHolding.CurrentMarketPrice = asset?.CurrentPrice ?? dto.PurchasePrice;
                existingHolding.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                var newInvestment = new Investment
                {
                    PortfolioId = portfolio.Id,
                    AssetId = asset?.Id ?? 0,
                    AssetName = !string.IsNullOrWhiteSpace(dto.AssetName) ? dto.AssetName : (asset?.Name ?? dto.Ticker),
                    Ticker = dto.Ticker.Trim().ToUpperInvariant(),
                    AssetType = !string.IsNullOrWhiteSpace(dto.AssetType) ? dto.AssetType : (asset?.AssetType ?? "Stock"),
                    Quantity = dto.Quantity,
                    AveragePurchasePrice = dto.PurchasePrice,
                    CurrentMarketPrice = asset?.CurrentPrice ?? dto.PurchasePrice,
                    PurchaseDate = dto.PurchaseDate,
                    LastUpdated = DateTime.UtcNow
                };

                // Add through indexer
                portfolio[newInvestment.Ticker] = newInvestment;
            }

            // Record transaction
            var txn = new Transaction
            {
                PortfolioId = portfolio.Id,
                TransactionType = "Buy",
                AssetName = dto.AssetName,
                Ticker = dto.Ticker.Trim().ToUpperInvariant(),
                AssetType = dto.AssetType,
                Quantity = dto.Quantity,
                Price = dto.PurchasePrice,
                TotalAmount = dto.Quantity * dto.PurchasePrice,
                TransactionDate = dto.PurchaseDate,
                Status = "Completed",
                Notes = "Added via Portfolio Manager"
            };
            _context.Transactions.Add(txn);

            await _context.SaveChangesAsync();
            portfolio.SyncLookupIndex();

            var saved = portfolio[dto.Ticker]!;
            return new InvestmentDetailDto
            {
                Id = saved.Id,
                PortfolioId = saved.PortfolioId,
                AssetId = saved.AssetId,
                AssetName = saved.AssetName,
                Ticker = saved.Ticker,
                AssetType = saved.AssetType,
                Quantity = saved.Quantity,
                AveragePurchasePrice = saved.AveragePurchasePrice,
                CurrentMarketPrice = saved.CurrentMarketPrice,
                TotalInvested = saved.TotalInvested,
                CurrentMarketValue = saved.CurrentMarketValue,
                UnrealizedProfitLoss = saved.UnrealizedProfitLoss,
                ReturnPercentage = saved.ReturnPercentage,
                PurchaseDate = saved.PurchaseDate,
                LastUpdated = saved.LastUpdated
            };
        }

        public async Task<InvestmentDetailDto?> UpdateInvestmentAsync(int userId, int investmentId, UpdateInvestmentDto dto)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var investment = portfolio.Investments.FirstOrDefault(i => i.Id == investmentId);
            if (investment == null) return null;

            if (dto.Quantity > 0) investment.Quantity = dto.Quantity;
            if (dto.AveragePurchasePrice > 0) investment.AveragePurchasePrice = dto.AveragePurchasePrice;
            if (dto.CurrentMarketPrice.HasValue && dto.CurrentMarketPrice.Value > 0)
                investment.CurrentMarketPrice = dto.CurrentMarketPrice.Value;

            investment.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            portfolio.SyncLookupIndex();

            return await GetInvestmentByIdAsync(userId, investmentId);
        }

        public async Task<bool> DeleteInvestmentAsync(int userId, int investmentId)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var investment = portfolio.Investments.FirstOrDefault(i => i.Id == investmentId);
            if (investment == null) return false;

            // Remove using indexer
            portfolio[investment.Ticker] = null;
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<AllocationItemDto>> GetAssetAllocationAsync(int userId)
        {
            var portfolio = await GetOrCreateUserPortfolioAsync(userId);
            var assets = await _context.Assets.ToListAsync();
            var assetMap = assets.ToDictionary(a => a.Ticker, StringComparer.OrdinalIgnoreCase);

            decimal stocksVal = 0m, bondsVal = 0m, mfVal = 0m, etfVal = 0m;

            // Loop through investments
            foreach (var holding in portfolio.Investments)
            {
                if (assetMap.TryGetValue(holding.Ticker, out var asset))
                {
                    holding.CurrentMarketPrice = asset.CurrentPrice;
                }

                switch (holding.AssetType.ToLowerInvariant())
                {
                    case "stock":
                    case "stocks":
                        stocksVal += holding.CurrentMarketValue;
                        break;
                    case "bond":
                    case "bonds":
                        bondsVal += holding.CurrentMarketValue;
                        break;
                    case "mutualfund":
                    case "mutual fund":
                    case "mutual funds":
                        mfVal += holding.CurrentMarketValue;
                        break;
                    case "etf":
                    case "etfs":
                        etfVal += holding.CurrentMarketValue;
                        break;
                    default:
                        stocksVal += holding.CurrentMarketValue;
                        break;
                }
            }

            decimal cashVal = portfolio.CashBalance;
            decimal total = stocksVal + bondsVal + mfVal + etfVal + cashVal;
            if (total <= 0) total = 1m; // Guard divide-by-zero

            return new List<AllocationItemDto>
            {
                new() { Category = "Stocks", Value = Math.Round(stocksVal, 2), Percentage = Math.Round((stocksVal / total) * 100m, 1), Color = "#2563EB" },
                new() { Category = "Bonds", Value = Math.Round(bondsVal, 2), Percentage = Math.Round((bondsVal / total) * 100m, 1), Color = "#0D9488" },
                new() { Category = "Mutual Funds", Value = Math.Round(mfVal, 2), Percentage = Math.Round((mfVal / total) * 100m, 1), Color = "#8B5CF6" },
                new() { Category = "ETFs", Value = Math.Round(etfVal, 2), Percentage = Math.Round((etfVal / total) * 100m, 1), Color = "#F59E0B" },
                new() { Category = "Cash", Value = Math.Round(cashVal, 2), Percentage = Math.Round((cashVal / total) * 100m, 1), Color = "#10B981" }
            };
        }

        public async Task<List<PerformancePointDto>> GetPerformanceHistoryAsync(int userId, string range = "1M")
        {
            var summary = await GetDashboardSummaryAsync(userId);
            decimal currentTotal = summary.TotalPortfolioValue;
            decimal invested = summary.TotalInvestment;

            int points = range.ToUpperInvariant() switch
            {
                "1W" => 7,
                "1M" => 30,
                "3M" => 45,
                "6M" => 60,
                "1Y" => 52,
                "ALL" => 70,
                _ => 30
            };

            var list = new List<PerformancePointDto>();
            var rnd = new Random(42); // deterministic seed for clean charts
            decimal startMultiplier = range.ToUpperInvariant() switch
            {
                "1W" => 0.985m,
                "1M" => 0.940m,
                "3M" => 0.890m,
                "6M" => 0.840m,
                "1Y" => 0.780m,
                "ALL" => 0.720m,
                _ => 0.940m
            };

            decimal initialVal = currentTotal * startMultiplier;
            decimal stepIncrement = (currentTotal - initialVal) / points;

            var startDate = DateTime.UtcNow.AddDays(-points);

            for (int i = 0; i <= points; i++)
            {
                var date = startDate.AddDays(i);
                decimal jitter = ((decimal)rnd.NextDouble() - 0.45m) * (stepIncrement * 1.5m);
                decimal val = i == points ? currentTotal : Math.Max(invested * 0.9m, initialVal + (stepIncrement * i) + jitter);
                
                list.Add(new PerformancePointDto
                {
                    Date = date.ToString("dd MMM"),
                    Value = Math.Round(val, 2),
                    Invested = Math.Round(invested, 2),
                    ProfitLoss = Math.Round(val - invested, 2)
                });
            }

            return list;
        }

        public async Task<List<TopHoldingDto>> GetTopHoldingsAsync(int userId, int limit = 5)
        {
            var investments = await GetInvestmentsAsync(userId);
            return investments
                .OrderByDescending(i => i.CurrentMarketValue)
                .Take(limit)
                .Select(i => new TopHoldingDto
                {
                    Id = i.Id,
                    AssetName = i.AssetName,
                    Ticker = i.Ticker,
                    AssetType = i.AssetType,
                    Quantity = i.Quantity,
                    AveragePurchasePrice = i.AveragePurchasePrice,
                    CurrentPrice = i.CurrentMarketPrice,
                    MarketValue = i.CurrentMarketValue,
                    ProfitLoss = i.UnrealizedProfitLoss,
                    ReturnPercentage = i.ReturnPercentage,
                    DailyChangePercent = i.DailyChangePercent
                })
                .ToList();
        }
    }
}
