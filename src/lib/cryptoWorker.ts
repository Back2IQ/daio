/**
 * Crypto Web Worker — runs key-sensitive operations off the main thread.
 *
 * The worker accepts typed messages and returns results.
 * Private keys and mnemonics never need to transit through the main thread's
 * global scope — they stay inside the Worker's isolated execution context.
 *
 * Usage from main thread:
 *   import { cryptoWorkerRPC } from '@/lib/cryptoWorkerClient';
 *   const mnemonic = await cryptoWorkerRPC('generateMnemonic', { strength: 256 });
 */

// This file is loaded as a Web Worker via `new Worker(new URL(...), { type: 'module' })`
// Vite handles the bundling automatically.

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import * as secp256k1 from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { getAddress } from 'viem';

// ─── Worker message types ───────────────────────────────────────

export type WorkerRequest =
  | { id: string; method: 'generateMnemonic'; params: { strength: 128 | 256 } }
  | { id: string; method: 'validateMnemonic'; params: { mnemonic: string } }
  | { id: string; method: 'deriveAddress'; params: { mnemonic: string; index: number } }
  | { id: string; method: 'deriveMultiple'; params: { mnemonic: string; count: number } }
  | { id: string; method: 'splitSecret'; params: { secret: string; parts: number; threshold: number } }
  | { id: string; method: 'reconstructSecret'; params: { shares: string[] } }
  | { id: string; method: 'signHash'; params: { hash: string; privateKey: string } };

export type WorkerResponse =
  | { id: string; result: unknown }
  | { id: string; error: string };

// ─── Key derivation helpers ─────────────────────────────────────

function publicKeyToAddress(publicKey: Uint8Array): string {
  const pubKeyWithoutPrefix = publicKey.slice(1);
  const hash = keccak_256(pubKeyWithoutPrefix);
  const addressBytes = hash.slice(-20);
  return getAddress('0x' + bytesToHex(addressBytes));
}

function deriveAddress(mnemonic: string, index: number) {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const derived = hdkey.derive(`m/44'/60'/0'/0/${index}`);
  if (!derived.privateKey) throw new Error('Failed to derive private key');
  const privateKey = bytesToHex(derived.privateKey);
  const publicKey = secp256k1.getPublicKey(derived.privateKey, false);
  const address = publicKeyToAddress(publicKey);
  return { index, address, privateKey, publicKey: bytesToHex(publicKey) };
}

// ─── Shamir SSS (GF(256)) ──────────────────────────────────────

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
  for (let i = 0; i < n; i++) result = gfMul(result, x);
  return result;
}

function gfInverse(x: number): number {
  if (x === 0) throw new Error('Zero has no inverse in GF(256)');
  return gfPow(x, 254);
}

function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF(256)');
  return gfMul(a, gfInverse(b));
}

function splitSecretWorker(secret: string, parts: number, threshold: number): string[] {
  if (threshold < 2) throw new Error('Threshold must be at least 2');
  if (threshold > parts) throw new Error('Threshold cannot exceed parts');
  if (parts < 2 || parts > 255) throw new Error('Parts must be between 2 and 255');

  const secretBytes = new TextEncoder().encode(secret);
  const coefficients: Uint8Array[] = [];
  for (let i = 0; i < threshold - 1; i++) {
    const coef = new Uint8Array(secretBytes.length);
    crypto.getRandomValues(coef);
    coefficients.push(coef);
  }

  const shares: string[] = [];
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

function reconstructSecretWorker(shares: string[]): string {
  if (!shares || shares.length === 0) throw new Error('At least one share is required');
  const shareBytes = shares.map(s => hexToBytes(s));
  const expectedLength = shareBytes[0].length;
  for (let i = 1; i < shareBytes.length; i++) {
    if (shareBytes[i].length !== expectedLength) throw new Error('All shares must have the same length');
  }

  const xCoords = new Set<number>();
  for (const s of shareBytes) {
    if (s[0] === 0) throw new Error('Invalid share: x-coordinate 0 is reserved');
    if (xCoords.has(s[0])) throw new Error('Duplicate share detected');
    xCoords.add(s[0]);
  }

  const secretLength = shareBytes[0].length - 1;
  const secret = new Uint8Array(secretLength);
  for (let i = 0; i < secretLength; i++) {
    const points: [number, number][] = shareBytes.map(s => [s[0], s[i + 1]]);
    let result = 0;
    for (let pi = 0; pi < points.length; pi++) {
      let term = points[pi][1];
      for (let pj = 0; pj < points.length; pj++) {
        if (pi !== pj) {
          const denom = points[pi][0] ^ points[pj][0];
          if (denom === 0) throw new Error('Division by zero in Lagrange interpolation');
          term = gfMul(term, gfDiv(0 ^ points[pj][0], denom));
        }
      }
      result ^= term;
    }
    secret[i] = result;
  }
  return new TextDecoder().decode(secret);
}

// ─── Message handler ────────────────────────────────────────────

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  try {
    let result: unknown;
    switch (msg.method) {
      case 'generateMnemonic':
        result = generateMnemonic(wordlist, msg.params.strength);
        break;
      case 'validateMnemonic':
        result = validateMnemonic(msg.params.mnemonic, wordlist);
        break;
      case 'deriveAddress':
        result = deriveAddress(msg.params.mnemonic, msg.params.index);
        break;
      case 'deriveMultiple': {
        const addrs = [];
        for (let i = 0; i < msg.params.count; i++) {
          addrs.push(deriveAddress(msg.params.mnemonic, i));
        }
        result = addrs;
        break;
      }
      case 'splitSecret':
        result = splitSecretWorker(msg.params.secret, msg.params.parts, msg.params.threshold);
        break;
      case 'reconstructSecret':
        result = reconstructSecretWorker(msg.params.shares);
        break;
      case 'signHash': {
        const privKeyBytes = hexToBytes(msg.params.privateKey);
        const hashBytes = hexToBytes(msg.params.hash.replace(/^0x/, ''));
        const sigBytes = secp256k1.sign(hashBytes, privKeyBytes);
        // Noble v3 returns 64-byte compact sig (r || s)
        const sigHex = bytesToHex(sigBytes);
        result = {
          r: '0x' + sigHex.slice(0, 64),
          s: '0x' + sigHex.slice(64, 128),
          recovery: 0,
        };
        break;
      }
    }
    self.postMessage({ id: msg.id, result } satisfies WorkerResponse);
  } catch (err) {
    self.postMessage({
      id: msg.id,
      error: err instanceof Error ? err.message : 'Worker error',
    } satisfies WorkerResponse);
  }
};
