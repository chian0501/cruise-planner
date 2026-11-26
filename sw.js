// 離線快取：有網路時先抓新的（並存一份），2.5 秒沒回應或沒網路就用存起來的那份。
// 天氣、匯率 API 不在這裡處理，由網頁自己的快取負責。
const CACHE = 'cruise-planner-v1'; // 改了下面的檔案清單就把 v1 往上加
const CORE = [
  './', 'index.html', 'app.js', 'styles.css', 'illustrations.js', 'manifest.webmanifest',
  'data/trips.json', 'data/msc-2026-12.json', 'data/star-explorer-2026-09.json',
  'icons/favicon.svg', 'icons/apple-touch-icon.png', 'icons/icon-512.png'
];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.concat(CDN).map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !CDN.includes(url.href)) return; // 地圖圖磚、天氣、匯率、字型：照常走網路
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(req, { signal: ctrl.signal }); clearTimeout(t);
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: same });
      if (hit) return hit;
      if (req.mode === 'navigate') { const home = await cache.match('index.html'); if (home) return home; }
      throw err;
    }
  })());
});
