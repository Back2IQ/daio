import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize a user-provided string to prevent XSS when rendered.
 * Strips HTML tags and limits length.
 */
export function sanitize(input: string, maxLength = 500): string {
  let clean = input
    .replace(/[<>]/g, '')              // strip angle brackets
    .replace(/javascript\s*:/gi, '')   // strip JS protocol (with optional whitespace)
    .replace(/vbscript\s*:/gi, '')     // strip VBScript protocol
    .replace(/data\s*:/gi, '')         // strip data: URI scheme
    .replace(/on\w+\s*=/gi, '')        // strip event handlers (with optional whitespace)
    .replace(/&#\w+;?/g, '')           // strip HTML entities (encoding bypasses)
    .replace(/\\u[\da-fA-F]{4}/g, '')  // strip unicode escapes
    .slice(0, maxLength);
  // Second pass: catch double-encoding attacks (e.g. "javascriptjavascript::" → "javascript:")
  const secondPass = clean
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '');
  if (secondPass !== clean) clean = secondPass;
  return clean;
}

/**
 * Validate a hex string (Shamir share, tx hash, etc.)
 */
export function isValidHex(value: string): boolean {
  return /^[0-9a-fA-F]+$/.test(value);
}
