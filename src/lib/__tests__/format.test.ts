import { describe, it, expect } from 'vitest';
import { getTokenPrice, formatDate, formatCurrency, formatCrypto } from '../format';

describe('getTokenPrice', () => {
  it('returns known prices', () => {
    expect(getTokenPrice('ETH')).toBe(2287);
    expect(getTokenPrice('BNB')).toBe(300);
    expect(getTokenPrice('MATIC')).toBe(0.8);
    expect(getTokenPrice('USDT')).toBe(1);
    expect(getTokenPrice('USDC')).toBe(1);
  });

  it('returns 1 for unknown tokens', () => {
    expect(getTokenPrice('UNKNOWN')).toBe(1);
  });
});

describe('formatDate', () => {
  it('formats a timestamp to a readable date string', () => {
    const ts = new Date('2024-06-15T10:30:00Z').getTime();
    const result = formatDate(ts);
    expect(result).toContain('2024');
    expect(typeof result).toBe('string');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain('1,234.50');
  });

  it('formats with 2 decimal places', () => {
    const result = formatCurrency(0.1);
    expect(result).toContain('0.10');
  });
});

describe('formatCrypto', () => {
  it('formats a crypto amount', () => {
    expect(formatCrypto('1.23456789')).toBe('1.2346');
  });

  it('returns 0 for NaN input', () => {
    expect(formatCrypto('not-a-number')).toBe('0');
  });

  it('respects custom decimals', () => {
    expect(formatCrypto('1.23456789', 2)).toBe('1.23');
  });
});
