const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function restoreRecovery(source){for(const {before,after} of [...require('./firestore-recovery-patch.json')].reverse()){
 if(source.includes(after)){assert.equal(source.split(after).length,2);source=source.replace(after,before);}}
 return source;}
module.exports={restoreRecovery};
if(require.main===module)(async()=>{
 let now=0,reads=0,subscriptions=0,unsubscribes=0,snapshot,error,resolveRead,rejectRead;
 const timers=new Map();let sequence=0;
 const c={console:{info(){}},URLSearchParams,Date:class extends Date{static now(){return now;}},
 location:{search:'?firestoreRecovery=1'},userProfile:{cleanName:'SYNTHETIC',role:'ADMIN'},db:{},
 navigator:{onLine:true},document:{getElementById(){return c.label;}},label:{style:{}},
 addEventListener(){},setTimeout(fn,delay){timers.set(++sequence,{fn,at:now+delay});return sequence;},clearTimeout(id){timers.delete(id);},
 fb:{onSnapshot(q,s,e){subscriptions++;snapshot=s;error=e;return()=>unsubscribes++;},
 getDocs(){reads++;return new Promise((r,j)=>{resolveRead=r;rejectRead=j;});}}};c.window=c;
 vm.createContext(c);vm.runInContext(fs.readFileSync('js/firestoreRecovery.js','utf8'),c);
 const recovery=c.FirestoreRecovery,flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
 const tick=async ms=>{now+=ms;for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn();}await flush();};
 assert(recovery.allowStaff());c.staffUnsubscribe=recovery.listenStaff({},()=>{});
 for(let i=0;i<100;i++)assert.equal(recovery.allowStaff(),false);assert.equal(subscriptions,1);
 error({code:'resource-exhausted'});assert.equal(c.staffListenerActive,false);assert.equal(unsubscribes,1);
 await tick(59999);assert.equal(recovery.allowStaff(),false);await tick(1);assert(recovery.allowStaff());
 recovery.listenStaff({},()=>{});snapshot({metadata:{fromCache:true}});error({code:'resource-exhausted'});
 assert.equal(recovery.report().failures,2);await tick(120000);assert(recovery.allowStaff());recovery.listenStaff({},()=>{});error({code:'resource-exhausted'});
 await tick(999999);assert.equal(recovery.allowStaff(),false,'Three failures pause automatic attempts');
 c.userProfile={cleanName:'OTHER SYNTHETIC',role:'STAFF',range:'A'};assert(recovery.allowStaff());recovery.listenStaff({},()=>{});error({code:'permission-denied'});
 await tick(999999);assert.equal(recovery.allowStaff(),false);c.userProfile.range='B';assert(recovery.allowStaff());
 let delivered=0;recovery.listenStaff({},()=>delivered++);const old=snapshot;c.userProfile.range='C';assert(recovery.allowStaff());old({metadata:{fromCache:false}});assert.equal(delivered,0);
 recovery.listenStaff({},()=>delivered++);snapshot({metadata:{fromCache:false}});assert.equal(recovery.report().failures,0);
 const a=recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000),b=recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000);assert.equal(a,b);a.catch(()=>{});await flush();assert.equal(reads,1);
 await tick(7000);await assert.rejects(a,/PROFILE_QUERY_TIMEOUT/);await assert.rejects(recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000));assert.equal(reads,1);
 await tick(120000);await assert.rejects(recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000));assert.equal(reads,1,'Unsettled SDK query stays deduplicated after cooldown');
 resolveRead({docs:[]});await flush();const next=recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000);next.catch(()=>{});await flush();assert.equal(reads,2);rejectRead({code:'permission-denied'});await assert.rejects(next);await flush();
 await assert.rejects(recovery.profileSnapshot('staff_profiles','synthetic-id',{},7000));assert.equal(reads,2);
 for(let attempt=0;attempt<3;attempt++){
   const pending=recovery.profileSnapshot('staff_profiles','quota-fixture',{},7000);pending.catch(()=>{});await flush();
   rejectRead({code:'resource-exhausted'});await assert.rejects(pending);await flush();await tick(60000);
 }
 const boundedReads=reads;await assert.rejects(recovery.profileSnapshot('staff_profiles','quota-fixture',{},7000));assert.equal(reads,boundedReads,'Profile quota recovery has a three-failure budget');
 recovery.stop();assert(recovery.allowStaff());recovery.listenStaff({},()=>{});error({code:'unavailable'});
 await tick(14999);assert.equal(recovery.allowStaff(),false);await tick(1);assert(recovery.allowStaff());
 recovery.listenStaff({},()=>{});snapshot({metadata:{fromCache:false}});assert.equal(recovery.report().failures,0);
 assert.equal(recovery.classify({code:'firestore/unavailable'}),'unavailable');assert.equal(recovery.classify(new Error('PROFILE_QUERY_TIMEOUT')),'timeout');
 recovery.profileUnavailable();assert.match(c.label.textContent,/INTERNET ONLINE/);assert.equal(c.userProfile.range,'C');
 console.log('PASS quota cooldown/budget, cache snapshot does not reset failures, singleton/repeated calls, permission denial, scope changes/stale callbacks, server recovery, shared profile request, timeout retention/late settlement, no retry storm, service-vs-internet state. Synthetic offline SDK only.');
})().catch(e=>{console.error(e);process.exitCode=1});
