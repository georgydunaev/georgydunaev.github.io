// Lightweight Service Worker for Portfolio Offline Support
const CACHE_NAME = 'georgy-portfolio-v2';
const ASSETS = [
  '/',
  '/index.html',
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
  '/js/topic_filter.js'
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
  e.respondWith(
    caches.match(e.request).then((resp) => resp || fetch(e.request))
  );
});
