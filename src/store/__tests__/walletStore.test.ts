import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../walletStore';

// Note: initializeWallet/unlockWallet use Web Crypto API (PBKDF2 + AES-GCM)
// which is available in Node 20+ via globalThis.crypto

describe('walletStore basics', () => {
  beforeEach(() => {
    useWalletStore.setState({
      mnemonic: null,
      mnemonicPlain: null,
      password: null,
      isInitialized: false,
      isLocked: true,
      failedAttempts: 0,
      lockoutUntil: 0,
      accounts: [],
      activeAccountIndex: 0,
      auditTrail: [],
      transactions: [],
      pendingTransactions: [],
      tokenPrices: {},
    });
  });

  it('has correct initial state', () => {
    const state = useWalletStore.getState();
    expect(state.isInitialized).toBe(false);
    expect(state.isLocked).toBe(true);
    expect(state.accounts).toHaveLength(0);
    expect(state.networks.length).toBeGreaterThanOrEqual(7);
    expect(state.activeNetworkId).toBe('sepolia');
  });

  it('initializeWallet creates mnemonic and account', async () => {
    const mnemonic = await useWalletStore.getState().initializeWallet('password123');
    const state = useWalletStore.getState();

    expect(mnemonic.split(' ')).toHaveLength(24);
    expect(state.isInitialized).toBe(true);
    expect(state.isLocked).toBe(false);
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0].address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(state.mnemonicPlain).toBe(mnemonic);
    expect(state.mnemonic).not.toBeNull();
    expect(state.password).not.toBeNull();
  });

  it('initializeWallet rejects short passwords', async () => {
    await expect(useWalletStore.getState().initializeWallet('short')).rejects.toThrow('at least 8');
  });

  it('lockWallet clears mnemonicPlain and sets isLocked', async () => {
    await useWalletStore.getState().initializeWallet('password123');
    expect(useWalletStore.getState().isLocked).toBe(false);

    useWalletStore.getState().lockWallet();
    const state = useWalletStore.getState();
    expect(state.isLocked).toBe(true);
    expect(state.mnemonicPlain).toBeNull();
  });

  it('unlockWallet restores mnemonicPlain', async () => {
    const mnemonic = await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.getState().lockWallet();

    const unlocked = await useWalletStore.getState().unlockWallet('password123');
    expect(unlocked).toBe(true);
    expect(useWalletStore.getState().isLocked).toBe(false);
    expect(useWalletStore.getState().mnemonicPlain).toBe(mnemonic);
  });

  it('unlockWallet rejects wrong password', async () => {
    await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.getState().lockWallet();

    const unlocked = await useWalletStore.getState().unlockWallet('wrongpassword');
    expect(unlocked).toBe(false);
    expect(useWalletStore.getState().isLocked).toBe(true);
    expect(useWalletStore.getState().failedAttempts).toBe(1);
  });

  it('addAccount creates a second account', async () => {
    await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.getState().addAccount('Account 2');

    const state = useWalletStore.getState();
    expect(state.accounts).toHaveLength(2);
    expect(state.accounts[1].name).toBe('Account 2');
    expect(state.accounts[1].address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(state.accounts[0].address).not.toBe(state.accounts[1].address);
  });

  it('setActiveAccount changes active account', async () => {
    await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.getState().addAccount('Account 2');
    useWalletStore.getState().setActiveAccount(1);

    expect(useWalletStore.getState().activeAccountIndex).toBe(1);
    expect(useWalletStore.getState().getActiveAccount()?.index).toBe(1);
  });
});

describe('importWallet', () => {
  beforeEach(() => {
    useWalletStore.setState({
      mnemonic: null, mnemonicPlain: null, password: null,
      isInitialized: false, isLocked: true, accounts: [],
      failedAttempts: 0, lockoutUntil: 0, auditTrail: [],
    });
  });

  it('imports a valid mnemonic and sets up wallet', async () => {
    // First generate a valid mnemonic to import
    const mnemonic = await useWalletStore.getState().initializeWallet('password123');
    // Reset state to simulate fresh import
    useWalletStore.setState({
      mnemonic: null, mnemonicPlain: null, password: null,
      isInitialized: false, isLocked: true, accounts: [],
    });

    await useWalletStore.getState().importWallet(mnemonic, 'newPassword123');
    const state = useWalletStore.getState();

    expect(state.isInitialized).toBe(true);
    expect(state.isLocked).toBe(false);
    expect(state.accounts).toHaveLength(1);
    expect(state.mnemonicPlain).toBe(mnemonic);
    expect(state.accounts[0].address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('rejects invalid mnemonic', async () => {
    await expect(
      useWalletStore.getState().importWallet('invalid mnemonic words', 'password123')
    ).rejects.toThrow('Invalid BIP-39');
  });

  it('rejects short password', async () => {
    const mnemonic = await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.setState({
      mnemonic: null, mnemonicPlain: null, password: null,
      isInitialized: false, isLocked: true, accounts: [],
    });

    await expect(
      useWalletStore.getState().importWallet(mnemonic, 'short')
    ).rejects.toThrow('at least 8');
  });
});

describe('sendTransaction', () => {
  beforeEach(async () => {
    useWalletStore.setState({
      mnemonic: null,
      mnemonicPlain: null,
      password: null,
      isInitialized: false,
      isLocked: true,
      failedAttempts: 0,
      lockoutUntil: 0,
      accounts: [],
      activeAccountIndex: 0,
      auditTrail: [],
      transactions: [],
      pendingTransactions: [],
    });
    await useWalletStore.getState().initializeWallet('password123');
    // Set some balance
    useWalletStore.getState().setAccountBalance(0, '10.0');
  });

  it('rejects invalid recipient address', async () => {
    await expect(
      useWalletStore.getState().sendTransaction('invalid-addr', '1.0')
    ).rejects.toThrow();
  });

  it('rejects zero amount', async () => {
    await expect(
      useWalletStore.getState().sendTransaction('0x1234567890abcdef1234567890abcdef12345678', '0')
    ).rejects.toThrow();
  });

  it('creates a pending transaction on success', async () => {
    const tx = await useWalletStore.getState().sendTransaction(
      '0x1234567890abcdef1234567890abcdef12345678',
      '1.0'
    );

    expect(tx.status).toBe('pending');
    expect(tx.value).toBe('1.0');
    expect(tx.type).toBe('send');

    const state = useWalletStore.getState();
    expect(state.pendingTransactions.length).toBeGreaterThanOrEqual(1);
    expect(state.auditTrail.length).toBeGreaterThanOrEqual(1);
  });
});

describe('token prices and balances', () => {
  it('setTokenPrices updates store', () => {
    useWalletStore.getState().setTokenPrices({ ETH: 3000, BNB: 600 });
    const state = useWalletStore.getState();
    expect(state.tokenPrices.ETH).toBe(3000);
    expect(state.tokenPrices.BNB).toBe(600);
  });

  it('setAccountBalance updates specific account', async () => {
    useWalletStore.setState({
      mnemonic: null, mnemonicPlain: null, password: null,
      isInitialized: false, isLocked: true, accounts: [],
      failedAttempts: 0, lockoutUntil: 0,
    });
    await useWalletStore.getState().initializeWallet('password123');
    useWalletStore.getState().setAccountBalance(0, '42.5');
    expect(useWalletStore.getState().accounts[0].balance).toBe('42.5');
  });

  it('getPortfolioValue uses tokenPrices', () => {
    useWalletStore.getState().setTokenPrices({ ETH: 3000 });
    // Default tokens include ETH with balance '0' so value should be 0
    const value = useWalletStore.getState().getPortfolioValue();
    expect(typeof value).toBe('number');
    expect(value).toBeGreaterThanOrEqual(0);
  });
});

describe('network management', () => {
  it('getActiveNetwork returns sepolia by default', () => {
    const network = useWalletStore.getState().getActiveNetwork();
    expect(network.id).toBe('sepolia');
    expect(network.chainId).toBe(11155111);
  });

  it('setActiveNetwork changes active network', () => {
    useWalletStore.getState().setActiveNetwork('ethereum');
    expect(useWalletStore.getState().activeNetworkId).toBe('ethereum');
    expect(useWalletStore.getState().getActiveNetwork().chainId).toBe(1);
  });

  it('addNetwork adds a custom network', () => {
    const before = useWalletStore.getState().networks.length;
    useWalletStore.getState().addNetwork({
      name: 'TestNet', chainId: 99999, rpcUrl: 'https://test.rpc',
      symbol: 'TST', explorerUrl: 'https://test.explorer',
      isTestnet: true, nativeCurrency: { name: 'Test', symbol: 'TST', decimals: 18 },
      features: ['evm'],
    });
    expect(useWalletStore.getState().networks.length).toBe(before + 1);
  });
});

describe('audit trail', () => {
  it('addAuditEntry adds entry with timestamp', () => {
    useWalletStore.setState({ auditTrail: [] });
    useWalletStore.getState().addAuditEntry({
      action: 'TEST_ACTION', details: 'test details', type: 'info',
    });
    const trail = useWalletStore.getState().auditTrail;
    expect(trail).toHaveLength(1);
    expect(trail[0].action).toBe('TEST_ACTION');
    expect(trail[0].timestamp).toBeGreaterThan(0);
  });
});
