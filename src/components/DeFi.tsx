import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { isValidAddress } from '@/lib/crypto';

// Per-protocol interaction component to avoid shared state bug
function ProtocolInteraction({ protocolId, onInteract }: {
  protocolId: string;
  onInteract: (protocolId: string, action: 'deposit' | 'withdraw' | 'stake' | 'unstake', amount: string) => Promise<void>;
}) {
  const [action, setAction] = useState<'deposit' | 'withdraw' | 'stake' | 'unstake'>('deposit');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Amount must be positive');
      return;
    }
    setIsLoading(true);
    try {
      await onInteract(protocolId, action, amount);
      setAmount('');
      toast.success('Transaction sent!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'DeFi interaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-4">
      <h4 className="font-medium mb-2">Interact with Protocol</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as 'deposit' | 'withdraw' | 'stake' | 'unstake')}
          className="p-2 border rounded-md"
        >
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
          <option value="stake">Stake</option>
          <option value="unstake">Unstake</option>
        </select>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button onClick={handleExecute} disabled={isLoading || !amount}>
          {isLoading ? 'Processing...' : 'Execute'}
        </Button>
      </div>
    </div>
  );
}

const DeFi: React.FC = () => {
  const defiProtocols = useWalletStore(s => s.defiProtocols);
  const addDefiProtocol = useWalletStore(s => s.addDefiProtocol);
  const interactWithDefi = useWalletStore(s => s.interactWithDefi);
  const networks = useWalletStore(s => s.networks);
  const [showAddProtocol, setShowAddProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({
    name: '',
    protocolType: 'lending' as 'lending' | 'dex' | 'yield' | 'staking' | 'derivatives',
    chainId: 1,
    contractAddress: '',
    apy: 0,
    tvl: 0,
  });

  const handleAddProtocol = () => {
    if (!newProtocol.name.trim()) {
      toast.error('Protocol name is required');
      return;
    }
    if (!newProtocol.contractAddress.trim()) {
      toast.error('Contract address is required');
      return;
    }
    if (!isValidAddress(newProtocol.contractAddress.trim())) {
      toast.error('Invalid contract address format');
      return;
    }
    if (newProtocol.apy < 0) {
      toast.error('APY cannot be negative');
      return;
    }

    addDefiProtocol({
      name: newProtocol.name.trim(),
      protocolType: newProtocol.protocolType,
      chainId: newProtocol.chainId,
      contractAddress: newProtocol.contractAddress.trim(),
      apy: newProtocol.apy,
      tvl: newProtocol.tvl,
    });

    setNewProtocol({
      name: '',
      protocolType: 'lending',
      chainId: 1,
      contractAddress: '',
      apy: 0,
      tvl: 0,
    });
    setShowAddProtocol(false);
  };

  const handleInteraction = async (protocolId: string, action: 'deposit' | 'withdraw' | 'stake' | 'unstake', amount: string) => {
    await interactWithDefi(protocolId, action, amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DeFi Protocols</CardTitle>
          <CardDescription>Manage and interact with decentralized finance protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAddProtocol(!showAddProtocol)}>
              {showAddProtocol ? 'Cancel' : 'Add Protocol'}
            </Button>
          </div>

          {showAddProtocol && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New DeFi Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defi-name">Protocol Name</Label>
                    <Input
                      id="defi-name"
                      value={newProtocol.name}
                      onChange={(e) => setNewProtocol(prev => ({...prev, name: e.target.value}))}
                      placeholder="Aave"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi-protocolType">Protocol Type</Label>
                    <select
                      id="defi-protocolType"
                      value={newProtocol.protocolType}
                      onChange={(e) => setNewProtocol(prev => ({...prev, protocolType: e.target.value as 'lending' | 'dex' | 'yield' | 'staking' | 'derivatives'}))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="lending">Lending</option>
                      <option value="dex">DEX</option>
                      <option value="yield">Yield Farming</option>
                      <option value="staking">Staking</option>
                      <option value="derivatives">Derivatives</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi-contractAddress">Contract Address</Label>
                    <Input
                      id="defi-contractAddress"
                      value={newProtocol.contractAddress}
                      onChange={(e) => setNewProtocol(prev => ({...prev, contractAddress: e.target.value}))}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi-chainId">Network</Label>
                    <select
                      id="defi-chainId"
                      value={newProtocol.chainId}
                      onChange={(e) => setNewProtocol(prev => ({...prev, chainId: Number(e.target.value)}))}
                      className="w-full p-2 border rounded-md"
                    >
                      {networks.map(network => (
                        <option key={network.chainId} value={network.chainId}>
                          {network.name} ({network.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi-apy">APY (%) (optional)</Label>
                    <Input
                      id="defi-apy"
                      type="number"
                      min="0"
                      step="0.1"
                      value={newProtocol.apy}
                      onChange={(e) => setNewProtocol(prev => ({...prev, apy: Math.max(0, Number(e.target.value))}))}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defi-tvl">TVL ($M) (optional)</Label>
                    <Input
                      id="defi-tvl"
                      type="number"
                      min="0"
                      value={newProtocol.tvl}
                      onChange={(e) => setNewProtocol(prev => ({...prev, tvl: Math.max(0, Number(e.target.value))}))}
                      placeholder="15000"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddProtocol}>Add Protocol</Button>
                  <Button variant="outline" onClick={() => { setShowAddProtocol(false); setNewProtocol({ name: '', protocolType: 'lending', chainId: 1, contractAddress: '', apy: 0, tvl: 0 }); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {defiProtocols.length > 0 ? (
              defiProtocols.map(protocol => {
                const network = networks.find(n => n.chainId === protocol.chainId);
                return (
                  <Card key={protocol.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        {network && network.logoURI && (
                          <img src={network.logoURI} alt={network.name} className="w-6 h-6 mr-2" />
                        )}
                        {protocol.name}
                      </CardTitle>
                      <CardDescription>
                        {protocol.protocolType.charAt(0).toUpperCase() + protocol.protocolType.slice(1)} protocol on {network?.name || 'Unknown Network'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Type</p>
                          <p className="font-medium capitalize">{protocol.protocolType}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">APY</p>
                          <p className="font-medium">{protocol.apy != null ? `${protocol.apy}%` : 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">TVL</p>
                          <p className="font-medium">{protocol.tvl != null ? `$${protocol.tvl.toLocaleString()}M` : 'N/A'}</p>
                        </div>
                      </div>

                      <ProtocolInteraction protocolId={protocol.id} onInteract={handleInteraction} />

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500 break-all">{protocol.contractAddress}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-center text-slate-500 py-8">No DeFi protocols added yet. Click "Add Protocol" to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeFi;
