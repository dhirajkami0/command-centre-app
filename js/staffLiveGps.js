/* UI-only GPS bridge over the existing shared history feed; no Firestore operations. */
(function(w){
 'use strict';
 const entries=new Map();
 const scope=()=>JSON.stringify([w.userProfile?.cleanName||w.userProfile?.name||'',w.userProfile?.role||'',w.userProfile?.division||'',w.userProfile?.range||'']);
 const owner=(id,key)=>{const s=w.visibleStaffCache?.[key];return s?.dutyActive===true&&String(s.sessionId||'').trim()===id?s:null;};
 function release(id){entries.delete(id);}
 function ensure(id,staff){
  id=String(id||'').trim();const key=w.cleanName(staff?.cleanName||staff?.name||'');
  if(!id||!owner(id,key)||!w.db||!w.StaffRendering)return false;
  entries.set(id,{id,key,scope:scope(),db:w.db});return true;
 }
 function reconcile(){for(const [id,e]of entries){if(!owner(id,e.key)||e.scope!==scope()||e.db!==w.db)release(id);}}
 const latest=id=>{const e=entries.get(id);return e&&e.scope===scope()&&e.db===w.db&&owner(id,e.key)?w.StaffRendering.latest(id):null;};

 // UI-only copy: never mutate canonical profiles or historical analytics inputs.
 function displayProfile(profile){
  if(!profile||typeof profile!=='object')return profile;
  const key=w.cleanName(profile.identity?.cleanName||profile.cleanName||'');
  const staff=w.visibleStaffCache?.[key],point=staff&&latest(String(staff.sessionId||'').trim());
  const clean=value=>value==null||value==='undefined'||value==='null'?null:value;
  const gps=Object.fromEntries(Object.entries(profile.gps||{}).map(([k,v])=>[k,clean(v)]));
  for(const field of ['accuracy','speed','heading','turnAngle','turnRate','lastSeen','timestamp','updatedAt'])gps[field]=clean(gps[field]);
  const location={...profile.location};
  location.lat=clean(location.lat);location.lon=clean(location.lon);
  if(point){
   const time=w.StaffRendering.pointTime(point),lat=Number(point.lat),lon=Number(point.lon??point.lng);
   location.lat=lat;location.lon=lon;
   Object.assign(gps,{lat,lon,latitude:lat,longitude:lon,timestamp:time,lastSeen:time,updatedAt:time});
   for(const field of ['accuracy','speed','heading'])gps[field]=clean(point[field]);
  }
  return {...profile,location,gps};
 }
 w.StaffLiveGps={ensure,release,reconcile,latest,displayProfile,report:()=>({owned:entries.size,active:0,source:"shared-history-cache"})};
})(window);
