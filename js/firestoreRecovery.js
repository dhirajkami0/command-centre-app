/* Frontend recovery only; no new queries, persistence or identity logging. */
(function(w){
  'use strict';
  const profiles=new Map();
  let staff=null, generation=0, failures=0, nextAttempt=0, blocked=false;
  const classify=error=>{
    const code=String(error?.code||error?.message||'').replace(/^firestore\//,'');
    return code.includes('resource-exhausted')?'resource-exhausted':
      code.includes('permission-denied')?'permission-denied':
      code.includes('TIMEOUT')?'timeout':code.includes('unavailable')?'unavailable':'unknown';
  };
  const scope=()=>JSON.stringify([w.userProfile?.cleanName||w.userProfile?.name||'',w.userProfile?.role||'',w.userProfile?.division||'',w.userProfile?.range||'']);
  const diagnostic=(state,code)=>{w.firestoreServiceState={state,code:code||null};w.StartupCoordinator?.paint();
    if(new URLSearchParams(w.location?.search||'').get('firestoreRecovery')==='1')
      w.console.info('Firestore recovery',{state,code:code||null,attempts:failures});};
  function detach(){generation++;try{staff?.unsubscribe?.();}catch(_){/* State cleanup must survive an SDK unsubscribe failure. */}finally{staff=null;w.staffListenerActive=false;w.staffUnsubscribe=null;}}
  let currentScope=scope(), currentDB=w.db;
  function allowStaff(){
    const changed=currentScope!==scope()||currentDB!==w.db;
    if(changed){detach();currentScope=scope();currentDB=w.db;failures=0;nextAttempt=0;blocked=false;}
    return !!w.userProfile && !staff && !blocked && failures<3 && Date.now()>=nextAttempt;
  }
  function failed(error,token){
    if(token!==generation)return;
    const code=classify(error);detach();failures++;
    blocked=code==='permission-denied';
    nextAttempt=Date.now()+Math.min(300000,(code==='resource-exhausted'?60000:15000)*2**(failures-1));
    diagnostic(blocked?'denied':failures>=3?'recovery-paused':'retry-wait',code);
  }
  function listenStaff(query,callback){
    const token=++generation, entry={unsubscribe:null};staff=entry;
    try{
      entry.unsubscribe=w.fb.onSnapshot(query,snapshot=>{
        if(token!==generation||currentScope!==scope()||currentDB!==w.db)return;
        if(snapshot.metadata?.fromCache===false){failures=0;nextAttempt=0;diagnostic('available');}
        return callback(snapshot);
      },error=>failed(error,token));
      // A synchronous error callback must not resurrect a failed subscription.
      if(staff!==entry){entry.unsubscribe?.();return()=>{};}
      w.staffListenerActive=true;
      return()=>{if(staff===entry)detach();else entry.unsubscribe?.();};
    }catch(error){failed(error,token);return()=>{};}
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
    report:()=>({state:w.firestoreServiceState||null,active:!!staff,failures,retryAfterMs:Math.max(0,nextAttempt-Date.now()),blocked}),
    stop:detach,
    retryStaff:()=>{if(staff||blocked||Date.now()<nextAttempt)return false;failures=0;w.loadStaff?.();return true;}};
  w.addEventListener('userProfileLoaded',()=>{if(currentScope!==scope())w.loadStaff?.();});
})(window);
