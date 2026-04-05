import { useWalletStore } from './walletStore';
import type { Network, Token } from './walletStore';

export interface NetworkStoreSlice {
  networks: Network[];
  activeNetworkId: string;
  tokens: Token[];
  setActiveNetwork: (networkId: string) => void;
  addNetwork: (network: Omit<Network, 'id'>) => void;
  removeNetwork: (networkId: string) => void;
  addToken: (token: Omit<Token, 'id'>) => void;
  removeToken: (tokenId: string) => void;
}

export const useNetworkStore = <T>(
  selector: (slice: NetworkStoreSlice) => T,
): T =>
  useWalletStore((state) =>
    selector({
      networks: state.networks,
      activeNetworkId: state.activeNetworkId,
      tokens: state.tokens,
      setActiveNetwork: state.setActiveNetwork,
      addNetwork: state.addNetwork,
      removeNetwork: state.removeNetwork,
      addToken: state.addToken,
      removeToken: state.removeToken,
    }),
  );

