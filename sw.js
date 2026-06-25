// SiteClock service worker — network-first so the app always loads the latest when online.
const CACHE = "siteclock-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // never touch live data / map calls
  if (url.hostname.includes("supabase.co") ||
      url.hostname.includes("locationiq.com") ||
      url.hostname.includes("tile.openstreetmap.org")) {
    return;
  }

  // app document & navigations: NETWORK FIRST (always get the newest), fall back to cache offline
  const isDoc = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (isDoc) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html").then((h) => h || caches.match("./")))
    );
    return;
  }

  // icons & other static files: cache first, then network
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});
