const CACHE_NAME = 'eje-austral-v2';

// App-shell: lo estático que casi no cambia. Los datos de contactos
// (vía /api/data) NUNCA se cachean, siempre van a red.
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/logo-grupo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.warn('SW: no se pudo precachear el app-shell', err))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Las llamadas a la API (datos, login, agregar contacto) siempre van
  // directo a la red. Nunca se sirven ni se guardan en caché.
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Solo nos interesa cachear GET del mismo origen (el app-shell).
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Stale-while-revalidate: responde al toque con lo que hay en caché
  // (o espera la red si es la primera vez), y de paso actualiza el
  // caché en segundo plano para que la próxima carga ya venga fresca.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
