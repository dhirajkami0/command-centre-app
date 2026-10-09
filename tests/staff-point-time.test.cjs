const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const acorn = require('acorn');
const before = '      if (!cached || getPointTime(point) >= getPointTime(cached)) {';
const after = '      if (!cached || window.StaffRendering.pointTime(point) >= window.StaffRendering.pointTime(cached)) {';
function restorePointTimeFix(source) {
    if (source.includes(after)) {
        assert.equal(source.split(after).length, 2, 'Exact scoped timestamp correction occurs once');
        source = source.replace(after, before);
    }
    return source;
}
module.exports = {restorePointTimeFix};
function assignment(html, name) {
    let found;
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        const source = match[1];
        const ast = acorn.parse(source, {ecmaVersion:'latest', sourceType:/type=["']module/.test(match[0]) ? 'module' : 'script'});
        function visit(node) {
            if (!node || typeof node !== 'object') return;
            if (node.type === 'AssignmentExpression' && node.left?.object?.name === 'window' && node.left?.property?.name === name)
                found = source.slice(node.start, node.end);
            for (const value of Object.values(node)) {
                if (Array.isArray(value)) value.forEach(visit);
                else if (value && typeof value === 'object') visit(value);
            }
        }
        visit(ast);
    }
    assert(found, name); return found;
}
async function main() {
    const html = fs.readFileSync('index.html', 'utf8'), warnings = [], updates = [];
    const c = {Date, Promise, console:{warn:(...a)=>warnings.push(a),log(){},error(){}},
        setTimeout, clearTimeout, setInterval, clearInterval, cleanName:s=>String(s).toLowerCase(),
        document:{readyState:'loading',addEventListener(){}},addEventListener(){},db:{},
        visibleStaffCache:{},patrolSessionStaff:{},patrolSessionListeners:{},sessionPointCache:{},
        updateLiveMarkerFromPatrolPoint:(...a)=>updates.push(a),
        fb:{collection:(_, ...path)=>({path}),orderBy:(field,direction)=>({field,direction}),limit:count=>({count}),
            query:(ref,...constraints)=>({...ref,constraints}),getDocs:async()=>c.response}};
    c.window = c; vm.createContext(c);
    vm.runInContext(fs.readFileSync('js/staffRendering.js', 'utf8'), c);
    vm.runInContext(assignment(html, 'loadLatestPatrolPointFast'), c);
    assert.equal(typeof c.getPointTime, 'undefined', 'Production private helper is NOT supplied as a global mock');
    const history = assignment(html, 'processPatrolSessionSnapshot');
    const start = history.indexOf('const rawPointTime ='), end = history.indexOf('const cachedPoint =', start);
    assert(start >= 0 && end > start);
    const canonical = vm.runInContext('(data => {' + history.slice(start,end) + 'return pointTime;})', c);
    const ms = 1791478486362;
    const samples = [
        {time:ms}, {time:Math.floor(ms/1000)}, {time:new Date(ms).toISOString()},
        {time:{toDate:()=>new Date(ms)}}, {timestamp:{toDate:()=>new Date(ms)}},
        {timestamp:ms}, {time:String(ms)}, {time:String(Math.floor(ms/1000))},
        {time:'not a date'}, {time:0,timestamp:ms}, {}, {time:{toDate(){throw Error('invalid');}}}
    ];
    for (const p of samples) assert.equal(c.StaffRendering.pointTime(p), canonical(p), 'Exact live-history format parity');
    assert.equal(c.StaffRendering.pointTime(samples[3]), ms, 'Firestore Timestamp supported');
    assert.equal(c.StaffRendering.pointTime(samples[1]), Math.floor(ms/1000), 'Existing history seconds interpretation unchanged');
    // The compatibility entry point is cache-only in the approved integration.
    // Every attempted query is an immediate failure, including a missing GPS fix.
    c.fb=new Proxy({}, {get(){throw Error('Unexpected Firestore read');}});
    const gpsStart=html.indexOf('window.getLiveStaffPointForSession =');
    vm.runInContext(html.slice(gpsStart,html.indexOf('function loadStaff(){',gpsStart)),c);
    c.staffLayer={};
    const id='alice_'+ms,staff={cleanName:'alice',name:'Alice',dutyActive:true,sessionId:id};
    c.visibleStaffCache.alice=staff;c.patrolSessionStaff[id]=staff;
    assert.equal(c.loadLatestPatrolPointFast(id,staff),false,'Missing fix causes no fallback query');
    assert(c.applyLiveStaffGps({...staff,lat:26.1,lon:89,gpsTime:{toDate:()=>new Date(ms+1000)}},'alice'));
    assert.equal(updates.length,1,'Accepted live GPS immediately reaches marker callback');
    assert.equal(c.loadLatestPatrolPointFast(id,staff),true,'Cached GPS remains available');
    assert.equal(updates.length,2);
    assert(!c.applyLiveStaffGps({...staff,lat:27,lon:90,gpsTime:ms},'alice'));
    assert.equal(c.StaffRendering.pointTime(c.StaffRendering.latest(id)),ms+1000,'Old fix never replaces newer coordinates');
    staff.dutyActive=false;assert.equal(c.loadLatestPatrolPointFast(id,staff),false);assert.equal(updates.length,2);
    assert.equal(warnings.length,0,'No absent-global timestamp exception');
    console.log('PASS absent-global scope regression, actual cache-only/live GPS execution, Firestore Timestamp/ISO/ms/seconds/string/fallback parity with extracted history normalizer, late-result protection. No Firestore access.');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
