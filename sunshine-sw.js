
var C='prime-v54',V='54';
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){
  e.waitUntil(Promise.resolve().then(function(){
    return caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ if(k!==C){ try{return caches.delete(k)}catch(x){} } return null }));
    }).catch(function(){});
  }).then(function(){
    try{ if(self.registration.navigationPreload&&self.registration.navigationPreload.disable) return self.registration.navigationPreload.disable(); }catch(x){}
  }).then(function(){ return self.clients.claim(); }).then(function(){
    return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      return Promise.all(list.map(function(c){
        try{
          var u=new URL(c.url);
          if(u.searchParams.get('swh')===V) return null;
          u.searchParams.set('swh',V);
          return c.navigate(u.href).catch(function(){});
        }catch(x){ return null; }
      }));
    });
  }).catch(function(){}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET') return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'reload'}).then(function(res){
      try{ var cp=res.clone(); caches.open(C).then(function(c){ c.put('/',cp); }); }catch(x){}
      return res;
    }).catch(function(){
      return caches.match('/').then(function(m){ return m||fetch(r); }).catch(function(){ return fetch(r); });
    }));
    return;
  }
  try{
    if(new URL(r.url).origin!==self.location.origin) return;
  }catch(x){ return; }
  e.respondWith(caches.match(r).then(function(m){
    if(m) return m;
    return fetch(r).then(function(res){
      try{ var cp=res.clone(); caches.open(C).then(function(c){ c.put(r,cp); }); }catch(x){}
      return res;
    }).catch(function(){ return m; });
  }));
});
self.addEventListener('message',function(e){ if(e.data&&e.data.type==='SKIP_WAITING'){ self.skipWaiting(); } });
