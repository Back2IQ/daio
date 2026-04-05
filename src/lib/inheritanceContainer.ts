/**
 * DAIO Inheritance Container Engine
 *
 * Orchestrates the Sovereign Guard Architecture:
 *   1. Container data → structured, typed, validated
 *   2. Serialized → AES-256-GCM encrypted with random key
 *   3. Encryption key → Shamir split into role-based shards
 *   4. Every change → appended to tamper-evident hash chain
 *   5. Export → sealed blob + shard metadata + proof chain
 *
 * No custody. No server. No blockchain required.
 * Everything runs locally. The owner keeps control.
 */

import { encryptData, decryptData, splitSecret, reconstructSecret, hashData } from './crypto';
import { createChain, appendEntry, verifyChain, type HashChain } from './hashChain';

// ─── Container Data Types ────────────────────────────────────────

export interface AssetEntry {
  id: string;
  type: 'crypto_wallet' | 'exchange_account' | 'defi_position' | 'nft_collection' | 'digital_business' | 'cloud_storage' | 'domain' | 'social_media' | 'other';
  name: string;
  description: string;
  estimatedValue?: string;
  accessMethod: string;  // how to access (without actual credentials)
}

export interface HeirDesignation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'primary_heir' | 'secondary_heir' | 'guardian' | 'notary' | 'executor';
  allocation?: number;  // percentage (0-100), optional
  conditions?: string;  // e.g. "Only if primary heir declines"
}

export interface TriggerCondition {
  type: 'death' | 'incapacity' | 'dms_timeout' | 'manual' | 'custom';
  description: string;
  verificationMethod: string; // e.g. "Death certificate + 2 guardian confirmations"
}

export interface ContainerData {
  assets: AssetEntry[];
  heirs: HeirDesignation[];
  triggers: TriggerCondition[];
  accessArchitecture: string;  // narrative description of key/access structure
  legacyContext: string;       // personal wishes, notes for heirs
  professionalContacts: string; // notary, attorney, advisor
  jurisdiction: string;        // DE, AT, CH, EU, etc.
  notes: string;               // free-form additional notes
}

// ─── Sealed Container Types ──────────────────────────────────────

export interface ShardMetadata {
  index: number;
  holder: string;        // name of the shard holder
  role: HeirDesignation['role'];
  distributed: boolean;
  distributedAt?: number;
}

export interface SealedContainer {
  version: number;
  createdAt: number;
  lastUpdated: number;
  encrypted: {
    data: string;   // AES-256-GCM encrypted container JSON
    iv: string;
    salt: string;
  };
  shards: ShardMetadata[];
  threshold: number;       // k-of-n required to reconstruct
  totalShards: number;
  proofChain: HashChain;
  completionScore: number; // 0-100
}

// ─── Completion Scoring ──────────────────────────────────────────

export function computeCompletionScore(data: ContainerData): number {
  let score = 0;
  const weights = {
    hasAssets: 25,
    hasHeirs: 25,
    hasTriggers: 15,
    hasAccessArch: 10,
    hasLegacyContext: 5,
    hasProfContacts: 10,
    hasJurisdiction: 5,
    multipleHeirs: 5,
  };

  if (data.assets.length > 0) score += weights.hasAssets;
  if (data.heirs.length > 0) score += weights.hasHeirs;
  if (data.triggers.length > 0) score += weights.hasTriggers;
  if (data.accessArchitecture.trim().length > 0) score += weights.hasAccessArch;
  if (data.legacyContext.trim().length > 0) score += weights.hasLegacyContext;
  if (data.professionalContacts.trim().length > 0) score += weights.hasProfContacts;
  if (data.jurisdiction.trim().length > 0) score += weights.hasJurisdiction;
  if (data.heirs.length >= 2) score += weights.multipleHeirs;

  return score;
}

// ─── Container Lifecycle ─────────────────────────────────────────

/**
 * Create a new sealed container from raw data.
 * Encrypts with a random key, splits key via Shamir, starts proof chain.
 */
export async function createSealedContainer(
  data: ContainerData,
  containerPassword: string,
  shamirParts: number = 3,
  shamirThreshold: number = 2,
): Promise<{ sealed: SealedContainer; shards: string[] }> {
  // 1. Serialize and hash
  const serialized = JSON.stringify(data);
  const dataHash = hashData(serialized);

  // 2. Encrypt with AES-256-GCM
  const { encrypted: encData, iv, salt } = await encryptData(serialized, containerPassword);
  const encrypted = { data: encData, iv, salt };

  // 3. Split password via Shamir
  const shards = splitSecret(containerPassword, shamirParts, shamirThreshold);

  // 4. Create proof chain with genesis entry
  const proofChain = createChain(dataHash, 'container_created');

  // 5. Compute completion score
  const completionScore = computeCompletionScore(data);

  // 6. Build shard metadata (holders assigned later)
  const shardMeta: ShardMetadata[] = shards.map((_, i) => ({
    index: i,
    holder: '',
    role: 'primary_heir' as const,
    distributed: false,
  }));

  const sealed: SealedContainer = {
    version: 1,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    encrypted,
    shards: shardMeta,
    threshold: shamirThreshold,
    totalShards: shamirParts,
    proofChain,
    completionScore,
  };

  return { sealed, shards };
}

/**
 * Update a sealed container with new data.
 * Re-encrypts and appends to proof chain. Shards stay the same (same password).
 */
export async function updateSealedContainer(
  sealed: SealedContainer,
  data: ContainerData,
  containerPassword: string,
  action: string = 'container_updated',
): Promise<SealedContainer> {
  const serialized = JSON.stringify(data);
  const dataHash = hashData(serialized);

  const { encrypted: encData, iv, salt } = await encryptData(serialized, containerPassword);
  const encrypted = { data: encData, iv, salt };
  const completionScore = computeCompletionScore(data);
  const newVersion = sealed.version + 1;

  const proofChain = appendEntry(
    sealed.proofChain,
    dataHash,
    action,
    newVersion,
  );

  return {
    ...sealed,
    version: newVersion,
    lastUpdated: Date.now(),
    encrypted,
    proofChain,
    completionScore,
  };
}

/**
 * Record a DMS check-in on the proof chain (proof of life).
 */
export function recordCheckIn(sealed: SealedContainer): SealedContainer {
  const proofChain = appendEntry(
    sealed.proofChain,
    hashData(`checkin_${Date.now()}`),
    'dms_checkin',
    sealed.version,
    { type: 'proof_of_life' },
  );

  return {
    ...sealed,
    lastUpdated: Date.now(),
    proofChain,
  };
}

/**
 * Assign a shard to a holder.
 */
export function assignShard(
  sealed: SealedContainer,
  shardIndex: number,
  holder: string,
  role: HeirDesignation['role'],
): SealedContainer {
  const shards = sealed.shards.map((s, i) =>
    i === shardIndex
      ? { ...s, holder, role, distributed: true, distributedAt: Date.now() }
      : s
  );

  const proofChain = appendEntry(
    sealed.proofChain,
    hashData(`shard_${shardIndex}_${holder}`),
    'shard_assigned',
    sealed.version,
    { shardIndex: shardIndex.toString(), holder, role },
  );

  return { ...sealed, shards, proofChain, lastUpdated: Date.now() };
}

/**
 * Decrypt and read the container (requires the password or reconstructed password).
 */
export async function openContainer(
  sealed: SealedContainer,
  password: string,
): Promise<ContainerData> {
  const decrypted = await decryptData(
    sealed.encrypted.data,
    sealed.encrypted.iv,
    sealed.encrypted.salt,
    password,
  );
  return JSON.parse(decrypted);
}

/**
 * Reconstruct password from Shamir shards, then open container.
 */
export async function openContainerWithShards(
  sealed: SealedContainer,
  shards: string[],
): Promise<ContainerData> {
  const password = reconstructSecret(shards);
  return openContainer(sealed, password);
}

/**
 * Verify the proof chain integrity.
 */
export function verifyContainerIntegrity(sealed: SealedContainer): {
  chainValid: boolean;
  brokenAt: number;
  entries: number;
  firstEntry: number;
  lastEntry: number;
} {
  const { valid, brokenAt } = verifyChain(sealed.proofChain);
  const entries = sealed.proofChain.entries;
  return {
    chainValid: valid,
    brokenAt,
    entries: entries.length,
    firstEntry: entries.length > 0 ? entries[0].timestamp : 0,
    lastEntry: entries.length > 0 ? entries[entries.length - 1].timestamp : 0,
  };
}

// ─── Export / Import ─────────────────────────────────────────────

/**
 * Export the sealed container (without actual shard values) for backup/audit.
 */
export function exportSealedContainer(sealed: SealedContainer): string {
  return JSON.stringify(sealed, null, 2);
}

/**
 * Import a sealed container from JSON, verifying chain integrity.
 */
export function importSealedContainer(json: string): {
  sealed: SealedContainer;
  valid: boolean;
} {
  const sealed: SealedContainer = JSON.parse(json);
  const { valid } = verifyChain(sealed.proofChain);
  return { sealed, valid };
}

// ─── Empty Container Template ────────────────────────────────────

export function createEmptyContainerData(): ContainerData {
  return {
    assets: [],
    heirs: [],
    triggers: [{
      type: 'dms_timeout',
      description: 'Dead Man\'s Switch timeout — no check-in within configured period',
      verificationMethod: 'Automatic after DMS escalation completes all stages',
    }],
    accessArchitecture: '',
    legacyContext: '',
    professionalContacts: '',
    jurisdiction: 'DE',
    notes: '',
  };
}

/**
 * Generate a unique ID for assets/heirs (crypto-random, no uuid dependency).
 */
export function generateId(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}
