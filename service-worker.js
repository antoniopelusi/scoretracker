const CACHE_NAME = "scoretracker";
const urlsToCache = [
    "/",
    "/index.html",
    "/assets/css/main.css",
    "/assets/js/main.js",
    "/assets/fonts/Roboto-Light.woff2",
    "/assets/fonts/Roboto-Regular.woff2",
    "/assets/fonts/Roboto-Bold.woff2",
    "/assets/icons/hexagon-dice.svg",
    "/assets/icons/leaderboard.svg",
    "/assets/icons/math-book.svg",
    "/assets/icons/minus.svg",
    "/assets/icons/plus.svg",
    "/assets/icons/question-mark.svg",
    "/assets/icons/restart.svg",
    "/assets/icons/trash.svg",
    "/assets/icons/user-plus.svg",
    "/assets/icons/user-xmark.svg",
    "/assets/icons/warning-triangle.svg",
    "/assets/icons/xmark.svg",
    "/assets/icons/favicon/apple-touch-icon.png",
    "/assets/icons/favicon/favicon.ico",
    "/assets/icons/favicon/favicon.svg",
    "/assets/icons/favicon/favicon-96x96.svg",
    "/assets/icons/favicon/site.webmanifest",
    "/assets/icons/favicon/web-app-manifest-192x192.png",
    "/assets/icons/favicon/web-app-manifest-512x512.png",
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
