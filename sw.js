const CACHE_NAME = "kou-yemekhanem-v1";
const ASSETS = [
  "index.html",
  "style.css",
  "app.js",
  "manifest.json"
];

// Install Event - cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching files...");
      return cache.addAll(ASSETS);
    }).catch(err => console.error("Error caching assets during install: ", err))
  );
});

// Activate Event - clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event - network first, fallback to cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      // If valid network response, clone it to cache
      if (response && response.status === 200 && e.request.method === "GET") {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Offline fallback: try cache
      return caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If it's a page navigation request, return index.html
        if (e.request.mode === "navigate") {
          return caches.match("index.html");
        }
      });
    })
  );
});
