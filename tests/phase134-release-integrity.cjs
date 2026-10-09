const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict'),acorn=require('acorn'),vm=require('vm');
// Pin preservation to the integration release, not an obsolete Phase 1/3/4 candidate.
const baseline='2c1ea3177c381e4e1025b7d10199ab341814f520';
const normalize=s=>s.replace(/\r\n/g,'\n');
const before=file=>normalize(cp.execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:20e6}));
function restoreLiveGps(source,file='index.html'){
 source=normalize(source);
 for(const p of [...require('./live-staff-location-patch.json')[file]].reverse()){
  assert.equal(source.split(p.after).length-1,1,'Exact reviewed GPS hunk occurs once');source=source.replace(p.after,p.before);
 }return source;
}
function verify(){
 for(const f of ['index.html','js/staffRendering.js'])assert.equal(restoreLiveGps(fs.readFileSync(f,'utf8'),f),before(f),'Only reviewed live GPS changes: '+f);
 for(const f of ['js/staffPopup.js','css/staffPopup.css','js/staffTrackNavigation.js','css/staffTrackNavigation.css','js/tigerTeams.js','css/tigerTeams.css','js/staffLiveGps.js','js/analytics/staffProfile.js','js/analytics/staffGPS.js','js/analytics/staffFormatter.js','build.js','.github/workflows/deploy.yml'])assert.equal(normalize(fs.readFileSync(f,'utf8')),before(f),'Protected baseline file '+f);
}
function verifyFirebaseReady(html){
 let found;
 function walk(n,parent){if(!n||typeof n!=='object')return;if(n.type==='ExpressionStatement'&&n.expression?.type==='AssignmentExpression'){const a=n.expression;if(a.left?.object?.name==='window'&&a.left.property?.name==='firebaseReady'&&a.right.value===true){assert(!found,'Only one readiness assignment');found={n,parent};}}
 for(const [k,v]of Object.entries(n)){if(k==='start'||k==='end')continue;if(Array.isArray(v))v.forEach(c=>walk(c,n));else if(v&&typeof v==='object')walk(v,n);}}
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){if(!m[2].trim()||/application\//.test(m[1]))continue;const ast=acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*['"]module['"]/.test(m[1])?'module':'script'});walk(ast);if(found){found.source=m[2];break;}}
 assert(found);const body=found.parent.body;assert(Array.isArray(body));const start=body.indexOf(found.n),tail=body.slice(start);const sync=tail.findIndex(n=>/window\.OperationalAssetConditions\?\.sync\(\)/.test(found.source.slice(n.start,n.end)));assert(sync>0,'Asset sync remains after Firebase readiness');
 const source=tail.slice(0,sync+1).map(n=>found.source.slice(n.start,n.end)).join('\n');let calls=0;
 const window={firebaseReady:false,StaffRendering:{start(){assert.equal(window.firebaseReady,true);}},OperationalAssetConditions:{sync(){assert.equal(window.firebaseReady,true);calls++;}}};vm.runInNewContext(source,{window});assert.equal(calls,1,'Ready initialization invokes asset outbox once');
 delete window.StaffRendering;delete window.OperationalAssetConditions;vm.runInNewContext(source,{window});
}
module.exports={verify,verifyFirebaseReady,restoreLiveGps};
