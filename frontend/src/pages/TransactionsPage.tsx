import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatINR, formatDate } from '../utils/formatters';
import { TransactionModal } from '../components/transactions/TransactionModal';
import type { TransactionType } from '../types';

export const TransactionsPage: React.FC = () => {
  const { transactions } = usePortfolio();

  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.assetName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticker.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toString().includes(search);
    const matchesType = filterType === 'All' || t.transactionType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Calculate totals
  let totalBuys = 0, totalSells = 0, totalDividends = 0, totalInterest = 0;
  for (const t of transactions) {
    if (t.transactionType === 'Buy') totalBuys += t.totalAmount;
    else if (t.transactionType === 'Sell') totalSells += t.totalAmount;
    else if (t.transactionType === 'Dividend') totalDividends += t.totalAmount;
    else if (t.transactionType === 'Interest') totalInterest += t.totalAmount;
  }

  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Asset Name', 'Ticker', 'Asset Class', 'Quantity', 'Price (INR)', 'Fees (INR)', 'Total Amount (INR)', 'Status', 'Notes'];
    const rows = filtered.map(t => [
      t.id,
      t.transactionDate,
      t.transactionType,
      `"${t.assetName.replace(/"/g, '""')}"`,
      t.ticker,
      t.assetType,
      t.quantity,
      t.price.toFixed(2),
      t.fees.toFixed(2),
      t.totalAmount.toFixed(2),
      t.status,
      `"${t.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WealthWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Transaction Activity & Ledger
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Audit trail of buys, sales, corporate dividend payouts, coupon yields, and cash flows
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-fintech-cardDark border border-gray-200 dark:border-fintech-borderDark hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Totals Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Buys</span>
          <span className="text-base font-bold text-fintech-text dark:text-white">{formatINR(totalBuys)}</span>
        </div>
        <div className="p-4 bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Sells</span>
          <span className="text-base font-bold text-fintech-text dark:text-white">{formatINR(totalSells)}</span>
        </div>
        <div className="p-4 bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Dividends Received</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalDividends)}</span>
        </div>
        <div className="p-4 bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Interest Received</span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400">{formatINR(totalInterest)}</span>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white dark:bg-fintech-cardDark rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-fintech-borderDark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by asset, ticker, or txn ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent text-fintech-text dark:text-gray-200"
            >
              <option value="All">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
              <option value="Dividend">Dividend</option>
              <option value="Interest">Interest</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-fintech-secondaryText dark:text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-fintech-borderDark">
                <th className="py-3.5 px-5">Txn ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">Total (INR)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-fintech-borderDark">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-gray-500 text-[11px]">
                      #{t.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-fintech-text dark:text-gray-300">
                      {formatDate(t.transactionDate, 'short')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          t.transactionType === 'Buy'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : t.transactionType === 'Sell'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : t.transactionType === 'Dividend' || t.transactionType === 'Interest'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-fintech-text dark:text-white">
                        {t.ticker}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[160px]">
                        {t.assetName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-fintech-text dark:text-gray-200">
                      {t.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-fintech-text dark:text-gray-200">
                      {formatINR(t.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-fintech-text dark:text-white">
                      {formatINR(t.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 dark:text-gray-400 text-[11px] italic max-w-xs truncate">
                      {t.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
