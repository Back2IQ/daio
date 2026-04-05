import { describe, it, expect } from 'vitest';
import { getPublicClient, getSupportedChainIds } from '../blockchain';

describe('getPublicClient', () => {
  it('creates a client for each supported chain', () => {
    const chainIds = getSupportedChainIds();
    expect(chainIds).toContain(1);
    expect(chainIds).toContain(11155111);
    expect(chainIds).toContain(137);
    expect(chainIds).toContain(56);
    expect(chainIds).toContain(43114);
    expect(chainIds).toContain(10);
    expect(chainIds).toContain(42161);
    expect(chainIds).toHaveLength(7);
  });

  it('returns a PublicClient for Ethereum mainnet', () => {
    const client = getPublicClient(1);
    expect(client).toBeDefined();
    expect(client.chain?.id).toBe(1);
  });

  it('returns the same cached client on subsequent calls', () => {
    const a = getPublicClient(137);
    const b = getPublicClient(137);
    expect(a).toBe(b);
  });

  it('throws for unsupported chain', () => {
    expect(() => getPublicClient(999999)).toThrow('Unsupported chain');
  });
});
