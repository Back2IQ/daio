import { useWalletStore } from './walletStore';
import type { WalletAccount, Network } from './walletStore';

export interface AccountStoreSlice {
  accounts: WalletAccount[];
  activeAccountIndex: number;
  networks: Network[];
  activeNetworkId: string;
  getActiveAccount: () => WalletAccount | null;
  getActiveNetwork: () => Network;
  getBalance: () => string;
  addAccount: (name?: string) => void;
  setActiveAccount: (index: number) => void;
  setActiveNetwork: (networkId: string) => void;
  setAccountBalance: (index: number, balance: string) => void;
}

export const useAccountStore = <T>(
  selector: (slice: AccountStoreSlice) => T,
): T =>
  useWalletStore((state) =>
    selector({
      accounts: state.accounts,
      activeAccountIndex: state.activeAccountIndex,
      networks: state.networks,
      activeNetworkId: state.activeNetworkId,
      getActiveAccount: state.getActiveAccount,
      getActiveNetwork: state.getActiveNetwork,
      getBalance: state.getBalance,
      addAccount: state.addAccount,
      setActiveAccount: state.setActiveAccount,
      setActiveNetwork: state.setActiveNetwork,
      setAccountBalance: state.setAccountBalance,
    }),
  );

