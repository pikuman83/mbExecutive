// Offline support: app files are served from cache and refreshed in the background;
// the card-reader model and runtime are cached on first use.
const VERSION = "ofc-v1";
const SHELL = ["./", "index.html", "style.css", "app.js", "scan.js", "vendor/ort.wasm.min.js", "manifest.webmanifest", "icons/icon-192.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  if(e.request.method!=="GET" || url.origin!==location.origin) return;
  const heavy = url.pathname.includes("/model/") || url.pathname.endsWith(".wasm") || url.pathname.endsWith(".mjs");
  e.respondWith(caches.open(VERSION).then(async cache=>{
    const hit = await cache.match(e.request);
    if(heavy && hit) return hit;
    const net = fetch(e.request).then(res=>{ if(res.ok) cache.put(e.request, res.clone()); return res; });
    return hit ? (net.catch(()=>{}), hit) : net;
  }));
});
