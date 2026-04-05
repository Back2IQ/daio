import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/store/walletStore';
import { getTokenPrice as getTokenPriceFallback } from '@/lib/format';

const PortfolioTab: React.FC = () => {
  const tokens = useWalletStore(s => s.tokens);
  const nfts = useWalletStore(s => s.nfts);
  const defiProtocols = useWalletStore(s => s.defiProtocols);
  const getPortfolioValue = useWalletStore(s => s.getPortfolioValue);
  const storedPrices = useWalletStore(s => s.tokenPrices);

  const getPrice = (symbol: string) => storedPrices[symbol] ?? getTokenPriceFallback(symbol);

  const portfolioValue = getPortfolioValue();
  const safeDivisor = portfolioValue > 0 ? portfolioValue : 1;

  const allTokensValue = tokens.reduce((sum, t) => sum + parseFloat(t.balance || '0') * getPrice(t.symbol), 0);
  const allDefiValue = defiProtocols.reduce((sum, p) => sum + (p.tvl != null ? p.tvl : 0), 0);
  const allNftsValue = 0;

  const sortedAllTokens = [...tokens].sort((a, b) => {
    const aValue = parseFloat(a.balance || '0') * getPrice(a.symbol);
    const bValue = parseFloat(b.balance || '0') * getPrice(b.symbol);
    return bValue - aValue;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CardTitle>
            <CardDescription>Portfolio Value</CardDescription>
          </CardHeader>
          <CardContent><p className="text-sm text-slate-500">Total assets across all networks</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{tokens.length}</CardTitle>
            <CardDescription>Tokens</CardDescription>
          </CardHeader>
          <CardContent><p className="text-sm text-slate-500">Different tokens held</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{nfts.length}</CardTitle>
            <CardDescription>NFTs</CardDescription>
          </CardHeader>
          <CardContent><p className="text-sm text-slate-500">Unique collectibles</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{defiProtocols.length}</CardTitle>
            <CardDescription>DeFi Protocols</CardDescription>
          </CardHeader>
          <CardContent><p className="text-sm text-slate-500">Active investments</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Breakdown of your portfolio by asset type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Tokens</span>
                    <span className="text-sm font-medium">${allTokensValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-label="Token allocation">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((allTokensValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">NFTs</span>
                    <span className="text-sm font-medium">${allNftsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-label="NFT allocation">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((allNftsValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">DeFi Investments</span>
                    <span className="text-sm font-medium">${allDefiValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-label="DeFi allocation">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((allDefiValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Holdings Summary</CardTitle>
              <CardDescription>Top assets in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedAllTokens.slice(0, 5).map(token => {
                  const value = parseFloat(token.balance || '0') * getPrice(token.symbol);
                  return (
                    <div key={token.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        {token.logoURI && <img src={token.logoURI} alt={token.name} className="w-6 h-6 mr-2 rounded-full" />}
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-slate-500">{token.balance} {token.symbol}</div>
                      </div>
                    </div>
                  );
                })}
                {nfts.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between"><span className="font-medium">NFTs</span><span>${allNftsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  </div>
                )}
                {defiProtocols.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between"><span className="font-medium">DeFi</span><span>${allDefiValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTab;
