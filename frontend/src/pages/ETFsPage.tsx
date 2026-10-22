import React, { useState } from 'react';
import { PieChart, Search, Eye, PlusCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { SAMPLE_ETFS } from '../data/sampleAssets';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetMarketData } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';
import { TransactionModal } from '../components/transactions/TransactionModal';

export const ETFsPage: React.FC = () => {
  const { holdings, watchlistTickers, toggleWatchlist } = usePortfolio();

  const [search, setSearch] = useState<string>('');
  const [investEtf, setInvestEtf] = useState<AssetMarketData | null>(null);

  const filtered = SAMPLE_ETFS.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.ticker.toLowerCase().includes(search.toLowerCase()) ||
      (e.benchmarkIndex && e.benchmarkIndex.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Exchange-Traded Funds (ETFs)
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Low-cost passive index tracking across Nifty 50, Nifty Bank, and Sovereign Gold
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ETFs by index or ticker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-fintech-cardDark border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
          />
        </div>
      </div>

      {/* ETFs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(etf => {
          const isPos = etf.dailyChangePercent >= 0;
          const isWatched = watchlistTickers.includes(etf.ticker.toUpperCase());
          const held = holdings.find(h => h.ticker.toUpperCase() === etf.ticker.toUpperCase());

          return (
            <div
              key={etf.id}
              className="bg-white dark:bg-fintech-cardDark rounded-2xl p-5 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-bold text-base text-fintech-text dark:text-white block">
                      {etf.ticker}
                    </span>
                    <span className="text-[11px] text-fintech-secondaryText dark:text-gray-400 line-clamp-1">
                      {etf.name}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleWatchlist(etf.ticker)}
                    title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isWatched
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Price & Change */}
                <div className="mb-4">
                  <span className="text-xl font-bold text-fintech-text dark:text-white">
                    {formatINR(etf.currentPrice)}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1 text-xs">
                    <span
                      className={`flex items-center font-semibold ${
                        isPos ? 'text-fintech-positive dark:text-emerald-400' : 'text-fintech-negative dark:text-rose-400'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                      {isPos ? '+' : ''}{etf.dailyChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Benchmark & TER */}
                <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-b border-gray-100 dark:border-fintech-borderDark text-[11px] mb-4">
                  <div>
                    <span className="text-gray-400 block">Benchmark</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      {etf.benchmarkIndex}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Expense Ratio</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      {etf.expenseRatio}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tracking Error</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      {etf.trackingError}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Category</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      Passive Index
                    </span>
                  </div>
                </div>

                {/* Active Holding Indicator */}
                {held && (
                  <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40 mb-3 text-[11px] flex justify-between items-center">
                    <div>
                      <span className="text-amber-900 dark:text-amber-300 font-semibold block">Held: {held.quantity} units</span>
                      <span className="text-gray-500">Avg {formatINR(held.averagePurchasePrice)}</span>
                    </div>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      {formatINR(held.currentMarketValue)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => setInvestEtf(etf)}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Invest in ETF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invest Modal */}
      {investEtf && (
        <TransactionModal
          isOpen={!!investEtf}
          onClose={() => setInvestEtf(null)}
          initialType="Buy"
          initialTicker={investEtf.ticker}
        />
      )}
    </div>
  );
};
