// Production functions in an isolated VM. All IDB, Firebase and HTTP operations are mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const acorn = require('acorn');
const root = path.join(__dirname, '..');
function extract(html){
  const result = new Map();
  for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(!match[2].trim() || /application\/(?:ld\+)?json/.test(match[1])) continue;
    const ast = acorn.parse(match[2], {ecmaVersion:'latest', sourceType:/type\s*=\s*["']module["']/.test(match[1])?'module':'script'});
    for(const node of ast.body) if(node.type==='FunctionDeclaration') result.set(node.id.name,match[2].slice(node.start,node.end));
  }
  return result;
}
const source = fs.readFileSync(path.join(root,'index.html'),'utf8');
const funcs = extract(source);
const STEP = 0.00045, COL = 197777, ROW = 57777;
const cell = (x,y=0) => `${COL+x}_${ROW+y}`;
const point = (x,y=0) => ({lat:(ROW+y+0.5)*STEP,lng:(COL+x+0.5)*STEP});
const plain = value => JSON.parse(JSON.stringify(value));
function harness(){
  const logs=[],writes=new Map();let payload,reads=0,remoteReads=0,replays=0,blocked=false;
  const master={G:{division:'BTR_W',range:'West Damanpur',beat:'Poro-East',compartment:'C1',totalCells:10000},
    H:{division:'BTR_W',range:'West Damanpur',beat:'Poro-West',compartment:'C2',totalCells:4500},
    E:{division:'BTR_W',range:'East Damanpur',beat:'Other',compartment:'C3',totalCells:9000},
    D:{division:'BTR_E',range:'West Damanpur',beat:'Other Division',compartment:'C4',totalCells:8000}};
  const owners={};
  const context=vm.createContext({setTimeout,clearTimeout,crypto:webcrypto,
    console:Object.fromEntries(['log','warn','error','table','group','groupEnd'].map(name=>[name,(...args)=>logs.push(args)])),
    window:{masterGrid:master,cellToGridId:owners,GG_REPORT:{STORE_OCCURRENCES:'cell_occurrences'},
      __GG_PENDING_OCCURRENCE_WRITES:new Set(),userProfile:{division:'BTR_W',range:'West Damanpur',beat:'Poro-East',name:'Test'},
      fb:new Proxy({ref:()=> 'mock',uploadString:async()=>{},getDownloadURL:async()=> 'mock.kml'},
        {get(target,key){if(!(key in target)){remoteReads++;throw Error('Unexpected Firebase call: '+String(key));}return target[key];}})},
    ggReportOpenDB:async()=>{
      if(blocked) throw Error('IDB unavailable');
      return {close(){},transaction(){
        const tx={objectStore(){return {
          put(row){writes.set(row.id,plain(row));queueMicrotask(()=>tx.oncomplete());},
          getAll(){reads++;const request={};setTimeout(()=>{request.result=[...writes.values()];request.onsuccess();},0);return request;}
        };}};return tx;
      }};
    },
    ggReportCacheArray:cache=>Object.values(cache),
    getDistance:()=>0.1,generateKMLFromTrack:()=>'<coordinates>mock</coordinates>',
    fetch:async(url,request)=>{payload=JSON.parse(request.body);return {ok:true,status:200,text:async()=>'{"success":true}'};}
  });
  const names=['ggReportString','ggReportUpper','ggReportNumber','ggReportCanonicalDivision','ggReportMasterHierarchy',
    'ggReportGetMasterRows','getAnalyticsCellId','resolveAnalyticsCell','ggReportSaveCellOccurrence',
    ...[...funcs.keys()].filter(name=>name.startsWith('ggEndDuty')),'ggBuildCompletedSessionReportSnapshot','uploadPatrolKML'];
  vm.runInContext('const ggEndDutyGISState = new WeakMap();\n'+names.map(name=>funcs.get(name)).join('\n'),context);
  const replay=context.ggEndDutyReplayTraversal;
  context.ggEndDutyReplayTraversal=(...args)=>{replays++;return replay(...args);};
  const record=(x,y=0,grid=owners[cell(x,y)],id=webcrypto.randomUUID())=>({id,sessionId:'s',gridId:grid,cellId:cell(x,y),staffName:'Test',timestamp:1});
  return {context,master,owners,writes,logs,record,
    set blocked(value){blocked=value;},get payload(){return payload;},get reads(){return reads;},get replays(){return replays;},get remoteReads(){return remoteReads;},
    snapshot:points=>context.ggBuildCompletedSessionReportSnapshot('s',1,1200001,10.68,points.length,points),
    upload:(snapshot,points)=>context.uploadPatrolKML('s',points,10.68,snapshot)};
}
function consistent(s){
  assert.equal(s.uniqueCellsVisited,s.uniqueCellIds.length);
  assert.equal(new Set(s.uniqueCellIds).size,s.uniqueCellsVisited);
  assert.equal(s.visitedHa,Number((s.uniqueCellsVisited*0.25).toFixed(2)));
  assert.equal(s.compartmentsVisited,s.compartmentIds.length);
  assert.ok(s.cellVisitOccurrences>=s.uniqueCellsVisited);
  const pct=n=>s.totalCells>0?Number((n/s.totalCells*100).toFixed(2)):0;
  assert.equal(s.coveragePercent,pct(s.uniqueCellsVisited));
  assert.equal(s.patrolIntensityPercent,pct(s.cellVisitOccurrences));
  const beats=Object.values(s.beatMetrics);
  assert.equal(beats.reduce((sum,b)=>sum+b.cellVisitOccurrences,0),s.cellVisitOccurrences);
  assert.deepEqual([...new Set(beats.flatMap(b=>b.uniqueCellIds))].sort(),[...s.uniqueCellIds].sort());
}
const passed=[];
const pass=(number,label)=>{passed.push(number);console.log(`PASS Case ${number}: ${label}`);};
(async()=>{
  const healthy=harness(),hp=[point(0),point(1)];healthy.owners[cell(0)]='G';healthy.owners[cell(1)]='H';
  for(let i=0;i<150;i++){const r=healthy.record(i%2);healthy.writes.set(r.id,r);}
  const hs=await healthy.snapshot(hp),before=JSON.stringify(hs);
  assert.equal(hs.cellVisitOccurrences,150);consistent(hs);assert.equal(healthy.replays,0);
  await healthy.upload(hs,hp);assert.equal(JSON.stringify(hs),before);assert.equal(healthy.remoteReads,0);
  pass(1,'healthy persisted count and snapshot preserved; no replay/Firebase read');

  const recovery=harness();for(let i=0;i<45;i++)recovery.owners[cell(i)]=i%2?'H':'G';
  // 45 initial entries + 11 reverse + 11 forward = 67; pad with stationary fixes to 240 points.
  const route=[...Array.from({length:45},(_,i)=>i),...Array.from({length:11},(_,i)=>43-i),...Array.from({length:11},(_,i)=>34+i)];
  const rp=route.map(x=>point(x));while(rp.length<240)rp.push(point(44));
  recovery.blocked=true;const rs=await recovery.snapshot(rp);consistent(rs);
  assert.equal(rs.cellVisitOccurrences,67);assert.equal(rs.uniqueCellsVisited,45);assert.equal(rs.visitedHa,11.25);
  assert.equal(rs.coveragePercent,0.31);assert.equal(rs.patrolIntensityPercent,0.46);
  await recovery.upload(rs,rp);assert.equal(recovery.payload.pointCount,240);assert.equal(recovery.payload.distanceKm,10.68);
  assert.equal(recovery.payload.cellVisitOccurrences,67);assert.equal(recovery.remoteReads,0);assert.equal(recovery.replays,1);
  assert.ok(recovery.logs.some(args=>args[1]?.occurrenceStatus==='RECONSTRUCTED_FROM_FINAL_TRACK'));
  pass(2,'240-point track recovers O=67/P=45/Q=11.25/R=0.31/S=0.46');

  const zero=harness();zero.owners[cell(100)]='G';const zs=await zero.snapshot([point(0),point(10)]);
  for(const field of ['cellVisitOccurrences','uniqueCellsVisited','visitedHa','coveragePercent','patrolIntensityPercent'])assert.equal(zs[field],0);
  assert.ok(zero.logs.some(args=>args[1]?.occurrenceStatus==='LEGITIMATE_ZERO'));consistent(zs);
  pass(3,'no registered cells => genuine zero');

  const revisit=harness();for(const [x,y]of [[0,0],[1,0],[2,0],[1,1]])revisit.owners[cell(x,y)]='G';
  const vs=await revisit.snapshot([point(0),point(1),point(2),point(1),point(1,1)]);
  assert.equal(vs.uniqueCellsVisited,4);assert.equal(vs.cellVisitOccurrences,5);consistent(vs);
  pass(4,'A → B → C → B → D gives O=5/P=4');

  const beats=harness();beats.owners[cell(0)]='G';beats.owners[cell(1)]='H';
  const bs=await beats.snapshot([point(0),point(1)]);consistent(bs);
  assert.equal(bs.beatMetrics['Poro-West'].uniqueCellsVisited,1);assert.equal(bs.totalCells,14500);
  pass(5,'different Beat in same Range counted and attributed to Poro-West');

  const fence=harness();fence.owners[cell(0)]='G';fence.owners[cell(1)]='E';fence.owners[cell(2)]='D';
  const fp=[point(0),point(2)],fsnap=await fence.snapshot(fp);consistent(fsnap);
  assert.deepEqual([...fsnap.uniqueCellIds],['G|'+cell(0)]);assert.equal(fsnap.cellVisitOccurrences,1);
  // Previously supplied out-of-scope IDs must not bypass the recovery fence.
  fsnap.uniqueCellIds.push('E|'+cell(1));fsnap.uniqueCellsVisited=2;
  await fence.context.ggEndDutyFinalizeGIS(fsnap,fp);consistent(fsnap);assert.equal(fsnap.uniqueCellsVisited,1);
  pass(6,'other Range and other Division excluded, including supplied IDs');

  const keys=harness();keys.owners[cell(0)]='G';const old=keys.record(0,0,'G','s|G|legacy|1|Test');keys.writes.set(old.id,old);
  await Promise.all(['uuid-one','uuid-two'].map(id=>keys.context.ggReportSaveCellOccurrence(keys.record(0,0,'G',id))));
  await Promise.all([1,2].map(()=>keys.context.ggReportSaveCellOccurrence({...keys.record(0),id:undefined})));
  assert.equal(keys.writes.size,5);assert.ok(keys.writes.has(old.id));
  assert.equal((await keys.context.ggEndDutyReadOccurrences('s')).records.length,5);
  pass(7,'same-millisecond writes survive; legacy IDs still read; UUID fallback works');

  const retry=harness(),tp=[point(0),point(1)];retry.context.window.masterGrid={};retry.context.window.cellToGridId={};
  const ts=await retry.snapshot(tp);assert.equal(ts.uniqueCellsVisited,0);
  retry.context.window.masterGrid=retry.master;retry.context.window.cellToGridId=retry.owners;
  retry.owners[cell(0)]='G';retry.owners[cell(1)]='H';
  await retry.upload(ts,tp);consistent(ts);assert.equal(ts.cellVisitOccurrences,2);assert.ok(retry.replays>=2);
  const replayCount=retry.replays;await retry.upload(ts,tp);assert.equal(retry.replays,replayCount);
  pass(8,'unavailable GIS retries before upload; successful result memoized');

  // Execute the unchanged production track-selection block for RAM and IDB branches.
  const end=funcs.get('submitEndDuty');
  const selection=end.slice(end.indexOf('let fullTrack = [];'),end.indexOf('const cleanTrack = [];'));
  assert.ok(selection.includes('loadPatrolPointsFromIDB')&&selection.includes('getDocs'));
  for(const mode of ['RAM','IDB']){
    const h=harness();h.owners[cell(0)]='G';h.owners[cell(1)]='G';
    const stored=Object.fromEntries([point(0),point(1)].map((p,i)=>[i,{...p,lon:p.lng,time:i+1}]));
    h.context.window.sessionPointCache=mode==='RAM'?{s:stored}:{};let idbReads=0;
    h.context.loadPatrolPointsFromIDB=async()=>{idbReads++;return stored;};
    const track=await vm.runInContext('(async()=>{const sessionId="s";'+selection+';return fullTrack;})()',h.context);
    const s=await h.snapshot(track);await h.upload(s,track);assert.equal(h.remoteReads,0);assert.equal(idbReads,mode==='RAM'?0:1);
  }
  // Reviewed committed baseline already contains the End Duty reliability work.
  const head=extract(execFileSync('git',['show','09c57de:index.html'],{cwd:root,encoding:'utf8',maxBuffer:20e6}));
  assert.equal(funcs.get('submitEndDuty'),head.get('submitEndDuty'),'Track retrieval and End Duty flow changed');
  pass(9,'production RAM/IDB selection and recovery perform no extra Firestore reads');
  console.log('NOT IMPLEMENTED Case 10 — SERVER SAFETY DEFERRED: payload lacks evidence distinguishing degraded zeros from intentional corrections');
  assert.equal(rs.uniqueCellIds.length,45);assert.equal(rs.visitedHa,11.25);pass(11,'45 canonical IDs => 11.25 ha');

  const rounding=harness();rounding.master.G.totalCells=100000000;rounding.owners[cell(0)]='G';
  const rounded=await rounding.snapshot([point(0),point(0.1)]);consistent(rounded);
  assert.equal(rounded.cellVisitOccurrences,1);assert.equal(rounded.uniqueCellsVisited,1);
  assert.equal(rounded.coveragePercent,0);assert.equal(rounded.patrolIntensityPercent,0);
  pass(12,'positive counts retained while percentages round to zero');

  // Extra: discontinuities, very short cell crossings, and an unavailable-IDB retry.
  const gaps=harness();gaps.owners[cell(0)]='G';gaps.owners[cell(1)]='G';gaps.owners[cell(2)]='G';
  const gp=[point(0),point(1),{...point(0),breakTrack:true},point(1)];
  const gs=await gaps.snapshot(gp);assert.equal(gs.cellVisitOccurrences,4);consistent(gs);
  const rejected=[point(0),point(1),point(2)];
  assert.equal(gaps.context.ggEndDutyGISSegments(rejected,[rejected[0],rejected[2]]).length,0);
  const tiny=harness();tiny.owners[cell(0)]='G';tiny.owners[cell(1)]='G';
  const tinySnap=await tiny.snapshot([point(0.499999),point(0.500001)]);assert.equal(tinySnap.uniqueCellsVisited,2);
  const degraded=harness();degraded.owners[cell(0)]='G';degraded.owners[cell(1)]='G';
  const dp=[point(0),point(1)],ds=await degraded.snapshot(dp);
  ds.cellVisitOccurrences=0;ds.patrolIntensityPercent=0;ds.beatMetrics['Poro-East'].cellVisitOccurrences=0;ds.beatMetrics['Poro-East'].patrolIntensityPercent=0;
  await degraded.context.ggEndDutyFinalizeGIS(ds,dp);assert.equal(ds.cellVisitOccurrences,2);consistent(ds);
  const invalid=harness();invalid.owners[cell(0)]='G';invalid.owners[cell(1)]='G';
  const bad=await invalid.snapshot(dp);bad.uniqueCellIds.push('UNKNOWN|bad');bad.uniqueCellsVisited++;
  invalid.context.window.cellToGridId={};
  assert.equal(await invalid.upload(bad,dp),null);assert.equal(invalid.payload,undefined,'Contradictory metrics were posted');
  console.log('PASS extra regressions: breaks, rejected gaps, sub-sampling crossings, O=0/P>0 recovery, inconsistent upload blocked');
  const changed=[...head.keys()].filter(name=>head.get(name)!==funcs.get(name)).sort();
  const approvedAssetChanges = ['bindOperationalAssetFeature','initializeOperationalAssetLayers','loadOperationalAssetLayer','syncOperationalAssetInteraction'];
  assert.deepEqual(changed, approvedAssetChanges.sort());
  for (const name of ['startDuty','submitEndDuty','ggBuildCompletedSessionReportSnapshot','ggEndDutyFinalizeGIS','ggEndDutyGISIssues','ggEndDutyGISModel','ggEndDutyGISSegments','ggEndDutyReplayTraversal','ggReportSaveCellOccurrence','uploadPatrolKML','loadStaff','loadSightings','setVillageInteractionMode']) {
    assert.ok(head.has(name), 'Protected baseline function exists: ' + name);
    assert.equal(funcs.get(name), head.get(name), 'Protected function preserved: ' + name);
  }
  const approvedAssetHelpers = ['operationalAssetDivision','operationalAssetRange','operationalAssetProfileScope','getOperationalAssetOwnership','canViewOperationalAsset','canUpdateOperationalAsset','loadOperationalAssetOwnership','operationalAssetVisibilitySignature','operationalAssetMatchesGIS','renderOperationalAssetLayer','refreshOperationalAssetVisibility'];
  assert.deepEqual([...funcs.keys()].filter(name=>!head.has(name)).sort(), approvedAssetHelpers.sort());
  console.log('PASS source scope: protected implementations preserved; only reviewed asset functions/helpers changed');
  assert.deepEqual(passed.sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,11,12]);
  console.log('All 11 implemented required cases passed; Case 10 explicitly deferred. No production data touched.');
})().catch(error=>{console.error(error);process.exitCode=1;});
