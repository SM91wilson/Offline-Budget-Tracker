var CACHE = "site-cache-1";
const DATA_CACHE = "data-cache-1";

// files to cache
var cacheFiles = 
[
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/styles.css",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// install sevice worker
self.addEventListener("install", event => {
    event.waitUntil(
      caches.open(CACHE)
        .then(cache => cache.addAll(cacheFiles))
        .then(self.skipWaiting())
    );
  });

// activate service worker
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE && key !== DATA_CACHE) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
})

// fetch files from cache
self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    caches.open(CACHE)
      .then(cache => {
        return cache.match(event.request)
          .then(response => {
            return "/" || fetch(event.request);
          });
      })
  );
});