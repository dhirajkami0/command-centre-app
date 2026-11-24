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
 function cleanup(){
  if(!state)return;const s=state;state=null;s.map.off('layeradd',s.add);s.map.off('layerremove',s.remove);if(s.map.hasLayer(s.layer))s.map.removeLayer(s.layer);s.layer.clearLayers();if(s.renderer&&s.map.hasLayer(s.renderer))s.map.removeLayer(s.renderer);if(s.panel)s.panel.remove();s.control.removeLayer(s.layer);
 }
 function sync(force=false){
  if(dead)return;const map=w.map,control=w.layerControl,allowed=admin();
  if(!force&&map===seenMap&&control===seenControl&&allowed===seenAdmin)return;
  seenMap=map;seenControl=control;seenAdmin=allowed;
  if(state&&state.map===map&&state.control===control&&allowed)return;
  cleanup();if(!allowed||!map||!control||!w.L||typeof control.addOverlay!=='function')return;
  const s=state={map,control,layer:w.L.layerGroup(),panel:null,markers:new Map(),selected:{},sort:'acquiredAt',direction:1,optionsFilled:false};
  s.add=e=>{if(e.layer===s.layer)show(s);};
  s.remove=e=>{if(e.layer===s.layer){if(s.panel){s.panel.remove();s.panel=null;s.optionsFilled=false;}s.layer.clearLayers();s.markers.clear();if(s.renderer&&s.map.hasLayer(s.renderer))s.map.removeLayer(s.renderer);}};
  map.on('layeradd',s.add);map.on('layerremove',s.remove);control.addOverlay(s.layer,'Satellite Fire (historical)');
  // Intentionally no addTo(map), camera change, data fetch, timer or operational subscription at startup.
 }
 const observer=new MutationObserver(()=>sync());
 if(d.body)observer.observe(d.body,{childList:true,subtree:true});
 for(const event of ['userProfileLoaded','storage','pageshow'])w.addEventListener(event,syncEvent);
 function syncEvent(){sync(true);}
 function visibility(){if(!d.hidden)sync(true);}d.addEventListener('visibilitychange',visibility);
 w.BTRSatelliteFire=Object.freeze({sync:syncEvent,inspect:()=>Object.freeze({registered:!!state,enabled:!!state?.map.hasLayer(state.layer),markers:state?.markers.size||0,fetches,cached:cache?.length||0,admin:admin(),productionEligible:false,automaticRequests:false}),destroy(){if(dead)return;dead=true;observer.disconnect();for(const event of ['userProfileLoaded','storage','pageshow'])w.removeEventListener(event,syncEvent);d.removeEventListener('visibilitychange',visibility);cleanup();}});
 sync();
})(window,document);
