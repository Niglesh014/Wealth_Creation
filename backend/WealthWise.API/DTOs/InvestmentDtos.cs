using System;

namespace WealthWise.API.DTOs
{
    public class CreateInvestmentDto
    {
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = "Stock";
        public int Quantity { get; set; }
        public decimal PurchasePrice { get; set; }
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    }

    public class UpdateInvestmentDto
    {
        public int Quantity { get; set; }
        public decimal AveragePurchasePrice { get; set; }
        public decimal? CurrentMarketPrice { get; set; }
    }

    public class InvestmentDetailDto
    {
        public int Id { get; set; }
        public int PortfolioId { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public string AssetType { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal AveragePurchasePrice { get; set; }
        public decimal CurrentMarketPrice { get; set; }
        public decimal TotalInvested { get; set; }
        public decimal CurrentMarketValue { get; set; }
        public decimal UnrealizedProfitLoss { get; set; }
        public decimal ReturnPercentage { get; set; }
        public decimal DailyChange { get; set; }
        public decimal DailyChangePercent { get; set; }
        public DateTime PurchaseDate { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
