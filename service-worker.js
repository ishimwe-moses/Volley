const cacheName = 'site-dynamic-cache-v1';
const offlineFallbackPage = '/offline.html';

// Install the service worker and cache necessary files, including the offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(['/', offlineFallbackPage]); // Cache root and offline fallback
    })
  );
  self.skipWaiting(); // Activate new service worker immediately
});

// Fetch files from cache or network, with offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache if available
      if (response) {
        return response;
      }

      // If not in cache, attempt to fetch from the network
      return fetch(event.request)
        .then((fetchResponse) => {
          // Ensure fetchResponse is valid before caching
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Cache the fetched response dynamically
          const responseClone = fetchResponse.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return fetchResponse;
        })
        .catch(() => {
          // If the network request fails, show the offline fallback page
          return caches.match(offlineFallbackPage);
        });
    })
  );
});

// Activate the service worker and delete old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
