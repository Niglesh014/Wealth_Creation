import React, { useState, useEffect } from 'react';
import type { FinancialGoal } from '../../types';
import { Modal } from '../common/Modal';
import { formatINR } from '../../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: any) => Promise<void>;
  initialData?: FinancialGoal | null;
}

const CATEGORIES = [
  'Emergency Fund',
  'House',
  'Education',
  'Vehicle',
  'Wealth Creation',
  'Retirement',
  'Vacation'
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [currentSavings, setCurrentSavings] = useState<number>(100000);
  const [targetDate, setTargetDate] = useState<string>('2028-12-31');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setTargetAmount(initialData.targetAmount);
      setCurrentSavings(initialData.currentSavings);
      setTargetDate(initialData.targetDate ? initialData.targetDate.split('T')[0] : '2028-12-31');
    } else {
      setTitle('');
      setCategory('Emergency Fund');
      setTargetAmount(500000);
      setCurrentSavings(50000);
      setTargetDate('2028-12-31');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        category,
        targetAmount,
        currentSavings: Math.max(0, currentSavings),
        targetDate
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, targetAmount - currentSavings);
  const progress = Math.min(100, Math.round((currentSavings / targetAmount) * 1000) / 10 || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Financial Milestone' : 'Set New Financial Goal'}
      subtitle="Define target objectives and calculate estimated monthly savings"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Goal Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Higher Education Fund, Dream House Down Payment"
            required
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Goal Category *
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Amount (₹) *
            </label>
            <input
              type="number"
              min="1000"
              step="10000"
              value={targetAmount}
              onChange={e => setTargetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              required
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Current Savings (₹)
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={currentSavings}
              onChange={e => setCurrentSavings(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Target Completion Date *
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          />
        </div>

        {/* Progress Preview */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-fintech-borderDark text-xs space-y-2">
          <div className="flex justify-between font-medium">
            <span className="text-gray-500 dark:text-gray-400">Current Progress:</span>
            <span className="font-bold text-fintech-accent dark:text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-fintech-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
            <span>Remaining: {formatINR(remaining)}</span>
            <span>Target: {formatINR(targetAmount)}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 italic">
          * Monthly savings projections are estimated calculations, not guaranteed financial results.
        </p>

        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
