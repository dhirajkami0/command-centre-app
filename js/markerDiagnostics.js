/* ISOLATED DIAGNOSTICS ONLY. No transport, persistence, timers or data retention. */
(function(w){
 'use strict';
 if(w.BTRMarkerDiagnostics)return;
 const kinds=['centralAttach','centralStop','centralCallback','centralDiscard','centralError','centralComplete','centralProcessingError','patrolAttach','patrolStop','patrolCallback','patrolDiscard','patrolError','patrolProcessingError','patrolComplete','gpsInput','gpsReject','gpsCandidateReject','gpsAccepted','staffCache','staffMetadataCache','sessionCache','selected','selectionMissing','acceptedRetained','renderer','position','leafletCall','leafletChange','leafletError'];
 const reasons=new Set(['OWNERSHIP','MISSING_COORDINATES','INVALID_COORDINATES','INVALID_OR_FUTURE_TIME','PRE_SESSION_TIME','OLDER_OR_EQUAL_CONFLICT','SELECTED_EQUAL_CONFLICT','NO_CURRENT_OWNER','NO_SELECTED_POINT']);
 const blank=()=>Object.fromEntries(kinds.map(k=>[k,0]));
 const totals=blank();let focused=blank(),target=null,rows=[],accepted=null,selected=null,rejection=null;
 const central={generation:0,state:'NOT_OBSERVED',last:null,first:false,server:null,cache:null};
 const patrol={generation:0,state:'NOT_OBSERVED',last:null,first:false,server:null,cache:null};
 const mono=()=>w.performance.now();
 function markerFor(subject){
  if(subject&&typeof subject==='object'&&subject.__staffKey)return subject;
  const staff=typeof subject==='string'?(w.visibleStaffCache?.[subject]||w.patrolSessionStaff?.[subject]):subject;
  return staff&&w.staffMarkers?.[w.cleanName(staff.cleanName||staff.name||'')];
 }
 function chosen(subject){return !!target&&markerFor(subject)===target.deref();}
 function bump(obj,k){obj[k]=Math.min(Number.MAX_SAFE_INTEGER,obj[k]+1);}
 function hit(kind,subject,data){
  try{
   if(!kinds.includes(kind))return;
   bump(totals,kind);const match=chosen(subject);if(match)bump(focused,kind);
   const now=mono(),state=kind.startsWith('central')?central:match&&kind.startsWith('patrol')?patrol:null;
   if(state){
    if(kind.endsWith('Attach')){state.generation++;state.state='AWAITING_CALLBACK';state.last=null;state.first=false;state.server=null;state.cache=null;}
    if(kind.endsWith('Stop'))state.state='STOPPED';
    if(kind.endsWith('Error'))state.state='ERROR_CALLBACK';
    if(kind.endsWith('Callback')){state.last=now;state.first=true;state.cache=data?.fromCache===true;state.server=data?.fromCache===false;state.state=state.server?'SERVER_SNAPSHOT_SEEN':'CACHE_OR_UNKNOWN';}
   }
   const reason=reasons.has(data?.reason)?data.reason:null;
   if(match&&(kind==='gpsReject'||kind==='gpsCandidateReject'))rejection=reason;
   if(match&&kind==='gpsAccepted'){accepted={age:Number.isFinite(data?.age)?data.age:null,at:now};rejection=null;}
   if(match&&kind==='selected')selected={age:Number.isFinite(data?.age)?data.age:null,at:now};
   const row={event:kind,elapsedMs:Math.round(now),focused:match};
   if(reason)row.reason=reason;
   if(typeof data?.equal==='boolean')row.equal=data.equal;
   if(state&&kind.endsWith('Callback')){row.fromCache=state.cache;row.fromServer=state.server;row.hasPendingWrites=data?.hasPendingWrites===true;}
   rows.push(row);if(rows.length>32)rows.shift();
  }catch(_){/* Diagnostics never propagate an exception into the application. */}
 }
 function selectElement(element){
  try{
   const marker=Object.values(w.staffMarkers||{}).find(m=>{const e=m.getElement?.();return e&&(e===element||e.contains(element));});
   if(!marker)return {selected:false,reason:'Select the staff marker icon in Elements first.'};
   target=new WeakRef(marker);focused=blank();accepted=selected=null;rejection=null;
   Object.assign(patrol,{generation:0,state:'NOT_OBSERVED',last:null,first:false,server:null,cache:null});
   return {selected:true,scope:'Selected existing marker; counters begin now.'};
  }catch(_){return {selected:false,reason:'Selection unavailable'};}
 }
 function report(){
  const now=mono(),age=x=>x&&x.age!==null?Math.round(x.age+(now-x.at)/1000):null;
  const m=target?.deref();let equal=null,attached=null;
  try{const k=m?.__staffKey,p=w.latestPatrolPointByStaff?.[k],ll=m?.getLatLng();if(ll&&p)equal=ll.lat===Number(p.lat)&&ll.lng===Number(p.lon);const map=w.map;attached=m&&map?!!map.hasLayer(m):null;}catch(_){}
  return {diagnosticOnly:true,applicationVersion:typeof APP_VERSION==='string'?APP_VERSION:'NOT_OBSERVED',expectedBaselineVersion:'v1009',observationTime:new Date().toISOString(),network:w.navigator?.onLine===false?'OFFLINE_HINT':'ONLINE_HINT',focusedMarker:!!m,existingCentralMonitoring:w.FirestoreRecovery?.report?.().monitoring??null,existingPatrolState:m?(w.patrolSessionRecovery?.[m.__staffSession]?.state??null):null,central:{...central,secondsSinceCallback:central.last===null?null:Math.round((now-central.last)/1000),callbackCount:totals.centralCallback},patrol:{...patrol,secondsSinceCallback:patrol.last===null?null:Math.round((now-patrol.last)/1000),callbackCount:focused.patrolCallback},latestAcceptedGpsAgeSeconds:age(accepted),latestSelectedGpsAgeSeconds:age(selected),cacheUpdateCount:focused.staffCache+focused.staffMetadataCache+focused.sessionCache,rendererInvocations:focused.renderer,positionUpdateInvocations:focused.position,leafletCalls:focused.leafletCall,markerCoordinateChanges:focused.leafletChange,markerMatchesLastPublishedRawPoint:equal,markerAttached:attached,gpsRejectionReason:rejection,processingErrors:totals.centralProcessingError+totals.patrolProcessingError+totals.leafletError,totals:{...totals},focused:{...focused},events:rows.map(r=>({...r})),limitations:['Silence is not proof of failure.','Null means not observed since instrumentation/selection.','Central counters aggregate all staff. Patrol/focused counters follow the selected marker.','Raw-point equality can be false because of overlap displacement.','No names, IDs, coordinates, tokens, raw errors or network payloads are retained.']};
 }
 function installLeaflet(L){
  const original=L?.Marker?.prototype?.setLatLng;if(!original)return false;
  L.Marker.prototype.setLatLng=function(...args){
   const watched=!!this.__staffKey;let before;
   if(watched){try{const p=this.getLatLng();before=[p.lat,p.lng];}catch(_){}hit('leafletCall',this);}
   let result;try{result=Reflect.apply(original,this,args);}catch(e){if(watched)hit('leafletError',this);throw e;}
   if(watched){try{const p=this.getLatLng(),equal=!!before&&p.lat===before[0]&&p.lng===before[1];if(!equal)hit('leafletChange',this,{equal:false});}catch(_){}}
   return result;
  };
  return true;
 }
 w.BTRMarkerDiagnostics=Object.freeze({hit,report,selectElement});
 installLeaflet(w.L);
})(window);
