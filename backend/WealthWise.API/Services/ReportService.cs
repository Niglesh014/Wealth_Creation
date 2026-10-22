using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WealthWise.API.Data;
using WealthWise.API.DTOs;

namespace WealthWise.API.Services
{
    public class ReportService : IReportService
    {
        private readonly WealthWiseDbContext _context;
        private readonly IPortfolioService _portfolioService;

        public ReportService(WealthWiseDbContext context, IPortfolioService portfolioService)
        {
            _context = context;
            _portfolioService = portfolioService;
        }

        public async Task<FinancialReportDto> GetFinancialReportAsync(int userId)
        {
            var summary = await _portfolioService.GetDashboardSummaryAsync(userId);
            var investments = await _portfolioService.GetInvestmentsAsync(userId);

            var portfolio = await _context.Portfolios.FirstOrDefaultAsync(p => p.UserId == userId);
            var txns = portfolio != null 
                ? await _context.Transactions.Where(t => t.PortfolioId == portfolio.Id).ToListAsync()
                : new List<Models.Domain.Transaction>();

            decimal realizedGains = 0m;
            decimal totalDividends = 0m;
            decimal totalInterest = 0m;

            // Separate realized profits from unrealized profits, excluding deposits/withdrawals
            foreach (var t in txns)
            {
                if (t.TransactionType.Equals("Sell", StringComparison.OrdinalIgnoreCase))
                {
                    // For demo tracking, estimate sell gain vs purchase
                    realizedGains += (t.TotalAmount * 0.12m); 
                }
                else if (t.TransactionType.Equals("Dividend", StringComparison.OrdinalIgnoreCase))
                {
                    totalDividends += t.TotalAmount;
                }
                else if (t.TransactionType.Equals("Interest", StringComparison.OrdinalIgnoreCase))
                {
                    totalInterest += t.TotalAmount;
                }
            }

            // Monthly activity aggregation
            var monthlyGroup = txns
                .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyActivityDto
                {
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    InvestedAmount = g.Where(x => x.TransactionType.Equals("Buy", StringComparison.OrdinalIgnoreCase)).Sum(x => x.TotalAmount),
                    RealizedGains = g.Where(x => x.TransactionType.Equals("Sell", StringComparison.OrdinalIgnoreCase)).Sum(x => x.TotalAmount * 0.12m),
                    DividendIncome = g.Where(x => x.TransactionType.Equals("Dividend", StringComparison.OrdinalIgnoreCase)).Sum(x => x.TotalAmount),
                    InterestIncome = g.Where(x => x.TransactionType.Equals("Interest", StringComparison.OrdinalIgnoreCase)).Sum(x => x.TotalAmount)
                })
                .ToList();

            // Asset class comparison
            var assetClasses = new[] { "Stock", "Bond", "MutualFund", "ETF" };
            var assetClassList = new List<AssetClassComparisonDto>();
            decimal grandTotal = summary.TotalPortfolioValue > 0 ? summary.TotalPortfolioValue : 1m;

            foreach (var ac in assetClasses)
            {
                var holdingsInClass = investments.Where(i => i.AssetType.Equals(ac, StringComparison.OrdinalIgnoreCase)).ToList();
                decimal inv = holdingsInClass.Sum(h => h.TotalInvested);
                decimal cur = holdingsInClass.Sum(h => h.CurrentMarketValue);
                decimal pl = cur - inv;
                decimal ret = inv > 0 ? Math.Round((pl / inv) * 100m, 2) : 0m;
                decimal share = Math.Round((cur / grandTotal) * 100m, 1);

                string label = ac switch
                {
                    "Stock" => "Stocks",
                    "Bond" => "Bonds",
                    "MutualFund" => "Mutual Funds",
                    "ETF" => "ETFs",
                    _ => ac
                };

                assetClassList.Add(new AssetClassComparisonDto
                {
                    AssetClass = label,
                    Invested = Math.Round(inv, 2),
                    CurrentValue = Math.Round(cur, 2),
                    ProfitLoss = Math.Round(pl, 2),
                    ReturnPercentage = ret,
                    PortfolioSharePercentage = share
                });
            }

            return new FinancialReportDto
            {
                TotalPortfolioValue = summary.TotalPortfolioValue,
                TotalInvestedCapital = summary.TotalInvestment,
                UnrealizedProfitLoss = summary.TotalProfitLoss,
                RealizedProfitLoss = Math.Round(realizedGains, 2),
                TotalDividendIncome = Math.Round(totalDividends, 2),
                TotalBondInterestIncome = Math.Round(totalInterest, 2),
                OverallReturnPercentage = summary.PercentageReturn,
                MonthlyActivities = monthlyGroup,
                AssetClassPerformances = assetClassList
            };
        }

        public async Task<byte[]> ExportFinancialReportCsvAsync(int userId)
        {
            var report = await GetFinancialReportAsync(userId);
            var sb = new StringBuilder();

            sb.AppendLine("WealthWise Financial & Tax Analytics Report");
            sb.AppendLine($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine();
            sb.AppendLine("Portfolio Summary,Amount (INR)");
            sb.AppendLine($"Total Portfolio Value,{report.TotalPortfolioValue:F2}");
            sb.AppendLine($"Total Invested Capital,{report.TotalInvestedCapital:F2}");
            sb.AppendLine($"Unrealized Profit/Loss,{report.UnrealizedProfitLoss:F2}");
            sb.AppendLine($"Realized Capital Gains,{report.RealizedProfitLoss:F2}");
            sb.AppendLine($"Total Dividend Income,{report.TotalDividendIncome:F2}");
            sb.AppendLine($"Total Bond Interest Income,{report.TotalBondInterestIncome:F2}");
            sb.AppendLine($"Overall Return Rate,{report.OverallReturnPercentage:F2}%");
            sb.AppendLine();
            sb.AppendLine("Asset Class Performance Breakdown");
            sb.AppendLine("Asset Class,Invested (INR),Current Value (INR),Profit/Loss (INR),Return %,Portfolio Share %");

            foreach (var ac in report.AssetClassPerformances)
            {
                sb.AppendLine($"\"{ac.AssetClass}\",{ac.Invested:F2},{ac.CurrentValue:F2},{ac.ProfitLoss:F2},{ac.ReturnPercentage:F2}%,{ac.PortfolioSharePercentage:F1}%");
            }

            sb.AppendLine();
            sb.AppendLine("Monthly Investment & Income Activity");
            sb.AppendLine("Month,Invested Capital (INR),Realized Gains (INR),Dividend Income (INR),Interest Income (INR)");
            foreach (var m in report.MonthlyActivities)
            {
                sb.AppendLine($"\"{m.Month}\",{m.InvestedAmount:F2},{m.RealizedGains:F2},{m.DividendIncome:F2},{m.InterestIncome:F2}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
