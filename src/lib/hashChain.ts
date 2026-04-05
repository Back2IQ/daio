/**
 * DAIO Hash Chain — Tamper-evident proof chain for Inheritance Containers.
 *
 * Each entry contains:
 *   - SHA-256 hash of the container state at that point
 *   - Hash of the previous entry (chain integrity)
 *   - Timestamp and action description
 *
 * If any entry is altered, the chain breaks and verification fails.
 * This is the "Legacy Proof Protocol" — not a PDF certificate, a cryptographic chain.
 */

import { hashData } from './crypto';

export interface HashChainEntry {
  index: number;
  timestamp: number;
  action: string;
  dataHash: string;       // keccak-256 of the container snapshot
  previousHash: string;   // hash of the previous entry (genesis: '0')
  entryHash: string;      // hash of this entire entry (for chain integrity)
  containerVersion: number;
  metadata?: Record<string, string>;
}

export interface HashChain {
  entries: HashChainEntry[];
  created: number;
  lastUpdated: number;
}

/**
 * Hash an entry's content (excluding entryHash itself) to produce entryHash.
 */
function computeEntryHash(entry: Omit<HashChainEntry, 'entryHash'>): string {
  const payload = [
    entry.index.toString(),
    entry.timestamp.toString(),
    entry.action,
    entry.dataHash,
    entry.previousHash,
    entry.containerVersion.toString(),
    entry.metadata ? JSON.stringify(entry.metadata) : '',
  ].join('|');
  return hashData(payload);
}

/**
 * Create the genesis (first) entry of a new hash chain.
 */
export function createChain(dataHash: string, action: string = 'container_created'): HashChain {
  const now = Date.now();
  const partial: Omit<HashChainEntry, 'entryHash'> = {
    index: 0,
    timestamp: now,
    action,
    dataHash,
    previousHash: '0'.repeat(64),
    containerVersion: 1,
  };

  const entry: HashChainEntry = {
    ...partial,
    entryHash: computeEntryHash(partial),
  };

  return {
    entries: [entry],
    created: now,
    lastUpdated: now,
  };
}

/**
 * Append a new entry to an existing chain.
 * Returns a new chain (immutable — never mutate the original).
 */
export function appendEntry(
  chain: HashChain,
  dataHash: string,
  action: string,
  containerVersion: number,
  metadata?: Record<string, string>,
): HashChain {
  const lastEntry = chain.entries[chain.entries.length - 1];
  const now = Date.now();

  const partial: Omit<HashChainEntry, 'entryHash'> = {
    index: lastEntry.index + 1,
    timestamp: now,
    action,
    dataHash,
    previousHash: lastEntry.entryHash,
    containerVersion,
    metadata,
  };

  const entry: HashChainEntry = {
    ...partial,
    entryHash: computeEntryHash(partial),
  };

  return {
    entries: [...chain.entries, entry],
    created: chain.created,
    lastUpdated: now,
  };
}

/**
 * Verify the entire chain is intact. Returns the index of the first broken link, or -1 if valid.
 */
export function verifyChain(chain: HashChain): { valid: boolean; brokenAt: number } {
  if (chain.entries.length === 0) {
    return { valid: false, brokenAt: 0 };
  }

  for (let i = 0; i < chain.entries.length; i++) {
    const entry = chain.entries[i];

    // Recompute the entry hash and compare
    const { entryHash, ...rest } = entry;
    const computed = computeEntryHash(rest);
    if (computed !== entryHash) {
      return { valid: false, brokenAt: i };
    }

    // Check chain linkage (skip genesis)
    if (i > 0) {
      const prev = chain.entries[i - 1];
      if (entry.previousHash !== prev.entryHash) {
        return { valid: false, brokenAt: i };
      }
    } else {
      // Genesis must point to zero-hash
      if (entry.previousHash !== '0'.repeat(64)) {
        return { valid: false, brokenAt: 0 };
      }
    }
  }

  return { valid: true, brokenAt: -1 };
}

/**
 * Get a human-readable summary of the chain for audit export.
 */
export function getChainSummary(chain: HashChain): string {
  const { valid, brokenAt } = verifyChain(chain);
  const lines: string[] = [
    `DAIO Legacy Proof Chain`,
    `Created: ${new Date(chain.created).toISOString()}`,
    `Entries: ${chain.entries.length}`,
    `Integrity: ${valid ? 'VERIFIED' : `BROKEN at entry ${brokenAt}`}`,
    `---`,
  ];

  for (const entry of chain.entries) {
    lines.push(
      `[${entry.index}] ${new Date(entry.timestamp).toISOString()} | ${entry.action} | v${entry.containerVersion}`,
      `  Data:  ${entry.dataHash.slice(0, 16)}...`,
      `  Entry: ${entry.entryHash.slice(0, 16)}...`,
      `  Prev:  ${entry.previousHash.slice(0, 16)}...`,
    );
  }

  return lines.join('\n');
}

/**
 * Export the chain as a JSON blob for external verification.
 */
export function exportChain(chain: HashChain): string {
  return JSON.stringify(chain, null, 2);
}

/**
 * Import a chain from a JSON string, verifying integrity.
 */
export function importChain(json: string): { chain: HashChain; valid: boolean } {
  const chain: HashChain = JSON.parse(json);
  const { valid } = verifyChain(chain);
  return { chain, valid };
}
