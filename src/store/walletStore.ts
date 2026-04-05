import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  generateWalletMnemonic,
  deriveMultipleAddresses,
  deriveEthereumAddress,
  encryptData,
  decryptData,
  splitSecret,
  formatAddress,
  isValidAddress,
  isValidMnemonicPhrase,
  hashPassword,
  verifyPassword
} from '@/lib/crypto';
import { sanitize } from '@/lib/utils';
import { nonceManager } from '@/lib/blockchain';
import { checkRateLimit, recordAttempt, resetRateLimit, RATE_LIMITS } from '@/lib/rateLimit';
import type { SealedContainer } from '@/lib/inheritanceContainer';

// Types
export interface WalletAccount {
  index: number;
  address: string;
  privateKey: string;
  balance: string;
  name?: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  balance?: string;
}

export interface NFT {
  id: string;
  name: string;
  collection: string;
  tokenId: string;
  contractAddress: string;
  chainId: number;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface DefiProtocol {
  id: string;
  name: string;
  protocolType: 'lending' | 'dex' | 'yield' | 'staking' | 'derivatives';
  chainId: number;
  contractAddress: string;
  apy?: number;
  tvl?: number;
}

export interface PortfolioAsset {
  id: string;
  assetId: string;
  assetType: 'token' | 'nft' | 'defi';
  chainId: number;
  balance: string;
  valueUSD: number;
  priceUSD?: number;
}

export interface Heir {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  keyFragment?: string;
}

export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface KeyFragment {
  id: string;
  holder: string;
  type: 'heir' | 'guardian' | 'notary' | 'self';
  status: 'distributed' | 'pending' | 'activated';
  encrypted: boolean;
  share?: string;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  type: 'send' | 'receive' | 'approve' | 'swap' | 'stake' | 'unstake';
  chainId: number;
  tokenSymbol?: string;
  networkName?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface DMSConfig {
  stage1Days: number;
  stage2Days: number;
  stage3Days: number;
  enabled: boolean;
  lastLogin: number;
  nextWarning: number;
  status: 'active' | 'warning' | 'escalation' | 'critical' | 'inactive';
}

export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  logoURI?: string;
  features: ('evm' | 'cosmos' | 'substrate')[];
}

export interface EncryptedMnemonic {
  encrypted: string;
  iv: string;
  salt: string;
}

export interface PasswordData {
  hash: string;
  salt: string;
}

// Phase 2a types
export type UserRole = 'owner' | 'heir' | 'guardian' | 'notary' | 'manager';

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'heir' | 'guardian' | 'notary';
  keyShare?: number;
  address?: string;
  notified: boolean;
}

export type DeadManSwitchStatus = 'inactive' | 'active' | 'warning_1' | 'warning_2' | 'warning_3' | 'triggered';

export interface DeadManSwitch {
  enabled: boolean;
  intervalMonths: 3 | 6 | 12;
  lastCheckIn: number;
  status: DeadManSwitchStatus;
  warningsSent: number;
  nextCheckIn: number;
  triggerDate?: number;
}

export interface InheritanceContainer {
  level: 1 | 2 | 3;
  version: number;
  lastUpdated: number;
  assetInventory: string;
  accessArchitecture: string;
  heirDesignation: string;
  legacyContext: string;
  platformInstructions: string;
  professionalContacts: string;
  multisigConfig?: string;
}

export interface TransferGateStep {
  step: 1 | 2 | 3 | 4 | 5;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'done';
}

export interface EmergencyProtocol {
  enabled: boolean;
  lastTriggered?: number;
  reason?: string;
  authorizedGuardians: string[];
}

export interface WalletState {
  mnemonic: EncryptedMnemonic | null;
  mnemonicPlain: string | null; // held in memory only while unlocked
  password: PasswordData | null;
  isInitialized: boolean;
  isLocked: boolean;
  failedAttempts: number;
  lockoutUntil: number;
  accounts: WalletAccount[];
  activeAccountIndex: number;
  networks: Network[];
  activeNetworkId: string;
  tokens: Token[];
  nfts: NFT[];
  defiProtocols: DefiProtocol[];
  portfolioAssets: PortfolioAsset[];
  heirs: Heir[];
  guardians: Guardian[];
  keyFragments: KeyFragment[];
  dmsConfig: DMSConfig;
  auditTrail: AuditEntry[];
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  tokenPrices: Record<string, number>;
  userRole: UserRole;
  beneficiaries: Beneficiary[];
  deadManSwitch: DeadManSwitch;
  inheritanceContainer: InheritanceContainer | null;
  sealedContainer: SealedContainer | null;
  containerShards: string[];  // Shamir shards (held in memory while unlocked)
  transferGateSteps: TransferGateStep[];
  emergencyProtocol: EmergencyProtocol;
  daiScore: number;

  initializeWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  addAccount: (name?: string) => void;
  setActiveAccount: (index: number) => void;
  sendTransaction: (to: string, amount: string, gasPrice?: string) => Promise<Transaction>;
  addHeir: (heir: Omit<Heir, 'id' | 'keyFragment'>) => void;
  removeHeir: (id: string) => void;
  addGuardian: (guardian: Omit<Guardian, 'id'>) => void;
  removeGuardian: (id: string) => void;
  updateDMSConfig: (config: Partial<DMSConfig>) => void;
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  setActiveNetwork: (networkId: string) => void;
  getActiveAccount: () => WalletAccount | null;
  getActiveNetwork: () => Network;
  getBalance: () => string;
  generateKeyFragments: () => void;
  addNetwork: (network: Omit<Network, 'id'>) => void;
  removeNetwork: (networkId: string) => void;
  addToken: (token: Omit<Token, 'id'>) => void;
  removeToken: (tokenId: string) => void;
  addNFT: (nft: Omit<NFT, 'id'>) => void;
  removeNFT: (nftId: string) => void;
  addDefiProtocol: (protocol: Omit<DefiProtocol, 'id'>) => void;
  interactWithDefi: (protocolId: string, action: 'deposit' | 'withdraw' | 'stake' | 'unstake', amount: string) => Promise<Transaction>;
  getPortfolioValue: () => number;
  updatePortfolio: () => void;
  setTokenPrices: (prices: Record<string, number>) => void;
  setTokenBalances: (balances: Record<string, string>) => void;
  setAccountBalance: (index: number, balance: string) => void;
  addBeneficiary: (b: Omit<Beneficiary, 'id' | 'notified'>) => void;
  removeBeneficiary: (id: string) => void;
  checkIn: () => void;
  getDaiScore: () => number;
  getTimeUntilTrigger: () => string;
  getDmsStatusColor: () => string;
  setInheritanceContainer: (container: InheritanceContainer) => void;
  setSealedContainer: (sealed: SealedContainer, shards?: string[]) => void;
  clearContainerShards: () => void;
  setEmergencyProtocol: (protocol: Partial<EmergencyProtocol>) => void;
}

const defaultNetworks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    features: ['evm']
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    features: ['evm']
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon.llamarpc.com',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    features: ['evm']
  },
  {
    id: 'binance',
    name: 'BNB Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
    isTestnet: false,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png',
    features: ['evm']
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    explorerUrl: 'https://snowtrace.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png',
    features: ['evm']
  },
  {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    features: ['evm']
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    logoURI: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    features: ['evm']
  }
];

const defaultTokens: Token[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    contractAddress: '',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    chainId: 1,
    balance: '0'
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
    chainId: 1,
    balance: '0'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    chainId: 1,
    balance: '0'
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    contractAddress: '',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png',
    chainId: 56,
    balance: '0'
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    contractAddress: '',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    chainId: 137,
    balance: '0'
  }
];

const defaultNFTs: NFT[] = [];

const defaultDefiProtocols: DefiProtocol[] = [
  {
    id: 'aave',
    name: 'Aave',
    protocolType: 'lending',
    chainId: 1,
    contractAddress: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    apy: 2.5,
    tvl: 15000
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    protocolType: 'dex',
    chainId: 1,
    contractAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    tvl: 7000
  },
  {
    id: 'compound',
    name: 'Compound',
    protocolType: 'lending',
    chainId: 1,
    contractAddress: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    apy: 3.2,
    tvl: 8000
  }
];

const defaultPortfolioAssets: PortfolioAsset[] = [];

function createDefaultDMSConfig(): DMSConfig {
  return {
    stage1Days: 90,
    stage2Days: 180,
    stage3Days: 365,
    enabled: true,
    lastLogin: Date.now(),
    nextWarning: Date.now() + 90 * 24 * 60 * 60 * 1000,
    status: 'active'
  };
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      mnemonic: null,
      mnemonicPlain: null,
      password: null,
      isInitialized: false,
      isLocked: true,
      failedAttempts: 0,
      lockoutUntil: 0,
      accounts: [],
      activeAccountIndex: 0,
      networks: defaultNetworks,
      activeNetworkId: 'sepolia',
      tokens: defaultTokens,
      nfts: defaultNFTs,
      defiProtocols: defaultDefiProtocols,
      portfolioAssets: defaultPortfolioAssets,
      heirs: [],
      guardians: [],
      keyFragments: [],
      dmsConfig: createDefaultDMSConfig(),
      auditTrail: [],
      transactions: [],
      pendingTransactions: [],
      tokenPrices: {},
      userRole: 'owner' as UserRole,
      beneficiaries: [],
      deadManSwitch: {
        enabled: false,
        intervalMonths: 6,
        lastCheckIn: Date.now(),
        status: 'inactive' as DeadManSwitchStatus,
        warningsSent: 0,
        nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
      },
      inheritanceContainer: null,
      sealedContainer: null,
      containerShards: [],
      transferGateSteps: [
        { step: 1, label: 'Authorization', description: 'Identity verification of authorized heirs', status: 'pending' as const },
        { step: 2, label: 'Verification', description: 'Multi-party confirmation via key fragments', status: 'pending' as const },
        { step: 3, label: 'Preparation', description: 'Asset inventory and transfer preparation', status: 'pending' as const },
        { step: 4, label: 'Execution', description: 'Controlled asset transfer to beneficiaries', status: 'pending' as const },
        { step: 5, label: 'Completion', description: 'Final audit and documentation', status: 'pending' as const },
      ],
      emergencyProtocol: {
        enabled: false,
        authorizedGuardians: [],
      },
      daiScore: 0,

      initializeWallet: async (password: string) => {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const mnemonic = generateWalletMnemonic(256);
        const accounts = deriveMultipleAddresses(mnemonic, 1);
        const encrypted = await encryptData(mnemonic, password);
        const passwordData = await hashPassword(password);
        const now = Date.now();

        set({
          mnemonic: {
            encrypted: encrypted.encrypted,
            iv: encrypted.iv,
            salt: encrypted.salt
          },
          mnemonicPlain: mnemonic,
          password: passwordData,
          isInitialized: true,
          isLocked: false,
          accounts: accounts.map((acc, i) => ({
            ...acc,
            balance: '0',
            name: i === 0 ? 'Account 1' : `Account ${i + 1}`
          })),
          dmsConfig: {
            ...createDefaultDMSConfig(),
            lastLogin: now,
            nextWarning: now + 90 * 24 * 60 * 60 * 1000
          }
        });

        get().generateKeyFragments();

        get().addAuditEntry({
          action: 'Wallet Created',
          details: 'New wallet initialized with BIP-39 mnemonic',
          type: 'success'
        });

        return mnemonic;
      },

      importWallet: async (mnemonic: string, password: string) => {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!isValidMnemonicPhrase(mnemonic)) {
          throw new Error('Invalid BIP-39 mnemonic phrase');
        }

        const accounts = deriveMultipleAddresses(mnemonic, 1);
        const encrypted = await encryptData(mnemonic, password);
        const passwordData = await hashPassword(password);
        const now = Date.now();

        set({
          mnemonic: {
            encrypted: encrypted.encrypted,
            iv: encrypted.iv,
            salt: encrypted.salt
          },
          mnemonicPlain: mnemonic,
          password: passwordData,
          isInitialized: true,
          isLocked: false,
          accounts: accounts.map((acc, i) => ({
            ...acc,
            balance: '0',
            name: i === 0 ? 'Imported Account' : `Account ${i + 1}`
          })),
          dmsConfig: {
            ...createDefaultDMSConfig(),
            lastLogin: now,
            nextWarning: now + 90 * 24 * 60 * 60 * 1000
          }
        });

        get().generateKeyFragments();

        get().addAuditEntry({
          action: 'Wallet Imported',
          details: 'Existing wallet imported with mnemonic',
          type: 'success'
        });
      },

      unlockWallet: async (password: string) => {
        const state = get();
        if (!state.password) return false;

        // Sliding-window rate limit (in addition to exponential backoff)
        const rlCheck = checkRateLimit('unlock', RATE_LIMITS.UNLOCK);
        if (!rlCheck.allowed) {
          throw new Error(`Rate limited. Try again in ${Math.ceil(rlCheck.retryAfterMs / 1000)}s.`);
        }
        recordAttempt('unlock');

        // Brute-force protection: exponential backoff
        if (state.lockoutUntil > Date.now()) {
          const remainingSec = Math.ceil((state.lockoutUntil - Date.now()) / 1000);
          throw new Error(`Too many failed attempts. Please wait ${remainingSec} seconds.`);
        }

        const isValid = await verifyPassword(password, state.password.hash, state.password.salt);
        if (isValid) {
          // Decrypt mnemonic back into memory
          let mnemonicPlain: string | null = null;
          if (state.mnemonic) {
            try {
              mnemonicPlain = await decryptData(
                state.mnemonic.encrypted,
                state.mnemonic.iv,
                state.mnemonic.salt,
                password
              );
            } catch {
              // Vault integrity failure — password verified but decryption failed
              // Do NOT unlock into a zombie state
              get().addAuditEntry({
                action: 'Vault Integrity Error',
                details: 'Mnemonic decryption failed despite correct password — data may be corrupted',
                type: 'critical'
              });
              throw new Error('Vault integrity check failed — wallet data may be corrupted. Recover using your seed phrase backup.');
            }
          }

          const now = Date.now();

          // Re-derive private keys for all persisted accounts from the decrypted mnemonic.
          // partialize() replaces privateKey with 'encrypted' on disk; we must restore them.
          let reloadedAccounts = state.accounts;
          if (mnemonicPlain) {
            reloadedAccounts = state.accounts.map(acc => {
              try {
                const derived = deriveEthereumAddress(mnemonicPlain, acc.index);
                return { ...acc, privateKey: derived.privateKey };
              } catch {
                return acc;
              }
            });
          }

          set({
            isLocked: false,
            mnemonicPlain,
            accounts: reloadedAccounts,
            failedAttempts: 0,
            lockoutUntil: 0,
            dmsConfig: {
              ...state.dmsConfig,
              lastLogin: now,
              nextWarning: now + state.dmsConfig.stage1Days * 24 * 60 * 60 * 1000
            }
          });
          resetRateLimit('unlock');
          get().addAuditEntry({
            action: 'Wallet Unlocked',
            details: 'User authenticated successfully',
            type: 'success'
          });
          return true;
        }
        // Exponential backoff: 2^attempts seconds (2s, 4s, 8s, 16s, 32s, 64s, ...)
        const newAttempts = state.failedAttempts + 1;
        const lockoutMs = Math.min(Math.pow(2, newAttempts) * 1000, 300000); // max 5 min
        set({
          failedAttempts: newAttempts,
          lockoutUntil: Date.now() + lockoutMs
        });
        get().addAuditEntry({
          action: 'Unlock Failed',
          details: `Incorrect password attempt (${newAttempts} total)`,
          type: 'warning'
        });
        return false;
      },

      lockWallet: () => {
        set({
          isLocked: true,
          mnemonicPlain: null,
          accounts: get().accounts.map(acc => ({
            ...acc,
            privateKey: ''
          })),
          keyFragments: get().keyFragments.map(f => ({
            ...f,
            share: ''
          }))
        });
        get().addAuditEntry({
          action: 'Wallet Locked',
          details: 'Session terminated, sensitive data cleared',
          type: 'info'
        });
      },

      addAccount: (name?: string) => {
        const state = get();
        if (!state.mnemonicPlain || state.isLocked) return;

        const newIndex = state.accounts.length;
        try {
          const derived = deriveEthereumAddress(state.mnemonicPlain, newIndex);
          const newAccount: WalletAccount = {
            index: newIndex,
            address: derived.address,
            privateKey: derived.privateKey,
            balance: '0',
            name: name || `Account ${newIndex + 1}`
          };

          set({ accounts: [...state.accounts, newAccount] });
          get().addAuditEntry({
            action: 'Account Added',
            details: `New account created: ${newAccount.name}`,
            type: 'success'
          });
        } catch (error) {
          console.error('Failed to derive account:', error);
        }
      },

      setActiveAccount: (index: number) => {
        const state = get();
        if (index >= 0 && index < state.accounts.length) {
          set({ activeAccountIndex: index });
        }
      },

      sendTransaction: async (to: string, amount: string, gasPrice?: string) => {
        const state = get();
        if (state.isLocked) {
          throw new Error('Wallet is locked');
        }

        // Rate limit transactions to prevent rapid-fire sends
        const txRl = checkRateLimit('send_tx', RATE_LIMITS.SEND_TX);
        if (!txRl.allowed) {
          throw new Error(`Too many transactions. Wait ${Math.ceil(txRl.retryAfterMs / 1000)}s.`);
        }
        recordAttempt('send_tx');

        const activeAccount = state.getActiveAccount();
        const activeNetwork = state.getActiveNetwork();

        if (!activeAccount || !activeAccount.privateKey) {
          throw new Error('No active account');
        }

        if (!isValidAddress(to)) {
          throw new Error('Invalid recipient address');
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Amount must be a positive number');
        }

        const balance = parseFloat(activeAccount.balance);
        if (parsedAmount > balance) {
          throw new Error('Insufficient balance');
        }

        // Query on-chain nonce with local pending tracking
        let accountNonce: number;
        try {
          accountNonce = await nonceManager.getNextNonce(activeNetwork.chainId, activeAccount.address);
        } catch {
          // Fallback to local calculation if RPC is unavailable
          const allTxs = [...state.transactions, ...state.pendingTransactions].filter(
            (t: Transaction) => t.from === activeAccount.address
          );
          accountNonce = allTxs.length > 0
            ? Math.max(...allTxs.map((t: Transaction) => t.nonce)) + 1
            : 0;
        }

        const tx: Transaction = {
          id: crypto.randomUUID(),
          hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          from: activeAccount.address,
          to,
          value: amount,
          gasPrice: gasPrice || '20',
          gasLimit: '21000',
          nonce: accountNonce,
          status: 'pending',
          timestamp: Date.now(),
          type: 'send',
          chainId: activeNetwork.chainId,
          tokenSymbol: activeNetwork.symbol,
          networkName: activeNetwork.name
        };

        // Use functional updater to avoid stale state
        set((current) => ({
          pendingTransactions: [...current.pendingTransactions, tx]
        }));

        const txChainId = activeNetwork.chainId;
        const txFrom = activeAccount.address;
        const txNonce = accountNonce;
        setTimeout(() => {
          nonceManager.confirmNonce(txChainId, txFrom, txNonce);
          set((current: WalletState) => ({
            pendingTransactions: current.pendingTransactions.filter((t: Transaction) => t.id !== tx.id),
            transactions: [{
              ...tx,
              status: 'confirmed' as const
            }, ...current.transactions]
          }));
        }, 3000);

        get().addAuditEntry({
          action: 'Transaction Sent',
          details: `Sent ${amount} ${activeNetwork.symbol} to ${formatAddress(to)}`,
          type: 'success'
        });

        return tx;
      },

      addHeir: (heir) => {
        const newHeir: Heir = {
          ...heir,
          id: crypto.randomUUID()
        };
        set((state) => ({ heirs: [...state.heirs, newHeir] }));
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Heir Added',
          details: `New heir: ${newHeir.name}`,
          type: 'info'
        });
      },

      removeHeir: (id: string) => {
        set((state) => ({ heirs: state.heirs.filter(h => h.id !== id) }));
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Heir Removed',
          details: 'Heir removed from configuration',
          type: 'warning'
        });
      },

      addGuardian: (guardian) => {
        const newGuardian: Guardian = {
          ...guardian,
          id: crypto.randomUUID()
        };
        set((state) => ({ guardians: [...state.guardians, newGuardian] }));
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Guardian Added',
          details: `New guardian: ${newGuardian.name}`,
          type: 'info'
        });
      },

      removeGuardian: (id: string) => {
        set((state) => ({ guardians: state.guardians.filter((g: Guardian) => g.id !== id) }));
        get().generateKeyFragments();
        get().addAuditEntry({
          action: 'Guardian Removed',
          details: 'Guardian removed from configuration',
          type: 'warning'
        });
      },

      updateDMSConfig: (config: Partial<DMSConfig>) => {
        set((state) => {
          const updated = { ...state.dmsConfig, ...config };
          // Recalculate nextWarning when stage days or lastLogin changes
          if (config.stage1Days != null || config.lastLogin != null) {
            const lastLogin = updated.lastLogin ?? Date.now();
            const stage1Days = updated.stage1Days ?? state.dmsConfig.stage1Days;
            updated.nextWarning = lastLogin + stage1Days * 24 * 60 * 60 * 1000;
          }
          return { dmsConfig: updated };
        });
      },

      addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
        const newEntry: AuditEntry = {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        };
        set((state) => ({
          auditTrail: [newEntry, ...state.auditTrail].slice(0, 1000)
        }));
      },

      setActiveNetwork: (networkId: string) => {
        set({ activeNetworkId: networkId });
        get().addAuditEntry({
          action: 'Network Changed',
          details: `Switched to ${networkId}`,
          type: 'info'
        });
      },

      getActiveAccount: () => {
        const state = get();
        return state.accounts[state.activeAccountIndex] || null;
      },

      getActiveNetwork: () => {
        const state = get();
        const found = state.networks.find((n: Network) => n.id === state.activeNetworkId);
        if (found) return found;
        // Fallback to first network, or a minimal default
        return state.networks[0] || defaultNetworks[0];
      },

      getBalance: () => {
        const account = get().getActiveAccount();
        return account?.balance || '0';
      },

      generateKeyFragments: () => {
        const state = get();
        if (!state.mnemonicPlain) return; // only available while unlocked

        // Use beneficiaries if available, fall back to legacy heirs+guardians
        const allHolders = state.beneficiaries.length > 0
          ? state.beneficiaries
          : [
              ...state.heirs.map(h => ({ name: h.name, role: 'heir' as const })),
              ...state.guardians.map(g => ({ name: g.name, role: g.role === 'Notary' ? 'notary' as const : 'guardian' as const }))
            ];

        const totalHolders = 1 + allHolders.length;
        const parts = Math.max(totalHolders, 3);
        // Use majority threshold: ceil(parts/2) + 1, minimum 2
        const threshold = Math.max(2, Math.min(Math.ceil(parts / 2) + 1, parts));

        const secretPayload = state.mnemonicPlain;

        let shares: string[];
        try {
          shares = splitSecret(secretPayload, Math.min(parts, 255), Math.min(threshold, parts));
        } catch {
          return;
        }

        const fragments: KeyFragment[] = [
          {
            id: crypto.randomUUID(),
            holder: 'You (Backup)',
            type: 'self' as const,
            status: 'distributed' as const,
            encrypted: true,
            share: shares[0]
          }
        ];

        let shareIndex = 1;
        allHolders.forEach((holder) => {
          if (shareIndex < shares.length) {
            fragments.push({
              id: crypto.randomUUID(),
              holder: holder.name,
              type: holder.role === 'notary' ? 'notary' as const : holder.role === 'guardian' ? 'guardian' as const : 'heir' as const,
              status: 'distributed' as const,
              encrypted: true,
              share: shares[shareIndex]
            });
            shareIndex++;
          }
        });

        set({ keyFragments: fragments });
      },

      addNetwork: (network: Omit<Network, 'id'>) => {
        const state = get();
        network = { ...network, name: sanitize(network.name, 50) };
        const id = network.name.toLowerCase().replace(/\s+/g, '-');

        // Check for duplicate ID
        if (state.networks.some((n: Network) => n.id === id)) {
          return; // Network with this name already exists
        }

        const newNetwork: Network = {
          ...network,
          id
        };
        set({ networks: [...state.networks, newNetwork] });
        get().addAuditEntry({
          action: 'Network Added',
          details: `Added new network: ${newNetwork.name}`,
          type: 'info'
        });
      },

      removeNetwork: (networkId: string) => {
        const state = get();
        // Don't allow removing the last network
        if (state.networks.length <= 1) return;

        const network = state.networks.find((n: Network) => n.id === networkId);
        const filtered = state.networks.filter((n: Network) => n.id !== networkId);
        set({
          networks: filtered,
          activeNetworkId: state.activeNetworkId === networkId ? filtered[0].id : state.activeNetworkId
        });
        if (network) {
          get().addAuditEntry({
            action: 'Network Removed',
            details: `Removed network: ${network.name}`,
            type: 'warning'
          });
        }
      },

      addToken: (token: Omit<Token, 'id'>) => {
        const state = get();
        const id = `${token.chainId}-${token.symbol.toLowerCase()}`;

        // Check for duplicate
        if (state.tokens.some((t: Token) => t.id === id)) {
          return; // Token already exists
        }

        const newToken: Token = {
          ...token,
          id
        };
        set({ tokens: [...state.tokens, newToken] });
        get().addAuditEntry({
          action: 'Token Added',
          details: `Added new token: ${newToken.name} (${newToken.symbol})`,
          type: 'info'
        });
      },

      removeToken: (tokenId: string) => {
        const state = get();
        const token = state.tokens.find((t: Token) => t.id === tokenId);
        set({ tokens: state.tokens.filter((t: Token) => t.id !== tokenId) });
        if (token) {
          get().addAuditEntry({
            action: 'Token Removed',
            details: `Removed token: ${token.name} (${token.symbol})`,
            type: 'warning'
          });
        }
      },

      addNFT: (nft: Omit<NFT, 'id'>) => {
        const state = get();
        const newNFT: NFT = {
          ...nft,
          id: crypto.randomUUID()
        };
        set({ nfts: [...state.nfts, newNFT] });
        get().addAuditEntry({
          action: 'NFT Added',
          details: `Added new NFT: ${newNFT.name} from ${newNFT.collection}`,
          type: 'info'
        });
      },

      removeNFT: (nftId: string) => {
        const state = get();
        const nft = state.nfts.find((n: NFT) => n.id === nftId);
        set({ nfts: state.nfts.filter((n: NFT) => n.id !== nftId) });
        if (nft) {
          get().addAuditEntry({
            action: 'NFT Removed',
            details: `Removed NFT: ${nft.name}`,
            type: 'warning'
          });
        }
      },

      addDefiProtocol: (protocol: Omit<DefiProtocol, 'id'>) => {
        const state = get();
        const id = protocol.name.toLowerCase().replace(/\s+/g, '-');

        if (state.defiProtocols.some((p: DefiProtocol) => p.id === id)) {
          return;
        }

        const newProtocol: DefiProtocol = {
          ...protocol,
          id
        };
        set({ defiProtocols: [...state.defiProtocols, newProtocol] });
        get().addAuditEntry({
          action: 'DeFi Protocol Added',
          details: `Added new DeFi protocol: ${newProtocol.name}`,
          type: 'info'
        });
      },

      interactWithDefi: async (protocolId: string, action: 'deposit' | 'withdraw' | 'stake' | 'unstake', amount: string) => {
        const state = get();
        if (state.isLocked) {
          throw new Error('Wallet is locked');
        }

        const activeAccount = state.getActiveAccount();
        const protocol = state.defiProtocols.find((p: DefiProtocol) => p.id === protocolId);
        const activeNetwork = state.getActiveNetwork();

        if (!activeAccount) {
          throw new Error('No active account');
        }

        if (!protocol) {
          throw new Error('Protocol not found');
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error('Amount must be a positive number');
        }

        const transactionTypeMap: Record<'deposit' | 'withdraw' | 'stake' | 'unstake', 'send' | 'receive' | 'approve' | 'swap' | 'stake' | 'unstake'> = {
          deposit: 'stake',
          withdraw: 'unstake',
          stake: 'stake',
          unstake: 'unstake'
        };

        const tx: Transaction = {
          id: crypto.randomUUID(),
          hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          from: activeAccount.address,
          to: protocol.contractAddress,
          value: amount,
          gasPrice: '20',
          gasLimit: '200000',
          nonce: state.transactions.filter((t: Transaction) => t.from === activeAccount.address).length + state.pendingTransactions.filter((t: Transaction) => t.from === activeAccount.address).length,
          status: 'pending',
          timestamp: Date.now(),
          type: transactionTypeMap[action],
          chainId: activeNetwork.chainId,
          tokenSymbol: activeNetwork.symbol,
          networkName: activeNetwork.name
        };

        set((current) => ({
          pendingTransactions: [...current.pendingTransactions, tx]
        }));

        setTimeout(() => {
          set((current: WalletState) => ({
            pendingTransactions: current.pendingTransactions.filter((t: Transaction) => t.id !== tx.id),
            transactions: [{
              ...tx,
              status: 'confirmed' as const
            }, ...current.transactions]
          }));
        }, 3000);

        get().addAuditEntry({
          action: `DeFi ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          details: `${action} ${amount} on ${protocol.name} (${activeNetwork.name})`,
          type: 'info'
        });

        return tx;
      },

      getPortfolioValue: () => {
        const state = get();
        if (state.portfolioAssets.length > 0) {
          return state.portfolioAssets.reduce((sum: number, asset: PortfolioAsset) => sum + asset.valueUSD, 0);
        }
        let total = 0;
        const prices = state.tokenPrices;
        state.tokens.forEach((token: Token) => {
          const balance = parseFloat(token.balance || '0');
          const priceUSD = prices[token.symbol] ?? 0;
          total += balance * priceUSD;
        });
        state.defiProtocols.forEach((protocol: DefiProtocol) => {
          total += protocol.tvl != null ? protocol.tvl : 0;
        });
        return total;
      },

      updatePortfolio: () => {
        const state = get();
        const updatedAssets: PortfolioAsset[] = [];
        const prices = state.tokenPrices;

        state.tokens.forEach((token: Token) => {
          const balance = parseFloat(token.balance || '0');
          const priceUSD = prices[token.symbol] ?? 0;
          const valueUSD = balance * priceUSD;

          updatedAssets.push({
            id: token.id,
            assetId: token.id,
            assetType: 'token',
            chainId: token.chainId,
            balance: token.balance || '0',
            valueUSD,
            priceUSD
          });
        });

        state.nfts.forEach((nft: NFT) => {
          updatedAssets.push({
            id: nft.id,
            assetId: nft.id,
            assetType: 'nft',
            chainId: nft.chainId,
            balance: '1',
            valueUSD: 0,
            priceUSD: 0
          });
        });

        state.defiProtocols.forEach((protocol: DefiProtocol) => {
          const valueUSD = protocol.tvl != null ? protocol.tvl : 0;

          updatedAssets.push({
            id: protocol.id,
            assetId: protocol.id,
            assetType: 'defi',
            chainId: protocol.chainId,
            balance: '1',
            valueUSD,
            priceUSD: valueUSD
          });
        });

        set({ portfolioAssets: updatedAssets });
      },

      setTokenPrices: (prices: Record<string, number>) => {
        set({ tokenPrices: prices });
      },

      setTokenBalances: (balances: Record<string, string>) => {
        set((state) => ({
          tokens: state.tokens.map((token) => ({
            ...token,
            balance: balances[token.contractAddress] ?? token.balance
          }))
        }));
      },

      setAccountBalance: (index: number, balance: string) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.index === index ? { ...acc, balance } : acc
          )
        }));
      },

      addBeneficiary: (b: Omit<Beneficiary, 'id' | 'notified'>) => {
        const safeName = sanitize(b.name, 100);
        const safeEmail = sanitize(b.email || '', 200);
        const newBeneficiary: Beneficiary = { ...b, name: safeName, email: safeEmail, id: crypto.randomUUID(), notified: false };
        set((state) => ({
          beneficiaries: [...state.beneficiaries, newBeneficiary],
          auditTrail: [...state.auditTrail, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action: 'ADD_BENEFICIARY',
            details: `Added ${b.role}: ${safeName}`,
            type: 'info' as const
          }]
        }));
      },

      removeBeneficiary: (id: string) => {
        set((state) => {
          const removed = state.beneficiaries.find(b => b.id === id);
          return {
            beneficiaries: state.beneficiaries.filter(b => b.id !== id),
            auditTrail: [...state.auditTrail, {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              action: 'REMOVE_BENEFICIARY',
              details: `Removed: ${removed?.name || id}`,
              type: 'warning' as const
            }]
          };
        });
      },

      checkIn: () => {
        const state = get();
        const intervalMs = state.deadManSwitch.intervalMonths * 30 * 24 * 60 * 60 * 1000;
        set({
          deadManSwitch: {
            ...state.deadManSwitch,
            lastCheckIn: Date.now(),
            nextCheckIn: Date.now() + intervalMs,
            status: 'active',
            warningsSent: 0,
            triggerDate: undefined,
          },
          auditTrail: [...state.auditTrail, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action: 'PROOF_OF_LIFE',
            details: 'Proof of Life check-in completed',
            type: 'success' as const
          }]
        });
      },

      getDaiScore: () => {
        const state = get();
        let score = 0;

        // Inheritance Container (30 pts)
        if (state.inheritanceContainer) {
          score += 10;
          if (state.inheritanceContainer.level >= 2) score += 10;
          if (state.inheritanceContainer.level >= 3) score += 10;
        }

        // Dead Man's Switch (20 pts)
        if (state.deadManSwitch.enabled) {
          if (state.deadManSwitch.status === 'warning_1') score += 15;
          else if (state.deadManSwitch.status === 'warning_2') score += 10;
          else if (state.deadManSwitch.status === 'warning_3') score += 5;
          else if (state.deadManSwitch.status === 'triggered') score += 0;
          else score += 20;
        }

        // Shamir / Key Fragments (20 pts)
        if (state.keyFragments.length > 0) {
          score += 20;
        }

        // Beneficiaries (15 pts)
        if (state.beneficiaries.length > 0) score += 5;
        if (state.beneficiaries.length >= 2) score += 5;
        if (state.beneficiaries.some(b => b.role === 'notary')) score += 5;

        // Emergency Protocol (10 pts)
        if (state.emergencyProtocol.enabled) score += 10;

        // 5 pts reserved for future (biometric on web)

        return Math.min(100, score);
      },

      getTimeUntilTrigger: () => {
        const state = get();
        const dms = state.deadManSwitch;
        if (!dms.enabled || dms.status === 'inactive') return 'Inactive';
        if (dms.status === 'triggered') return 'Triggered';

        const now = Date.now();
        let targetDate = dms.nextCheckIn;

        if (dms.status === 'warning_1') targetDate = dms.nextCheckIn + 14 * 24 * 60 * 60 * 1000;
        else if (dms.status === 'warning_2') targetDate = dms.nextCheckIn + 21 * 24 * 60 * 60 * 1000;
        else if (dms.status === 'warning_3') targetDate = dms.nextCheckIn + 24 * 24 * 60 * 60 * 1000;

        const diff = targetDate - now;
        if (diff <= 0) return 'Overdue';

        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
      },

      getDmsStatusColor: () => {
        const status = get().deadManSwitch.status;
        switch (status) {
          case 'active': return 'text-green-600';
          case 'warning_1': return 'text-amber-500';
          case 'warning_2': return 'text-orange-500';
          case 'warning_3': return 'text-red-500';
          case 'triggered': return 'text-red-700';
          default: return 'text-slate-500';
        }
      },

      setInheritanceContainer: (container: InheritanceContainer) => {
        set((state) => ({
          inheritanceContainer: container,
          auditTrail: [...state.auditTrail, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action: 'UPDATE_INHERITANCE_CONTAINER',
            details: `Updated to Level ${container.level}`,
            type: 'info' as const
          }]
        }));
      },

      setSealedContainer: (sealed: SealedContainer, shards?: string[]) => {
        set((state) => ({
          sealedContainer: sealed,
          containerShards: shards ?? state.containerShards,
          auditTrail: [...state.auditTrail, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action: 'UPDATE_SEALED_CONTAINER',
            details: `Container v${sealed.version} — Score ${sealed.completionScore}% — ${sealed.proofChain.entries.length} proof entries`,
            type: 'info' as const
          }]
        }));
      },

      clearContainerShards: () => {
        set({ containerShards: [] });
      },

      setEmergencyProtocol: (protocol: Partial<EmergencyProtocol>) => {
        set((state) => ({
          emergencyProtocol: { ...state.emergencyProtocol, ...protocol },
          auditTrail: [...state.auditTrail, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action: 'UPDATE_EMERGENCY_PROTOCOL',
            details: `Emergency protocol ${protocol.enabled ? 'enabled' : 'updated'}`,
            type: protocol.enabled ? 'warning' as const : 'info' as const
          }]
        }));
      }
    }),
    {
      name: 'daio-wallet-storage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;

        // ── Validate critical fields on rehydration ─────────────
        if (typeof state.isInitialized !== 'boolean') state.isInitialized = false;
        // Never restore unlocked state from localStorage
        state.isLocked = true;
        state.mnemonicPlain = null;
        // Ensure accounts have sanitised privateKeys (never real keys from persist)
        if (Array.isArray(state.accounts)) {
          (state.accounts as Array<Record<string, unknown>>).forEach(acc => {
            acc.privateKey = '';
            // Validate account shape
            if (typeof acc.address !== 'string') acc.address = '';
            if (typeof acc.name !== 'string') acc.name = 'Account';
          });
        } else {
          state.accounts = [];
        }
        // Ensure key fragment shares are never loaded from persist
        if (Array.isArray(state.keyFragments)) {
          (state.keyFragments as Array<Record<string, unknown>>).forEach(f => {
            f.share = '';
          });
        } else {
          state.keyFragments = [];
        }
        // Validate networks: ensure rpcUrl is https and name is sanitized
        if (Array.isArray(state.networks)) {
          (state.networks as Array<Record<string, unknown>>).forEach(n => {
            if (typeof n.rpcUrl === 'string' && !n.rpcUrl.startsWith('https://')) {
              n.rpcUrl = ''; // reject non-HTTPS RPC URLs
            }
            if (typeof n.name === 'string') {
              n.name = (n.name as string).replace(/[<>]/g, '').slice(0, 50);
            }
          });
        }
        // Validate heirs: strip keyFragment field if present
        if (Array.isArray(state.heirs)) {
          (state.heirs as Array<Record<string, unknown>>).forEach(h => {
            delete h.keyFragment;
            if (typeof h.name === 'string') {
              h.name = (h.name as string).replace(/[<>]/g, '').slice(0, 100);
            }
          });
        }
        // Validate beneficiaries
        if (Array.isArray(state.beneficiaries)) {
          (state.beneficiaries as Array<Record<string, unknown>>).forEach(b => {
            if (typeof b.name === 'string') {
              b.name = (b.name as string).replace(/[<>]/g, '').slice(0, 100);
            }
          });
        }
        // Validate userRole
        const validRoles = ['owner', 'heir', 'guardian', 'notary'];
        if (typeof state.userRole !== 'string' || !validRoles.includes(state.userRole as string)) {
          state.userRole = 'owner';
        }

        if (version < 2) {
          if (!state.tokenPrices) state.tokenPrices = {};
        }
        if (version < 3) {
          if (!state.userRole) state.userRole = 'owner';
          if (!state.beneficiaries) state.beneficiaries = [];
          if (!state.deadManSwitch) state.deadManSwitch = { enabled: false, intervalMonths: 6, lastCheckIn: Date.now(), status: 'inactive', warningsSent: 0, nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000 };
          if (state.inheritanceContainer === undefined) state.inheritanceContainer = null;
          if (!state.sealedContainer) state.sealedContainer = null;
          if (!state.containerShards) state.containerShards = [];
          if (!state.transferGateSteps) state.transferGateSteps = [];
          if (!state.emergencyProtocol) state.emergencyProtocol = { enabled: false, authorizedGuardians: [] };
          if (state.daiScore === undefined) state.daiScore = 0;
        }
        return state as unknown as WalletState;
      },
      partialize: (state: WalletState) => ({
        mnemonic: state.mnemonic,
        password: state.password,
        isInitialized: state.isInitialized,
        accounts: state.accounts.map(acc => ({
          ...acc,
          privateKey: 'encrypted'
        })),
        activeAccountIndex: state.activeAccountIndex,
        networks: state.networks,
        activeNetworkId: state.activeNetworkId,
        tokens: state.tokens,
        nfts: state.nfts,
        defiProtocols: state.defiProtocols,
        portfolioAssets: state.portfolioAssets,
        heirs: state.heirs.map(({ keyFragment: _kf, ...rest }) => rest),
        guardians: state.guardians,
        keyFragments: state.keyFragments.map(frag => {
          const { share, ...rest } = frag;
          void share; // intentionally excluded from persistence
          return rest;
        }),
        dmsConfig: state.dmsConfig,
        auditTrail: state.auditTrail,
        transactions: state.transactions,
        tokenPrices: state.tokenPrices,
        userRole: state.userRole,
        beneficiaries: state.beneficiaries,
        deadManSwitch: state.deadManSwitch,
        inheritanceContainer: state.inheritanceContainer,
        sealedContainer: state.sealedContainer,
        // containerShards intentionally NOT persisted (held in memory only)
        transferGateSteps: state.transferGateSteps,
        emergencyProtocol: state.emergencyProtocol,
        daiScore: state.daiScore
        // mnemonicPlain is intentionally NOT persisted
      })
    }
  )
);
