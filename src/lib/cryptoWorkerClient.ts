/**
 * Main-thread client for the Crypto Web Worker.
 * Provides typed RPC methods that delegate to the worker and return promises.
 *
 * Falls back to direct (main-thread) execution if Workers are unavailable.
 */

import type { WorkerRequest, WorkerResponse } from './cryptoWorker';

// ─── Worker singleton ───────────────────────────────────────────

let worker: Worker | null = null;
const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
let idCounter = 0;

function getWorker(): Worker | null {
  if (worker) return worker;
  if (typeof Worker === 'undefined') return null;

  try {
    worker = new Worker(new URL('./cryptoWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);

      if ('error' in msg) {
        entry.reject(new Error(msg.error));
      } else {
        entry.resolve(msg.result);
      }
    };

    worker.onerror = (err) => {
      // Reject all pending calls and reset worker
      for (const [id, entry] of pending) {
        entry.reject(new Error(`Worker error: ${err.message}`));
        pending.delete(id);
      }
      worker = null;
    };

    return worker;
  } catch {
    // Worker creation failed (e.g. CSP restrictions) — will use fallback
    return null;
  }
}

function rpc<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const w = getWorker();
  if (!w) {
    // Fallback: reject and let caller use direct functions
    return Promise.reject(new Error('Web Worker unavailable'));
  }

  const id = `rpc-${++idCounter}`;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: resolve as (v: unknown) => void,
      reject,
    });
    w.postMessage({ id, method, params } as WorkerRequest);
  });
}

// ─── Typed RPC methods ──────────────────────────────────────────

export async function workerGenerateMnemonic(strength: 128 | 256 = 256): Promise<string> {
  return rpc<string>('generateMnemonic', { strength });
}

export async function workerValidateMnemonic(mnemonic: string): Promise<boolean> {
  return rpc<boolean>('validateMnemonic', { mnemonic });
}

export async function workerDeriveAddress(
  mnemonic: string,
  index: number
): Promise<{ index: number; address: string; privateKey: string; publicKey: string }> {
  return rpc('deriveAddress', { mnemonic, index });
}

export async function workerDeriveMultiple(
  mnemonic: string,
  count: number
): Promise<Array<{ index: number; address: string; privateKey: string }>> {
  return rpc('deriveMultiple', { mnemonic, count });
}

export async function workerSplitSecret(
  secret: string,
  parts: number,
  threshold: number
): Promise<string[]> {
  return rpc<string[]>('splitSecret', { secret, parts, threshold });
}

export async function workerReconstructSecret(shares: string[]): Promise<string> {
  return rpc<string>('reconstructSecret', { shares });
}

export async function workerSignHash(
  hash: string,
  privateKey: string
): Promise<{ r: string; s: string; recovery: number }> {
  return rpc('signHash', { hash, privateKey });
}

/**
 * Check whether the Web Worker is available.
 */
export function isWorkerAvailable(): boolean {
  return getWorker() !== null;
}

/**
 * Terminate the worker (e.g. on wallet lock).
 */
export function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    // Reject any remaining pending calls
    for (const [id, entry] of pending) {
      entry.reject(new Error('Worker terminated'));
      pending.delete(id);
    }
  }
}
