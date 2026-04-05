import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useWalletStore } from '@/store/walletStore';
import {
  createSealedContainer,
  updateSealedContainer,
  openContainer,
  recordCheckIn,
  verifyContainerIntegrity,
  exportSealedContainer,
  createEmptyContainerData,
  generateId,
  computeCompletionScore,
  type ContainerData,
  type AssetEntry,
  type HeirDesignation,
} from '@/lib/inheritanceContainer';
import { getChainSummary } from '@/lib/hashChain';
import { Shield, Plus, Trash2, Lock, Unlock, Download, CheckCircle2, AlertTriangle, Link2, FileText } from 'lucide-react';

type View = 'overview' | 'edit' | 'shards' | 'proof';

const ASSET_TYPES: AssetEntry['type'][] = [
  'crypto_wallet', 'exchange_account', 'defi_position', 'nft_collection',
  'digital_business', 'cloud_storage', 'domain', 'social_media', 'other',
];

const HEIR_ROLES: HeirDesignation['role'][] = [
  'primary_heir', 'secondary_heir', 'guardian', 'notary', 'executor',
];

const InheritanceContainerTab: React.FC = () => {
  const sealedContainer = useWalletStore(s => s.sealedContainer);
  const setSealedContainer = useWalletStore(s => s.setSealedContainer);
  const containerShards = useWalletStore(s => s.containerShards);
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);

  const [view, setView] = useState<View>('overview');
  const [containerData, setContainerData] = useState<ContainerData>(createEmptyContainerData());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shamirParts, setShamirParts] = useState(3);
  const [shamirThreshold, setShamirThreshold] = useState(2);

  // ─── Create New Container ──────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (shamirThreshold > shamirParts) { setError('Threshold cannot exceed total shards'); return; }

    setLoading(true);
    setError('');
    try {
      const { sealed, shards } = await createSealedContainer(
        containerData, password, shamirParts, shamirThreshold,
      );
      setSealedContainer(sealed, shards);
      setIsUnlocked(true);
      setView('overview');
      addAuditEntry({ action: 'CONTAINER_CREATED', details: `Sealed container created — ${shamirParts} shards (${shamirThreshold} required)`, type: 'success' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create container');
    } finally {
      setLoading(false);
    }
  }, [containerData, password, confirmPassword, shamirParts, shamirThreshold, setSealedContainer, addAuditEntry]);

  // ─── Unlock Existing Container ─────────────────────────────────
  const handleUnlock = useCallback(async () => {
    if (!sealedContainer || !password) return;
    setLoading(true);
    setError('');
    try {
      const data = await openContainer(sealedContainer, password);
      setContainerData(data);
      setIsUnlocked(true);
      setView('edit');
      addAuditEntry({ action: 'CONTAINER_UNLOCKED', details: 'Container unlocked for editing', type: 'info' });
    } catch {
      setError('Wrong password or corrupted container');
    } finally {
      setLoading(false);
    }
  }, [sealedContainer, password, addAuditEntry]);

  // ─── Save Changes ──────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!sealedContainer || !password) return;
    setLoading(true);
    setError('');
    try {
      const updated = await updateSealedContainer(sealedContainer, containerData, password);
      setSealedContainer(updated);
      addAuditEntry({ action: 'CONTAINER_UPDATED', details: `v${updated.version} — Score ${updated.completionScore}%`, type: 'success' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }, [sealedContainer, containerData, password, setSealedContainer, addAuditEntry]);

  // ─── DMS Check-In ──────────────────────────────────────────────
  const handleCheckIn = useCallback(() => {
    if (!sealedContainer) return;
    const updated = recordCheckIn(sealedContainer);
    setSealedContainer(updated);
    addAuditEntry({ action: 'DMS_CHECKIN', details: 'Proof-of-life recorded on hash chain', type: 'success' });
  }, [sealedContainer, setSealedContainer, addAuditEntry]);

  // ─── Export ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!sealedContainer) return;
    const json = exportSealedContainer(sealedContainer);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daio-container-v${sealedContainer.version}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sealedContainer]);

  // ─── Asset Management ──────────────────────────────────────────
  const addAsset = () => {
    setContainerData(prev => ({
      ...prev,
      assets: [...prev.assets, { id: generateId(), type: 'crypto_wallet', name: '', description: '', accessMethod: '' }],
    }));
  };

  const removeAsset = (id: string) => {
    setContainerData(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
  };

  const updateAsset = (id: string, field: keyof AssetEntry, value: string) => {
    setContainerData(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, [field]: value } : a),
    }));
  };

  // ─── Heir Management ───────────────────────────────────────────
  const addHeir = () => {
    setContainerData(prev => ({
      ...prev,
      heirs: [...prev.heirs, { id: generateId(), name: '', email: '', role: 'primary_heir' }],
    }));
  };

  const removeHeir = (id: string) => {
    setContainerData(prev => ({ ...prev, heirs: prev.heirs.filter(h => h.id !== id) }));
  };

  const updateHeir = (id: string, field: keyof HeirDesignation, value: string | number) => {
    setContainerData(prev => ({
      ...prev,
      heirs: prev.heirs.map(h => h.id === id ? { ...h, [field]: value } : h),
    }));
  };

  const score = sealedContainer?.completionScore ?? computeCompletionScore(containerData);
  const integrity = sealedContainer ? verifyContainerIntegrity(sealedContainer) : null;

  // ─── No Container Yet: Creation Flow ───────────────────────────
  if (!sealedContainer) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" /> Inheritance Container</h2>
          <p className="text-slate-500">Create an encrypted, Shamir-split container for your digital legacy</p>
        </div>

        {error && <div className="p-3 rounded bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Container Password</CardTitle>
            <CardDescription>This password encrypts your container. It will be split into Shamir shards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password (min. 8 characters)</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Strong password..." />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Shards</Label>
                <Input type="number" min={2} max={10} value={shamirParts} onChange={e => setShamirParts(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Required to Reconstruct</Label>
                <Input type="number" min={2} max={shamirParts} value={shamirThreshold} onChange={e => setShamirThreshold(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Asset + Heir entry before sealing */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>What digital assets should be covered?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {containerData.assets.map(asset => (
              <div key={asset.id} className="flex gap-2 items-start">
                <select title="Asset type" className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" value={asset.type} onChange={e => updateAsset(asset.id, 'type', e.target.value)}>
                  {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
                <Input placeholder="Name" className="flex-1" value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)} />
                <Input placeholder="Access method" className="flex-1" value={asset.accessMethod} onChange={e => updateAsset(asset.id, 'accessMethod', e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeAsset(asset.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAsset}><Plus className="w-4 h-4 mr-1" /> Add Asset</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heirs & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {containerData.heirs.map(heir => (
              <div key={heir.id} className="flex gap-2 items-start">
                <Input placeholder="Name" className="flex-1" value={heir.name} onChange={e => updateHeir(heir.id, 'name', e.target.value)} />
                <Input placeholder="Email" className="flex-1" value={heir.email} onChange={e => updateHeir(heir.id, 'email', e.target.value)} />
                <select title="Heir role" className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" value={heir.role} onChange={e => updateHeir(heir.id, 'role', e.target.value)}>
                  {HEIR_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
                <Button variant="ghost" size="icon" onClick={() => removeHeir(heir.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeir}><Plus className="w-4 h-4 mr-1" /> Add Heir</Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">Score: {computeCompletionScore(containerData)}%</Badge>
          <Button className="flex-1" onClick={handleCreate} disabled={loading}>
            <Lock className="w-4 h-4 mr-2" />{loading ? 'Encrypting...' : 'Create & Seal Container'}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Container Exists: Main UI ─────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" /> Inheritance Container</h2>
          <p className="text-slate-500">v{sealedContainer.version} — {new Date(sealedContainer.lastUpdated).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={score >= 75 ? 'default' : score >= 50 ? 'secondary' : 'destructive'} className="text-lg px-3 py-1">
            {score}%
          </Badge>
          {integrity && (
            <Badge variant={integrity.chainValid ? 'outline' : 'destructive'}>
              {integrity.chainValid ? <><CheckCircle2 className="w-3 h-3 mr-1" />Chain OK</> : <><AlertTriangle className="w-3 h-3 mr-1" />Broken</>}
            </Badge>
          )}
        </div>
      </div>

      {error && <div className="p-3 rounded bg-red-900/20 border border-red-800 text-red-400 text-sm">{error}</div>}

      {/* Navigation */}
      <div className="flex gap-2">
        {(['overview', 'edit', 'shards', 'proof'] as View[]).map(v => (
          <Button key={v} variant={view === v ? 'default' : 'outline'} size="sm" onClick={() => setView(v)} disabled={v === 'edit' && !isUnlocked}>
            {v === 'overview' && <Shield className="w-4 h-4 mr-1" />}
            {v === 'edit' && (isUnlocked ? <Unlock className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />)}
            {v === 'shards' && <Link2 className="w-4 h-4 mr-1" />}
            {v === 'proof' && <FileText className="w-4 h-4 mr-1" />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </div>

      {/* ─── OVERVIEW ─────────────────────────────────────────── */}
      {view === 'overview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Version:</span> {sealedContainer.version}</div>
                <div><span className="text-slate-500">Created:</span> {new Date(sealedContainer.createdAt).toLocaleString()}</div>
                <div><span className="text-slate-500">Shards:</span> {sealedContainer.threshold}-of-{sealedContainer.totalShards}</div>
                <div><span className="text-slate-500">Distributed:</span> {sealedContainer.shards.filter(s => s.distributed).length}/{sealedContainer.totalShards}</div>
                <div><span className="text-slate-500">Proof Entries:</span> {sealedContainer.proofChain.entries.length}</div>
                <div><span className="text-slate-500">Completion:</span> {sealedContainer.completionScore}%</div>
              </div>
            </CardContent>
          </Card>

          {!isUnlocked && (
            <Card>
              <CardHeader><CardTitle>Unlock Container</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input type="password" placeholder="Container password..." value={password} onChange={e => setPassword(e.target.value)} />
                <Button onClick={handleUnlock} disabled={loading} className="w-full">
                  <Unlock className="w-4 h-4 mr-2" />{loading ? 'Decrypting...' : 'Unlock'}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCheckIn} className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />Check-In (Proof of Life)
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
          </div>
        </div>
      )}

      {/* ─── EDIT (unlocked only) ─────────────────────────────── */}
      {view === 'edit' && isUnlocked && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Assets ({containerData.assets.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {containerData.assets.map(asset => (
                <div key={asset.id} className="space-y-2 p-3 border border-slate-700 rounded">
                  <div className="flex gap-2">
                    <select title="Asset type" className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" value={asset.type} onChange={e => updateAsset(asset.id, 'type', e.target.value)}>
                      {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                    <Input placeholder="Name" className="flex-1" value={asset.name} onChange={e => updateAsset(asset.id, 'name', e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removeAsset(asset.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <Input placeholder="Description" value={asset.description} onChange={e => updateAsset(asset.id, 'description', e.target.value)} />
                  <Input placeholder="Access method (how to reach this asset)" value={asset.accessMethod} onChange={e => updateAsset(asset.id, 'accessMethod', e.target.value)} />
                  <Input placeholder="Estimated value (optional)" value={asset.estimatedValue || ''} onChange={e => updateAsset(asset.id, 'estimatedValue', e.target.value)} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAsset}><Plus className="w-4 h-4 mr-1" /> Add Asset</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Heirs & Roles ({containerData.heirs.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {containerData.heirs.map(heir => (
                <div key={heir.id} className="flex gap-2 items-center">
                  <Input placeholder="Name" className="flex-1" value={heir.name} onChange={e => updateHeir(heir.id, 'name', e.target.value)} />
                  <Input placeholder="Email" className="flex-1" value={heir.email} onChange={e => updateHeir(heir.id, 'email', e.target.value)} />
                  <select title="Heir role" className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm" value={heir.role} onChange={e => updateHeir(heir.id, 'role', e.target.value)}>
                    {HEIR_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </select>
                  <Button variant="ghost" size="icon" onClick={() => removeHeir(heir.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addHeir}><Plus className="w-4 h-4 mr-1" /> Add Heir</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Governance Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Access Architecture</Label>
                <Textarea placeholder="Describe how your assets can be accessed (key locations, password managers, hardware wallets)..." value={containerData.accessArchitecture} onChange={e => setContainerData(prev => ({ ...prev, accessArchitecture: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Legacy Context</Label>
                <Textarea placeholder="Personal notes, wishes, and context for your heirs..." value={containerData.legacyContext} onChange={e => setContainerData(prev => ({ ...prev, legacyContext: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Professional Contacts</Label>
                <Textarea placeholder="Notary, attorney, financial advisor..." value={containerData.professionalContacts} onChange={e => setContainerData(prev => ({ ...prev, professionalContacts: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Jurisdiction</Label>
                <select title="Jurisdiction" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2" value={containerData.jurisdiction} onChange={e => setContainerData(prev => ({ ...prev, jurisdiction: e.target.value }))}>
                  <option value="DE">Germany (DE)</option>
                  <option value="AT">Austria (AT)</option>
                  <option value="CH">Switzerland (CH)</option>
                  <option value="EU">EU (other)</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave} disabled={loading}>
            <Lock className="w-4 h-4 mr-2" />{loading ? 'Encrypting...' : `Save & Re-Seal (Score: ${computeCompletionScore(containerData)}%)`}
          </Button>
        </div>
      )}

      {/* ─── SHARDS ───────────────────────────────────────────── */}
      {view === 'shards' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shamir Key Shards</CardTitle>
              <CardDescription>{sealedContainer.threshold}-of-{sealedContainer.totalShards} required to reconstruct</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sealedContainer.shards.map((shard, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-700 rounded">
                  <Badge variant={shard.distributed ? 'default' : 'secondary'}>#{i + 1}</Badge>
                  <div className="flex-1">
                    {shard.distributed ? (
                      <div className="text-sm">
                        <span className="font-medium">{shard.holder}</span>
                        <span className="text-slate-500 ml-2">({shard.role.replace(/_/g, ' ')})</span>
                        {shard.distributedAt && <span className="text-slate-600 ml-2">{new Date(shard.distributedAt).toLocaleDateString()}</span>}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">Not assigned</span>
                    )}
                  </div>
                  {containerShards[i] && !shard.distributed && (
                    <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                      {containerShards[i].slice(0, 20)}...
                    </code>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          {containerShards.length > 0 && (
            <div className="p-3 rounded bg-amber-900/20 border border-amber-800 text-amber-400 text-sm">
              Shards are currently in memory. Distribute them to the designated holders and store them securely.
              Once distributed, clear them from memory.
            </div>
          )}
        </div>
      )}

      {/* ─── PROOF CHAIN ──────────────────────────────────────── */}
      {view === 'proof' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legacy Proof Chain</CardTitle>
              <CardDescription>
                {integrity?.entries} entries — {integrity?.chainValid ? 'Integrity verified' : `BROKEN at entry ${integrity?.brokenAt}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sealedContainer.proofChain.entries.map(entry => (
                  <div key={entry.index} className="flex items-start gap-3 p-2 border-b border-slate-800 text-sm">
                    <Badge variant="outline" className="shrink-0">#{entry.index}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{entry.action.replace(/_/g, ' ')}</div>
                      <div className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleString()}</div>
                      <code className="text-xs text-slate-600 block truncate">{entry.entryHash}</code>
                    </div>
                    <span className="text-slate-600 text-xs shrink-0">v{entry.containerVersion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => {
            if (!sealedContainer) return;
            const summary = getChainSummary(sealedContainer.proofChain);
            const blob = new Blob([summary], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `daio-proof-chain-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="w-4 h-4 mr-2" />Export Proof Chain
          </Button>
        </div>
      )}
    </div>
  );
};

export default InheritanceContainerTab;
