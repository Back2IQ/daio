// DAIO Vault Protocol — Shamir's Secret Sharing
// Pure BigInt implementation over GF(p)
// Information-theoretically secure, offline-capable, post-quantum resistant

import type { Shard, FeldmanCommitments } from "../types";

// Safe 256-bit prime: 2^256 - 189
const PRIME =
  115792089237316195423570985008687907853269984665640564039457584007913129639747n;

// Generator for Feldman VSS commitments (small generator sufficient for demo)
const GENERATOR = 2n;

// ─── Modular Arithmetic ──────────────────────────────────────────

function mod(a: bigint, m: bigint): bigint {
  const result = a % m;
  return result >= 0n ? result : result + m;
}

function modInverse(a: bigint, m: bigint): bigint {
  // Extended Euclidean Algorithm
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1n, 0n];

  while (r !== 0n) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }

  if (oldR !== 1n) {
    throw new Error("Modular inverse does not exist");
  }

  return mod(oldS, m);
}

function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let result = 1n;
  base = mod(base, m);
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = mod(result * base, m);
    }
    exp = exp / 2n;
    base = mod(base * base, m);
  }
  return result;
}

// ─── Random BigInt Generation ────────────────────────────────────

function randomBigInt(max: bigint): bigint {
  // Generate random bytes sufficient for 256-bit number
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte);
  }

  return mod(result, max);
}

// ─── Secret ↔ BigInt Conversion ──────────────────────────────────

function secretToBigInt(secret: string): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(secret);
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte);
  }
  // Ensure secret fits in field
  if (result >= PRIME) {
    throw new Error("Secret too large for field. Max ~32 bytes.");
  }
  return result;
}

function bigIntToSecret(value: bigint): string {
  if (value === 0n) return "";
  const bytes: number[] = [];
  let v = value;
  while (v > 0n) {
    bytes.unshift(Number(v & 0xffn));
    v >>= 8n;
  }
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(bytes));
}

function bigIntToHex(value: bigint): string {
  return value.toString(16).padStart(64, "0");
}

function hexToBigInt(hex: string): bigint {
  return BigInt("0x" + hex);
}

// ─── Shamir Split ────────────────────────────────────────────────

export function generateShares(
  secret: string,
  threshold: number,
  totalShares: number,
  vaultId: string
): { shards: Shard[]; coefficients: bigint[] } {
  if (threshold < 2) throw new Error("Threshold must be >= 2");
  if (totalShares < threshold)
    throw new Error("Total shares must be >= threshold");
  if (totalShares > 255) throw new Error("Maximum 255 shares supported");

  const secretBigInt = secretToBigInt(secret);

  // Generate random polynomial: f(x) = secret + a1*x + a2*x^2 + ... + a(t-1)*x^(t-1)
  const coefficients: bigint[] = [secretBigInt];
  for (let i = 1; i < threshold; i++) {
    coefficients.push(randomBigInt(PRIME));
  }

  // Evaluate polynomial at points 1...N
  const shards: Shard[] = [];
  for (let i = 1; i <= totalShares; i++) {
    const x = BigInt(i);
    let y = 0n;
    for (let j = 0; j < coefficients.length; j++) {
      y = mod(y + mod(coefficients[j] * modPow(x, BigInt(j), PRIME), PRIME), PRIME);
    }
    shards.push({
      index: i,
      value: bigIntToHex(y),
      vaultId,
    });
  }

  return { shards, coefficients };
}

// ─── Shamir Reconstruct ──────────────────────────────────────────

export function reconstructSecret(shards: Shard[], threshold?: number): string {
  if (shards.length < 2) throw new Error("Need at least 2 shards");

  if (threshold !== undefined && shards.length < threshold) {
    throw new Error(
      `Insufficient shards: got ${shards.length}, need at least ${threshold} (threshold) to reconstruct the secret`
    );
  }

  // Validate all shards have unique indices
  const indices = new Set(shards.map((s) => s.index));
  if (indices.size !== shards.length) {
    throw new Error("Duplicate shard indices detected — each shard must have a unique index");
  }

  // Validate all shards belong to the same vault (if vaultId present)
  const vaultIds = new Set(shards.filter((s) => s.vaultId).map((s) => s.vaultId));
  if (vaultIds.size > 1) {
    throw new Error("Shards belong to different vaults — cannot reconstruct");
  }

  // Lagrange interpolation at x=0
  let secret = 0n;

  for (let i = 0; i < shards.length; i++) {
    const xi = BigInt(shards[i].index);
    const yi = hexToBigInt(shards[i].value);

    // Calculate Lagrange basis polynomial L_i(0)
    let numerator = 1n;
    let denominator = 1n;

    for (let j = 0; j < shards.length; j++) {
      if (i === j) continue;
      const xj = BigInt(shards[j].index);

      // L_i(0) = product of (0 - xj) / (xi - xj)
      numerator = mod(numerator * mod(-xj, PRIME), PRIME);
      denominator = mod(denominator * mod(xi - xj, PRIME), PRIME);
    }

    const lagrangeCoeff = mod(
      numerator * modInverse(denominator, PRIME),
      PRIME
    );
    secret = mod(secret + mod(yi * lagrangeCoeff, PRIME), PRIME);
  }

  return bigIntToSecret(secret);
}

// ─── Feldman VSS (Verifiable Secret Sharing) ─────────────────────

export function generateFeldmanCommitments(
  coefficients: bigint[]
): FeldmanCommitments {
  // C_j = g^(a_j) mod p
  const commitments = coefficients.map((coeff) =>
    bigIntToHex(modPow(GENERATOR, coeff, PRIME))
  );

  return {
    generator: bigIntToHex(GENERATOR),
    commitments,
    prime: bigIntToHex(PRIME),
  };
}

export function verifyShare(
  shard: Shard,
  feldman: FeldmanCommitments
): boolean {
  const g = hexToBigInt(feldman.generator);
  const p = hexToBigInt(feldman.prime);
  const shardValue = hexToBigInt(shard.value);

  // LHS: g^(share_value) mod p
  const lhs = modPow(g, shardValue, p);

  // RHS: product of C_j^(i^j) mod p
  let rhs = 1n;
  const x = BigInt(shard.index);

  for (let j = 0; j < feldman.commitments.length; j++) {
    const cj = hexToBigInt(feldman.commitments[j]);
    const exponent = modPow(x, BigInt(j), p);
    rhs = mod(rhs * modPow(cj, exponent, p), p);
  }

  return lhs === rhs;
}

// ─── Utility Exports ─────────────────────────────────────────────

export function getFieldPrime(): string {
  return bigIntToHex(PRIME);
}

export { bigIntToHex, hexToBigInt, randomBigInt, PRIME, GENERATOR };
