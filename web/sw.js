const ASSETS=__ASSETS__;
const ROOT=new URL('./',self.registration.scope);
const PREFIX='cash-out-shell-'+encodeURIComponent(ROOT.pathname)+'-';
const CACHE=PREFIX+'__VERSION__';
const urls=ASSETS.map(file=>new URL(file,ROOT).href);
const allowed=new Set(urls);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{await cache.addAll(urls);}catch(error){await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 // Cache-buster queries normalize only for allowlisted public files, never APIs.
 url.search='';url.hash='';
 if(url.href===ROOT.href)url.pathname+='index.html';
 if(!allowed.has(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  return (await cache.match(url.href))||fetch(event.request);
 })());
});
