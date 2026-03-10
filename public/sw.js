/// <reference lib="webworker" />

const CACHE_NAME = 'soummamcar-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install — cache shell
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  (self as any).skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  (self as any).clients.claim();
});

// Fetch — Network first, fall back to cache
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  // Skip non-GET and API calls
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
