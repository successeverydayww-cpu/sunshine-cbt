var C='prime-v47';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])).catch(()=>{}));self.skipWaiting()});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 var u=e.request.url;
 if(u.indexOf('fonts.googleapis.com')>=0||u.indexOf('fonts.gstatic.com')>=0){
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>m)));
  return}
 e.respondWith(
  fetch(e.request).then(r=>{
   if(u.indexOf('sunshine')>=0||u.indexOf(location.origin)>=0){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}
   return r;
  }).catch(()=>caches.match(e.request))
 );
});
