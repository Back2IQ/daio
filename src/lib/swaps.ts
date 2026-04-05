/**
 * Token swap service using 0x API aggregator.
 * Fetches quotes, builds swap transactions, and supports slippage settings.
 */

import { formatUnits, parseUnits, type Hex } from 'viem';

// ─── Types ───────────────────────────────────────────────────────

export interface SwapToken {
  address: string; // Use 0xEeee...eE for native token (0x convention)
  symbol: string;
  decimals: number;
  name: string;
  logoURI?: string;
}

export interface SwapQuote {
  sellToken: string;
  buyToken: string;
  sellAmount: string;        // raw wei
  buyAmount: string;         // raw wei
  price: string;             // human-readable exchange rate
  estimatedGas: string;
  gasPrice: string;
  allowanceTarget?: string;  // spender for ERC-20 approval
  to: string;                // contract to call
  data: Hex;                 // calldata
  value: string;             // ETH value to send
  sources: SwapSource[];
  slippage: number;
}

export interface SwapSource {
  name: string;
  proportion: string;
}

export interface SwapParams {
  sellToken: string;
  buyToken: string;
  sellAmount: string;         // human-readable amount
  sellDecimals: number;
  buyDecimals: number;
  slippageBps: number;        // basis points (e.g. 50 = 0.5%)
  takerAddress: string;
  chainId: number;
}

// ─── Chain → 0x API host ─────────────────────────────────────────

const ZRX_HOSTS: Record<number, string> = {
  1: 'https://api.0x.org',
  137: 'https://polygon.api.0x.org',
  56: 'https://bsc.api.0x.org',
  43114: 'https://avalanche.api.0x.org',
  10: 'https://optimism.api.0x.org',
  42161: 'https://arbitrum.api.0x.org',
};

// Native token placeholder used by 0x
const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export function isNativeToken(address: string): boolean {
  return !address || address === '' || address.toLowerCase() === NATIVE_TOKEN.toLowerCase();
}

export function getNativeTokenAddress(): string {
  return NATIVE_TOKEN;
}

// ─── Common swap tokens per chain ────────────────────────────────

const COMMON_TOKENS: Record<number, SwapToken[]> = {
  1: [
    { address: NATIVE_TOKEN, symbol: 'ETH', decimals: 18, name: 'Ether' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6, name: 'Tether USD' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18, name: 'Dai' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', decimals: 8, name: 'Wrapped BTC' },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', decimals: 18, name: 'Wrapped Ether' },
  ],
  137: [
    { address: NATIVE_TOKEN, symbol: 'MATIC', decimals: 18, name: 'Matic' },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6, name: 'Tether USD' },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', decimals: 18, name: 'Wrapped Ether' },
  ],
  42161: [
    { address: NATIVE_TOKEN, symbol: 'ETH', decimals: 18, name: 'Ether' },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', decimals: 6, name: 'Tether USD' },
  ],
  10: [
    { address: NATIVE_TOKEN, symbol: 'ETH', decimals: 18, name: 'Ether' },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  ],
  56: [
    { address: NATIVE_TOKEN, symbol: 'BNB', decimals: 18, name: 'BNB' },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18, name: 'Tether USD' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', decimals: 18, name: 'USD Coin' },
  ],
  43114: [
    { address: NATIVE_TOKEN, symbol: 'AVAX', decimals: 18, name: 'Avalanche' },
    { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', symbol: 'USDC', decimals: 6, name: 'USD Coin' },
  ],
};

export function getSwapTokens(chainId: number): SwapToken[] {
  return COMMON_TOKENS[chainId] || [];
}

// ─── Fetch quote ─────────────────────────────────────────────────

export async function fetchSwapQuote(params: SwapParams): Promise<SwapQuote> {
  const host = ZRX_HOSTS[params.chainId];
  if (!host) throw new Error(`Swaps not supported on chain ${params.chainId}`);

  const sellAmountWei = parseUnits(params.sellAmount, params.sellDecimals).toString();

  const qs = new URLSearchParams({
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: sellAmountWei,
    takerAddress: params.takerAddress,
    slippagePercentage: (params.slippageBps / 10000).toString(),
  });

  const res = await fetch(`${host}/swap/v1/quote?${qs.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.reason || `0x API error: ${res.status}`);
  }

  const data = await res.json();

  return {
    sellToken: data.sellTokenAddress || params.sellToken,
    buyToken: data.buyTokenAddress || params.buyToken,
    sellAmount: data.sellAmount,
    buyAmount: data.buyAmount,
    price: data.price,
    estimatedGas: data.estimatedGas,
    gasPrice: data.gasPrice,
    allowanceTarget: data.allowanceTarget,
    to: data.to,
    data: data.data as Hex,
    value: data.value,
    sources: (data.sources || [])
      .filter((s: { proportion: string }) => parseFloat(s.proportion) > 0)
      .map((s: { name: string; proportion: string }) => ({ name: s.name, proportion: s.proportion })),
    slippage: params.slippageBps,
  };
}

// ─── Format helpers ──────────────────────────────────────────────

export function formatSwapAmount(raw: string, decimals: number): string {
  return formatUnits(BigInt(raw), decimals);
}

export function getMinReceived(buyAmount: string, slippageBps: number, decimals: number): string {
  if (slippageBps < 0 || slippageBps > 10000) {
    throw new Error('Slippage BPS must be between 0 and 10000');
  }
  const amount = BigInt(buyAmount);
  const minAmount = amount - (amount * BigInt(Math.round(slippageBps))) / 10000n;
  return formatUnits(minAmount, decimals);
}
