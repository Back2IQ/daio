/**
 * ERC-20 Token Approval Management.
 * Scans approval events via viem getLogs, lists active approvals,
 * and supports revoking (setting allowance to 0).
 */

import {
  parseAbi,
  formatUnits,
  type Hex,
  maxUint256,
  encodeFunctionData,
} from 'viem';
import { getPublicClient } from './blockchain';

// ─── Types ───────────────────────────────────────────────────────

export interface TokenApproval {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  spender: string;
  allowance: bigint;
  allowanceFormatted: string;
  isUnlimited: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  txHash?: string;
  blockNumber: bigint;
}

// ─── ABI fragments ──────────────────────────────────────────────

const erc20Abi = parseAbi([
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

// ─── Known spender labels ────────────────────────────────────────

const KNOWN_SPENDERS: Record<string, string> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2 Router',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3 Router',
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x Exchange Proxy',
  '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch Router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap Universal Router',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router 2',
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'Aave V2 Pool',
};

export function getSpenderLabel(address: string): string | undefined {
  return KNOWN_SPENDERS[address.toLowerCase()];
}

// ─── Scan approvals ──────────────────────────────────────────────

/**
 * Scan for ERC-20 Approval events for a given owner on a specific chain.
 * Returns deduplicated list of current allowances by checking on-chain state.
 */
export async function scanApprovals(
  chainId: number,
  ownerAddress: string,
  tokenAddresses: string[],
  fromBlock?: bigint
): Promise<TokenApproval[]> {
  if (tokenAddresses.length === 0) return [];

  const client = getPublicClient(chainId);
  const approvals: TokenApproval[] = [];
  const seen = new Set<string>();

  // Scan each token for Approval events
  for (const tokenAddr of tokenAddresses) {
    try {
      const approvalEvent = parseAbi([
        'event Approval(address indexed owner, address indexed spender, uint256 value)',
      ]);
      const logs = await client.getLogs({
        address: tokenAddr as Hex,
        event: approvalEvent[0],
        args: { owner: ownerAddress as Hex },
        fromBlock: fromBlock ?? 'earliest',
        toBlock: 'latest',
      });

      // Collect unique spenders from events
      const spenders = new Set<string>();
      for (const log of logs) {
        const spender = log.args?.spender;
        if (spender) spenders.add(spender.toLowerCase());
      }

      // Check current on-chain allowance for each spender
      for (const spender of spenders) {
        const key = `${tokenAddr.toLowerCase()}-${spender}`;
        if (seen.has(key)) continue;
        seen.add(key);

        try {
          const [allowance, symbol, decimals] = await Promise.all([
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [ownerAddress as Hex, spender as Hex],
            }) as Promise<bigint>,
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'symbol',
            }) as Promise<string>,
            client.readContract({
              address: tokenAddr as Hex,
              abi: erc20Abi,
              functionName: 'decimals',
            }) as Promise<number>,
          ]);

          if (allowance > 0n) {
            const isUnlimited = allowance >= maxUint256 / 2n;
            approvals.push({
              id: key,
              tokenAddress: tokenAddr,
              tokenSymbol: symbol,
              tokenDecimals: decimals,
              spender,
              allowance,
              allowanceFormatted: isUnlimited
                ? 'Unlimited'
                : formatUnits(allowance, decimals),
              isUnlimited,
              riskLevel: isUnlimited ? 'high' : allowance > 10n ** BigInt(decimals + 4) ? 'medium' : 'low',
              blockNumber: 0n,
            });
          }
        } catch {
          // Token may not implement standard interface — skip
        }
      }
    } catch {
      // getLogs may fail for unsupported ranges — skip
    }
  }

  return approvals;
}

// ─── Build revoke transaction ────────────────────────────────────

export function buildRevokeTx(
  tokenAddress: string,
  spender: string
): { to: Hex; data: Hex; value: bigint } {
  return {
    to: tokenAddress as Hex,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as Hex, 0n],
    }),
    value: 0n,
  };
}

// ─── Risk assessment ─────────────────────────────────────────────

export function getRiskColor(level: TokenApproval['riskLevel']): string {
  switch (level) {
    case 'high': return 'text-red-600 bg-red-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
  }
}

export function getRiskLabel(level: TokenApproval['riskLevel']): string {
  switch (level) {
    case 'high': return 'High Risk';
    case 'medium': return 'Medium';
    case 'low': return 'Low Risk';
  }
}
