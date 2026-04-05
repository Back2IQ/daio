import React, { useState, useMemo } from 'react';
import { Search, Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { KNOWN_NETWORKS } from '@/data/knownNetworks';

const Networks: React.FC = () => {
  const networks = useWalletStore(s => s.networks);
  const addNetwork = useWalletStore(s => s.addNetwork);
  const removeNetwork = useWalletStore(s => s.removeNetwork);
  const setActiveNetwork = useWalletStore(s => s.setActiveNetwork);
  const activeNetworkId = useWalletStore(s => s.activeNetworkId);

  const [search, setSearch] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newNetwork, setNewNetwork] = useState({
    name: '', chainId: 1, rpcUrl: '', symbol: '', explorerUrl: '', isTestnet: false,
  });

  const enabledChainIds = useMemo(() => new Set(networks.map(n => n.chainId)), [networks]);

  const filteredKnown = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return KNOWN_NETWORKS;
    return KNOWN_NETWORKS.filter(
      n => n.name.toLowerCase().includes(q) || n.symbol.toLowerCase().includes(q) || String(n.chainId).includes(q)
    );
  }, [search]);

  const handleToggleNetwork = (chainId: number) => {
    if (enabledChainIds.has(chainId)) {
      const net = networks.find(n => n.chainId === chainId);
      if (!net) return;
      if (networks.length <= 1) { toast.error('Cannot remove the last network'); return; }
      if (activeNetworkId === net.id) { toast.error('Switch to another network first'); return; }
      removeNetwork(net.id);
      toast.success(`${net.name} removed`);
    } else {
      const known = KNOWN_NETWORKS.find(k => k.chainId === chainId);
      if (!known) return;
      addNetwork({ ...known });
      toast.success(`${known.name} added`);
    }
  };

  const handleAddCustom = () => {
    if (!newNetwork.name.trim()) { toast.error('Network name is required'); return; }
    if (!newNetwork.rpcUrl.trim()) { toast.error('RPC URL is required'); return; }
    if (!newNetwork.symbol.trim()) { toast.error('Symbol is required'); return; }
    if (newNetwork.chainId <= 0 || !Number.isInteger(newNetwork.chainId)) {
      toast.error('Chain ID must be a positive integer'); return;
    }
    if (networks.some(n => n.chainId === newNetwork.chainId)) {
      toast.error('A network with this Chain ID already exists'); return;
    }
    try { new URL(newNetwork.rpcUrl.trim()); } catch { toast.error('Invalid RPC URL format'); return; }

    addNetwork({
      name: newNetwork.name.trim(),
      chainId: newNetwork.chainId,
      rpcUrl: newNetwork.rpcUrl.trim(),
      symbol: newNetwork.symbol.trim().toUpperCase(),
      explorerUrl: newNetwork.explorerUrl.trim(),
      isTestnet: newNetwork.isTestnet,
      nativeCurrency: { name: newNetwork.name.trim(), symbol: newNetwork.symbol.trim().toUpperCase(), decimals: 18 },
      logoURI: '',
      features: ['evm'],
    });
    setNewNetwork({ name: '', chainId: 1, rpcUrl: '', symbol: '', explorerUrl: '', isTestnet: false });
    setShowAddCustom(false);
    toast.success('Custom network added');
  };

  return (
    <div className="space-y-6">
      {/* Active Networks */}
      <Card>
        <CardHeader>
          <CardTitle>Active Networks</CardTitle>
          <CardDescription>Networks currently enabled in your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {networks.map(network => (
              <div
                key={network.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${activeNetworkId === network.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{network.name}</p>
                    <p className="text-xs text-slate-500">{network.symbol} · {network.chainId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {network.isTestnet && <Badge variant="secondary" className="text-[10px]">Testnet</Badge>}
                  {activeNetworkId === network.id ? (
                    <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActiveNetwork(network.id)}>
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Networks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Networks</CardTitle>
              <CardDescription>Browse and enable popular EVM networks</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddCustom(!showAddCustom)}>
              <Plus className="w-4 h-4 mr-1" />{showAddCustom ? 'Cancel' : 'Custom'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search networks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {showAddCustom && (
            <Card className="border-dashed">
              <CardHeader><CardTitle className="text-base">Add Custom Network</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="net-name">Name</Label>
                    <Input id="net-name" value={newNetwork.name} onChange={e => setNewNetwork(p => ({ ...p, name: e.target.value }))} placeholder="Ethereum Mainnet" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net-chainId">Chain ID</Label>
                    <Input id="net-chainId" type="number" min="1" value={newNetwork.chainId} onChange={e => setNewNetwork(p => ({ ...p, chainId: Math.max(1, Math.floor(Number(e.target.value))) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net-rpcUrl">RPC URL</Label>
                    <Input id="net-rpcUrl" value={newNetwork.rpcUrl} onChange={e => setNewNetwork(p => ({ ...p, rpcUrl: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net-symbol">Symbol</Label>
                    <Input id="net-symbol" value={newNetwork.symbol} onChange={e => setNewNetwork(p => ({ ...p, symbol: e.target.value }))} placeholder="ETH" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net-explorer">Explorer URL</Label>
                    <Input id="net-explorer" value={newNetwork.explorerUrl} onChange={e => setNewNetwork(p => ({ ...p, explorerUrl: e.target.value }))} placeholder="https://etherscan.io" />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={newNetwork.isTestnet} onCheckedChange={v => setNewNetwork(p => ({ ...p, isTestnet: v }))} id="net-testnet" />
                    <Label htmlFor="net-testnet">Testnet</Label>
                  </div>
                </div>
                <Button onClick={handleAddCustom}>Add Network</Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-1">
            {filteredKnown.map(known => {
              const isEnabled = enabledChainIds.has(known.chainId);
              return (
                <div key={known.chainId} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{known.name}</p>
                      <p className="text-xs text-slate-500">{known.symbol} · Chain {known.chainId}{known.isTestnet ? ' · Testnet' : ''}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggleNetwork(known.chainId)}
                    aria-label={`Toggle ${known.name}`}
                  />
                </div>
              );
            })}
            {filteredKnown.length === 0 && (
              <p className="text-center text-slate-500 py-8">No networks match your search</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Networks;
