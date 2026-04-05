// lib/alchemy.ts — Alchemy API Integration (read-only)
// Provides enhanced blockchain data via Alchemy when VITE_ALCHEMY_API_KEY is set.
// Falls back to public RPCs when no key is configured.
//
// Setup:
//   1. Create free account at https://www.alchemy.com
//   2. Create an app for Ethereum Mainnet
//   3. Set VITE_ALCHEMY_API_KEY in .env

export interface AssetTransfer {
  hash: string;
  blockNum: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;   // ETH, USDC, etc.
  category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft';
  rawContract?: {
    address: string | null;
    decimal: string | null;
  };
}

export interface TransactionHistory {
  transfers: AssetTransfer[];
  pageKey?: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const ALCHEMY_KEY = (import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined)?.trim() || '';

/** Network slugs for Alchemy API URLs */
const ALCHEMY_NETWORK: Record<number, string> = {
  1:        'eth-mainnet',
  11155111: 'eth-sepolia',
  137:      'polygon-mainnet',
  56:       'bnb-mainnet',
  43114:    'avax-mainnet',
  10:       'opt-mainnet',
  42161:    'arb-mainnet',
};

export function hasAlchemyKey(): boolean {
  return ALCHEMY_KEY.length > 0;
}

/**
 * Returns the Alchemy JSON-RPC URL for a chain.
 * Used by blockchain.ts to upgrade the default public RPC.
 */
export function getAlchemyRpcUrl(chainId: number): string | null {
  if (!ALCHEMY_KEY) return null;
  const network = ALCHEMY_NETWORK[chainId];
  if (!network) return null;
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
}

/**
 * Alchemy base URL for REST APIs.
 */
function alchemyBaseUrl(chainId: number): string | null {
  if (!ALCHEMY_KEY) return null;
  const network = ALCHEMY_NETWORK[chainId];
  if (!network) return null;
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
}

// ── Asset Transfers (Transaction History) ────────────────────────────────────

/**
 * Fetch inbound and outbound ERC-20/ETH transfers for an address.
 * Uses Alchemy's alchemy_getAssetTransfers API (much faster than block scanning).
 *
 * @param chainId  Chain to query
 * @param address  The wallet address
 * @param pageKey  Optional pagination cursor
 */
export async function getAssetTransfers(
  chainId: number,
  address: string,
  pageKey?: string,
): Promise<TransactionHistory> {
  const base = alchemyBaseUrl(chainId);
  if (!base) {
    return { transfers: [] };
  }

  const buildParams = (transferType: 'from' | 'to') => ({
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getAssetTransfers',
    params: [{
      [transferType === 'from' ? 'fromAddress' : 'toAddress']: address,
      category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
      withMetadata: false,
      excludeZeroValue: true,
      maxCount: '0x14', // 20
      ...(pageKey ? { pageKey } : {}),
      order: 'desc',
    }],
  });

  const [sentResult, receivedResult] = await Promise.allSettled([
    fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildParams('from')),
    }).then((r) => r.json()),
    fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildParams('to')),
    }).then((r) => r.json()),
  ]);

  const allTransfers: AssetTransfer[] = [];
  let nextPageKey: string | undefined;

  for (const result of [sentResult, receivedResult]) {
    if (result.status === 'fulfilled') {
      const data = result.value as { result?: { transfers?: AssetTransfer[]; pageKey?: string } };
      if (data?.result?.transfers) {
        allTransfers.push(...data.result.transfers);
        if (data.result.pageKey) nextPageKey = data.result.pageKey;
      }
    }
  }

  // Sort by block number descending, deduplicate by hash
  const seen = new Set<string>();
  const unique = allTransfers
    .filter((t) => {
      if (seen.has(t.hash)) return false;
      seen.add(t.hash);
      return true;
    })
    .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

  return { transfers: unique.slice(0, 30), pageKey: nextPageKey };
}

// ── NFT Balances ──────────────────────────────────────────────────────────────

export interface NftBalance {
  contractAddress: string;
  tokenId: string;
  name?: string;
  imageUrl?: string;
}

/**
 * Fetch NFTs owned by an address via Alchemy NFT API.
 */
export async function getNFTs(
  chainId: number,
  address: string,
): Promise<NftBalance[]> {
  const base = alchemyBaseUrl(chainId);
  if (!base) return [];

  try {
    const url = `${base}/getNFTs?owner=${address}&withMetadata=true&pageSize=10`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];

    const data = await response.json() as {
      ownedNfts?: Array<{
        contract: { address: string };
        id: { tokenId: string };
        metadata?: { name?: string; image?: string };
      }>;
    };

    return (data.ownedNfts ?? []).map((nft) => ({
      contractAddress: nft.contract.address,
      tokenId: nft.id.tokenId,
      name: nft.metadata?.name,
      imageUrl: nft.metadata?.image,
    }));
  } catch {
    return [];
  }
}

// ── Token Balances via Alchemy ─────────────────────────────────────────────

export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;  // Hex balance
  error?: string;
}

/**
 * Get ERC-20 token balances via Alchemy's alchemy_getTokenBalances.
 * More reliable than multicall for many tokens at once.
 */
export async function getTokenBalancesAlchemy(
  chainId: number,
  address: string,
): Promise<AlchemyTokenBalance[]> {
  const base = alchemyBaseUrl(chainId);
  if (!base) return [];

  try {
    const response = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address, 'DEFAULT_TOKENS'],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json() as {
      result?: { tokenBalances?: AlchemyTokenBalance[] };
    };

    return (data.result?.tokenBalances ?? [])
      .filter((t) => !t.error && t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000');
  } catch {
    return [];
  }
}
