// Mejorar el service worker para asegurar que la aplicación funcione sin conexión
const CACHE_NAME = "work-schedule-cache-v3" // Incrementar versión para forzar actualización
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/globals.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Añadir más recursos estáticos
  "/_next/static/chunks/main.js",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/pages/_app.js",
  "/_next/static/chunks/pages/index.js",
]

// Install a service worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  // Forzar activación inmediata sin esperar a que se cierren las pestañas
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Cache and return requests
self.addEventListener("fetch", (event) => {
  // No interceptar solicitudes a la API o recursos dinámicos
  if (event.request.url.includes("/api/")) {
    return
  }

  console.log("Service Worker: Fetching", event.request.url)

  // Estrategia: Cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        console.log("Service Worker: Returning from cache", event.request.url)
        return response
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            console.log("Service Worker: Not caching invalid response for", event.request.url)
            return response
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Caching new resource", event.request.url)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.log("Service Worker: Fetch failed, returning offline page", error)

          // Si es una solicitud de página, devolver la página principal
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }

          // Para otros recursos, intentar devolver un recurso similar del caché
          return caches.match(new URL(event.request.url).pathname)
        })
    }),
  )
})

// Update a service worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  // Tomar control inmediatamente de todas las páginas
  self.clients.claim()

  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Service Worker: Deleting old cache", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Escuchar mensajes desde la aplicación
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

