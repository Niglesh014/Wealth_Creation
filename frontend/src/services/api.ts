import type {
  Investment,
  Transaction,
  FinancialGoal,
  AssetMarketData,
  DashboardSummary,
  AllocationItem,
  PerformancePoint,
  TopHolding,
  UserProfile,
  BondCalculationParams,
  BondCalculationOutcome
} from '../types';
import { ALL_SAMPLE_ASSETS } from '../data/sampleAssets';
import {
  loadStoredHoldings,
  saveStoredHoldings,
  loadStoredCash,
  saveStoredCash,
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredGoals,
  saveStoredGoals,
  loadStoredWatchlist,
  saveStoredWatchlist,
  loadStoredUser,
  saveStoredUser
} from './storage';
import { calculateBondCoupon } from '../utils/calculations';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to attempt fetch from backend; returns null if offline or error occurs.
 */
async function tryFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s quick probe

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
    return null;
  } catch {
    return null;
  }
}

export const api = {
  // --- DASHBOARD ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    const remote = await tryFetch<DashboardSummary>('/dashboard/summary');
    if (remote) return remote;

    // Local calculation from stored data
    const holdings = loadStoredHoldings();
    const cash = loadStoredCash();

    let totalInvested = 0;
    let totalHoldingsVal = 0;
    let todayPL = 0;

    for (const h of holdings) {
      totalInvested += h.quantity * h.averagePurchasePrice;
      totalHoldingsVal += h.quantity * h.currentMarketPrice;
      todayPL += h.quantity * (h.dailyChange || 0);
    }

    const totalPortfolioValue = totalHoldingsVal + cash;
    const totalProfitLoss = totalHoldingsVal - totalInvested;
    const percentageReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const previousPortfolioVal = totalPortfolioValue - todayPL;
    const todayPct = previousPortfolioVal > 0 ? (todayPL / previousPortfolioVal) * 100 : 0;

    return {
      totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
      totalInvestment: Math.round(totalInvested * 100) / 100,
      totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
      percentageReturn: Math.round(percentageReturn * 100) / 100,
      todayProfitLoss: Math.round(todayPL * 100) / 100,
      todayPercentageChange: Math.round(todayPct * 100) / 100,
      availableCash: Math.round(cash * 100) / 100,
      currency: 'INR',
      asOfDate: new Date().toISOString()
    };
  },

  async getPerformanceHistory(range: string = '1M'): Promise<PerformancePoint[]> {
    const remote = await tryFetch<PerformancePoint[]>(`/dashboard/performance?range=${range}`);
    if (remote) return remote;

    const summary = await this.getDashboardSummary();
    const pointsCount = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 45 : range === '6M' ? 60 : range === '1Y' ? 52 : 70;
    const points: PerformancePoint[] = [];
    const now = new Date();
    const startVal = summary.totalPortfolioValue * (range === '1W' ? 0.985 : range === '1M' ? 0.94 : range === '3M' ? 0.89 : 0.84);
    const step = (summary.totalPortfolioValue - startVal) / pointsCount;

    for (let i = 0; i <= pointsCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (pointsCount - i));
      const jitter = (Math.sin(i * 1.5) + Math.cos(i * 0.8)) * (step * 0.4);
      const val = i === pointsCount ? summary.totalPortfolioValue : Math.max(summary.totalInvestment * 0.9, startVal + (step * i) + jitter);

      points.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: Math.round(val * 100) / 100,
        invested: summary.totalInvestment,
        profitLoss: Math.round((val - summary.totalInvestment) * 100) / 100
      });
    }

    return points;
  },

  async getAssetAllocation(): Promise<AllocationItem[]> {
    const remote = await tryFetch<AllocationItem[]>('/dashboard/allocation');
    if (remote) return remote;

    const holdings = loadStoredHoldings();
    const cash = loadStoredCash();

    let stocks = 0, bonds = 0, mf = 0, etfs = 0;

    for (const h of holdings) {
      const val = h.quantity * h.currentMarketPrice;
      if (h.assetType === 'Stock') stocks += val;
      else if (h.assetType === 'Bond') bonds += val;
      else if (h.assetType === 'MutualFund') mf += val;
      else if (h.assetType === 'ETF') etfs += val;
      else stocks += val;
    }

    const total = stocks + bonds + mf + etfs + cash || 1;

    return [
      { category: 'Stocks', value: Math.round(stocks), percentage: Math.round((stocks / total) * 1000) / 10, color: '#2563EB' },
      { category: 'Bonds', value: Math.round(bonds), percentage: Math.round((bonds / total) * 1000) / 10, color: '#0D9488' },
      { category: 'Mutual Funds', value: Math.round(mf), percentage: Math.round((mf / total) * 1000) / 10, color: '#8B5CF6' },
      { category: 'ETFs', value: Math.round(etfs), percentage: Math.round((etfs / total) * 1000) / 10, color: '#F59E0B' },
      { category: 'Cash', value: Math.round(cash), percentage: Math.round((cash / total) * 1000) / 10, color: '#10B981' }
    ];
  },

  async getTopHoldings(limit: number = 5): Promise<TopHolding[]> {
    const remote = await tryFetch<TopHolding[]>(`/dashboard/top-holdings?limit=${limit}`);
    if (remote) return remote;

    const holdings = loadStoredHoldings();
    return holdings
      .map(h => ({
        id: h.id,
        assetName: h.assetName,
        ticker: h.ticker,
        assetType: h.assetType,
        quantity: h.quantity,
        averagePurchasePrice: h.averagePurchasePrice,
        currentPrice: h.currentMarketPrice,
        marketValue: h.quantity * h.currentMarketPrice,
        profitLoss: (h.quantity * h.currentMarketPrice) - (h.quantity * h.averagePurchasePrice),
        returnPercentage: h.returnPercentage,
        dailyChangePercent: h.dailyChangePercent
      }))
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, limit);
  },

  // --- PORTFOLIO CRUD ---
  async getInvestments(): Promise<Investment[]> {
    const remote = await tryFetch<Investment[]>('/portfolio/investments');
    if (remote) return remote;
    return loadStoredHoldings();
  },

  async addInvestment(inv: Partial<Investment>): Promise<Investment> {
    const remote = await tryFetch<Investment>('/portfolio/investments', {
      method: 'POST',
      body: JSON.stringify({
        ticker: inv.ticker,
        assetName: inv.assetName,
        assetType: inv.assetType,
        quantity: inv.quantity,
        purchasePrice: inv.averagePurchasePrice,
        purchaseDate: inv.purchaseDate || new Date().toISOString()
      })
    });
    if (remote) return remote;

    const holdings = loadStoredHoldings();
    const existingIndex = holdings.findIndex(h => h.ticker.toUpperCase() === inv.ticker?.toUpperCase());

    const quantity = inv.quantity || 1;
    const purchasePrice = inv.averagePurchasePrice || 100;
    const currentPrice = inv.currentMarketPrice || purchasePrice;

    let updatedItem: Investment;

    if (existingIndex >= 0) {
      const existing = holdings[existingIndex];
      const newQty = existing.quantity + quantity;
      const newTotalInvested = (existing.quantity * existing.averagePurchasePrice) + (quantity * purchasePrice);
      const newAvg = Math.round((newTotalInvested / newQty) * 100) / 100;
      const newMarketVal = Math.round(newQty * currentPrice * 100) / 100;
      const pl = newMarketVal - newTotalInvested;
      const ret = newTotalInvested > 0 ? (pl / newTotalInvested) * 100 : 0;

      updatedItem = {
        ...existing,
        quantity: newQty,
        averagePurchasePrice: newAvg,
        currentMarketPrice: currentPrice,
        totalInvested: newTotalInvested,
        currentMarketValue: newMarketVal,
        unrealizedProfitLoss: pl,
        returnPercentage: Math.round(ret * 100) / 100,
        lastUpdated: new Date().toISOString()
      };
      holdings[existingIndex] = updatedItem;
    } else {
      const totalInv = quantity * purchasePrice;
      const mktVal = quantity * currentPrice;
      const pl = mktVal - totalInv;
      const ret = totalInv > 0 ? (pl / totalInv) * 100 : 0;

      updatedItem = {
        id: Date.now(),
        portfolioId: 1,
        assetId: inv.assetId || Date.now(),
        assetName: inv.assetName || inv.ticker || 'Asset',
        ticker: (inv.ticker || 'TICKER').toUpperCase(),
        assetType: inv.assetType || 'Stock',
        quantity,
        averagePurchasePrice: purchasePrice,
        currentMarketPrice: currentPrice,
        totalInvested: totalInv,
        currentMarketValue: mktVal,
        unrealizedProfitLoss: pl,
        returnPercentage: Math.round(ret * 100) / 100,
        dailyChange: 0,
        dailyChangePercent: 0,
        purchaseDate: inv.purchaseDate || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      holdings.push(updatedItem);
    }

    saveStoredHoldings(holdings);

    // Record buy transaction
    const txns = loadStoredTransactions();
    txns.unshift({
      id: Date.now(),
      portfolioId: 1,
      transactionType: 'Buy',
      assetName: updatedItem.assetName,
      ticker: updatedItem.ticker,
      assetType: updatedItem.assetType,
      quantity,
      price: purchasePrice,
      totalAmount: quantity * purchasePrice,
      fees: 0,
      transactionDate: new Date().toISOString(),
      status: 'Completed',
      notes: 'Added to portfolio'
    });
    saveStoredTransactions(txns);

    return updatedItem;
  },

  async updateInvestment(id: number, data: Partial<Investment>): Promise<Investment | null> {
    const remote = await tryFetch<Investment>(`/portfolio/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (remote) return remote;

    const holdings = loadStoredHoldings();
    const index = holdings.findIndex(h => h.id === id);
    if (index === -1) return null;

    const existing = holdings[index];
    const qty = data.quantity !== undefined ? data.quantity : existing.quantity;
    const avg = data.averagePurchasePrice !== undefined ? data.averagePurchasePrice : existing.averagePurchasePrice;
    const cur = data.currentMarketPrice !== undefined ? data.currentMarketPrice : existing.currentMarketPrice;

    const totalInv = qty * avg;
    const mktVal = qty * cur;
    const pl = mktVal - totalInv;
    const ret = totalInv > 0 ? (pl / totalInv) * 100 : 0;

    const updated: Investment = {
      ...existing,
      quantity: qty,
      averagePurchasePrice: avg,
      currentMarketPrice: cur,
      totalInvested: Math.round(totalInv * 100) / 100,
      currentMarketValue: Math.round(mktVal * 100) / 100,
      unrealizedProfitLoss: Math.round(pl * 100) / 100,
      returnPercentage: Math.round(ret * 100) / 100,
      lastUpdated: new Date().toISOString()
    };

    holdings[index] = updated;
    saveStoredHoldings(holdings);
    return updated;
  },

  async deleteInvestment(id: number): Promise<boolean> {
    const remote = await tryFetch<boolean>(`/portfolio/investments/${id}`, {
      method: 'DELETE'
    });
    if (remote !== null) return remote;

    let holdings = loadStoredHoldings();
    holdings = holdings.filter(h => h.id !== id);
    saveStoredHoldings(holdings);
    return true;
  },

  // --- TRANSACTIONS ---
  async getTransactions(): Promise<Transaction[]> {
    const remote = await tryFetch<Transaction[]>('/transactions');
    if (remote) return remote;
    return loadStoredTransactions();
  },

  async recordTransaction(txn: Omit<Transaction, 'id' | 'portfolioId' | 'status'>): Promise<Transaction> {
    const remote = await tryFetch<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(txn)
    });
    if (remote) return remote;

    const holdings = loadStoredHoldings();
    let cash = loadStoredCash();
    const ticker = txn.ticker.toUpperCase();
    const calculatedTotal = (txn.quantity * txn.price) + (txn.fees || 0);

    // Validation & State Update
    if (txn.transactionType === 'Sell') {
      const holding = holdings.find(h => h.ticker.toUpperCase() === ticker);
      if (!holding || holding.quantity < txn.quantity) {
        throw new Error(`Cannot sell ${txn.quantity} units of ${ticker}. You only own ${holding?.quantity || 0} units.`);
      }

      holding.quantity -= txn.quantity;
      if (holding.quantity === 0) {
        const idx = holdings.findIndex(h => h.ticker.toUpperCase() === ticker);
        holdings.splice(idx, 1);
      } else {
        holding.totalInvested = holding.quantity * holding.averagePurchasePrice;
        holding.currentMarketValue = holding.quantity * holding.currentMarketPrice;
        holding.unrealizedProfitLoss = holding.currentMarketValue - holding.totalInvested;
        holding.returnPercentage = holding.totalInvested > 0 ? (holding.unrealizedProfitLoss / holding.totalInvested) * 100 : 0;
      }
      cash += calculatedTotal;
    } else if (txn.transactionType === 'Buy') {
      const holding = holdings.find(h => h.ticker.toUpperCase() === ticker);
      if (holding) {
        const newQty = holding.quantity + txn.quantity;
        const newTotalCost = (holding.quantity * holding.averagePurchasePrice) + (txn.quantity * txn.price);
        holding.quantity = newQty;
        holding.averagePurchasePrice = Math.round((newTotalCost / newQty) * 100) / 100;
        holding.totalInvested = newTotalCost;
        holding.currentMarketValue = newQty * holding.currentMarketPrice;
        holding.unrealizedProfitLoss = holding.currentMarketValue - holding.totalInvested;
        holding.returnPercentage = holding.totalInvested > 0 ? (holding.unrealizedProfitLoss / holding.totalInvested) * 100 : 0;
      } else {
        holdings.push({
          id: Date.now(),
          portfolioId: 1,
          assetId: Date.now(),
          assetName: txn.assetName || ticker,
          ticker,
          assetType: (txn.assetType as any) || 'Stock',
          quantity: txn.quantity,
          averagePurchasePrice: txn.price,
          currentMarketPrice: txn.price,
          totalInvested: txn.quantity * txn.price,
          currentMarketValue: txn.quantity * txn.price,
          unrealizedProfitLoss: 0,
          returnPercentage: 0,
          dailyChange: 0,
          dailyChangePercent: 0,
          purchaseDate: txn.transactionDate,
          lastUpdated: new Date().toISOString()
        });
      }
    } else if (txn.transactionType === 'Dividend' || txn.transactionType === 'Interest' || txn.transactionType === 'Deposit') {
      cash += calculatedTotal;
    } else if (txn.transactionType === 'Withdrawal') {
      if (cash < calculatedTotal) {
        throw new Error(`Insufficient available cash balance. Requested: ₹${calculatedTotal.toFixed(2)}, Available: ₹${cash.toFixed(2)}`);
      }
      cash -= calculatedTotal;
    }

    saveStoredHoldings(holdings);
    saveStoredCash(cash);

    const newTxn: Transaction = {
      id: Date.now(),
      portfolioId: 1,
      transactionType: txn.transactionType,
      assetName: txn.assetName,
      ticker,
      assetType: txn.assetType,
      quantity: txn.quantity,
      price: txn.price,
      totalAmount: calculatedTotal,
      fees: txn.fees || 0,
      transactionDate: txn.transactionDate || new Date().toISOString(),
      status: 'Completed',
      notes: txn.notes || ''
    };

    const txns = loadStoredTransactions();
    txns.unshift(newTxn);
    saveStoredTransactions(txns);

    return newTxn;
  },

  // --- ASSETS CATALOG & BOND CALCULATOR ---
  async getAssets(type?: string): Promise<AssetMarketData[]> {
    if (type) {
      const remote = await tryFetch<AssetMarketData[]>(`/assets/${type.toLowerCase()}`);
      if (remote) return remote;
    }
    const watched = loadStoredWatchlist();
    let assets = ALL_SAMPLE_ASSETS;
    if (type && type !== 'all') {
      assets = assets.filter(a => a.assetType.toLowerCase() === type.toLowerCase());
    }
    return assets.map(a => ({
      ...a,
      isWatchlisted: watched.includes(a.ticker.toUpperCase())
    }));
  },

  calculateBondYield(params: BondCalculationParams): BondCalculationOutcome {
    const { periodicPayment, annualIncome, totalIncome, maturityValue } = calculateBondCoupon(
      params.principalAmount,
      params.annualCouponRate,
      params.paymentFrequency,
      params.durationYears
    );

    return {
      principalAmount: params.principalAmount,
      annualCouponRate: params.annualCouponRate,
      paymentFrequency: params.paymentFrequency,
      durationYears: params.durationYears,
      periodicCouponPayment: periodicPayment,
      annualCouponIncome: annualIncome,
      totalCouponIncome: totalIncome,
      maturityValue: maturityValue,
      disclaimer: 'Coupon income represents periodic interest payouts and does not reflect total investment return. Bond returns are illustrative.'
    };
  },

  // --- WATCHLIST ---
  async getWatchlist(): Promise<AssetMarketData[]> {
    const remote = await tryFetch<AssetMarketData[]>('/watchlist');
    if (remote) return remote;

    const watched = loadStoredWatchlist();
    return ALL_SAMPLE_ASSETS
      .filter(a => watched.includes(a.ticker.toUpperCase()))
      .map(a => ({ ...a, isWatchlisted: true }));
  },

  async toggleWatchlist(ticker: string): Promise<boolean> {
    const cleanTicker = ticker.toUpperCase();
    let watched = loadStoredWatchlist();
    const isWatched = watched.includes(cleanTicker);

    if (isWatched) {
      await tryFetch(`/watchlist/${cleanTicker}`, { method: 'DELETE' });
      watched = watched.filter(t => t !== cleanTicker);
    } else {
      await tryFetch(`/watchlist/${cleanTicker}`, { method: 'POST' });
      watched.push(cleanTicker);
    }

    saveStoredWatchlist(watched);
    return !isWatched;
  },

  // --- FINANCIAL GOALS ---
  async getGoals(): Promise<FinancialGoal[]> {
    const remote = await tryFetch<FinancialGoal[]>('/goals');
    if (remote) return remote;
    return loadStoredGoals();
  },

  async createGoal(goal: Omit<FinancialGoal, 'id' | 'userId' | 'remainingAmount' | 'progressPercentage' | 'estimatedMonthlySavings' | 'createdAt'>): Promise<FinancialGoal> {
    const remote = await tryFetch<FinancialGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
    if (remote) return remote;

    const goals = loadStoredGoals();
    const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);
    const progress = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 1000) / 10);

    const now = new Date();
    const targetDt = new Date(goal.targetDate);
    const months = (targetDt.getFullYear() - now.getFullYear()) * 12 + targetDt.getMonth() - now.getMonth();
    const monthly = months > 0 ? Math.round((remaining / months) * 100) / 100 : remaining;

    const newGoal: FinancialGoal = {
      id: Date.now(),
      userId: 1,
      title: goal.title,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentSavings: goal.currentSavings,
      remainingAmount: remaining,
      progressPercentage: progress,
      estimatedMonthlySavings: monthly,
      targetDate: goal.targetDate,
      createdAt: new Date().toISOString()
    };

    goals.push(newGoal);
    saveStoredGoals(goals);
    return newGoal;
  },

  async updateGoal(id: number, data: Partial<FinancialGoal>): Promise<FinancialGoal | null> {
    const remote = await tryFetch<FinancialGoal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (remote) return remote;

    const goals = loadStoredGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return null;

    const existing = goals[index];
    const target = data.targetAmount !== undefined ? data.targetAmount : existing.targetAmount;
    const current = data.currentSavings !== undefined ? data.currentSavings : existing.currentSavings;
    const remaining = Math.max(0, target - current);
    const progress = Math.min(100, Math.round((current / target) * 1000) / 10);

    const targetDate = data.targetDate || existing.targetDate;
    const now = new Date();
    const targetDt = new Date(targetDate);
    const months = (targetDt.getFullYear() - now.getFullYear()) * 12 + targetDt.getMonth() - now.getMonth();
    const monthly = months > 0 ? Math.round((remaining / months) * 100) / 100 : remaining;

    const updated: FinancialGoal = {
      ...existing,
      ...data,
      targetAmount: target,
      currentSavings: current,
      remainingAmount: remaining,
      progressPercentage: progress,
      estimatedMonthlySavings: monthly,
      targetDate
    };

    goals[index] = updated;
    saveStoredGoals(goals);
    return updated;
  },

  async deleteGoal(id: number): Promise<boolean> {
    const remote = await tryFetch<boolean>(`/goals/${id}`, { method: 'DELETE' });
    if (remote !== null) return remote;

    let goals = loadStoredGoals();
    goals = goals.filter(g => g.id !== id);
    saveStoredGoals(goals);
    return true;
  },

  // --- USER PROFILE & SETTINGS ---
  async getUserProfile(): Promise<UserProfile> {
    const remote = await tryFetch<UserProfile>('/auth/profile');
    if (remote) return remote;
    return loadStoredUser()!;
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const remote = await tryFetch<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
    if (remote) return remote;

    const current = loadStoredUser()!;
    const updated = { ...current, ...profile };
    saveStoredUser(updated);
    return updated;
  }
};
