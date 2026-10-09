const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),acorn=require('acorn');
const patches=require('./staff-track-navigation-patch.json');
function restoreTrackNavigationChanges(source){
    source=require('./staff-rendering.test.cjs').restoreStaffRenderingChanges(source);
    for(const {before,after} of [...patches].reverse()) source=/^\s/.test(after)?source.replace('\n'+after,'\n'+before):source.replace(after,before);
    return source;
}
module.exports={restoreTrackNavigationChanges};
if(require.main===module)(async()=>{
    const html=fs.readFileSync('index.html','utf8'), functions={};
    for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
        if(!m[2].trim()||/application\/(?:ld\+)?json/.test(m[1]))continue;
        const ast=acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/module/.test(m[1])?'module':'script'});
        function walk(n){if(!n||typeof n!=='object')return;
            if(n.type==='AssignmentExpression'&&['loadIndividualStaffTrack','clearSelectedStaffTrack'].includes(n.left.property?.name))functions[n.left.property.name]=m[2].slice(n.start,n.end);
            for(const v of Object.values(n))Array.isArray(v)?v.forEach(walk):walk(v);
        }walk(ast);
    }
    const layers=new Set(), fits=[];let builds=0, loads=0;
    class Track {
        constructor(points,style){this.points=points;this.style=style;builds++;this.updates=0;}
        addTo(){layers.add(this);return this;}
        setLatLngs(points){this.points=points;this.updates++;}
        getBounds(){const p=this.points;return{isValid:()=>p.length>0,
            getSouthWest:()=>({lat:Math.min(...p.map(x=>x[0])),lng:Math.min(...p.map(x=>x[1]))}),
            getNorthEast:()=>({lat:Math.max(...p.map(x=>x[0])),lng:Math.max(...p.map(x=>x[1]))})};}
    }
    const camera={center:[26,89],zoom:14};
    const map={getSize:()=>({x:320,y:480}),fitBounds:(bounds,options)=>{fits.push({bounds,options});camera.zoom=options.maxZoom;},
        setView(){throw Error('Unexpected setView');},flyTo(){throw Error('Unexpected flyTo');},panTo(){throw Error('Unexpected panTo');}};
    const cache={A:{p2:{lat:26.2,lon:89.2,time:2},p1:{lat:26,lon:89,time:1}},B:{p1:{lat:27,lon:90,time:1},p2:{lat:27.2,lon:90.2,time:2}},EMPTY:{}};
    const profiles=Object.fromEntries(['A','B','EMPTY','MISSING','SELF'].map(n=>[n,{cleanName:n,name:n,dutyActive:true,sessionId:n}]));
    const c={map,L:{polyline:(points,style)=>new Track(points,style)},cleanName:n=>String(n||'').toUpperCase(),
        visibleStaffCache:profiles,userProfile:{cleanName:'SELF'},staffTracks:{},activeSessionMap:{A:'A',B:'B'},
        sessionPointCache:cache,staffTrackState:{bulkEnabled:false,selectedStaff:null},getUserColor:()=> 'green',
        staffLayer:{removeLayer:t=>layers.delete(t),hasLayer:t=>layers.has(t)},console:{log(){},warn(){},error(...args){throw Error(args.join(' '));}}};
    c.window=c;vm.createContext(c);vm.runInContext(functions.clearSelectedStaffTrack+';'+functions.loadIndividualStaffTrack+';',c);
    const engine=c.loadIndividualStaffTrack;c.loadIndividualStaffTrack=name=>{loads++;return engine(name);};
    vm.runInContext(fs.readFileSync('js/staffTrackNavigation.js','utf8'),c);
    const nav=c.StaffTrackNavigation,before=JSON.stringify(camera);
    const a=nav.view('A');assert.ok(a.ok);assert.equal(JSON.stringify(camera),before);assert.equal(fits.length,0);
    assert.equal(JSON.stringify(a.track.points),'[[26,89],[26.2,89.2]]');assert.equal(a.track.style.weight,2.5);assert.equal(a.track.style.opacity,.80);
    assert.equal(c.trackPointCount.A,2);assert.equal(c.staffTrackState.selectedStaff,'A');
    assert.equal(nav.view('A').track,a.track);assert.equal(loads,1);assert.equal(builds,1);
    const z=nav.zoom('A');assert.ok(z.ok);assert.equal(fits.length,1);assert.equal(fits[0].options.maxZoom,17);assert.equal(layers.has(a.track),true);
    assert.equal(JSON.stringify(fits[0].options.padding),'[40,60]');
    const validBounds=a.track.getBounds.bind(a.track);
    a.track.getBounds=()=>({isValid:()=>true,getSouthWest:()=>({lat:91,lng:89}),getNorthEast:()=>({lat:92,lng:90})});
    assert.equal(nav.zoom('A').ok,false);assert.equal(fits.length,1,'invalid coordinates cannot move camera');
    a.track.getBounds=validBounds;
    const b=nav.view('B');assert.ok(b.ok);assert.equal(c.staffTrackState.selectedStaff,'B');assert.ok(!layers.has(a.track));assert.ok(layers.has(b.track));
    assert.equal(nav.zoom('A').ok,false);assert.equal(fits.length,1);
    assert.equal(nav.view('EMPTY').ok,false);assert.equal(nav.zoom('EMPTY').ok,false);assert.equal(nav.view('MISSING').ok,false);
    assert.equal(nav.view('UNAUTHORIZED').ok,false);assert.equal(fits.length,1);
    nav.view('B');const oldSession=profiles.B.sessionId;profiles.B.sessionId='NEW';assert.equal(nav.zoom('B').ok,false);profiles.B.sessionId=oldSession;
    const oldBounds=c.staffTracks.B.getBounds.bind(c.staffTracks.B);
    c.staffTracks.B.getBounds=()=>{const bounds=oldBounds();nav.view('A');return bounds;};
    assert.equal(nav.zoom('B').ok,false,'reentrant selection cannot zoom stale bounds');assert.equal(fits.length,1);
    // A pending result is never consumed and never receives a zoom callback.
    let finish;c.loadIndividualStaffTrack=()=>new Promise(resolve=>finish=resolve);
    const pending=nav.view('B');assert.equal(pending.ok,false);
    c.loadIndividualStaffTrack=name=>{loads++;return engine(name);};nav.view('A');
    finish(b.track);await Promise.resolve();assert.equal(c.staffTrackState.selectedStaff,'A');assert.equal(fits.length,1);
    assert.ok(!layers.has(b.track),'late result cannot re-add stale geometry');
    // Existing own/bulk tracks are reused without rebuilding or switching owners.
    c.staffTracks.SELF=new Track([[26,89]],{}).addTo();const loadCount=loads;
    assert.ok(nav.view('SELF').ok);assert.equal(loads,loadCount);
    c.staffTrackState.bulkEnabled=true;c.bulkStaffTracks={B:new Track([[27,90],[27.2,90.2]],{}).addTo()};
    assert.ok(nav.view('B').ok);assert.equal(loads,loadCount);assert.equal(c.staffTrackState.bulkEnabled,true);
    c.staffTrackState.bulkEnabled=false;
    // Delegate explicit button actions; a closed popup rejects a late click.
    const handlers={},events={},status={};let open=true;
    const button={dataset:{staffTrackAction:'view'},closest(){return this;}};
    const root={contains:n=>n===button,querySelector:()=>status,addEventListener:(e,fn)=>events[e]=fn};
    const marker={on:(e,fn)=>handlers[e]=fn,getPopup:()=>({getElement:()=>root}),isPopupOpen:()=>open};
    nav.bindPopup(marker,'A');handlers.popupopen();handlers.popupopen();
    const e={target:button,preventDefault(){},stopPropagation(){}};events.click(e);assert.match(status.textContent,/displayed/);
    const n=fits.length;button.dataset.staffTrackAction='zoom';events.click(e);assert.equal(fits.length,n+1);
    let closed=0;const selectedTrack=c.staffTracks.A;const selectedStaff=c.staffTrackState.selectedStaff;
    c.map.closePopup=popup=>{assert.equal(popup.getElement(),root);closed++;open=false;};
    button.dataset.staffTrackAction='close';events.click(e);assert.equal(closed,1);assert.equal(fits.length,n+1);
    assert.equal(c.staffTracks.A,selectedTrack);assert.equal(c.staffTrackState.selectedStaff,selectedStaff);
    events.click(e);assert.equal(closed,1);assert.equal(fits.length,n+1);
    assert.match(html,/data-staff-track-action="zoom">Zoom to Track<\/button>\s*<button type="button" data-staff-track-action="close">Close/);
    assert.match(html,/data-staff-track-action="view">View Track/);assert.match(html,/data-staff-track-action="zoom">Zoom to Track/);
    assert.match(fs.readFileSync('css/staffTrackNavigation.css','utf8'),/min-height: 44px/);
    assert.doesNotMatch(functions.loadIndividualStaffTrack,/map\.(?:fitBounds|setView|flyTo|panTo)\(/);
    require('./phase134-release-integrity.cjs').verify(); // Complete selective-release integrity replaces a historical working-tree hash.
    console.log('PASS actual cache engine: camera-neutral View Track, explicit validated zoom, reuse/styling/counts, empty/missing/unauthorized tracks, rapid selection, changed session, stale pending result, own/bulk ownership, delegated controls, exact Patch-1/2 preservation. Isolated fixtures only.');
})().catch(e=>{console.error(e);process.exitCode=1;});
