export type AssetType = 'Stock' | 'Bond' | 'MutualFund' | 'ETF' | 'Cash';

export interface Investment {
  id: number;
  portfolioId: number;
  assetId: number;
  assetName: string;
  ticker: string;
  assetType: AssetType;
  quantity: number;
  averagePurchasePrice: number;
  currentMarketPrice: number;
  totalInvested: number;
  currentMarketValue: number;
  unrealizedProfitLoss: number;
  returnPercentage: number;
  dailyChange: number;
  dailyChangePercent: number;
  purchaseDate: string;
  lastUpdated: string;
}

export interface AssetMarketData {
  id: number;
  name: string;
  ticker: string;
  assetType: AssetType;
  currentPrice: number;
  previousClosePrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  isWatchlisted?: boolean;

  // Stock specifics
  sector?: string;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;

  // Bond specifics
  issuer?: string;
  creditRating?: string;
  couponRate?: number;
  faceValue?: number;
  maturityDate?: string;
  interestFrequency?: string;
  bondCategory?: 'Government' | 'Corporate' | 'Senior Secured' | 'Senior Unsecured';

  // Mutual Fund specifics
  fundCategory?: string;
  nav?: number;
  riskCategory?: 'Low' | 'Moderate' | 'High' | 'Very High';
  expenseRatio?: number;
  fundAum?: number;

  // ETF specifics
  benchmarkIndex?: string;
  trackingError?: number;
}

export type TransactionType = 'Buy' | 'Sell' | 'Dividend' | 'Interest' | 'Deposit' | 'Withdrawal';

export interface Transaction {
  id: number;
  portfolioId: number;
  transactionType: TransactionType;
  assetName: string;
  ticker: string;
  assetType: string;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  transactionDate: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  notes: string;
}

export interface FinancialGoal {
  id: number;
  userId: number;
  title: string;
  category: string;
  targetAmount: number;
  currentSavings: number;
  remainingAmount: number;
  progressPercentage: number;
  estimatedMonthlySavings: number;
  targetDate: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalPortfolioValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  percentageReturn: number;
  todayProfitLoss: number;
  todayPercentageChange: number;
  availableCash: number;
  currency: string;
  asOfDate: string;
}

export interface AllocationItem {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
  invested: number;
  profitLoss: number;
}

export interface TopHolding {
  id: number;
  assetName: string;
  ticker: string;
  assetType: string;
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  returnPercentage: number;
  dailyChangePercent: number;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  preferredCurrency: string;
  themePreference: 'light' | 'dark';
  dateFormat: string;
  emailNotifications: boolean;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface BondCalculationParams {
  principalAmount: number;
  annualCouponRate: number;
  paymentFrequency: string;
  durationYears: number;
}

export interface BondCalculationOutcome {
  principalAmount: number;
  annualCouponRate: number;
  paymentFrequency: string;
  durationYears: number;
  periodicCouponPayment: number;
  annualCouponIncome: number;
  totalCouponIncome: number;
  maturityValue: number;
  disclaimer: string;
}
