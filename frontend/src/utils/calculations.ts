/**
 * Financial Calculation Helpers
 * Implements strict decimal-equivalent rounding and guards against zero or negative values.
 */

export const calculateTotalInvested = (quantity: number, averagePrice: number): number => {
  if (quantity <= 0 || averagePrice <= 0) return 0;
  return Math.round(quantity * averagePrice * 100) / 100;
};

export const calculateMarketValue = (quantity: number, currentPrice: number): number => {
  if (quantity <= 0 || currentPrice <= 0) return 0;
  return Math.round(quantity * currentPrice * 100) / 100;
};

export const calculateProfitLoss = (marketValue: number, investedAmount: number): number => {
  return Math.round((marketValue - investedAmount) * 100) / 100;
};

export const calculateReturnPercentage = (marketValue: number, investedAmount: number): number => {
  if (investedAmount <= 0) return 0;
  const pl = marketValue - investedAmount;
  return Math.round((pl / investedAmount) * 10000) / 100;
};

export const calculateGoalProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const pct = (current / target) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
};

export const calculateMonthlySavings = (current: number, target: number, targetDate: string): number => {
  const remaining = Math.max(0, target - current);
  if (remaining <= 0) return 0;

  const targetDt = new Date(targetDate);
  const now = new Date();
  const months = (targetDt.getFullYear() - now.getFullYear()) * 12 + (targetDt.getMonth() - now.getMonth());

  if (months <= 0) return remaining;
  return Math.round((remaining / months) * 100) / 100;
};

export const calculateBondCoupon = (
  principal: number,
  annualRate: number,
  frequency: string,
  durationYears: number
) => {
  if (principal <= 0 || annualRate <= 0) {
    return { periodicPayment: 0, annualIncome: 0, totalIncome: 0, maturityValue: principal };
  }

  const periodsPerYear = frequency.toLowerCase() === 'monthly' ? 12 :
    frequency.toLowerCase() === 'quarterly' ? 4 :
    frequency.toLowerCase() === 'semi-annual' ? 2 : 1;

  const annualIncome = Math.round(principal * (annualRate / 100) * 100) / 100;
  const periodicPayment = Math.round((annualIncome / periodsPerYear) * 100) / 100;
  const totalIncome = Math.round(annualIncome * durationYears * 100) / 100;
  const maturityValue = Math.round((principal + totalIncome) * 100) / 100;

  return { periodicPayment, annualIncome, totalIncome, maturityValue };
};
