import React, { useState } from 'react';
import {
  Search,
  Eye,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Info,
  ExternalLink,
  ShieldAlert,
  BarChart2
} from 'lucide-react';
import { SAMPLE_STOCKS } from '../data/sampleAssets';
import type { AssetMarketData } from '../types';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const StocksPage: React.FC = () => {
  const { watchlistTickers, toggleWatchlist } = usePortfolio();

  const [search, setSearch] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<AssetMarketData | null>(null);
  const [tradeStock, setTradeStock] = useState<AssetMarketData | null>(null);

  const filtered = SAMPLE_STOCKS.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      (s.sector && s.sector.toLowerCase().includes(search.toLowerCase()))
  );

  // Generate simulated chart points for the selected stock
  const getSimulatedStockHistory = (basePrice: number) => {
    const points = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const randomFactor = 1 + (Math.sin(i * 0.7) * 0.04) + ((Math.random() - 0.5) * 0.02);
      points.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        price: Math.round(basePrice * randomFactor * 100) / 100
      });
    }
    return points;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Indian Equities (Stocks)
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Explore blue-chip NSE/BSE listed companies, valuation ratios, and market depth
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or ticker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-fintech-cardDark border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
          />
        </div>
      </div>

      {/* Regulatory Simulated Data Warning */}
      <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p>
          <strong>Notice:</strong> Prices and percentage changes are simulated demo values for educational demonstration. They are decoupled behind an abstraction layer ready for live brokerage/market-data API integration.
        </p>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(stock => {
          const isPos = stock.dailyChangePercent >= 0;
          const isWatched = watchlistTickers.includes(stock.ticker.toUpperCase());

          return (
            <div
              key={stock.id}
              className="bg-white dark:bg-fintech-cardDark rounded-2xl p-5 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-bold text-base text-fintech-text dark:text-white block">
                      {stock.ticker}
                    </span>
                    <span className="text-[11px] text-fintech-secondaryText dark:text-gray-400 line-clamp-1">
                      {stock.name}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleWatchlist(stock.ticker)}
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
                    {formatINR(stock.currentPrice)}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1 text-xs">
                    <span
                      className={`flex items-center font-semibold ${
                        isPos ? 'text-fintech-positive dark:text-emerald-400' : 'text-fintech-negative dark:text-rose-400'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                      {isPos ? '+' : ''}{stock.dailyChangePercent.toFixed(2)}%
                    </span>
                    <span className="text-gray-400">({isPos ? '+' : ''}{formatINR(stock.dailyChange)})</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-b border-gray-100 dark:border-fintech-borderDark text-[11px] mb-4">
                  <div>
                    <span className="text-gray-400 block">Sector</span>
                    <span className="font-medium text-fintech-text dark:text-gray-200 truncate block">
                      {stock.sector}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">P/E Ratio</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      {stock.peRatio || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Div Yield</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      {stock.dividendYield ? `${stock.dividendYield}%` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Market Cap</span>
                    <span className="font-semibold text-fintech-text dark:text-gray-200">
                      ₹{formatCompactINR(stock.marketCap || 0)} Cr
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setSelectedStock(stock)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
                >
                  Details
                </button>
                <button
                  onClick={() => setTradeStock(stock)}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm text-center flex items-center justify-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Invest</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <Modal
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          title={`${selectedStock.name} (${selectedStock.ticker})`}
          subtitle={`Sector: ${selectedStock.sector} • Equity Instrument`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Price Header */}
            <div className="flex justify-between items-baseline p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-2xl font-bold text-fintech-text dark:text-white">
                  {formatINR(selectedStock.currentPrice)}
                </span>
                <span className={`ml-2 text-sm font-semibold ${selectedStock.dailyChangePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {selectedStock.dailyChangePercent >= 0 ? '+' : ''}{selectedStock.dailyChangePercent.toFixed(2)}%
                </span>
              </div>
              <button
                onClick={() => {
                  setTradeStock(selectedStock);
                  setSelectedStock(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors"
              >
                Trade This Stock
              </button>
            </div>

            {/* Simulated 20-Day Chart */}
            <div>
              <h4 className="text-xs font-bold text-fintech-text dark:text-white mb-2 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-fintech-accent" />
                <span>Simulated Price Movement (Last 20 Days)</span>
              </h4>
              <div className="h-48 w-full border border-gray-100 dark:border-fintech-borderDark rounded-xl p-2 bg-white dark:bg-fintech-cardDark">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getSimulatedStockHistory(selectedStock.currentPrice)}>
                    <defs>
                      <linearGradient id="stockDetailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => [formatINR(v), 'Price']} />
                    <Area type="monotone" dataKey="price" stroke="#16A34A" strokeWidth={2} fill="url(#stockDetailGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ratios & Valuation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="text-gray-400 block text-[10px]">52-Week High</span>
                <span className="font-bold text-fintech-text dark:text-white">
                  {formatINR(selectedStock.week52High || 0)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="text-gray-400 block text-[10px]">52-Week Low</span>
                <span className="font-bold text-fintech-text dark:text-white">
                  {formatINR(selectedStock.week52Low || 0)}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="text-gray-400 block text-[10px]">P/E Ratio</span>
                <span className="font-bold text-fintech-text dark:text-white">
                  {selectedStock.peRatio}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Dividend Yield</span>
                <span className="font-bold text-fintech-text dark:text-white">
                  {selectedStock.dividendYield}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              * The C# backend implements an abstract <code>Asset</code> class with a polymorphic <code>Stock.CalculateReturn()</code> method to calculate capital gains and dividend yields cleanly.
            </p>
          </div>
        </Modal>
      )}

      {/* Trade Modal */}
      {tradeStock && (
        <TransactionModal
          isOpen={!!tradeStock}
          onClose={() => setTradeStock(null)}
          initialType="Buy"
          initialTicker={tradeStock.ticker}
        />
      )}
    </div>
  );
};
