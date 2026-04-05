// DAIO Vault Protocol — Type Definitions
// Shamir's Secret Sharing based threshold container system

// ─── Display Modes ───────────────────────────────────────────────

export type DisplayMode = "canvas-timer" | "split-screen" | "qr-only";

// ─── Vault Configuration ─────────────────────────────────────────

export interface VaultConfig {
  label: string;
  threshold: number; // T — minimum shards needed
  totalShares: number; // N — total shards created
  honeypotCount: number; // number of decoy containers
  displayMode: DisplayMode;
  timerSeconds: number; // auto-destruct timer for display
}

// ─── Shard Types ─────────────────────────────────────────────────

export interface Shard {
  index: number; // x-coordinate (1...N)
  value: string; // y-coordinate as hex string (f(x) mod p)
  vaultId: string;
  isCanary?: boolean; // marks shard as canary (honeypot)
}

export interface EncryptedShard {
  ciphertext: string; // base64-encoded AES-GCM ciphertext
  iv: string; // base64-encoded initialization vector
  salt: string; // base64-encoded PBKDF2 salt
  shardIndex: number;
  vaultId: string;
  isCanary?: boolean;
}

// ─── Vault Metadata ──────────────────────────────────────────────

export interface FeldmanCommitments {
  generator: string; // g as hex
  commitments: string[]; // g^a_j mod p as hex strings
  prime: string; // p as hex
}

export interface VaultMetadata {
  id: string;
  label: string;
  createdAt: string; // ISO timestamp
  threshold: number;
  totalShares: number;
  hash: string; // SHA-256 of metadata
  feldman: FeldmanCommitments;
  displayMode: DisplayMode;
  timerSeconds: number;
  honeypotVaultIds: string[]; // IDs of associated honeypot vaults
}

// ─── Honeypot Types ──────────────────────────────────────────────

export interface HoneypotVault {
  id: string;
  parentVaultId: string; // real vault this protects
  metadata: VaultMetadata; // fake metadata that looks real
  decoySecretHint: string; // what the fake secret looks like
  createdAt: string;
  triggered: boolean;
  triggerLog: HoneypotTrigger[];
}

export interface HoneypotTrigger {
  timestamp: string;
  shardsUsed: number[];
  alertToken: string;
  sourceInfo: string; // descriptive info about the attempt
}

// ─── Reconstruction Types ────────────────────────────────────────

export interface ReconstructionAttempt {
  id: string;
  vaultId: string;
  timestamp: string;
  shardIndices: number[];
  success: boolean;
  isHoneypot: boolean;
  alertToken?: string;
}

// ─── Vault Creation Result ───────────────────────────────────────

export interface VaultCreationResult {
  metadata: VaultMetadata;
  shards: Shard[];
  canaryShards: Shard[];
  honeypots: HoneypotVault[];
}

// ─── Display Configuration ───────────────────────────────────────

export interface DisplayConfig {
  mode: DisplayMode;
  timerSeconds: number;
  watermarkText: string;
  sessionId: string;
}

// ─── Store State ─────────────────────────────────────────────────

export interface VaultState {
  vaults: VaultMetadata[];
  honeypots: HoneypotVault[];
  attempts: ReconstructionAttempt[];

  // Actions
  addVault: (metadata: VaultMetadata) => void;
  removeVault: (vaultId: string) => void;
  addHoneypot: (honeypot: HoneypotVault) => void;
  recordAttempt: (attempt: ReconstructionAttempt) => void;
  triggerHoneypot: (honeypotId: string, trigger: HoneypotTrigger) => void;
  clearAll: () => void;
}
