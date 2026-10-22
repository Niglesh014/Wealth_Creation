import type { Investment, Transaction, FinancialGoal, UserProfile } from '../types';
import { INITIAL_HOLDINGS, INITIAL_CASH_BALANCE, INITIAL_TRANSACTIONS, INITIAL_GOALS, INITIAL_WATCHLIST_TICKERS } from '../data/sampleData';

const STORAGE_KEYS = {
  HOLDINGS: 'wealthwise_holdings',
  CASH: 'wealthwise_cash',
  TRANSACTIONS: 'wealthwise_transactions',
  GOALS: 'wealthwise_goals',
  WATCHLIST: 'wealthwise_watchlist',
  USER: 'wealthwise_user',
  THEME: 'wealthwise_theme'
};

export const loadStoredHoldings = (): Investment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
    return data ? JSON.parse(data) : INITIAL_HOLDINGS;
  } catch {
    return INITIAL_HOLDINGS;
  }
};

export const saveStoredHoldings = (holdings: Investment[]): void => {
  localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
};

export const loadStoredCash = (): number => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CASH);
    return data !== null ? parseFloat(data) : INITIAL_CASH_BALANCE;
  } catch {
    return INITIAL_CASH_BALANCE;
  }
};

export const saveStoredCash = (cash: number): void => {
  localStorage.setItem(STORAGE_KEYS.CASH, cash.toString());
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (txns: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
};

export const loadStoredGoals = (): FinancialGoal[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : INITIAL_GOALS;
  } catch {
    return INITIAL_GOALS;
  }
};

export const saveStoredGoals = (goals: FinancialGoal[]): void => {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const loadStoredWatchlist = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : INITIAL_WATCHLIST_TICKERS;
  } catch {
    return INITIAL_WATCHLIST_TICKERS;
  }
};

export const saveStoredWatchlist = (tickers: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(tickers));
};

export const loadStoredUser = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) return JSON.parse(data);
    return {
      id: 1,
      fullName: 'Niglesh Sundhar',
      email: 'investor@wealthwise.com',
      preferredCurrency: 'INR',
      themePreference: 'light',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: true,
      createdAt: '2026-01-01'
    };
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};
