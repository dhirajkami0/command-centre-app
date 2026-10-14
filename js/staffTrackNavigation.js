/* Popup actions reuse the existing session listener, cache and individual track renderer. */
(function(w){
 'use strict';let requestId=0;
 const canonical=name=>w.cleanName(String(name||''));
 function profile(name){const key=canonical(name),s=w.visibleStaffCache?.[key],sessionId=String(s?.sessionId||'').trim();return s?.dutyActive===true&&sessionId&&canonical(s.cleanName || s.name || key)===key?{key,sessionId,staff:s}:null;}
 function isVisible(name){const p=profile(name),t=p&&w.staffTracks?.[p.key];return !!t&&t.__ggStaffTrackSessionId===p.sessionId&&w.staffLayer.hasLayer(t)&&!t.__ggTrackHidden;}
 function sync(name){const marker=w.staffMarkers?.[canonical(name)],root=marker?.getPopup?.()?.getElement?.();const button=root?.querySelector?.('[data-staff-track-action="view"]');if(button){button.textContent=isVisible(name)?'Hide Track':'View Track';button.setAttribute('aria-pressed',String(isVisible(name)));}}
 function hide(name){requestId++;const p=profile(name),t=p&&w.staffTracks?.[p.key];if(!t||t.__ggStaffTrackSessionId!==p.sessionId)return{ok:false,message:'No displayed duty track.'};t.__ggTrackHidden=true;w.staffLayer.removeLayer(t);if(canonical(w.staffTrackState?.selectedStaff)===p.key)w.staffTrackState.selectedStaff=null;sync(name);return{ok:true,track:t,message:'Track hidden. GPS recording continues.'};}
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
 w.StaffTrackNavigation={view:name=>action(name,false),zoom:name=>action(name,true),hide,isVisible,sync,bindPopup};
})(window);
