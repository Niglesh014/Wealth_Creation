import React, { useState } from 'react';
import { Layers, Search, Shield, PlusCircle, ArrowUpRight } from 'lucide-react';
import { SAMPLE_MUTUAL_FUNDS } from '../data/sampleAssets';
import { usePortfolio } from '../context/PortfolioContext';
import type { AssetMarketData } from '../types';
import { formatINR, formatCompactINR } from '../utils/formatters';
import { TransactionModal } from '../components/transactions/TransactionModal';

export const MutualFundsPage: React.FC = () => {
  const { holdings } = usePortfolio();

  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [investFund, setInvestFund] = useState<AssetMarketData | null>(null);

  const categories = ['All', 'Flexi Cap', 'Large Cap', 'Hybrid', 'Small Cap'];

  const filtered = SAMPLE_MUTUAL_FUNDS.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'All' || f.fundCategory?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'moderate': return 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'high': return 'text-orange-700 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200';
      case 'very high': return 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Mutual Funds
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Actively managed pooled schemes, SIP plans, and category performance
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search mutual fund schemes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-fintech-cardDark border border-fintech-border dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterCategory === c
                ? 'bg-fintech-sidebar text-white dark:bg-slate-700 shadow-sm'
                : 'bg-white dark:bg-fintech-cardDark text-fintech-secondaryText dark:text-gray-300 border border-fintech-border dark:border-fintech-borderDark hover:bg-gray-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Mutual Funds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(fund => {
          const held = holdings.find(h => h.ticker.toUpperCase() === fund.ticker.toUpperCase());

          return (
            <div
              key={fund.id}
              className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-fintech-text dark:text-white">
                      {fund.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Category: <strong>{fund.fundCategory}</strong> • Ticker: {fund.ticker}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRiskColor(fund.riskCategory)}`}>
                    Risk: {fund.riskCategory}
                  </span>
                </div>

                {/* Fund Metrics */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Current NAV</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      {formatINR(fund.nav || fund.currentPrice)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                      +{fund.dailyChangePercent}% (1D)
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Expense Ratio (TER)</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      {fund.expenseRatio}%
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Direct Plan</span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Fund AUM</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      ₹{formatCompactINR(fund.fundAum || 0)} Cr
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Pool Size</span>
                  </div>
                </div>

                {/* Portfolio Holding Banner if user owns this fund */}
                {held && (
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/40 mb-4 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-purple-900 dark:text-purple-300 font-semibold block">Your Holding:</span>
                      <span className="text-gray-500 text-[11px]">{held.quantity} units @ avg {formatINR(held.averagePurchasePrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block">{formatINR(held.currentMarketValue)}</span>
                      <span className="text-emerald-600 font-bold text-[11px]">+{held.returnPercentage}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 dark:border-fintech-borderDark flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Polymorphic NAV Calculation
                </span>
                <button
                  onClick={() => setInvestFund(fund)}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start SIP / Invest</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invest Modal */}
      {investFund && (
        <TransactionModal
          isOpen={!!investFund}
          onClose={() => setInvestFund(null)}
          initialType="Buy"
          initialTicker={investFund.ticker}
        />
      )}
    </div>
  );
};
