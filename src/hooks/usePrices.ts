import { useQuery } from '@tanstack/react-query';
import { fetchTokenPrices, getCoinKey, type TokenPriceQuery } from '@/lib/prices';

export function usePrices(tokens: TokenPriceQuery[]) {
  const queryKey = ['token-prices', tokens.map((t) => getCoinKey(t.chainId, t.contractAddress))];

  return useQuery({
    queryKey,
    queryFn: () => fetchTokenPrices(tokens),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: tokens.length > 0,
  });
}
