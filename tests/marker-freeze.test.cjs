const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const acorn = require('acorn');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html'), assignments = new Map();
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  if (!match[2].trim() || /application\/(?:ld\+)?json/.test(match[1])) continue;
  const ast = acorn.parse(match[2], {ecmaVersion:'latest', sourceType:/type\s*=\s*['"]module['"]/.test(match[1])?'module':'script'});
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'AssignmentExpression' && node.left.object?.name === 'window')
      assignments.set(node.left.property.name, match[2].slice(node.start, node.end));
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(ast);
}
function movement(name = 'SYNTHETIC STAFF') {
  const now = 1791860000000, id = name + '_' + (now - 10000), created = [];
  function Popup(options) { this.options = options; }
  Popup.extend = () => Popup;
  Popup.prototype.setContent = function(value) { this.content = value; return this; };
  const c = {Date:class extends Date {static now(){return now;}}, console,
    userProfile:{cleanName:'SYNTHETIC ADMIN',role:'ADMIN'}, db:{},
    cleanName:value=>String(value || '').trim().toUpperCase(),
    document:{readyState:'loading',addEventListener(){}},addEventListener(){},
    clearInterval(){},setInterval(){throw Error('Closed markers must not start a timer');},
    staffMarkers:{},staffLayer:{},visibleStaffCache:{},liveStaffCache:{},patrolSessionStaff:{},sessionPointCache:{},
    StaffTrackNavigation:{bindPopup(){}},
    L:{Popup,divIcon:options=>({options}),marker:(coordinates,options)=>{
      const marker = {coordinates,options,moves:0,getLatLng(){return {lat:this.coordinates[0],lng:this.coordinates[1]};},
        setLatLng(value){this.coordinates=value;this.moves++;return this;},setIcon(icon){this.options.icon=icon;},
        bindPopup(popup){this.popup=popup;return this;},getPopup(){return this.popup;},isPopupOpen(){return false;},
        addTo(layer){this.layer=layer;return this;},on(){return this;},remove(){this.removed=true;},
        bindTooltip(){return this;},unbindTooltip(){},getElement(){return null;}};
      created.push(marker);return marker;
    }}
  };
  c.window=c;vm.createContext(c);
  for(const file of ['js/staffPopup.js','js/tigerTeams.js','js/staffRendering.js'])vm.runInContext(read(file),c);
  vm.runInContext(html.slice(html.indexOf('window.getLiveStaffPointForSession ='),html.indexOf('function loadStaff(){')),c);
  for(const name of ['getLatestPatrolPointForSession','ensureLiveStaffMarker','updateLiveMarkerFromPatrolPoint'])
    vm.runInContext(assignments.get(name),c);
  c.getPointTime = point => c.StaffRendering.pointTime(point);
  const staff = {cleanName:name,name,dutyActive:true,sessionId:id};
  c.visibleStaffCache[name]=staff;c.liveStaffCache[name]=staff;c.patrolSessionStaff[id]=staff;c.sessionPointCache[id]={};
  const live=(time,lat)=>c.applyLiveStaffGps({...staff,gpsTime:time,lat,lon:89},name);
  const patrol=(pid,time,lat,session=id)=>{
    const cache=c.sessionPointCache[id],existed=pid in cache;
    cache[pid]={id:pid,sessionId:session,time,lat,lon:89};
    c.StaffRendering.changed(id,pid,cache[pid],existed,false);
    c.updateLiveMarkerFromPatrolPoint(staff,null,id);
  };
  return {c,staff,id,now,created,live,patrol,marker:()=>c.staffMarkers[name]};
}
test('live coordinates create the existing marker without any patrol points or Firestore API',()=>{
  const h=movement();assert(h.live(h.now,26));assert.equal(h.created.length,1);
  assert.equal(h.marker().coordinates[0],26);assert.equal(h.marker().layer,h.c.staffLayer);
  assert.equal(Object.keys(h.c.sessionPointCache[h.id]).length,0);
});
test('newer patrol and live fixes move the same marker; older or equal conflicting fixes cannot rewind it',()=>{
  const h=movement();h.live(h.now,26);const marker=h.marker();
  h.patrol('new',h.now+1000,27);assert.equal(marker.coordinates[0],27);
  assert.equal(h.live(h.now+1000,28),false,'Live/patrol equal-time coordinate conflict is rejected');
  h.patrol('old',h.now-1000,25);assert.equal(marker.coordinates[0],27);
  h.patrol('new',h.now-2000,24);assert.equal(marker.coordinates[0],27,'Modified history cannot rewind accepted position');
  h.live(h.now+500,25);assert.equal(marker.coordinates[0],27,'Live cache behind accepted patrol position cannot rewind UI');
  assert(h.live(h.now+2000,28));assert.equal(marker.coordinates[0],28);
  assert.equal(h.live(h.now+2000,29),false);assert.equal(marker.coordinates[0],28);
  h.patrol('tie',h.now+2000,30);assert.equal(marker.coordinates[0],28);
  assert.equal(h.marker(),marker);assert.equal(h.created.length,1);
});
test('patrol GPS works when live GPS is absent',()=>{
  const h=movement();h.patrol('first',h.now,27);assert.equal(h.marker().coordinates[0],27);
});
test('future live and patrol timestamps do not poison selection; ordinary clock skew is accepted',()=>{
  const h=movement();assert.equal(h.live(h.now+86400000,40),false);h.patrol('future',h.now+86400000,41);
  assert.equal(h.marker(),undefined);assert(h.live(h.now,26));h.patrol('valid',h.now+1000,27);
  assert.equal(h.marker().coordinates[0],27);assert(h.live(h.now+30000,28));assert.equal(h.marker().coordinates[0],28);
  h.staff.__liveGpsPoint={sessionId:h.id,time:h.now+86400000,lat:40,lon:89};
  assert(h.live(h.now+31000,29),'Previously poisoned live cache can recover');
  assert.equal(h.marker().coordinates[0],29);
});
test('history removal retains the last accepted UI position and never fabricates history',()=>{
  const h=movement();h.patrol('new',h.now,27);const marker=h.marker();delete h.c.sessionPointCache[h.id].new;
  h.c.StaffRendering.changed(h.id,'new',null,true,true);h.c.updateLiveMarkerFromPatrolPoint(h.staff,null,h.id);
  assert.equal(h.marker(),marker);assert.equal(marker.coordinates[0],27);
  assert.equal(Object.keys(h.c.sessionPointCache[h.id]).length,0);
});
test('old-session points and callbacks cannot move a new-session marker',()=>{
  const h=movement();h.live(h.now,26);const old={...h.staff};
  h.c.StaffRendering.release(h.id);h.marker().remove();delete h.c.staffMarkers[h.staff.cleanName];
  h.staff.sessionId=h.staff.cleanName+'_'+(h.now-5000);
  assert(h.live(h.now+2000,28));const marker=h.marker();h.patrol('late',h.now+3000,30);
  h.c.updateLiveMarkerFromPatrolPoint(old,null,h.id);
  assert.equal(h.c.StaffRendering.latest(h.id),null);assert.equal(h.marker(),marker);assert.equal(marker.coordinates[0],28);
});
for(const type of ['SBMT','STPF','RRT'])test(type+' uses the same marker and preserves team icon/filtering',()=>{
  const name=read('js/tigerTeams.js').match(new RegExp('"([^"]+)": \\{\\s*"type": "'+type+'"'))[1];
  const h=movement(name);h.live(h.now,26);const marker=h.marker(),icon=marker.options.icon;
  h.patrol('new',h.now+1000,27);assert.equal(h.marker(),marker);assert.equal(marker.options.icon,icon);
  assert.equal(marker.__tigerTeamType,type);assert.equal(marker.coordinates[0],27);
  h.c.userProfile={cleanName:'UNAUTHORIZED',role:'STAFF'};h.c.StaffRendering.refresh(marker);
  assert.equal(h.marker(),undefined);assert(marker.removed);
});
function recovery(syncFailure=false) {
  let now=0,next=0,active=0,maxActive=0;const timers=new Map(),subscriptions=[];
  const c={console,URLSearchParams,Date:class extends Date {static now(){return now;}},
    userProfile:{cleanName:'SYNTHETIC',role:'ADMIN'},db:{},location:{search:''},navigator:{onLine:true},
    document:{getElementById(){return null;}},addEventListener(){},
    setTimeout(fn,delay){timers.set(++next,{fn,at:now+delay});return next;},clearTimeout(id){timers.delete(id);},
    fb:{onSnapshot(query,snapshot,error){let open=true;active++;maxActive=Math.max(maxActive,active);
      const subscription={query,snapshot,error};subscriptions.push(subscription);
      if(syncFailure)error({code:'unavailable'});
      return()=>{if(open){open=false;active--;}};}}};
  c.window=c;vm.createContext(c);vm.runInContext(read('js/firestoreRecovery.js'),c);
  const tick=ms=>{now+=ms;for(const[id,timer]of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}};
  return {c,r:c.FirestoreRecovery,subscriptions,timers,tick,active:()=>active,maxActive:()=>maxActive};
}
test('automatic retry reuses query, rejects stale callbacks, and never duplicates subscriptions',()=>{
  const h=recovery(),query={synthetic:true};let delivered=0;
  const stop=h.r.listenStaff(query,()=>delivered++);const first=h.subscriptions[0];
  first.error({code:'unavailable'});assert.equal(h.active(),0);h.tick(14999);assert.equal(h.subscriptions.length,1);
  h.tick(1);assert.equal(h.subscriptions.length,2);assert.equal(h.subscriptions[1].query,query);
  h.r.listenStaff(query,()=>{throw Error('Duplicate callback');});assert.equal(h.subscriptions.length,2);
  first.snapshot({metadata:{fromCache:false}});assert.equal(delivered,0);
  first.error({code:'permission-denied'});assert.equal(h.active(),1);
  h.subscriptions[1].snapshot({metadata:{fromCache:false}});assert.equal(delivered,1);
  stop();assert.equal(h.active(),0);h.tick(999999);assert.equal(h.subscriptions.length,2);assert.equal(h.maxActive(),1);
});
test('explicit stop or returned unsubscribe cancels retry after a failure',()=>{
  for(const method of ['stop','unsubscribe']){const h=recovery(),unsubscribe=h.r.listenStaff({},()=>{});
    h.subscriptions[0].error({code:'unavailable'});const timer=[...h.timers.values()][0];
    method==='stop'?h.r.stop():unsubscribe();h.tick(999999);timer.fn();
    assert.equal(h.subscriptions.length,1);assert.equal(h.active(),0);assert.equal(h.timers.size,0);}
});
test('retry is bounded; permission denial and scope/database changes prevent automatic reuse',()=>{
  const h=recovery();h.r.listenStaff({},()=>{});
  for(const delay of [15000,30000,999999]){h.subscriptions.at(-1).error({code:'unavailable'});h.tick(delay);}
  assert.equal(h.subscriptions.length,3);assert.equal(h.timers.size,0);assert.equal(h.r.report().failures,3);
  for(const change of ['permission','scope','db']){const x=recovery();x.r.listenStaff({},()=>{});
    x.subscriptions[0].error({code:change==='permission'?'permission-denied':'unavailable'});
    if(change==='scope')x.c.userProfile.range='DIFFERENT';if(change==='db')x.c.db={};
    x.tick(999999);assert.equal(x.subscriptions.length,1);assert.equal(x.active(),0);}
});
test('synchronous SDK failures do not resurrect a subscription or cause retry storms',()=>{
  const h=recovery(true),stop=h.r.listenStaff({},()=>{});assert.equal(h.active(),0);
  h.tick(15000);h.tick(30000);h.tick(999999);assert.equal(h.subscriptions.length,3);assert.equal(h.maxActive(),1);
  assert.equal(h.active(),0);stop();assert.equal(h.timers.size,0);
});
test('index change is restricted to GPS timestamp guards; End Duty and published presentation stay intact',()=>{
  const baseline=file=>execFileSync('git',['show','cbccea4a:'+file],{cwd:root,encoding:'utf8',maxBuffer:30e6});
  const mask=source=>source.replace(/window\.applyLiveStaffGps = function\(raw,key\)\{[\s\S]*?\n\};/,'GPS_GUARDS');
  assert.equal(mask(html).replace(/\r\n/g,'\n'),mask(baseline('index.html')).replace(/\r\n/g,'\n'));
  for(const file of ['js/tigerTeams.js','css/tigerTeams.css','js/staffPopup.js','js/staffTrackNavigation.js','js/staffLiveGps.js'])
    assert.equal(read(file).replace(/\r\n/g,'\n'),baseline(file).replace(/\r\n/g,'\n'));
});
