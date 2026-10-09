const CACHE='nomad-pwa-shell-v2';
const FILES=['./','index.html','style.css','app.js','runtime.js','ai-worker.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nomad-pwa-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.match(e.request,{cacheName:CACHE}).then(cached=>cached||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('index.html',{cacheName:CACHE}):Response.error())));
});
