// DAIO Vault Protocol — Honeypot System
// Decoy vaults, canary shards, and silent alert protocol

import type {
  Shard,
  VaultMetadata,
  HoneypotVault,
  HoneypotTrigger,
  FeldmanCommitments,
} from "../types";
import { generateShares, bigIntToHex, randomBigInt, PRIME } from "./shamir";
import { hashVaultMetadata } from "./vault-crypto";

// ─── Unique ID Generation ────────────────────────────────────────

function generateId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${Date.now()}-${hex}`;
}

// ─── Decoy Vault Creation ────────────────────────────────────────

export async function createDecoyVault(
  realMetadata: VaultMetadata
): Promise<HoneypotVault> {
  const decoyId = `vault-honey-${generateId()}`;

  // Generate a fake secret of similar length to real one
  const fakeSecretBytes = new Uint8Array(32);
  crypto.getRandomValues(fakeSecretBytes);
  const fakeSecret = Array.from(fakeSecretBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Create fake Shamir split with lower threshold (easier to "crack")
  const fakeThreshold = Math.max(2, realMetadata.threshold - 1);
  const fakeTotalShares = realMetadata.totalShares;

  const { coefficients } = generateShares(
    fakeSecret.slice(0, 30), // Truncate to fit field
    fakeThreshold,
    fakeTotalShares,
    decoyId
  );

  // Generate fake Feldman commitments
  const fakeCommitments: FeldmanCommitments = {
    generator: bigIntToHex(2n),
    commitments: coefficients.map(() => bigIntToHex(randomBigInt(PRIME))),
    prime: bigIntToHex(PRIME),
  };

  // Zero out coefficients
  coefficients.fill(0n);

  const decoyMetadata: VaultMetadata = {
    id: decoyId,
    label: realMetadata.label, // Same label to look identical
    createdAt: realMetadata.createdAt,
    threshold: fakeThreshold,
    totalShares: fakeTotalShares,
    hash: "",
    feldman: fakeCommitments,
    displayMode: realMetadata.displayMode,
    timerSeconds: realMetadata.timerSeconds,
    honeypotVaultIds: [],
  };

  decoyMetadata.hash = await hashVaultMetadata(decoyMetadata);

  return {
    id: decoyId,
    parentVaultId: realMetadata.id,
    metadata: decoyMetadata,
    decoySecretHint: `Fake secret: ${fakeSecret.slice(0, 8)}...`,
    createdAt: new Date().toISOString(),
    triggered: false,
    triggerLog: [],
  };
}

// ─── Canary Shard Creation ───────────────────────────────────────

export function createCanaryShards(
  vaultId: string,
  count: number
): Shard[] {
  const canaryShards: Shard[] = [];

  for (let i = 0; i < count; i++) {
    // Generate random value that looks like a real shard but uses wrong polynomial degree
    const fakeValue = randomBigInt(PRIME);

    canaryShards.push({
      index: 100 + i, // High indices to distinguish from real shards (1..N)
      value: bigIntToHex(fakeValue),
      vaultId,
      isCanary: true,
    });
  }

  return canaryShards;
}

// ─── Honeypot Detection ──────────────────────────────────────────

export function detectCanaryShard(shards: Shard[]): boolean {
  return shards.some((s) => s.isCanary === true);
}

export function detectHoneypotVault(
  vaultId: string,
  honeypots: HoneypotVault[]
): HoneypotVault | null {
  return honeypots.find((h) => h.metadata.id === vaultId) || null;
}

// ─── Alert Token Generation ──────────────────────────────────────

export async function generateAlertToken(
  vaultId: string,
  shardIndices: number[],
  timestamp: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    `ALERT:${vaultId}:${shardIndices.join(",")}:${timestamp}`
  );

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Create Honeypot Trigger Record ──────────────────────────────

export async function createHoneypotTrigger(
  shardsUsed: number[],
  sourceInfo: string
): Promise<HoneypotTrigger> {
  const timestamp = new Date().toISOString();
  const alertToken = await generateAlertToken(
    "honeypot",
    shardsUsed,
    timestamp
  );

  return {
    timestamp,
    shardsUsed,
    alertToken,
    sourceInfo,
  };
}
