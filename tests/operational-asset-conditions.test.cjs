// Isolated Patch-1 fixtures. No production Firebase requests or writes.
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const acorn = require('acorn');
const root = path.join(__dirname,'..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const source = fs.readFileSync(path.join(root,'js/operationalAssets/conditions.js'),'utf8');
const css = fs.readFileSync(path.join(root,'css/operationalAssets.css'),'utf8');
const functions = new Map(); let scripts = 0;
for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!m[2].trim() || /application\/(?:ld\+)?json/.test(m[1])) continue;
    const ast = acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*["']module["']/.test(m[1])?'module':'script'});
    scripts++;
    for (const n of ast.body) if (n.type === 'FunctionDeclaration') functions.set(n.id.name,m[2].slice(n.start,n.end));
}
acorn.parse(source,{ecmaVersion:'latest'});
const master = JSON.parse(fs.readFileSync(path.join(root,'geojson/operational_asset_ownership.json'),'utf8'));
const datasets = ['forest_roads','apc','waterholes'].map(name => JSON.parse(fs.readFileSync(path.join(root,'geojson/'+name+'.geojson'),'utf8')));
const features = datasets.flatMap(d=>d.features);
let passed = 0;
function test(name,fn) { fn(); passed++; console.log('PASS '+name); }
class Element {
    constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.handlers={};this.style={setProperty:(k,v)=>this.style[k]=v};this._text='';}
    set textContent(v){this._text=String(v);this.children=[];}
    get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
    appendChild(c){this.children.push(c);return c;}
    setAttribute(k,v){this.attrs[k]=v;}
    addEventListener(k,v){this.handlers[k]=v;}
    remove(){this.removed=true;} select(){}
}
function harness(){
    const layers = new Set(), panes = new Map(), events = {}, created = [], listeners = [];
    let stops=0;
    const map={hasLayer:l=>layers.has(l),getPane:k=>panes.get(k),createPane:k=>{const p={style:{}};panes.set(k,p);return p;},on:(names,fn)=>{for(const n of names.split(' '))(events[n] ||= []).push(fn);}};
    const emit=(name,event)=>{for(const fn of events[name]||[])fn(event);};
    const L={divIcon:options=>({options}),DomEvent:{disableClickPropagation(){}},
        marker:(coords,options)=>{
            const marker={coords,options,element:new Element('div'),handlers:{},setIcon(icon){this.options.icon=icon;return this;},on(n,f){this.handlers[n]=f;return this;},
                setLatLng(c){this.coords=c;return this;},getLatLng(){return this.coords;},getElement(){return this.element;},addTo(){layers.add(this);emit('layeradd',{layer:this});return this;},remove(){layers.delete(this);emit('layerremove',{layer:this});}};
            created.push(marker);return marker;
        },popup:()=>({setLatLng(c){this.coords=c;return this;},setContent(c){this.content=c;return this;},getContent(){return this.content;},openOn(){emit('popupopen',{popup:this});return this;}})};
    const w={map,L,navigator:{},db:{},userProfile:{role:'ADMIN'},gisFilter:{},addEventListener(){},open(...args){w.opened=args;},
        console:{warn(){}},operationalAssetMasterCache:{data:master},
        document:{createElement:t=>new Element(t),createTextNode:t=>{const e=new Element('#text');e.textContent=t;return e;},body:new Element('body'),execCommand:()=>true},
        fb:{collection:(_db,name)=>name,onSnapshot:(collection,next,error)=>{assert.equal(collection,'operational_asset_status');listeners.push({next,error});return ()=>{stops++;};}},
        operationalAssetState:Object.fromEntries(datasets.map((data,i)=>[i,{data,assetType:data.features[0].properties.assetType,layer:{options:{},eachLayer(){}}}])),
        refreshOperationalAssetVisibility(){},syncOperationalAssetInteraction(){},loadOperationalAssetLayer:async()=>true,
        operationalAssetsCanInteract(){return !w.__offenceMapInteractionActive && !w.mapAction;},calculateOperationalRoadLengthKm:()=>1.23};
    w.window=w;
    const ctx=vm.createContext(w);
    for(const name of ['operationalAssetDivision','operationalAssetRange','operationalAssetProfileScope','getOperationalAssetOwnership','canViewOperationalAsset','operationalAssetMatchesGIS','formatOperationalAssetValue','createOperationalAssetPoint'])vm.runInContext(functions.get(name),ctx);
    vm.runInContext(source,ctx);
    function snapshot(records){return {docs:records.map(([id,data])=>({id,data:()=>data})),docChanges:()=>records.map(([id,data])=>({type:'added',doc:{id,data:()=>data}}))};}
    return {w,ctx,layers,panes,created,listeners,stops:()=>stops,snapshot,enable:i=>{layers.add(w.operationalAssetState[i].layer);w.OperationalAssetConditions.sync();},disable:i=>{layers.delete(w.operationalAssetState[i].layer);w.OperationalAssetConditions.sync();}};
}
const h=harness(), api=h.w.OperationalAssetConditions;
const road=features.find(f=>f.properties.assetId==='ROAD_BTR_063');
const apc=features.find(f=>f.properties.assetId==='APC_BTR_020');
const water=features.find(f=>f.properties.assetId==='WH_BTR_035');
test('all inline scripts and new module parse',()=>assert.ok(scripts>0));
test('Phase-A role counts and exact WestDamanpur assets',()=>{
    for(const [profile,count] of [[{role:'ADMIN'},186],[{role:'CCF',circle:'BTR'},178],[{role:'CCF',circle:'WLN'},0],
        ...['DFO','ADFO'].flatMap(role=>[[{role,division:'BTR_W'},98],[{role,division:'BTR_E'},93]]),[{role:'VILLAGER'},0]])assert.equal(features.filter(f=>h.w.canViewOperationalAsset(f,profile)).length,count);
    for(const role of ['STAFF','TEAM LEADER'])assert.deepEqual(features.filter(f=>h.w.canViewOperationalAsset(f,{role,division:'BTR_W',range:'West Damanpur'})).map(f=>f.properties.assetId),['ROAD_BTR_063','APC_BTR_020','WH_BTR_035']);
});
test('APC/waterhole visible icons smaller, touch targets preserved',()=>{
    for(const f of [apc,water]){const marker=h.w.createOperationalAssetPoint(f,[0,0]);assert.deepEqual(Array.from(marker.options.icon.options.iconSize),[32,32]);assert.match(marker.options.icon.options.html,/oa-point-symbol/);}
    assert.match(css,/width: 24px; height: 24px/);assert.match(css,/font-size: 19px/);
});
test('road style preserved and no invented road point',()=>{
    assert.match(functions.get('initializeOperationalAssetLayers'),/color: '#f4b942', weight: 3, opacity: 0.95/);
    assert.equal(api.details(road).point,null);assert.doesNotMatch(api.text(road),/GPS Location:/);
});
test('normal APC/waterhole master GPS and complete plain-text copy',()=>{
    h.w.latestGps={lat:1,lng:2};
    for(const f of [apc,water]){const text=api.text(f);assert.ok(text.includes(f.geometry.coordinates[1].toFixed(6)+', '+f.geometry.coordinates[0].toFixed(6)));assert.match(text,/GPS Location:/);assert.match(text,/BTRGUARD — OPERATIONAL ASSET STATUS/);assert.doesNotMatch(text,/<div/);assert.match(h.w.buildOperationalAssetPopup(f).textContent,/🧭 NAVIGATE/);}
    assert.match(api.text(apc),/Manning Status:/);assert.match(api.text(water),/Season: Unknown/);
});
test('normal road copy uses approved ownership and calculated length',()=>{
    const text=api.text(road);assert.match(text,/BTR_W/);assert.match(text,/WestDamanpur/);assert.match(text,/1.23 km/);assert.doesNotMatch(h.w.buildOperationalAssetPopup(road).textContent,/🧭 NAVIGATE/);
});
test('one listener for multiple enabled layers, empty collection no problems',()=>{
    assert.equal(h.listeners.length,0);h.enable(0);h.enable(1);h.enable(2);assert.equal(h.listeners.length,1);
    h.listeners[0].next(h.snapshot([]));assert.equal(h.created.filter(m=>m.options.pane==='operationalAssetProblemsPane').length,0);
});
const id=road.properties.assetId, report={assetId:id,hasActiveProblem:true,currentStatus:'TREE FALL',currentProblemLat:26.55,currentProblemLng:89.52,currentProblemAccuracy:6,remarks:'Tree across road'};
test('real-record fixture produces exact problem point and current popup',()=>{
    h.listeners[0].next(h.snapshot([[id,report]]));const marker=h.created.at(-1);assert.deepEqual(Array.from(marker.coords),[26.55,89.52]);assert.equal(h.panes.get('operationalAssetProblemsPane').style.zIndex,'570');assert.match(api.text(road),/TREE FALL/);marker.handlers.click();assert.match(h.w.operationalAssetPopup.content.textContent,/CURRENT CONDITION/);
});
test('incremental update moves existing marker, refresh never duplicates',()=>{
    const count=h.created.length;h.listeners[0].next(h.snapshot([[id,{...report,currentProblemLat:26.56}]]));api.sync();api.sync();assert.equal(h.created.length,count);assert.equal(h.created.at(-1).coords[0],26.56);
});
test('Village/Offence/map ownership disables problem interaction',()=>{
    const marker=h.created.at(-1);
    for(const flag of ['__villageInteractionActive','__offenceMapInteractionActive','mapAction']){h.w[flag]=true;api.sync();assert.equal(marker.element.style['pointer-events'],'none');h.w[flag]=false;}
    api.sync();assert.equal(marker.element.style['pointer-events'],'auto');
});
test('layer OFF removes problem, last OFF unsubscribes, cache redisplays',()=>{
    const marker=h.created.at(-1);h.disable(0);assert.equal(h.layers.has(marker),false);h.disable(1);h.disable(2);assert.equal(h.stops(),1);h.enable(0);assert.equal(h.listeners.length,2);assert.ok(h.layers.has(h.created.at(-1)));h.listeners[1].next(h.snapshot([]));assert.equal(h.layers.has(h.created.at(-1)),false);
});
test('resolution/invalid coordinates remove markers',()=>{
    h.listeners[1].next(h.snapshot([[id,report]]));let marker=h.created.at(-1);
    h.listeners[1].next(h.snapshot([[id,{...report,hasActiveProblem:false}]]));assert.equal(h.layers.has(marker),false);
    h.listeners[1].next(h.snapshot([[id,{...report,currentProblemLat:NaN}]]));assert.equal(h.layers.has(marker),false);
});
test('unauthorized status suppressed and profile refresh removes markers',()=>{
    h.w.userProfile={role:'STAFF',division:'BTR_W',range:'West Damanpur'};
    const other=features.find(f=>f.properties.assetId.startsWith('ROAD')&&!h.w.canViewOperationalAsset(f,h.w.userProfile));
    h.listeners[1].next(h.snapshot([[other.properties.assetId,{...report,assetId:other.properties.assetId}],[id,report]]));
    assert.doesNotMatch(api.text(other),/TREE FALL/);assert.match(api.text(road),/TREE FALL/);
    h.w.userProfile={role:'VILLAGER'};api.sync();assert.ok(![...h.layers].some(m=>m.options?.pane==='operationalAssetProblemsPane'));
});
test('CSS-only compact radar, reduced motion, no timers or writes',()=>{
    assert.match(css,/width: 8px; height: 8px/);assert.match(css,/scale\(3\)/);assert.match(css,/2.4s/);assert.match(css,/prefers-reduced-motion: reduce/);assert.match(css,/animation: none/);
    assert.doesNotMatch(source,/setInterval|requestAnimationFrame|uploadBytes|setDoc|updateDoc/);
    assert.equal((source.match(/w\.setTimeout\(/g)||[]).length,1); // One active sync acknowledgement deadline, never polling.
    assert.doesNotMatch(css,/filter:|blur\(/);
});
test('isolated navigation accepts zero and rejects invalid destinations',()=>{
    assert.equal(h.w.operationalAssetsNavigate(0,0),true);assert.match(h.w.opened[0],/destination=0%2C0/);assert.equal(h.w.operationalAssetsNavigate(91,0),false);
});
console.log(`All ${passed} Patch-1 checks passed; ${scripts} inline scripts parsed. No production data touched.`);

(async()=>{
    const {webcrypto}=require('node:crypto');
    const x=harness(), w=x.w, a=w.OperationalAssetConditions, store=new Map();
    w.crypto=webcrypto;let gpsCalls=0,failGPS=false,failWrite=false,commits=0,stampCalls=0;
    w.latestGps={lat:1,lng:2};w.isDutyActive=true;w.currentSessionId='existing-duty';
    w.navigator.geolocation={getCurrentPosition:(ok,fail,options)=>{gpsCalls++;assert.equal(options.maximumAge,0);assert.equal(options.enableHighAccuracy,true);if(failGPS)fail({message:'No signal'});else ok({coords:{latitude:26.6,longitude:89.5,accuracy:120},timestamp:Date.now()});}};
    w.fb.doc=(_db,collection,id)=>collection+'/'+id;
    w.fb.serverTimestamp=()=>{stampCalls++;return {server:true};};
    w.fb.runTransaction=async(_db,callback)=>{
        const writes=[];
        const result=await callback({get:async ref=>({exists:()=>store.has(ref),data:()=>store.get(ref)}),set:(ref,data,options)=>writes.push([ref,data,options])});
        if(failWrite)throw new Error('Network uncertain');
        for(const [ref,data,options]of writes){assert.match(ref,/^operational_asset_(condition_events|status)\//);store.set(ref,options?.merge?{...store.get(ref),...data}:data);}
        if(writes.length){assert.equal(writes.length,2);commits++;}
        return result;
    };
    async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
    function draft(f,values){const d=a.createDraft(f,store.get('operational_asset_status/'+f.properties.assetId)?.currentConditionEventId);d.ready=true;Object.assign(d.values,values);return d;}
    await check('asset forms contain required choices and no photo/history workflow',async()=>{
        assert.equal(a.choices.FOREST_ROAD.status.length,12);assert.equal(a.choices.WATERHOLE.status.length,10);assert.equal(a.choices.ANTI_POACHING_CAMP.status.length,12);
        assert.match(w.buildOperationalAssetPopup(apc).textContent,/✏️ UPDATE STATUS/);assert.doesNotMatch(source,/type\s*=\s*['"]file|uploadBytes|condition-history/);
    });
    await check('actual isolated modal fields, auto-selection and GPS display',async()=>{
        w.fb.getDoc=async()=>({exists:()=>false});
        for(const feature of [road,water,apc]){
            const popup=w.buildOperationalAssetPopup(feature),button=popup.children.find(el=>el.textContent==='✏️ UPDATE STATUS');
            await button.handlers.click({stopPropagation(){}});
            const modal=w.document.body.children.at(-1),panel=modal.children[0];
            assert.equal(modal.attrs.role,'dialog');assert.ok(panel.textContent.includes(feature.properties.assetId));
            const fields=panel.children.filter(el=>el.tag==='label');assert.ok(fields.some(el=>el._text==='Remarks'));
            const find=label=>fields.find(el=>el._text===label).children[0];
            if(feature===road){assert.ok(find('Vehicle Passage'));assert.ok(find('Severity'));}
            if(feature===water){const status=find('Condition / Status');status.value='DRY';status.handlers.change();assert.equal(find('Water Level').value,'NO WATER');}
            if(feature===apc){const manning=find('Manning Status');manning.value='UNMANNED';manning.handlers.change();assert.equal(find('Staff Present').value,'0');assert.ok(find('RT Set'));assert.ok(find('Communication'));assert.ok(find('Operational'));}
            assert.match(panel.textContent,/Accuracy: 120 m/);assert.match(panel.textContent,/Approximate fix/);
            panel.children.find(el=>el.textContent==='CLOSE').handlers.click();
        }
        gpsCalls=0;
    });
    await check('DRY forces NO WATER; UNMANNED forces zero; numeric validation',async()=>{
        const d=draft(water,{status:'DRY'});assert.equal(a.normalizeFields('WATERHOLE',d.values).waterLevel,'NO WATER');
        const c=draft(apc,{manningStatus:'UNMANNED',staffPresent:9});assert.equal(a.normalizeFields('ANTI_POACHING_CAMP',c.values).staffPresent,0);
        assert.throws(()=>a.normalizeFields('ANTI_POACHING_CAMP',{...c.values,staffPresent:-1}));
    });
    await check('fresh GPS failure/retry accepts poor fresh accuracy without duty mutation',async()=>{
        const d=draft(road,{});failGPS=true;await assert.rejects(a.captureGPS(d),/GPS failed/);assert.equal(d.gps,null);failGPS=false;await a.captureGPS(d);
        assert.equal(d.gps.accuracy,120);assert.equal(gpsCalls,2);assert.deepEqual(w.latestGps,{lat:1,lng:2});assert.equal(w.currentSessionId,'existing-duty');
    });
    let roadDraft;
    await check('ROAD atomic event/summary, flags, server time, exact radar/copy/navigation data',async()=>{
        x.enable(0);roadDraft=draft(road,{status:'TREE FALL',passability:'NOT POSSIBLE',severity:'SEVERE',remarks:'Obstruction'});await a.captureGPS(roadDraft);
        assert.equal((await a.submitDraft(roadDraft)).state,'committed');const e=store.get('operational_asset_condition_events/'+roadDraft.eventId),s=store.get('operational_asset_status/'+id);
        assert.equal(e.gpsVerified,false);assert.equal(e.conditionGpsCaptured,true);assert.equal(e.sessionId,'existing-duty');assert.equal(e.previousConditionEventId,null);assert.equal(e.resolvesEventId,null);assert.equal(e.reportedAt.server,true);assert.equal(s.updatedAt.server,true);assert.ok(stampCalls>0);
        assert.equal(e.passability,'NOT POSSIBLE');assert.equal(s.hasActiveProblem,true);assert.equal(s.currentProblemLat,e.conditionLat);assert.equal(s.currentProblemLng,e.conditionLng);
        x.listeners[0].next(x.snapshot([[id,s]]));assert.deepEqual(Array.from(x.created.at(-1).coords),[26.6,89.5]);assert.match(a.text(road),/Obstruction/);
        const popup=w.buildOperationalAssetPopup(road);const navigate=popup.children.find(el=>el.textContent==='🧭 NAVIGATE');await navigate.handlers.click({stopPropagation(){}});assert.match(w.opened[0],/26.6%2C89.5/);
    });
    let resolutionDraft;
    await check('TREE FALL -> OPEN / CLEAR links and resolves problem without editing it',async()=>{
        const old=store.get('operational_asset_condition_events/'+roadDraft.eventId);store.get('operational_asset_status/'+id).lastVerifiedPatrol='independent';
        const d=resolutionDraft=draft(road,{status:'OPEN / CLEAR'});await a.captureGPS(d);await a.submitDraft(d);const s=store.get('operational_asset_status/'+id);
        assert.equal(s.hasActiveProblem,false);assert.equal(s.currentProblemLat,null);assert.equal(s.currentProblemLng,null);assert.equal(s.currentProblemAccuracy,null);assert.equal(s.lastVerifiedPatrol,'independent');
        assert.equal(store.get('operational_asset_condition_events/'+d.eventId).previousConditionEventId,roadDraft.eventId);assert.equal(store.get('operational_asset_condition_events/'+roadDraft.eventId),old);
        assert.equal(store.get('operational_asset_condition_events/'+d.eventId).resolvesEventId,roadDraft.eventId);
    });
    await check('resolution same-ID retry is no-write success',async()=>{
        const before=store.get('operational_asset_status/'+id),event=store.get('operational_asset_condition_events/'+resolutionDraft.eventId),size=store.size,count=commits;
        assert.equal((await a.submitDraft(resolutionDraft)).state,'already-completed');
        assert.equal(store.size,size);assert.equal(commits,count);assert.equal(store.get('operational_asset_status/'+id),before);assert.equal(store.get('operational_asset_condition_events/'+resolutionDraft.eventId),event);
    });
    await check('normal -> normal and first normal do not imply resolution',async()=>{
        const d=draft(road,{status:'OPEN / CLEAR'});await a.captureGPS(d);await a.submitDraft(d);
        const e=store.get('operational_asset_condition_events/'+d.eventId);assert.equal(e.previousConditionEventId,resolutionDraft.eventId);assert.equal(e.resolvesEventId,null);
        const firstRoad=features.find(f=>f.properties.assetId==='ROAD_BTR_001'),first=draft(firstRoad,{status:'OPEN / CLEAR'});await a.captureGPS(first);await a.submitDraft(first);
        const firstEvent=store.get('operational_asset_condition_events/'+first.eventId);assert.equal(firstEvent.previousConditionEventId,null);assert.equal(firstEvent.resolvesEventId,null);
    });
    await check('TREE FALL -> ROAD DAMAGED stays unresolved; stale resolution rejected',async()=>{
        const problem=draft(road,{status:'TREE FALL'});await a.captureGPS(problem);await a.submitDraft(problem);
        const stale=draft(road,{status:'OPEN / CLEAR'});await a.captureGPS(stale);
        const damage=draft(road,{status:'ROAD DAMAGED'});await a.captureGPS(damage);await a.submitDraft(damage);
        const e=store.get('operational_asset_condition_events/'+damage.eventId);assert.equal(e.previousConditionEventId,problem.eventId);assert.equal(e.resolvesEventId,null);
        const before=store.get('operational_asset_status/'+id),count=commits;
        await assert.rejects(a.submitDraft(stale),/newer condition/);assert.equal(store.has('operational_asset_condition_events/'+stale.eventId),false);assert.equal(commits,count);assert.equal(store.get('operational_asset_status/'+id),before);
        assert.equal((await a.submitDraft(resolutionDraft)).state,'already-completed');assert.equal(commits,count);assert.equal(store.get('operational_asset_status/'+id),before);
    });
    await check('old committed retry cannot roll summary backwards or duplicate event',async()=>{
        const before=store.get('operational_asset_status/'+id),size=store.size,count=commits;
        assert.equal((await a.submitDraft(roadDraft)).state,'already-completed');assert.equal(store.get('operational_asset_status/'+id),before);assert.equal(store.size,size);assert.equal(commits,count);
    });
    await check('failed write retains stable event ID, values, GPS; double submission shares promise',async()=>{
        const d=draft(water,{status:'DRY',actionRequired:'YES'});await a.captureGPS(d);const eventId=d.eventId,gps=d.gps;failWrite=true;
        const first=a.submitDraft(d),second=a.submitDraft(d);assert.equal(first,second);await assert.rejects(first,/Network uncertain/);assert.equal(d.eventId,eventId);assert.equal(d.gps,gps);assert.equal(d.values.status,'DRY');assert.equal(store.has('operational_asset_condition_events/'+eventId),false);
        failWrite=false;await a.submitDraft(d);const e=store.get('operational_asset_condition_events/'+eventId);assert.equal(e.waterLevel,'NO WATER');assert.equal(e.actionRequired,true);assert.equal(e.passability,undefined);
    });
    await check('water NORMAL/DRY and APC deterministic material-defect rules',async()=>{
        assert.equal(a.activeProblem('WATERHOLE',{status:'NORMAL'}),false);assert.equal(a.activeProblem('WATERHOLE',{status:'DRY'}),true);
        const normal={status:'NORMAL',operational:'FULLY OPERATIONAL',manningStatus:'MANNED',staffPresent:2,rtSet:'WORKING',communication:'FUNCTIONAL'};
        assert.equal(a.activeProblem('ANTI_POACHING_CAMP',normal),false);
        for(const changed of [{status:'ACCESS PROBLEM'},{manningStatus:'UNMANNED'},{staffPresent:0},{rtSet:'NON-FUNCTIONAL'},{communication:'PARTIALLY FUNCTIONAL'},{operational:'PARTIALLY OPERATIONAL'}])assert.equal(a.activeProblem('ANTI_POACHING_CAMP',{...normal,...changed}),true);
        const d=draft(apc,{...normal,manningStatus:'UNMANNED',staffPresent:9});await a.captureGPS(d);await a.submitDraft(d);const e=store.get('operational_asset_condition_events/'+d.eventId);assert.equal(e.staffPresent,0);assert.equal(e.waterLevel,undefined);assert.equal(store.get('operational_asset_status/'+apc.properties.assetId).hasActiveProblem,true);
    });
    await check('uncommitted stale predecessor cannot overwrite newer report',async()=>{
        const d=draft(road,{status:'BLOCKED'});await a.captureGPS(d);store.get('operational_asset_status/'+id).currentConditionEventId='newer-event';
        await assert.rejects(a.submitDraft(d),/newer condition/);assert.equal(store.has('operational_asset_condition_events/'+d.eventId),false);assert.equal(store.get('operational_asset_status/'+id).currentConditionEventId,'newer-event');
    });
    await check('aged GPS blocks new write; committed retry remains safe; unauthorized submit denied',async()=>{
        const d=draft(road,{});await a.captureGPS(d);d.gps.capturedAt-=120000;await assert.rejects(a.submitDraft(d),/GPS is now stale/);assert.equal(d.payload,null);
        w.userProfile={role:'STAFF',division:'BTR_E',range:'Jainti'};await assert.rejects(a.submitDraft(roadDraft),/authorized/);assert.throws(()=>a.createDraft(road,null),/cannot update/);
    });
    console.log(`All ${passed} combined Patch-1/2 checks passed; no production data touched.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
