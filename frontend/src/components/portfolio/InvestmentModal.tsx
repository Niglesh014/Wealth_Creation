import React, { useState, useEffect } from 'react';
import type { Investment, AssetType } from '../../types';
import { Modal } from '../common/Modal';
import { ALL_SAMPLE_ASSETS } from '../../data/sampleAssets';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Partial<Investment>) => Promise<void>;
  initialData?: Investment | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [ticker, setTicker] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [assetType, setAssetType] = useState<AssetType>('Stock');
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTicker(initialData.ticker);
      setAssetName(initialData.assetName);
      setAssetType(initialData.assetType);
      setQuantity(initialData.quantity);
      setPrice(initialData.averagePurchasePrice);
      setDate(initialData.purchaseDate ? initialData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setTicker('');
      setAssetName('');
      setAssetType('Stock');
      setQuantity(10);
      setPrice(1000);
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleTickerChange = (val: string) => {
    const clean = val.toUpperCase();
    setTicker(clean);

    // Auto-fill from catalog if found
    const match = ALL_SAMPLE_ASSETS.find(a => a.ticker.toUpperCase() === clean);
    if (match) {
      setAssetName(match.name);
      setAssetType(match.assetType);
      if (!initialData) {
        setPrice(match.currentPrice);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      setError('Ticker symbol is required.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (price <= 0) {
      setError('Purchase price must be positive.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        ticker: ticker.trim().toUpperCase(),
        assetName: assetName.trim() || ticker.trim().toUpperCase(),
        assetType,
        quantity: Math.floor(quantity),
        averagePurchasePrice: price,
        currentMarketPrice: price,
        purchaseDate: date
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save investment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Investment Holding' : 'Add New Investment'}
      subtitle="Update or deploy new capital into your portfolio"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ticker Symbol *
            </label>
            <input
              type="text"
              value={ticker}
              onChange={e => handleTickerChange(e.target.value)}
              placeholder="e.g. TCS, INFY, NTPC"
              disabled={!!initialData}
              required
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Asset Class *
            </label>
            <select
              value={assetType}
              onChange={e => setAssetType(e.target.value as AssetType)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            >
              <option value="Stock">Stock (Equity)</option>
              <option value="Bond">Bond (Fixed Income)</option>
              <option value="MutualFund">Mutual Fund</option>
              <option value="ETF">ETF (Exchange-Traded)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Company / Asset Name
          </label>
          <input
            type="text"
            value={assetName}
            onChange={e => setAssetName(e.target.value)}
            placeholder="e.g. Tata Consultancy Services"
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Quantity (Units) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              required
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Avg Purchase Price (₹) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={e => setPrice(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          />
        </div>

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
            {loading ? 'Saving...' : initialData ? 'Update Holding' : 'Add Investment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
