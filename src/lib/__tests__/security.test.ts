/**
 * Security feature tests covering fixes from the design-level audit.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  splitSecret,
  reconstructSecret,
  generateWalletMnemonic,
} from '../crypto';
import { sanitize, isValidHex } from '../utils';
import { decodeCalldata } from '../blockchain';
import {
  checkRateLimit,
  recordAttempt,
  resetRateLimit,
} from '../rateLimit';
import {
  createRecoveryRequest,
  submitFragment,
  type RecoveryConfig,
} from '../socialRecovery';

// ─── Shamir Secret Sharing: x=0 share rejection ────────────────

describe('SSS x=0 share rejection', () => {
  it('rejects a share with x-coordinate 0', () => {
    // Craft a share that starts with 0x00 (x=0)
    const fakeShare = '00aabbccdd';
    const validShare = '01aabbccdd';
    expect(() => reconstructSecret([fakeShare, validShare])).toThrow('x-coordinate 0');
  });

  it('rejects duplicate x-coordinates', () => {
    const secret = 'test-secret';
    const shares = splitSecret(secret, 3, 2);
    // Duplicate the same share
    expect(() => reconstructSecret([shares[0], shares[0]])).toThrow('Duplicate share');
  });

  it('reconstructs correctly with valid shares', () => {
    const secret = 'my test secret phrase';
    const shares = splitSecret(secret, 5, 3);
    const recovered = reconstructSecret([shares[0], shares[2], shares[4]]);
    expect(recovered).toBe(secret);
  });
});

// ─── Majority threshold ────────────────────────────────────────

describe('SSS majority threshold', () => {
  it('3-of-5 scheme uses correct threshold', () => {
    const secret = 'threshold-test';
    const shares = splitSecret(secret, 5, 3);
    expect(shares).toHaveLength(5);
    // 3 shares should reconstruct
    expect(reconstructSecret([shares[0], shares[1], shares[2]])).toBe(secret);
  });

  it('2-of-3 is minimum viable threshold', () => {
    const secret = 'min-threshold';
    const shares = splitSecret(secret, 3, 2);
    expect(shares).toHaveLength(3);
    expect(reconstructSecret([shares[0], shares[2]])).toBe(secret);
  });

  it('threshold must be at least 2', () => {
    expect(() => splitSecret('test', 3, 1)).toThrow();
  });

  it('threshold cannot exceed parts', () => {
    expect(() => splitSecret('test', 3, 4)).toThrow();
  });
});

// ─── Sanitizer hardening ───────────────────────────────────────

describe('sanitize', () => {
  it('strips HTML angle brackets', () => {
    expect(sanitize('<script>alert(1)</script>')).not.toContain('<');
    expect(sanitize('<img onerror=alert(1)>')).not.toContain('<');
  });

  it('strips javascript: protocol', () => {
    expect(sanitize('javascript:alert(1)')).not.toContain('javascript:');
  });

  it('strips javascript: with whitespace evasion', () => {
    expect(sanitize('java script :alert(1)')).not.toMatch(/javascript\s*:/i);
  });

  it('strips vbscript: protocol', () => {
    expect(sanitize('vbscript:MsgBox')).not.toContain('vbscript:');
  });

  it('strips data: URI scheme', () => {
    expect(sanitize('data:text/html,<script>alert(1)</script>')).not.toContain('data:');
  });

  it('strips event handlers', () => {
    expect(sanitize('onload=alert(1)')).not.toMatch(/onload\s*=/i);
    expect(sanitize('onerror = alert(1)')).not.toMatch(/onerror\s*=/i);
  });

  it('strips HTML entities', () => {
    expect(sanitize('&#60;script&#62;')).not.toContain('&#');
  });

  it('strips unicode escapes', () => {
    expect(sanitize('\\u003cscript\\u003e')).not.toMatch(/\\u[\da-fA-F]{4}/);
  });

  it('handles double-encoding attacks', () => {
    // After first pass removes "javascript", the remnants might form "javascript:" again
    const result = sanitize('javascriptjavascript::alert(1)');
    expect(result).not.toContain('javascript:');
  });

  it('enforces max length', () => {
    const long = 'a'.repeat(1000);
    expect(sanitize(long)).toHaveLength(500);
    expect(sanitize(long, 100)).toHaveLength(100);
  });
});

// ─── isValidHex ────────────────────────────────────────────────

describe('isValidHex', () => {
  it('accepts valid hex strings', () => {
    expect(isValidHex('0123456789abcdefABCDEF')).toBe(true);
  });

  it('rejects non-hex characters', () => {
    expect(isValidHex('0xabcdef')).toBe(false); // contains 'x'
    expect(isValidHex('ghijkl')).toBe(false);
    expect(isValidHex('')).toBe(false);
  });
});

// ─── Multicall decode depth limit ──────────────────────────────

describe('decodeCalldata depth limit', () => {
  it('decodes a native transfer', () => {
    const actions = decodeCalldata(undefined, '1000000000000000000', '0x1234567890abcdef1234567890abcdef12345678');
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('native_transfer');
  });

  it('handles unknown selectors gracefully', () => {
    const actions = decodeCalldata('0xdeadbeef', '0', '0x1234567890abcdef1234567890abcdef12345678');
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions[0].type).toBe('contract_call');
    expect(actions[0].details.selector).toBe('0xdeadbeef');
  });

  it('returns empty for zero value with no data', () => {
    const actions = decodeCalldata('0x', '0', '0x1234567890abcdef1234567890abcdef12345678');
    expect(actions).toHaveLength(0);
  });
});

// ─── Rate limiter ──────────────────────────────────────────────

describe('rate limiter', () => {
  beforeEach(() => {
    resetRateLimit('test');
  });

  it('allows requests under the limit', () => {
    const config = { maxAttempts: 3, windowMs: 60000, cooldownMs: 10000 };
    expect(checkRateLimit('test', config)).toEqual({ allowed: true });
    recordAttempt('test');
    expect(checkRateLimit('test', config)).toEqual({ allowed: true });
    recordAttempt('test');
    expect(checkRateLimit('test', config)).toEqual({ allowed: true });
    recordAttempt('test');
  });

  it('blocks after exceeding the limit', () => {
    const config = { maxAttempts: 2, windowMs: 60000, cooldownMs: 5000 };
    // checkRateLimit initializes state, then recordAttempt logs the attempt
    expect(checkRateLimit('test', config).allowed).toBe(true);
    recordAttempt('test');
    expect(checkRateLimit('test', config).allowed).toBe(true);
    recordAttempt('test');
    // Now 2 attempts logged — next check should block
    const result = checkRateLimit('test', config);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it('resetRateLimit clears the limiter', () => {
    const config = { maxAttempts: 1, windowMs: 60000, cooldownMs: 5000 };
    recordAttempt('test');
    checkRateLimit('test', config); // trigger lockout
    resetRateLimit('test');
    // Should be allowed again after reset
    const r1 = checkRateLimit('test', config);
    expect(r1.allowed).toBe(true);
  });
});

// ─── Social recovery: fragment validation ──────────────────────

describe('social recovery fragment validation', () => {
  const config: RecoveryConfig = {
    enabled: true,
    vetoPeriodHours: 48,
    requiredGuardians: 2,
    maxRecoveryAttempts: 3,
    currentAttempts: 0,
  };

  it('rejects non-hex fragments', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(() => submitFragment(request, 'g2', 'not-hex-at-all!')).toThrow('hex string');
  });

  it('rejects empty fragments', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(() => submitFragment(request, 'g2', '')).toThrow('hex string');
  });

  it('rejects too-short fragments', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(() => submitFragment(request, 'g2', 'ab')).toThrow('too short');
  });

  it('rejects unrecognised guardian ID when allowlist provided', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(() => submitFragment(request, 'unknown', 'aabbccdd', ['g1', 'g2'])).toThrow('Unrecognised');
  });

  it('accepts valid fragment from recognised guardian', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    const updated = submitFragment(request, 'g2', 'aabbccdd', ['g1', 'g2', 'g3']);
    expect(updated.fragmentsCollected).toContain('aabbccdd');
    expect(updated.guardianApprovals).toContain('g2');
  });

  it('returns updatedConfig with incremented attempts', () => {
    const { updatedConfig } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(updatedConfig.currentAttempts).toBe(1);
  });

  it('rejects when max attempts exceeded', () => {
    const maxedConfig = { ...config, currentAttempts: 3 };
    expect(() => createRecoveryRequest('g1', 'Guardian 1', 'test', maxedConfig)).toThrow('Maximum recovery');
  });

  it('prevents duplicate guardian submissions', () => {
    const { request } = createRecoveryRequest('g1', 'Guardian 1', 'test', config);
    expect(() => submitFragment(request, 'g1', 'aabbccdd')).toThrow('already submitted');
  });
});

// ─── Mnemonic-based reconstruction validation ──────────────────

describe('SSS mnemonic roundtrip', () => {
  it('reconstructs a real BIP-39 mnemonic from shares', () => {
    const mnemonic = generateWalletMnemonic();
    const shares = splitSecret(mnemonic, 5, 3);
    const recovered = reconstructSecret([shares[1], shares[3], shares[4]]);
    expect(recovered).toBe(mnemonic);
  });

  it('wrong combination of shares produces incorrect mnemonic', () => {
    const mnemonic = generateWalletMnemonic();
    const shares = splitSecret(mnemonic, 5, 4); // threshold=4
    // Only provide 3 shares (below threshold) — result will be garbage
    const recovered = reconstructSecret([shares[0], shares[1], shares[2]]);
    // Should NOT match the original mnemonic
    expect(recovered).not.toBe(mnemonic);
  });
});
