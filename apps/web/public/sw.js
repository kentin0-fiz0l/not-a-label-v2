// Service Worker for Not a Label PWA
const CACHE_NAME = 'not-a-label-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API calls or dynamic content
          if (!event.request.url.includes('/api/')) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      }).catch(() => {
        // Offline - return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      });
    })
  );
});

// Background sync for offline uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-track') {
    event.waitUntil(uploadPendingTracks());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Not a Label',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('Not a Label', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://not-a-label.art/dashboard')
  );
});

// Helper function for background sync
async function uploadPendingTracks() {
  // Implementation for uploading tracks when back online
  const db = await openDB();
  const tx = db.transaction('pending-uploads', 'readonly');
  const uploads = await tx.objectStore('pending-uploads').getAll();
  
  for (const upload of uploads) {
    try {
      await fetch('/api/tracks/upload', {
        method: 'POST',
        body: upload.data,
      });
      // Remove from pending after successful upload
      await removePendingUpload(upload.id);
    } catch (error) {
      console.error('Failed to sync upload:', error);
    }
  }
}