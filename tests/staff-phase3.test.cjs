const fs = require('node:fs'), assert = require('node:assert/strict'), vm = require('node:vm');
function restorePhase3(source, helper = false) {
    source = require('./startup-coordinator.test.cjs').restorePhase4(source, helper ? 'js/staffRendering.js' : 'index.html');
    for (const {before, after} of [...require(helper ? './staff-phase3-helper-patch.json' : './staff-phase3-patch.json')].reverse()) {
        if (source.includes(after)) {
            assert.equal(source.split(after).length, 2, 'Unique reviewed Phase 3 source change');
            source = source.replace(after, before);
        }
    }
    return source;
}
module.exports = {restorePhase3};
if (require.main === module) {
    const html = fs.readFileSync('index.html', 'utf8'), queued = new Map(), intervals = new Map();
    let gisCalls = 0, builds = 0, camera = 0;
    function template() {
        let html = '', location;
        return {set innerHTML(value) {
            html = value;
            const match = value.match(/<div id="(staffCurrentLocation_[^"]+)">([\s\S]*?)\n                <\/div>/);
            location = match && {id: match[1], innerHTML: match[2], textContent: match[2]};
        }, get innerHTML() {
            return location ? html.replace(/(<div id="staffCurrentLocation_[^"]+">)[\s\S]*?(\n                <\/div>)/,
                (_, start, end) => start + location.innerHTML + end) : html;
        }, content: {querySelector(selector) { return selector.includes('staffCurrentLocation_') ? location : null; },
            querySelectorAll() { return location ? [location] : []; }}};
    }
    class Marker {
        constructor(ll, options) { this.ll = ll; this.options = options; this.handlers = {}; }
        bindPopup(p) { this.popup = {...p, getElement: () => this.root}; return this; }
        getPopup() { return this.popup; }
        isPopupOpen() { return !!this.open; }
        addTo() { return this; }
        on(events, fn) { for (const event of events.split(' ')) (this.handlers[event] ??= []).push(fn); return this; }
        fire(event) { for (const fn of this.handlers[event] || []) fn(); }
        openPopup() {
            this.open = true; this.content = this.popup.content();
            this.location = {innerHTML: ''};
            this.root = {querySelector: selector => selector.includes('staffCurrentLocation_') ? this.location : null};
            this.fire('popupopen');
        }
        closePopup() { this.open = false; this.fire('popupclose'); }
        setIcon(icon) { this.options.icon = icon; }
        bindTooltip() { return this; }
        unbindTooltip() { return this; }
        getElement() { return {style: {}, setAttribute() {}}; }
    }
    const c = {console, Date, Map, Set, URLSearchParams, performance,
        cleanName: x => String(x).toUpperCase(), getUserColor: () => '#fff',
        document: {readyState: 'loading', addEventListener() {}, createElement: template}, addEventListener() {},
        L: {marker: (ll, options) => new Marker(ll, options), divIcon: options => ({options})},
        staffMarkers: {}, staffLayer: {}, visibleStaffCache: {}, sessionPointCache: {}, patrolSessionStaff: {},
        allCompartmentFeatures: [], __villageBoundaryGeoJSON: {features: []},
        resolveCurrentGIS() { gisCalls++; return {compartment: 'C', beat: 'B', range: 'R'}; },
        CSS: {escape: x => x}, setInterval: fn => { const id = intervals.size + 1; intervals.set(id, fn); return id; },
        clearInterval: id => intervals.delete(id),
        StaffPopup: {create: content => ({content, options: {autoPan: false, keepInView: false}}),
            setPosition(marker, lat, lon) { marker.ll = [lat, lon]; }, place() {},
            deferRefresh: (marker, fn) => queued.set(marker, fn), cancelRefresh: marker => queued.delete(marker)},
        StaffTrackNavigation: {bindPopup() {}},
        map: {panTo() { camera++; }, fitBounds() { camera++; }}};
    c.window = c; vm.createContext(c);
    vm.runInContext(fs.readFileSync('js/tigerTeams.js', 'utf8'), c);
    vm.runInContext(fs.readFileSync('js/staffRendering.js', 'utf8'), c);
    const start = html.indexOf('window.ensureLiveStaffMarker = function');
    const end = html.indexOf('window.updateLiveMarkerFromPatrolPoint =', start);
    vm.runInContext(html.slice(start, end), c);
    function create(name) {
        const s = {cleanName: name, name, phone: '123', range: 'R', beat: 'B', division: 'D',
            team: 'Patrol', dutyType: 'Patrolling', dutyActive: true, sessionId: name + '_1000'};
        const p = {id: 'p1', lat: 26, lon: 89, time: Date.now(), sessionId: s.sessionId, speed: 2};
        c.visibleStaffCache[name] = s; c.patrolSessionStaff[s.sessionId] = s;
        c.sessionPointCache[s.sessionId] = {p1: p}; c.StaffRendering.beginHistory(s.sessionId);
        const marker = c.ensureLiveStaffMarker(s, p, s.sessionId, p.lat, p.lon).marker;
        const original = marker.__staffBuilder;
        marker.__staffBuilder = (...args) => { builds++; return original(...args); };
        return {s, p, marker};
    }
    const a = create('SANJIB KHARIA'), b = create('NORMAL');
    for (let i = 0; i < 48; i++) create('SYNTHETIC ' + i);
    assert.equal(Object.keys(c.staffMarkers).length, 50, 'Fifty authorized markers without popup construction');
    assert.equal(builds, 0); assert.equal(gisCalls, 0, 'Closed markers never build popup/GIS');
    a.marker.openPopup();
    assert.equal(gisCalls, 0, 'Click/popupopen performs no GIS lookup');
    assert(c.StaffRendering.historyPending(a.s.sessionId), 'Popup opens while history remains incomplete');
    for (const field of ['SANJIB KHARIA', 'SBMT-1', 'tel:123', 'Posting:', 'Duty Area:', 'Patrol Team',
        'Speed:', 'Distance Travelled:', 'Patrol Points:', 'Duty Started:', 'Last GPS Update:',
        'NAVIGATE', 'View Track', 'Zoom to Track', 'Close', '26.000000', 'Location details loading'])
        assert(a.marker.content.includes(field), 'Preserved immediate field/action: ' + field);
    assert.equal(a.marker.popup.options.autoPan, false); assert.equal(a.marker.options.autoPanOnFocus, false);
    assert.equal(queued.size, 1); c.StaffRendering.refresh(a.marker); assert.equal(queued.size, 1);
    function flush() { const jobs = [...queued.values()]; queued.clear(); jobs.forEach(fn => fn()); }
    flush(); assert.equal(gisCalls, 1); assert(a.marker.location.innerHTML.includes('Compartment'));
    c.StaffRendering.refresh(a.marker); assert.equal(queued.size, 0, 'Unchanged GIS enrichment cached');
    b.marker.openPopup(); b.marker.closePopup(); flush(); assert.equal(gisCalls, 1, 'Closed-popup work cancelled');
    c.allCompartmentFeatures = [];
    c.resolveCurrentGIS = () => { gisCalls++; throw Error('Synthetic GIS unavailable'); };
    c.StaffRendering.refresh(a.marker); flush();
    assert.equal(gisCalls, 2, 'Failed GIS enrichment is caught by the existing authoritative builder');
    assert(a.marker.isPopupOpen(), 'GIS failure never blocks popup');
    a.p.lat = 26.1; c.StaffRendering.changed(a.s.sessionId, 'p1', a.p, true, false);
    c.StaffRendering.refresh(a.marker); assert.equal(gisCalls, 2, 'GPS refresh itself remains cheap');
    a.s.sessionId = 'NEW'; flush(); assert.equal(gisCalls, 2, 'Changed-session enrichment ignored');
    assert.equal(camera, 0);
    assert.equal(restorePhase3(html).includes('buildPopup = false, enrichGIS'), false);
    const helper = fs.readFileSync('js/staffRendering.js', 'utf8');
    assert(!/\b(getDocs|onSnapshot|runTransaction|setDoc)\s*\(/.test(helper), 'No new backend operations');
    const restored = restorePhase3(html);
    require('./phase134-release-integrity.cjs').verify(); // Complete selective-release integrity replaces a historical working-tree hash.
    console.log('PASS real popup template/helper: closed-marker laziness, synchronous static/GPS/actions, pending history independence, deferred deduplicated GIS, close/session guards, team preservation, camera neutrality. Controlled VM fixtures; no device latency claim.');
}
