import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Lock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';

const EmergencyTab: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const lockWallet = useWalletStore(s => s.lockWallet);
  const generateKeyFragments = useWalletStore(s => s.generateKeyFragments);
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);
  const setEmergencyProtocol = useWalletStore(s => s.setEmergencyProtocol);
  const unlockWallet = useWalletStore(s => s.unlockWallet);
  const isLocked = useWalletStore(s => s.isLocked);

  const triggerPanic = async () => {
    if (confirmText !== 'EMERGENCY') return;

    // Require password verification before emergency activation
    setIsProcessing(true);
    try {
      // If wallet is locked, verify password first
      if (isLocked) {
        const valid = await unlockWallet(password);
        if (!valid) {
          toast.error('Incorrect password — emergency requires authentication');
          setIsProcessing(false);
          return;
        }
      }

      generateKeyFragments();
      lockWallet();
      setEmergencyProtocol({
        enabled: true,
        lastTriggered: Date.now(),
        reason,
      });
      addAuditEntry({
        action: 'PANIC BUTTON',
        details: `Emergency sequence activated. Reason: ${reason || 'Not specified'}. Keys revoked, wallet locked.`,
        type: 'critical',
      });
      toast.error('EMERGENCY ACTIVATED! Wallet locked, keys regenerated.', { duration: 5000 });
      setConfirmText('');
      setReason('');
      setPassword('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-200">
        <AlertOctagon className="w-4 h-4 text-red-600" />
        <AlertTitle className="text-red-900">Emergency Protocols</AlertTitle>
        <AlertDescription className="text-red-700">These features are intended for emergency scenarios.</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center text-red-700"><AlertOctagon className="w-5 h-5 mr-2" />Panic Button</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">Immediate key revocation in case of theft or acute threat.</p>
            <Dialog>
              <DialogTrigger asChild><Button variant="destructive" className="w-full"><AlertTriangle className="w-4 h-4 mr-2" />ACTIVATE EMERGENCY</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Confirm Emergency</DialogTitle>
                  <DialogDescription>This will generate new key fragments, lock the wallet, and alert all beneficiaries.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Reason for emergency</Label>
                    <Input placeholder="Describe the situation..." value={reason} onChange={e => setReason(e.target.value)} />
                  </div>
                  {isLocked && (
                    <div className="space-y-2">
                      <Label>Wallet password (required)</Label>
                      <Input type="password" placeholder="Enter your wallet password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Type EMERGENCY to confirm</Label>
                    <Input placeholder="EMERGENCY" value={confirmText} onChange={e => setConfirmText(e.target.value)} className="font-mono" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button variant="destructive" onClick={triggerPanic} disabled={confirmText !== 'EMERGENCY' || isProcessing || (isLocked && !password)}>
                    {isProcessing ? 'Processing...' : 'Yes, Activate Emergency'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center text-orange-700"><Lock className="w-5 h-5 mr-2" />Duress PIN</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-4">Decoy PIN that appears to unlock but secretly triggers an alarm.</p>
            <Button variant="outline" className="w-full border-orange-300 text-orange-600" onClick={() => toast.info('Feature in development')}>
              <Settings className="w-4 h-4 mr-2" />Configure Duress PIN
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyTab;
