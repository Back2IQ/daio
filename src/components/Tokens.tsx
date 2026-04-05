import React, { useState, useMemo } from 'react';
import { Search, Plus, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { isValidAddress } from '@/lib/crypto';
import { POPULAR_TOKENS } from '@/data/popularTokens';

const Tokens: React.FC = () => {
  const tokens = useWalletStore(s => s.tokens);
  const addToken = useWalletStore(s => s.addToken);
  const removeToken = useWalletStore(s => s.removeToken);
  const networks = useWalletStore(s => s.networks);
  const activeNetwork = useWalletStore(s => s.getActiveNetwork());

  const [search, setSearch] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '', symbol: '', contractAddress: '', decimals: 18, chainId: activeNetwork.chainId, logoURI: '',
  });

  // Tokens for the active network
  const activeTokens = useMemo(
    () => tokens.filter(t => t.chainId === activeNetwork.chainId),
    [tokens, activeNetwork.chainId]
  );

  // Set of contract addresses already tracked (lowercase for comparison)
  const trackedAddresses = useMemo(
    () => new Set(activeTokens.map(t => t.contractAddress.toLowerCase())),
    [activeTokens]
  );

  // Popular tokens for active chain, filtered by search
  const popularForChain = useMemo(() => {
    const list = POPULAR_TOKENS[activeNetwork.chainId] || [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(t => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q) || t.contractAddress.toLowerCase().includes(q));
  }, [activeNetwork.chainId, search]);

  // Filtered active tokens by search
  const filteredActiveTokens = useMemo(() => {
    if (!search) return activeTokens;
    const q = search.toLowerCase();
    return activeTokens.filter(t => t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q));
  }, [activeTokens, search]);

  const handleToggleToken = (token: typeof popularForChain[0]) => {
    const addr = token.contractAddress.toLowerCase();
    if (trackedAddresses.has(addr)) {
      const existing = tokens.find(t => t.contractAddress.toLowerCase() === addr && t.chainId === token.chainId);
      if (existing) {
        removeToken(existing.id);
        toast.success(`${token.symbol} removed`);
      }
    } else {
      addToken({ ...token, balance: '0' });
      toast.success(`${token.symbol} added`);
    }
  };

  const handleAddCustom = () => {
    if (!newToken.name.trim()) { toast.error('Token name is required'); return; }
    if (!newToken.symbol.trim()) { toast.error('Symbol is required'); return; }
    if (!newToken.contractAddress.trim()) { toast.error('Contract address is required'); return; }
    if (!isValidAddress(newToken.contractAddress.trim())) { toast.error('Invalid contract address'); return; }
    if (newToken.decimals < 0 || newToken.decimals > 18 || !Number.isInteger(newToken.decimals)) {
      toast.error('Decimals must be 0–18'); return;
    }

    addToken({
      name: newToken.name.trim(),
      symbol: newToken.symbol.trim().toUpperCase(),
      contractAddress: newToken.contractAddress.trim(),
      decimals: newToken.decimals,
      chainId: newToken.chainId,
      logoURI: newToken.logoURI.trim(),
      balance: '0',
    });
    setNewToken({ name: '', symbol: '', contractAddress: '', decimals: 18, chainId: activeNetwork.chainId, logoURI: '' });
    setShowAddCustom(false);
    toast.success('Custom token added');
  };

  return (
    <div className="space-y-6">
      {/* Your Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tokens — {activeNetwork.name}</CardTitle>
          <CardDescription>{activeTokens.length} tokens tracked on this network</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTokens.length === 0 ? (
            <p className="text-center text-slate-500 py-6">No tokens tracked yet. Enable tokens from the list below.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredActiveTokens.map(token => (
                <div key={token.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <Coins className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{token.symbol}</p>
                      <p className="text-xs text-slate-500">{token.balance || '0'} {token.symbol}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 text-xs h-7" onClick={() => { removeToken(token.id); toast.success(`${token.symbol} removed`); }}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Tokens Browser */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Popular Tokens</CardTitle>
              <CardDescription>Browse and enable popular tokens on {activeNetwork.name}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddCustom(!showAddCustom)}>
              <Plus className="w-4 h-4 mr-1" />{showAddCustom ? 'Cancel' : 'Custom'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search tokens..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {showAddCustom && (
            <Card className="border-dashed">
              <CardHeader><CardTitle className="text-base">Add Custom Token</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tok-name">Name</Label>
                    <Input id="tok-name" value={newToken.name} onChange={e => setNewToken(p => ({ ...p, name: e.target.value }))} placeholder="USD Coin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tok-symbol">Symbol</Label>
                    <Input id="tok-symbol" value={newToken.symbol} onChange={e => setNewToken(p => ({ ...p, symbol: e.target.value }))} placeholder="USDC" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tok-addr">Contract Address</Label>
                    <Input id="tok-addr" value={newToken.contractAddress} onChange={e => setNewToken(p => ({ ...p, contractAddress: e.target.value }))} placeholder="0x..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tok-decimals">Decimals</Label>
                    <Input id="tok-decimals" type="number" min="0" max="18" value={newToken.decimals} onChange={e => setNewToken(p => ({ ...p, decimals: Math.min(18, Math.max(0, Math.floor(Number(e.target.value)))) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tok-chain">Network</Label>
                    <select id="tok-chain" aria-label="Network" value={newToken.chainId} onChange={e => setNewToken(p => ({ ...p, chainId: Number(e.target.value) }))} className="w-full p-2 border rounded-md">
                      {networks.map(n => <option key={n.chainId} value={n.chainId}>{n.name} ({n.symbol})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tok-logo">Logo URL (optional)</Label>
                    <Input id="tok-logo" value={newToken.logoURI} onChange={e => setNewToken(p => ({ ...p, logoURI: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                <Button onClick={handleAddCustom}>Add Token</Button>
              </CardContent>
            </Card>
          )}

          {popularForChain.length > 0 ? (
            <div className="space-y-1">
              {popularForChain.map(token => {
                const isTracked = trackedAddresses.has(token.contractAddress.toLowerCase());
                return (
                  <div key={token.contractAddress} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{token.name}</p>
                        <p className="text-xs text-slate-500">{token.symbol} · {token.decimals} decimals</p>
                      </div>
                    </div>
                    <Switch
                      checked={isTracked}
                      onCheckedChange={() => handleToggleToken(token)}
                      aria-label={`Toggle ${token.symbol}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              {search ? 'No tokens match your search' : 'No curated tokens available for this network. Add custom tokens above.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tokens;
