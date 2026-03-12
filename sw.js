const CACHE_NAME = 'smart-translate-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './transcription.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
];

// Install: cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, stale-while-revalidate for static
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls — always network
  if (url.hostname.includes('lingva') ||
      url.hostname.includes('plausibility') ||
      url.hostname === 'api.mymemory.translated.net' ||
      url.hostname === 'api.dictionaryapi.dev') {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Нет интернета' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Static assets — stale-while-revalidate (serve cache, update in background)
  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        const fetched = fetch(e.request).then(response => {
          cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
