const CACHE_NAME = "dr-crispy-lab-v4";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/drcrispy-icon.png",
  "/drcrispy-icon-192.png",
  "/drcrispy-icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        )
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Solo manejar recursos del mismo origen
  if (url.origin !== self.location.origin) return;

  // Siempre intentar red primero para navegación
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/", responseClone);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedHome = await caches.match("/");
          if (cachedHome) return cachedHome;
          return new Response("Sin conexión", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // No cachear archivos dinámicos sensibles de Vite en runtime
  const pathname = url.pathname;
  const isViteAsset =
    pathname.includes("/assets/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css");

  if (isViteAsset) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match(request))
    );
    return;
  }

  // Para imágenes/iconos/manifest y otros estáticos: cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return networkResponse;
      });
    })
  );
});
