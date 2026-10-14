/* Popup actions reuse the existing session listener, cache and individual track renderer. */
(function(w){
 'use strict';let requestId=0;
 const canonical=name=>w.cleanName(String(name||''));
 function profile(name){const key=canonical(name),s=w.visibleStaffCache?.[key],sessionId=String(s?.sessionId||'').trim();return s?.dutyActive===true&&sessionId?{key,sessionId,staff:s}:null;}
 function current(p,id){return id===requestId&&profile(p.key)?.sessionId===p.sessionId;}
 function render(p,id,fit){
  if(!current(p,id))return{ok:false,message:'Track selection or duty session changed.'};
  const track=w.staffTrackState?.bulkEnabled?w.bulkStaffTracks?.[p.key]:w.loadIndividualStaffTrack(p.key);
  if(!track)return{ok:false,message:'No valid GPS track points are available for this duty.'};
  if(!current(p,id)||track.__ggStaffTrackSessionId!==p.sessionId&& !w.staffTrackState?.bulkEnabled)return{ok:false,message:'Track selection or duty session changed.'};
  if(fit){const b=track.getBounds?.();if(!b?.isValid?.())return{ok:false,message:'Track bounds are unavailable.'};const sw=b.getSouthWest(),ne=b.getNorthEast();
   if(![sw.lat,sw.lng,ne.lat,ne.lng].every(Number.isFinite)||Math.max(Math.abs(sw.lat),Math.abs(ne.lat))>90||Math.max(Math.abs(sw.lng),Math.abs(ne.lng))>180)return{ok:false,message:'Track bounds are invalid.'};
   if(!current(p,id))return{ok:false,message:'Track selection changed.'};
   const size=w.map.getSize();w.map.fitBounds(b,{maxZoom:17,padding:[Math.min(40,Math.floor(size.x/8)),Math.min(64,Math.floor(size.y/8))]});
  }
  return{ok:true,track,message:fit?'Track displayed and map fitted to it.':w.StaffRendering?.historyPending(p.sessionId)?'Available track displayed; remaining history is loading.':'Track displayed. Map view unchanged.'};
 }
 function action(name,fit){
  const id=++requestId,p=profile(name);if(!p)return{ok:false,message:'Staff or active session unavailable.'};
  if(!w.staffTrackState?.bulkEnabled && w.staffTrackState?.selectedStaff && canonical(w.staffTrackState.selectedStaff)!==p.key)w.clearSelectedStaffTrack?.();
  w.ensurePatrolSessionListener?.(p.sessionId,p.staff); // Existing singleton query/listener only.
  if(Object.keys(w.sessionPointCache?.[p.sessionId]||{}).length||w.StaffRendering?.historyPending(p.sessionId)===false)return render(p,id,fit);
  return new Promise(resolve=>{const deadline=Date.now()+10000;function check(){
   if(!current(p,id)){resolve({ok:false,message:'Track selection or duty session changed.'});return;}
   if(Object.keys(w.sessionPointCache?.[p.sessionId]||{}).length||w.StaffRendering?.historyPending(p.sessionId)===false||Date.now()>=deadline){resolve(render(p,id,fit));return;}
   w.setTimeout(check,100);
  }check();});
 }
 function bindPopup(marker,name){
  if(!marker||marker.__ggTrackActionsBound)return;marker.__ggTrackActionsBound=true;
  marker.on('popupclose remove',()=>{if(marker.__ggTrackActionToken===requestId)requestId++;});
  marker.on('popupopen',()=>{const root=marker.getPopup()?.getElement();if(!root||root.__ggTrackActionsBound)return;root.__ggTrackActionsBound=true;
   root.addEventListener('click',event=>{const button=event.target.closest('[data-staff-track-action]');
    if(!button||!root.contains(button)||!marker.isPopupOpen()||marker.getPopup()?.getElement()!==root)return;
    event.preventDefault();event.stopPropagation();const type=button.dataset.staffTrackAction;
    if(type==='close'){requestId++;w.map.closePopup(marker.getPopup());return;}
    if(type!=='view'&&type!=='zoom')return;
    const status=root.querySelector('[data-staff-track-status]');if(status)status.textContent='Loading duty track…';
    const result=action(name,type==='zoom'),token=requestId;marker.__ggTrackActionToken=token;
    Promise.resolve(result).then(value=>{if(token===requestId&&marker.isPopupOpen()&&marker.getPopup()?.getElement()===root&&status)status.textContent=value.message;})
     .catch(()=>{if(token===requestId&&status)status.textContent='Unable to load duty track. Try again.';});
   });
  });
 }
 w.StaffTrackNavigation={view:name=>action(name,false),zoom:name=>action(name,true),bindPopup};
})(window);
