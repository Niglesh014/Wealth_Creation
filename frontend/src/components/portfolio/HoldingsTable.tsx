import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react';
import type { Investment } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';

interface HoldingsTableProps {
  holdings: Investment[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  onEdit,
  onDelete,
  onAddNew
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('marketValue_desc');

  // Filtering
  const filtered = holdings.filter(item => {
    const matchesSearch =
      item.assetName.toLowerCase().includes(search.toLowerCase()) ||
      item.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'All' || item.assetType.toLowerCase() === filterClass.toLowerCase();
    return matchesSearch && matchesClass;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'marketValue_desc':
        return b.currentMarketValue - a.currentMarketValue;
      case 'marketValue_asc':
        return a.currentMarketValue - b.currentMarketValue;
      case 'profitLoss_desc':
        return b.unrealizedProfitLoss - a.unrealizedProfitLoss;
      case 'profitLoss_asc':
        return a.unrealizedProfitLoss - b.unrealizedProfitLoss;
      case 'return_desc':
        return b.returnPercentage - a.returnPercentage;
      case 'return_asc':
        return a.returnPercentage - b.returnPercentage;
      case 'name_asc':
        return a.assetName.localeCompare(b.assetName);
      default:
        return b.currentMarketValue - a.currentMarketValue;
    }
  });

  const getAssetBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'bond':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900';
      case 'mutualfund':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'etf':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-gray-100 dark:border-fintech-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset or ticker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Asset Class Filter */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent text-fintech-text dark:text-gray-200"
          >
            <option value="All">All Asset Classes</option>
            <option value="Stock">Stocks</option>
            <option value="Bond">Bonds</option>
            <option value="MutualFund">Mutual Funds</option>
            <option value="ETF">ETFs</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent text-fintech-text dark:text-gray-200"
          >
            <option value="marketValue_desc">Highest Market Value</option>
            <option value="marketValue_asc">Lowest Market Value</option>
            <option value="profitLoss_desc">Highest Profit</option>
            <option value="profitLoss_asc">Lowest Profit/Loss</option>
            <option value="return_desc">Highest Return %</option>
            <option value="return_asc">Lowest Return %</option>
            <option value="name_asc">Asset Name (A-Z)</option>
          </select>

          <button
            onClick={onAddNew}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-fintech-secondaryText dark:text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-fintech-borderDark">
              <th className="py-3.5 px-5">Asset</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Qty</th>
              <th className="py-3.5 px-4 text-right">Avg Price</th>
              <th className="py-3.5 px-4 text-right">Current Price</th>
              <th className="py-3.5 px-4 text-right">Total Invested</th>
              <th className="py-3.5 px-4 text-right">Market Value</th>
              <th className="py-3.5 px-4 text-right">Unrealized P/L</th>
              <th className="py-3.5 px-4 text-right">Return %</th>
              <th className="py-3.5 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-fintech-borderDark">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400">
                  No investments match your search criteria.
                </td>
              </tr>
            ) : (
              sorted.map(holding => {
                const isPositive = holding.unrealizedProfitLoss >= 0;
                return (
                  <tr
                    key={holding.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-fintech-text dark:text-white text-sm">
                        {holding.ticker}
                      </div>
                      <div className="text-[11px] text-fintech-secondaryText dark:text-gray-400 line-clamp-1">
                        {holding.assetName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getAssetBadgeClass(holding.assetType)}`}>
                        {holding.assetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-fintech-text dark:text-gray-200">
                      {holding.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-fintech-text dark:text-gray-200">
                      {formatINR(holding.averagePurchasePrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-fintech-text dark:text-white">
                      {formatINR(holding.currentMarketPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-fintech-secondaryText dark:text-gray-300">
                      {formatINR(holding.totalInvested)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-fintech-text dark:text-white text-sm">
                      {formatINR(holding.currentMarketValue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">
                      <span className={`inline-flex items-center ${isPositive ? 'text-fintech-positive dark:text-emerald-400' : 'text-fintech-negative dark:text-rose-400'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {formatINR(holding.unrealizedProfitLoss, true)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}>
                        {formatPercent(holding.returnPercentage)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onEdit(holding)}
                          title="Edit Holding"
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(holding.id)}
                          title="Delete Holding"
                          className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
