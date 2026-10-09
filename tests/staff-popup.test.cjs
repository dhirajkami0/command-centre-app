const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), acorn = require('acorn');
const patches = require('./staff-popup-patch.json');
function restoreStaffPopupChanges(source) {
    for (const {before,after} of [...patches].reverse()) {
        // Position calls have different indentation: match the complete line,
        // rather than a suffix inside a more deeply indented call.
        source = /^\s/.test(after) ? source.replace('\n'+after,'\n'+before) : source.replace(after,before);
    }
    return source;
}
module.exports = {restoreStaffPopupChanges};
if (require.main === module) {
    const html=fs.readFileSync('index.html','utf8'), assignments={};
    for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
        if(!m[2].trim()||/application\/(?:ld\+)?json/.test(m[1]))continue;
        const ast=acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/module/.test(m[1])?'module':'script'});
        function walk(n){if(!n||typeof n!=='object')return;
            if(n.type==='AssignmentExpression'&&['ensureLiveStaffMarker','updateLiveMarkerFromPatrolPoint'].includes(n.left.property?.name)) assignments[n.left.property.name]=m[2].slice(n.start,n.end);
            for(const v of Object.values(n))Array.isArray(v)?v.forEach(walk):walk(v);
        }walk(ast);
    }
    const frames=new Map(),tasks=new Map(),intervals=new Map();let next=0,camera=0,gis=0,tracks=0,latestReads=0;
    const view={left:100,top:50,right:420,bottom:530},size={x:320,y:480};
    const map={getSize:()=>size,getContainer:()=>({getBoundingClientRect:()=>view})};
    let anchor={x:104,y:55};
    class Popup {
        constructor(options){this._contentNode={style:{setProperty:(key,value)=>{this.widthProperty=value;}}};this.options={autoPan:true,...options};this._tipContainer={style:{}};this._container={style:{left:'0px',bottom:'0px'},getBoundingClientRect:()=>{
            const x=anchor.x+parseFloat(this._container.style.left),y=anchor.y-parseFloat(this._container.style.bottom)-this.height;
            return{left:x,right:x+this.width,top:y,bottom:y+this.height};
        }};}
        setContent(html){this.content=html;return this;}
        _updateLayout(){this.width=Math.min(240,this.options.maxWidth+24);this.height=Math.min(700,this.options.maxHeight+24);}
        _updatePosition(){this._container.style.left='-120px';this._container.style.bottom='0px';}
        getEvents(){return{};}
        getElement(){return this.element;}
        update(){this._updateLayout();this._updatePosition();}
        static extend(methods){class Staff extends Popup{}Object.assign(Staff.prototype,methods);return Staff;}
    }
    class Marker {
        constructor(ll,options){this.ll={lat:ll[0],lng:ll[1]};this.options=options;this.events={};this.moves=0;}
        on(name,fn){(this.events[name]??=[]).push(fn);return this;}
        fire(name){for(const fn of this.events[name]||[])fn.call(this);}
        bindPopup(popup){this.popup=popup;this.on('click',()=>this.open?this.closePopup():this.openPopup());return this;}
        addTo(){return this;}
        getLatLng(){return this.ll;}
        setLatLng(ll){this.moves++;this.ll={lat:ll[0],lng:ll[1]};if(this.open&&this.popup.options.autoPan)camera++;}
        getPopup(){return this.popup;}
        isPopupOpen(){return !!this.open;}
        openPopup(){this.open=true;this.popup._map=map;const fields={};
            for(const m of this.popup.content.matchAll(/id="([^"]+)"/g))fields[m[1]]={textContent:'',innerHTML:''};
            this.fields=fields;this.button={value:'',getAttribute:()=>"navigateHEC('26','89')",setAttribute:(k,v)=>this.button.value=v};
            this.popup.element={dataset:{},querySelector:s=>fields[s.slice(1)]||null,querySelectorAll:()=>[this.button],addEventListener(){},contains:()=>true};
            this.popup.update();if(this.popup.options.autoPan)camera++;this.fire('popupopen');}
        closePopup(){this.open=false;this.fire('popupclose');}
    }
    const staff={cleanName:'alice',name:'Alice',phone:'123',dutyActive:true,sessionId:'alice_1000',beat:'Beat',range:'Range'};
    let point={id:'p1',sessionId:staff.sessionId,lat:26,lon:89,time:Date.now(),speed:2,distanceCoveredKm:3,patrolPointCount:1};
    const context={L:{Popup,divIcon:options=>({options}),marker:(ll,o)=>new Marker(ll,o)},
        console:{warn(){},error(...args){throw Error(args.join(' '));}},CSS:{escape:s=>s},
        staffLayer:{removeLayer(){}},cleanName:s=>String(s),getUserColor:()=> 'green',getPointTime:p=>p.time,
        staffMarkers:{},visibleStaffCache:{alice:staff},userProfile:{cleanName:'viewer'},staffTrackState:{bulkEnabled:false},
        sessionPointCache:{[staff.sessionId]:{p1:point}},getLatestPatrolPointForSession:()=>{latestReads++;return point;},
        resolveCurrentGIS:()=>{gis++;return{compartment:'C',beat:'B',range:'R'};},loadIndividualStaffTrack:()=>tracks++,
        setInterval:fn=>{const id=++next;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id),
        requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
        setTimeout:fn=>{const id=++next;tasks.set(id,fn);return id;},clearTimeout:id=>tasks.delete(id)};
    context.window=context;vm.createContext(context);
    vm.runInContext(fs.readFileSync('js/staffPopup.js','utf8'),context);
    vm.runInContext(fs.readFileSync('js/staffTrackNavigation.js','utf8'),context);
    vm.runInContext(assignments.ensureLiveStaffMarker+';'+assignments.updateLiveMarkerFromPatrolPoint+';',context);
    const marker=context.ensureLiveStaffMarker(staff,point,staff.sessionId,26,89).marker;
    assert.equal(marker.options.autoPanOnFocus,false,'live staff focus must not move camera');
    context.updateLiveMarkerFromPatrolPoint(staff,point,staff.sessionId);
    function flush(){for(let i=0;i<2;i++){const f=[...frames.values()];frames.clear();f.forEach(fn=>fn());}const t=[...tasks.values()];tasks.clear();t.forEach(fn=>fn());}
    gis=latestReads=0;marker.fire('click');
    assert.ok(marker.isPopupOpen());assert.equal(camera,0);assert.equal(gis,0);assert.equal(latestReads,0);
    assert.equal(tracks,0,'marker click never loads track geometry');
    assert.match(marker.popup.content,/LIVE PATROL STAFF/);assert.match(marker.popup.content,/navigateHEC/);assert.match(marker.popup.content,/tel:123/);
    flush();assert.equal(gis,1);assert.match(marker.fields.staffGps_alice.textContent,/26.000000/);assert.equal(marker.moves,0);
    const timer=marker.__ggPopupRefreshTimer;
    context.updateLiveMarkerFromPatrolPoint(staff,point,staff.sessionId);flush();
    assert.equal(marker.moves,0);assert.equal(marker.__ggPopupRefreshTimer,timer);assert.ok(intervals.has(timer));
    point={...point,id:'p2',lat:26.1,speed:4,distanceCoveredKm:5};
    context.updateLiveMarkerFromPatrolPoint(staff,point,staff.sessionId);flush();
    assert.equal(marker.moves,1);assert.equal(camera,0);assert.match(marker.fields.staffGps_alice.textContent,/26.100000/);
    assert.equal(marker.fields.staffDistance_alice.textContent,'5.00 km');assert.match(marker.button.value,/26.1/);
    marker.fire('click');marker.fire('click');marker.fire('click');flush();assert.equal(marker.isPopupOpen(),false);assert.equal(intervals.size,0);assert.equal(frames.size,0);
    // Leaflet translates a mobile tap into the same marker click event.
    marker.fire('click');assert.ok(marker.isPopupOpen());flush();assert.equal(camera,0);
    const bob={...staff,cleanName:'bob',name:'Bob',sessionId:'bob_1000'};
    const bobPoint={...point,sessionId:bob.sessionId};context.visibleStaffCache.bob=bob;
    context.getLatestPatrolPointForSession=id=>{latestReads++;return id===bob.sessionId?bobPoint:point;};
    context.sessionPointCache[bob.sessionId]={p2:bobPoint};
    const other=context.ensureLiveStaffMarker(bob,bobPoint,bob.sessionId,bobPoint.lat,bobPoint.lon).marker;
    context.updateLiveMarkerFromPatrolPoint(bob,bobPoint,bob.sessionId);
    other.fire('click');marker.closePopup();flush();
    assert.ok(other.isPopupOpen());assert.equal(marker.isPopupOpen(),false);
    assert.equal(camera,0);other.closePopup();marker.fire('click');flush();
    for(const width of [240,320,800])for(const x of [view.left+2,view.left+width-2])for(const y of [view.top+2,view.bottom-2]){
        size.x=width;view.right=view.left+width;anchor={x,y};marker.popup.update();assert.equal(marker.popup.options.minWidth,Math.max(40,Math.min(280,width-56)));assert.equal(marker.popup.widthProperty,marker.popup.options.minWidth+'px');const box=marker.popup._container.getBoundingClientRect();
        assert.ok(box.left>=view.left+8&&box.right<=view.right-8);assert.ok(box.top>=view.top+8&&box.bottom<=view.bottom-8);
    }
    assert.equal(camera,0);assert.match(fs.readFileSync('css/staffPopup.css','utf8'),/overflow-y: auto/);
    const restored=restoreStaffPopupChanges(require('./staff-track-navigation.test.cjs').restoreTrackNavigationChanges(html));
    require('./phase134-release-integrity.cjs').verify(); // Complete selective-release integrity replaces a historical working-tree hash.
    console.log('PASS actual staff handlers: cached click/tap-equivalent opening, deferred GIS, camera-neutral popup, same/changed GPS, live fields/actions, rapid taps, timer survival, edge-placement math, exact source preservation. DOM fixtures only; no device latency claim.');
}
