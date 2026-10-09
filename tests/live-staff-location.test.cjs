const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');
const c={console,Date,setTimeout,clearTimeout,setInterval,clearInterval,cleanName:x=>String(x||'').trim().toLowerCase(),document:{readyState:'loading',addEventListener(){}},addEventListener(){},visibleStaffCache:{},liveStaffCache:{},patrolSessionStaff:{},staffLayer:{},StaffLiveGps:{ensure(){}}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('js/staffRendering.js','utf8'),c);
const start=html.indexOf('window.getLiveStaffPointForSession =');const end=html.indexOf('function loadStaff(){',start);assert(start>=0&&end>start);vm.runInContext(html.slice(start,end),c);
let moved=0;c.updateLiveMarkerFromPatrolPoint=()=>moved++;
for(const count of [45,200]){
 c.visibleStaffCache={};c.liveStaffCache={};c.patrolSessionStaff={};moved=0;
 for(let i=0;i<count;i++){const key='synthetic '+i,id=key+'_1791478486362';const s={cleanName:key,dutyActive:true,sessionId:id};c.visibleStaffCache[key]=s;
 assert(c.applyLiveStaffGps({...s,lat:26,lon:89,gpsTime:1791478487362},key));assert.equal(c.StaffRendering.latest(id).lat,26);
 assert(!c.applyLiveStaffGps({...s,lat:27,lon:90,gpsTime:1791478487361},key));assert(!c.applyLiveStaffGps({...s,sessionId:'old',lat:27,lon:90,gpsTime:1791478488362},key));
 assert(!c.applyLiveStaffGps({...s,lat:27,lon:90,gpsTime:1791478486361},key));assert(!c.applyLiveStaffGps({...s,lat:NaN,lon:90,gpsTime:1791478488362},key));
 assert(c.applyLiveStaffGps({...s,lat:26.1,lon:89.1,gpsTime:1791478488362},key));assert.equal(c.StaffRendering.latest(id).lat,26.1);
 s.dutyActive=false;assert.equal(c.StaffRendering.latest(id),null);assert(!c.applyLiveStaffGps({...s,dutyActive:true,lat:26,lon:89,gpsTime:1791478489362},key));}
 assert.equal(moved,count*2);
}
const acorn=require('acorn');let scripts=0;for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){if(/\bsrc\s*=/.test(match[1])||!match[2].trim())continue;acorn.parse(match[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*["']module/.test(match[1])?'module':'script',allowReturnOutsideFunction:true});scripts++;}acorn.parse(fs.readFileSync('js/staffRendering.js','utf8'),{ecmaVersion:'latest'});
console.log('PASS 45/200 GPS consumers, movement, stale/session/duty/invalid guards, shared popup GPS; '+scripts+' inline scripts and helper parse. No Firestore API supplied.');
