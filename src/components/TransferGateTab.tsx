import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletStore } from '@/store/walletStore';
import { Shield, CheckCircle, Lock, FileCheck, ArrowRightLeft, ClipboardCheck } from 'lucide-react';

const stepIcons = [Shield, Lock, FileCheck, ArrowRightLeft, ClipboardCheck];

const TransferGateTab: React.FC = () => {
  const transferGateSteps = useWalletStore(s => s.transferGateSteps);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Transfer Gate Protocol</h2>
        <p className="text-slate-500">5-step controlled asset transfer process</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protocol Steps</CardTitle>
          <CardDescription>Each step must be completed before the next can begin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-6">
              {transferGateSteps.map((step, i) => {
                const Icon = stepIcons[i] || CheckCircle;
                const statusColor = step.status === 'done' ? 'bg-green-500' : step.status === 'active' ? 'bg-blue-500' : 'bg-slate-300';
                const textColor = step.status === 'done' ? 'text-green-700' : step.status === 'active' ? 'text-blue-700' : 'text-slate-500';

                return (
                  <div key={step.step} className="relative flex items-start gap-4 pl-2">
                    <div className={`relative z-10 w-9 h-9 rounded-full ${statusColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${textColor}`}>Step {step.step}: {step.label}</h3>
                        <Badge variant={step.status === 'done' ? 'default' : step.status === 'active' ? 'secondary' : 'outline'}>
                          {step.status === 'done' ? 'Complete' : step.status === 'active' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50">
        <CardContent className="p-6 text-center text-slate-500">
          <p className="text-sm">The Transfer Gate Protocol activates automatically when the Dead Man's Switch is triggered and beneficiaries initiate the recovery process.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferGateTab;
