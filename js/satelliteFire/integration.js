/* Historical, presentation-only overlay. No operational service or credential access. */
(function(w,d){'use strict';
 if(w.BTRSatelliteFire||!w.BTRSatelliteModel)return;
 const M=w.BTRSatelliteModel,script=d.currentScript;
 const dataURL=new URL('../../data/satellite-fire/phase7-historical.json',script.src);
 if(dataURL.origin!==w.location.origin)throw Error('SATELLITE_DATA_MUST_BE_SAME_ORIGIN');
 const LABEL='HISTORICAL SATELLITE THERMAL ANOMALIES — NOT CONFIRMED FOREST FIRES';
 const GIS='Forest boundaries and administrative attribution are provisional. The authoritative departmental BTR GIS boundary has not yet been verified.';
 const colors={INSIDE_PROVISIONAL_BTR:'#087f7c',OUTSIDE_PROVISIONAL_BTR:'#607383',BOUNDARY_UNCERTAIN:'#b57900',GEOMETRY_UNAVAILABLE:'#8456a4'};
 let state=null,seenMap=null,seenControl=null,seenAdmin=null,cache=null,pending=null,fetches=0,dead=false;
 const node=(tag,text)=>{const n=d.createElement(tag);if(text!==undefined)n.textContent=String(text);return n;};
 const admin=()=>String(w.userProfile?.role||'').trim().toUpperCase()==='ADMIN';
 function ensureData(){
  if(cache)return Promise.resolve(cache);if(pending)return pending;
  fetches++;pending=w.fetch(dataURL.href,{credentials:'omit',mode:'same-origin'}).then(async r=>{
   if(!r.ok)throw Error('Historical data unavailable');
   const text=await r.text();if(text.length>1000000)throw Error('Historical dataset too large');
   const v=M.validateRecords(JSON.parse(text));
   if(v.quarantine.length)throw Error('Historical dataset failed validation');
   cache=v.observations;return cache;
  }).finally(()=>{pending=null;});return pending;
 }
 function detail(o){
  const box=node('div');box.className='btr-satellite-popup';box.append(node('strong',LABEL),node('p','Laboratory demonstration only. Not for live emergency response.'));
  const dl=node('dl');for(const [key,value]of Object.entries(M.details(o)))dl.append(node('dt',key),node('dd',value));box.append(dl,node('p',GIS));
  const link=node('a','Open coordinates in Google Maps');link.href='https://www.google.com/maps?q='+o.latitude+','+o.longitude;link.target='_blank';link.rel='noopener noreferrer';box.append(link);return box;
 }
 function panel(s){
  if(s.panel)return;s.selected={};const L=w.L;
  const Control=L.Control.extend({options:{position:'bottomleft'},onAdd(){
   const div=L.DomUtil.create('section','btr-satellite-panel');div.setAttribute('data-measurement-ignore','');
   div.setAttribute('aria-label','Historical satellite observations');div.append(node('h2','Satellite Fire · Historical'),node('strong',LABEL),node('p','Laboratory demonstration only. Not for live emergency response.'));
   const disclaimer=node('p',GIS);disclaimer.className='btr-satellite-warning';div.append(disclaimer);
   const limitations=node('details'),title=node('summary','Provisional GIS and interpretation');limitations.append(title,node('p','Division/lower-level displacement ≈703 m is unresolved. Provisional area ≈782.36 km²; stated official area 760.87 km². Area difference alone does not establish boundary error. No confirmed fire incidents are established.'));
   div.append(limitations);s.status=node('p','Loading local historical observations…');s.status.setAttribute('role','status');div.append(s.status);
   s.cards=node('div');s.cards.className='btr-satellite-counts';div.append(s.cards);
   const filters=node('details');filters.append(node('summary','Filters and observation register'));const grid=node('div');grid.className='btr-satellite-filters';s.selects={};
   for(const key of M.fields){const label=node('label',key==='date'?'Acquisition date (UTC)':key),select=node('select');select.setAttribute('aria-label','Satellite '+key);select.dataset.satelliteFilter=key;const all=node('option','All');all.value='';select.append(all);select.addEventListener('change',()=>{s.selected[key]=select.value;render(s);});s.selects[key]=select;label.append(select);grid.append(label);}
   filters.append(grid);
   for(const [label,classification]of [['Show all historical',''],['Inside BTR only','INSIDE_PROVISIONAL_BTR'],['Outside BTR only','OUTSIDE_PROVISIONAL_BTR']]){const button=node('button',label);button.type='button';button.addEventListener('click',()=>{s.selected={boundaryClassification:classification};for(const k of M.fields)s.selects[k].value=s.selected[k]||'';render(s);});filters.append(button);}
   s.table=node('table');const thead=node('thead'),tr=node('tr');for(const [title,key]of [['Time IST','acquiredAt'],['Satellite','satellite'],['FRP (MW)','frpMW'],['Inclusion','boundaryClassification']]){const th=node('th'),b=node('button',title+' ↕');b.type='button';b.addEventListener('click',()=>{s.direction=s.sort===key?-s.direction:1;s.sort=key;render(s);});th.append(b);tr.append(th);}thead.append(tr);s.tbody=node('tbody');s.table.append(thead,s.tbody);const scroll=node('div');scroll.className='btr-satellite-table';scroll.append(s.table);filters.append(scroll);div.append(filters);
   s.groups=node('details');s.groups.append(node('summary','Spatial summaries · observations, not incidents'));s.groupBody=node('div');s.groups.append(s.groupBody);div.append(s.groups);
   const legend=node('p','● Teal: inside provisional BTR · Slate: outside · Amber: boundary uncertain · Purple: geometry unavailable');legend.className='btr-satellite-legend';div.append(legend);
   L.DomEvent.disableClickPropagation(div);L.DomEvent.disableScrollPropagation(div);return div;
  }});
  s.panel=new Control().addTo(s.map);
 }
 function render(s){
  if(s!==state||!admin()||!s.map.hasLayer(s.layer)||!cache)return;
  const rows=M.filter(cache,s.selected);s.layer.clearLayers();s.markers.clear();if(!s.renderer)s.renderer=w.L.svg({padding:.2});
  for(const o of rows){const marker=w.L.circleMarker([o.latitude,o.longitude],{renderer:s.renderer,className:'btr-satellite-observation',bubblingMouseEvents:false,radius:7,weight:2,color:colors[o.boundaryClassification],fillColor:colors[o.boundaryClassification],fillOpacity:.9});marker.bindPopup(()=>detail(o),{maxWidth:300});s.layer.addLayer(marker);marker.getElement()?.setAttribute('data-measurement-ignore','');s.markers.set(o.id,marker);}
  const counts=M.summary(rows);s.cards.replaceChildren();for(const [title,value]of [['Historical observations',counts.total],['Inside provisional BTR',counts.inside],['Outside',counts.outside],['Boundary uncertain',counts.boundaryUncertain],['Attribution uncertain',counts.attributionUncertain],['Geometry unavailable',counts.geometryUnavailable],['Satellites',counts.satellites]])s.cards.append(node('span',title+': '+value));
  s.status.textContent=rows.length?rows.length+' saved historical observations · '+counts.dateRange.join(' through ')+' UTC':'No matching observations. This does not establish absence of fire.';
  s.tbody.replaceChildren();const sorted=[...rows].sort((a,b)=>{const av=M.value(a,s.sort),bv=M.value(b,s.sort);return s.direction*(typeof av==='number'&&typeof bv==='number'?av-bv:String(av??'').localeCompare(String(bv??'')));});
  for(const o of sorted){const tr=node('tr');tr.tabIndex=0;tr.dataset.observationId=o.id;for(const text of [M.ist(o.acquiredAt),o.satellite,M.frp(o.frpMW),o.boundaryClassification])tr.append(node('td',text));const focus=()=>{if(!admin())return sync(true);s.map.setView([o.latitude,o.longitude],Math.max(s.map.getZoom(),13));s.markers.get(o.id)?.openPopup();};tr.addEventListener('click',focus);tr.addEventListener('keydown',e=>{if(e.key==='Enter')focus();});s.tbody.append(tr);}
  s.groupBody.replaceChildren();for(const [key,values]of Object.entries(counts.groups)){s.groupBody.append(node('h3',key));for(const [name,n]of Object.entries(values))s.groupBody.append(node('p',name+': '+n));}s.groupBody.append(node('p','Confirmed fire incidents: unavailable.'));
 }
 async function show(s){
  if(s!==state||!admin()){if(s.map.hasLayer(s.layer))s.map.removeLayer(s.layer);sync(true);return;}
  panel(s);try{await ensureData();if(s!==state||!admin()||!s.map.hasLayer(s.layer))return;
   if(!s.optionsFilled){for(const key of M.fields)for(const value of [...new Set(cache.map(o=>String(M.value(o,key)??'UNAVAILABLE')))].sort()){const option=node('option',value);option.value=value;s.selects[key].append(option);}s.optionsFilled=true;}
   render(s);
  }catch{if(s===state&&s.panel)s.status.textContent='Historical data unavailable or invalid. No live fallback or automatic retry is attempted.';}
 }
 // Live display shares this module's map, lifecycle, safe DOM builder and popup warnings.
 const liveConfig=Object.freeze({endpoint:script.dataset.liveApi||'',clientId:script.dataset.googleClientId||''});
 let identity=null,googleScript=null;
 const ageColor=(time,now=Date.now())=>{const h=(now-Date.parse(time))/3600000;return h<=6?'#d32f2f':h<=24?'#ef6c00':h<=72?'#f9a825':'#757575';};
 const ageText=t=>{const m=Math.max(0,Math.floor((Date.now()-Date.parse(t))/60000));return m<60?m+' min':(m/60).toFixed(1)+' h';};
 function validLive(o){return o&&/^[a-f0-9]{64}$/.test(o.observationId||'')&&o.dataMode==='SHADOW_LIVE'&&o.productionEligible===false&&o.verificationStatus==='UNVERIFIED_SATELLITE_DETECTION'&&Number.isFinite(o.latitude)&&Math.abs(o.latitude)<=90&&Number.isFinite(o.longitude)&&Math.abs(o.longitude)<=180&&Number.isFinite(Date.parse(o.acquisitionTimeUTC))&&Date.parse(o.acquisitionTimeUTC)<=Date.now()+60000&&Number.isFinite(Date.parse(o.receivedAt));}
 function liveDetail(o){const box=node('div');box.className='btr-satellite-popup';box.append(node('strong','UNVERIFIED SATELLITE THERMAL ANOMALY — NOT A CONFIRMED FOREST FIRE'));const dl=node('dl');for(const[k,v]of Object.entries({'Division':o.division,'Range':o.range,'Beat':o.beat,'Compartment':o.compartment,'Latitude':o.latitude,'Longitude':o.longitude,'Satellite':o.satellite,'Observation IST':M.ist(o.acquisitionTimeUTC),'Received IST':M.ist(o.receivedAt),'Confidence':o.confidence,'FRP':Number.isFinite(o.frpMW)?M.frp(o.frpMW):'Unavailable','Age':ageText(o.acquisitionTimeUTC),'Verification':o.verificationStatus,'Provisional inclusion':o.spatialClassification}))dl.append(node('dt',k),node('dd',v??'Unavailable'));box.append(dl,node('p',GIS));const link=node('a','Open coordinates in Google Maps');link.href='https://www.google.com/maps/dir/?api=1&destination='+o.latitude+','+o.longitude;link.target='_blank';link.rel='noopener noreferrer';box.append(link);return box;}
 function endpoint(){if(!liveConfig.endpoint)throw Error('Live read API is not configured; access remains disabled.');const u=new URL(liveConfig.endpoint);if(u.href!=='https://asia-south1-command-centre-86f62.cloudfunctions.net/satelliteFireRead')throw Error('Live API endpoint not approved');return u;}
 function stopLive(s,clear=false){s.authGeneration=(s.authGeneration||0)+1;s.googleBox?.remove();s.googleBox=null;if(s.timer){w.clearInterval(s.timer);s.timer=null;}s.abort?.abort();s.abort=null;s.generation=(s.generation||0)+1;if(clear){s.liveRows.clear();s.liveMarkers.clear();s.liveLayer.clearLayers();s.cursor=null;s.etag=null;s.health=null;}}
 function livePanel(s){if(s.livePanel)return;const Control=w.L.Control.extend({options:{position:'bottomleft'},onAdd(){const div=w.L.DomUtil.create('section','btr-satellite-panel');div.setAttribute('data-measurement-ignore','');div.setAttribute('aria-label','Live satellite observations');div.append(node('h2','Satellite Fire · Live'),node('strong','UNVERIFIED SATELLITE THERMAL ANOMALIES'),node('p',GIS));s.liveStatus=node('p','Authenticated ADMIN access required.');s.liveStatus.setAttribute('role','status');s.liveHealth=node('div');const login=node('button','Sign in with Google · ADMIN');login.type='button';login.addEventListener('click',()=>signIn(s));const logout=node('button','Sign out of live fire');logout.type='button';logout.addEventListener('click',()=>{identity=null;stopLive(s,true);s.liveStatus.textContent='Signed out. Historical observations remain available.';s.liveHealth.replaceChildren();});div.append(s.liveStatus,login,logout,s.liveHealth,node('p','● Red ≤6 h · Orange 6–24 h · Yellow 24–72 h · Grey >72 h. Colours indicate observation age, not severity.'));w.L.DomEvent.disableClickPropagation(div);w.L.DomEvent.disableScrollPropagation(div);return div;}});s.livePanel=new Control().addTo(s.map);}
 async function signIn(s){
  if(identity){if(!s.timer)startLive(s);else drawLive(s);return;}
  if(s.signInLoading)return;s.signInLoading=true;
  try{
   endpoint();if(!/^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(liveConfig.clientId))throw Error('Approved Google OAuth web client is not configured.');
   if(/; wv\)|BTRGuardNative/i.test(navigator.userAgent)||w.Android)throw Error('Google sign-in requires a supported browser. Existing Android duty and historical features are unchanged.');
   if(!w.google?.accounts?.id){
    if(!googleScript)googleScript=new Promise((resolve,reject)=>{const tag=node('script');tag.src='https://accounts.google.com/gsi/client';tag.async=true;tag.onload=resolve;tag.onerror=()=>{googleScript=null;tag.remove();reject(Error('Google sign-in unavailable'));};d.head.append(tag);});
    await googleScript;
   }
   if(s!==state||!s.map.hasLayer(s.liveLayer))return;
   const attempt=s.authGeneration=(s.authGeneration||0)+1;
   s.googleBox?.remove();s.googleBox=node('div');s.liveStatus.after(s.googleBox);
   const googleButton=node('div'),cancel=node('button','Cancel Google sign-in');cancel.type='button';s.googleBox.append(googleButton,cancel);
   cancel.addEventListener('click',()=>{s.authGeneration++;s.googleBox.remove();s.googleBox=null;w.google.accounts.id.cancel?.();s.liveStatus.textContent='Google sign-in cancelled. No live access was granted.';});
   s.liveStatus.textContent='Use the Google button to sign in. Cancelling the popup grants no access.';
   w.google.accounts.id.initialize({client_id:liveConfig.clientId,ux_mode:'popup',auto_select:false,callback:r=>{
    if(s!==state||!s.map.hasLayer(s.liveLayer)||attempt!==s.authGeneration||typeof r.credential!=='string'||!r.credential)return;
    identity={token:r.credential};s.googleBox?.remove();s.googleBox=null;stopLive(s,true);s.liveStatus.textContent='Checking Live Fire ADMIN authorization…';startLive(s);
   }});
   w.google.accounts.id.renderButton(googleButton,{type:'standard',theme:'outline',size:'large',text:'signin_with',width:240});
  }catch(e){if(s===state&&s.livePanel)s.liveStatus.textContent=e.message;}finally{s.signInLoading=false;}
 }
 function drawLive(s){for(const[id,o]of s.liveRows){const color=ageColor(o.acquisitionTimeUTC);let marker=s.liveMarkers.get(id);if(!marker){marker=w.L.circleMarker([o.latitude,o.longitude],{radius:8,color,fillColor:color,fillOpacity:.9,weight:2,bubblingMouseEvents:false,className:'btr-satellite-observation'});marker.bindPopup(()=>liveDetail(s.liveRows.get(id)),{maxWidth:300});s.liveLayer.addLayer(marker);s.liveMarkers.set(id,marker);}else marker.setStyle({color,fillColor:color});}if(s.health){const h=s.health;s.liveHealth.replaceChildren();for(const[k,v]of Object.entries({'Last successful acquisition':h.lastSuccessfulAcquisition?M.ist(h.lastSuccessfulAcquisition):'Unavailable','Latest observation':h.latestObservationTime?M.ist(h.latestObservationTime):'None reported','Total live detections':h.total,'Acquisition health':h.sources.map(x=>x.product+': '+x.status).join(' · '),'Trial':Date.now()>=h.trial.expiry?'EXPIRED':h.trial.status,'Trial expiry IST':M.ist(h.trial.expiry)}))s.liveHealth.append(node('p',k+': '+v));s.liveHealth.append(node('p',(h.stale||h.sources.some(x=>!x.lastSuccessMs||Date.now()-x.lastSuccessMs>5400000))?'STALE DATA — acquisition may be delayed or unavailable.':'Source acquisition is recent. This does not verify the presence or absence of forest fires.'));}}
 async function pollLive(s){if(s!==state||!s.map.hasLayer(s.liveLayer)||!identity||s.inFlight)return;drawLive(s);if(navigator.onLine===false){s.liveStatus.textContent='Offline — showing last received observations; data may be stale.';return;}s.inFlight=true;const gen=s.generation,abort=new AbortController();s.abort=abort;const timeout=w.setTimeout(()=>abort.abort(),15000);try{const u=endpoint();if(s.cursor)u.searchParams.set('cursor',s.cursor);const headers={Authorization:'Bearer '+identity.token};if(s.etag)headers['If-None-Match']=s.etag;const r=await w.fetch(u.href,{headers,signal:abort.signal,credentials:'omit',cache:'no-store',redirect:'error'});if(gen!==s.generation||s!==state)return;if(r.status===401||r.status===403){identity=null;stopLive(s,true);s.liveStatus.textContent='Live access denied or sign-in expired. Sign in as an approved ADMIN.';return;}if(r.status!==304){if(!r.ok)throw Error('Live read unavailable. Existing data may be stale.');const text=await r.text();if(text.length>1000000)throw Error('Live response exceeds safe size');if(gen!==s.generation||s!==state||!identity)return;const data=JSON.parse(text);if(!Array.isArray(data.observations)||!data.trial||!Array.isArray(data.sources)||!Number.isFinite(data.trial.expiry))throw Error('Invalid live response');for(const o of data.observations){if(!validLive(o))throw Error('Invalid live observation');s.liveRows.set(o.observationId,Object.freeze(o));}s.cursor=data.cursor;s.etag=r.headers.get('ETag');s.health=data;s.liveStatus.textContent=data.total===0?'No satellite thermal anomalies reported.':data.hasMore?'Loading additional observations on the next refresh…':s.liveRows.size+' live satellite observations · unverified thermal anomalies';}else if(s.health){s.health.hasMore=false;s.liveStatus.textContent=s.health.total===0?'No satellite thermal anomalies reported.':s.liveRows.size+' live satellite observations · unverified thermal anomalies';}drawLive(s);}catch(e){if(s===state&&s.livePanel&&gen===s.generation)s.liveStatus.textContent=e.name==='AbortError'?'Live read timed out. Last received data may be stale.':e.message;}finally{w.clearTimeout(timeout);s.inFlight=false;if(s.abort===abort)s.abort=null;}}
 function startLive(s){livePanel(s);if(!identity)return;if(!s.timer)s.timer=w.setInterval(()=>pollLive(s),60000);pollLive(s);}
 function liveEvent(){const s=state;if(s&&s.map.hasLayer(s.liveLayer)&&!d.hidden)pollLive(s);}

 function cleanup(){
  if(!state)return;const s=state;stopLive(s,true);if(s.livePanel)s.livePanel.remove();s.control.removeLayer(s.liveLayer);if(s.map.hasLayer(s.liveLayer))s.map.removeLayer(s.liveLayer);state=null;s.map.off('layeradd',s.add);s.map.off('layerremove',s.remove);if(s.map.hasLayer(s.layer))s.map.removeLayer(s.layer);s.layer.clearLayers();if(s.renderer&&s.map.hasLayer(s.renderer))s.map.removeLayer(s.renderer);if(s.panel)s.panel.remove();s.control.removeLayer(s.layer);
 }
 function sync(force=false){
  if(dead)return;const map=w.map,control=w.layerControl,allowed=admin();
  if(!force&&map===seenMap&&control===seenControl&&allowed===seenAdmin)return;
  seenMap=map;seenControl=control;seenAdmin=allowed;if(!allowed)identity=null;
  if(state&&state.map===map&&state.control===control&&allowed)return;
  cleanup();if(!allowed||!map||!control||!w.L||typeof control.addOverlay!=='function')return;
  const s=state={map,control,layer:w.L.layerGroup(),panel:null,markers:new Map(),selected:{},sort:'acquiredAt',direction:1,optionsFilled:false,liveLayer:w.L.layerGroup(),liveRows:new Map(),liveMarkers:new Map(),livePanel:null,timer:null,inFlight:false,generation:0,cursor:null,etag:null,health:null};
  s.add=e=>{if(e.layer===s.layer)show(s);if(e.layer===s.liveLayer)startLive(s);};
  s.remove=e=>{if(e.layer===s.liveLayer){stopLive(s);if(s.livePanel){s.livePanel.remove();s.livePanel=null;}}if(e.layer===s.layer){if(s.panel){s.panel.remove();s.panel=null;s.optionsFilled=false;}s.layer.clearLayers();s.markers.clear();if(s.renderer&&s.map.hasLayer(s.renderer))s.map.removeLayer(s.renderer);}};
  map.on('layeradd',s.add);map.on('layerremove',s.remove);control.addOverlay(s.layer,'Satellite Fire (historical)');control.addOverlay(s.liveLayer,'Satellite Fire (live · authenticated ADMIN)');
  // Intentionally no addTo(map), camera change, data fetch, timer or operational subscription at startup.
 }
 w.addEventListener('online',liveEvent);d.addEventListener('visibilitychange',liveEvent);
 const observer=new MutationObserver(()=>sync());
 if(d.body)observer.observe(d.body,{childList:true,subtree:true});
 for(const event of ['userProfileLoaded','storage','pageshow'])w.addEventListener(event,syncEvent);
 function syncEvent(){sync(true);}
 function visibility(){if(!d.hidden)sync(true);}d.addEventListener('visibilitychange',visibility);
 w.BTRSatelliteFire=Object.freeze({sync:syncEvent,inspect:()=>Object.freeze({registered:!!state,enabled:!!state?.map.hasLayer(state.layer),markers:state?.markers.size||0,fetches,cached:cache?.length||0,admin:admin(),productionEligible:false,automaticRequests:!!state?.timer,liveEnabled:!!state?.map.hasLayer(state.liveLayer),liveMarkers:state?.liveMarkers.size||0,liveTimer:!!state?.timer,liveRequestPending:!!state?.inFlight,liveAuthenticated:!!identity}),destroy(){if(dead)return;dead=true;identity=null;w.removeEventListener('online',liveEvent);d.removeEventListener('visibilitychange',liveEvent);observer.disconnect();for(const event of ['userProfileLoaded','storage','pageshow'])w.removeEventListener(event,syncEvent);d.removeEventListener('visibilitychange',visibility);cleanup();}});
 sync();
})(window,document);
