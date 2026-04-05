import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/store/walletStore';

const DAIOScoreWidget: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const getDaiScore = useWalletStore(s => s.getDaiScore);
  const inheritanceContainer = useWalletStore(s => s.inheritanceContainer);
  const deadManSwitch = useWalletStore(s => s.deadManSwitch);
  const keyFragments = useWalletStore(s => s.keyFragments);
  const beneficiaries = useWalletStore(s => s.beneficiaries);
  const emergencyProtocol = useWalletStore(s => s.emergencyProtocol);

  const score = getDaiScore();

  const color = score >= 70 ? 'text-green-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 70 ? 'stroke-green-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-red-500';

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Score breakdown
  const breakdown = [
    { label: 'Inheritance Container', max: 30, current: inheritanceContainer ? (inheritanceContainer.level * 10) : 0 },
    { label: 'Dead Man\'s Switch', max: 20, current: deadManSwitch.enabled ? (deadManSwitch.status === 'active' ? 20 : deadManSwitch.status === 'warning_1' ? 15 : deadManSwitch.status === 'warning_2' ? 10 : deadManSwitch.status === 'warning_3' ? 5 : 0) : 0 },
    { label: 'Key Fragments (Shamir)', max: 20, current: keyFragments.length > 0 ? 20 : 0 },
    { label: 'Beneficiaries', max: 15, current: (beneficiaries.length > 0 ? 5 : 0) + (beneficiaries.length >= 2 ? 5 : 0) + (beneficiaries.some(b => b.role === 'notary') ? 5 : 0) },
    { label: 'Emergency Protocol', max: 10, current: emergencyProtocol.enabled ? 10 : 0 },
    { label: 'Biometric (Future)', max: 5, current: 0 },
  ];

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">DAIO Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius} fill="none"
                className={strokeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${color}`}>{score}</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {score >= 70 ? 'Good protection level' : score >= 40 ? 'Moderate — improve your setup' : 'Low — configure your DAIO Shield'}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {breakdown.map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className={item.current === item.max ? 'text-green-600 font-medium' : 'text-slate-400'}>
                  {item.current}/{item.max}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DAIOScoreWidget;
