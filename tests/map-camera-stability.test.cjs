const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const acorn = require('acorn');

// Exact reversal lets the older whole-file preservation check continue to
// protect everything outside this reviewed camera patch.
function restoreCameraChanges(source) {
  return source.replace('map.scrollWheelZoom.enable();', 'map.scrollWheelZoom.disable();')
    .replace('var gpsTimer = null;\nvar gpsRetryTimer = null;\nvar gpsRequestId = 0;', 'var gpsTimer = null;')
    .replace('function startGPS() {\n  const requestId = ++gpsRequestId;', 'function startGPS() {')
    .replace('    setView: false,\n    maxZoom: 19,', '    setView: true,\n    maxZoom: 19,')
    .replace('    if (requestId !== gpsRequestId) return;\n    map.stopLocate();\n    gpsTimer = null;\n    clearTimeout(gpsRetryTimer);\n    gpsRetryTimer = null;\n    showBestLocation();', '    map.stopLocate();\n    showBestLocation();')
    .replace('function stopLocation() {\n  gpsRequestId++;\n  clearTimeout(gpsRetryTimer);\n  gpsRetryTimer = null;', 'function stopLocation() {')
    .replace('  try { clearTimeout(gpsTimer); } catch(e){ console.warn(e); }\n  gpsTimer = null;', '  try { clearTimeout(gpsTimer); } catch(e){ console.warn(e); }')
    .replace('function resetButton(){\n  gpsRequestId++;\n  map.stopLocate();\n  clearTimeout(gpsTimer);\n  clearTimeout(gpsRetryTimer);\n  gpsTimer = gpsRetryTimer = null;', 'function resetButton(){')
    .replace('    const requestId = gpsRequestId;\n    clearTimeout(gpsRetryTimer);\n    gpsRetryTimer = setTimeout(() => {\n      gpsRetryTimer = null;\n      if (!locationActive || gpsTimer === null || requestId !== gpsRequestId) return;\n\n      map.locate({\n\n        setView: false,', '    setTimeout(() => {\n\n      map.locate({\n\n        setView: true,');
}
module.exports = { restoreCameraChanges };

if (require.main === module) {
  const html = fs.readFileSync('index.html', 'utf8');
  const source = html.slice(html.indexOf('var myLocationLayer ='), html.indexOf('function toggleRangeCompartments('));
  const ast = acorn.parse(source, {ecmaVersion:'latest'});
  const names = new Set(['startGPS','stopLocation','resetButton']);
  const selected = ast.body.filter(n => n.type === 'VariableDeclaration' ||
    n.type === 'FunctionDeclaration' && names.has(n.id.name) ||
    n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' &&
    n.expression.callee.property?.name === 'on' ||
    n.type === 'ExpressionStatement' && source.slice(n.start,n.end).startsWith('window.gpsRetryCount'));
  const timers = new Map(), listeners = {}, locates = [], button = {};
  let nextId = 0, centers = 0;
  const context = {console:{log(){},warn(){},error(){}}, alert(){},
    document:{getElementById:()=>button}, L:{layerGroup:()=>({addTo(){return this;},clearLayers(){}})},
    map:{locate:o=>locates.push(o),stopLocate(){},on:(name,fn)=>listeners[name]=fn},
    setTimeout(fn,ms){const id=++nextId;timers.set(id,{fn,ms});return id;},
    clearTimeout:id=>timers.delete(id), showBestLocation:()=>centers++};
  context.window=context;
  vm.createContext(context);
  vm.runInContext(selected.map(n=>source.slice(n.start,n.end)).join('\n'), context);
  context.locationActive=true;
  context.startGPS();
  assert.equal(locates[0].setView,false);
  assert.equal(centers,0);
  listeners.locationerror({message:'fixture'});
  const retry=timers.get(context.gpsRetryTimer).fn;
  retry();
  assert.equal(locates[1].setView,false);
  timers.get(context.gpsTimer).fn();
  assert.equal(centers,1);
  retry();
  assert.equal(locates.length,2,'completed request cannot restart watch');
  context.startGPS();listeners.locationerror({message:'fixture'});
  const staleRetry=timers.get(context.gpsRetryTimer).fn;
  const staleFinish=timers.get(context.gpsTimer).fn;
  context.stopLocation();context.locationActive=true;context.startGPS();
  const count=locates.length;
  staleRetry();staleFinish();
  assert.equal(locates.length,count,'old retry cannot restart a new request');
  assert.equal(centers,1,'cancelled completion cannot center');
  context.resetButton();
  assert.equal(context.gpsTimer,null);assert.equal(context.gpsRetryTimer,null);
  assert.match(html,/map\.scrollWheelZoom\.enable\(\)/);
  assert.doesNotMatch(html,/map\.(?:dragging|touchZoom|doubleClickZoom|boxZoom)\.disable\(/);
  let scripts=0;
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if(!m[2].trim()||/application\/(?:ld\+)?json/.test(m[1]))continue;
    acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/module/.test(m[1])?'module':'script'});scripts++;
  }
  assert.equal(scripts,9);
  console.log('PASS GPS acquisition/retry camera isolation, one completion, stopped/stale retry guards, wheel enabled; 9 inline scripts parse. Isolated fixtures only; no device latency or gesture result claimed.');
}
