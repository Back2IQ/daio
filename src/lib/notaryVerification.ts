/**
 * Notary Digital Verification.
 * Document upload, hash anchoring (on-chain hash of death certificate),
 * and notary verification transaction signing.
 */

import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { encodeFunctionData, parseAbi, type Hex, type Address } from 'viem';

// ─── Types ───────────────────────────────────────────────────────

export type DocumentType =
  | 'death_certificate'
  | 'court_order'
  | 'power_of_attorney'
  | 'identity_document'
  | 'notarized_declaration'
  | 'other';

export type VerificationStatus =
  | 'pending'
  | 'hash_computed'
  | 'anchored'
  | 'verified'
  | 'rejected';

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  documentHash: string;       // keccak256 of file contents
  anchorTxHash?: string;      // on-chain anchor tx hash
  anchorChainId?: number;
  status: VerificationStatus;
  notaryId?: string;
  notarySignature?: string;
  verifiedAt?: number;
  rejectionReason?: string;
  metadata: Record<string, string>;
}

export interface NotaryAction {
  id: string;
  action: 'verify' | 'reject' | 'anchor';
  documentId: string;
  notaryId: string;
  timestamp: number;
  details: string;
  txHash?: string;
}

// ─── Document hash computation ───────────────────────────────────

/**
 * Compute the keccak256 hash of a file's contents.
 */
export async function hashDocument(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return '0x' + bytesToHex(keccak_256(bytes));
}

/**
 * Create a verification document record from a file upload.
 */
export async function createVerificationDocument(
  file: File,
  type: DocumentType,
  metadata?: Record<string, string>
): Promise<VerificationDocument> {
  const documentHash = await hashDocument(file);

  return {
    id: crypto.randomUUID(),
    type,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: Date.now(),
    documentHash,
    status: 'hash_computed',
    metadata: metadata || {},
  };
}

// ─── On-chain hash anchoring ─────────────────────────────────────

const anchorAbi = parseAbi([
  'function anchor(bytes32 documentHash, uint256 timestamp) external',
]);

/**
 * Build a transaction to anchor a document hash on-chain.
 * Uses a simple storage contract pattern.
 */
export function buildAnchorTx(
  contractAddress: Address,
  documentHash: string,
  timestamp: number
): { to: Address; data: Hex; value: bigint } {
  return {
    to: contractAddress,
    data: encodeFunctionData({
      abi: anchorAbi,
      functionName: 'anchor',
      args: [documentHash as Hex, BigInt(timestamp)],
    }),
    value: 0n,
  };
}

// ─── Notary verification ─────────────────────────────────────────

const verifyAbi = parseAbi([
  'function verify(bytes32 documentHash, address notary, bytes signature) external',
]);

/**
 * Build a transaction for notary verification of a document.
 */
export function buildVerifyTx(
  contractAddress: Address,
  documentHash: string,
  notaryAddress: Address,
  signature: Hex
): { to: Address; data: Hex; value: bigint } {
  return {
    to: contractAddress,
    data: encodeFunctionData({
      abi: verifyAbi,
      functionName: 'verify',
      args: [documentHash as Hex, notaryAddress, signature],
    }),
    value: 0n,
  };
}

// ─── Document type helpers ───────────────────────────────────────

export function getDocumentTypeLabel(type: DocumentType): string {
  switch (type) {
    case 'death_certificate': return 'Death Certificate';
    case 'court_order': return 'Court Order';
    case 'power_of_attorney': return 'Power of Attorney';
    case 'identity_document': return 'Identity Document';
    case 'notarized_declaration': return 'Notarized Declaration';
    case 'other': return 'Other Document';
  }
}

export function getDocumentTypes(): { value: DocumentType; label: string }[] {
  return [
    { value: 'death_certificate', label: 'Death Certificate' },
    { value: 'court_order', label: 'Court Order' },
    { value: 'power_of_attorney', label: 'Power of Attorney' },
    { value: 'identity_document', label: 'Identity Document' },
    { value: 'notarized_declaration', label: 'Notarized Declaration' },
    { value: 'other', label: 'Other Document' },
  ];
}

export function getVerificationStatusColor(status: VerificationStatus): string {
  switch (status) {
    case 'pending': return 'bg-slate-100 text-slate-600';
    case 'hash_computed': return 'bg-blue-100 text-blue-700';
    case 'anchored': return 'bg-amber-100 text-amber-700';
    case 'verified': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
  }
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case 'pending': return 'Pending Upload';
    case 'hash_computed': return 'Hash Computed';
    case 'anchored': return 'On-Chain Anchored';
    case 'verified': return 'Verified by Notary';
    case 'rejected': return 'Rejected';
  }
}

// ─── Accepted file types ─────────────────────────────────────────

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateDocumentFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  const parts = file.name.split('.');
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
  if (!ext || !ACCEPTED_FILE_TYPES.split(',').includes(ext)) {
    return `Invalid file type. Accepted: ${ACCEPTED_FILE_TYPES}`;
  }
  return null;
}
