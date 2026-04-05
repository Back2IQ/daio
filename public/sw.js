/**
 * DAIO Wallet Service Worker
 * Handles push notifications for DMS warnings, tx confirmations, and price alerts.
 */

/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'daio-wallet-v1';

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Push notification received
self.addEventListener('push', (event) => {
  let data = { title: 'DAIO Wallet', body: 'New notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: data.tag || 'daio-notification',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    requireInteraction: data.type === 'dms_warning' || data.type === 'security',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window or open new one
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/');
    })
  );
});
