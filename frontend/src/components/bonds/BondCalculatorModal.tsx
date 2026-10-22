import React, { useState } from 'react';
import { Calculator, Info, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { formatINR } from '../../utils/formatters';

interface BondCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrincipal?: number;
  defaultRate?: number;
  defaultFrequency?: string;
  bondName?: string;
}

export const BondCalculatorModal: React.FC<BondCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultPrincipal = 100000,
  defaultRate = 7.5,
  defaultFrequency = 'Annual',
  bondName
}) => {
  const [principal, setPrincipal] = useState<number>(defaultPrincipal);
  const [rate, setRate] = useState<number>(defaultRate);
  const [frequency, setFrequency] = useState<string>(defaultFrequency);
  const [years, setYears] = useState<number>(5);

  const result = api.calculateBondYield({
    principalAmount: principal,
    annualCouponRate: rate,
    paymentFrequency: frequency,
    durationYears: years
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bondName ? `Bond Yield Calculator: ${bondName}` : 'Fixed-Income Yield & Coupon Calculator'}
      subtitle="Estimate periodic interest cash flows and maturity outcomes"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Principal Investment Amount (₹)
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={principal}
              onChange={e => setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Annual Coupon Rate (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="25"
              step="0.05"
              value={rate}
              onChange={e => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Coupon Payout Frequency
            </label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            >
              <option value="Annual">Annual (1 payout/yr)</option>
              <option value="Semi-Annual">Semi-Annual (2 payouts/yr)</option>
              <option value="Quarterly">Quarterly (4 payouts/yr)</option>
              <option value="Monthly">Monthly (12 payouts/yr)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Holding Duration (Years)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-fintech-borderDark rounded-xl focus:outline-none focus:ring-2 focus:ring-fintech-accent"
            />
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-fintech-borderDark">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Per Period Payment
            </span>
            <span className="text-base font-bold text-fintech-accent dark:text-emerald-400">
              {formatINR(result.periodicCouponPayment)}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">({frequency})</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-fintech-borderDark">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Annual Coupon Income
            </span>
            <span className="text-base font-bold text-fintech-text dark:text-white">
              {formatINR(result.annualCouponIncome)}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">per year</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-fintech-borderDark">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Total Interest ({years} Yrs)
            </span>
            <span className="text-base font-bold text-fintech-secondary dark:text-blue-400">
              {formatINR(result.totalCouponIncome)}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">cumulative</span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block mb-1">
              Total Estimated Payout
            </span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              {formatINR(result.maturityValue)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Principal + Interest</span>
          </div>
        </div>

        {/* Regulatory & Risk Disclaimers */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 space-y-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">Important Regulatory & Financial Disclosures:</p>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-amber-800 dark:text-amber-300">
            <li>Coupon income is <strong>not the same</strong> as total investment return (capital appreciation or depreciation may occur).</li>
            <li>Credit ratings (e.g., AAA, AA+) denote credit appraisal at issuance and <strong>do not eliminate default risk</strong>.</li>
            <li>All rates, prices, and yields shown are <strong>illustrative simulated data</strong> for educational demonstration and do not guarantee future returns.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </Modal>
  );
};
