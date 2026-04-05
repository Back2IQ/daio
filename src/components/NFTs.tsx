import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { isValidAddress } from '@/lib/crypto';

const NFTs: React.FC = () => {
  const nfts = useWalletStore(s => s.nfts);
  const addNFT = useWalletStore(s => s.addNFT);
  const removeNFT = useWalletStore(s => s.removeNFT);
  const networks = useWalletStore(s => s.networks);
  const [showAddNFT, setShowAddNFT] = useState(false);
  const [newNFT, setNewNFT] = useState({
    name: '',
    collection: '',
    tokenId: '',
    contractAddress: '',
    chainId: 1,
    image: '',
    description: '',
  });

  const handleAddNFT = () => {
    if (!newNFT.name.trim()) { toast.error('NFT name is required'); return; }
    if (!newNFT.collection.trim()) { toast.error('Collection is required'); return; }
    if (!newNFT.tokenId.trim()) { toast.error('Token ID is required'); return; }
    if (!newNFT.contractAddress.trim()) { toast.error('Contract address is required'); return; }
    if (!isValidAddress(newNFT.contractAddress.trim())) {
      toast.error('Invalid contract address format');
      return;
    }
    // Validate tokenId is a non-negative integer
    if (!/^\d+$/.test(newNFT.tokenId.trim())) {
      toast.error('Token ID must be a non-negative integer');
      return;
    }

    addNFT({
      name: newNFT.name.trim(),
      collection: newNFT.collection.trim(),
      tokenId: newNFT.tokenId.trim(),
      contractAddress: newNFT.contractAddress.trim(),
      chainId: newNFT.chainId,
      image: newNFT.image.trim(),
      description: newNFT.description.trim(),
    });

    setNewNFT({ name: '', collection: '', tokenId: '', contractAddress: '', chainId: 1, image: '', description: '' });
    setShowAddNFT(false);
  };

  const groupedNFTs = useMemo(() =>
    networks.map(network => {
      const networkNFTs = nfts.filter(nft => nft.chainId === network.chainId);
      return { network, nfts: networkNFTs };
    }).filter(group => group.nfts.length > 0),
    [networks, nfts]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Non-Fungible Tokens (NFTs)</CardTitle>
          <CardDescription>Manage your NFT collections across different networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAddNFT(!showAddNFT)}>
              {showAddNFT ? 'Cancel' : 'Add NFT'}
            </Button>
          </div>

          {showAddNFT && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nft-name">NFT Name</Label>
                    <Input
                      id="nft-name"
                      value={newNFT.name}
                      onChange={(e) => setNewNFT(prev => ({...prev, name: e.target.value}))}
                      placeholder="My Cool NFT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-collection">Collection</Label>
                    <Input
                      id="nft-collection"
                      value={newNFT.collection}
                      onChange={(e) => setNewNFT(prev => ({...prev, collection: e.target.value}))}
                      placeholder="Bored Ape Yacht Club"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-tokenId">Token ID</Label>
                    <Input
                      id="nft-tokenId"
                      value={newNFT.tokenId}
                      onChange={(e) => setNewNFT(prev => ({...prev, tokenId: e.target.value}))}
                      placeholder="1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-contractAddress">Contract Address</Label>
                    <Input
                      id="nft-contractAddress"
                      value={newNFT.contractAddress}
                      onChange={(e) => setNewNFT(prev => ({...prev, contractAddress: e.target.value}))}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-chainId">Network</Label>
                    <select
                      id="nft-chainId"
                      value={newNFT.chainId}
                      onChange={(e) => setNewNFT(prev => ({...prev, chainId: Number(e.target.value)}))}
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
                    <Label htmlFor="nft-image">Image URL</Label>
                    <Input
                      id="nft-image"
                      value={newNFT.image}
                      onChange={(e) => setNewNFT(prev => ({...prev, image: e.target.value}))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nft-description">Description (optional)</Label>
                    <Input
                      id="nft-description"
                      value={newNFT.description}
                      onChange={(e) => setNewNFT(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe your NFT..."
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddNFT}>Add NFT</Button>
                  <Button variant="outline" onClick={() => { setShowAddNFT(false); setNewNFT({ name: '', collection: '', tokenId: '', contractAddress: '', chainId: 1, image: '', description: '' }); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {groupedNFTs.length > 0 ? (
            <div className="space-y-6">
              {groupedNFTs.map(({ network, nfts: networkNFTs }) => (
                <Card key={network.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      {network.logoURI && (
                        <img src={network.logoURI} alt={network.name} className="w-6 h-6 mr-2" />
                      )}
                      {network.name} NFTs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {networkNFTs.map(nft => (
                        <Card key={nft.id} className="overflow-hidden">
                          <div className="aspect-square w-full bg-slate-100 flex items-center justify-center">
                            {nft.image ? (
                              <img
                                src={nft.image}
                                alt={nft.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-slate-400">No Image</div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold truncate">{nft.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{nft.collection}</p>
                            <p className="text-xs text-slate-400">Token #{nft.tokenId}</p>
                            <div className="mt-3 flex justify-between items-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeNFT(nft.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No NFTs added yet. Click "Add NFT" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTs;
