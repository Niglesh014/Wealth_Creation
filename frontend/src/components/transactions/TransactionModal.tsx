import React, { useState } from 'react';
import type { TransactionType } from '../../types';
import { Modal } from '../common/Modal';
import { ALL_SAMPLE_ASSETS } from '../../data/sampleAssets';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatINR } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  initialTicker?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'Buy',
  initialTicker = ''
}) => {
  const { holdings, recordTransaction } = usePortfolio();

  const [type, setType] = useState<TransactionType>(initialType);
  const [ticker, setTicker] = useState<string>(initialTicker);
  const [assetName, setAssetName] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('Stock');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(1000);
  const [fees, setFees] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleTickerChange = (val: string) => {
    const clean = val.toUpperCase();
    setTicker(clean);

    const asset = ALL_SAMPLE_ASSETS.find(a => a.ticker === clean);
    if (asset) {
      setAssetName(asset.name);
      setAssetType(asset.assetType);
      setPrice(asset.currentPrice);
    }
  };

  const ownedUnits = holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase())?.quantity || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== 'Deposit' && type !== 'Withdrawal' && !ticker.trim()) {
      setError('Ticker symbol is required.');
      return;
    }

    if ((type === 'Buy' || type === 'Sell') && quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (type === 'Sell' && quantity > ownedUnits) {
      setError(`Cannot sell ${quantity} units. You only own ${ownedUnits} units of ${ticker}.`);
      return;
    }

    if (price < 0) {
      setError('Price or amount must be positive.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await recordTransaction({
        transactionType: type,
        ticker: type === 'Deposit' || type === 'Withdrawal' ? 'CASH' : ticker.trim().toUpperCase(),
        assetName: type === 'Deposit' || type === 'Withdrawal' ? 'Cash Flow' : (assetName || ticker),
        assetType: type === 'Deposit' || type === 'Withdrawal' ? 'Cash' : assetType,
        quantity: type === 'Deposit' || type === 'Withdrawal' ? 1 : quantity,
        price,
        totalAmount: (quantity * price) + fees,
        fees,
        transactionDate: date,
        notes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const totalCalculated = (quantity * price) + (fees || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Financial Transaction"
      subtitle="Execute trade, deposit/withdraw cash, or record corporate actions"
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
            Transaction Type *
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value as TransactionType)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
          >
            <option value="Buy">Buy Asset</option>
            <option value="Sell">Sell Asset</option>
            <option value="Dividend">Dividend Payout</option>
            <option value="Interest">Bond Interest Income</option>
            <option value="Deposit">Deposit Cash</option>
            <option value="Withdrawal">Withdraw Cash</option>
          </select>
        </div>

        {type !== 'Deposit' && type !== 'Withdrawal' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Asset Ticker *
              </label>
              <input
                type="text"
                value={ticker}
                onChange={e => handleTickerChange(e.target.value)}
                placeholder="e.g. TCS, INFY"
                required
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
              />
              {type === 'Sell' && (
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Currently owned: <strong className="text-fintech-text dark:text-white">{ownedUnits}</strong> units
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Asset Class
              </label>
              <select
                value={assetType}
                onChange={e => setAssetType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
              >
                <option value="Stock">Stock</option>
                <option value="Bond">Bond</option>
                <option value="MutualFund">Mutual Fund</option>
                <option value="ETF">ETF</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type !== 'Deposit' && type !== 'Withdrawal' && (
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
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {type === 'Deposit' || type === 'Withdrawal' ? 'Total Amount (₹) *' : 'Execution Price (₹) *'}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Brokerage / Fees (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fees}
              onChange={e => setFees(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>
        </div>

        {/* Calculated Total Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-fintech-borderDark flex justify-between items-center text-xs">
          <span className="text-fintech-secondaryText dark:text-gray-400 font-medium">Net Transaction Impact:</span>
          <span className="text-base font-bold text-fintech-text dark:text-white">
            {formatINR(totalCalculated)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Notes / Reference
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. SIP installment, quarterly dividend"
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
            {loading ? 'Recording...' : 'Execute Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
