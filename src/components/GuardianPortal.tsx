import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Key, Clock, Ban } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import {
  createRecoveryRequest,
  submitFragment,
  startVetoPeriod,
  vetoRecovery,
  getVetoTimeRemaining,
  formatTimeRemaining,
  getRecoveryStatusColor,
  getRecoveryStatusLabel,
  type RecoveryRequest,
  type RecoveryConfig,
  DEFAULT_RECOVERY_CONFIG,
} from '@/lib/socialRecovery';

const GuardianPortal: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [recoveryReason, setRecoveryReason] = useState('');
  const [fragmentInput, setFragmentInput] = useState('');
  const emergencyProtocol = useWalletStore(s => s.emergencyProtocol);
  const setEmergencyProtocol = useWalletStore(s => s.setEmergencyProtocol);
  const addAuditEntry = useWalletStore(s => s.addAuditEntry);
  const beneficiaries = useWalletStore(s => s.beneficiaries);
  const userRole = useWalletStore(s => s.userRole);

  // Social Recovery state (would be persisted in store in production)
  const [recoveryConfig, setRecoveryConfig] = useState<RecoveryConfig>({
    ...DEFAULT_RECOVERY_CONFIG,
    enabled: true,
    requiredGuardians: 2,
  });
  const [activeRecovery, setActiveRecovery] = useState<RecoveryRequest | null>(null);

  const guardians = beneficiaries.filter(b => b.role === 'guardian');

  const handleTriggerEmergency = () => {
    if (confirmText !== 'EMERGENCY') return;
    setEmergencyProtocol({
      enabled: true,
      lastTriggered: Date.now(),
      reason,
    });
    addAuditEntry({
      action: 'EMERGENCY_TRIGGERED',
      details: `Emergency triggered by guardian. Reason: ${reason}`,
      type: 'critical',
    });
    setConfirmText('');
    setReason('');
  };

  // ─── Social Recovery actions ────────────────────────────────────

  const handleInitiateRecovery = () => {
    if (!recoveryReason.trim()) return;
    try {
      const { request, updatedConfig } = createRecoveryRequest(
        'guardian-self',
        'Current Guardian',
        recoveryReason,
        recoveryConfig
      );
      setRecoveryConfig(updatedConfig);
      setActiveRecovery(request);
      addAuditEntry({
        action: 'Recovery Initiated',
        details: `Guardian initiated recovery: ${recoveryReason}`,
        type: 'critical',
      });
      setRecoveryReason('');
    } catch (err) {
      // handled
    }
  };

  const handleSubmitFragment = () => {
    if (!activeRecovery || !fragmentInput.trim()) return;
    try {
      const updated = submitFragment(activeRecovery, `guardian-${Date.now()}`, fragmentInput.trim());
      setActiveRecovery(updated);
      addAuditEntry({
        action: 'Recovery Fragment Submitted',
        details: `Fragment ${updated.fragmentsCollected.length}/${updated.fragmentsRequired} collected`,
        type: 'info',
      });
      setFragmentInput('');

      // Auto-advance to veto period if enough fragments
      if (updated.status === 'fragments_collected') {
        const withVeto = startVetoPeriod(updated);
        setActiveRecovery(withVeto);
        addAuditEntry({
          action: 'Veto Period Started',
          details: `Owner has ${recoveryConfig.vetoPeriodHours}h to veto recovery`,
          type: 'warning',
        });
      }
    } catch (err) {
      // handled
    }
  };

  const handleVeto = () => {
    if (!activeRecovery) return;
    try {
      const vetoed = vetoRecovery(activeRecovery);
      setActiveRecovery(vetoed);
      addAuditEntry({
        action: 'Recovery Vetoed',
        details: 'Owner vetoed recovery request',
        type: 'success',
      });
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Guardian Portal</h2>
          <p className="text-slate-500">Emergency management, oversight, and social recovery</p>
        </div>
      </div>

      {/* Guardian Status */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Status</CardTitle>
          <CardDescription>Your authorization and assigned guardians</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={emergencyProtocol.enabled ? 'destructive' : 'default'}>
              {emergencyProtocol.enabled ? 'Emergency Active' : 'Standing By'}
            </Badge>
            {emergencyProtocol.lastTriggered && (
              <span className="text-sm text-slate-500">
                Last triggered: {new Date(emergencyProtocol.lastTriggered).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Registered guardians: <span className="font-medium">{guardians.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Social Recovery */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Social Recovery
          </CardTitle>
          <CardDescription>
            Initiate wallet recovery using Shamir key fragments from guardians
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeRecovery ? (
            <>
              <Alert>
                <AlertDescription className="text-sm">
                  Recovery requires {recoveryConfig.requiredGuardians} guardian approvals with key fragments.
                  The owner has a {recoveryConfig.vetoPeriodHours}-hour veto period after fragments are collected.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Reason for Recovery</Label>
                <Input
                  placeholder="Describe why recovery is needed..."
                  value={recoveryReason}
                  onChange={(e) => setRecoveryReason(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={!recoveryReason.trim() || !recoveryConfig.enabled}
                onClick={handleInitiateRecovery}
              >
                Initiate Recovery
              </Button>
            </>
          ) : (
            <>
              {/* Active recovery status */}
              <div className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recovery Status</span>
                  <Badge className={getRecoveryStatusColor(activeRecovery.status)}>
                    {getRecoveryStatusLabel(activeRecovery.status)}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  Initiated: {new Date(activeRecovery.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Reason: {activeRecovery.reason}
                </div>
                <div className="text-sm">
                  Fragments: {activeRecovery.fragmentsCollected.length}/{activeRecovery.fragmentsRequired}
                </div>
              </div>

              {/* Fragment submission */}
              {(activeRecovery.status === 'initiated' || activeRecovery.status === 'pending_fragments') && (
                <div className="space-y-2">
                  <Label>Submit Key Fragment</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste Shamir share hex..."
                      value={fragmentInput}
                      onChange={(e) => setFragmentInput(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <Button onClick={handleSubmitFragment} disabled={!fragmentInput.trim()}>
                      Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Veto period display */}
              {activeRecovery.status === 'veto_period' && (
                <div className="space-y-3">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      Veto period active. Time remaining:{' '}
                      <span className="font-medium">
                        {formatTimeRemaining(getVetoTimeRemaining(activeRecovery))}
                      </span>
                    </AlertDescription>
                  </Alert>
                  {userRole === 'owner' && (
                    <Button variant="destructive" className="w-full" onClick={handleVeto}>
                      <Ban className="w-4 h-4 mr-2" />Veto Recovery
                    </Button>
                  )}
                </div>
              )}

              {/* Completed/vetoed */}
              {(activeRecovery.status === 'completed' || activeRecovery.status === 'vetoed') && (
                <Button variant="outline" className="w-full" onClick={() => setActiveRecovery(null)}>
                  Clear Recovery
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Emergency trigger */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Trigger Emergency Protocol
          </CardTitle>
          <CardDescription>This will initiate the emergency recovery process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Triggering an emergency will alert all beneficiaries and begin the Transfer Gate Protocol. This action is logged and cannot be undone.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label>Reason for Emergency</Label>
            <Input placeholder="Describe the emergency situation..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type EMERGENCY to confirm</Label>
            <Input placeholder="EMERGENCY" value={confirmText} onChange={e => setConfirmText(e.target.value)} className="font-mono" />
          </div>
          <Button variant="destructive" className="w-full" disabled={confirmText !== 'EMERGENCY' || !reason} onClick={handleTriggerEmergency}>
            Trigger Emergency Protocol
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianPortal;
