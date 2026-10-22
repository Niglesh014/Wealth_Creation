/**
 * Indian Numbering System Currency Formatter
 * Formats numbers into INR currency format (e.g. ₹2,45,680.50, ₹10,00,000.00)
 */
export const formatINR = (amount: number, showSign: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format using Indian locale
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (isNegative) {
    return `-${formatted}`;
  }

  if (showSign && amount > 0) {
    return `+${formatted}`;
  }

  return formatted;
};

/**
 * Compact INR Formatter for large figures (e.g. ₹1.25 Cr, ₹45.5 L, ₹12.5 K)
 */
export const formatCompactINR = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${abs.toFixed(2)}`;
};

/**
 * Formats percentage return values with + or - indicators
 */
export const formatPercent = (percent: number, includeSign: boolean = true): string => {
  if (isNaN(percent) || percent === null || percent === undefined) {
    return '0.00%';
  }

  const prefix = includeSign && percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
};

/**
 * Formats dates into standard Indian format: DD/MM/YYYY or DD MMM YYYY
 */
export const formatDate = (dateString: string | Date, format: 'short' | 'long' = 'short'): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  return `${formatDate(date, 'long')} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};
