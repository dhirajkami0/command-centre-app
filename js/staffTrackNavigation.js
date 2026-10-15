/* Popup actions reuse the existing session listener, cache and individual track renderer. */
(function(w){
 'use strict';let requestId=0,selection=null;
 const hidden=new Map();
 // Capture-time normalization is shared by the existing track cache and renderers.
 function pointTime(point){
  for(const raw of [point?.time,point?.gpsTime,point?.timestamp,point?.ts]){
   if(raw==null || raw==='' || typeof raw==='boolean')continue;
   let value;
   try{
    if(typeof raw?.toMillis==='function')value=raw.toMillis();
    else if(typeof raw?.toDate==='function')value=raw.toDate().getTime();
    else if(Number.isFinite(raw?.seconds)&&Number.isFinite(raw?.nanoseconds??0))value=raw.seconds*1000+(raw.nanoseconds||0)/1e6;
    else if(raw instanceof Date)value=raw.getTime();
    else if(typeof raw==='number'||typeof raw==='string'&&/^\d+(?:\.\d+)?$/.test(raw.trim())){
     value=Number(raw);if(value>=1e9&&value<1e11)value*=1000;
    }else if(typeof raw==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(raw))value=Date.parse(raw);
   }catch(_){continue;}
   if(Number.isFinite(value)&&value>0&&value<=8640000000000000)return value;
  }
  return 0;
 }
 function geometry(cache,sessionId){
  const points=Object.entries(cache||{}).map(([id,p])=>({...p,id,time:pointTime(p)}))
   .filter(p=>p.time>0).sort((a,b)=>a.time-b.time||String(a.id).localeCompare(String(b.id)));
  const segments=[];let segment=[],count=0,previous=null;
  const finish=()=>{if(segment.length)segments.push(segment);segment=[];};
  for(const p of points){
   const lat=Number(p.lat),lon=Number(p.lon);
   if(p.lat==null||p.lon==null||String(p.lat).trim()===''||String(p.lon).trim()===''||
      !['number','string'].includes(typeof p.lat)||!['number','string'].includes(typeof p.lon)||!Number.isFinite(lat)||!Number.isFinite(lon)||
      Math.abs(lat)>90||Math.abs(lon)>180||(lat===0&&lon===0)||
      (p.sessionId&&String(p.sessionId).trim()!==sessionId)){finish();previous=null;continue;}
   if(p.breakTrack===true){finish();previous=null;}
   if(previous&&typeof w.map.distance==='function'){
    const distance=w.map.distance([Number(previous.lat),Number(previous.lon)],[lat,lon]);
    if(!Number.isFinite(distance)||distance>500||distance/Math.max(1,(p.time-previous.time)/1000)*3.6>120)finish();
   }
   previous=p;segment.push([lat,lon]);count++;
  }
  finish();return{points,segments,count};
 }
 const canonical=name=>w.cleanName(String(name||''));
 function profile(name){const key=canonical(name),s=w.visibleStaffCache?.[key],sessionId=String(s?.sessionId||'').trim();return s?.dutyActive===true&&sessionId&&canonical(s.cleanName || s.name || key)===key?{key,sessionId,staff:s,viewer:w.userProfile,db:w.db}:null;}
 function owned(p){return p?[
  {track:w.staffTracks?.[p.key],layer:w.staffLayer,bulk:false},
  {track:w.bulkStaffTracks?.[p.key],layer:w.bulkStaffTrackLayer,bulk:true}
 ].filter(e=>e.track?.__ggStaffTrackSessionId===p.sessionId):[];}
 function visible(e){return !e.track.__ggTrackHidden&&(!e.bulk||w.staffTrackState?.bulkEnabled&&e.track.__ggTrackHasLine!==false)&&
  !!e.layer?.hasLayer(e.track)&&w.map.hasLayer?.(e.layer)!==false;}
 function isVisible(name){return owned(profile(name)).some(visible);}
 function sync(name){const marker=w.staffMarkers?.[canonical(name)],root=marker?.getPopup?.()?.getElement?.();const button=root?.querySelector?.('[data-staff-track-action="view"]');if(button){button.textContent=isVisible(name)?'Hide Track':'View Track';button.setAttribute('aria-pressed',String(isVisible(name)));}}
 function hide(name){requestId++;selection=null;const p=profile(name),entries=owned(p);if(!entries.length)return{ok:false,message:'No displayed duty track.'};
  hidden.set(p.key,p.sessionId);for(const e of entries){e.track.__ggTrackHidden=true;e.layer.removeLayer(e.track);}
  if(canonical(w.staffTrackState?.selectedStaff)===p.key)w.staffTrackState.selectedStaff=null;
  sync(name);return{ok:true,track:entries[0].track,message:'Track hidden. GPS recording continues.'};}
 function current(p,id){return id===requestId&&p.viewer===w.userProfile&&p.db===w.db&&profile(p.key)?.sessionId===p.sessionId;}
 function loadState(p){
  const recovery=w.patrolSessionRecovery?.[p.sessionId];
  if(recovery?.state)return recovery.state;
  return w.StaffRendering?.historyPending(p.sessionId)===false?'ready':'loading';
 }
 function unavailable(p){
  const state=loadState(p);
  if(state==='denied')return{ok:false,state,message:'GPS track read denied. Check access permissions.'};
  if(state==='retry-wait'||state==='failed')return{ok:false,state,message:'Temporary GPS track loading/read error. '+(state==='retry-wait'?'Retry scheduled.':'Try again when service is available.')};
  if(state!=='ready')return{ok:false,state:'loading',message:'Loading GPS track. Waiting for history…'};
  return{ok:false,state:'empty',message:Object.keys(w.sessionPointCache?.[p.sessionId]||{}).length?
   'GPS points received, but none have valid session coordinates and capture time.':'No GPS points recorded for this duty.'};
 }
 function render(p,id,fit){
  if(!current(p,id))return{ok:false,message:'Track selection or duty session changed.'};
  const cache=w.sessionPointCache?.[p.sessionId],data=cache&&geometry(cache,p.sessionId);
  if(data&&!data.count&&loadState(p)==='ready'){
   for(const e of owned(p))e.layer.removeLayer(e.track);
   return unavailable(p);
  }
  if(data?.count)for(const e of owned(p))if(e.bulk){
   e.track.setLatLngs(data.segments);e.track.__ggTrackHasLine=data.segments.some(segment=>segment.length>=2);
  }
  const bulk=owned(p).find(e=>e.bulk&&e.track.__ggTrackHasLine!==false);
  let track;
  if(w.staffTrackState?.bulkEnabled&&bulk){track=bulk.track;track.__ggTrackHidden=false;track.addTo(bulk.layer);}
  else track=w.loadIndividualStaffTrack(p.key);
  if(!track)return unavailable(p);
  if(!current(p,id)||track.__ggStaffTrackSessionId!==p.sessionId)return{ok:false,message:'Track selection or duty session changed.'};
  track.__ggPopupBulkFallback=!!w.staffTrackState?.bulkEnabled&&track===w.staffTracks?.[p.key];
  hidden.delete(p.key);
  for(const e of owned(p))if(e.track!==track)e.layer.removeLayer(e.track);
  if(fit){const b=track.getBounds?.();if(!b?.isValid?.())return{ok:false,message:'Track bounds are unavailable.'};const sw=b.getSouthWest(),ne=b.getNorthEast();
   if(![sw.lat,sw.lng,ne.lat,ne.lng].every(Number.isFinite)||Math.max(Math.abs(sw.lat),Math.abs(ne.lat))>90||Math.max(Math.abs(sw.lng),Math.abs(ne.lng))>180)return{ok:false,message:'Track bounds are invalid.'};
   if(!current(p,id))return{ok:false,message:'Track selection changed.'};
   const size=w.map.getSize();w.map.fitBounds(b,{maxZoom:17,padding:[Math.min(40,Math.floor(size.x/8)),Math.min(64,Math.floor(size.y/8))]});
  }
  const state=loadState(p),error=['retry-wait','failed','denied'].includes(state);
  const message=error?'Available track displayed. '+unavailable(p).message:
   fit?'Track displayed and map fitted to it.':state!=='ready'?'Available track displayed; remaining history is loading.':'Track displayed. Map view unchanged.';
  return{ok:true,state:state==='ready'?'ready':'partial',track,message};
 }
 function publish(p,value){const marker=w.staffMarkers?.[p.key],root=marker?.getPopup?.()?.getElement?.();
  if(marker?.isPopupOpen?.()){const status=root?.querySelector?.('[data-staff-track-status]');if(status)status.textContent=value.message;sync(p.key);}}
 function onSessionUpdate(sessionId){const pending=selection;if(!pending||pending.p.sessionId!==sessionId)return;
  if(!current(pending.p,pending.id)){selection=null;return;}
  const value=render(pending.p,pending.id,pending.fit);if(value.ok)pending.fit=false;
  publish(pending.p,value);
 }
 function action(name,fit){
  const id=++requestId,p=profile(name);if(!p)return{ok:false,message:'Staff or active session unavailable.'};
  selection={p,id,fit};
  const recovery=w.patrolSessionRecovery?.[p.sessionId];
  if(recovery?.state==='failed'&&!recovery.blocked&&Date.now()>=recovery.until){recovery.failures=0;recovery.until=0;}
  w.ensurePatrolSessionListener?.(p.sessionId,p.staff); // Existing singleton query/listener only.
  if(Object.keys(w.sessionPointCache?.[p.sessionId]||{}).length||loadState(p)!=='loading'){
   const value=render(p,id,fit);if(value.ok&&selection?.id===id)selection.fit=false;return value;
  }
  return new Promise(resolve=>{const deadline=Date.now()+10000;function check(){
   if(!current(p,id)){resolve({ok:false,message:'Track selection or duty session changed.'});return;}
   if(Object.keys(w.sessionPointCache?.[p.sessionId]||{}).length||loadState(p)!=='loading'||Date.now()>=deadline){const value=render(p,id,selection?.fit===true);if(value.ok&&selection?.id===id)selection.fit=false;resolve(value);return;}
   w.setTimeout(check,100);
  }check();});
 }
 function bindPopup(marker,name){
  if(!marker||marker.__ggTrackActionsBound)return;marker.__ggTrackActionsBound=true;
  marker.on('popupclose remove',()=>{if(marker.__ggTrackActionToken===requestId)requestId++;});
  marker.on('popupopen',()=>{const root=marker.getPopup()?.getElement();if(!root||root.__ggTrackActionsBound)return;root.__ggTrackActionsBound=true;sync(name);
   root.addEventListener('click',event=>{const button=event.target.closest('[data-staff-track-action]');
    if(!button||!root.contains(button)||!marker.isPopupOpen()||marker.getPopup()?.getElement()!==root)return;
    event.preventDefault();event.stopPropagation();const type=button.dataset.staffTrackAction;
    if(type==='close'){requestId++;w.map.closePopup(marker.getPopup());return;}
    if(type!=='view'&&type!=='zoom')return;
    const status=root.querySelector('[data-staff-track-status]');if(status)status.textContent='Loading duty track…';
    const result=type==='view'&&isVisible(name)?hide(name):action(name,type==='zoom'),token=requestId;marker.__ggTrackActionToken=token;
    Promise.resolve(result).then(value=>{if(token===requestId&&marker.isPopupOpen()&&marker.getPopup()?.getElement()===root&&status){status.textContent=value.message;sync(name);}})
     .catch(()=>{if(token===requestId&&status)status.textContent='Unable to load duty track. Try again.';});
   });
  });
 }
 w.StaffTrackNavigation={view:name=>action(name,false),zoom:name=>action(name,true),hide,isVisible,sync,bindPopup,
  pointTime,geometry,onSessionUpdate,isHidden:(name,id)=>hidden.get(canonical(name))===id};
})(window);
