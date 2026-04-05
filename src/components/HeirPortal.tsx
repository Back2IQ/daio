import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/store/walletStore';
import { Clock, Users } from 'lucide-react';

const HeirPortal: React.FC = () => {
  const transferGateSteps = useWalletStore(s => s.transferGateSteps);
  const deadManSwitch = useWalletStore(s => s.deadManSwitch);

  const isTriggered = deadManSwitch.status === 'triggered';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-bold">Heir Portal</h2>
          <p className="text-slate-500">Asset transfer status and recovery</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Status</CardTitle>
          <CardDescription>Current state of the Transfer Gate Protocol</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant={isTriggered ? 'destructive' : 'secondary'} className="mb-4">
            {isTriggered ? 'Transfer Gate Activated' : 'Waiting for Activation'}
          </Badge>

          {!isTriggered && (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <p className="text-sm">The Transfer Gate Protocol has not been activated. It will begin when the Dead Man's Switch is triggered or an emergency is declared.</p>
            </div>
          )}

          {isTriggered && (
            <div className="space-y-3">
              {transferGateSteps.map(step => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${step.status === 'done' ? 'bg-green-500' : step.status === 'active' ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    {step.step}
                  </div>
                  <span className={step.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}>{step.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeirPortal;
