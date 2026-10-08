/* Read-only consumers of authorized staff and the existing patrol point cache. */
(function (w) {
    'use strict';
    const indexes = new WeakMap(), groups = new Map(), sessions = new Map();
    const fastPending = new Map();
    const key = s => w.cleanName(s?.cleanName || s?.name || '');
    const coordinate = p => Number(p.lat).toFixed(5) + ',' + Number(p.lon).toFixed(5);
    function time(p) {
        const n = typeof w.getPointTime === 'function' ? Number(w.getPointTime(p)) : Number(p?.time || 0);
        if (Number.isFinite(n) && n > 0) return n;
        const fallback = Date.parse(String(p?.timestamp || ''));
        return Number.isFinite(fallback) ? fallback : 0;
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
        const entry = index(id), p = entry?.point;
        group(id, p);
        return p ? {...p, id: String(p.id || entry.pointId), sessionId: id} : null;
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
    function icon(p) {
        const status = state(p), opacity = status === 'LIVE' ? '1' : status === 'STALE' ? '0.55' : '0.35';
        const color = status === 'LIVE' ? '#00ff00' : status === 'STALE' ? '#ffd600' : '#ff0000';
        return w.L.divIcon({html: `
                <div class="markerWrap" style="opacity:${opacity};">
                  ${status === 'LIVE' ? '<div class="radarPulse"></div>' : ''}
                  <div class="markerCore">
                    <i class="fa-solid fa-person-military-pointing" style="color:${color}; font-size:17px;"></i>
                  </div>
                </div>
              `, iconSize: [30, 30], iconAnchor: [15, 15]});
    }
    function current(marker) {
        const s = w.visibleStaffCache?.[marker.__staffKey];
        const id = String(s?.sessionId || '').trim();
        if (!s || s.dutyActive !== true || !id || id !== marker.__staffSession) return null;
        const p = latest(id);
        return p ? {s, p, id} : null;
    }
    function gisVersion() {
        return [w.allCompartmentFeatures, w.allCompartmentFeatures?.length,
            w.__villageBoundaryGeoJSON, w.__villageBoundaryGeoJSON?.features?.length,
            w.__villageLocationCache, w.__villageLocationCache?.length];
    }
    function same(a, b) { return a?.length === b?.length && a.every((v, i) => v === b[i]); }
    function build(marker, value) {
        // Reuse the complete authoritative template; construction occurs only on demand.
        const html = marker.__staffBuilder(value.s, value.p, value.id, Number(value.p.lat), Number(value.p.lon)).popup;
        const template = w.document.createElement('template'); template.innerHTML = html;
        const location = template.content.querySelector('[id^="staffCurrentLocation_"]');
        const ready = Array.isArray(w.__villageBoundaryGeoJSON?.features) && Array.isArray(w.allCompartmentFeatures);
        if (location && !ready && location.textContent.includes('Outside mapped forest/village boundary'))
            location.textContent = w.__VILLAGE_LOCATION_LOADING__ ? 'GIS data loading…' : 'GIS data unavailable';
        const status = template.content.querySelector('[data-staff-field="gpsStatus"]');
        if (status) status.textContent = '🛰 Live GPS Active — duty enabled; ' +
            (!time(value.p) ? 'fix time unknown' : Date.now() - time(value.p) > 60000 ? 'last fix is stale' : 'recent fix');
        return template;
    }
    function modelKey(value) {
        return JSON.stringify([value.s, value.p, Date.now() - time(value.p) > 60000]);
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
        const value = current(marker);
        if (!value) { if (marker.isPopupOpen()) marker.closePopup(); return; }
        const status = state(value.p);
        if (marker.__staffState !== status) { marker.setIcon(icon(value.p)); marker.__staffState = status; }
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
    }
    function ensure(s, p, id, lat, lon, builder) {
        const name = key(s), authorized = w.visibleStaffCache?.[name];
        if (!authorized || authorized.dutyActive !== true || String(authorized.sessionId || '').trim() !== id || !valid(p, id))
            return {marker: null, icon: null, popup: ''};
        let marker = w.staffMarkers[name];
        if (!marker) {
            marker = w.L.marker([lat, lon], {icon: icon(p), zIndexOffset: 3000, autoPanOnFocus: false});
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
            marker.on('popupopen', () => { stop(); refresh(marker); marker.__staffClock = w.setInterval(() => refresh(marker), 1000); });
            marker.on('popupclose remove', stop);
        }
        refresh(marker);
        w.staffLocationStates ??= Object.create(null);
        w.staffLocationStates[name] = {state: 'POSITION_AVAILABLE', sessionId: id};
        return {marker, icon: marker.options.icon, popup: marker.__staffPopupFactory};
    }
    function fast(id, staff) {
        if (fastPending.has(id) || latest(id)) return;
        w.staffLocationStates ??= Object.create(null);
        w.staffLocationStates[key(staff)] = {state: 'AWAITING_LOCATION', sessionId: id};
        fastPending.set(id, staff);
        w.loadLatestPatrolPointFast?.(id, staff);
    }
    function finishFast(id, staff) { if (fastPending.get(id) === staff) fastPending.delete(id); }
    function release(id) {
        ungroup(id); fastPending.delete(id);
        for (const [name, value] of Object.entries(w.staffLocationStates || {}))
            if (value.sessionId === id) delete w.staffLocationStates[name];
    }
    w.StaffRendering = {latest, changed, count: id => index(id)?.count || 0, syncVisible,
        overlapCount: c => groups.get(c)?.size || 0, ensure, refresh, fast, finishFast, release};
    const start = () => {
        if (w.userProfile && w.fb && w.db) w.loadStaff?.();
    };
    if (w.document.readyState === 'loading') w.document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
    w.addEventListener('userProfileLoaded', () => {
        if (w.staffListenerActive && w.refreshStaffAuthorization) w.refreshStaffAuthorization();
        else start();
    });
    const resume = () => {
        for (const s of Object.values(w.visibleStaffCache || {}))
            if (s?.dutyActive === true && s.sessionId) fast(String(s.sessionId).trim(), s);
    };
    w.addEventListener('online', resume);
    w.document.addEventListener('visibilitychange', () => { if (w.document.visibilityState === 'visible') resume(); });
})(window);
