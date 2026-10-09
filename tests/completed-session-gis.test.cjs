// Offline production-function tests. No app startup or external operations.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const vm = require('node:vm'), {execFileSync} = require('node:child_process'), acorn = require('acorn');
const root = path.join(__dirname, '..');
const baseline = execFileSync('git', ['show','5b4a484:index.html'], {cwd:root,encoding:'utf8',maxBuffer:20e6});
const current = fs.readFileSync(path.join(root,'index.html'),'utf8');
function functions(html){
  const result = new Map();
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(!m[2].trim() || /application\/(?:ld\+)?json/.test(m[1])) continue;
    const ast = acorn.parse(m[2], {ecmaVersion:'latest',sourceType:/type\s*=\s*["']module["']/.test(m[1])?'module':'script'});
    for(const n of ast.body) if(n.type === 'FunctionDeclaration') result.set(n.id.name,m[2].slice(n.start,n.end));
  }
  return result;
}
const original = functions(baseline), revised = functions(current);
const plain = value => JSON.parse(JSON.stringify(value)), report = name => console.log('PASS '+name);
const quiet = logs => Object.fromEntries(['log','warn','error','info','table','group','groupEnd'].map(name=>[name,(...args)=>logs.push([name,...args])]));
function harness(gridCount=2, cellCount=4, options={}){
  let records=[],spatialCalls=0,closes=0,captured,kmlPoints;
  const logs=[],owners={},master={};
  for(let i=0;i<gridCount;i++){
    const grid='GRID_'+i;
    master[grid]={gridId:grid,division:'BTR_E',range:'R',beat:'Beat '+i,totalCells:1000};
    if(!options.missingLabel)master[grid].compartment=options.collision?'Shared label':'Compartment '+i;
  }
  master.UNTOUCHED={gridId:'UNTOUCHED',division:'BTR_E',range:'R',beat:'Untouched',compartment:'Unused',totalCells:100};
  const rawIds=Array.from({length:cellCount},(_,i)=>`${200000+i}_50000`);
  rawIds.forEach((cell,i)=>owners[cell]='GRID_'+(i%gridCount));
  class FixedDate extends Date {static now(){return 2000000;}}
  const sandbox={setTimeout,clearTimeout,Date:FixedDate,console:quiet(logs),window:{masterGrid:master,cellToGridId:owners,
    GG_REPORT:{STORE_OCCURRENCES:'cell_occurrences'},__GG_PENDING_OCCURRENCE_WRITES:new Set(),
    userProfile:{division:'BTR_E',range:'R',beat:'Posting',name:'Test'},
    fb:new Proxy({ref:()=> 'storage',uploadString:async()=>{},getDownloadURL:async()=> 'mock.kml'},
      {get(target,key){assert.ok(key in target,'Forbidden Firebase operation '+String(key));return target[key];}})},
    ggReportOpenDB:async()=>({close(){closes++;},transaction(){return{objectStore(){return{getAll(){
      const request={};setTimeout(()=>{request.result=records;request.onsuccess();},0);return request;
    }};}};}}),ggReportWaitForPendingOccurrenceWrites:async()=>{},ggReportCacheArray:cache=>Object.values(cache),
    getTouchedCells:()=>{spatialCalls++;return{touchedCells:new Set(rawIds)};},
    generateKMLFromTrack:points=>{kmlPoints=points;return '<coordinates>fixture</coordinates>';},getDistance:()=>0.1,
    fetch:async(url,request)=>{captured=request.body;return{ok:true,status:200,text:async()=>'{"success":true}'};}};
  const context=vm.createContext(sandbox);
  const productionHelpers=['ggReportString','ggReportUpper','ggReportNumber','ggReportCanonicalDivision','ggReportMasterHierarchy','ggReportGetMasterRows','resolveAnalyticsCell','getAnalyticsCellId'];
  const newHelpers=[...revised.keys()].filter(name=>name.startsWith('ggEndDuty'));
  vm.runInContext('const ggEndDutyGISState = new WeakMap();\n'+[...productionHelpers,...newHelpers,'ggBuildCompletedSessionReportSnapshot','uploadPatrolKML']
    .map(name=>revised.get(name)).join('\n')+'\n'+original.get('ggBuildCompletedSessionReportSnapshot')
    .replace('function ggBuildCompletedSessionReportSnapshot(','function originalSnapshot(')+'\n'+original.get('uploadPatrolKML')
    .replace('function uploadPatrolKML(','function originalUpload('),context);
  // These pre-existing fixtures mock spatial results, not real coordinates.
  // Ordered traversal itself is covered with the production resolver in end-duty-reliability.test.cjs.
  context.ggEndDutyReplayTraversal = (segments, model) => {
    if(!model.rows.length || !Object.keys(context.window.cellToGridId).length) return {available:false,records:[]};
    const records=[];
    for(const segment of segments){
      for(const raw of context.getTouchedCells([segment]).touchedCells){
        const resolved=context.resolveAnalyticsCell(raw);
        if(resolved && model.master.has(resolved.gridId)) records.push(resolved);
      }
    }
    return {available:true,records};
  };
  const points=[{lat:26,lng:89},{lat:26.0001,lng:89.0001}];
  const occurrence=(cell=rawIds[0])=>({sessionId:'s',gridId:owners[cell],cellId:cell,staffName:'Test',timestamp:100});
  return{context,logs,owners,master,rawIds,points,occurrence,set records(v){records=v;},get records(){return records;},
    get spatialCalls(){return spatialCalls;},get captured(){return captured;},get kmlPoints(){return kmlPoints;},get closes(){return closes;},
    snapshot:()=>context.ggBuildCompletedSessionReportSnapshot('s',1,1200001,32.26,points.length,points),
    original:()=>context.originalSnapshot('s',1,1200001,32.26,points.length)};
}
function invariants(s,compartments,cells){
  assert.equal(s.compartmentsVisited,compartments);assert.equal(new Set(s.compartmentIds).size,compartments);
  assert.equal(s.uniqueCellsVisited,cells);assert.equal(new Set(s.uniqueCellIds).size,cells);
  const beats=Object.values(s.beatMetrics);
  assert.deepEqual([...new Set(beats.flatMap(b=>[...b.uniqueCellIds]))].sort(),[...s.uniqueCellIds].sort());
  for(const b of beats){assert.equal(b.uniqueCellsVisited,b.uniqueCellIds.length);assert.equal(b.compartmentsVisited,b.compartmentIds.length);}
}
(async()=>{
  const normal=harness();normal.records=[...normal.rawIds.map(normal.occurrence),normal.occurrence()];
  const before=await normal.original(),after=await normal.snapshot();
  assert.deepEqual(plain(after),plain(before)); // Never delete or normalize expected fields.
  assert.equal(JSON.stringify(after),JSON.stringify(before));assert.ok(after.beatMetrics.Untouched);assert.equal(normal.spatialCalls,0);
  const untouched=JSON.stringify(after);
  assert.deepEqual(plain(normal.context.ggEndDutyGISIssues(after,normal.context.ggEndDutyGISModel(after),normal.context.ggEndDutyGISSegments(normal.points))),[]);
  assert.equal(JSON.stringify(after),untouched);
  await normal.context.originalUpload('s',normal.points,32.26,before);const originalJSON=normal.captured;
  await normal.context.uploadPatrolKML('s',normal.points,32.26,after);
  assert.equal(normal.captured,originalJSON);assert.strictEqual(normal.kmlPoints,normal.points);assert.equal(JSON.parse(normal.captured).distanceKm,32.26);
  report('A normal: snapshot/register JSON byte-identical; untouched beats retained; zero spatial calls');
  const recoveryPayloads=[];
  for(const [name,n,c] of [['B PITHOR type',122,54],['C GHURA type',206,122]]){
    const h=harness(2,c);h.points.splice(0,h.points.length,...Array.from({length:n},(_,i)=>({lat:26+i*0.000001,lng:89})));
    const s=await h.snapshot();invariants(s,2,c);assert.ok(s.cellVisitOccurrences>=c);
    assert.ok(h.logs.some(log=>log[2]?.occurrenceStatus==='RECONSTRUCTED_FROM_FINAL_TRACK'));
    await h.context.uploadPatrolKML('s',h.points,32.26,s);assert.strictEqual(h.kmlPoints,h.points);assert.equal(JSON.parse(h.captured).distanceKm,32.26);
    recoveryPayloads.push(JSON.parse(h.captured));
    report(name+': local coverage and deterministic traversal counts recovered');
  }
  const subhash=harness(3,76),supplied={sessionId:'s',division:'BTR_E',range:'R',startedAt:1,endedAt:1200001,durationMinutes:20,
    cellVisitOccurrences:76,uniqueCellsVisited:76,uniqueCellIds:[...subhash.rawIds],visitedHa:19,totalCells:3100,
    compartmentsVisited:0,compartmentIds:[],beatMetrics:{'Beat 0':{},'Beat 1':{},'Beat 2':{}}};
  const preserved=JSON.stringify(supplied.uniqueCellIds);
  await subhash.context.uploadPatrolKML('s',subhash.points,32.26,supplied);
  const repaired=JSON.parse(subhash.captured);invariants(repaired,3,76);assert.equal(JSON.stringify(repaired.uniqueCellIds),preserved);
  assert.equal(repaired.cellVisitOccurrences,76);assert.equal(Object.values(repaired.beatMetrics).reduce((sum,b)=>sum+b.cellVisitOccurrences,0),76);
  assert.equal(subhash.spatialCalls,0);assert.equal(repaired.distanceKm,32.26);assert.strictEqual(subhash.kmlPoints,subhash.points);
  report('D SUBHASH type: 76 supplied IDs/count retained, three-beat attribution repaired without GPS replay');
  for(const [n,g,name]of [[54,1,'E'],[122,2,'F'],[19,19,'G']]){
    const h=harness(g,n);h.records=h.rawIds.map(h.occurrence);invariants(await h.snapshot(),g,n);assert.equal(h.spatialCalls,0);
    report(name+': '+n+' cells / '+g+' grids -> '+g+' compartments');
  }
  const collision=harness(2,122,{collision:true});collision.records=collision.rawIds.map(collision.occurrence);
  const cs=await collision.snapshot();invariants(cs,2,122);assert.deepEqual([...cs.compartmentIds],['GRID_0','GRID_1']);
  assert.ok(collision.logs.some(log=>log[2]?.compartmentIdentity==='COLLIDING_LABELS_USE_EXISTING_GRID_ID_FALLBACK'));
  report('duplicate labels: distinct grid identities preserved with explicit grid-ID fallback');
  const missing=harness(1,54,{missingLabel:true});missing.records=missing.rawIds.map(missing.occurrence);
  assert.deepEqual(plain(await missing.snapshot()),plain(await missing.original()));assert.deepEqual([...(await missing.snapshot()).compartmentIds],['GRID_0']);
  report('missing label: original gridId fallback/output preserved');
  const repeated=harness(1,1);repeated.records=[repeated.occurrence(),repeated.occurrence(),repeated.occurrence()];
  const rs=await repeated.snapshot();assert.equal(rs.cellVisitOccurrences,3);invariants(rs,1,1);
  report('H repeated persisted occurrences: three hits, one cell, one grid');invariants(repaired,3,76);report('I multiple beats: authoritative grid-to-beat attribution');
  const unknown=harness();unknown.context.window.masterGrid={};unknown.context.window.cellToGridId={};
  const us=await unknown.snapshot();assert.equal(us.uniqueCellsVisited,0);assert.equal(us.compartmentsVisited,0);
  await unknown.context.uploadPatrolKML('s',unknown.points,32.26,us);assert.strictEqual(unknown.kmlPoints,unknown.points);
  assert.equal(JSON.parse(unknown.captured).distanceKm,32.26);assert.ok(unknown.logs.some(log=>String(log[1]).includes('UNRESOLVED')));
  report('J missing mapping: no invented GIS; KML/distance survive');
  const stationary=harness(1,1);stationary.points[1]={...stationary.points[0]};
  assert.equal((await stationary.snapshot()).uniqueCellsVisited,0);assert.equal(stationary.spatialCalls,0);
  stationary.records=[stationary.occurrence()];assert.deepEqual(plain(await stationary.snapshot()),plain(await stationary.original()));
  report('K zero movement: no recovered visits; genuine persisted stationary records unchanged');
  const breaks=harness(),p=[{lat:26,lng:89},{lat:26.1,lng:89.1,breakTrack:true},{lat:26.1001,lng:89.1001}];
  assert.equal(breaks.context.ggEndDutyGISSegments(p).length,1);assert.equal(breaks.context.ggEndDutyGISSegments(p,[p[0],p[2]]).length,0);
  assert.equal(breaks.context.ggEndDutyGISSegments([p[0],{lat:NaN,lng:89},p[2]]).length,0);
  report('breakTrack/rejected gaps/invalid coordinates: no synthetic connecting segments');
  const delayed=harness(1,1),promise=new Promise(resolve=>setTimeout(()=>{delayed.records=[delayed.occurrence()];resolve(true);},15));
  delayed.context.window.__GG_PENDING_OCCURRENCE_WRITES.add(promise);promise.finally(()=>delayed.context.window.__GG_PENDING_OCCURRENCE_WRITES.delete(promise));
  assert.equal((await delayed.snapshot()).cellVisitOccurrences,1);assert.equal(delayed.spatialCalls,0);report('L delayed writes: normal completed records used');
  const stuck=harness(1,3);stuck.context.window.__GG_PENDING_OCCURRENCE_WRITES.add(new Promise(()=>{}));
  const started=Date.now(),local=await stuck.context.ggEndDutyReadOccurrences('s',30);assert.ok(Date.now()-started<500);assert.equal(local.status,'WRITE_TIMEOUT');
  const empty={sessionId:'s',division:'BTR_E',range:'R',uniqueCellIds:[],cellVisitOccurrences:0};
  await stuck.context.ggEndDutyFinalizeGIS(empty,stuck.points,local);invariants(empty,1,3);assert.equal(empty.cellVisitOccurrences,3);
  const blocked=harness();blocked.context.ggReportOpenDB=()=>new Promise(()=>{});
  assert.equal((await blocked.context.ggEndDutyReadOccurrences('s',20)).status,'UNAVAILABLE');report('M stuck writes/blocked IDB: bounded local fallback with traversal recovery');
  const saved=new Map(),writer=vm.createContext({console:quiet([]),window:{GG_REPORT:{STORE_OCCURRENCES:'cell_occurrences'}},
    ggReportOpenDB:async()=>({transaction(){const tx={objectStore(){return{put(row){saved.set(row.id,row);queueMicrotask(()=>tx.oncomplete());}};}};return tx;}})});
  vm.runInContext(revised.get('ggReportSaveCellOccurrence'),writer);
  await Promise.all([1,2].map(i=>writer.ggReportSaveCellOccurrence({id:'random'+i,sessionId:'s',gridId:'G',cellId:'C',timestamp:1,staffName:'N'})));
  assert.equal(saved.size,2);report('persisted-key collision: existing generated IDs keep both same-millisecond records');
  const observed=harness(1,1);let hits=0;observed.context.collectAnalyticsHit=()=>hits++;
  vm.runInContext(original.get('processPatrolAnalyticsSnapshot'),observed.context);
  await observed.context.processPatrolAnalyticsSnapshot([{lat:26,lon:89,time:1},{lat:26,lon:89,time:2}],{},'s');assert.equal(hits,1);
  report('actual live stationary-hit semantics verified; processor unchanged');
  const preservationFailures=[];
  try {
    const h=harness(2,4);h.records=[h.occurrence(h.rawIds[0]),h.occurrence(h.rawIds[2])];
    const s=await h.original(),expectedIds=JSON.stringify(s.uniqueCellIds),expectedCount=s.cellVisitOccurrences;
    s.beatMetrics['Beat 0'].cellVisitOccurrences=0;h.records=h.rawIds.map(h.occurrence);
    await h.context.ggEndDutyFinalizeGIS(s,h.points);
    assert.equal(JSON.stringify(s.uniqueCellIds),expectedIds,'Attribution repair expanded valid coverage');
    assert.equal(s.cellVisitOccurrences,expectedCount);
    report('attribution-only repair preserves existing cells/count despite unrelated local records');
  } catch(error){preservationFailures.push(error.message);}
  try {
    const h=harness(2,2);h.records=[...Array.from({length:4},()=>h.occurrence(h.rawIds[0])),...Array.from({length:6},()=>h.occurrence(h.rawIds[1]))];
    const s=await h.original(),untouchedBeat=plain(s.beatMetrics.Untouched);s.compartmentsVisited=54;h.records=[];
    await h.context.ggEndDutyFinalizeGIS(s,h.points);
    assert.equal(s.cellVisitOccurrences,10);
    assert.equal(s.beatMetrics['Beat 0'].cellVisitOccurrences,4,'Lost valid existing beat occurrence count');
    assert.equal(s.beatMetrics['Beat 1'].cellVisitOccurrences,6);assert.equal(s.compartmentsVisited,2);
    assert.deepEqual(plain(s.beatMetrics.Untouched),untouchedBeat);
    report('compartment-only repair preserves valid beat/global occurrence counts without IDB history');
  } catch(error){preservationFailures.push(error.message);}
  try {
    const h=harness(1,1);h.points.push({lat:26.0002,lng:89.0002});
    const safeSegment=[[h.points[1].lat,h.points[1].lng],[h.points[2].lat,h.points[2].lng]];
    h.context.window.masterGrid={};h.context.window.cellToGridId={};const s=await h.original();
    await h.context.ggEndDutyFinalizeGIS(s,h.points,{records:[],status:'UNAVAILABLE'},[safeSegment]);
    h.context.window.masterGrid=h.master;h.context.window.cellToGridId=h.owners;
    const segments=[];h.context.getTouchedCells=value=>{segments.push(plain(value[0]));return{touchedCells:new Set(h.rawIds)};};
    await h.context.uploadPatrolKML('s',h.points,32.26,s);
    assert.ok(segments.every(segment=>JSON.stringify(segment)===JSON.stringify(safeSegment)), 'Upload retried with lost gap/break provenance');
    report('upload cannot retry unresolved GIS across a previously excluded gap');
  } catch(error){preservationFailures.push(error.message);}
  assert.deepEqual(preservationFailures,[],'Targeted preservation regressions');
  // Reverse only the exact approved display/camera edits for historical source
  // preservation. Functional checks above still execute the current source.
  const {restoreCameraChanges} = require('./map-camera-stability.test.cjs');
  const {restoreStaffPopupChanges} = require('./staff-popup.test.cjs');
  const {restoreTrackNavigationChanges} = require('./staff-track-navigation.test.cjs');
  const preservationFunctions = functions(require('./excluded-feature-restorations.cjs').restoreHeatmapChanges(restoreCameraChanges(restoreStaffPopupChanges(restoreTrackNavigationChanges(current)))));
  const changed=[];for(const [name,body]of original)if(preservationFunctions.get(name)!==body)changed.push(name);
  const approvedInteractionHooks = ['closeHelpForm','saveHelpLocation','startHelpMapSelection'];
  for (const name of approvedInteractionHooks) {
    const body = revised.get(name);
    assert.equal((body.match(/window\.syncOperationalAssetInteraction\?\.\(\);/g) || []).length, 1, name + ' exact Phase-A hook');
    assert.equal(body.replace(/^    window\.syncOperationalAssetInteraction\?\.\(\);\r?\n/gm, ''), original.get(name), name + ' behavior preserved');
  }
  assert.deepEqual(changed.filter(name=>!approvedInteractionHooks.includes(name)).sort(),['ggBuildCompletedSessionReportSnapshot','ggReportSaveCellOccurrence','loadStaff','submitEndDuty','uploadPatrolKML'].sort());
  // loadStaff already differed from the historical fixture before this task.
  const headFunctions=functions(execFileSync('git',['show','09c57de:index.html'],{cwd:root,encoding:'utf8',maxBuffer:20e6}));
  assert.equal(preservationFunctions.get('loadStaff'),headFunctions.get('loadStaff'));
  const remoteNames=new Set(['getDocs','getDoc','collection','query','where','orderBy','onSnapshot','setDoc','updateDoc','addDoc','runTransaction','deleteDoc']);
  function remoteCalls(body){
    const ast=acorn.parse(body,{ecmaVersion:'latest'}),calls=[];
    function walk(n){if(!n||typeof n!=='object')return;
      if(n.type==='CallExpression'&&remoteNames.has(n.callee?.property?.name||n.callee?.name))calls.push(body.slice(n.start,n.end));
      for(const v of Object.values(n))Array.isArray(v)?v.forEach(walk):walk(v);
    }walk(ast);return calls;
  }
  const inventory={};for(const name of changed.filter(name=>name!=='loadStaff')){assert.deepEqual(remoteCalls(revised.get(name)),remoteCalls(original.get(name)));
    inventory[name]={before:remoteCalls(original.get(name)).length,after:remoteCalls(revised.get(name)).length};}
  for(const [name,body]of revised)if(!original.has(name))assert.equal(remoteCalls(body).length,0);
  report('N new Firestore operations NONE; calls/arguments identical '+JSON.stringify(inventory));
  assert.deepEqual(Object.keys(JSON.parse(normal.captured)),Object.keys(JSON.parse(originalJSON)));
  report('O KML same points/canonical distance 32.26/register field names and order unchanged');
  function normalGISCore(body, isRevised){
    let core=body.slice(body.indexOf('let cellVisitOccurrences = 0;'),body.indexOf('8. EVENT COUNTS'));
    if(isRevised){
      core=core.replace('let ggEndDutyLocal;','').replace(/ggEndDutyLocal = await ggEndDutyReadOccurrences\(cleanSessionId\);\s*const occurrenceRecords = ggEndDutyLocal.records;/,'LOCAL_READER');
    }else{
      const start=core.lastIndexOf('if(',core.indexOf('typeof ggReportWaitForPendingOccurrenceWrites'));
      const end=core.indexOf('db.close();',start)+'db.close();'.length;
      assert.ok(start>=0&&end>start);core=core.slice(0,start)+'LOCAL_READER'+core.slice(end);
    }
    return core.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\s+/g,'');
  }
  assert.equal(normalGISCore(revised.get('ggBuildCompletedSessionReportSnapshot'),true),normalGISCore(original.get('ggBuildCompletedSessionReportSnapshot'),false));
  report('original normal GIS arithmetic/filtering/aggregation unchanged; only local reader replaced');
  // Supplied Apps Script receiver, run against an in-memory fake sheet only.
  const gas=fs.readFileSync((process.env.BTR_GIS_RECEIVER_FIXTURE || path.join(root,'audit-input/Code.gs')),'utf8');
  const gasAST=acorn.parse(gas,{ecmaVersion:'latest'}),gasFunction=name=>{
    const node=gasAST.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
    assert.ok(node,name);return gas.slice(node.start,node.end);
  };
  let written;
  const server=vm.createContext({Logger:{log(){}},Session:{getScriptTimeZone:()=> 'Asia/Kolkata'},
    Utilities:{formatDate:()=> '2026-09-20'},SpreadsheetApp:{getActive:()=>({getSheetByName:name=>{
      assert.equal(name,'PatrolKMLRegister');return{getLastRow:()=>1,appendRow:row=>{written=plain(row);}};
    }})}});
  vm.runInContext(gasFunction('savePatrolKML')+'\n'+gasFunction('BTRGUARD_BUILD_MONTHLY_REGISTER_ROWS_'),server);
  for(const payload of [JSON.parse(originalJSON),JSON.parse(normal.captured),repaired,...recoveryPayloads]){
    assert.equal(server.savePatrolKML(payload).success,true);assert.equal(written.length,29);
    assert.equal(written[13],payload.distanceKm);assert.equal(written[14],payload.cellVisitOccurrences);
    assert.equal(written[15],payload.uniqueCellsVisited);assert.equal(written[22],payload.compartmentsVisited);
    assert.deepEqual(JSON.parse(written[23]),payload.uniqueCellIds);assert.deepEqual(JSON.parse(written[24]),payload.compartmentIds);
    assert.deepEqual(JSON.parse(written[27]),payload.beatMetrics);
    const reportRows=server.BTRGUARD_BUILD_MONTHLY_REGISTER_ROWS_([{sessionId:payload.sessionId,division:payload.division,
      range:payload.range,beat:payload.beat,distanceKm:payload.distanceKm,beatMetrics:payload.beatMetrics,observationBeatMetrics:payload.observationBeatMetrics}]);
    assert.equal(reportRows.reduce((sum,row)=>sum+row.uniqueCellsVisited,0),payload.uniqueCellsVisited);
    assert.equal(reportRows.reduce((sum,row)=>sum+row.cellVisitOccurrences,0),payload.cellVisitOccurrences);
  }
  report('receiver contract: original 29 columns/IDs/counts/distance/beat JSON preserved; register-report cell totals agree');
  console.log('All regressions passed. Synthetic fixtures; no production-session replay claimed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
