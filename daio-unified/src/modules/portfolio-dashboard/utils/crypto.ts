// Crypto utilities for DAIO Platform

/**
 * Calculate SHA-256 hash
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a hash chain for proof lab
 */
export async function generateHashChain(entries: string[]): Promise<string[]> {
  const hashes: string[] = [];
  let previousHash = "0".repeat(64); // Genesis hash

  for (const entry of entries) {
    const data = previousHash + entry;
    const hash = await sha256(data);
    hashes.push(hash);
    previousHash = hash;
  }

  return hashes;
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    CHF: "CHF",
    GBP: "£",
  };
  const symbol = symbols[currency] || currency;

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}k`;
  }
  return `${symbol}${value}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
