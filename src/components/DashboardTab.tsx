import React from 'react';
import {
  Send, ArrowDownLeft, Clock, CheckCircle, Key, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/store/walletStore';
import { formatAddress } from '@/lib/crypto';
import { getTokenPrice as getTokenPriceFallback, formatDate } from '@/lib/format';
import { usePrices } from '@/hooks/usePrices';
import { useBalances } from '@/hooks/useBalances';
import { getCoinKey } from '@/lib/prices';
import DAIOScoreWidget from '@/components/DAIOScoreWidget';

interface DashboardTabProps {
  onSendOpen: () => void;
  onReceiveOpen: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ onSendOpen, onReceiveOpen }) => {
  const activeAccount = useWalletStore(s => s.getActiveAccount());
  const activeNetwork = useWalletStore(s => s.getActiveNetwork());
  const tokens = useWalletStore(s => s.tokens);
  const nfts = useWalletStore(s => s.nfts);
  const defiProtocols = useWalletStore(s => s.defiProtocols);
  const keyFragments = useWalletStore(s => s.keyFragments);
  const dmsConfig = useWalletStore(s => s.dmsConfig);
  const transactions = useWalletStore(s => s.transactions);
  const pendingTransactions = useWalletStore(s => s.pendingTransactions);
  const getPortfolioValue = useWalletStore(s => s.getPortfolioValue);
  const storedPrices = useWalletStore(s => s.tokenPrices);
  const setTokenPrices = useWalletStore(s => s.setTokenPrices);
  const setAccountBalance = useWalletStore(s => s.setAccountBalance);

  // Live price queries
  const priceQueries = tokens.map(t => ({ chainId: t.chainId, symbol: t.symbol }));
  priceQueries.push({ chainId: activeNetwork.chainId, symbol: activeNetwork.symbol });
  const { data: livePrices } = usePrices(priceQueries);

  // Live native balance
  const { data: balanceData } = useBalances(activeNetwork.chainId, activeAccount?.address);

  // Sync live prices into store
  React.useEffect(() => {
    if (livePrices) {
      const symbolPrices: Record<string, number> = {};
      tokens.forEach(t => {
        const key = getCoinKey(t.chainId);
        if (livePrices[key] != null) symbolPrices[t.symbol] = livePrices[key];
      });
      const nativeKey = getCoinKey(activeNetwork.chainId);
      if (livePrices[nativeKey] != null) symbolPrices[activeNetwork.symbol] = livePrices[nativeKey];
      if (Object.keys(symbolPrices).length > 0) setTokenPrices({ ...storedPrices, ...symbolPrices });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrices, tokens, activeNetwork, setTokenPrices]);

  // Sync live native balance into store
  const activeIndex = activeAccount?.index;
  React.useEffect(() => {
    if (balanceData?.native && activeIndex != null) {
      setAccountBalance(activeIndex, balanceData.native);
    }
  }, [balanceData?.native, activeIndex, setAccountBalance]);

  // Price helper: prefer live store prices, fallback to hardcoded
  const getPrice = (symbol: string) => storedPrices[symbol] ?? getTokenPriceFallback(symbol);

  const networkTokens = tokens.filter(t => t.chainId === activeNetwork.chainId);
  const tokensValue = networkTokens.reduce((sum, token) => {
    return sum + parseFloat(token.balance || '0') * getPrice(token.symbol);
  }, 0);
  const networkNftsCount = nfts.filter(n => n.chainId === activeNetwork.chainId).length;
  const nftsValue = 0;
  const networkDefi = defiProtocols.filter(d => d.chainId === activeNetwork.chainId);
  const defiValue = networkDefi.reduce((sum, protocol) => sum + (protocol.tvl != null ? protocol.tvl : 0), 0);
  const portfolioValue = getPortfolioValue();
  const safeDivisor = portfolioValue > 0 ? portfolioValue : 1;

  const sortedTokens = [...networkTokens].sort((a, b) => {
    const aValue = parseFloat(a.balance || '0') * getPrice(a.symbol);
    const bValue = parseFloat(b.balance || '0') * getPrice(b.symbol);
    return bValue - aValue;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold">{activeAccount?.balance || '0'} {activeNetwork.symbol}</h2>
              <p className="text-blue-200 text-sm mt-1">
                &asymp; ${(parseFloat(activeAccount?.balance || '0') * getPrice(activeNetwork.symbol)).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">{activeNetwork.name}</p>
              <p className="text-blue-200 text-xs">{formatAddress(activeAccount?.address || '')}</p>
            </div>
          </div>
          <div className="flex space-x-3 mt-8">
            <Button className="flex-1 bg-white text-blue-700 hover:bg-blue-50" onClick={onSendOpen}>
              <Send className="w-4 h-4 mr-2" />Send
            </Button>
            <Button variant="outline" className="flex-1 border-white text-white hover:bg-white/10" onClick={onReceiveOpen}>
              <ArrowDownLeft className="w-4 h-4 mr-2" />Receive
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DAIOScoreWidget />
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">DMS Status</p><p className="text-lg font-semibold text-blue-600">{dmsConfig.enabled ? dmsConfig.status.replace('_', ' ').toUpperCase() : 'Inactive'}</p></div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Wallet Status</p><p className="text-lg font-semibold text-green-600">Ready</p></div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">DMS Status</p><p className="text-lg font-semibold text-blue-600">{dmsConfig.enabled ? 'Active' : 'Inactive'}</p></div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Fragments</p><p className="text-lg font-semibold text-purple-600">{keyFragments.length}/5</p></div>
              <Key className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">Portfolio</p><p className="text-lg font-semibold text-orange-600">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
              <Wallet className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Manage your assets across different networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Tokens</span>
                    <span className="text-sm font-medium">${tokensValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={tokensValue} aria-valuemin={0} aria-valuemax={portfolioValue} aria-label="Token portfolio share">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((tokensValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">NFTs</span>
                    <span className="text-sm font-medium">${nftsValue}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={nftsValue} aria-valuemin={0} aria-valuemax={portfolioValue} aria-label="NFT portfolio share">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((nftsValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">DeFi Investments</span>
                    <span className="text-sm font-medium">${defiValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={defiValue} aria-valuemin={0} aria-valuemax={portfolioValue} aria-label="DeFi portfolio share">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((defiValue / safeDivisor) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Assets</CardTitle>
              <CardDescription>Your most valuable assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTokens.slice(0, 3).map(token => {
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
                {networkNftsCount > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between"><span className="font-medium">NFTs</span><span>${nftsValue}</span></div>
                  </div>
                )}
                {networkDefi.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between"><span className="font-medium">DeFi</span><span>${defiValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {pendingTransactions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-2">Pending</p>
              {pendingTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Clock className="w-4 h-4 text-yellow-600" /></div>
                    <div><p className="font-medium">Send</p><p className="text-sm text-slate-500">{formatAddress(tx.to)}</p></div>
                  </div>
                  <div className="text-right"><p className="font-medium text-yellow-600">-{tx.value} {tx.tokenSymbol || activeNetwork.symbol}</p><p className="text-xs text-slate-400">Pending</p></div>
                </div>
              ))}
            </div>
          )}
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No transactions</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                      {tx.type === 'send' ? <Send className="w-4 h-4 text-red-600" /> : <ArrowDownLeft className="w-4 h-4 text-green-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type === 'send' ? 'Sent' : 'Received'}</p>
                      <p className="text-sm text-slate-500">{tx.type === 'send' ? formatAddress(tx.to) : formatAddress(tx.from)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>{tx.type === 'send' ? '-' : '+'}{tx.value} {tx.tokenSymbol || activeNetwork.symbol}</p>
                    <p className="text-xs text-slate-400">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
