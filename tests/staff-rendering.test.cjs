const fs = require('node:fs'), assert = require('node:assert/strict'), vm = require('node:vm');
const patches = require('./staff-rendering-patch.json');
function restoreStaffRenderingChanges(source) {
    source = require('./tiger-teams.test.cjs').restoreTigerTeamChanges(source);
    source = require('./excluded-feature-restorations.cjs').restoreElephantLayerChanges(source);
    source = require('./staff-point-time.test.cjs').restorePointTimeFix(source);
    for (const {before, after} of [...require('./staff-startup-patch.json')].reverse()) {
        if (source.includes(after)) {
            assert.equal(source.split(after).length, 2, 'Reviewed startup patch occurs once');
            source = source.replace(after, before);
        }
    }
    for (const {before, after} of [...patches].reverse()) {
        if (source.includes(after)) {
            assert.equal(source.split(after).length, 2, 'Reviewed rendering patch occurs once');
            source = source.replace(after, before);
        }
    }
    return source;
}
module.exports = {restoreStaffRenderingChanges};
if (require.main === module) {
    const c = {console, Date, setTimeout, clearTimeout, setInterval, clearInterval,
        requestAnimationFrame: fn => setTimeout(fn, 0), cleanName: x => String(x).toLowerCase(),
        getPointTime: p => Number(p.time), sessionPointCache: {}, visibleStaffCache: {}, patrolSessionStaff: {},
        document: {readyState: 'loading', addEventListener() {}}, addEventListener() {}};
    c.window = c; vm.createContext(c);
    vm.runInContext(fs.readFileSync('js/staffRendering.js', 'utf8'), c);
    const render = c.StaffRendering, id = 'alice_1000', cache = c.sessionPointCache[id] = {};
    const s = {cleanName: 'alice', dutyActive: true, sessionId: id};
    c.visibleStaffCache.alice = s; c.patrolSessionStaff[id] = s;
    function add(key, p) { const existed = key in cache; cache[key] = {...p, id: key, sessionId: id}; render.changed(id, key, cache[key], existed, false); }
    add('a', {lat: 26, lon: 89, time: 10}); add('b', {lat: 26.1, lon: 89, time: 20});
    add('old', {lat: 25, lon: 88, time: 5}); assert.equal(render.latest(id).id, 'b');
    add('z', {lat: 26.2, lon: 89, time: 20}); assert.equal(render.latest(id).id, 'z');
    add('invalid', {lat: NaN, lon: 89, time: 100}); assert.equal(render.latest(id).id, 'z');
    add('zero', {lat: 0, lon: 89, time: 100}); assert.equal(render.latest(id).id, 'z');
    add('bounds', {lat: 95, lon: 89, time: 100}); assert.equal(render.latest(id).id, 'z');
    add('z', {lat: 26.2, lon: 89, time: 2}); assert.equal(render.latest(id).id, 'b');
    delete cache.b; render.changed(id, 'b', null, true, true); assert.equal(render.latest(id).id, 'a');
    assert.equal(render.count(id), 6); assert.equal(render.overlapCount('26.00000,89.00000'), 1);
    const original = render.latest(id); original.lat = 40; assert.equal(render.latest(id).lat, 26);
    c.visibleStaffCache.alice.dutyActive = false; render.syncVisible(); assert.equal(render.overlapCount('26.00000,89.00000'), 0);
    render.release(id); delete c.sessionPointCache[id]; assert.equal(render.latest(id), null);
    const html = fs.readFileSync('index.html', 'utf8');
    require('./phase134-release-integrity.cjs').verify(); // Complete selective-release integrity replaces a historical working-tree hash.
    console.log('PASS latest-point ordering, ties, invalid/zero/bounds rejection, modification/removal, counts, copy safety, scope groups and exact pre-implementation preservation.');
}
