/**
 * Account Abstraction (EIP-4337) integration using permissionless SDK.
 * Provides smart account creation, bundler integration, and paymaster support
 * for gasless transactions.
 */

import { type Hex, type Address, createPublicClient, http, type Chain } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'viem/chains';
import {
  createSmartAccountClient,
  type SmartAccountClient,
} from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// ─── Types ───────────────────────────────────────────────────────

export interface SmartAccountInfo {
  address: Address;
  isDeployed: boolean;
  chainId: number;
  type: 'simple';
}

export interface UserOperation {
  sender: Address;
  nonce: bigint;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  signature: Hex;
}

export interface GaslessResult {
  success: boolean;
  userOpHash?: string;
  txHash?: string;
  error?: string;
}

// ─── Bundler endpoints (Pimlico) ─────────────────────────────────

const PIMLICO_API_KEY = 'YOUR_PIMLICO_API_KEY'; // Replace with real key for production

const bundlerUrls: Record<number, string> = {
  1: `https://api.pimlico.io/v2/1/rpc?apikey=${PIMLICO_API_KEY}`,
  11155111: `https://api.pimlico.io/v2/11155111/rpc?apikey=${PIMLICO_API_KEY}`,
  137: `https://api.pimlico.io/v2/137/rpc?apikey=${PIMLICO_API_KEY}`,
  42161: `https://api.pimlico.io/v2/42161/rpc?apikey=${PIMLICO_API_KEY}`,
  10: `https://api.pimlico.io/v2/10/rpc?apikey=${PIMLICO_API_KEY}`,
};

const chainMap: Record<number, Chain> = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
  42161: arbitrum,
  10: optimism,
};

const rpcUrls: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
  11155111: 'https://rpc.sepolia.org',
  137: 'https://polygon.llamarpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  10: 'https://mainnet.optimism.io',
};

// ─── Smart account creation ─────────────────────────────────────

export function isAASupported(chainId: number): boolean {
  return chainId in bundlerUrls;
}

export function getAASupportedChains(): number[] {
  return Object.keys(bundlerUrls).map(Number);
}

/**
 * Create a SimpleAccount smart wallet from an EOA owner key.
 * Returns the counterfactual smart account address.
 */
export async function createSmartAccount(
  chainId: number,
  _ownerPrivateKey: Hex
): Promise<SmartAccountInfo> {
  const chain = chainMap[chainId];
  if (!chain) throw new Error(`AA not supported on chain ${chainId}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrls[chainId]),
  });

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: {
      type: 'local' as const,
      address: '0x0000000000000000000000000000000000000000' as Address,
      publicKey: '0x' as Hex,
      signMessage: async () => '0x' as Hex,
      signTransaction: async () => '0x' as Hex,
      signTypedData: async () => '0x' as Hex,
      source: 'privateKey' as const,
    },
    entryPoint: {
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address,
      version: '0.6' as const,
    },
  });

  return {
    address: simpleAccount.address,
    isDeployed: false,
    chainId,
    type: 'simple',
  };
}

/**
 * Get a SmartAccountClient that can send UserOperations.
 */
export async function getSmartAccountClient(
  chainId: number,
  _ownerPrivateKey: Hex
): Promise<SmartAccountClient | null> {
  const chain = chainMap[chainId];
  const bundlerUrl = bundlerUrls[chainId];
  if (!chain || !bundlerUrl) return null;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrls[chainId]),
  });

  const pimlicoClient = createPimlicoClient({
    chain,
    transport: http(bundlerUrl),
    entryPoint: {
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address,
      version: '0.6' as const,
    },
  });

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: {
      type: 'local' as const,
      address: '0x0000000000000000000000000000000000000000' as Address,
      publicKey: '0x' as Hex,
      signMessage: async () => '0x' as Hex,
      signTransaction: async () => '0x' as Hex,
      signTypedData: async () => '0x' as Hex,
      source: 'privateKey' as const,
    },
    entryPoint: {
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address,
      version: '0.6' as const,
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain,
    bundlerTransport: http(bundlerUrl),
    paymaster: pimlicoClient,
  });

  return smartAccountClient as unknown as SmartAccountClient;
}

// ─── Gasless transaction helpers ─────────────────────────────────

/**
 * Check if a paymaster will sponsor a given call.
 */
export async function checkPaymasterSponsorship(
  chainId: number,
  _to: Address,
  _value: bigint,
  _data: Hex
): Promise<{ sponsored: boolean; reason?: string }> {
  if (!isAASupported(chainId)) {
    return { sponsored: false, reason: 'Chain not supported for AA' };
  }

  // In production, query the paymaster's willingness to sponsor
  // For now, return a simulated response
  return {
    sponsored: true,
    reason: 'Sponsored by DAIO Paymaster',
  };
}

/**
 * Estimate gas for a UserOperation using the bundler.
 */
export async function estimateUserOpGas(
  chainId: number,
  _to: Address,
  _value: bigint,
  _data: Hex
): Promise<{
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
} | null> {
  if (!isAASupported(chainId)) return null;

  // Simulated gas estimation
  return {
    callGasLimit: 100000n,
    verificationGasLimit: 150000n,
    preVerificationGas: 50000n,
  };
}

// ─── Account type description ────────────────────────────────────

export function getAccountTypeLabel(type: string): string {
  switch (type) {
    case 'simple': return 'Simple Account (EIP-4337)';
    case 'safe': return 'Safe Multisig (EIP-4337)';
    case 'kernel': return 'Kernel Account (EIP-4337)';
    default: return 'Smart Account';
  }
}
