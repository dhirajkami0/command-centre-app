/* Isolated operational conditions; no duty or patrol state is changed. */
(function (w) {
    'use strict';
    const cache = new Map(), markers = new Map();
    const outbox = new Map();
    let databasePromise, localReady, syncFlight = null, syncRequested = false, localFlight = Promise.resolve(), activeRemote = null;
    const SYNC_ACK_TIMEOUT_MS = 30000;
    function database() {
        if (!databasePromise) databasePromise = new Promise((resolve,reject) => {
            if (!w.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
            const request = w.indexedDB.open('BTRGuardOperationalAssets',1);
            request.onupgradeneeded = () => request.result.createObjectStore('conditionOutbox',{keyPath:'eventId'});
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => { databasePromise = null; reject(request.error); };
            request.onblocked = () => { databasePromise = null; reject(new Error('Local database blocked; close other BTRGuard tabs.')); };
        });
        return databasePromise;
    }
    async function localTransaction(mode,run) {
        const db = await database();
        return new Promise((resolve,reject) => {
            const tx = db.transaction('conditionOutbox',mode), store = tx.objectStore('conditionOutbox');
            let result;
            tx.oncomplete = () => resolve(result);
            tx.onabort = tx.onerror = () => reject(tx.error || new Error('Local transaction failed'));
            run(store,value => { result = value; });
        });
    }
    function loadLocal() {
        if (!localReady) localReady = localTransaction('readonly',(store,set) => {
            const request = store.getAll(); request.onsuccess = () => set(request.result);
        }).then(async records => {
            for (const record of records) outbox.set(record.eventId,record);
            // Recover the old ambiguous attempt journal without changing the observation.
            for (const record of records) if (record.syncState === 'PENDING' && record.retryCount > 0 && !record.lastError) {
                await putLocal({...record,lastResult:'RETRYABLE_FAILURE',lastError:'Previous sync attempt was interrupted or not acknowledged. The same event will be checked before retry.'});
            }
            refreshLocal();
        })
            .catch(error => { localReady = null; throw error; });
        return localReady;
    }
    async function putLocal(record) {
        await localTransaction('readwrite',store => store.put(record));
        outbox.set(record.eventId,record);
        try { refreshLocal(); } catch (error) { console.warn('Operational asset local record saved; rendering deferred',error); }
    }
    function recordProfile(record) {
        if (record.profile) return record.profile;
        try { const [id,phone,name,role,division,range] = JSON.parse(record.ownerKey); return {id,phone,name,role,division,range}; }
        catch (_) { return null; }
    }
    function owned(record) { return profilesMatch(recordProfile(record),w.userProfile); }
    function latestLocal(id) {
        const records = [...outbox.values()].filter(r => r.assetId === id && owned(r) && r.syncState !== 'SYNCED')
            .sort((a,b) => b.sequence-a.sequence);
        return records.find(r=>r.syncState === 'CONFLICT') || records[0];
    }
    function displayedStatus(id) {
        const record = latestLocal(id), server = cache.get(id);
        if (!record || record.syncState === 'CONFLICT') return server;
        const data = record.payload, problem = activeProblem(data.assetType,data);
        return {...data,currentStatus:data.status,hasActiveProblem:problem,currentProblemLat:problem?data.conditionLat:null,
            currentProblemLng:problem?data.conditionLng:null,currentProblemAccuracy:problem?data.conditionAccuracy:null,
            updatedBy:data.reportedBy,localPending:true};
    }
    function refreshLocal() {
        for (const id of new Set([...cache.keys(),...markers.keys(),...[...outbox.values()].map(r=>r.assetId)])) {
            syncMarker(id); refreshPopup(id);
        }
    }
    function saveDraft(draft) {
        if (draft.localFlight) return draft.localFlight;
        const operation = localFlight.catch(()=>{}).then(async () => {
            if (!authorized(draft.feature) || !sameReporter(draft) || !interactive()) throw new Error('Asset update no longer authorized.');
            try { await loadLocal(); }
            catch (error) { throw new Error('COULD NOT SAVE LOCALLY. Do not close this form. Retry before leaving. '+error.message); }
            let record = outbox.get(draft.eventId);
            if (!record) {
                const data = draft.payload || payload(draft), now = Date.now();
                if (now-data.conditionGpsCapturedAt > 60000 || data.conditionGpsCapturedAt-now > 5000) {
                    throw new Error('Field GPS is now stale. Retry GPS before saving.');
                }
                const predecessor = [...outbox.values()].filter(r => owned(r) && r.assetId === data.assetId &&
                    (r.syncState !== 'SYNCED' || !cache.has(data.assetId)))
                    .sort((a,b)=>b.sequence-a.sequence)[0];
                const server = cache.get(data.assetId);
                record = {eventId:data.eventId,assetId:data.assetId,assetType:data.assetType,payload:data,
                    profile:{...draft.profile},ownerKey:reporterKey(draft.profile),clientCreatedAt:now,
                    sequence:Math.max(0,...[...outbox.values()].map(r=>r.sequence||0))+1,
                    predecessor:predecessor?.eventId || null,baselineKnown:cache.has(data.assetId),
                    baseline:server?.currentConditionEventId || null,syncState:'PENDING',retryCount:0,lastAttemptAt:null,lastError:null};
                try { await putLocal(record); }
                catch (error) { throw new Error('COULD NOT SAVE LOCALLY. Do not close this form. Retry before leaving. '+error.message); }
            }
            draft.payload = record.payload; draft.committed = true;
            return {state:w.navigator.onLine === false?'SAVED OFFLINE':'SAVED — SYNC PENDING',eventId:record.eventId};
        });
        localFlight = operation;
        draft.localFlight = operation.finally(()=>{draft.localFlight=null;});
        return draft.localFlight;
    }
    function readiness() {
        if (!w.userProfile || !w.operationalAssetProfileScope?.(w.userProfile)) return 'Current authorized reporter profile is not ready.';
        if (!w.db || !['runTransaction','doc','serverTimestamp'].every(name=>typeof w.fb?.[name] === 'function')) return 'Firebase condition service is not ready.';
        if (typeof w.canViewOperationalAsset !== 'function' || typeof w.getOperationalAssetOwnership !== 'function') return 'Asset authorization helpers are not ready.';
        return null;
    }
    function failureMessage(error) { return String(error?.message || error?.code || error || 'Firebase transaction failed without an error message.'); }
    async function recordResult(attempt,result) {
        if (result.error?.serverSummary) cache.set(attempt.assetId,result.error.serverSummary);
        const success = ['committed','already-completed'].includes(result.outcome?.state);
        const conflict = result.error?.code === 'OA_CONFLICT' || result.error?.code === 'OA_EVENT_CONFLICT';
        const updated = {...attempt,syncState:success?'SYNCED':conflict?'CONFLICT':'PENDING',
            lastResult:success?(result.outcome.state==='already-completed'?'ALREADY_SYNCED':'SYNCED'):conflict?'CONFLICT':'RETRYABLE_FAILURE',
            lastError:success?null:failureMessage(result.error || new Error('Invalid Firestore synchronization result.'))};
        try { await putLocal(updated); }
        catch (error) {
            // The durable attempt journal remains explanatory even if final acknowledgement cannot be saved.
            outbox.set(attempt.eventId,{...attempt,lastResult:'RETRYABLE_FAILURE',lastError:'Could not save sync acknowledgement locally: '+failureMessage(error)});
            console.warn('Operational asset sync acknowledgement not stored',error);
        }
        return updated.lastResult;
    }
    async function attemptRemote(draft,attempt) {
        const remote = submitDraft(draft).then(outcome=>({outcome}),error=>({error}));
        const token = activeRemote = {eventId:attempt.eventId};
        let timer;
        const deadline = new Promise(resolve => {
            timer = w.setTimeout(() => {
                draft.syncExpired = true;
                resolve({error:new Error('Firebase acknowledgement timed out. Report remains saved; commit is unconfirmed. Waiting for the active request before retry.'),timedOut:true});
            },SYNC_ACK_TIMEOUT_MS);
        });
        const result = await Promise.race([remote,deadline]);
        w.clearTimeout(timer);
        if (!result.timedOut) { if (activeRemote===token) activeRemote=null; return recordResult(attempt,result); }
        await recordResult(attempt,result);
        // Firestore has no transaction cancellation API. Fence late writes and do not overlap requests.
        remote.then(async late => {
            try { await recordResult(attempt,late); }
            finally {
                if (activeRemote===token) activeRemote=null;
                if (['committed','already-completed'].includes(late.outcome?.state)) synchronizeOutbox();
            }
        }).catch(error=>console.warn('Operational asset late acknowledgement unavailable',error));
        return 'RETRYABLE_FAILURE';
    }
    function synchronizeOutbox() {
        if (syncFlight) { syncRequested = true; return syncFlight; }
        syncRequested = false;
        syncFlight = (async () => {
            await loadLocal();
            if (w.navigator.onLine === false || readiness() || activeRemote) return {state:'NOT_READY'};
            const pending = [...outbox.values()].filter(record=>record.syncState==='PENDING' && owned(record));
            if (pending.some(record=>!w.getOperationalAssetOwnership(record.assetId))) {
                try {
                    if (typeof w.loadOperationalAssetOwnership !== 'function') return {state:'NOT_READY'};
                    await w.loadOperationalAssetOwnership(); // Reuse the one cached master; asset layers remain lazy/OFF.
                } catch (error) {
                    for (const record of pending) await putLocal({...record,lastResult:'NOT_READY',lastError:'Ownership master not ready: '+failureMessage(error)});
                    return {state:'NOT_READY'};
                }
            }
            const blocked = new Set();
            for (const record of [...outbox.values()].sort((a,b)=>a.sequence-b.sequence)) {
                if (record.syncState === 'SYNCED') continue;
                if (!owned(record)) {
                    const reason='OWNER_MISMATCH — Sign in as the original reporter to synchronize this saved report.';
                    if (record.lastResult!=='OWNER_MISMATCH') await putLocal({...record,lastResult:'OWNER_MISMATCH',lastError:reason});
                    continue;
                }
                if (record.syncState === 'CONFLICT') { blocked.add(record.assetId); continue; }
                if (blocked.has(record.assetId) || w.navigator.onLine === false) continue;
                const feature = lookup(record.assetId)?.feature || {properties:{assetId:record.assetId,assetType:record.assetType}};
                if (readiness() || !w.getOperationalAssetOwnership(record.assetId)) continue;
                if (!w.canViewOperationalAsset(feature,w.userProfile)) {
                    if(record.lastResult!=='NOT_READY') await putLocal({...record,lastResult:'NOT_READY',lastError:'Current reporter is not authorized for this asset area. No remote attempt made.'});
                    continue;
                }
                const attempt = {...record,retryCount:record.retryCount+1,lastAttemptAt:Date.now(),lastResult:'IN_PROGRESS',
                    lastError:'Sync attempt in progress — waiting for Firebase acknowledgement; commit is not yet confirmed.'};
                await putLocal(attempt);
                // Dependencies or the signed-in reporter can change during the local journal write.
                if (readiness() || !owned(record) || !w.canViewOperationalAsset(feature,w.userProfile)) {
                    await putLocal({...record,lastResult:owned(record)?'NOT_READY':'OWNER_MISMATCH',lastError:'Reporter or authorization changed before the remote attempt. No retry consumed.'});
                    continue;
                }
                const draft = {feature,profile:recordProfile(record),eventId:record.eventId,payload:record.payload,ready:true,durable:record};
                const result = await attemptRemote(draft,attempt);
                if (!['SYNCED','ALREADY_SYNCED'].includes(result)) blocked.add(record.assetId);
                if (activeRemote) break;
            }
            return {state:'COMPLETED'};
        })().catch(error=>{
            console.warn('Operational asset sync pending',error);
            return {state:'RETRYABLE_FAILURE',reason:failureMessage(error)};
        }).finally(()=>{
            syncFlight=null;
            if (syncRequested) { syncRequested=false; synchronizeOutbox(); }
        });
        return syncFlight;
    }
    let currentDraft = null;
    const choices = {
        FOREST_ROAD: {status:['OPEN / CLEAR','PARTIALLY BLOCKED','BLOCKED','TREE FALL','ROAD DAMAGED','WASHOUT','LANDSLIDE','FLOODED','CULVERT DAMAGE','BRIDGE DAMAGE','UNDER REPAIR','OTHER'],passability:['POSSIBLE','DIFFICULT','NOT POSSIBLE'],severity:['MINOR','MODERATE','SEVERE']},
        WATERHOLE: {status:['NORMAL','LOW WATER','VERY LOW WATER','DRY','SILTED','CONTAMINATED','DAMAGED','REQUIRES CLEANING','UNDER MAINTENANCE','OTHER'],waterLevel:['NORMAL','LOW','VERY LOW','NO WATER'],actionRequired:['NO','YES']},
        ANTI_POACHING_CAMP: {manningStatus:['MANNED','UNMANNED'],rtSet:['WORKING','NON-FUNCTIONAL','NOT AVAILABLE'],communication:['FUNCTIONAL','PARTIALLY FUNCTIONAL','NOT AVAILABLE'],status:['NORMAL','MINOR DAMAGE','MAJOR DAMAGE','ROOF DAMAGE','STRUCTURAL DAMAGE','WATER PROBLEM','POWER PROBLEM','ACCESS PROBLEM','TEMPORARILY CLOSED','NOT OPERATIONAL','UNDER REPAIR','OTHER'],operational:['FULLY OPERATIONAL','PARTIALLY OPERATIONAL','NOT OPERATIONAL']}
    };
    const labels = {status:'Condition / Status',passability:'Vehicle Passage',severity:'Severity',waterLevel:'Water Level',actionRequired:'Action Required',manningStatus:'Manning Status',staffPresent:'Staff Present',rtSet:'RT Set',communication:'Communication',operational:'Operational',remarks:'Remarks'};
    let unsubscribe = null, generation = 0, syncing = false;
    const map = () => w.map || null;
    const states = () => Object.values(w.operationalAssetState || {});
    const validGPS = (lat, lng) => typeof lat === 'number' && typeof lng === 'number' &&
        Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    const coordinate = (lat, lng) => validGPS(lat, lng) ? lat.toFixed(6) + ', ' + lng.toFixed(6) : 'Unknown';
    const value = v => w.formatOperationalAssetValue(v, 'Unknown');
    const timestamp = v => {
        if (v == null || v === '') return null;
        const date = v.toDate ? v.toDate() : new Date(typeof v.seconds === 'number' ? v.seconds * 1000 : v);
        return Number.isFinite(date.getTime()) ? date.toLocaleString() : null;
    };
    function authorized(feature) {
        return !!feature && w.canViewOperationalAsset(feature, w.userProfile) && w.operationalAssetMatchesGIS(feature);
    }
    function interactive() {
        return w.operationalAssetsCanInteract() && w.__villageInteractionActive !== true;
    }
    function lookup(id) {
        for (const state of states()) {
            const feature = state.data?.features.find(f => f.properties.assetId === id);
            if (feature) return { state, feature };
        }
        return null;
    }
    function details(feature) {
        const p = feature.properties, road = p.assetType === 'FOREST_ROAD', apc = p.assetType === 'ANTI_POACHING_CAMP';
        const owner = w.getOperationalAssetOwnership(p.assetId);
        const approved = owner?.ownershipStatus === 'APPROVED';
        const status = authorized(feature) ? displayedStatus(p.assetId) : null;
        const local = authorized(feature) ? latestLocal(p.assetId) : null;
        const unique = field => [...new Set((owner?.areas || []).map(a => a[field]).filter(Boolean))];
        const rows = [['Asset', value(p.name || p.assetId)], ['Asset ID', p.assetId],
            ['Division', value(approved ? owner.divisions : p.division)],
            ['Range', value(approved ? owner.ranges : road ? p.ranges : p.range)],
            ['Beat', value(approved ? unique('beat') : road ? p.beats : p.beat)],
            ['Compartment', value(approved ? unique('compartment') : road ? p.compartments : p.compartment)]];
        const current = status?.currentStatus || p.status;
        rows.push(['Status', value(current)]);
        if (local) rows.push(['Sync Status',local.syncState === 'CONFLICT' ? 'SYNC CONFLICT — REVIEW REQUIRED' : 'PENDING']);
        if (local?.syncState === 'PENDING') rows.push(['Local Save',w.navigator.onLine === false ? 'SAVED OFFLINE' : 'SAVED — SYNC PENDING']);
        else if (authorized(feature) && [...outbox.values()].some(r=>r.assetId===p.assetId && r.syncState!=='SYNCED' && !owned(r))) rows.push(['Sync Status','PENDING — Report belongs to another user; sign in as its reporter to sync.']);
        if (status?.localPending) rows.push(['Field Observation Time',timestamp(status.conditionGpsCapturedAt) || 'Unknown'],
            ['Reporter',value(status.reportedBy)],['Remarks',value(status.remarks)],['GPS Accuracy',status.conditionAccuracy+' m']);
        if (road) rows.push(['Length (calculated)', w.calculateOperationalRoadLengthKm(feature).toFixed(2) + ' km'],
            ['Surface', value(p.surface)], ['Vehicle Passage', value(status?.passability ?? p.vehicleAccess)]);
        else if (apc) for (const [label, field] of [['Operational','operational'],['Manning Status','manningStatus'],['Staff Present','staffPresent'],['RT Set','rtSet'],['Communication','communication']]) rows.push([label, value(status?.[field] ?? p[field])]);
        else rows.push(['Water Level',value(status?.waterLevel ?? p.waterLevel)],['Type',value(p.waterholeType)],['Season',value(p.season)]);
        const point = !road && feature.geometry?.type === 'Point' && validGPS(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
            ? { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] } : null;
        if (point) rows.push(['GPS Location', coordinate(point.lat, point.lng)]);
        const problem = status?.hasActiveProblem === true ? status : null;
        if (problem) {
            rows.push(['Current Condition',value(problem.currentStatus)],['Severity',value(problem.severity)],
                ['Problem GPS',coordinate(problem.currentProblemLat,problem.currentProblemLng)],
                ['GPS Accuracy', typeof problem.currentProblemAccuracy === 'number' && Number.isFinite(problem.currentProblemAccuracy) && problem.currentProblemAccuracy >= 0 ? problem.currentProblemAccuracy + ' m' : 'Unknown'],
                ['Reported By',value(problem.updatedBy || problem.reportedBy)],
                ...(!problem.localPending ? [['Reported Time',timestamp(problem.updatedAt || problem.reportedAt) || 'Unknown']] : []),['Remarks',value(problem.remarks)]);
            if (typeof problem.photoUrl === 'string' && /^https:\/\//i.test(problem.photoUrl)) rows.push(['Photo',problem.photoUrl]);
        }
        const updated = status?.localPending ? null : timestamp(status?.updatedAt || p.lastStatusUpdate);
        if (updated) rows.push(['Last Status Update',updated],['Updated By',value(status?.updatedBy || p.lastStatusUpdatedBy)]);
        // No automatic evidence source is integrated by Patch 1.
        rows.push([road ? 'Last Verified Patrol' : 'Last Verified Visit',road ? 'No verified patrol available' : 'No verified visit available']);
        return { p, road, apc, rows, point, problem, status };
    }
    function text(feature) {
        return ['BTRGUARD — OPERATIONAL ASSET STATUS','',...details(feature).rows.map(([k,v]) => k + ': ' + v),'','BTRGuard','Buxa Tiger Reserve'].join('\n');
    }
    async function copy(content) {
        try {
            if (w.navigator.clipboard?.writeText) { await w.navigator.clipboard.writeText(content); return; }
        } catch (_) { /* Use selection fallback when browser permission denies clipboard. */ }
        const input = document.createElement('textarea');
        input.value = content; input.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(input);
        try { input.select(); if (!document.execCommand('copy')) throw new Error('Copy unavailable. Select the popup text to copy it.'); }
        finally { input.remove(); }
    }
    w.operationalAssetsNavigate = function (lat, lng) {
        if (!validGPS(lat,lng)) return false;
        w.open('https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(lat + ',' + lng), '_blank', 'noopener,noreferrer');
        return true;
    };
    function popup(feature) {
        const d = details(feature), root = document.createElement('div'); root.className = 'oa-content';
        const title = document.createElement('h3'); title.textContent = (d.road ? '🛣 ' : d.apc ? '🛖 ' : '💧 ') + value(d.p.name || d.p.assetId); root.appendChild(title);
        for (const [label, content] of d.rows) {
            if (label === 'Current Condition') { const heading = document.createElement('h4'); heading.textContent = '⚠ CURRENT CONDITION'; root.appendChild(heading); }
            const row = document.createElement('div'), caption = document.createElement('strong');
            caption.textContent = label + ': '; row.appendChild(caption); row.appendChild(document.createTextNode(content));
            if (label === 'Current Condition') { row.className = 'oa-condition'; }
            root.appendChild(row);
        }
        if (d.problem?.photoUrl && /^https:\/\//i.test(d.problem.photoUrl)) {
            const link = document.createElement('a'); link.textContent = '📷 Photo — View'; link.href = d.problem.photoUrl;
            link.target = '_blank'; link.rel = 'noopener noreferrer'; root.appendChild(link);
        }
        const feedback = document.createElement('div'); feedback.className = 'oa-feedback'; feedback.setAttribute('role','status');
        function action(label, run) {
            const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
            button.addEventListener('click', async e => {
                e.stopPropagation();
                if (!authorized(feature) || !interactive()) { feedback.textContent = 'Asset action unavailable in the current map mode.'; return; }
                try { await run(); } catch (error) { feedback.textContent = error.message || 'Asset action failed.'; }
            }); root.appendChild(button);
        }
        const target = d.problem ? validGPS(d.problem.currentProblemLat,d.problem.currentProblemLng)
            ? {lat:d.problem.currentProblemLat,lng:d.problem.currentProblemLng} : null : d.point;
        if (target) action('🧭 NAVIGATE', () => w.operationalAssetsNavigate(target.lat,target.lng));
        if (d.point) action('📋 COPY GPS', async () => { await copy(coordinate(d.point.lat,d.point.lng)); feedback.textContent = 'GPS copied.'; });
        action('📋 COPY DETAILS', async () => { await copy(text(feature)); feedback.textContent = 'Details copied.'; });
        if (authorized(feature)) action('✏️ UPDATE STATUS', () => openUpdate(feature));
        if (latestLocal(d.p.assetId)?.syncState === 'PENDING') action('RETRY SYNC', () => synchronizeOutbox());
        if (w.navigator.share) action('SHARE', () => w.navigator.share({title:value(d.p.name),text:text(feature)}));
        root.appendChild(feedback); w.L?.DomEvent?.disableClickPropagation(root);
        return root;
    }
    function refreshPopup(id) {
        const active = w.operationalAssetPopup;
        if (!active || (id && active.oaAssetId !== id)) return;
        const found = lookup(active.oaAssetId);
        if (found && authorized(found.feature)) active.setContent(popup(found.feature));
    }
    function syncMarker(id) {
        const found = lookup(id), status = displayedStatus(id), assetMap = map();
        const visible = found && assetMap?.hasLayer(found.state.layer) && authorized(found.feature) &&
            status?.hasActiveProblem === true && validGPS(status.currentProblemLat,status.currentProblemLng);
        if (!visible) { if (markers.has(id)) { markers.get(id).remove(); markers.delete(id); } return; }
        if (!assetMap.getPane('operationalAssetProblemsPane')) {
            const pane = assetMap.createPane('operationalAssetProblemsPane'); pane.style.zIndex = '570'; pane.style.pointerEvents = 'none';
        }
        let marker = markers.get(id);
        if (!marker) {
            marker = w.L.marker([status.currentProblemLat,status.currentProblemLng], {pane:'operationalAssetProblemsPane',bubblingMouseEvents:false,
                keyboard:true,title:'⚠ ' + value(found.feature.properties.name),icon:w.L.divIcon({className:'oa-problem',iconSize:[28,28],iconAnchor:[14,14],html:'<span class="oa-warning" aria-hidden="true">!</span>'})});
            marker.on('click', () => {
                const item = lookup(id);
                if (!item || !authorized(item.feature) || !interactive() || !assetMap.hasLayer(item.state.layer)) return;
                const opened = w.L.popup({maxWidth:340}).setLatLng(marker.getLatLng()).setContent(popup(item.feature)).openOn(assetMap);
                opened.oaAssetId = id; w.operationalAssetPopup = opened;
            });
            markers.set(id,marker); marker.addTo(assetMap);
        } else marker.setLatLng([status.currentProblemLat,status.currentProblemLng]);
        const element = marker.getElement?.();
        if (element) { element.style.setProperty('pointer-events',interactive() ? 'auto' : 'none','important'); element.tabIndex = interactive() ? 0 : -1; element.setAttribute('aria-disabled',String(!interactive())); element.setAttribute('data-sync-state',status.localPending?'PENDING':'SYNCED'); }
    }
    function reconcile(snapshot) {
        // A fresh snapshot reconciles deletions missed while unsubscribed.
        const present = new Set(snapshot.docs.map(doc => doc.id));
        for (const id of cache.keys()) if (!present.has(id)) { cache.delete(id); syncMarker(id); refreshPopup(id); }
        for (const change of snapshot.docChanges()) {
            const id = change.doc.id, data = change.doc.data();
            if (change.type === 'removed' || (data.assetId && data.assetId !== id)) cache.delete(id);
            else cache.set(id,data);
            syncMarker(id); refreshPopup(id);
        }
        synchronizeOutbox();
    }
    function sync() {
        if (syncing) return; syncing = true;
        try {
            if (currentDraft && (!authorized(currentDraft.feature) || !interactive() || !sameReporter(currentDraft))) {
                currentDraft.modal?.remove(); currentDraft.modal = null; // Retain evidence, revoke the form's actions.
            }
            installPointIcons();
            const enabled = states().some(state => map()?.hasLayer(state.layer)) && !!w.operationalAssetProfileScope(w.userProfile);
            if (!enabled && unsubscribe) { unsubscribe(); unsubscribe = null; generation++; }
            if (enabled && !unsubscribe && w.fb?.onSnapshot && w.db) {
                const token = ++generation;
                unsubscribe = w.fb.onSnapshot(w.fb.collection(w.db,'operational_asset_status'), snapshot => {
                    if (token !== generation) return;
                    try { reconcile(snapshot); } catch (error) { console.warn('Operational status rendering failed',error); }
                }, error => { if (token === generation) { unsubscribe = null; generation++; console.warn('Operational status unavailable',error); } });
            }
            refreshLocal();
            synchronizeOutbox();
        } catch (error) { console.warn('Operational conditions unavailable',error); }
        finally { syncing = false; }
    }
    // Keep Phase-A declarations intact; wrappers add isolated read-only hooks.
    const originalPoint = w.createOperationalAssetPoint;
    function pointIcon(feature) {
        return w.L.divIcon({className:'operational-asset-icon oa-point',iconSize:[32,32],iconAnchor:[16,16],
            html:'<span class="oa-point-symbol">' + (feature.properties.assetType === 'ANTI_POACHING_CAMP' ? '🛖' : '💧') + '</span>'});
    }
    w.createOperationalAssetPoint = function (feature, latlng) {
        const marker = originalPoint(feature,latlng);
        marker.setIcon(pointIcon(feature));
        return marker;
    };
    function installPointIcons() {
        for (const state of states()) {
            if (state.assetType === 'FOREST_ROAD') continue;
            state.layer.options.pointToLayer = w.createOperationalAssetPoint;
            state.layer.eachLayer(layer => {
                if (layer.feature?.geometry?.type === 'Point' && !layer.options.icon?.options?.className?.includes('oa-point')) layer.setIcon(pointIcon(layer.feature));
            });
        }
    }
    w.buildOperationalAssetPopup = function (feature) {
        if (w.operationalAssetPopup) w.operationalAssetPopup.oaAssetId = feature.properties.assetId;
        const node = popup(feature);
        // bindOperationalAssetFeature assigns the popup after building its content.
        node.oaAssetId = feature.properties.assetId;
        return node;
    };
    for (const name of ['refreshOperationalAssetVisibility','syncOperationalAssetInteraction']) {
        const original = w[name];
        w[name] = function (...args) { const result = original.apply(this,args); sync(); return result; };
    }
    const originalLoad = w.loadOperationalAssetLayer;
    w.loadOperationalAssetLayer = async function (...args) { installPointIcons(); const result = await originalLoad.apply(this,args); sync(); return result; };
    const originalOwnershipLoad = w.loadOperationalAssetOwnership;
    if (typeof originalOwnershipLoad === 'function') w.loadOperationalAssetOwnership = async function (...args) {
        const result = await originalOwnershipLoad.apply(this,args); synchronizeOutbox(); return result;
    };
    function attachMap() {
        const assetMap = map(); if (!assetMap || assetMap.oaConditionsAttached) return;
        assetMap.oaConditionsAttached = true;
        assetMap.on('layeradd layerremove', e => {
            if (states().some(state => state.layer === e.layer)) sync();
        });
        assetMap.on('popupopen', e => { const content = e.popup.getContent(); if (content?.oaAssetId) e.popup.oaAssetId = content.oaAssetId; });
        sync();
    }
    function sameReporter(draft) {
        return profilesMatch(draft.profile,w.userProfile);
    }
    function profilesMatch(saved,current) {
        if (!saved || !current) return false;
        const text = v=>String(v || '').trim().replace(/\s+/g,' ').toUpperCase();
        const name = p=>text(p.cleanName || p.name || p.rawName || p.id || p.userId).replace(/_/g,' ').replace(/\s+/g,' ');
        const phone = p=>String(p.phone || '').replace(/\D/g,'');
        const ids = p=>[p.id,p.userId,p.uid].filter(v=>v!=null && String(v).trim()).map(v=>String(v).trim());
        const savedIds=ids(saved), currentIds=ids(current);
        if (savedIds.some(id=>currentIds.includes(id))) return true;
        // Matching login phone and canonical name survive profile-id/uid representation changes.
        if (phone(saved) && phone(current)) return phone(saved)===phone(current) && !!name(saved) && name(saved)===name(current);
        const profileId = p=>String(p.id || p.userId || '').trim();
        // Legacy B1 profiles can be keyed by their canonical staff name instead of an explicit id.
        const namedId = p=>text(p.id || p.userId || p.uid).replace(/_/g,' ');
        const sameName = !!name(saved) && name(saved)===name(current);
        const canonicalIds = sameName && namedId(saved)===name(saved) && namedId(current)===name(current);
        if (profileId(saved) && profileId(current) && profileId(saved)!==profileId(current) && !canonicalIds) return false;
        if (saved.uid && current.uid && saved.uid!==current.uid) return false;
        const identity = sameName && ((!savedIds.length && !currentIds.length) ||
            savedIds.some(id=>currentIds.includes(id)) ||
            canonicalIds ||
            (!profileId(saved) && !current.uid && namedId(current)===name(saved)) ||
            (!profileId(current) && !saved.uid && namedId(saved)===name(current)));
        // Empty legacy test/admin profiles only match an equally empty profile representation.
        const emptyIdentity = !name(saved) && !name(current) && !savedIds.length && !currentIds.length && !phone(saved) && !phone(current);
        const division = p=>w.operationalAssetDivision?.(p.division) || text(p.division);
        const range = p=>w.operationalAssetRange?.(p.range) || text(p.range);
        return (identity || emptyIdentity) && text(saved.role)===text(current.role) && division(saved)===division(current) && range(saved)===range(current);
    }
    function reporterKey(profile) {
        return JSON.stringify([profile?.id || profile?.userId || profile?.uid || '',profile?.phone || '',profile?.cleanName || profile?.name || profile?.rawName || '',profile?.role || '',profile?.division || '',profile?.range || '']);
    }
    function createDraft(feature, previousEventId) {
        if (!authorized(feature) || !interactive()) throw new Error('You cannot update this asset in the current map mode.');
        const type = feature.properties.assetType;
        if (!choices[type]) throw new Error('Unsupported asset type.');
        const random = w.crypto?.randomUUID ? w.crypto.randomUUID() : (() => {
            const bytes = new Uint8Array(16); w.crypto.getRandomValues(bytes); return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
        })();
        return {eventId:'OA_' + random,feature,profile:{...w.userProfile},previousEventId:previousEventId ?? null,
            values:{...Object.fromEntries(Object.entries(choices[type]).map(([key,options])=>[key,options[0]])),...(type==='ANTI_POACHING_CAMP'?{staffPresent:0}:{}),remarks:''},gps:null,payload:null,flight:null,committed:false,ready:false};
    }
    function normalizeFields(type, fields) {
        const result = {};
        for (const [key,options] of Object.entries(choices[type] || {})) {
            if (!options.includes(fields[key])) throw new Error('Select a valid ' + labels[key] + '.');
            result[key] = fields[key];
        }
        if (type === 'WATERHOLE') {
            if (result.status === 'DRY') result.waterLevel = 'NO WATER';
            result.actionRequired = result.actionRequired === 'YES';
        }
        if (type === 'ANTI_POACHING_CAMP') {
            const count = fields.staffPresent === '' ? NaN : Number(fields.staffPresent);
            if (!Number.isSafeInteger(count) || count < 0) throw new Error('Staff Present must be a whole number of 0 or more.');
            result.staffPresent = result.manningStatus === 'UNMANNED' ? 0 : count;
        }
        result.remarks = String(fields.remarks || '').trim();
        if (result.remarks.length > 4000) throw new Error('Remarks must be 4000 characters or fewer.');
        return result;
    }
    function activeProblem(type, fields) {
        if (type === 'FOREST_ROAD') return fields.status !== 'OPEN / CLEAR';
        if (type === 'WATERHOLE') return fields.status !== 'NORMAL';
        return fields.status !== 'NORMAL' || fields.operational !== 'FULLY OPERATIONAL' || fields.manningStatus !== 'MANNED' ||
            fields.staffPresent < 1 || fields.rtSet !== 'WORKING' || fields.communication !== 'FUNCTIONAL';
    }
    function freshGPS() {
        return new Promise((resolve,reject) => {
            if (!w.navigator.geolocation) { reject(new Error('GPS is unavailable on this device.')); return; }
            w.navigator.geolocation.getCurrentPosition(position => {
                const c = position.coords, capturedAt = Number(position.timestamp), now = Date.now();
                if (!validGPS(c.latitude,c.longitude) || !Number.isFinite(c.accuracy) || c.accuracy < 0 ||
                    !Number.isFinite(capturedAt) || now-capturedAt > 15000 || capturedAt-now > 5000) {
                    reject(new Error('GPS fix is invalid or stale. Retry GPS.')); return;
                }
                resolve({lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,capturedAt});
            },error => reject(new Error('GPS failed: ' + (error.message || 'permission, signal or timeout') + '. Retry GPS.')),
            {enableHighAccuracy:true,maximumAge:0,timeout:20000});
        });
    }
    async function captureGPS(draft) {
        if (draft.flight || draft.payload) throw new Error('Retry the retained submission before changing its GPS.');
        if (!authorized(draft.feature) || !sameReporter(draft) || !interactive()) throw new Error('Asset update no longer authorized.');
        const request = draft.gpsRequest = (draft.gpsRequest || 0) + 1;
        draft.gps = null;
        const gps = await freshGPS();
        if (request !== draft.gpsRequest) throw new Error('A newer GPS request is in progress.');
        draft.gps = gps; return gps;
    }
    function payload(draft) {
        const gps = draft.gps;
        if (!gps || !validGPS(gps.lat,gps.lng) || !Number.isFinite(gps.accuracy) || gps.accuracy < 0) throw new Error('Capture fresh field GPS before submitting.');
        const fields = normalizeFields(draft.feature.properties.assetType,draft.values), profile = draft.profile;
        return {...fields,eventId:draft.eventId,assetId:draft.feature.properties.assetId,assetType:draft.feature.properties.assetType,
            conditionType:fields.status,conditionLat:gps.lat,conditionLng:gps.lng,conditionAccuracy:gps.accuracy,conditionGpsCapturedAt:gps.capturedAt,
            reportedBy:String(profile.cleanName || profile.name || profile.rawName || 'Unknown'),reporterRole:String(profile.role || ''),
            reporterDivision:String(profile.division || ''),reporterRange:String(profile.range || ''),
            ...(profile.id || profile.userId ? {reporterProfileId:String(profile.id || profile.userId)} : {}),
            ...(w.isDutyActive === true && typeof w.currentSessionId === 'string' && w.currentSessionId.trim() ? {sessionId:w.currentSessionId} : {}),
            previousConditionEventId:draft.previousEventId,resolvesEventId:null,gpsVerified:false,conditionGpsCaptured:true};
    }
    function submitDraft(draft) {
        if (draft.flight) return draft.flight;
        draft.flight = (async () => {
            if (!(draft.durable ? w.canViewOperationalAsset(draft.feature,w.userProfile) : authorized(draft.feature) && interactive()) || !sameReporter(draft)) throw new Error('Asset update no longer authorized.');
            if (!draft.ready) throw new Error('Load current status before submitting.');
            const fb = w.fb;
            if (!fb?.runTransaction || !fb.serverTimestamp || !w.db) throw new Error('Status service unavailable. Your draft is retained.');
            if (!draft.payload) draft.payload = payload(draft);
            const data = draft.payload, eventRef = fb.doc(w.db,'operational_asset_condition_events',draft.eventId), summaryRef = fb.doc(w.db,'operational_asset_status',data.assetId);
            const outcome = await fb.runTransaction(w.db,async tx => {
                if (!(draft.durable ? w.canViewOperationalAsset(draft.feature,w.userProfile) : authorized(draft.feature) && interactive()) || !sameReporter(draft)) throw new Error('Asset update no longer authorized.');
                const event = await tx.get(eventRef);
                if (event.exists()) {
                    const old = event.data();
                    // Resolution linkage is derived from the predecessor summary at commit time.
                    if (!Object.entries(data).every(([key,val]) => key === 'resolvesEventId' || (draft.durable && key === 'previousConditionEventId') || old[key] === val)) {
                        const error=new Error('Event identity conflict. Stored event does not match this saved observation.');error.code='OA_EVENT_CONFLICT';throw error;
                    }
                    return {state:'already-completed'};
                }
                const summary = await tx.get(summaryRef), previous = summary.exists() ? summary.data().currentConditionEventId || null : null;
                if (draft.durable) {
                    const record = draft.durable, current = summary.exists() ? summary.data() : null;
                    const time = current?.updatedAt;
                    const millis = time?.toMillis ? time.toMillis() : typeof time?.seconds === 'number' ? time.seconds*1000 : typeof time === 'number' ? time : NaN;
                    const safe = record.predecessor ? previous === record.predecessor : record.baselineKnown ? previous === record.baseline :
                        !summary.exists() || (Number.isFinite(millis) && millis <= data.conditionGpsCapturedAt);
                    if (!safe) { const error = new Error('SYNC CONFLICT — REVIEW REQUIRED'); error.code='OA_CONFLICT'; error.serverSummary=current; throw error; }
                } else if (previous !== draft.previousEventId) throw new Error('A newer condition report exists. Close this draft and review current status before a new report.');
                if (!draft.durable && (Date.now()-data.conditionGpsCapturedAt > 60000 || data.conditionGpsCapturedAt-Date.now() > 5000)) {
                    const error = new Error('Field GPS is now stale. Retry GPS before saving.'); error.code='OA_GPS_STALE'; throw error;
                }
                const hasActiveProblem = activeProblem(data.assetType,data), stamp = fb.serverTimestamp();
                if (draft.syncExpired) throw new Error('Sync acknowledgement deadline expired before writes; report remains pending for the same-event retry.');
                if (draft.durable && (!sameReporter(draft) || !w.canViewOperationalAsset(draft.feature,w.userProfile))) throw new Error('Reporter or authorization changed before Firestore writes; saved report remains pending.');
                const resolvesEventId = !hasActiveProblem && summary.exists() && summary.data().hasActiveProblem === true &&
                    typeof previous === 'string' && previous.trim().length > 0 && !previous.includes('/') && !['.','..'].includes(previous)
                    ? previous : null;
                const summaryData = {assetId:data.assetId,assetType:data.assetType,currentStatus:data.status,currentConditionEventId:data.eventId,
                    hasActiveProblem,currentProblemLat:hasActiveProblem?data.conditionLat:null,currentProblemLng:hasActiveProblem?data.conditionLng:null,
                    currentProblemAccuracy:hasActiveProblem?data.conditionAccuracy:null,updatedAt:stamp,updatedBy:data.reportedBy,
                    remarks:data.remarks,previousConditionEventId:previous,
                    ...Object.fromEntries(Object.keys(choices[data.assetType]).filter(k=>k!=='status').map(k=>[k,data[k]])),
                    ...(data.assetType==='ANTI_POACHING_CAMP'?{staffPresent:data.staffPresent}:{})};
                tx.set(eventRef,{...data,previousConditionEventId:previous,resolvesEventId,reportedAt:stamp});
                tx.set(summaryRef,summaryData,{merge:true});
                return {state:'committed',summary:summaryData};
            });
            if (!outcome || !['committed','already-completed'].includes(outcome.state)) throw new Error('Invalid Firestore synchronization result; report remains pending.');
            if (draft.durable && outcome.summary) cache.set(data.assetId,outcome.summary);
            draft.committed = true; return outcome;
        })().catch(error => {
            // The stale-GPS branch ran only after confirming no committed event.
            if (error.code === 'OA_GPS_STALE') draft.payload = null;
            throw error;
        }).finally(() => { draft.flight = null; });
        return draft.flight;
    }
    async function openUpdate(feature) {
        if (currentDraft?.flight) throw new Error('A condition submission is still in progress.');
        if (currentDraft?.modal) throw new Error('Finish or close the existing condition form first.');
        const id = feature.properties.assetId;
        const draft = currentDraft && !currentDraft.committed && currentDraft.feature.properties.assetId === id && sameReporter(currentDraft)
            ? currentDraft : createDraft(feature,cache.get(id)?.currentConditionEventId);
        currentDraft = draft;
        const modal = document.createElement('div'); modal.className='oa-modal oa-content'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
        const panel = document.createElement('div'); panel.className='oa-form-panel'; modal.appendChild(panel); draft.modal=modal;
        const heading = document.createElement('h3'); heading.id='oa-update-heading'; heading.textContent='UPDATE ' + (id.startsWith('ROAD')?'ROAD':id.startsWith('WH')?'WATERHOLE':'APC') + ' STATUS'; panel.appendChild(heading); modal.setAttribute('aria-labelledby',heading.id);
        const identity = document.createElement('div'); identity.textContent=value(feature.properties.name)+' • '+id;panel.appendChild(identity);
        const controls={}, type=feature.properties.assetType;
        function field(key,options) {
            const label=document.createElement('label');label.textContent=labels[key];const input=document.createElement(options?'select':key==='remarks'?'textarea':'input');
            if(options)for(const option of options){const el=document.createElement('option');el.value=option;el.textContent=option;input.appendChild(el);}
            else if(key==='staffPresent'){input.type='number';input.min='0';input.step='1';}else input.maxLength=4000;
            input.value=draft.values[key]; input.addEventListener('change',()=>{draft.values[key]=input.value;
                if(key==='status'&&input.value==='DRY'){draft.values.waterLevel='NO WATER';controls.waterLevel.value='NO WATER';}
                if(key==='manningStatus'&&input.value==='UNMANNED'){draft.values.staffPresent=0;controls.staffPresent.value='0';}});
            controls[key]=input;label.appendChild(input);panel.appendChild(label);
        }
        for(const [key,options] of Object.entries(choices[type]))field(key,options);
        if(type==='ANTI_POACHING_CAMP')field('staffPresent');field('remarks');
        const gpsInfo=document.createElement('div');gpsInfo.className='oa-field-gps';gpsInfo.setAttribute('role','status');panel.appendChild(gpsInfo);
        const message=document.createElement('div');message.setAttribute('role','status');panel.appendChild(message);
        function button(label,run){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',run);panel.appendChild(b);return b;}
        function gpsText(){gpsInfo.textContent=draft.gps?'📍 FIELD GPS '+coordinate(draft.gps.lat,draft.gps.lng)+' • Accuracy: '+draft.gps.accuracy+' m'+(draft.gps.accuracy>60?' — Approximate fix; verify the problem location.':''):'📍 FIELD GPS — No fresh fix.';}
        function lock(){const busy=!!draft.flight||!!draft.localFlight;for(const input of Object.values(controls))input.disabled=busy||!!draft.payload;submit.disabled=busy||!draft.ready||!draft.gps;retry.disabled=busy||!!draft.payload;close.disabled=busy;}
        async function acquire(){gpsInfo.textContent='📍 FIELD GPS — Acquiring current location…';retry.disabled=true;try{await captureGPS(draft);gpsText();}catch(error){gpsInfo.textContent=error.message;}finally{lock();}}
        const retry=button('RETRY GPS',acquire);
        const submit=button('SUBMIT',async()=>{
            if(draft.flight||draft.localFlight)return;
            for(const [key,input]of Object.entries(controls))draft.values[key]=input.value;
            message.textContent='Saving condition…';
            let outcome;
            try{const pending=saveDraft(draft);lock();outcome=await pending;}
            catch(error){message.textContent=error.message+' Draft retained.';lock();return;}
            // Persistence has completed. Neither rendering nor remote failure can undo this save.
            modal.remove();draft.modal=null;currentDraft=null;
            try{
                refreshPopup(id); const content=w.operationalAssetPopup?.getContent?.();
                if(content){const notice=document.createElement('div');notice.setAttribute('role','status');notice.textContent=outcome.state+' — Sync pending; it will sync automatically when network returns.';content.appendChild(notice);}
            }catch(error){console.warn('Operational asset saved; popup refresh pending',error);}
            if(w.navigator.onLine === false)return;
            synchronizeOutbox();
        });
        const close=button('CLOSE',()=>{if(!draft.flight&&!draft.localFlight){modal.remove();draft.modal=null;}});
        w.L?.DomEvent?.disableClickPropagation(modal);document.body.appendChild(modal);heading.tabIndex=-1;heading.focus?.();
        gpsText();lock();
        draft.ready=true; // Server predecessor is reconciled only inside the sync transaction.
        if(!draft.gps&&!draft.payload)await acquire();else lock();
    }
    w.OperationalAssetConditions = {sync,details,text,validGPS,createDraft,normalizeFields,activeProblem,captureGPS,submitDraft,saveDraft,synchronizeOutbox,loadLocal,outbox,choices};
    w.addEventListener('online',synchronizeOutbox);
    w.addEventListener('userProfileLoaded', () => { attachMap(); sync(); });
    attachMap();
})(window);
