/**
 * Client-side rate limiter for sensitive operations.
 * Uses a sliding window to track attempts and enforce cooldowns.
 */

interface RateLimitConfig {
  /** Maximum attempts allowed within the window. */
  maxAttempts: number;
  /** Time window in milliseconds. */
  windowMs: number;
  /** Cooldown in milliseconds after limit is reached. */
  cooldownMs: number;
}

interface RateLimitState {
  attempts: number[];
  lockedUntil: number;
}

const limiters = new Map<string, RateLimitState>();

/**
 * Check whether an operation is currently rate-limited.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  let state = limiters.get(key);

  if (!state) {
    state = { attempts: [], lockedUntil: 0 };
    limiters.set(key, state);
  }

  // Check hard lockout
  if (state.lockedUntil > now) {
    return { allowed: false, retryAfterMs: state.lockedUntil - now };
  }

  // Prune attempts outside the window
  state.attempts = state.attempts.filter((t) => now - t < config.windowMs);

  if (state.attempts.length >= config.maxAttempts) {
    state.lockedUntil = now + config.cooldownMs;
    return { allowed: false, retryAfterMs: config.cooldownMs };
  }

  return { allowed: true };
}

/**
 * Record an attempt for a rate-limited operation.
 * Call this *after* checkRateLimit returns `allowed: true`.
 */
export function recordAttempt(key: string): void {
  const state = limiters.get(key);
  if (state) {
    state.attempts.push(Date.now());
  }
}

/**
 * Reset the rate limiter for a key (e.g. after successful auth).
 */
export function resetRateLimit(key: string): void {
  limiters.delete(key);
}

// ─── Pre-configured limiters for common operations ──────────────

export const RATE_LIMITS = {
  /** Password unlock: 5 attempts per 60s, 120s cooldown. */
  UNLOCK: { maxAttempts: 5, windowMs: 60_000, cooldownMs: 120_000 },
  /** Emergency trigger: 3 attempts per 300s, 600s cooldown. */
  EMERGENCY: { maxAttempts: 3, windowMs: 300_000, cooldownMs: 600_000 },
  /** Recovery request: 3 attempts per 600s, 900s cooldown. */
  RECOVERY: { maxAttempts: 3, windowMs: 600_000, cooldownMs: 900_000 },
  /** Send transaction: 10 attempts per 60s, 30s cooldown. */
  SEND_TX: { maxAttempts: 10, windowMs: 60_000, cooldownMs: 30_000 },
} as const;
