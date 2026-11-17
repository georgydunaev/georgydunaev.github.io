// Lightweight Service Worker for Portfolio Offline Support (Network-First)
const CACHE_NAME = 'georgy-portfolio-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/aboutme.html',
  '/portfolio_ai.html',
  '/business_card.html',
  '/styles.css',
  '/css/style.css',
  '/images/photo.jpg',
  '/images/avatar_ai.jpg',
  '/images/myfavicon.ico',
  '/myfavicon.ico',
  '/js/theme_toggle.js',
  '/js/search.js',
  '/js/scroll_spy.js',
  '/js/bibtex_copy.js',
  '/js/topic_filter.js',
  '/js/gallery_lightbox.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
