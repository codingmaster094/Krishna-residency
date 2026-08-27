self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open("kr-v1").then((cache) => cache.addAll(["/", "/login", "/icon.svg"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
  );
});
