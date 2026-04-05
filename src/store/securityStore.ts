import { useWalletStore } from './walletStore';
import type { DeadManSwitch, DMSConfig, PasswordData } from './walletStore';

export interface SecurityStoreSlice {
  mnemonicPlain: string | null;
  password: PasswordData | null;
  isInitialized: boolean;
  isLocked: boolean;
  failedAttempts: number;
  lockoutUntil: number;
  dmsConfig: DMSConfig;
  deadManSwitch: DeadManSwitch;
  initializeWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  updateDMSConfig: (config: Partial<DMSConfig>) => void;
  checkIn: () => void;
  getTimeUntilTrigger: () => string;
  getDmsStatusColor: () => string;
}

export const useSecurityStore = <T>(
  selector: (slice: SecurityStoreSlice) => T,
): T =>
  useWalletStore((state) =>
    selector({
      mnemonicPlain: state.mnemonicPlain,
      password: state.password,
      isInitialized: state.isInitialized,
      isLocked: state.isLocked,
      failedAttempts: state.failedAttempts,
      lockoutUntil: state.lockoutUntil,
      dmsConfig: state.dmsConfig,
      deadManSwitch: state.deadManSwitch,
      initializeWallet: state.initializeWallet,
      importWallet: state.importWallet,
      unlockWallet: state.unlockWallet,
      lockWallet: state.lockWallet,
      updateDMSConfig: state.updateDMSConfig,
      checkIn: state.checkIn,
      getTimeUntilTrigger: state.getTimeUntilTrigger,
      getDmsStatusColor: state.getDmsStatusColor,
    }),
  );

