const CACHE_NAME = 'eje-austral-v3'; // Subimos a v3 para forzar la actualización

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/logo-grupo.png'
  // Quitamos '/index.html' de aquí
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (e) => {
  // Borra los cachés viejos cuando se active la nueva versión
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // 1. NUNCA interceptar llamadas a la API
  if (e.request.url.includes('/api/')) {
    return; 
  }

  // 2. Para el HTML (la página en sí), siempre buscar en la red primero.
  // Si no hay internet, recién ahí usa la caché.
  if (e.request.mode === 'navigate' || e.request.url.endsWith('/') || e.request.url.includes('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Guardamos una copia actualizada en caché por si se corta el internet después
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Para los demás archivos (imágenes, fuentes), usa la caché primero
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
