/**
 * Shared formatting utilities for DAIO Wallet
 */

/** Fallback token prices (used when live price feed is unavailable) */
export function getTokenPrice(symbol: string): number {
  switch (symbol) {
    case 'ETH': return 2287;
    case 'BNB': return 300;
    case 'MATIC': return 0.8;
    case 'AVAX': return 35;
    case 'USDT':
    case 'USDC': return 1;
    default: return 1;
  }
}

/** Format a timestamp to a localized date string */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a number as USD currency */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a crypto amount with configurable decimal places */
export function formatCrypto(amount: string, decimals: number = 4): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
