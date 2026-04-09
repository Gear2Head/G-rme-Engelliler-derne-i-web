/**
 * KGED Service Worker v2
 * Strateji: Network-first HTML, Cache-first images, Stale-while-revalidate assets
 * Bypass: Vercel analytics, Supabase API, Google APIs
 */
const CACHE_NAME = 'kged-v2';
const IMAGE_CACHE = 'kged-images-v1';

const PRECACHE_URLS = ['/', '/hakkimizda', '/galeri', '/iletisim', '/tuzuk'];

// URL patterns to bypass — never intercept these
const BYPASS_PATTERNS = [
  /\/_vercel\//,
  /vercel-insights/,
  /va\.vercel-scripts/,
  /supabase\.co/,
  /googleapis\.com/,
  /gstatic\.com/,
];

function shouldBypass(url) {
  return BYPASS_PATTERNS.some(pattern => pattern.test(url));
}

// Install: precache static pages
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW] Precache hatası (kritik değil):', err))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== IMAGE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // 1. Bypass list — let network handle directly
  if (shouldBypass(url)) return;

  // 2. Non-GET requests — never cache
  if (e.request.method !== 'GET') return;

  // 3. Non-http protocols — skip
  if (!url.startsWith('http')) return;

  // 4. Supabase storage images — cache-first
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const response = await fetch(e.request);
          if (response.ok && response.status === 200) {
            cache.put(e.request, response.clone());
          }
          return response;
        } catch (err) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // 5. Navigation (HTML pages) — network-first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(e.request)
            .then(cached => cached || caches.match('/'))
            .then(r => r || new Response('<h1>Çevrimdışı</h1>', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }))
        )
    );
    return;
  }

  // 6. Static assets (CSS, JS, fonts) — stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request)
        .then(response => {
          if (response.ok && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(e.request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => null);

      return cached || networkFetch.then(r => r || new Response('', { status: 503 }));
    })
  );
});
