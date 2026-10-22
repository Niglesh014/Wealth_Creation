import React, { useState } from 'react';
import {
  Eye,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ALL_SAMPLE_ASSETS } from '../data/sampleAssets';
import { formatINR } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { useNavigate } from 'react-router-dom';

export const WatchlistPage: React.FC = () => {
  const { watchlistTickers, toggleWatchlist } = usePortfolio();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('change_desc');
  const [tradeTicker, setTradeTicker] = useState<string | null>(null);

  const watchedAssets = ALL_SAMPLE_ASSETS.filter(a =>
    watchlistTickers.includes(a.ticker.toUpperCase())
  );

  const filtered = watchedAssets.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.ticker.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_desc': return b.currentPrice - a.currentPrice;
      case 'price_asc': return a.currentPrice - b.currentPrice;
      case 'change_desc': return b.dailyChangePercent - a.dailyChangePercent;
      case 'change_asc': return a.dailyChangePercent - b.dailyChangePercent;
      default: return b.dailyChangePercent - a.dailyChangePercent;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Market Watchlist
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Real-time monitored equities and index ETFs with simulated ticks and quick execution
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-fintech-cardDark border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
          />
        </div>
      </div>

      {/* Toolbar / Sort */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-fintech-secondaryText dark:text-gray-400">
          Monitoring <strong className="text-fintech-text dark:text-white">{sorted.length}</strong> assets
        </span>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-fintech-cardDark border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent text-fintech-text dark:text-gray-200"
        >
          <option value="change_desc">Top Gainers (1D)</option>
          <option value="change_asc">Top Losers (1D)</option>
          <option value="price_desc">Highest Price</option>
          <option value="price_asc">Lowest Price</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Your Watchlist is Empty"
          description="Keep an eye on prospective stocks and ETFs by clicking the eye icon on the Stocks or ETFs pages."
          actionText="Explore Stocks"
          onAction={() => navigate('/stocks')}
          icon={<Eye className="w-7 h-7" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(asset => {
            const isPos = asset.dailyChangePercent >= 0;

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-fintech-cardDark rounded-2xl p-5 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-fintech-text dark:text-white">
                          {asset.ticker}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                          {asset.assetType}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {asset.name}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleWatchlist(asset.ticker)}
                      title="Remove from Watchlist"
                      className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4">
                    <div>
                      <span className="text-lg font-bold text-fintech-text dark:text-white block">
                        {formatINR(asset.currentPrice)}
                      </span>
                      <span className="text-[10px] text-gray-400">Simulated Price</span>
                    </div>

                    <span
                      className={`flex items-center font-bold text-xs px-2 py-0.5 rounded-md ${
                        isPos
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                      {isPos ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-gray-100 dark:border-fintech-borderDark">
                  <button
                    onClick={() => {
                      if (asset.assetType === 'Stock') navigate('/stocks');
                      else navigate('/etfs');
                    }}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setTradeTicker(asset.ticker)}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Quick Buy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trade Modal */}
      {tradeTicker && (
        <TransactionModal
          isOpen={!!tradeTicker}
          onClose={() => setTradeTicker(null)}
          initialType="Buy"
          initialTicker={tradeTicker}
        />
      )}
    </div>
  );
};
