const CACHE_NAME = "scoretracker-v2";
const urlsToCache = [
    "/",
    "/index.html",
    "/assets/css/main.css",
    "/assets/js/main.js",
    "/assets/fonts/Roboto-Light.woff2",
    "/assets/fonts/Roboto-Regular.woff2",
    "/assets/fonts/Roboto-Bold.woff2",
    "/assets/icons/hexagon-dice.svg",
    "/assets/icons/user-plus.svg",
    "/assets/icons/restart.svg",
    "/assets/icons/user-xmark.svg",
    "/assets/icons/minus.svg",
    "/assets/icons/plus.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE_NAME)
                        .map((k) => caches.delete(k)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => response || fetch(event.request))
            .catch(() => caches.match("/index.html")),
    );
});
