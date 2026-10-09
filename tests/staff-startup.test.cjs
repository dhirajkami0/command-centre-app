const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const acorn = require('acorn');
const html = fs.readFileSync('index.html', 'utf8');
function assignment(name) {
    let found;
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        const source = match[1];
        if (!source.trim()) continue;
        const ast = acorn.parse(source, {ecmaVersion: 'latest', sourceType: /type=["']module/.test(match[0]) ? 'module' : 'script'});
        function visit(node) {
            if (!node || typeof node !== 'object') return;
            if (node.type === 'AssignmentExpression' && node.left?.object?.name === 'window' &&
                node.left?.property?.name === name) found = source.slice(node.start, node.end);
            for (const value of Object.values(node)) {
                if (Array.isArray(value)) value.forEach(visit);
                else if (value && typeof value === 'object') visit(value);
            }
        }
        visit(ast);
    }
    assert(found, name + ' actual source assignment'); return found;
}
async function main() {
    const pending = [], updates = [], subscriptions = [];
    const c = {console: {log() {}, warn() {}, error() {}}, Date, Promise, setTimeout, clearTimeout, setInterval, clearInterval,
        cleanName: value => String(value).toLowerCase(),
        sessionPointCache: {}, visibleStaffCache: {}, patrolSessionStaff: {}, patrolSessionListeners: {}, staffMarkers: {}, db: {},
        document: {readyState: 'loading', addEventListener() {}}, addEventListener() {},
        updateLiveMarkerFromPatrolPoint: (...args) => updates.push(args),
        processPatrolSessionSnapshot() {},
        fb: {collection: (_, ...path) => ({path}), orderBy: (field, direction) => ({field, direction}),
            limit: count => ({count}), query: (ref, ...constraints) => ({...ref, constraints}),
            getDocs: ref => new Promise((resolve, reject) => pending.push({ref, resolve, reject})),
            onSnapshot: (ref, options, success, failure) => { subscriptions.push({ref, options, success, failure}); return () => {}; }}
    };
    c.window = c; vm.createContext(c);
    vm.runInContext(fs.readFileSync('js/staffRendering.js', 'utf8'), c);
    vm.runInContext(assignment('loadLatestPatrolPointFast'), c);
    vm.runInContext(assignment('ensurePatrolSessionListener'), c);
    const render = c.StaffRendering;
    const doc = (id, properties) => ({id, data: () => properties});
    const tick = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
    function staff(id) {
        const s = {name: id, cleanName: id, dutyActive: true, sessionId: id};
        c.visibleStaffCache[id] = s; c.patrolSessionStaff[id] = s; return s;
    }
    for (let i = 0; i < 7; i++) {
        const id = 'session' + i, s = staff(id);
        c.ensurePatrolSessionListener(id, s); c.ensurePatrolSessionListener(id, s);
    }
    await tick();
    assert.equal(subscriptions.length, 7, 'One full-history live listener per session');
    assert.equal(pending.length, 4, 'At most four in-flight fast requests');
    assert(subscriptions.every(s => s.ref.constraints[0].direction === undefined && s.ref.constraints.length === 1),
        'Authoritative full history query remains unbounded chronological');
    assert(subscriptions.every(s => s.options.includeMetadataChanges === true), 'Cache-to-server completion observable without duplicate subscriptions');
    assert(pending.every(p => p.ref.constraints[0].direction === 'desc' && p.ref.constraints[1].count === 8));
    assert(render.historyPending('session0'));
    pending[0].resolve({docs: [doc('invalid-newest', {lat: 96, lon: 89, time: 30}),
        doc('wrong-session', {lat: 26, lon: 89, time: 29, sessionId: 'other'}),
        doc('zero', {lat: 0, lon: 89, time: 28}),
        doc('good', {lat: 26, lon: 89, time: 27, patrolPointCount: 120, distanceCoveredKm: 2.1})]});
    await tick();
    assert.equal(render.latest('session0').id, 'good', 'Skip invalid newest candidates');
    assert.equal(render.latest('session0').patrolPointCount, 120, 'Authoritative point metric preserved');
    assert.equal(pending.length, 5, 'Finished query frees one queue slot');
    c.visibleStaffCache.session1.dutyActive = false;
    pending[1].resolve({docs: [doc('late', {lat: 26, lon: 89, time: 40})]}); await tick();
    assert.equal(render.latest('session1'), null, 'Duty-ended late result ignored');
    c.visibleStaffCache.session2.sessionId = 'new-session';
    pending[2].resolve({docs: [doc('late', {lat: 26, lon: 89, time: 40})]}); await tick();
    assert.equal(render.latest('session2'), null, 'Changed-session late result ignored');
    c.sessionPointCache.session3.newest = {id: 'newest', sessionId: 'session3', lat: 26.2, lon: 89, time: 90};
    render.changed('session3', 'newest', c.sessionPointCache.session3.newest, false, false);
    pending[3].resolve({docs: [doc('newest', {lat: 26, lon: 89, time: 20})]}); await tick();
    assert.equal(render.latest('session3').time, 90, 'Delayed fast response cannot overwrite newer full snapshot');
    pending[4].resolve({docs: [doc('bad', {lat: null, lon: 89, time: 40})]}); await tick();
    assert.equal(render.latest('session4'), null, 'All invalid recent candidates retain full-history fallback');
    render.release('session5'); delete c.patrolSessionListeners.session5;
    pending[5].resolve({docs: [doc('late', {lat: 26, lon: 89, time: 50})]}); await tick();
    assert.equal(render.latest('session5'), null, 'Released listener result ignored');
    pending[6].reject(new Error('read unavailable')); await tick();
    assert.equal(render.latest('session6'), null, 'Failed fast read does not cancel history');
    assert(c.patrolSessionListeners.session6);
    render.completeHistory('session0', {metadata: {fromCache: true}});
    assert(render.historyPending('session0'), 'Incomplete disk cache does not authorize complete-history metrics');
    render.completeHistory('session0', {metadata: {fromCache: false}}); assert(!render.historyPending('session0'));
    const gone = {id: 'deleted-fast', lat: 26, lon: 89, time: 100, sessionId: 'session0'};
    c.sessionPointCache.session0[gone.id] = gone;
    render.changed('session0', gone.id, gone, false, false); render.trackFastSeed('session0', gone.id);
    render.reconcileFastSeeds('session0', {metadata: {fromCache: true}, docs: []});
    assert.equal(render.latest('session0').id, gone.id, 'Incomplete cache cannot invalidate server fast fix');
    render.reconcileFastSeeds('session0', {metadata: {fromCache: false}, docs: [{id: 'good'}]});
    assert.equal(render.latest('session0').id, 'good', 'Deleted fast fix reconciled against authoritative full snapshot');
    assert(!c.StaffStartupDiagnostics, 'Diagnostics opt-in only');
    const independent = staff('history-failed');
    c.ensurePatrolSessionListener('history-failed', independent); await tick();
    const failedHistory = subscriptions.at(-1), fastRead = pending.at(-1);
    failedHistory.failure({code: 'resource-exhausted'});
    assert(!c.patrolSessionListeners['history-failed']);
    const beforeFast = updates.length;
    fastRead.resolve({docs: [doc('valid-fast', {lat: 26, lon: 89, time: Date.now()})]}); await tick();
    assert.equal(render.latest('history-failed').id, 'valid-fast');
    assert.equal(updates.length, beforeFast + 1, 'Pending fast result renders despite history listener failure');
    assert(render.historyPending('history-failed'), 'Fast result never claims history completeness');
    assert.equal(pending.length, 8, 'No extra retry/query after history failure');
    assert(html.includes('if (window.StaffRendering?.historyPending(sessionId)) return null;'),
        'View Track must not mistake a fast-read cache for complete geometry');
    assert.equal(html.match(/        limit,/g).length, 2, 'SDK import and helper export both include limit');
    const patch = require('./staff-startup-patch.json'); let restored = require('./staff-point-time.test.cjs').restorePointTimeFix(require('./excluded-feature-restorations.cjs').restoreElephantLayerChanges(require('./tiger-teams.test.cjs').restoreTigerTeamChanges(html)));
    for (const {before, after} of [...patch].reverse()) {
        assert.equal(restored.split(after).length, 2); restored = restored.replace(after, before);
    }
    require('./phase134-release-integrity.cjs').verify(); // Complete selective-release integrity replaces a historical working-tree hash.
    console.log('PASS actual bounded-query/singleton paths: invalid candidates, four-request bound, duty/session/release staleness, newer-cache protection, history fallback, source preservation. No Firestore access.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
