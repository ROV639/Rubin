const CACHE_NAME = 'rubin-gallery-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/admin/',
  '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network first, never serve stale
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Network-first for everything, no caching
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) return response;

        // Optionally cache images
        if (url.includes('imgbb.com') || url.includes('rubin-81m.pages.dev') || url.startsWith('/images')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }

        return response;
      })
      .catch(() => {
        // Fallback to cache only if network fails
        return caches.match(event.request);
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
