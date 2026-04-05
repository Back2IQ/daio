/**
 * Web Push Notifications service.
 * Manages service worker registration, push subscription,
 * and local notification dispatch for DMS warnings, tx confirmations, price alerts.
 */

// ─── Types ───────────────────────────────────────────────────────

export type NotificationType = 'dms_warning' | 'tx_confirmed' | 'tx_failed' | 'price_alert' | 'security' | 'general';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface NotificationSettings {
  enabled: boolean;
  dmsWarnings: boolean;
  txConfirmations: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
}

// ─── Default settings ────────────────────────────────────────────

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  dmsWarnings: true,
  txConfirmations: true,
  priceAlerts: false,
  securityAlerts: true,
};

// ─── Permission check ────────────────────────────────────────────

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// ─── Request permission ──────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// ─── Service Worker registration ─────────────────────────────────

let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return swRegistration;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

// ─── Push subscription ──────────────────────────────────────────

export async function subscribeToPush(
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  const reg = swRegistration || await registerServiceWorker();
  if (!reg) return null;

  try {
    const options: PushSubscriptionOptionsInit = {
      userVisibleOnly: true,
      ...(vapidPublicKey ? {
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      } : {}),
    };

    return await reg.pushManager.subscribe(options);
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const reg = swRegistration || await registerServiceWorker();
  if (!reg) return false;

  try {
    const sub = await reg.pushManager.getSubscription();
    if (sub) return await sub.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

// ─── Local notifications ─────────────────────────────────────────

export async function sendLocalNotification(
  payload: NotificationPayload,
  settings: NotificationSettings
): Promise<boolean> {
  if (!settings.enabled) return false;
  if (Notification.permission !== 'granted') return false;

  // Check per-type settings
  switch (payload.type) {
    case 'dms_warning':
      if (!settings.dmsWarnings) return false;
      break;
    case 'tx_confirmed':
    case 'tx_failed':
      if (!settings.txConfirmations) return false;
      break;
    case 'price_alert':
      if (!settings.priceAlerts) return false;
      break;
    case 'security':
      if (!settings.securityAlerts) return false;
      break;
  }

  try {
    const reg = swRegistration || await registerServiceWorker();
    if (reg) {
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        tag: payload.tag || payload.type,
        data: payload.data,
      });
    } else {
      // Fallback to basic Notification API
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        tag: payload.tag || payload.type,
      });
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Pre-built notification payloads ─────────────────────────────

export function dmsWarningNotification(stage: number, daysLeft: number): NotificationPayload {
  return {
    type: 'dms_warning',
    title: `Dead Man's Switch — Stage ${stage} Warning`,
    body: `${daysLeft} days until next escalation. Please check in to reset the timer.`,
    tag: `dms-stage-${stage}`,
  };
}

export function txConfirmedNotification(hash: string, amount: string, symbol: string): NotificationPayload {
  return {
    type: 'tx_confirmed',
    title: 'Transaction Confirmed',
    body: `${amount} ${symbol} sent successfully.`,
    tag: `tx-${hash.slice(0, 10)}`,
    data: { hash },
  };
}

export function txFailedNotification(hash: string, reason: string): NotificationPayload {
  return {
    type: 'tx_failed',
    title: 'Transaction Failed',
    body: reason,
    tag: `tx-fail-${hash.slice(0, 10)}`,
    data: { hash },
  };
}

export function priceAlertNotification(symbol: string, price: number, direction: 'above' | 'below'): NotificationPayload {
  return {
    type: 'price_alert',
    title: `Price Alert: ${symbol}`,
    body: `${symbol} is now ${direction} $${price.toFixed(2)}`,
    tag: `price-${symbol}`,
  };
}

export function securityAlertNotification(message: string): NotificationPayload {
  return {
    type: 'security',
    title: 'Security Alert',
    body: message,
    tag: 'security',
  };
}

// ─── Utils ───────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch {
    throw new Error('Invalid VAPID key format');
  }
}
