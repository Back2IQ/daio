import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  parseEther,
  parseAbi,
  decodeFunctionData,
  type PublicClient,
  type Chain,
  type Hex,
} from 'viem';
import { getAlchemyRpcUrl } from './alchemy';
import {
  mainnet,
  sepolia,
  polygon,
  bsc,
  avalanche,
  optimism,
  arbitrum,
} from 'viem/chains';

// ─── Nonce Manager ──────────────────────────────────────────────

/**
 * Per-account nonce tracker.
 * Queries on-chain nonce and tracks locally pending nonces to avoid
 * collisions and stale-nonce errors.
 */
class NonceManager {
  private pending = new Map<string, number>(); // address → next nonce

  /** Get the next nonce for an account, accounting for pending txs. */
  async getNextNonce(chainId: number, address: string): Promise<number> {
    const client = getPublicClient(chainId);
    const key = `${chainId}:${address.toLowerCase()}`;

    // Race the RPC call against a 3-second timeout
    const onChainNonce = await Promise.race([
      client.getTransactionCount({ address: address as `0x${string}` }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Nonce fetch timeout')), 3000)
      ),
    ]);

    const localNext = this.pending.get(key);
    const nonce = localNext != null ? Math.max(onChainNonce, localNext) : onChainNonce;

    // Reserve this nonce
    this.pending.set(key, nonce + 1);
    return nonce;
  }

  /** Call when a tx is confirmed or fails to sync local state. */
  confirmNonce(chainId: number, address: string, nonce: number): void {
    const key = `${chainId}:${address.toLowerCase()}`;
    const current = this.pending.get(key);
    // Only advance if the confirmed nonce matches or exceeds our tracking
    if (current != null && nonce + 1 >= current) {
      this.pending.set(key, nonce + 1);
    }
  }

  /** Reset tracking for an account (e.g. on chain switch). */
  reset(chainId: number, address: string): void {
    this.pending.delete(`${chainId}:${address.toLowerCase()}`);
  }

  /** Reset all tracked nonces. */
  resetAll(): void {
    this.pending.clear();
  }
}

export const nonceManager = new NonceManager();

// ERC-20 balanceOf ABI fragment
const erc20BalanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Map chainId → viem Chain definition with custom RPC
const chainMap: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
  56: bsc,
  43114: avalanche,
  10: optimism,
  42161: arbitrum,
};

// Custom RPC URLs (matching walletStore defaults)
const rpcUrls: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
  11155111: 'https://rpc.sepolia.org',
  137: 'https://polygon.llamarpc.com',
  56: 'https://bsc-dataseed.binance.org/',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  10: 'https://mainnet.optimism.io',
  42161: 'https://arb1.arbitrum.io/rpc',
};

// ─── MEV-Protected RPC endpoints ────────────────────────────────
// Relay transactions privately (not visible in public mempool),
// preventing frontrunning, backrunning, and sandwich attacks.
const mevProtectedRpcUrls: Record<number, string> = {
  1: 'https://rpc.flashbots.net',       // Flashbots Protect (Ethereum mainnet)
};

/** Whether to use MEV-protected RPCs for transaction sending. */
let mevProtectionEnabled = true;

export function setMevProtection(enabled: boolean): void {
  mevProtectionEnabled = enabled;
}

export function isMevProtectionEnabled(): boolean {
  return mevProtectionEnabled;
}

/**
 * Get the appropriate RPC URL for sending transactions.
 * Uses MEV-protected endpoint if available and enabled, otherwise standard RPC.
 */
export function getSendRpcUrl(chainId: number): string {
  if (mevProtectionEnabled && mevProtectedRpcUrls[chainId]) {
    return mevProtectedRpcUrls[chainId];
  }
  return rpcUrls[chainId] || '';
}

// Client cache (read operations — standard RPC)
const clientCache = new Map<number, PublicClient>();
// Send client cache (write operations — MEV-protected RPC when available)
const sendClientCache = new Map<string, PublicClient>();

/**
 * Get or create a viem PublicClient for a given chainId.
 * Prefers Alchemy RPC when VITE_ALCHEMY_API_KEY is configured (more reliable).
 * Falls back to public RPC endpoints otherwise.
 */
export function getPublicClient(chainId: number): PublicClient {
  const cached = clientCache.get(chainId);
  if (cached) return cached;

  const chain = chainMap[chainId];
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  // Prefer Alchemy for higher rate limits and reliability
  const rpcUrl = getAlchemyRpcUrl(chainId) ?? rpcUrls[chainId];

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
    batch: { multicall: true },
  });

  clientCache.set(chainId, client);
  return client;
}

/**
 * Get native token balance (ETH, MATIC, BNB, AVAX) for an address.
 * Returns human-readable string (e.g. "1.5").
 */
export async function getNativeBalance(
  chainId: number,
  address: string
): Promise<string> {
  const client = getPublicClient(chainId);
  const balance = await client.getBalance({
    address: address as `0x${string}`,
  });
  return formatEther(balance);
}

/**
 * Get ERC-20 token balances via multicall.
 * Returns Record<contractAddress, humanReadableBalance>.
 */
export async function getTokenBalances(
  chainId: number,
  address: string,
  tokens: Array<{ contractAddress: string; decimals: number }>
): Promise<Record<string, string>> {
  if (tokens.length === 0) return {};

  const client = getPublicClient(chainId);
  const results = await client.multicall({
    contracts: tokens.map((token) => ({
      address: token.contractAddress as `0x${string}`,
      abi: erc20BalanceOfAbi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })),
  });

  const balances: Record<string, string> = {};
  tokens.forEach((token, i) => {
    const result = results[i];
    if (result.status === 'success') {
      balances[token.contractAddress] = formatUnits(
        result.result as unknown as bigint,
        token.decimals
      );
    } else {
      balances[token.contractAddress] = '0';
    }
  });

  return balances;
}

/**
 * Simulate a transaction to check if it would succeed.
 * Includes calldata for full contract interaction simulation.
 */
export async function simulateTransaction(
  chainId: number,
  from: string,
  to: string,
  value: string,
  data?: string
): Promise<{ success: boolean; gasEstimate?: bigint; error?: string }> {
  const client = getPublicClient(chainId);
  try {
    const gasEstimate = await client.estimateGas({
      account: from as `0x${string}`,
      to: to as `0x${string}`,
      value: parseEther(value),
      ...(data && data !== '0x' ? { data: data as `0x${string}` } : {}),
    });
    return { success: true, gasEstimate };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transaction simulation failed';
    return { success: false, error: message };
  }
}

/**
 * Broadcast a signed transaction.
 * Uses MEV-protected RPC when available to prevent frontrunning.
 */
export async function sendRawTransaction(
  chainId: number,
  signedTx: `0x${string}`
): Promise<string> {
  const sendUrl = getSendRpcUrl(chainId);
  const cacheKey = `${chainId}:${sendUrl}`;

  let client = sendClientCache.get(cacheKey);
  if (!client) {
    const chain = chainMap[chainId];
    if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
    client = createPublicClient({
      chain,
      transport: http(sendUrl),
    });
    sendClientCache.set(cacheKey, client);
  }

  return client.sendRawTransaction({ serializedTransaction: signedTx });
}

/**
 * Get the list of supported chain IDs.
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(chainMap).map(Number);
}

// ─── Transaction Decode & Trace ──────────────────────────────────

/** Common ABI signatures for decoding calldata */
const KNOWN_ABIS = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function swap(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[])',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[])',
  'function multicall(bytes[] data) returns (bytes[])',
]);

export interface DecodedAction {
  type: 'transfer' | 'approval' | 'swap' | 'contract_call' | 'native_transfer';
  label: string;
  details: Record<string, string>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TxPreview {
  success: boolean;
  gasEstimate?: bigint;
  error?: string;
  actions: DecodedAction[];
  warnings: string[];
}

/**
 * Decode transaction calldata into human-readable actions.
 */
export function decodeCalldata(
  data: string | undefined,
  value: string,
  to: string,
  _depth: number = 0
): DecodedAction[] {
  const MAX_DECODE_DEPTH = 3;
  const actions: DecodedAction[] = [];

  // Native transfer (no data or empty data)
  if (!data || data === '0x' || data.length < 10) {
    if (value && value !== '0') {
      actions.push({
        type: 'native_transfer',
        label: 'Native Token Transfer',
        details: {
          to,
          value: formatEther(BigInt(value)),
        },
        riskLevel: 'low',
      });
    }
    return actions;
  }

  // Try to decode known function signatures
  try {
    const decoded = decodeFunctionData({
      abi: KNOWN_ABIS,
      data: data as Hex,
    });

    switch (decoded.functionName) {
      case 'transfer': {
        const [recipient, amount] = decoded.args as [string, bigint];
        actions.push({
          type: 'transfer',
          label: 'ERC-20 Transfer',
          details: {
            to: recipient,
            amount: amount.toString(),
            contract: to,
          },
          riskLevel: 'low',
        });
        break;
      }
      case 'approve': {
        const [spender, amount] = decoded.args as [string, bigint];
        const isUnlimited = amount >= BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') / 2n;
        actions.push({
          type: 'approval',
          label: isUnlimited ? 'Unlimited Token Approval' : 'Token Approval',
          details: {
            spender,
            amount: isUnlimited ? 'Unlimited' : amount.toString(),
            contract: to,
          },
          riskLevel: isUnlimited ? 'high' : 'medium',
        });
        break;
      }
      case 'transferFrom': {
        const [from, recipient, amount] = decoded.args as [string, string, bigint];
        actions.push({
          type: 'transfer',
          label: 'ERC-20 TransferFrom',
          details: { from, to: recipient, amount: amount.toString(), contract: to },
          riskLevel: 'medium',
        });
        break;
      }
      case 'swapExactTokensForTokens':
      case 'swapExactETHForTokens':
      case 'swap': {
        actions.push({
          type: 'swap',
          label: 'Token Swap',
          details: {
            router: to,
            method: decoded.functionName,
          },
          riskLevel: 'medium',
        });
        break;
      }
      case 'multicall': {
        const innerCalls = (decoded.args as [Hex[]])[0];
        actions.push({
          type: 'contract_call',
          label: 'Multicall',
          details: { contract: to, calls: innerCalls.length.toString() },
          riskLevel: 'medium',
        });
        // Recursively decode inner calls with depth limit
        if (_depth < MAX_DECODE_DEPTH) {
          const maxInner = Math.min(innerCalls.length, 10); // cap displayed inner calls
          for (let idx = 0; idx < maxInner; idx++) {
            const innerActions = decodeCalldata(innerCalls[idx], '0', to, _depth + 1);
            actions.push(...innerActions);
          }
          if (innerCalls.length > 10) {
            actions.push({
              type: 'contract_call',
              label: `+${innerCalls.length - 10} more inner calls`,
              details: { contract: to },
              riskLevel: 'medium',
            });
          }
        }
        break;
      }
    }
  } catch {
    // Unknown function — generic contract call
    const selector = data.slice(0, 10);
    actions.push({
      type: 'contract_call',
      label: 'Contract Interaction',
      details: {
        contract: to,
        selector,
      },
      riskLevel: 'medium',
    });
  }

  // If there's also a native value transfer alongside contract call
  if (value && value !== '0' && BigInt(value) > 0n) {
    actions.push({
      type: 'native_transfer',
      label: 'Native Value Attached',
      details: { value: formatEther(BigInt(value)) },
      riskLevel: 'low',
    });
  }

  return actions;
}

/**
 * Full transaction preview: simulate + decode.
 */
export async function previewTransaction(
  chainId: number,
  from: string,
  to: string,
  value: string,
  data?: string
): Promise<TxPreview> {
  const warnings: string[] = [];
  const actions = decodeCalldata(data, value, to);

  // Check for high-risk actions
  for (const action of actions) {
    if (action.type === 'approval' && action.riskLevel === 'high') {
      warnings.push('This transaction grants unlimited token approval. The spender can transfer all your tokens of this type.');
    }
  }

  // Simulate on-chain
  let valueForSim = '0';
  if (value) {
    try {
      valueForSim = formatEther(BigInt(value));
    } catch {
      warnings.push('Invalid transaction value format');
    }
  }
  const sim = await simulateTransaction(chainId, from, to, valueForSim, data);
  if (!sim.success) {
    warnings.push(sim.error || 'Transaction simulation failed');
  }

  return {
    success: sim.success,
    gasEstimate: sim.gasEstimate,
    error: sim.error,
    actions,
    warnings,
  };
}
