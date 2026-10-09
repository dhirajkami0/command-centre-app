const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict'),acorn=require('acorn'),vm=require('vm');
const baseline='31a1385355ad5e8e6d4470147d17d9a395f062d7';
const normalize=s=>s.replace(/\r\n/g,'\n');
const before=file=>normalize(cp.execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:20e6}));
function reverse(s,patches){for(const p of [...patches].reverse()){assert.equal(s.split(p.after).length-1,p.count||1);s=s.split(p.after).join(p.before);}return s;}
function verify(){
 const p4=require('./startup-coordinator-patch.json');
 let html=normalize(fs.readFileSync('index.html','utf8'));
 html=reverse(reverse(reverse(html,p4['index.html']),require('./staff-phase3-patch.json')),require('./firestore-recovery-patch.json'));
 assert.equal(html,before('index.html'),'Only approved Phase 1/3/4 HTML changes');
 const staff=reverse(reverse(normalize(fs.readFileSync('js/staffRendering.js','utf8')),p4['js/staffRendering.js']),require('./staff-phase3-helper-patch.json'));
 assert.equal(staff,before('js/staffRendering.js'),'Only approved Phase 3/4 staff changes');
 for(const f of ['js/staffPopup.js','css/staffPopup.css','js/staffTrackNavigation.js','css/staffTrackNavigation.css','js/tigerTeams.js','css/tigerTeams.css','build.js','.github/workflows/deploy.yml'])assert.equal(normalize(fs.readFileSync(f,'utf8')),before(f),'Protected baseline file '+f);
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
module.exports={verify,verifyFirebaseReady};
