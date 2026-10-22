using System;

namespace WealthWise.API.Models.Domain
{
    /// <summary>
    /// User monitored market asset entity for watchlist tracking.
    /// </summary>
    public class WatchlistItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public string Ticker { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AssetType { get; set; } = "Stock";
        public decimal TargetBuyPrice { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Asset? Asset { get; set; }
    }
}
