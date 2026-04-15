const CACHE_NAME = 'gemini-driver-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: always try network first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline — data will sync when connected' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        });
      })
    );
    return;
  }

  // Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('', { status: 408 });
      });
    })
  );
});

// Background sync: queue status updates when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-status-updates') {
    event.waitUntil(syncPendingUpdates());
  }
});

async function syncPendingUpdates() {
  // Retrieve pending updates from IndexedDB and POST them
  // This runs when the device comes back online
  console.log('[SW] Syncing pending updates...');
}

// Push notifications (for dispatch messages)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Gemini Express', {
      body: data.body || 'New message from dispatch',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'dispatch-message',
      data: data.url || '/',
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].navigate(event.notification.data);
      } else {
        self.clients.openWindow(event.notification.data);
      }
    })
  );
});
