// version numbe 2

const CACHE_NAME = 'samsung-attendance-v2'; // Increased version to ensure update
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo192.png',
  './logo512.png'
];

// Install the service worker and cache the static assets
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the new service worker to activate immediately
self.addEventListener('install', event => {
  console.log('Installing new service worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // <–– זה מבטיח שהגרסה החדשה תיכנס מיד לשימוש
  );
});

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Serve cached content when offline, and update cache in the background
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // Strategy: Network first, then cache
    fetch(event.request)
      .then(networkResponse => {
        // If we got a valid response, update the cache
        if (networkResponse) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network fails, try to serve from cache
        console.log('Network failed, trying to serve from cache for:', event.request.url);
        return caches.match(event.request);
      })
  );
});


// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});