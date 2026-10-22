import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { InvestmentModal } from '../components/portfolio/InvestmentModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import type { Investment } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

export const PortfolioPage: React.FC = () => {
  const { holdings, summary, addHolding, updateHolding, deleteHolding } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleEdit = (inv: Investment) => {
    setEditingItem(inv);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId !== null) {
      await deleteHolding(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (data: Partial<Investment>) => {
    if (editingItem) {
      await updateHolding(editingItem.id, data);
    } else {
      await addHolding(data);
    }
  };

  const isPlPos = (summary?.totalProfitLoss || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            My Portfolio
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Manage your holdings, analyze returns, and maintain multi-asset investments
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Investment</span>
        </button>
      </div>

      {/* Mini Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-fintech-cardDark p-4 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Invested Capital
            </span>
            <span className="text-lg font-bold text-fintech-text dark:text-white">
              {formatINR(summary?.totalInvestment || 0)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-fintech-cardDark p-4 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Current Market Value
            </span>
            <span className="text-lg font-bold text-fintech-text dark:text-white">
              {formatINR((summary?.totalPortfolioValue || 0) - (summary?.availableCash || 0))}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-fintech-cardDark p-4 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isPlPos ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              Unrealized Returns
            </span>
            <span className={`text-lg font-bold ${isPlPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatINR(summary?.totalProfitLoss || 0, true)} ({formatPercent(summary?.percentageReturn || 0)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Holdings Table */}
      <HoldingsTable
        holdings={holdings}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
        onAddNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
      />

      {/* Modals */}
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Investment Holding"
        message="Are you sure you want to remove this asset from your portfolio? This action cannot be undone."
        confirmText="Delete Holding"
        isDestructive={true}
      />
    </div>
  );
};
