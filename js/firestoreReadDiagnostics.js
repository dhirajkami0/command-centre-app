/* Local metadata only. No transport, timers, document data, persistence or SDK settings. */
(function(w){
 'use strict';
 if(w.GreenGuardReadDiagnostics)return;
 const BUILD='__GG_READ_DIAGNOSTIC_BUILD__',MAX_OPS=256,MAX_EVENTS=512;
 const refs=new WeakMap(),constraints=new WeakMap(),modules=new WeakMap(),databases=new WeakMap();
 const operations=new Map(),events=[];
 const salt=String(Math.random())+String(Date.now());
 let dbSequence=0,generation=0,active=0,peak=0,droppedEvents=0,overflowOperations=0;
 const mono=()=>w.performance?.now?.()??Date.now();
 const hash=value=>{let a=2166136261,b=5381;const text=salt+String(value);for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}return(a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');};
 const safe=fn=>{try{return fn();}catch(_){return null;}};
 const field=v=>typeof v==='string'&&/^[A-Za-z_][A-Za-z0-9_.-]{0,79}$/.test(v)?v:'{field}';
 function schema(path){return String(path||'unknown').split('/').map((p,i)=>i%2?'{doc}':field(p)).join('/');}
 function dbKey(db){if(!db||typeof db!=='object')return'unknown';if(!databases.has(db))databases.set(db,++dbSequence);return databases.get(db);}
 function meta(ref){return refs.get(ref)||{path:schema(ref?.path),identity:hash(ref?.path||'unknown'),db:dbKey(ref?.firestore),filters:[]};}
 function purpose(path){
  const stack=String(new Error().stack||'').split('\n').slice(1).filter(line=>!/[\\/]firestoreReadDiagnostics\.js:/.test(line));
  const caller=stack.map(s=>s.match(/at\s+(?:async\s+)?([A-Za-z_$][A-Za-z0-9_.$]*)\s*\(/)?.[1]).find(s=>s&&!['purpose','begin','listen','read','Object.getDocs','Object.getDocsFromServer','Object.getDoc','Object.onSnapshot'].includes(s)&&!s.startsWith('safe'))||'unclassified';
  const feature=/dutyReadEndedPoints|dutyProcessReport/.test(caller)?'reporting':/analytics/i.test(caller)||path.startsWith('analytics')?'analytics':/master|grid|coverage/i.test(path+caller)?'coverage':path.startsWith('live_staff')?'live-monitoring':path.startsWith('patrol_tracks')?'patrol-tracking':'other-existing-feature';
  return{purpose:field(caller),feature};
 }
 function emit(row){events.push(row);if(events.length>MAX_EVENTS){events.shift();droppedEvents++;}}
 function begin(ref,kind,origin){
  const m=meta(ref),p=m.label||purpose(m.path),fingerprint=hash(JSON.stringify([m.db,m.path,m.identity,m.filters,kind]));
  let key=fingerprint+'|'+p.purpose,entry=operations.get(key);
  if(!entry){
   if(operations.size>=MAX_OPS-1){key='overflow';overflowOperations++;entry=operations.get(key);}
   if(!entry){entry={fingerprint:key==='overflow'?'overflow':fingerprint,collectionPath:key==='overflow'?'{bounded-overflow}':m.path,purpose:key==='overflow'?'overflow':p.purpose,feature:key==='overflow'?'overflow':p.feature,kind,origin,executions:0,attachments:0,detachments:0,active:0,initialSnapshotDocuments:0,maxInitialSnapshotSize:0,changedDocuments:0,observedDocuments:0,serverSnapshots:0,cacheSnapshots:0,unknownSnapshots:0,serverInitialDocuments:0,queryReturnedDocuments:0,errors:0,durationMs:0,maxDurationMs:0,lastUTC:null};operations.set(key,entry);}
  }
  entry.executions++;return{entry,m,started:mono(),generation:kind==='listener'?++generation:null};
 }
 function record(op,event,values={}){const at=new Date().toISOString();op.entry.lastUTC=at;emit({timestamp:at,buildVersion:BUILD,collectionPath:op.entry.collectionPath,purpose:op.entry.purpose,feature:op.entry.feature,fingerprint:op.entry.fingerprint,event,generation:op.generation,activeListeners:active,...values});}
 function snapshot(op,snap,initial,serverInitial){
  const e=op.entry,count=Number.isFinite(snap?.size)?snap.size:typeof snap?.exists==='function'?(snap.exists()?1:0):null;
  let changed=null;if(typeof snap?.docChanges==='function'){const a=safe(()=>snap.docChanges({includeMetadataChanges:false}));if(Array.isArray(a))changed=a.length;}
  const fromCache=snap?.metadata?.fromCache===true?'cache':snap?.metadata?.fromCache===false?'server':op.origin==='server'||op.origin==='lite-server'?'server':'unknown';
  const duration=Math.max(0,mono()-op.started);if(initial){e.initialSnapshotDocuments+=count||0;e.maxInitialSnapshotSize=Math.max(e.maxInitialSnapshotSize,count||0);e.observedDocuments+=count||0;}else e.observedDocuments+=changed||0;
  e.changedDocuments+=changed||0;if(fromCache==='server')e.serverSnapshots++;else if(fromCache==='cache')e.cacheSnapshots++;else e.unknownSnapshots++;
  if(serverInitial)e.serverInitialDocuments+=count||0;
  if(op.generation===null){e.queryReturnedDocuments+=count||0;e.durationMs+=duration;e.maxDurationMs=Math.max(e.maxDurationMs,duration);}
  record(op,'snapshot',{returnedDocuments:count,initialSnapshotSize:initial?count:null,changedDocumentCount:changed,source:fromCache,hasPendingWrites:snap?.metadata?.hasPendingWrites??null,durationMs:Math.round(duration*100)/100});
 }
 function error(op,err){op.entry.errors++;const code=String(err?.code||'unknown').replace(/^firestore\//,'');record(op,'error',{code:['permission-denied','unauthenticated','unavailable','failed-precondition','resource-exhausted','cancelled','deadline-exceeded'].includes(code)?code:'unknown'});}
 function read(original,args,origin){
  const op=safe(()=>begin(args[0],'query',origin));let value;
  try{value=Reflect.apply(original,null,args);}catch(err){if(op)safe(()=>error(op,err));throw err;}
  if(op)Promise.resolve(value).then(s=>safe(()=>snapshot(op,s,true,s?.metadata?.fromCache===false||origin==='server'||origin==='lite-server')),e=>safe(()=>error(op,e)));
  return value; // Preserve the original promise, its rejection and its lifetime.
 }
 function listen(original,args){
  const op=safe(()=>begin(args[0],'listener','sdk'));if(!op)return Reflect.apply(original,null,args);
  let closed=false,received=false,serverSeen=false;
  op.entry.attachments++;op.entry.active++;active++;peak=Math.max(peak,active);record(op,'attach');
  const close=reason=>{if(closed)return;closed=true;op.entry.active--;op.entry.detachments++;active--;record(op,reason);};
  const next=callback=>function(snap){safe(()=>{const firstServer=!serverSeen&&snap?.metadata?.fromCache===false;snapshot(op,snap,!received,firstServer);received=true;if(firstServer)serverSeen=true;});return Reflect.apply(callback,this,[snap]);};
  const fail=callback=>function(err){safe(()=>error(op,err));close('terminal-error');if(callback)return Reflect.apply(callback,this,[err]);};
  const complete=callback=>function(){close('complete');if(callback)return Reflect.apply(callback,this,arguments);};
  const a=[...args];let index=1;if(a[index]&&typeof a[index]==='object'&&!('next'in a[index])&&!('error'in a[index])&&!('complete'in a[index]))index++;
  if(typeof a[index]==='function'){a[index]=next(a[index]);if(typeof a[index+1]==='function')a[index+1]=fail(a[index+1]);if(typeof a[index+2]==='function')a[index+2]=complete(a[index+2]);}
  else if(a[index]&&typeof a[index]==='object'){const observer=a[index];a[index]={...observer,next:next(s=>observer.next?.call(observer,s)),...(typeof observer.error==='function'?{error:fail(e=>observer.error.call(observer,e))}:{}),...(typeof observer.complete==='function'?{complete:complete(()=>observer.complete.call(observer))}:{})};}
  try{const unsubscribe=Reflect.apply(original,null,a);return function(){close('detach');return Reflect.apply(unsubscribe,this,arguments);};}catch(err){safe(()=>error(op,err));close('attach-error');throw err;}
 }
 function wrap(sdk,{origin='sdk'}={}){
  if(!sdk||typeof sdk!=='object')return sdk;
  let byOrigin=modules.get(sdk);if(!byOrigin){byOrigin=new Map();modules.set(sdk,byOrigin);}if(byOrigin.has(origin))return byOrigin.get(origin);
  const out={...sdk};
  for(const name of ['collection','doc','collectionGroup'])if(typeof sdk[name]==='function')out[name]=function(){const args=[...arguments],ref=Reflect.apply(sdk[name],null,args);safe(()=>{const parent=args[0],parts=args.slice(1).filter(v=>typeof v==='string'),raw=(parent?.path?parent.path+'/':'')+parts.join('/');refs.set(ref,{path:name==='collectionGroup'?'group:'+schema(parts.join('/')):schema(raw),identity:hash(raw),db:dbKey(parent?.firestore||parent),filters:[]});});return ref;};
  for(const name of ['where','orderBy','limit','limitToLast','startAfter','startAt','endBefore','endAt'])if(typeof sdk[name]==='function')out[name]=function(){const args=[...arguments],value=Reflect.apply(sdk[name],null,args);safe(()=>{constraints.set(value,{kind:name,field:['where','orderBy'].includes(name)?field(args[0]):null,signature:hash(args.map(v=>typeof v==='object'?v?.path||String(v):String(v)).join('\u0000'))});});return value;};
  if(typeof sdk.query==='function')out.query=function(ref){const args=[...arguments],q=Reflect.apply(sdk.query,null,args);safe(()=>{const m=meta(ref);refs.set(q,{...m,filters:[...m.filters,...args.slice(1).map(v=>constraints.get(v)||{kind:'unclassified'})]});});return q;};
  for(const name of ['getDocs','getDocsFromServer','getDocsFromCache','getDoc','getDocFromServer','getDocFromCache'])if(typeof sdk[name]==='function')out[name]=function(){return read(sdk[name],[...arguments],/FromServer/.test(name)?'server':/FromCache/.test(name)?'cache':origin);};
  if(typeof sdk.onSnapshot==='function')out.onSnapshot=function(){return listen(sdk.onSnapshot,[...arguments]);};
  byOrigin.set(origin,out);return out;
 }
 function top(limit=20){return [...operations.values()].sort((a,b)=>b.observedDocuments-a.observedDocuments).slice(0,Math.min(MAX_OPS,Math.max(0,Number(limit)||0))).map(x=>({...x}));}
 function byCollection(limit=20){const grouped=new Map();for(const e of operations.values()){const k=e.collectionPath+'|'+e.purpose;let row=grouped.get(k);if(!row){row={collectionPath:e.collectionPath,purpose:e.purpose,feature:e.feature,fingerprints:0,executions:0,observedDocuments:0,queryReturnedDocuments:0,attachments:0,active:0,cacheSnapshots:0,serverSnapshots:0};grouped.set(k,row);}row.fingerprints++;for(const n of ['executions','observedDocuments','queryReturnedDocuments','attachments','active','cacheSnapshots','serverSnapshots'])row[n]+=e[n];}return[...grouped.values()].sort((a,b)=>b.observedDocuments-a.observedDocuments).slice(0,Math.min(MAX_OPS,Math.max(0,Number(limit)||0)));}
 function report(){return{version:1,buildVersion:BUILD,applicationVersion:typeof APP_VERSION==='string'?APP_VERSION:null,capturedUTC:new Date().toISOString(),activeListeners:active,peakActiveListeners:peak,limits:{operations:MAX_OPS,events:MAX_EVENTS},droppedEvents,overflowOperations,operations:top(MAX_OPS),byCollection:byCollection(MAX_OPS),events:events.map(x=>({...x})),limitations:['Observed document/snapshot counts are NOT billed Firestore reads.','Cache, metadata-only delivery, reconnect billing, rule-dependent reads and SDK retries cannot be priced exactly from callbacks.','Active counts represent attached subscriptions; SDK-internal reconnections and terminal errors without an application error handler are not visible.','Fingerprints are salted per page. No query values, document IDs/data, coordinates, identities, credentials or raw errors are retained.','All metadata is bounded in memory only; no transport, timers, persistence or extra reads.']};}
 const labels={'live-staff-central':'staff-map','patrol-shared-fallback':'staff-map','reporting-gps-verification':'ended-session-reporting','monthly-analytics':'analytics','coverage-grid':'coverage'};
 function label(ref,name){if(Object.prototype.hasOwnProperty.call(labels,name))safe(()=>refs.set(ref,{...meta(ref),label:{purpose:name,feature:labels[name]}}));return ref;}
 w.GreenGuardReadDiagnostics=Object.freeze({wrap,label,top,byCollection,report,exportJSON:()=>JSON.stringify(report(),null,2)});
})(window);
