// Standalone browser fixture: real Leaflet + existing monthly/compass DOM; no Firebase or GPS.
const fs=require('node:fs'),path=require('node:path'),acorn=require('acorn');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),functions=new Map();
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(!match[2].trim()||/application\/(?:ld\+)?json/.test(match[1]))continue;
    const tree=acorn.parse(match[2],{ecmaVersion:'latest',sourceType:/type\s*=\s*['"]module['"]/.test(match[1])?'module':'script'});
    for(const node of tree.body)if(node.type==='FunctionDeclaration')functions.set(node.id.name,match[2].slice(node.start,node.end));
}
const compass=html.slice(html.indexOf('<div id="tacticalCompass">'),html.indexOf('<!-- 📊 REPORT PANEL -->'));
const existingCss=html.slice(html.indexOf('#tacticalCompass{'),html.indexOf('    #dutyPerformanceModal{'));
const output=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Right control rail — isolated fixture</title>
<link rel="stylesheet" href="../css/leaflet.css"><style>html,body{margin:0;height:100%;background:#101820}#map{position:relative;width:100%;height:100%;background:#101820}${existingCss}</style>
<link rel="stylesheet" href="../css/mapControlRail.css"></head><body><div id="map"></div>${compass}
<button id="gg-offence-main-button" onclick="this.dataset.invocations=String(Number(this.dataset.invocations||0)+1)"><span>🚨</span><span>OFFENCE</span></button>
<script src="../js/leaflet.js"></script><script>
var map=L.map('map',{zoomControl:false,zoomAnimation:false,fadeAnimation:false}).setView([26.55,89.53],12);L.control.zoom({position:'topright'}).addTo(map);
var overlays={};for(var i=0;i<42;i++)overlays['Fixture overlay '+String(i+1).padStart(2,'0')]=L.layerGroup();
window.layerControl=L.control.layers({'Base map':L.layerGroup()},overlays,{collapsed:true}).addTo(map);
window.userProfile={role:'STAFF'};
${functions.get('addMonthlyStatusCard')}
${functions.get('toggleMonthlyStatusCard')}
addMonthlyStatusCard();
</script><script src="../js/mapControlRail.js"></script><script>
// Run from Chrome Console: await runRailLayoutChecks(). Resize with Device Toolbar and rerun.
window.runRailLayoutChecks=async function(){
 const results=[],frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const check=(name,ok)=>{results.push({check:name,result:ok?'PASS':'FAIL'});};
 const rect=node=>node.getBoundingClientRect(),rail=document.querySelector('.btr-map-control-rail');
 const monthly=document.getElementById('monthlyStatusCard'),layers=layerControl.getContainer();
 const nodes=[document.querySelector('.leaflet-control-zoom'),document.getElementById('tacticalCompass'),layers,monthly,document.getElementById('gg-offence-main-button')];
 if(!monthly.classList.contains('collapsed'))toggleMonthlyStatusCard();layerControl.collapse();await frame();
 check('Collapsed: compass/control/action nodes visible',nodes.every(node=>rect(node).width>0&&rect(node).height>0));
 check('No control rectangles overlap',nodes.every((node,i)=>nodes.slice(i+1).every(other=>{const a=rect(node),b=rect(other);return a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;})));
 const inView=node=>{const a=rect(node);return a.left>=0&&a.top>=0&&a.right<=innerWidth+.5&&a.bottom<=innerHeight+.5;};
 check('Collapsed controls inside map viewport',nodes.every(inView));
 layerControl.expand();await frame();
 const list=document.querySelector('.leaflet-control-layers-list');
 check('Layers expanded; Monthly collapsed',layers.classList.contains('leaflet-control-layers-expanded')&&monthly.classList.contains('collapsed'));
 check('Layer flyout left of rail and inside viewport',rect(list).right<=rect(rail).left+.5&&inView(list));
 list.scrollTop=list.scrollHeight;await frame();
 const labels=list.querySelectorAll('label'),last=rect(labels[labels.length-1]);
 check('Final layer checkbox reachable by scrolling',last.top>=rect(list).top&&last.bottom<=rect(list).bottom);
 toggleMonthlyStatusCard();await frame();
 const body=document.getElementById('monthlyStatusBody');
 check('Layers -> Monthly: only Monthly expanded',!layers.classList.contains('leaflet-control-layers-expanded')&&!monthly.classList.contains('collapsed'));
 check('Monthly flyout left of rail and inside viewport',rect(body).right<=rect(rail).left+.5&&inView(body));
 layerControl.expand();await frame();check('Monthly -> Layers: only Layers expanded',monthly.classList.contains('collapsed')&&layers.classList.contains('leaflet-control-layers-expanded'));
 const zoomBefore=map.getZoom();document.querySelector('.leaflet-control-zoom-in').click();await frame();await frame();check('Native Zoom handler retained',map.getZoom()===zoomBefore+1);
 const button=document.getElementById('gg-offence-main-button'),before=Number(button.dataset.invocations||0);button.click();check('Same OFFENCE handler invoked exactly once',Number(button.dataset.invocations)===before+1);
 layerControl.collapse();console.table(results);document.title=innerWidth+'x'+innerHeight+' — '+(results.every(result=>result.result==='PASS')?'PASS':'FAIL');return {viewport:[innerWidth,innerHeight],results};
};
</script></body></html>`;
const target=path.join(__dirname,'map-control-rail.fixture.html');fs.writeFileSync(target,output);console.log(target);
