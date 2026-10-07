// Native IndexedDB contract simulation and mocked Firestore only; no network.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const original=fs.readFileSync(path.join(__dirname,'operational-asset-conditions.test.cjs'),'utf8');
const fixture={require,__dirname,console};vm.createContext(fixture);
vm.runInContext(original.slice(0,original.indexOf('const h=harness()'))+'\nthis.fixture={harness,features,master};',fixture);
const {harness,features}=fixture.fixture;
function indexedDB(records=new Map()) {
    const state={records,reads:0,writes:0,fail:false};
    state.api={open(){const req={};queueMicrotask(()=>{req.result={transaction(_name,mode){
        const tx={error:null};let pending=0,scheduled=false;
        function complete(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{if(state.fail&&mode==='readwrite'){tx.error=new Error('quota');tx.onabort?.();}else tx.oncomplete?.();});}
        tx.objectStore=()=>({getAll(){state.reads++;pending++;const r={};queueMicrotask(()=>{r.result=[...records.values()].map(v=>structuredClone(v));r.onsuccess?.();if(--pending===0)complete();});return r;},
            put(record){state.writes++;if(!state.fail)records.set(record.eventId,structuredClone(record));complete();return {};}});
        return tx;
    }};req.onsuccess?.();});return req;}};
    return state;
}
function setup(local=indexedDB(),remote=new Map()) {
    const h=harness(),w=h.w,a=w.OperationalAssetConditions,events={};let writes=0,transactions=0,ackLoss=false;
    w.indexedDB=local.api;w.crypto=require('node:crypto').webcrypto;w.navigator.onLine=false;
    w.setTimeout=setTimeout;w.clearTimeout=clearTimeout;
    w.loadOperationalAssetOwnership=async()=>{w.operationalAssetMasterCache.data=fixture.fixture.master;return fixture.fixture.master;};
    w.addEventListener=(name,fn)=>events[name]=fn;
    w.fb.doc=(_db,col,id)=>col+'/'+id;w.fb.serverTimestamp=()=>Date.now();
    w.fb.runTransaction=async(_db,fn)=>{transactions++;assert.ok(local.records.size,'local persistence precedes remote');
        const batch=[];const result=await fn({get:async ref=>({exists:()=>remote.has(ref),data:()=>remote.get(ref)}),set:(ref,data,opts)=>batch.push([ref,data,opts])});
        for(const [ref,data,opts]of batch){remote.set(ref,opts?.merge?{...remote.get(ref),...data}:data);writes++;}
        if(ackLoss){ackLoss=false;throw new Error('ack lost');}return result;};
    // Re-evaluate to bind the online listener with the test event surface.
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/operationalAssets/conditions.js'),'utf8'),h.ctx);
    const api=w.OperationalAssetConditions;
    function draft(id,status){const feature=features.find(f=>f.properties.assetId===id),d=api.createDraft(feature);
        d.ready=true;d.gps={lat:26.6,lng:89.5,accuracy:7,capturedAt:Date.now()};d.values.status=status;return d;}
    return {h,w,a:api,local,remote,events,draft,writes:()=>writes,transactions:()=>transactions,loseAck:()=>ackLoss=true};
}
(async()=>{
    let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
    const x=setup();await x.a.loadLocal();
    let road,normal;
    async function openForm(y){
        const f=features.find(f=>f.properties.assetId==='ROAD_BTR_063');
        y.w.navigator.geolocation={getCurrentPosition(ok){ok({coords:{latitude:26.554959,longitude:89.533665,accuracy:76},timestamp:Date.now()});}};
        const popup=y.w.buildOperationalAssetPopup(f);y.w.operationalAssetPopup={oaAssetId:f.properties.assetId,getContent(){return this.content;},setContent(c){this.content=c;return this;},content:popup};
        await popup.children.find(e=>e.textContent==='✏️ UPDATE STATUS').handlers.click({stopPropagation(){}});
        const modal=y.w.document.body.children.at(-1),panel=modal.children[0];
        for(const [label,val] of [['Condition / Status','TREE FALL'],['Vehicle Passage','NOT POSSIBLE'],['Severity','SEVERE'],['Remarks','B1 offline verification — temporary road problem.']]){
            const input=panel.children.find(e=>e.tag==='label'&&e._text===label).children[0];input.value=val;input.handlers.change();
        }
        return {modal,panel,submit:()=>panel.children.find(e=>e.textContent==='SUBMIT').handlers.click()};
    }
    await check('actual offline SUBMIT closes form after IDB commit with Firebase unavailable',async()=>{
        const y=setup();await y.a.loadLocal();y.h.enable(0);y.w.fb=null;
        const form=await openForm(y);await form.submit();assert.equal(form.modal.removed,true);assert.equal(y.transactions(),0);
        const record=[...y.local.records.values()][0];assert.equal(record.syncState,'PENDING');assert.equal(record.payload.conditionLat,26.554959);
        assert.match(y.w.operationalAssetPopup.content.textContent,/SAVED OFFLINE/);assert.match(y.a.text(features.find(f=>f.properties.assetId==='ROAD_BTR_063')),/TREE FALL/);
        assert.deepEqual(Array.from(y.h.created.at(-1).coords),[26.554959,89.533665]);assert.doesNotMatch(form.panel.textContent,/Connection failed/);
    });
    await check('actual SUBMIT storage failure retains form and same stable ID on retry',async()=>{
        const y=setup();await y.a.loadLocal();const form=await openForm(y);y.local.fail=true;await form.submit();
        assert.ok(!form.modal.removed);assert.match(form.panel.textContent,/COULD NOT SAVE LOCALLY/);assert.doesNotMatch(form.panel.textContent,/SAVED OFFLINE/);
        const writes=y.local.writes;y.local.fail=false;await form.submit();assert.equal(form.modal.removed,true);assert.equal(y.local.records.size,1);assert.equal(y.local.writes,writes+1);
    });
    await check('actual online SUBMIT remote failure remains saved and pending with closed form',async()=>{
        const y=setup();await y.a.loadLocal();y.w.navigator.onLine=true;y.w.fb.runTransaction=async()=>{throw new Error('Connection failed.');};
        const form=await openForm(y);await form.submit();await y.a.synchronizeOutbox();
        assert.equal(form.modal.removed,true);assert.equal([...y.local.records.values()][0].syncState,'PENDING');
        assert.match(y.w.operationalAssetPopup.content.textContent,/SAVED — SYNC PENDING/);assert.doesNotMatch(form.panel.textContent,/Connection failed\. Draft retained/);
    });
    await check('all three asset types save offline without Firebase; complete immutable GPS and identity',async()=>{
        const fb=x.w.fb;x.w.fb=null;
        for(const [id,status] of [['ROAD_BTR_063','TREE FALL'],['APC_BTR_020','ACCESS PROBLEM'],['WH_BTR_035','DRY']]){
            const d=x.draft(id,status);if(id.startsWith('ROAD'))road=d;
            const p=x.a.saveDraft(d);assert.equal(p,x.a.saveDraft(d));assert.equal((await p).state,'SAVED OFFLINE');
            const r=x.local.records.get(d.eventId);assert.match(r.eventId,/^OA_/);assert.equal(r.payload.conditionGpsCaptured,true);assert.equal(r.payload.gpsVerified,false);
            assert.equal(r.payload.conditionGpsCapturedAt,d.gps.capturedAt);assert.equal(r.payload.conditionAccuracy,7);assert.equal(r.payload.reportedAt,undefined);assert.equal(r.syncState,'PENDING');
        }x.w.fb=fb;assert.equal(x.transactions(),0);
    });
    await check('pending popup/copy/radar/navigation; layer toggles do not reread IndexedDB',async()=>{
        x.h.enable(0);assert.match(x.a.text(road.feature),/Sync Status: PENDING/);assert.match(x.a.text(road.feature),/Field Observation Time/);
        assert.doesNotMatch(x.a.text(road.feature),/Reported Time:/);assert.deepEqual(Array.from(x.h.created.at(-1).coords),[26.6,89.5]);
        const nav=x.w.buildOperationalAssetPopup(road.feature).children.find(e=>e.textContent==='🧭 NAVIGATE');await nav.handlers.click({stopPropagation(){}});assert.match(x.w.opened[0],/26.6%2C89.5/);
        const reads=x.local.reads;x.h.disable(0);x.h.enable(0);x.a.text(road.feature);assert.equal(x.local.reads,reads);
    });
    await check('same asset normal saves next and removes local radar while remaining pending',async()=>{
        normal=x.draft('ROAD_BTR_063','OPEN / CLEAR');await x.a.saveDraft(normal);
        assert.equal(x.local.records.get(normal.eventId).predecessor,road.eventId);assert.equal(x.a.details(road.feature).problem,null);
        assert.match(x.a.text(road.feature),/Sync Status: PENDING/);
    });
    await check('database reopen restores reports and permanent point GPS',async()=>{
        const reopened=setup(indexedDB(x.local.records),x.remote);await reopened.a.loadLocal();assert.equal(reopened.a.outbox.size,4);
        const water=features.find(f=>f.properties.assetId==='WH_BTR_035');assert.equal(reopened.a.details(water).point.lat,water.geometry.coordinates[1]);
        assert.equal(reopened.a.outbox.get(road.eventId).payload.conditionGpsCapturedAt,road.gps.capturedAt);
    });
    await check('storage failure retains draft ID, fields and GPS and cannot report saved',async()=>{
        const d=x.draft('ROAD_BTR_001','TREE FALL'),gps=d.gps,id=d.eventId;x.local.fail=true;
        await assert.rejects(x.a.saveDraft(d),/COULD NOT SAVE LOCALLY/);assert.equal(d.gps,gps);assert.equal(d.eventId,id);assert.equal(d.committed,false);x.local.fail=false;
    });
    await check('field-submit stale GPS rejected before persistence',async()=>{
        const d=x.draft('ROAD_BTR_001','TREE FALL');d.gps.capturedAt-=120000;await assert.rejects(x.a.saveDraft(d),/stale/);assert.ok(!x.local.records.has(d.eventId));
    });
    await check('online event automatically drains queue; online save is durable before transaction',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_010','TREE FALL');await y.a.saveDraft(d);
        y.w.navigator.onLine=true;await y.events.online();assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.writes(),2);
        const next=y.draft('ROAD_BTR_011','TREE FALL');assert.equal((await y.a.saveDraft(next)).state,'SAVED — SYNC PENDING');await y.a.synchronizeOutbox();assert.equal(y.local.records.get(next.eventId).syncState,'SYNCED');
    });
    await check('hours-old durable GPS replays in order through existing transaction and links resolution',async()=>{
        // Advance the sync clock rather than changing the stored observation.
        const realDate=Date; x.w.Date=class extends realDate {static now(){return realDate.now()+5*3600000;}};
        x.w.navigator.onLine=true;const p=x.a.synchronizeOutbox();assert.equal(p,x.a.synchronizeOutbox());await p;
        const old=x.remote.get('operational_asset_condition_events/'+road.eventId),clear=x.remote.get('operational_asset_condition_events/'+normal.eventId);
        assert.equal(old.conditionGpsCapturedAt,road.gps.capturedAt);assert.equal(clear.previousConditionEventId,road.eventId);assert.equal(clear.resolvesEventId,road.eventId);
        assert.equal(x.remote.get('operational_asset_status/ROAD_BTR_063').hasActiveProblem,false);assert.equal(x.writes(),8);
        for(const r of x.local.records.values())assert.equal(r.syncState,'SYNCED');x.w.Date=realDate;
    });
    await check('commit acknowledgement loss retries same event with no summary rollback or duplicate',async()=>{
        x.w.navigator.onLine=false;const d=x.draft('ROAD_BTR_002','TREE FALL');await x.a.saveDraft(d);x.w.navigator.onLine=true;x.loseAck();await x.a.synchronizeOutbox();
        assert.equal(x.local.records.get(d.eventId).syncState,'PENDING');const writes=x.writes();const newer={currentConditionEventId:'newer',hasActiveProblem:true};x.remote.set('operational_asset_status/ROAD_BTR_002',newer);
        await x.a.synchronizeOutbox();assert.equal(x.writes(),writes);assert.equal(x.remote.get('operational_asset_status/ROAD_BTR_002'),newer);assert.equal(x.local.records.get(d.eventId).syncState,'SYNCED');
    });
    await check('newer server conflict retained; queued descendants blocked; server UI reconciles',async()=>{
        x.w.navigator.onLine=false;const d=x.draft('ROAD_BTR_003','TREE FALL');await x.a.saveDraft(d);const n=x.draft('ROAD_BTR_003','OPEN / CLEAR');await x.a.saveDraft(n);
        const newer={assetId:'ROAD_BTR_003',currentConditionEventId:'foreign',currentStatus:'ROAD DAMAGED',hasActiveProblem:true,currentProblemLat:26.7,currentProblemLng:89.6,updatedAt:Date.now()+10000};
        x.remote.set('operational_asset_status/ROAD_BTR_003',newer);x.w.navigator.onLine=true;await x.a.synchronizeOutbox();
        assert.equal(x.local.records.get(d.eventId).syncState,'CONFLICT');assert.equal(x.local.records.get(n.eventId).syncState,'PENDING');assert.ok(!x.remote.has('operational_asset_condition_events/'+d.eventId));
        assert.match(x.a.text(d.feature),/SYNC CONFLICT — REVIEW REQUIRED/);assert.match(x.a.text(d.feature),/ROAD DAMAGED/);assert.equal(x.a.details(d.feature).problem.currentProblemLat,26.7);
    });
    await check('reporter mismatch and geographic authorization prevent replay and pending disclosure',async()=>{
        x.w.navigator.onLine=false;const d=x.draft('ROAD_BTR_004','TREE FALL');await x.a.saveDraft(d);x.w.navigator.onLine=true;
        x.w.userProfile={role:'ADMIN',name:'Other'};const count=x.transactions();await x.a.synchronizeOutbox();assert.equal(x.transactions(),count);assert.doesNotMatch(x.a.text(d.feature),/Field Observation Time/);
        assert.match(x.a.text(d.feature),/another user/);x.w.userProfile={role:'VILLAGER'};assert.doesNotMatch(x.a.text(d.feature),/PENDING|TREE FALL/);
    });
    let reconnectChecks=0;
    const reconnect=async(name,fn)=>{await check('reconnect: '+name,fn);reconnectChecks++;};
    const flush=()=>new Promise(resolve=>setImmediate(resolve));
    await reconnect('A reload with profile unavailable consumes no retry; profile-ready replays same event',async()=>{
        const seed=setup();await seed.a.loadLocal();const d=seed.draft('ROAD_BTR_063','TREE FALL');await seed.a.saveDraft(d);
        const y=setup(indexedDB(seed.local.records));y.w.userProfile=null;y.w.navigator.onLine=true;await y.a.synchronizeOutbox();
        assert.equal(y.transactions(),0);assert.equal(y.local.records.get(d.eventId).retryCount,0);
        y.w.userProfile={role:'ADMIN'};y.events.userProfileLoaded();await y.a.synchronizeOutbox();
        assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.local.records.get(d.eventId).eventId,d.eventId);assert.equal(y.writes(),2);
    });
    await reconnect('Firebase helpers/master readiness recover with all asset layers OFF and no status listener',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);
        y.w.navigator.onLine=true;const fb=y.w.fb;y.w.fb={runTransaction:fb.runTransaction};await y.a.synchronizeOutbox();
        assert.equal(y.local.records.get(d.eventId).retryCount,0);assert.equal(y.transactions(),0);
        y.w.operationalAssetMasterCache.data=null;y.w.fb=fb;
        y.w.OperationalAssetConditions.sync();await y.a.synchronizeOutbox();
        assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.h.listeners.length,0);assert.equal(y.h.layers.size,0);
        const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.match(html,/window\.firebaseReady\s*=\s*true;\s*window\.OperationalAssetConditions\?\.sync\(\)/);
    });
    await reconnect('B network failure increments once and persists explicit lastError',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);
        y.w.navigator.onLine=true;y.w.fb.runTransaction=async()=>{throw new Error('Network unavailable');};await y.a.synchronizeOutbox();
        const r=y.local.records.get(d.eventId);assert.equal(r.syncState,'PENDING');assert.equal(r.retryCount,1);assert.equal(r.lastResult,'RETRYABLE_FAILURE');assert.match(r.lastError,/Network unavailable/);
    });
    await reconnect('C success is SYNCED; undefined/null/false transaction results are explicit failures',async()=>{
        for(const invalid of [undefined,null,false]){
            const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;
            y.w.fb.runTransaction=async()=>invalid;await y.a.synchronizeOutbox();const r=y.local.records.get(d.eventId);
            assert.equal(r.syncState,'PENDING');assert.equal(r.retryCount,1);assert.match(r.lastError,/Invalid Firestore synchronization result/);
        }
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;await y.a.synchronizeOutbox();assert.equal(y.local.records.get(d.eventId).lastResult,'SYNCED');
    });
    await reconnect('D existing matching event is ALREADY_SYNCED with no duplicate or summary rollback',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);
        y.remote.set('operational_asset_condition_events/'+d.eventId,{...y.local.records.get(d.eventId).payload,previousConditionEventId:'server-derived',reportedAt:Date.now()});
        const newer={currentConditionEventId:'newer',currentStatus:'ROAD DAMAGED'};y.remote.set('operational_asset_status/ROAD_BTR_063',newer);
        y.w.navigator.onLine=true;await y.a.synchronizeOutbox();assert.equal(y.local.records.get(d.eventId).lastResult,'ALREADY_SYNCED');assert.equal(y.writes(),0);assert.equal(y.remote.get('operational_asset_status/ROAD_BTR_063'),newer);
    });
    await reconnect('E baseline mismatch is CONFLICT with meaningful error and no writes',async()=>{
        const y=setup();await y.a.loadLocal();y.h.enable(0);y.h.listeners[0].next(y.h.snapshot([['ROAD_BTR_063',{currentConditionEventId:'OA_a39d5f62-baseline',currentStatus:'OPEN / CLEAR'}]]));
        const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);const r=y.local.records.get(d.eventId);assert.equal(r.baselineKnown,true);assert.equal(r.predecessor,null);
        y.remote.set('operational_asset_status/ROAD_BTR_063',{currentConditionEventId:'newer-event',currentStatus:'ROAD DAMAGED'});y.w.navigator.onLine=true;await y.a.synchronizeOutbox();
        assert.equal(y.local.records.get(d.eventId).syncState,'CONFLICT');assert.match(y.local.records.get(d.eventId).lastError,/SYNC CONFLICT/);assert.equal(y.writes(),0);
    });
    await reconnect('F normalized owner identity survives reload; genuine mismatch explains protection',async()=>{
        const seed=setup();await seed.a.loadLocal();seed.w.userProfile={id:'DHIRAJ_KAMI',cleanName:'DHIRAJ KAMI',phone:'999 111 2222',role:'ADMIN'};
        const d=seed.draft('ROAD_BTR_063','TREE FALL');await seed.a.saveDraft(d);const before=JSON.stringify(seed.local.records.get(d.eventId).payload);
        const y=setup(indexedDB(seed.local.records));y.w.userProfile={uid:'different-id-representation',name:'  dhiraj   kami ',phone:'9991112222',role:'ADMIN'};
        y.w.navigator.onLine=true;await y.a.synchronizeOutbox();assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(JSON.stringify(y.local.records.get(d.eventId).payload),before);
        const z=setup(indexedDB(seed.local.records));const record={...seed.local.records.get(d.eventId),syncState:'PENDING',retryCount:0,lastError:null};z.local.records.set(d.eventId,record);
        z.w.userProfile={name:'OTHER REPORTER',phone:'8881112222',role:'ADMIN'};z.w.navigator.onLine=true;await z.a.synchronizeOutbox();
        assert.equal(z.transactions(),0);assert.equal(z.local.records.get(d.eventId).retryCount,0);assert.equal(z.local.records.get(d.eventId).lastResult,'OWNER_MISMATCH');assert.match(z.local.records.get(d.eventId).lastError,/original reporter/);
    });
    await reconnect('legacy serialized ownerKey and canonical-name/profile-id aliases remain compatible',async()=>{
        for(const current of [{name:' dhiraj   kami ',role:'ADMIN'},{id:'DHIRAJ KAMI',role:'ADMIN'},
            {uid:'firebase-uid',cleanName:'DHIRAJ KAMI',role:'ADMIN'}]){
            const seed=setup();await seed.a.loadLocal();seed.w.userProfile={id:'DHIRAJ_KAMI',cleanName:'DHIRAJ KAMI',role:'ADMIN'};
            const d=seed.draft('ROAD_BTR_063','TREE FALL');await seed.a.saveDraft(d);const record=seed.local.records.get(d.eventId);delete record.profile;
            const y=setup(indexedDB(seed.local.records));y.w.userProfile=current;y.w.navigator.onLine=true;await y.a.synchronizeOutbox();
            assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.writes(),2);
        }
    });
    await reconnect('G/H old ambiguous retry journal repaired; same event/GPS survive subsequent retry',async()=>{
        const seed=setup();await seed.a.loadLocal();const d=seed.draft('ROAD_BTR_063','TREE FALL');await seed.a.saveDraft(d);
        const old={...seed.local.records.get(d.eventId),retryCount:1,lastError:null};seed.local.records.set(d.eventId,old);
        const y=setup(indexedDB(seed.local.records));await y.a.loadLocal();assert.match(y.local.records.get(d.eventId).lastError,/interrupted or not acknowledged/);
        assert.equal(y.local.records.get(d.eventId).retryCount,1);y.w.navigator.onLine=true;await y.a.synchronizeOutbox();
        const r=y.local.records.get(d.eventId);assert.equal(r.eventId,d.eventId);assert.deepEqual(r.payload,old.payload);assert.equal(r.syncState,'SYNCED');assert.equal(r.retryCount,2);
    });
    await reconnect('unresolved Firebase promise gets bounded diagnostic; retries never overlap active request',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;
        let deadline,rejectRemote,attempts=0;y.w.setTimeout=(fn,ms)=>{assert.equal(ms,30000);deadline=fn;return 1;};y.w.clearTimeout=()=>{};
        y.w.fb.runTransaction=()=>{attempts++;return new Promise((_resolve,reject)=>rejectRemote=reject);};
        const flight=y.a.synchronizeOutbox();await flush();assert.equal(attempts,1);assert.match(y.local.records.get(d.eventId).lastError,/waiting for Firebase/);
        deadline();await flight;assert.match(y.local.records.get(d.eventId).lastError,/timed out/);await y.a.synchronizeOutbox();assert.equal(attempts,1);
        rejectRemote(new Error('Late network failure'));await flush();assert.match(y.local.records.get(d.eventId).lastError,/Late network failure/);assert.equal(y.local.records.get(d.eventId).retryCount,1);
    });
    await reconnect('late confirmed commit after deadline still becomes SYNCED without a second transaction',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;
        let deadline,ack,attempts=0;y.w.setTimeout=fn=>{deadline=fn;return 1;};y.w.clearTimeout=()=>{};
        y.w.fb.runTransaction=()=>{attempts++;return new Promise(resolve=>ack=resolve);};
        const flight=y.a.synchronizeOutbox();await flush();deadline();await flight;ack({state:'committed'});await flush();await y.a.synchronizeOutbox();
        assert.equal(attempts,1);assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');
    });
    await reconnect('expired transaction callback cannot perform late writes; subsequent same-ID retry is safe',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;
        let deadline,release;const run=y.w.fb.runTransaction;y.w.setTimeout=fn=>{deadline=fn;return 1;};y.w.clearTimeout=()=>{};
        y.w.fb.runTransaction=async(db,callback)=>{await new Promise(resolve=>release=resolve);return run(db,callback);};
        const flight=y.a.synchronizeOutbox();await flush();deadline();await flight;release();await flush();assert.equal(y.writes(),0);assert.equal(y.local.records.get(d.eventId).syncState,'PENDING');
        y.w.fb.runTransaction=run;y.w.setTimeout=setTimeout;y.w.clearTimeout=clearTimeout;await y.a.synchronizeOutbox();
        assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.writes(),2);
    });
    await reconnect('local acknowledgement failure leaves explanatory durable journal for same-event recovery',async()=>{
        const y=setup();await y.a.loadLocal();const d=y.draft('ROAD_BTR_063','TREE FALL');await y.a.saveDraft(d);y.w.navigator.onLine=true;
        const real=y.w.fb.runTransaction;y.w.fb.runTransaction=async(...args)=>{const result=await real(...args);y.local.fail=true;return result;};await y.a.synchronizeOutbox();
        const r=y.local.records.get(d.eventId);assert.equal(r.syncState,'PENDING');assert.match(r.lastError,/waiting for Firebase/);assert.equal(r.retryCount,1);
        y.local.fail=false;y.w.fb.runTransaction=real;await y.a.synchronizeOutbox();assert.equal(y.local.records.get(d.eventId).syncState,'SYNCED');assert.equal(y.writes(),2);
    });
    console.log(`All ${reconnectChecks} reconnect regression groups passed.`);
    console.log(`All ${checks} offline scenario groups passed. Mocked storage/Firebase only.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
