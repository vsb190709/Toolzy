const CACHE = "toolzy-shell-v35";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./src/app.js?v=34", "./src/core/app.js", "./src/core/router.js",
  "./src/core/registry.js?v=34", "./src/core/config.js", "./src/core/storage.js",
  "./src/core/pwa.js", "./src/core/icons.js", "./src/styles/main.css?v=34"
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
        return response;
      }
      if (event.request.mode === "navigate") {
        return caches.match("./index.html");
      }
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
