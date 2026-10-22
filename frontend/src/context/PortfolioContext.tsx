import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Investment,
  Transaction,
  FinancialGoal,
  DashboardSummary,
  AllocationItem,
  ToastMessage
} from '../types';
import { api } from '../services/api';

interface PortfolioContextType {
  holdings: Investment[];
  cash: number;
  transactions: Transaction[];
  goals: FinancialGoal[];
  summary: DashboardSummary | null;
  allocation: AllocationItem[];
  watchlistTickers: string[];
  toasts: ToastMessage[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addHolding: (inv: Partial<Investment>) => Promise<void>;
  updateHolding: (id: number, inv: Partial<Investment>) => Promise<void>;
  deleteHolding: (id: number) => Promise<void>;
  recordTransaction: (txn: Omit<Transaction, 'id' | 'portfolioId' | 'status'>) => Promise<void>;
  toggleWatchlist: (ticker: string) => Promise<boolean>;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'userId' | 'remainingAmount' | 'progressPercentage' | 'estimatedMonthlySavings' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: number, data: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [holdings, setHoldings] = useState<Investment[]>([]);
  const [cash, setCash] = useState<number>(50000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invs, txns, gList, sum, alloc, watch] = await Promise.all([
        api.getInvestments(),
        api.getTransactions(),
        api.getGoals(),
        api.getDashboardSummary(),
        api.getAssetAllocation(),
        api.getWatchlist()
      ]);

      setHoldings(invs);
      setTransactions(txns);
      setGoals(gList);
      setSummary(sum);
      setCash(sum.availableCash);
      setAllocation(alloc);
      setWatchlistTickers(watch.map(w => w.ticker.toUpperCase()));
    } catch (err: any) {
      showToast(err.message || 'Failed to load portfolio data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addHolding = async (inv: Partial<Investment>) => {
    try {
      await api.addInvestment(inv);
      await refreshData();
      showToast(`Successfully added ${inv.ticker || inv.assetName} to portfolio!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error adding investment', 'error');
      throw err;
    }
  };

  const updateHolding = async (id: number, inv: Partial<Investment>) => {
    try {
      await api.updateInvestment(id, inv);
      await refreshData();
      showToast('Holding updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating investment', 'error');
      throw err;
    }
  };

  const deleteHolding = async (id: number) => {
    try {
      await api.deleteInvestment(id);
      await refreshData();
      showToast('Holding removed from portfolio.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error deleting investment', 'error');
      throw err;
    }
  };

  const recordTransaction = async (txn: Omit<Transaction, 'id' | 'portfolioId' | 'status'>) => {
    try {
      await api.recordTransaction(txn);
      await refreshData();
      showToast(`Transaction recorded: ${txn.transactionType} ${txn.ticker}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to record transaction', 'error');
      throw err;
    }
  };

  const toggleWatchlist = async (ticker: string): Promise<boolean> => {
    try {
      const added = await api.toggleWatchlist(ticker);
      setWatchlistTickers(prev =>
        added ? [...prev, ticker.toUpperCase()] : prev.filter(t => t !== ticker.toUpperCase())
      );
      showToast(
        added ? `Added ${ticker} to your watchlist` : `Removed ${ticker} from your watchlist`,
        'info'
      );
      return added;
    } catch (err: any) {
      showToast(err.message || 'Error updating watchlist', 'error');
      return false;
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'userId' | 'remainingAmount' | 'progressPercentage' | 'estimatedMonthlySavings' | 'createdAt'>) => {
    try {
      await api.createGoal(goal);
      await refreshData();
      showToast(`Financial goal "${goal.title}" created!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error creating goal', 'error');
      throw err;
    }
  };

  const updateGoal = async (id: number, data: Partial<FinancialGoal>) => {
    try {
      await api.updateGoal(id, data);
      await refreshData();
      showToast('Financial goal updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating goal', 'error');
      throw err;
    }
  };

  const deleteGoal = async (id: number) => {
    try {
      await api.deleteGoal(id);
      await refreshData();
      showToast('Goal removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error deleting goal', 'error');
      throw err;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        cash,
        transactions,
        goals,
        summary,
        allocation,
        watchlistTickers,
        toasts,
        isLoading,
        refreshData,
        addHolding,
        updateHolding,
        deleteHolding,
        recordTransaction,
        toggleWatchlist,
        addGoal,
        updateGoal,
        deleteGoal,
        showToast,
        removeToast
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
