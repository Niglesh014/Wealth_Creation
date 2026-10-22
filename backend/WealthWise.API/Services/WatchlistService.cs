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
    public class WatchlistService : IWatchlistService
    {
        private readonly WealthWiseDbContext _context;
        private readonly IAssetService _assetService;

        public WatchlistService(WealthWiseDbContext context, IAssetService assetService)
        {
            _context = context;
            _assetService = assetService;
        }

        public async Task<List<AssetMarketDto>> GetWatchlistAsync(int userId, string? search = null, string? sortBy = null)
        {
            var items = await _context.WatchlistItems
                .Where(w => w.UserId == userId)
                .ToListAsync();

            var list = new List<AssetMarketDto>();
            foreach (var item in items)
            {
                var assetDto = await _assetService.GetAssetByTickerAsync(item.Ticker);
                if (assetDto != null)
                {
                    assetDto.IsWatchlisted = true;
                    list.Add(assetDto);
                }
            }

            var query = list.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim();
                query = query.Where(a => a.Name.Contains(s, StringComparison.OrdinalIgnoreCase) || 
                                         a.Ticker.Contains(s, StringComparison.OrdinalIgnoreCase));
            }

            query = sortBy?.ToLower() switch
            {
                "price_desc" => query.OrderByDescending(a => a.CurrentPrice),
                "price_asc" => query.OrderBy(a => a.CurrentPrice),
                "change_desc" => query.OrderByDescending(a => a.DailyChangePercent),
                "change_asc" => query.OrderBy(a => a.DailyChangePercent),
                "name" => query.OrderBy(a => a.Name),
                _ => query.OrderByDescending(a => a.DailyChangePercent)
            };

            return query.ToList();
        }

        public async Task<bool> AddToWatchlistAsync(int userId, string ticker)
        {
            string cleanTicker = ticker.Trim().ToUpperInvariant();
            var exists = await _context.WatchlistItems.AnyAsync(w => w.UserId == userId && w.Ticker == cleanTicker);
            if (exists) return true;

            var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == cleanTicker);
            if (asset == null) return false;

            var item = new WatchlistItem
            {
                UserId = userId,
                AssetId = asset.Id,
                Ticker = cleanTicker,
                AssetName = asset.Name,
                AssetType = asset.AssetType,
                TargetBuyPrice = asset.CurrentPrice * 0.95m,
                AddedAt = DateTime.UtcNow
            };

            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFromWatchlistAsync(int userId, string ticker)
        {
            string cleanTicker = ticker.Trim().ToUpperInvariant();
            var item = await _context.WatchlistItems.FirstOrDefaultAsync(w => w.UserId == userId && w.Ticker == cleanTicker);
            if (item == null) return false;

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
