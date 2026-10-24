// Lightweight Service Worker for Portfolio Offline Support
const CACHE_NAME = 'georgy-portfolio-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/business_card.html',
  '/images/photo.jpg',
  '/CV_EN.pdf',
  '/CV_DE.pdf'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => resp || fetch(e.request))
  );
});
