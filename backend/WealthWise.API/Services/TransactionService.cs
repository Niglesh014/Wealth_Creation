using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WealthWise.API.Data;
using WealthWise.API.DTOs;
using WealthWise.API.Models.Domain;

namespace WealthWise.API.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly WealthWiseDbContext _context;

        public TransactionService(WealthWiseDbContext context)
        {
            _context = context;
        }

        private async Task<Portfolio> GetOrCreatePortfolioAsync(int userId)
        {
            var p = await _context.Portfolios
                .Include(p => p.Investments)
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (p == null)
            {
                p = new Portfolio { UserId = userId, CashBalance = 50000m };
                _context.Portfolios.Add(p);
                await _context.SaveChangesAsync();
            }

            p.SyncLookupIndex();
            return p;
        }

        public async Task<List<TransactionDetailDto>> GetTransactionsAsync(int userId, string? type = null, DateTime? startDate = null, DateTime? endDate = null, string? search = null)
        {
            var portfolio = await GetOrCreatePortfolioAsync(userId);
            var query = _context.Transactions.Where(t => t.PortfolioId == portfolio.Id).AsQueryable();

            if (!string.IsNullOrWhiteSpace(type) && !type.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(t => t.TransactionType.Equals(type, StringComparison.OrdinalIgnoreCase));
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= endDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim();
                query = query.Where(t => t.AssetName.Contains(s) || t.Ticker.Contains(s) || t.Id.ToString().Contains(s));
            }

            var list = await query.OrderByDescending(t => t.TransactionDate).ToListAsync();

            return list.Select(t => new TransactionDetailDto
            {
                Id = t.Id,
                PortfolioId = t.PortfolioId,
                TransactionType = t.TransactionType,
                AssetName = t.AssetName,
                Ticker = t.Ticker,
                AssetType = t.AssetType,
                Quantity = t.Quantity,
                Price = t.Price,
                TotalAmount = t.TotalAmount,
                Fees = t.Fees,
                TransactionDate = t.TransactionDate,
                Status = t.Status,
                Notes = t.Notes
            }).ToList();
        }

        public async Task<TransactionDetailDto> RecordTransactionAsync(int userId, CreateTransactionDto dto)
        {
            if (dto.Price < 0) throw new ArgumentException("Price cannot be negative.");
            if (dto.Quantity < 0) throw new ArgumentException("Quantity cannot be negative.");

            var portfolio = await GetOrCreatePortfolioAsync(userId);
            string ticker = dto.Ticker.Trim().ToUpperInvariant();
            string txnType = dto.TransactionType.Trim();

            decimal calculatedTotal = (dto.Quantity * dto.Price) + dto.Fees;

            // Execute within a database transaction if supported
            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (txnType.Equals("Buy", StringComparison.OrdinalIgnoreCase))
                {
                    if (dto.Quantity <= 0) throw new ArgumentException("Buy quantity must be greater than zero.");

                    // Retrieve existing via indexer
                    var holding = portfolio[ticker];
                    var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == ticker);

                    if (holding != null)
                    {
                        // Update existing holding with weighted average cost
                        int newQty = holding.Quantity + dto.Quantity;
                        decimal totalCost = (holding.Quantity * holding.AveragePurchasePrice) + (dto.Quantity * dto.Price);
                        holding.Quantity = newQty;
                        holding.AveragePurchasePrice = Math.Round(totalCost / newQty, 2);
                        holding.CurrentMarketPrice = asset?.CurrentPrice ?? dto.Price;
                        holding.LastUpdated = DateTime.UtcNow;
                    }
                    else
                    {
                        var newInv = new Investment
                        {
                            PortfolioId = portfolio.Id,
                            AssetId = asset?.Id ?? 0,
                            AssetName = !string.IsNullOrWhiteSpace(dto.AssetName) ? dto.AssetName : (asset?.Name ?? ticker),
                            Ticker = ticker,
                            AssetType = !string.IsNullOrWhiteSpace(dto.AssetType) ? dto.AssetType : (asset?.AssetType ?? "Stock"),
                            Quantity = dto.Quantity,
                            AveragePurchasePrice = dto.Price,
                            CurrentMarketPrice = asset?.CurrentPrice ?? dto.Price,
                            PurchaseDate = dto.TransactionDate,
                            LastUpdated = DateTime.UtcNow
                        };
                        portfolio[ticker] = newInv;
                    }
                }
                else if (txnType.Equals("Sell", StringComparison.OrdinalIgnoreCase))
                {
                    if (dto.Quantity <= 0) throw new ArgumentException("Sell quantity must be greater than zero.");

                    var holding = portfolio[ticker];
                    if (holding == null || holding.Quantity < dto.Quantity)
                    {
                        throw new InvalidOperationException($"Cannot sell {dto.Quantity} units of {ticker}. You only own {holding?.Quantity ?? 0} units.");
                    }

                    holding.Quantity -= dto.Quantity;
                    if (holding.Quantity == 0)
                    {
                        // Remove holding if sold completely
                        portfolio[ticker] = null;
                        _context.Investments.Remove(holding);
                    }
                    else
                    {
                        holding.LastUpdated = DateTime.UtcNow;
                    }

                    // Credit sell proceeds to cash balance
                    portfolio.CashBalance += calculatedTotal;
                }
                else if (txnType.Equals("Dividend", StringComparison.OrdinalIgnoreCase) || txnType.Equals("Interest", StringComparison.OrdinalIgnoreCase))
                {
                    // Credit cash balance
                    portfolio.CashBalance += calculatedTotal;
                }
                else if (txnType.Equals("Deposit", StringComparison.OrdinalIgnoreCase))
                {
                    portfolio.CashBalance += calculatedTotal;
                }
                else if (txnType.Equals("Withdrawal", StringComparison.OrdinalIgnoreCase))
                {
                    if (portfolio.CashBalance < calculatedTotal)
                    {
                        throw new InvalidOperationException($"Insufficient cash balance. Available: ₹{portfolio.CashBalance:N2}, Requested: ₹{calculatedTotal:N2}");
                    }
                    portfolio.CashBalance -= calculatedTotal;
                }

                var txn = new Transaction
                {
                    PortfolioId = portfolio.Id,
                    TransactionType = txnType,
                    AssetName = dto.AssetName,
                    Ticker = ticker,
                    AssetType = dto.AssetType,
                    Quantity = dto.Quantity,
                    Price = dto.Price,
                    TotalAmount = calculatedTotal,
                    Fees = dto.Fees,
                    TransactionDate = dto.TransactionDate,
                    Status = "Completed",
                    Notes = dto.Notes
                };

                _context.Transactions.Add(txn);
                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return new TransactionDetailDto
                {
                    Id = txn.Id,
                    PortfolioId = txn.PortfolioId,
                    TransactionType = txn.TransactionType,
                    AssetName = txn.AssetName,
                    Ticker = txn.Ticker,
                    AssetType = txn.AssetType,
                    Quantity = txn.Quantity,
                    Price = txn.Price,
                    TotalAmount = txn.TotalAmount,
                    Fees = txn.Fees,
                    TransactionDate = txn.TransactionDate,
                    Status = txn.Status,
                    Notes = txn.Notes
                };
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        public async Task<TransactionSummaryDto> GetTransactionSummaryAsync(int userId)
        {
            var portfolio = await GetOrCreatePortfolioAsync(userId);
            var txns = await _context.Transactions.Where(t => t.PortfolioId == portfolio.Id).ToListAsync();

            decimal buys = 0m, sells = 0m, dividends = 0m, interest = 0m, deposits = 0m, withdrawals = 0m;

            // Collections and foreach
            foreach (var t in txns)
            {
                switch (t.TransactionType.ToLowerInvariant())
                {
                    case "buy": buys += t.TotalAmount; break;
                    case "sell": sells += t.TotalAmount; break;
                    case "dividend": dividends += t.TotalAmount; break;
                    case "interest": interest += t.TotalAmount; break;
                    case "deposit": deposits += t.TotalAmount; break;
                    case "withdrawal": withdrawals += t.TotalAmount; break;
                }
            }

            return new TransactionSummaryDto
            {
                TotalInvestedInBuys = buys,
                TotalRealizedFromSells = sells,
                TotalDividendsReceived = dividends,
                TotalInterestReceived = interest,
                TotalDeposited = deposits,
                TotalWithdrawn = withdrawals
            };
        }

        public async Task<byte[]> ExportTransactionsCsvAsync(int userId)
        {
            var txns = await GetTransactionsAsync(userId);
            var sb = new StringBuilder();
            sb.AppendLine("Transaction ID,Date,Type,Asset Name,Ticker,Asset Class,Quantity,Price (INR),Fees (INR),Total (INR),Status,Notes");

            foreach (var t in txns)
            {
                sb.AppendLine($"\"{t.Id}\",\"{t.TransactionDate:yyyy-MM-dd HH:mm}\",\"{t.TransactionType}\",\"{t.AssetName}\",\"{t.Ticker}\",\"{t.AssetType}\",{t.Quantity},{t.Price:F2},{t.Fees:F2},{t.TotalAmount:F2},\"{t.Status}\",\"{t.Notes.Replace("\"", "\"\"")}\"");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
