import { describe, it, expect } from 'vitest';
import { getCoinKey } from '../prices';

describe('getCoinKey', () => {
  it('builds correct key for Ethereum native token', () => {
    expect(getCoinKey(1)).toBe('ethereum:0x0000000000000000000000000000000000000000');
  });

  it('builds correct key for Polygon native token', () => {
    expect(getCoinKey(137)).toBe('polygon:0x0000000000000000000000000000000000000000');
  });

  it('builds correct key for BSC native token', () => {
    expect(getCoinKey(56)).toBe('bsc:0x0000000000000000000000000000000000000000');
  });

  it('builds correct key for Avalanche native token', () => {
    expect(getCoinKey(43114)).toBe('avax:0x0000000000000000000000000000000000000000');
  });

  it('builds correct key for a token contract', () => {
    const usdt = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    expect(getCoinKey(1, usdt)).toBe(`ethereum:${usdt}`);
  });

  it('defaults to ethereum for unknown chainId', () => {
    expect(getCoinKey(999999)).toBe('ethereum:0x0000000000000000000000000000000000000000');
  });
});
