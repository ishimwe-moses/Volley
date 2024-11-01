</script>
const cacheName = 'site-dynamic-cache-v1';

// Install the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Opened cache');
      return cache.add('/');
    })
  );
  self.skipWaiting(); // Activate the new service worker immediately
});

// Fetch files from cache or network, and cache them dynamically
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve the cache first
      if (response) {
        return response;
      }

      // If not cached, fetch from network and cache the result
      return fetch(event.request).then((fetchResponse) => {
        return caches.open(cacheName).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Activate the new service worker and remove old caches
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
