import { useQuery } from '@tanstack/react-query';
import { getNativeBalance, getTokenBalances } from '@/lib/blockchain';

export interface TokenInfo {
  contractAddress: string;
  decimals: number;
  symbol: string;
}

export function useBalances(
  chainId: number | undefined,
  address: string | undefined,
  tokens: TokenInfo[] = []
) {
  return useQuery({
    queryKey: ['balances', chainId, address, tokens.map((t) => t.contractAddress)],
    queryFn: async () => {
      if (!chainId || !address) return { native: '0', tokens: {} };

      const [native, tokenBalances] = await Promise.all([
        getNativeBalance(chainId, address),
        tokens.length > 0 ? getTokenBalances(chainId, address, tokens) : Promise.resolve({}),
      ]);

      return { native, tokens: tokenBalances };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: !!chainId && !!address,
  });
}
