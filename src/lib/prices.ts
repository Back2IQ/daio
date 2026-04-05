/**
 * Price service using DeFiLlama (free, no API key).
 */

// Map chainId → DeFiLlama chain name
const chainNames: Record<number, string> = {
  1: 'ethereum',
  11155111: 'ethereum', // Sepolia uses ETH pricing
  137: 'polygon',
  56: 'bsc',
  43114: 'avax',
  10: 'optimism',
  42161: 'arbitrum',
  8453: 'base',
  324: 'era',
  59144: 'linea',
  534352: 'scroll',
  5000: 'mantle',
  250: 'fantom',
  100: 'xdai',
  42220: 'celo',
  1284: 'moonbeam',
  25: 'cronos',
  1313161554: 'aurora',
  1101: 'polygon_zkevm',
  84532: 'base', // Base Sepolia uses Base pricing
};

// Native token address placeholder used by DeFiLlama
const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface TokenPriceQuery {
  chainId: number;
  contractAddress?: string; // omit or NATIVE_ADDRESS for native token
  symbol?: string; // for result mapping
}

/**
 * Fetch current USD prices for multiple tokens via DeFiLlama.
 * Returns Record<coinKey, priceUSD> where coinKey is "chainName:address".
 */
export async function fetchTokenPrices(
  tokens: TokenPriceQuery[]
): Promise<Record<string, number>> {
  if (tokens.length === 0) return {};

  const coinKeys = tokens.map((t) => {
    const chain = chainNames[t.chainId] || 'ethereum';
    const address = t.contractAddress || NATIVE_ADDRESS;
    return `${chain}:${address}`;
  });

  const url = `https://coins.llama.fi/prices/current/${coinKeys.join(',')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`DeFiLlama API error: ${response.status}`);
  }

  let data: { coins: Record<string, { price: number; symbol: string; confidence: number }> };
  try {
    data = (await response.json()) as typeof data;
  } catch {
    throw new Error('Failed to parse DeFiLlama response');
  }

  if (!data.coins) return {};

  const prices: Record<string, number> = {};
  for (const [key, value] of Object.entries(data.coins)) {
    prices[key] = value.price;
  }

  return prices;
}

/**
 * Build the DeFiLlama coin key for a token.
 */
export function getCoinKey(chainId: number, contractAddress?: string): string {
  const chain = chainNames[chainId] || 'ethereum';
  return `${chain}:${contractAddress || NATIVE_ADDRESS}`;
}

/**
 * Fetch a single native token price by chainId.
 */
export async function fetchNativePrice(chainId: number): Promise<number> {
  const prices = await fetchTokenPrices([{ chainId }]);
  const key = getCoinKey(chainId);
  return prices[key] ?? 0;
}
