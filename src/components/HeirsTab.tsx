import React, { useState } from 'react';
import { Users, Shield, Key, UserPlus, Trash2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import type { Beneficiary } from '@/store/walletStore';

const roleBadge: Record<string, { color: string; icon: React.ElementType }> = {
  heir: { color: 'bg-blue-100 text-blue-700', icon: Users },
  guardian: { color: 'bg-purple-100 text-purple-700', icon: Shield },
  notary: { color: 'bg-amber-100 text-amber-700', icon: Scale },
};

function AddBeneficiaryForm({ onAdd }: { onAdd: (b: Omit<Beneficiary, 'id' | 'notified'>) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'heir' | 'guardian' | 'notary'>('heir');

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!email.trim()) { toast.error('Email is required'); return; }
    onAdd({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, role });
    setName(''); setEmail(''); setPhone(''); setRole('heir');
    toast.success('Beneficiary added');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ben-role">Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as 'heir' | 'guardian' | 'notary')}>
          <SelectTrigger id="ben-role"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="heir">Heir</SelectItem>
            <SelectItem value="guardian">Guardian</SelectItem>
            <SelectItem value="notary">Notary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="ben-name">Name</Label><Input id="ben-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="ben-email">Email</Label><Input id="ben-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="ben-phone">Phone (optional)</Label><Input id="ben-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <Button onClick={handleSubmit} className="w-full">Add Beneficiary</Button>
    </div>
  );
}

const BeneficiariesTab: React.FC = () => {
  const beneficiaries = useWalletStore(s => s.beneficiaries);
  const addBeneficiary = useWalletStore(s => s.addBeneficiary);
  const removeBeneficiary = useWalletStore(s => s.removeBeneficiary);
  const keyFragments = useWalletStore(s => s.keyFragments);
  const generateKeyFragments = useWalletStore(s => s.generateKeyFragments);

  const heirs = beneficiaries.filter(b => b.role === 'heir');
  const guardians = beneficiaries.filter(b => b.role === 'guardian');
  const notaries = beneficiaries.filter(b => b.role === 'notary');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold">{heirs.length}</p>
            <p className="text-sm text-slate-500">Heirs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto text-purple-600 mb-1" />
            <p className="text-2xl font-bold">{guardians.length}</p>
            <p className="text-sm text-slate-500">Guardians</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Scale className="w-6 h-6 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold">{notaries.length}</p>
            <p className="text-sm text-slate-500">Notaries</p>
          </CardContent>
        </Card>
      </div>

      {/* Beneficiary List */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>Manage heirs, guardians, and notaries for your digital estate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {beneficiaries.length === 0 && (
              <p className="text-center text-slate-400 py-6">No beneficiaries configured yet. Add your first beneficiary below.</p>
            )}
            {beneficiaries.map((b) => {
              const badge = roleBadge[b.role] || roleBadge.heir;
              const Icon = badge.icon;
              return (
                <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{b.name}</p>
                        <Badge variant="outline" className="text-xs capitalize">{b.role}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{b.email}{b.phone ? ` · ${b.phone}` : ''}</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Remove ${b.name}`}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Beneficiary</DialogTitle>
                        <DialogDescription>Are you sure you want to remove {b.name} ({b.role})? Their key fragment will be revoked.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <DialogClose asChild><Button variant="destructive" onClick={() => removeBeneficiary(b.id)}>Remove</Button></DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full"><UserPlus className="w-4 h-4 mr-2" />Add Beneficiary</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Beneficiary</DialogTitle><DialogDescription>Add an heir, guardian, or notary to your digital estate plan.</DialogDescription></DialogHeader>
                <AddBeneficiaryForm onAdd={addBeneficiary} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Key Fragments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Key Fragments (Shamir)</CardTitle>
              <CardDescription>Majority threshold for mnemonic reconstruction</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={generateKeyFragments}>
              <Key className="w-4 h-4 mr-2" />Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {keyFragments.length === 0 ? (
            <p className="text-center text-slate-400 py-4">No key fragments generated yet. Unlock your wallet and click Generate.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {keyFragments.map((fragment, i) => (
                <div key={fragment.id} className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><Key className="w-6 h-6 text-blue-600" /></div>
                  <p className="text-sm font-medium">Fragment {i + 1}</p>
                  <p className="text-xs text-slate-500">{fragment.holder}</p>
                  <Badge className="mt-2 text-xs capitalize" variant="outline">{fragment.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiariesTab;
