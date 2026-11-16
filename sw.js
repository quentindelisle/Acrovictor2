// Acrovictor – service worker (hors ligne)
const CACHE = 'acrovictor-v1.7.0';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './lib/xlsx.full.min.js',
  './img/figure-a.png', './img/figure-b.png', './img/figure-c.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png', './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png', './icons/favicon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // réseau d'abord pour la page (mises à jour), cache d'abord pour le reste
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return res;
  })));
});
