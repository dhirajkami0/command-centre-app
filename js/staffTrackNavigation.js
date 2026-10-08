/* Explicit live-staff track actions. The existing cache engine owns geometry. */
(function (w) {
    'use strict';
    let requestId = 0;
    const canonical = name => w.cleanName(String(name || ''));
    function profile(name) {
        const key = canonical(name), staff = w.visibleStaffCache?.[key];
        const sessionId = String(staff?.sessionId || '').trim();
        return staff?.dutyActive === true && sessionId ? {key,sessionId} : null;
    }
    function displayed(p) {
        const own = canonical(w.userProfile?.cleanName || w.userProfile?.name);
        if (w.staffTrackState?.bulkEnabled) return w.bulkStaffTracks?.[p.key] || null;
        const track = w.staffTracks?.[p.key];
        if (p.key === own) return track || null;
        return canonical(w.staffTrackState?.selectedStaff) === p.key &&
            track?.__ggStaffTrackSessionId === p.sessionId ? track : null;
    }
    function current(p, id) {
        const latest = profile(p.key);
        return id === requestId && latest?.sessionId === p.sessionId;
    }
    function view(name) {
        const id = ++requestId, p = profile(name);
        if (!p) return {ok:false,message:'Staff or active session unavailable.'};
        let track = displayed(p);
        if (!track && !w.staffTrackState?.bulkEnabled &&
            p.key !== canonical(w.userProfile?.cleanName || w.userProfile?.name)) {
            track = w.loadIndividualStaffTrack(p.key);
        }
        // The production loader is synchronous and cache-only. Never attach an
        // auto-zoom callback to a pending result or a future asynchronous loader.
        if (!current(p,id) || track?.then) return {ok:false,message:'Track selection changed or is pending.'};
        if (!track) return {ok:false,message:'No displayed track yet. Waiting for available patrol points.'};
        return {ok:true,message:'Track displayed. Map view unchanged.',track};
    }
    function zoom(name) {
        const id = ++requestId, p = profile(name);
        if (!p) return {ok:false,message:'Staff or active session unavailable.'};
        const track = displayed(p), map = w.map;
        const bounds = track?.getBounds?.();
        if (!bounds?.isValid?.()) return {ok:false,message:'Use View Track first; no valid displayed track is available.'};
        const sw=bounds.getSouthWest(), ne=bounds.getNorthEast();
        if (![sw.lat,sw.lng,ne.lat,ne.lng].every(Number.isFinite) ||
            Math.max(Math.abs(sw.lat),Math.abs(ne.lat)) > 90 ||
            Math.max(Math.abs(sw.lng),Math.abs(ne.lng)) > 180) {
            return {ok:false,message:'Track bounds are invalid.'};
        }
        if (!current(p,id) || displayed(p) !== track) return {ok:false,message:'Track selection changed.'};
        const size=map.getSize();
        map.fitBounds(bounds,{maxZoom:17,padding:[Math.min(40,Math.floor(size.x/8)),Math.min(64,Math.floor(size.y/8))]});
        return {ok:true,message:'Map fitted to track.',track};
    }
    function bindPopup(marker, name) {
        if (!marker || marker.__ggTrackActionsBound) return;
        marker.__ggTrackActionsBound = true;
        marker.on('popupopen', () => {
            const root=marker.getPopup()?.getElement();
            if (!root || root.__ggTrackActionsBound) return;
            root.__ggTrackActionsBound = true;
            root.addEventListener('click', event => {
                const button=event.target.closest('[data-staff-track-action]');
                if (!button || !root.contains(button) || !marker.isPopupOpen() || marker.getPopup()?.getElement() !== root) return;
                event.preventDefault();event.stopPropagation();
                if (button.dataset.staffTrackAction === 'close') {
                    w.map.closePopup(marker.getPopup());
                    return;
                }
                const result=button.dataset.staffTrackAction === 'view' ? view(name) :
                    button.dataset.staffTrackAction === 'zoom' ? zoom(name) : null;
                if (result) {
                    const status=root.querySelector('[data-staff-track-status]');
                    if (status) status.textContent=result.message;
                }
            });
        });
    }
    w.StaffTrackNavigation = {view,zoom,bindPopup};
})(window);
