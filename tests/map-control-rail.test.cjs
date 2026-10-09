// UI coordination only; no browser, Firebase, GPS, or service connections.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),acorn=require('acorn');
const source=fs.readFileSync('js/mapControlRail.js','utf8'),html=fs.readFileSync('index.html','utf8');
const baseline=cp.execFileSync('git',['show','025110f5f38df37ba73fbfeb1848d7102d86b64d:index.html'],{encoding:'utf8',maxBuffer:8*1024*1024});
const normalize=s=>s.replace(/\r\n/g,'\n');
const {restoreHeatmapChanges}=require('./excluded-feature-restorations.cjs');
const {restoreCameraChanges}=require('./map-camera-stability.test.cjs');
const {restoreStaffPopupChanges}=require('./staff-popup.test.cjs');
const {restoreTrackNavigationChanges}=require('./staff-track-navigation.test.cjs');
require('./phase134-release-integrity.cjs').verify(); // Pin exact protected source to reviewed integration baseline.
for(const path of ['js/mapControlRail.js','css/mapControlRail.css']) assert.equal(normalize(fs.readFileSync(path,'utf8')),normalize(cp.execFileSync('git',['show','ad367d1fd4d7e821c695fa4e0bcd1178ae2bfc0c:'+path],{encoding:'utf8'})));
assert.doesNotMatch(source,/\bfb\b|Firestore|indexedDB|fetch\(|setInterval|setTimeout|L\.control|addEventListener\(['"]click/);
acorn.parse(source,{ecmaVersion:'latest'});
let scripts=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){if(!m[2].trim()||/application\/(?:ld\+)?json/.test(m[1]))continue;acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*['"]module['"]/.test(m[1])?'module':'script'});scripts++;}
assert.equal(scripts,9);console.log('PASS protected index/functions unchanged; UI module only; 9 inline scripts parse');
class Node {
    constructor(id='',classes=''){this.id=id;this.className=classes;this.children=[];this.parentNode=null;this.nodeType=1;this.attrs={};this.listeners=[];}
    get classList(){return {contains:name=>this.className.split(' ').includes(name),add:name=>{if(!this.classList.contains(name))this.className+=' '+name;},remove:name=>{this.className=this.className.split(' ').filter(v=>v!==name).join(' ');}};}
    appendChild(node){if(node.parentNode)node.parentNode.children=node.parentNode.children.filter(v=>v!==node);node.parentNode=this;this.children.push(node);return node;}
    append(...nodes){nodes.forEach(node=>this.appendChild(node));}
    matches(selector){return selector.split(',').some(s=>s.startsWith('#')?this.id===s.slice(1):this.classList.contains(s.slice(1)));}
    querySelector(selector){for(const child of this.children){if(selector==='span'&&child.tag==='span')return child;if(child.matches(selector))return child;const found=child.querySelector(selector);if(found)return found;}return null;}
    setAttribute(name,value){this.attrs[name]=value;}
}
const body=new Node(),map=new Node('map'),corners=new Node('','leaflet-control-container');body.appendChild(map);map.appendChild(corners);
const zoom=new Node('','leaflet-control leaflet-control-zoom'),layers=new Node('','leaflet-control leaflet-control-layers'),monthly=new Node('monthlyStatusCard','leaflet-control'),compass=new Node('tacticalCompass'),offence=new Node('gg-offence-main-button'),icon=new Node();icon.tag='span';offence.appendChild(icon);
corners.append(zoom,layers,monthly);body.append(compass,offence);
let offenceCalls=0,zoomCalls=0,collapseCalls=0;offence.listeners.push(()=>offenceCalls++);zoom.listeners.push(()=>zoomCalls++);
const observers=[],d={body,readyState:'complete',createElement:()=>new Node(),getElementById:id=>body.querySelector('#'+id),querySelector:selector=>body.querySelector(selector)};
const w={L:{DomEvent:{disableClickPropagation(){},disableScrollPropagation(){}}},toggleMonthlyStatusCard(){monthly.classList.contains('collapsed')?monthly.classList.remove('collapsed'):monthly.classList.add('collapsed');},layerControl:{collapse(){collapseCalls++;layers.classList.remove('leaflet-control-layers-expanded');}}};
class Observer {constructor(callback){this.callback=callback;observers.push(this);}observe(target,options){this.target=target;this.options=options;}}
vm.runInNewContext(source,{window:w,document:d,MutationObserver:Observer});
const rail=map.querySelector('.btr-map-control-rail'),action=map.querySelector('.btr-map-operational-action');
assert.deepEqual(rail.children,[zoom,compass,layers,monthly]);assert.equal(action.children[0],offence);assert.equal(icon.textContent,'⚖');assert.equal(offence.attrs['aria-label'],'OFFENCE');assert.ok(monthly.classList.contains('collapsed'));
zoom.listeners[0]();offence.listeners[0]();assert.equal(zoomCalls,1);assert.equal(offenceCalls,1);console.log('PASS same control nodes, existing click listeners and initial collapsed monthly state');
const panelObserver=observers.find(o=>o.target===rail);
layers.classList.add('leaflet-control-layers-expanded');monthly.classList.remove('collapsed');panelObserver.callback([{target:layers}]);assert.ok(monthly.classList.contains('collapsed'));
monthly.classList.remove('collapsed');panelObserver.callback([{target:monthly}]);assert.ok(!layers.classList.contains('leaflet-control-layers-expanded'));assert.equal(collapseCalls,1);
layers.classList.add('leaflet-control-layers-expanded');panelObserver.callback([{target:layers}]);assert.ok(monthly.classList.contains('collapsed'));console.log('PASS Layers -> Monthly -> Layers use existing collapse/toggle methods');
const added=new Node('monthlyStatusCard','leaflet-control');monthly.id='removed-old-monthly';corners.appendChild(added);
// Late/native control adoption keeps the existing instance; no control factory or handlers are introduced.
observers.find(o=>o.target===corners).callback([{addedNodes:[added]}]);assert.equal(added.parentNode,rail);console.log('PASS controls introduced after startup join the rail');
console.log('All UI coordination/preservation checks passed. Pixel/viewport checks require the browser fixture.');
