// DAIO Vault Protocol — Shard Encryption Utilities
// Uses Web Crypto API: PBKDF2 + AES-GCM

import type { Shard, EncryptedShard, VaultMetadata } from "../types";

// ─── Base64 Helpers ──────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Key Derivation ──────────────────────────────────────────────

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ─── Shard Encryption ────────────────────────────────────────────

export async function encryptShard(
  shard: Shard,
  password: string
): Promise<EncryptedShard> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(
    JSON.stringify({ index: shard.index, value: shard.value })
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
    shardIndex: shard.index,
    vaultId: shard.vaultId,
    isCanary: shard.isCanary,
  };
}

export async function decryptShard(
  encrypted: EncryptedShard,
  password: string
): Promise<Shard> {
  const salt = new Uint8Array(base64ToArrayBuffer(encrypted.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encrypted.iv));
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
  const key = await deriveKey(password, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const parsed = JSON.parse(decoder.decode(plaintext));

  return {
    index: parsed.index,
    value: parsed.value,
    vaultId: encrypted.vaultId,
    isCanary: encrypted.isCanary,
  };
}

// ─── Export/Import ───────────────────────────────────────────────

export function exportShardAsJSON(shard: EncryptedShard): string {
  return JSON.stringify(shard, null, 2);
}

export function importShardFromJSON(json: string): EncryptedShard {
  const parsed = JSON.parse(json);
  if (!parsed.ciphertext || !parsed.iv || !parsed.salt || !parsed.vaultId) {
    throw new Error("Invalid shard format");
  }
  return parsed as EncryptedShard;
}

export function exportShardAsQR(shard: EncryptedShard): string {
  // Compact format for QR code
  return btoa(JSON.stringify(shard));
}

export function importShardFromQR(data: string): EncryptedShard {
  let parsed: unknown;
  try {
    parsed = JSON.parse(atob(data));
  } catch (e) {
    throw new Error("Invalid QR data: failed to decode or parse JSON");
  }

  const shard = parsed as Record<string, unknown>;
  if (
    !shard ||
    typeof shard !== "object" ||
    !shard.ciphertext ||
    !shard.iv ||
    !shard.salt ||
    !shard.vaultId ||
    typeof shard.shardIndex !== "number" ||
    typeof shard.isCanary !== "boolean"
  ) {
    throw new Error(
      "Invalid shard format: missing required fields (ciphertext, iv, salt, vaultId)"
    );
  }

  return shard as unknown as EncryptedShard;
}

// ─── Vault Metadata Hashing ─────────────────────────────────────

export async function hashVaultMetadata(
  metadata: Omit<VaultMetadata, "hash">
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    JSON.stringify({
      id: metadata.id,
      label: metadata.label,
      createdAt: metadata.createdAt,
      threshold: metadata.threshold,
      totalShares: metadata.totalShares,
      feldman: metadata.feldman,
    })
  );

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify that a vault's metadata hash matches its contents.
 * Returns true if integrity check passes.
 */
export async function verifyVaultMetadataIntegrity(
  metadata: VaultMetadata
): Promise<boolean> {
  if (!metadata.hash) return false;
  const computed = await hashVaultMetadata(metadata);
  return computed === metadata.hash;
}
