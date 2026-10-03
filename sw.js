const CACHE = "toolzy-shell-v22";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./src/app.js", "./src/core/app.js", "./src/core/router.js",
  "./src/core/registry.js", "./src/core/config.js", "./src/core/storage.js",
  "./src/core/pwa.js", "./src/core/icons.js", "./src/styles/main.css?v=22"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
