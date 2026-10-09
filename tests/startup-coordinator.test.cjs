const fs = require('node:fs'), assert = require('node:assert/strict'), vm = require('node:vm');
function restorePhase4(source, file = 'index.html') {
    for (const {before, after, count} of [...(require('./startup-coordinator-patch.json')[file] || [])].reverse()) {
        if (source.includes(after)) {
            assert.equal(source.split(after).length - 1, count, 'Exact Phase 4 patch multiplicity: ' + file);
            source = source.split(after).join(before);
        }
    }
    return source;
}
module.exports = {restorePhase4};
if (require.main === module) {
    function fixture(enabled) {
        let time = 0, centers = 0; const events = {}, frames = [], elements = {};
        const c = {URLSearchParams, location: {search: enabled ? '?startupDiagnostics=1' : ''},
            navigator: {onLine: true}, performance: {now: () => time, timeOrigin: 1},
            document: {getElementById: id => elements[id], createElement: () => ({append() {}})},
            addEventListener: (event, fn) => events[event] = fn, requestAnimationFrame: fn => frames.push(fn),
            FirestoreRecovery: {classify: error => error.code},
            fb: new Proxy({}, {get() { throw Error('Unexpected Firestore access'); }})};
        c.window = c; vm.createContext(c); vm.runInContext(fs.readFileSync('js/startupCoordinator.js', 'utf8'), c);
        const handlers = {}, tiles = {once: (_, fn) => tiles.loaded = fn};
        const map = {on: (event, fn) => handlers[event] = fn, hasLayer: () => true};
        const api = c.StartupCoordinator;
        api.bindMap(map, tiles); api.bindMap(map, tiles);
        return {c, api, tiles, handlers, elements, frames, events, advance: n => time = n,
            center: () => centers++, centers: () => centers,
            flush() { while (frames.length) frames.shift()(); }};
    }
    const cold = fixture(true);
    cold.advance(10); cold.tiles.loaded(); cold.flush();
    cold.advance(20); cold.api.boundaryReady();
    cold.api.sessions(2, false); cold.api.settled(2);
    assert.equal(cold.api.report().timings.eligibleMarkerQueriesSettled, undefined);
    cold.advance(30); cold.api.markerRendered({getElement: () => ({isConnected: true})}); cold.flush();
    cold.advance(40); cold.api.settled(0); cold.api.mark('firstPopupOpened');
    cold.advance(50); cold.api.mark('dynamicPopupEnrichmentCompleted'); cold.api.monthly('Live');
    assert.equal(cold.api.report().timings.firstStaffMarkerFrame, 30);
    assert.equal(cold.api.report().timings.eligibleMarkerQueriesSettled, 40);
    assert.equal(cold.api.report().timings.monthlyAnalyticsReady, 50);
    assert(cold.api.centerInitial(cold.center)); assert(!cold.api.centerInitial(cold.center)); assert.equal(cold.centers(), 1);
    const slow = fixture(true); slow.handlers['movestart zoomstart']();
    slow.api.sessions(1, false); slow.api.markerRendered({getElement: () => ({isConnected: true})}); slow.flush();
    slow.api.boundaryFailed(); assert(!slow.api.centerInitial(slow.center));
    assert.equal(slow.api.report().states.boundary, 'Unavailable');
    assert.equal(slow.api.report().timings.firstStaffMarkerFrame, 0, 'GIS failure does not gate marker milestone');
    const warm = fixture(false); warm.api.sessions(0, true); warm.api.monthly('Cached');
    assert.equal(warm.c.BTRStartupDiagnostics, undefined); assert.deepEqual(Object.keys(warm.api.report().timings), []);
    warm.c.firestoreServiceState = {code: 'resource-exhausted'};
    assert.equal(warm.api.report().states.staff, 'Firestore quota exceeded');
    warm.c.navigator.onLine = false; assert.equal(warm.api.report().states.staff, 'Internet offline');
    warm.c.navigator.onLine = true; warm.c.firestoreServiceState = {code: 'timeout'};
    assert.equal(warm.api.report().states.staff, 'Unavailable — timeout');
    warm.api.monthly('Unavailable', {code: 'resource-exhausted'});
    assert.equal(warm.api.report().states.monthly, 'Stale — Firestore quota exceeded', 'Retained cached values identified as stale after service error');
    assert.equal(vm.runInContext('window.StartupCoordinator.staffReady ? Number(0).toLocaleString() : "Loading…"', warm.c), '0',
        'Confirmed empty staff snapshot preserves genuine zero');
    assert(!/staffName|sessionId|lat:|lon:/.test(JSON.stringify(cold.api.report())), 'No sensitive diagnostic fields');
    const source = fs.readFileSync('index.html', 'utf8');
    assert(source.indexOf('js/startupCoordinator.js') < source.indexOf('js/firestoreRecovery.js'));
    assert(source.includes('window.StartupCoordinator?.staffReady !== false ? liveStaff.toLocaleString() : "Loading…"'));
    const body = source.slice(source.indexOf('            Live Duty Team'), source.indexOf('function getLiveStaffForCurrentPolygon'));
    assert(body.includes('id="msTotalGrids">Loading…'));
    require('./phase134-release-integrity.cjs').verify();
    assert(!/\b(fetch|getDocs|onSnapshot|setDoc|runTransaction|setInterval)\s*\(/.test(fs.readFileSync('js/startupCoordinator.js', 'utf8')));
    console.log('PASS simulated startup milestones, cold/warm/GIS-failure independence, one initial center, manual-camera protection, quota/timeout/internet distinction, loading placeholders, opt-in diagnostics and exact source preservation. Synthetic clock only; no browser timings.');
}
