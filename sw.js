const CACHE_NAME = 'eje-austral-v6'; // Subimos a v6: Modo Faena Offline (Sync de recomendaciones y caché de fichas)

const APP_SHELL = [
  '/',
  '/index.html',
  '/ficha.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/logo-grupo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // 1. NUNCA interceptar llamadas a la API
  if (e.request.url.includes('/api/')) {
    return; 
  }

  // 2. Para el HTML (navegación, index, ficha o cualquier URL que pida documento), SIEMPRE buscar en la red primero
  const esHTML = e.request.mode === 'navigate' ||
                 e.request.destination === 'document' ||
                 (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) ||
                 e.request.url.includes('index.html') ||
                 e.request.url.includes('ficha.html') ||
                 e.request.url.includes('?admin') ||
                 e.request.url.endsWith('/');

  if (esHTML) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Para los demás archivos estáticos (imágenes, fuentes), usar la caché primero
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});
