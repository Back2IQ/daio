import React from 'react';
import { Timer, Activity, AlertTriangle, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletStore } from '@/store/walletStore';
import { formatDate } from '@/lib/format';

const stages = [
  { key: 'warning_1', label: 'Warning 1', color: 'bg-amber-500', borderColor: 'border-l-amber-400', desc: 'First notification sent to owner' },
  { key: 'warning_2', label: 'Warning 2', color: 'bg-orange-500', borderColor: 'border-l-orange-400', desc: '+14 days: Escalation to secondary contacts' },
  { key: 'warning_3', label: 'Warning 3', color: 'bg-red-500', borderColor: 'border-l-red-500', desc: '+7 days: Final notice before trigger' },
  { key: 'triggered', label: 'Triggered', color: 'bg-red-700', borderColor: 'border-l-red-700', desc: '+72 hours: Key fragments distributed to heirs' },
] as const;

const DMSTab: React.FC = () => {
  const dmsConfig = useWalletStore(s => s.dmsConfig);
  const updateDMSConfig = useWalletStore(s => s.updateDMSConfig);
  const deadManSwitch = useWalletStore(s => s.deadManSwitch);
  const checkIn = useWalletStore(s => s.checkIn);
  const getTimeUntilTrigger = useWalletStore(s => s.getTimeUntilTrigger);
  const getDmsStatusColor = useWalletStore(s => s.getDmsStatusColor);

  const timeLeft = getTimeUntilTrigger();
  const statusColor = getDmsStatusColor();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Timer className="w-5 h-5 mr-2" />Dead Man's Switch</CardTitle>
          <CardDescription>4-stage escalation on inactivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Banner */}
          <Alert className={deadManSwitch.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}>
            <Activity className={`w-4 h-4 ${deadManSwitch.enabled ? 'text-green-600' : 'text-gray-600'}`} />
            <AlertTitle className="flex items-center gap-2">
              Status: <span className={statusColor}>{deadManSwitch.status.replace('_', ' ').toUpperCase()}</span>
              {deadManSwitch.enabled && <Badge variant="outline">{timeLeft}</Badge>}
            </AlertTitle>
            <AlertDescription>
              Last check-in: {formatDate(deadManSwitch.lastCheckIn)} | Legacy DMS: {dmsConfig.enabled ? 'On' : 'Off'} (Last login: {formatDate(dmsConfig.lastLogin)})
            </AlertDescription>
          </Alert>

          {/* Proof of Life Button */}
          {deadManSwitch.enabled && (
            <Button className="w-full" variant="outline" onClick={checkIn}>
              <HeartPulse className="w-4 h-4 mr-2" />
              Proof of Life Check-In
            </Button>
          )}

          {/* 4-Stage Escalation Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-600">Escalation Timeline</h3>
            {stages.map((stage, i) => {
              const isActive = deadManSwitch.status === stage.key;
              const isPast = stages.findIndex(s => s.key === deadManSwitch.status) > i;
              return (
                <Card key={stage.key} className={`border-l-4 ${stage.borderColor} ${isActive ? 'ring-2 ring-offset-1 ring-blue-300' : ''}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full ${isPast || isActive ? stage.color : 'bg-slate-200'} flex items-center justify-center text-white text-xs font-bold`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{stage.label}</p>
                      <p className="text-xs text-slate-400">{stage.desc}</p>
                    </div>
                    {isActive && <Badge variant="destructive">Current</Badge>}
                    {isPast && <Badge variant="outline" className="text-green-600 border-green-600">Passed</Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legacy DMS Config */}
          <Card className="bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Legacy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-slate-500" id="stage1-label">Stage 1</Label>
                  <Select value={dmsConfig.stage1Days.toString()} onValueChange={(v) => updateDMSConfig({ stage1Days: parseInt(v) })}>
                    <SelectTrigger aria-labelledby="stage1-label"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="30">30d</SelectItem><SelectItem value="60">60d</SelectItem><SelectItem value="90">90d</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-slate-500" id="stage2-label">Stage 2</Label>
                  <Select value={dmsConfig.stage2Days.toString()} onValueChange={(v) => updateDMSConfig({ stage2Days: parseInt(v) })}>
                    <SelectTrigger aria-labelledby="stage2-label"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="120">120d</SelectItem><SelectItem value="150">150d</SelectItem><SelectItem value="180">180d</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-slate-500" id="stage3-label">Stage 3</Label>
                  <Select value={dmsConfig.stage3Days.toString()} onValueChange={(v) => updateDMSConfig({ stage3Days: parseInt(v) })}>
                    <SelectTrigger aria-labelledby="stage3-label"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="270">270d</SelectItem><SelectItem value="300">300d</SelectItem><SelectItem value="365">365d</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700"><strong>Proof-of-Life Check:</strong> 14-day grace period before final activation</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2">
            <Switch id="dms-enabled" checked={dmsConfig.enabled} onCheckedChange={(checked) => updateDMSConfig({ enabled: checked })} />
            <Label htmlFor="dms-enabled">Enable Dead Man's Switch</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DMSTab;
