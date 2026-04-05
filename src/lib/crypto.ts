/**
 * DAIO Wallet - Cryptographic Functions
 */

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import * as secp256k1 from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { getAddress, isAddress } from 'viem';

export function generateWalletMnemonic(strength: 128 | 256 = 256): string {
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonicPhrase(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

export function mnemonicToSeed(mnemonic: string): Uint8Array {
  return mnemonicToSeedSync(mnemonic);
}

export function deriveEthereumAddress(mnemonic: string, index: number = 0): {
  address: string;
  privateKey: string;
  publicKey: string;
} {
  if (!Number.isInteger(index) || index < 0 || index >= 2147483648) {
    throw new Error('Derivation index must be a non-negative integer less than 2^31');
  }
  if (!isValidMnemonicPhrase(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seed = mnemonicToSeed(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const derived = hdkey.derive(`m/44'/60'/0'/0/${index}`);

  if (!derived.privateKey) {
    throw new Error('Failed to derive private key');
  }

  const privateKey = bytesToHex(derived.privateKey);
  const publicKey = secp256k1.getPublicKey(derived.privateKey, false);
  const address = publicKeyToAddress(publicKey);

  return {
    address,
    privateKey,
    publicKey: bytesToHex(publicKey)
  };
}

function publicKeyToAddress(publicKey: Uint8Array): string {
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
    throw new Error('Expected uncompressed public key (65 bytes, 0x04 prefix)');
  }
  const pubKeyWithoutPrefix = publicKey.slice(1);
  const hash = keccak_256(pubKeyWithoutPrefix);
  const addressBytes = hash.slice(-20);
  const rawAddress = '0x' + bytesToHex(addressBytes);
  return getAddress(rawAddress); // EIP-55 checksum
}

export function toChecksumAddress(address: string): string {
  return getAddress(address);
}

export function deriveMultipleAddresses(mnemonic: string, count: number = 5): Array<{
  index: number;
  address: string;
  privateKey: string;
}> {
  if (!isValidMnemonicPhrase(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }
  const seed = mnemonicToSeed(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const addresses = [];

  for (let i = 0; i < count; i++) {
    const derived = hdkey.derive(`m/44'/60'/0'/0/${i}`);
    if (!derived.privateKey) {
      throw new Error(`Failed to derive private key at index ${i}`);
    }
    const privateKey = bytesToHex(derived.privateKey);
    const publicKey = secp256k1.getPublicKey(derived.privateKey, false);
    const address = publicKeyToAddress(publicKey);
    addresses.push({
      index: i,
      address,
      privateKey
    });
  }
  return addresses;
}

function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(arr.byteLength);
  new Uint8Array(buf).set(arr);
  return buf;
}

export async function encryptData(
  data: string,
  password: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  const saltArr = new Uint8Array(16);
  crypto.getRandomValues(saltArr);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(saltArr),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ivArr = new Uint8Array(12);
  crypto.getRandomValues(ivArr);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(ivArr) },
    key,
    dataBytes
  );

  return {
    encrypted: bytesToHex(new Uint8Array(encrypted)),
    iv: bytesToHex(ivArr),
    salt: bytesToHex(saltArr)
  };
}

export async function decryptData(
  encrypted: string,
  iv: string,
  salt: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBytes = hexToBytes(salt);
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(saltBytes),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const encryptedBytes = hexToBytes(encrypted);
  const ivBytes = hexToBytes(iv);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(ivBytes) },
    key,
    toArrayBuffer(encryptedBytes)
  );

  return new TextDecoder().decode(decrypted);
}

export function splitSecret(secret: string, parts: number, threshold: number): string[] {
  if (!Number.isInteger(parts) || !Number.isInteger(threshold)) {
    throw new Error('Parts and threshold must be integers');
  }
  if (threshold < 2) {
    throw new Error('Threshold must be at least 2');
  }
  if (threshold > parts) {
    throw new Error('Threshold cannot exceed parts');
  }
  if (parts < 2 || parts > 255) {
    throw new Error('Parts must be between 2 and 255');
  }

  const secretBytes = new TextEncoder().encode(secret);
  const shares: string[] = [];

  const coefficients: Uint8Array[] = [];
  for (let i = 0; i < threshold - 1; i++) {
    const coef = new Uint8Array(secretBytes.length);
    crypto.getRandomValues(coef);
    coefficients.push(coef);
  }

  for (let x = 1; x <= parts; x++) {
    const share = new Uint8Array(secretBytes.length + 1);
    share[0] = x;

    for (let i = 0; i < secretBytes.length; i++) {
      let y = secretBytes[i];
      for (let j = 0; j < coefficients.length; j++) {
        y ^= gfMul(coefficients[j][i], gfPow(x, j + 1));
      }
      share[i + 1] = y;
    }

    shares.push(bytesToHex(share));
  }

  return shares;
}

export function reconstructSecret(shares: string[]): string {
  if (!shares || shares.length === 0) {
    throw new Error('At least one share is required');
  }

  const shareBytes = shares.map(s => hexToBytes(s));

  // Validate all shares have the same length
  const expectedLength = shareBytes[0].length;
  for (let i = 1; i < shareBytes.length; i++) {
    if (shareBytes[i].length !== expectedLength) {
      throw new Error('All shares must have the same length');
    }
  }

  // Check for duplicate x-coordinates and reject x=0 (would evaluate to the secret)
  const xCoords = new Set<number>();
  for (const s of shareBytes) {
    if (s[0] === 0) {
      throw new Error('Invalid share: x-coordinate 0 is reserved');
    }
    if (xCoords.has(s[0])) {
      throw new Error('Duplicate share detected (same x-coordinate)');
    }
    xCoords.add(s[0]);
  }

  const secretLength = shareBytes[0].length - 1;
  const secret = new Uint8Array(secretLength);

  for (let i = 0; i < secretLength; i++) {
    const points: [number, number][] = shareBytes.map(s => [s[0], s[i + 1]]);
    secret[i] = lagrangeInterpolate(0, points);
  }

  return new TextDecoder().decode(secret);
}

function gfMul(a: number, b: number): number {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p & 0xff;
}

function gfPow(x: number, n: number): number {
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = gfMul(result, x);
  }
  return result;
}

function lagrangeInterpolate(x: number, points: [number, number][]): number {
  let result = 0;

  for (let i = 0; i < points.length; i++) {
    let term = points[i][1];
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const denominator = points[i][0] ^ points[j][0];
        if (denominator === 0) {
          throw new Error('Division by zero in Lagrange interpolation (duplicate points)');
        }
        term = gfMul(term, gfDiv(x ^ points[j][0], denominator));
      }
    }
    result ^= term;
  }

  return result;
}

function gfDiv(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero in GF(256)');
  }
  return gfMul(a, gfInverse(b));
}

function gfInverse(x: number): number {
  if (x === 0) {
    throw new Error('Zero has no inverse in GF(256)');
  }
  return gfPow(x, 254);
}

export function hashData(data: string): string {
  const encoder = new TextEncoder();
  return bytesToHex(keccak_256(encoder.encode(data)));
}

// ─── Argon2id parameters ────────────────────────────────────────
// t=3 (time cost), m=4096 (4 MB), p=1 (parallelism)
// Tuned for browser/client-side performance while being memory-hard.
// Still far stronger than PBKDF2-SHA256 against GPU/ASIC attacks.
const ARGON2_OPTS = { t: 3, m: 4096, p: 1, dkLen: 32 } as const;
const ARGON2_PREFIX = 'argon2id$';

/**
 * Hash password using Argon2id (preferred) with PBKDF2 fallback.
 * Output hash is prefixed with "argon2id$" to identify the algorithm.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltArr = new Uint8Array(16);
  crypto.getRandomValues(saltArr);
  const encoder = new TextEncoder();

  try {
    const { argon2id } = await import('@noble/hashes/argon2.js');
    const derived = argon2id(encoder.encode(password), saltArr, ARGON2_OPTS);
    return {
      hash: ARGON2_PREFIX + bytesToHex(derived),
      salt: bytesToHex(saltArr),
    };
  } catch {
    // Fallback to PBKDF2 if Argon2 fails (e.g. insufficient memory)
    return hashPasswordPBKDF2(password, saltArr);
  }
}

/** Legacy PBKDF2 hash (used as fallback and for verifying old hashes). */
async function hashPasswordPBKDF2(
  password: string,
  saltArr: Uint8Array
): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(saltArr),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return {
    hash: bytesToHex(new Uint8Array(derivedBits)),
    salt: bytesToHex(saltArr)
  };
}

/**
 * Verify password against stored hash.
 * Auto-detects Argon2id (prefixed) vs legacy PBKDF2 hashes.
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const saltBytes = hexToBytes(salt);

  let computedBytes: Uint8Array;

  if (storedHash.startsWith(ARGON2_PREFIX)) {
    // Argon2id verification
    const { argon2id } = await import('@noble/hashes/argon2.js');
    computedBytes = argon2id(encoder.encode(password), saltBytes, ARGON2_OPTS);
    const storedBytes = hexToBytes(storedHash.slice(ARGON2_PREFIX.length));
    return constantTimeEqual(computedBytes, storedBytes);
  }

  // Legacy PBKDF2 verification
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(saltBytes),
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  computedBytes = new Uint8Array(derivedBits);
  const storedBytes = hexToBytes(storedHash);
  return constantTimeEqual(computedBytes, storedBytes);
}

/** Constant-time comparison to prevent timing attacks. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return isAddress(address, { strict: false });
}
