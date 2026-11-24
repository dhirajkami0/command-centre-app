/* Adapted unchanged Phase 8 validation/display functions; no transport. */
(function(w){'use strict';
const CLASSES=['INSIDE_PROVISIONAL_BTR','OUTSIDE_PROVISIONAL_BTR','BOUNDARY_UNCERTAIN','GEOMETRY_UNAVAILABLE'];
function validateRecords(input) {
 if(!input||input.productionEligible!==false||!Array.isArray(input.observations))throw Error('INVALID_HISTORICAL_DOCUMENT');
 const observations=[],quarantine=[],ids=new Set();
 for(const [index,o] of input.observations.entries()){
  let reason=null;
  if(!o||typeof o!=='object')reason='INVALID_RECORD';
  else if(!/^[a-f0-9]{64}$/.test(o.id||''))reason='INVALID_ID';
  else if(!Number.isFinite(o.latitude)||!Number.isFinite(o.longitude)||Math.abs(o.latitude)>90||Math.abs(o.longitude)>180)reason='INVALID_COORDINATES';
  else if(!/^\d{4}-\d{2}-\d{2}T/.test(o.acquiredAt||'')||(!Number.isFinite(Date.parse(o.acquiredAt))||new Date(o.acquiredAt).toISOString()!==o.acquiredAt))reason='INVALID_TIME';
  else if(o.productionEligible!==false||o.synthetic!==false||o.freshness!=='HISTORICAL_OBSERVATION')reason='NOT_REAL_NON_OPERATIONAL_HISTORY';
  else if(!CLASSES.includes(o.boundaryClassification)||(!o.attribution||typeof o.attribution!=='object')||typeof o.satellite!=='string'||typeof o.product!=='string')reason='INVALID_CLASSIFICATION';
  else if(o.frpMW!==null&&o.frpMW!==undefined&&(!Number.isFinite(o.frpMW)||o.frpMW<0))reason='INVALID_FRP';
  else if(!/^[a-f0-9]{64}$/.test(o.sourceFileSha256||'')||!/^[a-f0-9]{64}$/.test(o.geometryHash||''))reason='INVALID_PROVENANCE';
  else if(ids.has(o.id))reason='DUPLICATE_ID';
  if(reason)quarantine.push({index,reason});else{ids.add(o.id);observations.push(structuredClone(o));}
 }
 return {observations,quarantine};
}

const fields=['satellite','product','date','division','range','beat','compartment','boundaryClassification','confidence','daynight'];
function value(o,key){if(key==='date')return o.acquiredAt.slice(0,10);if(['division','range','beat','compartment'].includes(key))return o.boundaryClassification==='INSIDE_PROVISIONAL_BTR'?o.attribution[key]:null;return o[key];}
function filter(rows,selection){return rows.filter(o=>fields.every(k=>!selection[k]||String(value(o,k)??'UNAVAILABLE')===selection[k]));}
function summary(rows){
 const count=c=>rows.filter(o=>o.boundaryClassification===c).length;
 const group=k=>{const out={};for(const o of rows){const v=value(o,k);if(v!==null&&v!==undefined)out[v]=(out[v]||0)+1;}return out;};
 return {total:rows.length,inside:count('INSIDE_PROVISIONAL_BTR'),outside:count('OUTSIDE_PROVISIONAL_BTR'),boundaryUncertain:count('BOUNDARY_UNCERTAIN'),geometryUnavailable:count('GEOMETRY_UNAVAILABLE'),attributionUncertain:rows.filter(o=>o.attribution.state!=='ATTRIBUTED').length,satellites:new Set(rows.map(o=>o.satellite)).size,dateRange:[...new Set(rows.map(o=>value(o,'date')))].sort(),confirmedFireIncidents:null,groups:Object.fromEntries(['division','range','beat','compartment','satellite','date'].map(k=>[k,group(k)]))};
}
function ist(time){return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}).format(new Date(time))+' IST';}
function frp(v){return v===null||v===undefined?'Unavailable':v.toFixed(2)+' MW';}
function details(o){return {'Label':'Historical thermal anomaly','Observation ID':o.id,'Brightness temperature (K)':JSON.stringify(o.brightnessTemperatureKelvin??null),'Scan (km)':o.scanKm??'Unavailable','Track (km)':o.trackKm??'Unavailable','Satellite':o.satellite,'NASA product':o.product,'Acquired IST':ist(o.acquiredAt),'Acquired UTC':o.acquiredAt,'Latitude':o.latitude,'Longitude':o.longitude,'FRP':frp(o.frpMW),'Confidence':o.confidence??'Unavailable','Day/night':o.daynight??'Unavailable','BTR inclusion':o.boundaryClassification,'Division':value(o,'division')??'Unavailable','Range':value(o,'range')??'Unavailable','Beat':value(o,'beat')??'Unavailable','Compartment':value(o,'compartment')??'Unavailable','Attribution':o.attribution.state,'Warnings':JSON.stringify(o.dataQualityWarnings||[]),'Candidates':JSON.stringify(o.attribution.candidates||[]),'Verification':o.verificationStatus,'Source SHA-256':o.sourceFileSha256,'Geometry SHA-256':o.geometryHash};}

w.BTRSatelliteModel=Object.freeze({CLASSES,validateRecords,fields,value,filter,summary,ist,frp,details});
})(window);
