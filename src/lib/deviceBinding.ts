/**
 * Device Binding via IndexedDB + non-extractable CryptoKey.
 *
 * Creates a device-bound AES-256-GCM key that:
 * 1. Is stored in IndexedDB as a non-extractable CryptoKey object
 * 2. Cannot be exported or cloned via JS — bound to this origin + device
 * 3. Is used as an additional encryption layer on top of the password-based encryption
 *
 * If the user moves their localStorage data to another device, decryption
 * will fail because the device key is missing (not present in localStorage).
 */

const DB_NAME = 'daio-device-keys';
const STORE_NAME = 'keys';
const KEY_ID = 'device-master';

// ─── IndexedDB helpers ──────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<CryptoKey | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Device key management ──────────────────────────────────────

/**
 * Get or create the device-bound encryption key.
 * The key is non-extractable — it can only be used for encrypt/decrypt
 * on this device within this origin.
 */
export async function getDeviceKey(): Promise<CryptoKey> {
  const db = await openDB();

  // Check if key already exists
  const existing = await idbGet(db, KEY_ID);
  if (existing) {
    db.close();
    return existing;
  }

  // Generate a new non-extractable AES-256-GCM key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false, // NON-extractable — this is the critical security property
    ['encrypt', 'decrypt']
  );

  await idbPut(db, KEY_ID, key);
  db.close();
  return key;
}

/**
 * Encrypt data with the device-bound key.
 * Returns hex-encoded ciphertext and IV.
 */
export async function deviceEncrypt(
  data: string
): Promise<{ ciphertext: string; iv: string }> {
  const key = await getDeviceKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return {
    ciphertext: arrayToHex(new Uint8Array(encrypted)),
    iv: arrayToHex(iv),
  };
}

/**
 * Decrypt data with the device-bound key.
 */
export async function deviceDecrypt(
  ciphertext: string,
  iv: string
): Promise<string> {
  const key = await getDeviceKey();

  const ivArr = hexToArray(iv);
  const ctArr = hexToArray(ciphertext);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArr.buffer as ArrayBuffer },
    key,
    ctArr.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Check if device binding is available (IndexedDB + Web Crypto).
 */
export function isDeviceBindingAvailable(): boolean {
  return (
    typeof indexedDB !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined'
  );
}

/**
 * Check if a device key already exists (i.e. device is enrolled).
 */
export async function hasDeviceKey(): Promise<boolean> {
  try {
    const db = await openDB();
    const existing = await idbGet(db, KEY_ID);
    db.close();
    return existing !== undefined;
  } catch {
    return false;
  }
}

// ─── Hex utils (avoid importing from noble in this standalone module) ─

function arrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArray(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
