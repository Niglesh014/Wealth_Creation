import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { FinancialGoal } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { GoalModal } from '../components/goals/GoalModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleEdit = (g: FinancialGoal) => {
    setEditingGoal(g);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await addGoal(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId !== null) {
      await deleteGoal(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentSavings, 0);
  const totalProgress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Financial Goals & Milestones
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Plan, monitor, and fund life goals with automated monthly savings requirements
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Aggregate Goals Progress Banner */}
      <div className="bg-white dark:bg-fintech-cardDark p-6 rounded-2xl border border-fintech-border dark:border-fintech-borderDark shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
              Overall Wealth Objectives Progress
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-fintech-text dark:text-white">
                {formatINR(totalSaved)}
              </span>
              <span className="text-sm font-medium text-gray-400">
                of {formatINR(totalTarget)} target
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-fintech-accent dark:text-emerald-400 text-lg">
              {totalProgress.toFixed(1)}% Achieved
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Disclaimers */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-fintech-borderDark flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <ShieldAlert className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>
          <strong>Note:</strong> Required monthly savings are estimated projections based on constant linear funding and do not guarantee market returns or inflation adjustments.
        </span>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map(goal => {
          const isComplete = goal.progressPercentage >= 100;

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header & Category */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-fintech-text dark:text-white mt-2">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      title="Edit Goal"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(goal.id)}
                      title="Delete Goal"
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Numbers */}
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Saved so far</span>
                    <span className="text-lg font-bold text-fintech-text dark:text-white">
                      {formatINR(goal.currentSavings)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Target</span>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-bold text-fintech-accent dark:text-emerald-400">
                      {goal.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? 'bg-emerald-500' : 'bg-fintech-accent'
                      }`}
                      style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Estimated Monthly Savings & Deadline */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">Monthly SIP Needed:</span>
                    <span className="font-bold text-fintech-text dark:text-white">
                      {isComplete ? 'Goal Met!' : `${formatINR(goal.estimatedMonthlySavings)} / mo`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">Target Date:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      {formatDate(goal.targetDate, 'short')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-fintech-borderDark mt-3 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">
                  Remaining: <strong>{formatINR(goal.remainingAmount)}</strong>
                </span>
                {isComplete && (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingGoal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Financial Goal"
        message="Are you sure you want to remove this financial goal? Your historical transaction and savings data will remain intact."
        confirmText="Delete Goal"
        isDestructive={true}
      />
    </div>
  );
};
