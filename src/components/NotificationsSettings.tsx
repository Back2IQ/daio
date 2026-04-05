import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/lib/notifications';

const STORAGE_KEY = 'daio-notification-settings';

function loadSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

function saveSettings(s: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const NotificationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = (partial: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleEnable = async () => {
    setIsRegistering(true);
    try {
      const granted = await requestNotificationPermission();
      setPermission(Notification.permission);

      if (granted) {
        await registerServiceWorker();
        update({ enabled: true });
        toast.success('Notifications enabled');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to enable notifications');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDisable = () => {
    update({ enabled: false });
    toast.info('Notifications disabled');
  };

  const supported = isNotificationSupported();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          Notifications
        </CardTitle>
        <CardDescription>
          Configure push notifications for wallet events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!supported && (
          <Alert>
            <AlertDescription>
              Push notifications are not supported in this browser.
              Use a modern browser with HTTPS to enable notifications.
            </AlertDescription>
          </Alert>
        )}

        {supported && permission === 'denied' && (
          <Alert variant="destructive">
            <AlertDescription>
              Notification permission was denied. Please enable it in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable Notifications</Label>
            <p className="text-xs text-slate-500">Receive alerts for important wallet events</p>
          </div>
          {settings.enabled ? (
            <Button variant="outline" size="sm" onClick={handleDisable}>Disable</Button>
          ) : (
            <Button size="sm" onClick={handleEnable} disabled={!supported || isRegistering}>
              {isRegistering ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Enable
            </Button>
          )}
        </div>

        {/* Per-type toggles */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Dead Man's Switch Warnings</Label>
              <p className="text-xs text-slate-500">Get notified about DMS check-in deadlines</p>
            </div>
            <Switch
              checked={settings.dmsWarnings}
              onCheckedChange={(v) => update({ dmsWarnings: v })}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Transaction Confirmations</Label>
              <p className="text-xs text-slate-500">Alerts when transactions confirm or fail</p>
            </div>
            <Switch
              checked={settings.txConfirmations}
              onCheckedChange={(v) => update({ txConfirmations: v })}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Price Alerts</Label>
              <p className="text-xs text-slate-500">Notify on significant price movements</p>
            </div>
            <Switch
              checked={settings.priceAlerts}
              onCheckedChange={(v) => update({ priceAlerts: v })}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Security Alerts</Label>
              <p className="text-xs text-slate-500">Suspicious activity and security warnings</p>
            </div>
            <Switch
              checked={settings.securityAlerts}
              onCheckedChange={(v) => update({ securityAlerts: v })}
              disabled={!settings.enabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSettings;
