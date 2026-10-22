import React, { useState } from 'react';
import {
  Landmark,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Calendar,
  Percent,
  Plus
} from 'lucide-react';
import { SAMPLE_BONDS } from '../data/sampleAssets';
import type { AssetMarketData } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { BondCalculatorModal } from '../components/bonds/BondCalculatorModal';
import { TransactionModal } from '../components/transactions/TransactionModal';

export const BondsPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeCalculatorBond, setActiveCalculatorBond] = useState<AssetMarketData | null>(null);
  const [investBond, setInvestBond] = useState<AssetMarketData | null>(null);
  const [isGeneralCalculatorOpen, setIsGeneralCalculatorOpen] = useState<boolean>(false);

  const categories = ['All', 'Government', 'Corporate', 'Senior Secured', 'Senior Unsecured'];

  const filteredBonds = SAMPLE_BONDS.filter(b => {
    if (filterCategory === 'All') return true;
    return b.bondCategory?.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fintech-text dark:text-white tracking-tight">
            Fixed Income & Bonds
          </h1>
          <p className="text-xs text-fintech-secondaryText dark:text-gray-400 mt-0.5">
            Sovereign government debt, corporate debentures, and high-yield structured bonds
          </p>
        </div>

        <button
          onClick={() => setIsGeneralCalculatorOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Calculator className="w-4 h-4" />
          <span>Launch Bond Calculator</span>
        </button>
      </div>

      {/* Disclaimers Banner */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Fixed-Income Risk & Return Clarifications:</p>
          <p className="text-[11px] leading-relaxed">
            Coupon payouts generate periodic cash flow but are not identical to total investment return. Credit ratings indicate creditworthiness at appraisal time and do not eliminate default risk. All bonds and yields are illustrative simulated data for platform demonstration.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
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

      {/* Bonds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBonds.map(bond => {
          const annualInterest = ((bond.faceValue || 10000) * (bond.couponRate || 7.5)) / 100;

          return (
            <div
              key={bond.id}
              className="bg-white dark:bg-fintech-cardDark rounded-2xl p-6 border border-fintech-border dark:border-fintech-borderDark shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base text-fintech-text dark:text-white">
                        {bond.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                        {bond.bondCategory}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Issuer: <strong>{bond.issuer}</strong> • Ticker: {bond.ticker}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {bond.creditRating}
                  </span>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Coupon Rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {bond.couponRate}% p.a.
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Face Value</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      {formatINR(bond.faceValue || 10000)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Frequency</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      {bond.interestFrequency}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[10px] block">Maturity Date</span>
                    <span className="font-bold text-fintech-text dark:text-white text-sm">
                      {formatDate(bond.maturityDate || '', 'short')}
                    </span>
                  </div>
                </div>

                {/* Yield Estimation Preview */}
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-4 flex justify-between items-center px-1">
                  <span>Annual coupon income per bond unit:</span>
                  <span className="font-bold text-fintech-text dark:text-white">
                    {formatINR(annualInterest)} / year
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-fintech-borderDark">
                <button
                  onClick={() => setActiveCalculatorBond(bond)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-500" />
                  <span>Calculate Yield</span>
                </button>
                <button
                  onClick={() => setInvestBond(bond)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-white bg-fintech-accent hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invest in Bond</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bond Calculator Modals */}
      {activeCalculatorBond && (
        <BondCalculatorModal
          isOpen={!!activeCalculatorBond}
          onClose={() => setActiveCalculatorBond(null)}
          defaultPrincipal={activeCalculatorBond.faceValue || 100000}
          defaultRate={activeCalculatorBond.couponRate || 7.5}
          defaultFrequency={activeCalculatorBond.interestFrequency || 'Annual'}
          bondName={activeCalculatorBond.name}
        />
      )}

      {isGeneralCalculatorOpen && (
        <BondCalculatorModal
          isOpen={isGeneralCalculatorOpen}
          onClose={() => setIsGeneralCalculatorOpen(false)}
        />
      )}

      {/* Invest Dialog */}
      {investBond && (
        <TransactionModal
          isOpen={!!investBond}
          onClose={() => setInvestBond(null)}
          initialType="Buy"
          initialTicker={investBond.ticker}
        />
      )}
    </div>
  );
};
