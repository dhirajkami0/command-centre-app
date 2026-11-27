/* Frontend recovery only; no new queries, persistence or identity logging. */
(function(w){
  'use strict';
  const profiles=new Map();
  let staff=null, generation=0, failures=0, nextAttempt=0, blocked=false;
  let retryTimer=null, listenerRequest=null, serverConfirmed=false;
  // Memory-only delivery evidence. Silence alone never detaches a subscription.
  const seenStaff=new Map(), health={callbacks:0,cacheCallbacks:0,serverCallbacks:0,metadataOnly:0,
    discarded:0,errors:0,recoveries:0,verifiedDeliveryRecoveries:0,lastCallback:null,lastServer:null,
    lastCache:null,lastSource:null,lastError:null,attachedAt:null};
  let deliveryProof=null, proofTimer=null, proofWindowStart=0, proofRecoveries=0, proofCooldown=0;
  const bump=key=>{health[key]=Math.min(Number.MAX_SAFE_INTEGER,health[key]+1);};
  function clearProof(){if(proofTimer!==null)w.clearTimeout(proofTimer);proofTimer=null;deliveryProof=null;}
  function projection(data){
    const raw=data?.gpsTime??data?.time, time=w.StaffRendering?.pointTime?.({time:raw})||0;
    const lat=Number(data?.lat),lon=Number(data?.lon),id=String(data?.sessionId||'').trim();
    const start=Number(id.match(/_(\d{13})$/)?.[1]||0);
    if(data?.dutyActive!==true||data?.status==='ENDED'||!id||data.lat==null||data.lon==null||
       !Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||
       (lat===0&&lon===0)||!(time>0)||time>Date.now()+120000||(start&&time<start))return null;
    return {id,time,lat,lon};
  }
  const ahead=(a,b)=>a&&b&&a.id===b.id&&a.time>b.time&&(a.lat!==b.lat||a.lon!==b.lon);
  function rememberChanges(changes){
    for(const change of changes||[]){const name=String(change.doc?.id||'');if(!name)continue;
      const value=change.type==='removed'?null:projection(change.doc.data());
      if(value)seenStaff.set(name,value);else seenStaff.delete(name);
      if(seenStaff.size>512)seenStaff.delete(seenStaff.keys().next().value);
    }
    if(deliveryProof&&!ahead(deliveryProof.value,seenStaff.get(deliveryProof.name)))clearProof();
  }
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
  function detach(){cancelRetry();clearProof();generation++;try{staff?.unsubscribe?.();}catch(_){/* State cleanup must survive an SDK unsubscribe failure. */}finally{staff=null;serverConfirmed=false;w.staffListenerActive=false;w.staffUnsubscribe=null;}}
  function stopStaff(){window.BTRMarkerDiagnostics?.hit('centralStop',null,{});listenerRequest=null;detach();}
  let currentScope=scope(), currentDB=w.db;
  function allowStaff(){
    const changed=currentScope!==scope()||currentDB!==w.db;
    if(changed){stopStaff();seenStaff.clear();currentScope=scope();currentDB=w.db;failures=0;nextAttempt=0;blocked=false;}
    return !!w.userProfile && !staff && !blocked && Date.now()>=nextAttempt;
  }
  function failed(error,token){
    if(token!==generation)return;window.BTRMarkerDiagnostics?.hit('centralError',null,{});
    const request=listenerRequest;
    const code=classify(error);bump('errors');health.lastError=code;detach();failures++;
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
    const token=++generation, entry={unsubscribe:null,delivered:false,received:false};staff=entry;health.attachedAt=Date.now();window.BTRMarkerDiagnostics?.hit('centralAttach',null,{});
    try{
      entry.unsubscribe=w.fb.onSnapshot(request.query,{includeMetadataChanges:true},snapshot=>{window.BTRMarkerDiagnostics?.hit('centralCallback',null,{fromCache:snapshot.metadata?.fromCache,hasPendingWrites:snapshot.metadata?.hasPendingWrites});
        if(token!==generation||listenerRequest!==request||currentScope!==scope()||currentDB!==w.db){bump('discarded');window.BTRMarkerDiagnostics?.hit('centralDiscard',null,{});return;}
        entry.received=true;bump('callbacks');health.lastCallback=Date.now();
        serverConfirmed=snapshot.metadata?.fromCache===false&&snapshot.metadata?.hasPendingWrites!==true;
        if(serverConfirmed){bump('serverCallbacks');health.lastServer=Date.now();health.lastSource='server';failures=0;nextAttempt=0;diagnostic('available');}
        else if(snapshot.metadata?.fromCache===true){bump('cacheCallbacks');health.lastCache=Date.now();health.lastSource='cache';diagnostic('sdk-reconnecting');}
        else {health.lastSource='pending-or-unknown';diagnostic('sdk-reconnecting');}
        let changes=null;try{if(typeof snapshot.docChanges==='function')changes=snapshot.docChanges({includeMetadataChanges:false});}catch(_){/* Preserve existing callback delivery when metadata inspection is unavailable. */}
        if(changes)rememberChanges(changes);
        // Preserve the existing consumer's startup/cache UI acknowledgement.
        // docChanges() is empty for metadata-only delivery; no query is added here.
        if(entry.delivered&&changes?.length===0)bump('metadataOnly');
        entry.delivered=true;
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
    cancelRetry();bump('recoveries');attachStaff(request);return true;
  }
  // Observe an ALREADY completed exact-document read. This method never fetches.
  // A newer point subcollection document does not prove a live_staff update.
  function observeServerStaffSnapshot(snapshot){
    try{
      const request=listenerRequest, name=String(snapshot?.id||''),ref=snapshot?.ref;
      if(!staff||!request||blocked||w.navigator?.onLine===false||request.db!==w.db||request.scope!==scope()||
         snapshot.metadata?.fromCache!==false||snapshot.metadata?.hasPendingWrites!==false||
         !snapshot.exists?.()||ref?.firestore!==w.db||ref.path!=='live_staff/'+name)return false;
      const value=projection(snapshot.data()), visible=w.visibleStaffCache?.[name];
      if(!value||visible?.dutyActive!==true||visible.status==='ENDED'||visible.sessionId!==value.id||
         !ahead(value,seenStaff.get(name)))return false;
      if(Date.now()-proofWindowStart>=600000){proofWindowStart=Date.now();proofRecoveries=0;}
      if(proofRecoveries>=2||Date.now()<proofCooldown)return false;
      // One proof/one grace timer for the shared listener; repeated reads don't postpone it.
      if(deliveryProof)return true;
      deliveryProof={request,name,value,token:generation,at:Date.now()};
      proofTimer=w.setTimeout(()=>{
        const proof=deliveryProof;proofTimer=null;
        const current=proof&&w.visibleStaffCache?.[proof.name];
        if(!proof||!staff||proof.token!==generation||proof.request!==listenerRequest||blocked||
           request.db!==w.db||request.scope!==scope()||w.navigator?.onLine===false||
           current?.dutyActive!==true||current.status==='ENDED'||current.sessionId!==proof.value.id||
           Date.now()-proof.at>120000||!ahead(proof.value,seenStaff.get(proof.name))||
           Date.now()<nextAttempt||Date.now()<proofCooldown||proofRecoveries>=2){clearProof();return;}
        proofRecoveries++;proofCooldown=Date.now()+60000;bump('verifiedDeliveryRecoveries');
        detach();attachStaff(request); // Detach first; preserve staff/point caches and marker instances.
      },30000);
      return true;
    }catch(_){return false;}
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
  w.FirestoreRecovery={allowStaff,listenStaff,profileSnapshot,profileUnavailable,classify,observeServerStaffSnapshot,
    report:()=>({state:w.firestoreServiceState?{...w.firestoreServiceState}:null,active:!!staff,failures,retryAfterMs:Math.max(0,nextAttempt-Date.now()),blocked,
      monitoring:!listenerRequest||blocked?'stopped':w.navigator?.onLine===false?'offline':staff&&serverConfirmed?'connected':'recovering',
      delivery:{...health,lastCallback:health.lastCallback===null?null:Date.now()-health.lastCallback,
        lastServer:health.lastServer===null?null:Date.now()-health.lastServer,lastCache:health.lastCache===null?null:Date.now()-health.lastCache,
        state:!listenerRequest?'stopped':blocked?'blocked':w.navigator?.onLine===false?'offline':!staff?'retry-wait':
          !staff.received?'awaiting-initial-snapshot':serverConfirmed?'server-confirmed':
          health.lastSource==='cache'?'cache-only-sdk-reconnecting':'pending-or-unknown',
        proofPending:!!deliveryProof,proofRecoveriesInWindow:proofRecoveries,silenceProvesFailure:false},
      patrol:Object.values(w.patrolSessionRecovery||{}).reduce((out,r)=>{out[r.blocked?'stopped':r.state==='ready'?'connected':'recovering']++;return out;},{connected:0,recovering:0,stopped:0})}),
    stop:stopStaff,
    retryStaff:resumeStaff};
  w.addEventListener('online',resumeStaff);
  w.addEventListener('offline',()=>{serverConfirmed=false;clearProof();diagnostic('offline');});
  w.document.addEventListener('visibilitychange',()=>{if(w.document.visibilityState==='visible')resumeStaff();});
  w.addEventListener('userProfileLoaded',()=>{if(currentScope!==scope())w.loadStaff?.();});
})(window);
