/* Startup presentation/diagnostics only. No data queries, persistence or GPS processing. */
(function (w) {
    'use strict';
    const enabled = new URLSearchParams(w.location?.search || '').get('startupDiagnostics') === '1';
    const timings = {}, states = {staff: 'Loading', monthly: 'Loading', boundary: 'Loading'};
    let map, cameraUsed = false, centered = false, discovered = false, staffReady = false;
    function mark(name) {
        if (enabled && timings[name] === undefined) timings[name] = w.performance.now();
    }
    function status(state, code) {
        if (w.navigator?.onLine === false) return 'Internet offline';
        if (state === 'Stale' && code) return 'Stale — ' + status('Unavailable', code);
        if (code === 'resource-exhausted') return 'Firestore quota exceeded';
        if (code === 'permission-denied') return 'Unavailable — permission denied';
        if (code) return code === 'timeout' ? 'Unavailable — timeout' : 'Unavailable';
        return state;
    }
    function paint() {
        for (const name of ['staff', 'monthly']) {
            const node = w.document.getElementById('btrStartup' + name);
            if (node) node.textContent = status(states[name], name === 'staff' ? w.firestoreServiceState?.code : states.monthlyCode);
        }
    }
    function attachStates() {
        const body = w.document.getElementById('monthlyStatusBody');
        if (!body || w.document.getElementById('btrStartupstaff')) return;
        for (const name of ['staff', 'monthly']) {
            const row = w.document.createElement('div'); row.className = 'monthlyStatusRow';
            const label = w.document.createElement('span'); label.textContent = name === 'staff' ? 'Staff data' : 'Monthly data';
            const value = w.document.createElement('span'); value.id = 'btrStartup' + name;
            row.append(label, value); body.append(row);
        }
        paint();
    }
    function bindMap(value, tiles) {
        if (map) return;
        map = value; mark('mapInitialized');
        map.on('movestart zoomstart', () => { cameraUsed = true; });
        if (enabled) tiles.once('tileload', () => w.requestAnimationFrame(() => mark('firstSatelliteTileFrame')));
    }
    function centerInitial(callback) {
        if (centered || cameraUsed) return false;
        centered = true; callback(); return true;
    }
    function sessions(count, fromCache) {
        discovered = true; staffReady = true;
        if (fromCache === true || fromCache === false)
            states.staff = fromCache ? 'Cached' : 'Live';
        else if (states.staff === 'Loading') states.staff = 'Available';
        states.eligibleSessions = count; mark('authorizedSessionsDiscovered'); paint();
    }
    function settled(pending) { if (discovered && pending === 0) mark('eligibleMarkerQueriesSettled'); }
    function markerRendered(marker) {
        if (!enabled || timings.firstStaffMarkerFrame !== undefined) return;
        w.requestAnimationFrame(() => w.requestAnimationFrame(() => {
            if (marker.getElement?.()?.isConnected && map?.hasLayer(marker)) mark('firstStaffMarkerFrame');
        }));
    }
    function monthly(state, error) {
        states.monthly = error && ['Live', 'Cached', 'Stale'].includes(states.monthly) ? 'Stale' : state;
        states.monthlyCode = error ? w.FirestoreRecovery?.classify(error) || 'unavailable' : null;
        if (state === 'Live' || state === 'Cached') mark('monthlyAnalyticsReady');
        paint();
    }
    w.StartupCoordinator = {mark, bindMap, centerInitial, sessions, settled, markerRendered, monthly, attachStates,
        get staffReady() { return staffReady; },
        boundaryReady() { states.boundary = 'Ready'; mark('authorizedRootBoundaryReady'); },
        boundaryFailed() { states.boundary = 'Unavailable'; },
        paint,
        report: () => ({enabled, timeOrigin: w.performance?.timeOrigin, timings: {...timings},
            states: {...states, staff: status(states.staff, w.firestoreServiceState?.code),
                monthly: status(states.monthly, states.monthlyCode)},
            internetOnline: w.navigator?.onLine !== false,
            cameraUsed, initialCenterApplied: centered,
            caveats: ['Frame callbacks indicate rendering opportunity, not physical display latency.',
                'Root boundary is the existing authorized master GIS layer.',
                'Queries settled does not mean every staff member has a valid GPS fix.']})};
    if (enabled) w.BTRStartupDiagnostics = {report: w.StartupCoordinator.report};
    w.addEventListener('online', paint); w.addEventListener('offline', paint);
})(window);
