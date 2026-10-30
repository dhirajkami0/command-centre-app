/* Frontend recovery only; no new queries, persistence or identity logging. */
(function(w){
  'use strict';
  const profiles=new Map();
  let staff=null, generation=0, failures=0, nextAttempt=0, blocked=false;
  let retryTimer=null, listenerRequest=null, serverConfirmed=false;
  const classify=error=>{
    const code=String(error?.code||error?.message||'').replace(/^firestore\//,'');
    return code.includes('resource-exhausted')?'resource-exhausted':
      code.includes('permission-denied')?'permission-denied':
      code.includes('unauthenticated')?'unauthenticated':
      code.includes('failed-precondition')?'failed-precondition':
      code.includes('invalid-argument')?'invalid-argument':
      code.includes('TIMEOUT')?'timeout':code.includes('unavailable')?'unavailable':'unknown';
  };
  const scope=()=>JSON.stringify([w.userProfile?.cleanName||w.userProfile?.name||'',w.userProfile?.role||'',w.userProfile?.division||'',w.userProfile?.range||'']);
  const diagnostic=(state,code)=>{w.firestoreServiceState={state,code:code||null};w.StartupCoordinator?.paint();
    if(new URLSearchParams(w.location?.search||'').get('firestoreRecovery')==='1')
      w.console.info('Firestore recovery',{state,code:code||null,attempts:failures});};
  function cancelRetry(){if(retryTimer!==null)w.clearTimeout(retryTimer);retryTimer=null;}
  function detach(){cancelRetry();generation++;try{staff?.unsubscribe?.();}catch(_){/* State cleanup must survive an SDK unsubscribe failure. */}finally{staff=null;serverConfirmed=false;w.staffListenerActive=false;w.staffUnsubscribe=null;}}
  function stopStaff(){listenerRequest=null;detach();}
  let currentScope=scope(), currentDB=w.db;
  function allowStaff(){
    const changed=currentScope!==scope()||currentDB!==w.db;
    if(changed){stopStaff();currentScope=scope();currentDB=w.db;failures=0;nextAttempt=0;blocked=false;}
    return !!w.userProfile && !staff && !blocked && Date.now()>=nextAttempt;
  }
  function failed(error,token){
    if(token!==generation)return;
    const request=listenerRequest;
    const code=classify(error);detach();failures++;
    blocked=['permission-denied','unauthenticated','failed-precondition','invalid-argument'].includes(code);
    nextAttempt=Date.now()+Math.min(300000,(code==='resource-exhausted'?60000:15000)*2**Math.min(failures-1,5));
    diagnostic(blocked?'denied':'retry-wait',code);
    if(request && !blocked){
      const retryGeneration=generation;
      retryTimer=w.setTimeout(()=>{
        retryTimer=null;
        if(generation!==retryGeneration || listenerRequest!==request || staff ||
           !w.userProfile || w.navigator?.onLine===false || request.scope!==scope() || request.db!==w.db)return;
        attachStaff(request);
      },Math.max(0,nextAttempt-Date.now()));
    }
  }
  function attachStaff(request){
    const token=++generation, entry={unsubscribe:null};staff=entry;
    try{
      entry.unsubscribe=w.fb.onSnapshot(request.query,snapshot=>{
        if(token!==generation||listenerRequest!==request||currentScope!==scope()||currentDB!==w.db)return;
        if(snapshot.metadata?.fromCache===false){serverConfirmed=true;failures=0;nextAttempt=0;diagnostic('available');}
        return request.callback(snapshot);
      },error=>failed(error,token));
      // A synchronous error callback must not resurrect a failed subscription.
      if(staff!==entry){entry.unsubscribe?.();return()=>{};}
      w.staffListenerActive=true;
      w.staffUnsubscribe=request.stop;
    }catch(error){failed(error,token);}
  }
  function listenStaff(query,callback){
    if(!allowStaff())return staff ? listenerRequest.stop : ()=>{};
    stopStaff();
    const request={query,callback,scope:scope(),db:w.db,stop:null};
    request.stop=()=>{if(listenerRequest===request)stopStaff();};
    listenerRequest=request;
    attachStaff(request);
    return request.stop;
  }
  // Resume only an existing failed request; intentional stop clears its ownership.
  function resumeStaff(){
    const request=listenerRequest;
    if(!request || staff || blocked || w.navigator?.onLine===false ||
       Date.now()<nextAttempt || !w.userProfile || request.scope!==scope() || request.db!==w.db)return false;
    cancelRetry();attachStaff(request);return true;
  }
  function profileSnapshot(collection,identity,query,timeoutMs){
    const key=collection+'\u0000'+identity;
    let entry=profiles.get(key);
    if(entry && (entry.db!==w.db||entry.scope!==scope())){if(entry.pending)return Promise.reject(new Error('PROFILE_QUERY_TIMEOUT'));profiles.delete(key);entry=null;}
    const attempts=entry?.attempts||0;
    if(entry){
      if(entry.pending)return entry.result;
      if(entry.attempts>=3||Date.now()<entry.until)return Promise.reject(Object.assign(new Error(entry.code),{code:entry.code}));
      profiles.delete(key);
    }
    entry={db:w.db,scope:scope(),attempts,pending:true,until:0,code:null,result:null};profiles.set(key,entry);
    let timer;
    entry.result=new Promise((resolve,reject)=>{
      const fail=error=>{if(!entry.code)entry.attempts++;entry.code=classify(error);entry.until=entry.code==='permission-denied'?Infinity:Date.now()+60000;diagnostic(entry.attempts>=3?'profile-recovery-paused':'profile-unavailable',entry.code);reject(error);};
      timer=w.setTimeout(()=>fail(new Error('PROFILE_QUERY_TIMEOUT')),timeoutMs);
      // Retain the entry until the actual SDK promise settles; timeout is not cancellation.
      Promise.resolve().then(()=>w.fb.getDocs(query)).then(snapshot=>{
        entry.pending=false;w.clearTimeout(timer);if(!entry.code){profiles.delete(key);resolve(snapshot);}
      },error=>{entry.pending=false;w.clearTimeout(timer);fail(error);});
    });
    return entry.result;
  }
  function profileUnavailable(){
    diagnostic('profile-unavailable',w.firestoreServiceState?.code||'unavailable');
    if(!w.navigator.onLine){w.updateNetworkStatus?.('offline');return;}
    const el=w.document.getElementById('last-update');
    if(el){el.textContent='🟠 INTERNET ONLINE — FIRESTORE / PROFILE UNAVAILABLE';el.style.color='#ffaa00';}
  }
  w.FirestoreRecovery={allowStaff,listenStaff,profileSnapshot,profileUnavailable,classify,
    report:()=>({state:w.firestoreServiceState||null,active:!!staff,failures,retryAfterMs:Math.max(0,nextAttempt-Date.now()),blocked,
      monitoring:!listenerRequest||blocked?'stopped':staff&&serverConfirmed&&w.navigator?.onLine!==false?'connected':'recovering',
      patrol:Object.values(w.patrolSessionRecovery||{}).reduce((out,r)=>{out[r.blocked?'stopped':r.state==='ready'?'connected':'recovering']++;return out;},{connected:0,recovering:0,stopped:0})}),
    stop:stopStaff,
    retryStaff:resumeStaff};
  w.addEventListener('online',resumeStaff);
  w.document.addEventListener('visibilitychange',()=>{if(w.document.visibilityState==='visible')resumeStaff();});
  w.addEventListener('userProfileLoaded',()=>{if(currentScope!==scope())w.loadStaff?.();});
})(window);
