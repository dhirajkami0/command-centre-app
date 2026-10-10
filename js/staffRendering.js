/* Read-only consumers of authorized staff and the existing patrol point cache. */
(function (w) {
    'use strict';
    const indexes = new WeakMap(), groups = new Map(), sessions = new Map();
    const fastPending = new Map(), fastRunning = new Map(), fastQueue = [];
    const historyPending = new Set(), fastSeeds = new Map();
    // Opt-in local diagnostics only. No telemetry, identifiers, or data are transmitted.
    const diagnostic = w.location?.search && new URLSearchParams(w.location.search).get('staffStartup') === '1';
    const stages = {T0: 0}, records = new Map(), longTasks = [];
    let lastVisibility = {rendered: 0, onScreen: 0};
    const now = () => w.performance?.now?.() || 0;
    function mark(stage) { if (diagnostic && stages[stage] === undefined) stages[stage] = now(); }
    function record(id, values) {
        if (!diagnostic) return;
        records.set(id, Object.assign(records.get(id) || {sessionId: id}, values));
    }
    function snapshot(id, snap, kind) {
        if (!diagnostic) return;
        const previous = records.get(id) || {};
        const count = snap.size ?? snap.docs?.length ?? 0;
        record(id, {[kind + 'SnapshotAt']: now(), [kind + 'SnapshotCount']: (previous[kind + 'SnapshotCount'] || 0) + 1,
            [kind + 'InitialDocuments']: previous[kind + 'InitialDocuments'] ?? count,
            [kind + 'FirstServerDocuments']: previous[kind + 'FirstServerDocuments'] ??
                (snap.metadata?.fromCache === true ? null : count),
            [kind + 'FromCache']: snap.metadata?.fromCache ?? null});
        mark('T7');
    }
    function processing(id, values) {
        if (!diagnostic) return;
        const previous = records.get(id) || {};
        const initial = {};
        for (const [name, value] of Object.entries(values)) {
            if (previous['initial' + name] === undefined) initial['initial' + name] = value;
            if (previous.historyFromCache !== true && previous['firstServer' + name] === undefined)
                initial['firstServer' + name] = value;
        }
        record(id, {...initial, ...values});
    }
    function eligible() {
        return Object.values(w.visibleStaffCache || {}).filter(s => s?.dutyActive === true && String(s.sessionId || '').trim());
    }
    function visibleFrames() {
        if (!diagnostic || !w.requestAnimationFrame) return;
        w.requestAnimationFrame(() => w.requestAnimationFrame(() => {
            const staff = eligible(), available = staff.filter(s => latest(String(s.sessionId).trim()));
            if (available.length) mark('T8');
            if (staff.length && available.length === staff.length) mark('T10');
            const rendered = staff.filter(s => {
                const marker = w.staffMarkers?.[key(s)], icon = marker?.getElement?.();
                return marker?.__staffSession === String(s.sessionId).trim() && icon?.isConnected &&
                    w.map?.hasLayer?.(marker) && icon.getBoundingClientRect().width > 0 &&
                    w.getComputedStyle(icon).visibility !== 'hidden' && w.getComputedStyle(icon).display !== 'none';
            });
            const mapBox = w.map?.getContainer?.().getBoundingClientRect();
            const onScreen = rendered.filter(s => {
                const box = w.staffMarkers[key(s)].getElement().getBoundingClientRect();
                return mapBox && box.right > Math.max(0, mapBox.left) && box.left < Math.min(w.innerWidth, mapBox.right) &&
                    box.bottom > Math.max(0, mapBox.top) && box.top < Math.min(w.innerHeight, mapBox.bottom);
            });
            lastVisibility = {rendered: rendered.length, onScreen: onScreen.length};
            if (onScreen.length) mark('T9');
            if (staff.length && rendered.length === staff.length) mark('T11');
        }));
    }
    if (diagnostic) {
        try {
            new w.PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    if (longTasks.length < 500) longTasks.push({start: entry.startTime, duration: entry.duration});
                }
            }).observe({type: 'longtask', buffered: true});
        } catch (_) { /* Not all WebViews expose long-task observations. */ }
        w.StaffStartupDiagnostics = {
            mark, record, snapshot, processing, now,
            report() {
                const staff = eligible();
                return {timeOrigin: w.performance.timeOrigin, capturedAt: now(), stages: {...stages},
                    firstMarkerMs: stages.T9 ?? null, allMarkersMs: stages.T11 ?? null,
                    visibility: {...lastVisibility},
                    authorizedActiveStaff: staff.length,
                    awaitingSessions: staff.map(s => String(s.sessionId).trim()).filter(id => !latest(id)),
                    sessions: [...records.values()].map(value => ({...value})), longTasks: [...longTasks],
                    caveats: ['T9 checks an on-screen Leaflet icon after two animation frames, not a physical display measurement.',
                        'T11 checks all eligible icons rendered in the layer; some may be outside the viewport.',
                        'Snapshot wait includes SDK/cache/network/server scheduling; it is not pure network latency.',
                        'Long tasks do not by themselves identify GIS or analytics as their cause.']};
            }
        };
    }
    const key = s => w.cleanName(s?.cleanName || s?.name || '');
    const coordinate = p => Number(p.lat).toFixed(5) + ',' + Number(p.lon).toFixed(5);
    function time(p) {
        // Match processPatrolSessionSnapshot's authoritative time normalization.
        const raw = p?.time ?? p?.timestamp ?? '';
        if (typeof raw === 'string') {
            const parsed = Date.parse(raw);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        if (typeof raw?.toDate === 'function') {
            try { return raw.toDate().getTime(); } catch (_) { return 0; }
        }
        return Number.isFinite(Number(raw)) && Number(raw) > 0 ? Number(raw) : 0;
    }
    function valid(p, id) {
        const lat = Number(p?.lat), lon = Number(p?.lon);
        return !!p && String(p.sessionId || id).trim() === id &&
            Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0 &&
            Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
    }
    function newer(p, pid, entry) {
        return !entry.point || time(p) > time(entry.point) ||
            (time(p) === time(entry.point) && String(pid) > entry.pointId);
    }
    function scan(cache, id) {
        const entry = {point: null, pointId: '', count: 0};
        for (const [pid, p] of Object.entries(cache)) {
            entry.count++;
            if (valid(p, id) && newer(p, pid, entry)) { entry.point = p; entry.pointId = pid; }
        }
        indexes.set(cache, entry);
        return entry;
    }
    function index(id) {
        const cache = w.sessionPointCache?.[id];
        return cache && (indexes.get(cache) || scan(cache, id));
    }
    function owner(id) {
        const s = w.patrolSessionStaff?.[id];
        const current = s && w.visibleStaffCache?.[key(s)];
        return current?.dutyActive === true && String(current.sessionId || '').trim() === id ? current : null;
    }
    function ungroup(id) {
        const old = sessions.get(id);
        if (old) {
            const members = groups.get(old);
            members?.delete(id);
            if (!members?.size) groups.delete(old);
            sessions.delete(id);
        }
    }
    function group(id, point) {
        if (!owner(id) || !point) { ungroup(id); return; }
        const c = coordinate(point);
        if (sessions.get(id) === c) return;
        ungroup(id);
        if (!groups.has(c)) groups.set(c, new Set());
        groups.get(c).add(id); sessions.set(id, c);
    }
    function latest(id) {
        id = String(id || '').trim();
        const entry = typeof w.getLiveStaffPointForSession === 'function' ? null : index(id);
        const p = typeof w.getLiveStaffPointForSession === 'function'
            ? w.getLiveStaffPointForSession(id) : entry?.point;
        group(id, p);
        return p ? {...p, id: String(p.id || entry?.pointId || ''), sessionId: id} : null;
    }
    function changed(id, pid, p, existed, removed) {
        const cache = w.sessionPointCache?.[id];
        if (!cache) return;
        let entry = indexes.get(cache);
        if (!entry) entry = scan(cache, id);
        else {
            if (removed) entry.count = Math.max(0, entry.count - (existed ? 1 : 0));
            else if (!existed) entry.count++;
            if (entry.pointId === pid && !removed && valid(p, id) && time(p) >= time(entry.point)) {
                entry.point = p;
            } else if (entry.pointId === pid) {
                // A changed/deleted winning point can expose an older valid point.
                entry = scan(cache, id);
            } else if (!removed && valid(p, id) && newer(p, pid, entry)) {
                entry.point = p; entry.pointId = pid;
            }
        }
        group(id, entry.point);
        if (!entry.point && owner(id)) {
            const name = key(owner(id)), marker = w.staffMarkers?.[name];
            if (marker?.__staffSession === id) { marker.remove(); delete w.staffMarkers[name]; }
            w.staffLocationStates ??= Object.create(null);
            w.staffLocationStates[name] = {state: 'AWAITING_LOCATION', sessionId: id};
        }
    }
    function syncVisible() {
        const required = new Set();
        for (const s of Object.values(w.visibleStaffCache || {})) {
            const id = String(s?.sessionId || '').trim();
            if (!id || s.dutyActive !== true) continue;
            required.add(id); latest(id);
        }
        for (const id of sessions.keys()) if (!required.has(id)) ungroup(id);
    }
    function position(s, p) {
        let lat = Number(p.lat), lon = Number(p.lon);
        if ((groups.get(coordinate(p))?.size || 0) > 1) {
            let hash = 0; for (const c of String(s.cleanName)) hash += c.charCodeAt(0);
            const angle = hash % 360 * Math.PI / 180;
            lat += Math.cos(angle) * 0.00003; lon += Math.sin(angle) * 0.00003;
        }
        return [lat, lon];
    }
    function state(p) {
        const age = Date.now() - time(p);
        return !time(p) || age >= 3 * 60 * 60 * 1000 ? 'OFFLINE' : age > 30 * 60 * 1000 ? 'STALE' : 'LIVE';
    }
    function icon(p, staff) {
        const special = w.TigerTeams?.iconForStaff(staff);
        if (special) return special;
        const status = state(p), opacity = status === 'LIVE' ? '1' : status === 'STALE' ? '0.55' : '0.35';
        const color = status === 'LIVE' ? '#00ff00' : status === 'STALE' ? '#ffd600' : '#ff0000';
        return w.L.divIcon({html: `
                <div class="markerWrap" style="opacity:${opacity};">
                  <div class="markerCore">
                    <i class="fa-solid fa-person-military-pointing" style="color:${color}; font-size:17px;"></i>
                  </div>
                </div>
              `, iconSize: [30, 30], iconAnchor: [15, 15]});
    }
    function mayShowStaff(staff){
        return !w.TigerTeams?.isTigerTeamStaff(staff) || w.TigerTeams.canViewTigerTeams();
    }
    function hideRestrictedMarker(name){
        const marker = w.staffMarkers?.[name];
        if(!marker) return;
        marker.remove();
        delete w.staffMarkers[name];
    }
    function enforceTigerTeamVisibility(){
        for(const [name, marker] of Object.entries(w.staffMarkers || {})){
            const staff = w.visibleStaffCache?.[name];
            if(staff && !mayShowStaff(staff)) hideRestrictedMarker(name);
        }
    }
    function current(marker) {
        const s = w.visibleStaffCache?.[marker.__staffKey];
        const id = String(s?.sessionId || '').trim();
        if (!s || !mayShowStaff(s) || s.dutyActive !== true || !id || id !== marker.__staffSession) return null;
        const p = latest(id);
        return p ? {s, p, id} : null;
    }
    function gisVersion() {
        return [w.allCompartmentFeatures, w.allCompartmentFeatures?.length,
            w.__villageBoundaryGeoJSON, w.__villageBoundaryGeoJSON?.features?.length,
            w.__villageLocationCache, w.__villageLocationCache?.length];
    }
    function same(a, b) { return a?.length === b?.length && a.every((v, i) => v === b[i]); }
    function build(marker, value, enrich = false) {
        // Reuse the complete authoritative template; construction occurs only on demand.
        const html = marker.__staffBuilder(value.s, value.p, value.id, Number(value.p.lat), Number(value.p.lon), enrich).popup;
        const template = w.document.createElement('template'); template.innerHTML = html;
        if (historyPending.has(value.id)) {
            const count = template.content.querySelector('[id^="staffPatrolPoints_"]');
            if (count && value.p.patrolPointCount == null) count.textContent = 'History loading…';
            const distance = template.content.querySelector('[id^="staffDistance_"]');
            if (distance && value.p.distanceCoveredKm == null && value.p.distanceCoveredMeters == null)
                distance.textContent = 'History loading…';
        }
        const location = template.content.querySelector('[id^="staffCurrentLocation_"]');
        const cached = marker.__staffLocation;
        if (location && !enrich && cached?.key === locationKey(value) && same(cached.version, gisVersion()))
            location.innerHTML = cached.html;
        const ready = Array.isArray(w.__villageBoundaryGeoJSON?.features) && Array.isArray(w.allCompartmentFeatures);
        if (location && !ready && location.textContent.includes('Outside mapped forest/village boundary'))
            location.textContent = w.__VILLAGE_LOCATION_LOADING__ ? 'GIS data loading…' : 'GIS data unavailable';
        const status = template.content.querySelector('[data-staff-field="gpsStatus"]');
        if (status) status.textContent = '🛰 Live GPS Active — duty enabled; ' +
            (!time(value.p) ? 'fix time unknown' : Date.now() - time(value.p) > 60000 ? 'last fix is stale' : 'recent fix');
        return template;
    }
    function locationKey(value) { return JSON.stringify([value.id, value.p.lat, value.p.lon]); }
    function enrichLocation(marker) {
        const value = current(marker);
        if (!value || !marker.isPopupOpen()) return;
        const key = locationKey(value), version = gisVersion(), cached = marker.__staffLocation;
        if (cached?.key === key && same(cached.version, version)) return;
        w.StaffPopup.deferRefresh(marker, () => {
            const latestValue = current(marker);
            if (!marker.isPopupOpen() || !latestValue || locationKey(latestValue) !== key || !same(version, gisVersion())) return;
            const template = build(marker, latestValue, true);
            const location = template.content.querySelector('[id^="staffCurrentLocation_"]');
            if (location) {
                marker.__staffLocation = {key, version, html: location.innerHTML};
                w.StartupCoordinator?.mark("dynamicPopupEnrichmentCompleted");
                marker.__staffModel = null;
                refresh(marker);
            }
        });
    }
    function modelKey(value) {
        return JSON.stringify([value.s, value.p, Date.now() - time(value.p) > 60000, historyPending.has(value.id)]);
    }
    function clock(marker, value) {
        const root = marker.getPopup()?.getElement(), node = root?.querySelector('[id^="staffDutyDuration_"]');
        if (!node) return;
        const start = Number(value.id.split('_').pop());
        if (!Number.isFinite(start)) { node.textContent = 'Unknown'; return; }
        const minutes = Math.floor((Date.now() - start) / 60000), hours = Math.floor(minutes / 60);
        const text = hours > 0 ? `${hours} hr ${minutes % 60} min` : `${minutes} min`;
        if (node.textContent !== text) node.textContent = text;
    }
    function refresh(marker) {
        const currentStaff = w.visibleStaffCache?.[marker.__staffKey];
        if(currentStaff && !mayShowStaff(currentStaff)) {
            hideRestrictedMarker(marker.__staffKey);
            return;
        }
        const value = current(marker);
        if (!value) { if (marker.isPopupOpen()) marker.closePopup(); return; }
        const status = state(value.p);
        const teamType = w.TigerTeams?.activeTeam(value.s)?.type || '';
        if (marker.__staffState !== status || (marker.__tigerTeamType || '') !== teamType) {
            const nextIcon = icon(value.p, value.s);
            if (!teamType || marker.options.icon !== nextIcon) marker.setIcon(nextIcon);
            marker.__staffState = status; marker.__tigerTeamType = teamType;
        }
        w.TigerTeams?.present(marker, value.s, status);
        w.StaffPopup.setPosition(marker, ...position(value.s, value.p));
        if (!marker.isPopupOpen()) return;
        const root = marker.getPopup().getElement(), signature = modelKey(value), version = gisVersion();
        if (root && (marker.__staffModel !== signature || !same(marker.__staffGIS, version))) {
            const template = build(marker, value);
            // Keep the popup/action container and delegated listeners stable.
            for (const node of template.content.querySelectorAll('[data-staff-field], [id^="staff"]')) {
                const target = node.id ? root.querySelector('#' + w.CSS.escape(node.id)) :
                    root.querySelector('[data-staff-field="' + node.dataset.staffField + '"]');
                if (target && target.innerHTML !== node.innerHTML) target.innerHTML = node.innerHTML;
            }
            const navigate = root.querySelector('[data-staff-field="navigate"]');
            if (navigate) navigate.setAttribute('onclick', `navigateHEC('${value.p.lat}','${value.p.lon}')`);
            marker.__staffModel = signature; marker.__staffGIS = gisVersion();
            w.StaffPopup.place(marker);
        }
        clock(marker, value);
        enrichLocation(marker);
    }
    function ensure(s, p, id, lat, lon, builder) {
        const began = diagnostic ? now() : 0;
        const name = key(s), authorized = w.visibleStaffCache?.[name];
        if (authorized && !mayShowStaff(authorized)) {
            hideRestrictedMarker(name);
            return {marker: null, icon: null, popup: ''};
        }
        if (!authorized || authorized.dutyActive !== true || String(authorized.sessionId || '').trim() !== id || !valid(p, id))
            return {marker: null, icon: null, popup: ''};
        let marker = w.staffMarkers[name];
        if (!marker) {
            marker = w.L.marker([lat, lon], {icon: icon(p, s), zIndexOffset: 3000, autoPanOnFocus: false});
            marker.__tigerTeamType = w.TigerTeams?.activeTeam(s)?.type || '';
            marker.__staffKey = name; marker.__staffSession = id; marker.__staffState = state(p);
            marker.__staffBuilder = builder;
            marker.__staffPopupFactory = () => {
                const value = current(marker);
                if (!value) return 'Staff or active session unavailable.';
                const template = build(marker, value);
                marker.__staffModel = modelKey(value); marker.__staffGIS = gisVersion();
                return template.innerHTML;
            };
            marker.bindPopup(w.StaffPopup.create(marker.__staffPopupFactory));
            w.staffMarkers[name] = marker; marker.addTo(w.staffLayer);
            w.StaffTrackNavigation.bindPopup(marker, name);
            const stop = () => { w.clearInterval(marker.__staffClock); marker.__staffClock = null; w.StaffPopup.cancelRefresh(marker); };
            marker.on('popupopen', () => { w.StartupCoordinator?.mark('firstPopupOpened'); stop(); refresh(marker); marker.__staffClock = w.setInterval(() => refresh(marker), 1000); });
            marker.on('popupclose remove', stop);
        }
        refresh(marker);
        w.staffLocationStates ??= Object.create(null);
        w.staffLocationStates[name] = {state: 'POSITION_AVAILABLE', sessionId: id};
        w.StartupCoordinator?.markerRendered(marker);
        mark('T8'); processing(id, {markerMs: now() - began}); record(id, {markerUpdatedAt: now()}); visibleFrames();
        return {marker, icon: marker.options.icon, popup: marker.__staffPopupFactory};
    }
    function drainFast() {
        for (let i = 0; i < fastQueue.length && fastRunning.size < 4;) {
            const entry = fastQueue[i];
            if (fastPending.get(entry.id) !== entry.staff) { fastQueue.splice(i, 1); continue; }
            if (fastRunning.has(entry.id)) { i++; continue; }
            fastQueue.splice(i, 1);
            const authorized = owner(entry.id);
            if (!authorized || latest(entry.id)) { fastPending.delete(entry.id); continue; }
            fastRunning.set(entry.id, entry.staff);
            record(entry.id, {fastStartedAt: now()});
            if (w.loadLatestPatrolPointFast) w.loadLatestPatrolPointFast(entry.id, entry.staff);
            else finishFast(entry.id, entry.staff);
        }
    }
    function fast(id, staff) {
        if (fastPending.has(id) || latest(id)) return;
        w.staffLocationStates ??= Object.create(null);
        w.staffLocationStates[key(staff)] = {state: 'AWAITING_LOCATION', sessionId: id};
        fastPending.set(id, staff);
        fastQueue.push({id, staff}); record(id, {fastQueuedAt: now()}); drainFast();
    }
    function finishFast(id, staff) {
        if (fastPending.get(id) === staff) fastPending.delete(id);
        if (fastRunning.get(id) === staff) fastRunning.delete(id);
        drainFast();
        w.StartupCoordinator?.settled(historyPending.size + fastPending.size);
    }
    function beginHistory(id) { historyPending.add(id); }
    function trackFastSeed(id, pid) {
        if (!fastSeeds.has(id)) fastSeeds.set(id, new Set());
        fastSeeds.get(id).add(pid);
    }
    function reconcileFastSeeds(id, snap) {
        // A late/deleted fast result must not survive a complete server snapshot.
        if (snap.metadata?.fromCache === true || !Array.isArray(snap.docs)) return;
        const cache = w.sessionPointCache?.[id], ids = new Set(snap.docs.map(doc => doc.id));
        for (const pid of fastSeeds.get(id) || []) {
            if (!ids.has(pid) && cache && Object.prototype.hasOwnProperty.call(cache, pid)) {
                delete cache[pid]; changed(id, pid, null, true, true);
            }
        }
        fastSeeds.delete(id);
    }
    function completeHistory(id, snap) {
        if (snap?.metadata?.fromCache === true) return;
        historyPending.delete(id);
        w.StartupCoordinator?.settled(historyPending.size + fastPending.size);
        const s = owner(id), marker = s && w.staffMarkers?.[key(s)];
        if (marker?.isPopupOpen()) refresh(marker);
        visibleFrames();
    }
    function selectFast(docs, id) {
        let selected = null, selectedId = '';
        for (const doc of docs) {
            const raw = doc.data();
            if (!raw) continue;
            const point = {...raw, id: String(doc.id), sessionId: String(raw.sessionId || id).trim()};
            if (valid(point, id) && (!selected || time(point) > time(selected) ||
                (time(point) === time(selected) && point.id > selectedId))) { selected = point; selectedId = point.id; }
        }
        return selected;
    }
    function release(id) {
        ungroup(id); fastPending.delete(id); historyPending.delete(id); fastSeeds.delete(id);
        for (let i = fastQueue.length - 1; i >= 0; i--) if (fastQueue[i].id === id) fastQueue.splice(i, 1);
        for (const [name, value] of Object.entries(w.staffLocationStates || {}))
            if (value.sessionId === id) delete w.staffLocationStates[name];
    }
    w.StaffRendering = {latest, changed, pointTime: time, count: id => index(id)?.count || 0, syncVisible,
        overlapCount: c => groups.get(c)?.size || 0, ensure, refresh, fast, finishFast, release,
        fastPendingCount: () => historyPending.size + fastPending.size,
        isFastCurrent: (id, staff) => fastPending.get(id) === staff && fastRunning.get(id) === staff,
        beginHistory, completeHistory, selectFast, trackFastSeed, reconcileFastSeeds,
        historyPending: id => historyPending.has(id)};
    const start = () => {
        if (w.userProfile && w.fb && w.db) w.loadStaff?.();
    };
    w.StaffRendering.start = start;
    if (w.document.readyState === 'loading') w.document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
    w.addEventListener('userProfileLoaded', () => {
        enforceTigerTeamVisibility();
        if (w.staffListenerActive && w.refreshStaffAuthorization) w.refreshStaffAuthorization();
        else start();
    });
    const resume = () => {
        for (const s of Object.values(w.visibleStaffCache || {}))
            if (s?.dutyActive === true && s.sessionId) w.ensurePatrolSessionListener?.(String(s.sessionId).trim(), s);
    };
    w.addEventListener('online', resume);
    w.document.addEventListener('visibilitychange', () => { if (w.document.visibilityState === 'visible') resume(); });
})(window);
