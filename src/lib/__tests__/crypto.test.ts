import { describe, it, expect } from 'vitest';
import {
  generateWalletMnemonic,
  isValidMnemonicPhrase,
  deriveEthereumAddress,
  deriveMultipleAddresses,
  splitSecret,
  reconstructSecret,
  hashData,
  formatAddress,
  isValidAddress,
  toChecksumAddress,
  encryptData,
  decryptData,
} from '../crypto';

describe('generateWalletMnemonic', () => {
  it('generates a valid 24-word mnemonic by default', () => {
    const mnemonic = generateWalletMnemonic();
    const words = mnemonic.split(' ');
    expect(words).toHaveLength(24);
    expect(isValidMnemonicPhrase(mnemonic)).toBe(true);
  });

  it('generates a valid 12-word mnemonic with 128-bit strength', () => {
    const mnemonic = generateWalletMnemonic(128);
    const words = mnemonic.split(' ');
    expect(words).toHaveLength(12);
    expect(isValidMnemonicPhrase(mnemonic)).toBe(true);
  });
});

describe('isValidMnemonicPhrase', () => {
  it('returns true for valid mnemonic', () => {
    const mnemonic = generateWalletMnemonic();
    expect(isValidMnemonicPhrase(mnemonic)).toBe(true);
  });

  it('returns false for invalid mnemonic', () => {
    expect(isValidMnemonicPhrase('invalid words here')).toBe(false);
    expect(isValidMnemonicPhrase('')).toBe(false);
  });
});

describe('deriveEthereumAddress', () => {
  const mnemonic = generateWalletMnemonic();

  it('derives a valid Ethereum address', () => {
    const result = deriveEthereumAddress(mnemonic, 0);
    expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(result.privateKey).toHaveLength(64);
    expect(result.publicKey).toHaveLength(130); // uncompressed, hex
  });

  it('derives different addresses for different indices', () => {
    const addr0 = deriveEthereumAddress(mnemonic, 0);
    const addr1 = deriveEthereumAddress(mnemonic, 1);
    expect(addr0.address).not.toBe(addr1.address);
    expect(addr0.privateKey).not.toBe(addr1.privateKey);
  });

  it('is deterministic', () => {
    const a = deriveEthereumAddress(mnemonic, 0);
    const b = deriveEthereumAddress(mnemonic, 0);
    expect(a.address).toBe(b.address);
    expect(a.privateKey).toBe(b.privateKey);
  });

  it('throws for negative index', () => {
    expect(() => deriveEthereumAddress(mnemonic, -1)).toThrow();
  });
});

describe('deriveMultipleAddresses', () => {
  it('derives the correct number of addresses', () => {
    const mnemonic = generateWalletMnemonic();
    const addresses = deriveMultipleAddresses(mnemonic, 3);
    expect(addresses).toHaveLength(3);
    addresses.forEach((addr, i) => {
      expect(addr.index).toBe(i);
      expect(addr.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

describe('splitSecret / reconstructSecret', () => {
  it('splits and reconstructs a secret (3-of-5)', () => {
    const secret = 'my-secret-recovery-phrase';
    const shares = splitSecret(secret, 5, 3);
    expect(shares).toHaveLength(5);

    // Any 3 shares should reconstruct
    const recovered = reconstructSecret([shares[0], shares[2], shares[4]]);
    expect(recovered).toBe(secret);
  });

  it('splits and reconstructs with 2-of-3', () => {
    const secret = 'another-test-secret';
    const shares = splitSecret(secret, 3, 2);
    const recovered = reconstructSecret([shares[0], shares[1]]);
    expect(recovered).toBe(secret);
  });

  it('throws if threshold < 2', () => {
    expect(() => splitSecret('secret', 3, 1)).toThrow();
  });

  it('throws if threshold > parts', () => {
    expect(() => splitSecret('secret', 2, 3)).toThrow();
  });
});

describe('hashData', () => {
  it('returns a hex string', () => {
    const hash = hashData('hello');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic', () => {
    expect(hashData('test')).toBe(hashData('test'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashData('a')).not.toBe(hashData('b'));
  });
});

describe('formatAddress', () => {
  it('abbreviates long addresses', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    const formatted = formatAddress(addr);
    expect(formatted).toContain('...');
    expect(formatted.startsWith('0x')).toBe(true);
  });

  it('returns short addresses unchanged', () => {
    expect(formatAddress('0x12')).toBe('0x12');
  });
});

describe('isValidAddress', () => {
  it('validates correct addresses', () => {
    expect(isValidAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true);
    expect(isValidAddress('0xABCDEF1234567890ABCDEF1234567890ABCDEF12')).toBe(true);
  });

  it('rejects invalid addresses', () => {
    expect(isValidAddress('0x123')).toBe(false);
    expect(isValidAddress('not-an-address')).toBe(false);
    expect(isValidAddress('')).toBe(false);
  });
});

describe('toChecksumAddress', () => {
  it('returns EIP-55 checksummed address', () => {
    const lower = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const checksummed = toChecksumAddress(lower);
    expect(checksummed).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  });

  it('derived addresses are already checksummed', () => {
    const mnemonic = generateWalletMnemonic();
    const { address } = deriveEthereumAddress(mnemonic, 0);
    expect(address).toBe(toChecksumAddress(address));
  });
});

describe('encryptData / decryptData', () => {
  it('roundtrip: encrypt then decrypt returns original data', async () => {
    const plaintext = 'my secret mnemonic phrase for testing';
    const password = 'strongPassword123!';

    const { encrypted, iv, salt } = await encryptData(plaintext, password);
    expect(encrypted).toBeTruthy();
    expect(iv).toBeTruthy();
    expect(salt).toBeTruthy();

    const decrypted = await decryptData(encrypted, iv, salt, password);
    expect(decrypted).toBe(plaintext);
  });

  it('decryption fails with wrong password', async () => {
    const plaintext = 'secret data';
    const { encrypted, iv, salt } = await encryptData(plaintext, 'correctPassword');

    await expect(decryptData(encrypted, iv, salt, 'wrongPassword')).rejects.toThrow();
  });

  it('produces different ciphertexts for same input (random salt/iv)', async () => {
    const plaintext = 'same input twice';
    const password = 'password123';

    const a = await encryptData(plaintext, password);
    const b = await encryptData(plaintext, password);

    expect(a.encrypted).not.toBe(b.encrypted);
    expect(a.salt).not.toBe(b.salt);
  });
});
