import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowLeftRight,
  Calculator,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { StatCard } from '../components/common/StatCard';
import { PerformanceLineChart } from '../components/charts/PerformanceLineChart';
import { AllocationDonutChart } from '../components/charts/AllocationDonutChart';
import { InvestmentModal } from '../components/portfolio/InvestmentModal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { BondCalculatorModal } from '../components/bonds/BondCalculatorModal';
import { formatINR, formatPercent, formatDate } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, holdings, transactions, allocation, addHolding } = usePortfolio();

  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState<boolean>(false);
  const [isRecordTxnOpen, setIsRecordTxnOpen] = useState<boolean>(false);
  const [isBondCalcOpen, setIsBondCalcOpen] = useState<boolean>(false);

  // Top 4 holdings
  const topHoldings = [...holdings]
    .sort((a, b) => b.currentMarketValue - a.currentMarketValue)
    .slice(0, 4);

  // Recent 5 transactions
  const recentTxns = transactions.slice(0, 5);

  const isTotalPlPositive = (summary?.totalProfitLoss || 0) >= 0;
  const isTodayPlPositive = (summary?.todayProfitLoss || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Real-time multi-asset wealth valuation, profit metrics, and asset allocations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBondCalcOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-fintech-cardDark border border-gray-200 dark:border-fintech-borderDark hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-500" />
            <span>Bond Calculator</span>
          </button>

          <button
            onClick={() => setIsRecordTxnOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-fintech-cardDark border border-gray-200 dark:border-fintech-borderDark hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Record Trade</span>
          </button>

          <button
            onClick={() => setIsAddInvestmentOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holding</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards (Section 5.A) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Portfolio Value */}
        <StatCard
          title="Total Portfolio Value"
          value={formatINR(summary?.totalPortfolioValue || 0)}
          change={`${isTotalPlPositive ? '+' : ''}${formatINR(summary?.totalProfitLoss || 0)} (${formatPercent(summary?.percentageReturn || 0)})`}
          isPositive={isTotalPlPositive}
          subtext="Total return"
          icon={<Wallet className="w-5 h-5" />}
        />

        {/* 2. Total Investment */}
        <StatCard
          title="Total Invested"
          value={formatINR(summary?.totalInvestment || 0)}
          subtext={`${holdings.length} Active Positions`}
          icon={<PiggyBank className="w-5 h-5" />}
        />

        {/* 3. Today's Profit / Loss */}
        <StatCard
          title="Today's Profit / Loss"
          value={formatINR(summary?.todayProfitLoss || 0, true)}
          change={formatPercent(summary?.todayPercentageChange || 0)}
          isPositive={isTodayPlPositive}
          subtext="Daily market change"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        {/* 4. Available Cash */}
        <StatCard
          title="Available Cash"
          value={formatINR(summary?.availableCash || 0)}
          subtext="Ready to deploy"
          icon={<Coins className="w-5 h-5" />}
        />
      </div>

      {/* Charts Section: Performance Line Chart & Asset Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceLineChart initialRange="1M" />
        </div>
        <div>
          <AllocationDonutChart allocation={allocation} />
        </div>
      </div>

      {/* Two Column Grid: Top Holdings & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings Card */}
        <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-fintech-text dark:text-white">
                  Top Holdings
                </h3>
                <p className="text-xs text-fintech-secondaryText dark:text-gray-400">
                  Largest capital allocations in your portfolio
                </p>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                className="flex items-center space-x-1 text-xs font-semibold text-fintech-secondary dark:text-blue-400 hover:underline"
              >
                <span>View All Holdings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-fintech-borderDark">
              {topHoldings.map(h => {
                const isPos = h.unrealizedProfitLoss >= 0;
                return (
                  <div key={h.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-fintech-text dark:text-gray-200">
                        {h.ticker.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-fintech-text dark:text-white">
                            {h.ticker}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                            {h.assetType}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {h.quantity} units @ {formatINR(h.averagePurchasePrice)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-fintech-text dark:text-white block">
                        {formatINR(h.currentMarketValue)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center justify-end ${
                          isPos ? 'text-fintech-positive dark:text-emerald-400' : 'text-fintech-negative dark:text-rose-400'
                        }`}
                      >
                        {isPos ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {formatPercent(h.returnPercentage)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-fintech-text dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-fintech-secondaryText dark:text-gray-400">
                  Latest buys, sales, dividends, and interest payouts
                </p>
              </div>
              <button
                onClick={() => navigate('/transactions')}
                className="flex items-center space-x-1 text-xs font-semibold text-fintech-secondary dark:text-blue-400 hover:underline"
              >
                <span>All Transactions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-fintech-borderDark">
              {recentTxns.map(t => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <p className="font-semibold text-xs text-fintech-text dark:text-white">
                        {t.ticker}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatDate(t.transactionDate, 'short')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-fintech-text dark:text-white block">
                      {formatINR(t.totalAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-end">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvestmentModal
        isOpen={isAddInvestmentOpen}
        onClose={() => setIsAddInvestmentOpen(false)}
        onSave={addHolding}
      />

      <TransactionModal
        isOpen={isRecordTxnOpen}
        onClose={() => setIsRecordTxnOpen(false)}
      />

      <BondCalculatorModal
        isOpen={isBondCalcOpen}
        onClose={() => setIsBondCalcOpen(false)}
      />
    </div>
  );
};
