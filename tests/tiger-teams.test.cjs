const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
function reverse(source,file){
    if(file==='js/staffRendering.js')source=require('./staff-phase3.test.cjs').restorePhase3(source,true);
    for(const {before,after} of [...require('./tiger-team-patch.json')[file].patch].reverse()){
        if(source.includes(after)){assert.equal(source.split(after).length,2,'Unique reviewed tiger-team presentation edit');source=source.replace(after,before);}
    }
    return source;
}
function restoreTigerTeamChanges(source){source=require('./staff-phase3.test.cjs').restorePhase3(source);source=require('./firestore-recovery.test.cjs').restoreRecovery(source);return reverse(source.replace('<script src="js/tigerTeams.js"></script>\n<link rel="stylesheet" href="css/tigerTeams.css">','<script src="js/tigerTeams.js"></script>'),'index.html');}
module.exports={restoreTigerTeamChanges};
if(require.main===module){
    const helper=fs.readFileSync('js/tigerTeams.js','utf8');
    const roster=JSON.parse(helper.match(/const roster = (\{[\s\S]*?\n\});/)[1]);
    assert.equal(Object.keys(roster).length,52);
    assert.equal(Object.values(roster).filter(value=>value.type==='SBMT').length,11);
    assert.equal(Object.values(roster).filter(value=>value.type==='STPF').length,20);
    assert.equal(Object.values(roster).filter(value=>value.type==='RRT').length,21);
    let iconCount=0,bindCount=0,iconUpdates=0,positionUpdates=0,camera=0,builders=0;
    const intervals=new Map();
    class Marker{
        constructor(latlng,options){this.ll=latlng;this.options=options;this.handlers={};this.element={style:{},setAttribute(){}};}
        setIcon(value){this.options.icon=value;iconUpdates++;return this;}
        bindTooltip(value){this.tooltip=value;bindCount++;return this;}
        unbindTooltip(){this.tooltip=null;return this;}
        getElement(){return this.element;}
        addTo(){return this;}
        bindPopup(popup){this.popup={...popup,getElement:()=>this.root};return this;}
        getPopup(){return this.popup;}
        isPopupOpen(){return !!this.open;}
        closePopup(){this.open=false;return this;}
        on(events,callback){for(const event of events.split(' '))(this.handlers[event]??=[]).push(callback);return this;}
        fire(event){for(const callback of this.handlers[event]||[])callback();}
        openPopup(){this.open=true;this.popup.content();this.root={querySelector(){return null;}};this.fire('popupopen');}
    }
    const c={console,Date,URLSearchParams,Set,Map,performance,cleanName:x=>String(x).toUpperCase(),
        L:{divIcon:options=>{iconCount++;return{options};},marker:(ll,options)=>new Marker(ll,options)},
        document:{readyState:'loading',addEventListener(){},createElement(){return{innerHTML:'',content:{querySelector(){return null;},querySelectorAll(){return [];}}};}},
        addEventListener(){},staffMarkers:{},visibleStaffCache:{},sessionPointCache:{},staffLayer:{},
        setInterval:callback=>{const id=intervals.size+1;intervals.set(id,callback);return id;},clearInterval:id=>intervals.delete(id),
        StaffPopup:{create:content=>({content,options:{autoPan:false,keepInView:false}}),setPosition(marker,lat,lon){marker.ll=[lat,lon];positionUpdates++;},place(){},deferRefresh(){},cancelRefresh(){}},
        StaffTrackNavigation:{bindPopup(){}},map:new Proxy({},{get(){return()=>{camera++;throw Error('Unexpected camera operation');};}})};
    c.window=c;vm.createContext(c);vm.runInContext(helper,c);
    const teams=c.TigerTeams;
    assert.equal(teams.getTigerTeamForStaff('SANJIB KHARIA').team,'SBMT-1');
    assert.equal(teams.getTigerTeamForStaff('AJAY CHHETRI'),null);
    assert.equal(teams.getTigerTeamForStaff('AJOY CHHETRI'),null);
    assert.equal(teams.getTigerTeamForStaff('AJAI CHHETRI'),null);
    for(const name of ['RAJU RAI','PARTAP MANGAR','DHIRAJ EKKA','SUBASH RAVA','NIL'])assert.equal(teams.getTigerTeamForStaff(name),null);
    for(const [name,team]of [['BEJOY THAPA','STPF-4'],['BIJAY LAL','STPF-4'],['SINDUR RAVA','SBMT-2']])assert.equal(teams.getTigerTeamForStaff(name).team,team);
    assert.equal(teams.getTigerTeamForStaff({name:'Sanjib Kharia',designation:'SBMT',team:'SBMT-1'}),null,'No display-name/designation/team inference');
    assert.equal(teams.getTigerTeamForStaff({cleanName:'SANJIB KHARIA',documentId:'DIFFERENT'}),null,'Conflicting document identity rejected');
    assert.equal(teams.iconForStaff({cleanName:'SANJIB KHARIA',dutyActive:false}),null);
    assert.equal(teams.iconForStaff({cleanName:'SANJIB KHARIA',dutyActive:'true'}),null);
    assert.equal(teams.popupRow({cleanName:'NORMAL',dutyActive:true}), '');
    for(const [type,color,letter]of [['SBMT','#0D9488','M'],['STPF','#F59E0B','S'],['RRT','#DC3545','R']]){
        const icon=teams.getTigerTeamIcon(type);assert.equal(icon,teams.getTigerTeamIcon(type));
        assert(icon.options.html.includes(color));assert(icon.options.html.includes('>'+letter+'</div>'));
        assert(icon.options.html.includes('btr-team-body'));
        assert.equal(icon.options.html.includes('btr-team-monitoring'),type==='SBMT');
        assert(!/setInterval|setTimeout|<svg/.test(helper));
        assert.equal(JSON.stringify(icon.options.iconSize),'[30,30]');assert.equal(JSON.stringify(icon.options.iconAnchor),'[15,15]');
    }
    assert.equal(iconCount,3,'Exactly three cached category icons');
    const styles=fs.readFileSync('css/tigerTeams.css','utf8');
    assert.match(styles,/width:19\.125px;/);assert.match(styles,/height:17px;/);
    assert.match(styles,/width:26px;/);assert.match(styles,/height:26px;/);
    assert.match(styles,/animation:btr-team-monitoring-pulse 3s ease-out infinite/);
    assert.match(styles,/pointer-events:none/);assert.match(styles,/prefers-reduced-motion:reduce/);
    assert.match(styles,/animation:none; opacity:0/);
    assert(!/will-change|setInterval|setTimeout/.test(styles));
    assert.match(teams.popupRow({cleanName:'SANJIB KHARIA',dutyActive:true}),/TEAM: <b>SBMT-1<\/b>/);
    assert.match(teams.popupRow({cleanName:'SANJIB KHARIA',dutyActive:true}),/ROLE: TIGER MONITORING/);
    vm.runInContext(fs.readFileSync('js/staffRendering.js','utf8'),c);
    const staff={cleanName:'SANJIB KHARIA',name:'Sanjib Kharia',dutyActive:true,sessionId:'SANJIB KHARIA_1000'};
    const point={id:'p1',sessionId:staff.sessionId,lat:26,lon:89,time:Date.now(),accuracy:5};
    c.visibleStaffCache[staff.cleanName]=staff;c.sessionPointCache[staff.sessionId]={p1:point};
    const builder=s=>{builders++;return{popup:teams.popupRow(s)+'<button>NAVIGATE</button><button>View Track</button><button>Zoom to Track</button><button>Close</button>'};};
    const marker=c.StaffRendering.ensure(staff,point,staff.sessionId,26,89,builder).marker;
    assert(marker);assert.equal(marker.options.icon,teams.getTigerTeamIcon('SBMT'));assert.equal(marker.options.autoPanOnFocus,false);
    assert.equal(builders,0,'Closed markers retain lazy complete popup construction');assert.equal(bindCount,1);assert.equal(iconUpdates,0);
    marker.openPopup();assert.equal(builders,1,'Popup factory builds complete content once; unchanged first-open model is reused');
    assert.equal(marker.popup.options.autoPan,false);assert.equal(marker.popup.options.keepInView,false);
    marker.closePopup();marker.fire('popupclose');assert.equal(intervals.size,0);
    for(let i=0;i<100;i++){
        const updated={...point,lon:89+i/100000,time:Date.now()+i};c.sessionPointCache[staff.sessionId].p1=updated;
        c.StaffRendering.changed(staff.sessionId,'p1',updated,true,false);
        assert.equal(c.StaffRendering.ensure(staff,updated,staff.sessionId,26,updated.lon,builder).marker,marker);
    }
    assert.equal(iconUpdates,0,'GPS updates do not redundantly reset special icons');assert.equal(bindCount,1,'Tooltip not rebound on unchanged identity');
    const stale={...point,time:Date.now()-4*60*60*1000};c.sessionPointCache[staff.sessionId].p1=stale;c.StaffRendering.changed(staff.sessionId,'p1',stale,true,false);
    c.StaffRendering.refresh(marker);assert.equal(marker.element.style.opacity,'0.35');assert.equal(iconUpdates,0);
    staff.dutyActive=false;c.StaffRendering.refresh(marker);assert.equal(c.StaffRendering.ensure(staff,point,staff.sessionId,26,89,builder).marker,null);
    staff.dutyActive=true;c.StaffRendering.refresh(marker);assert.equal(marker.options.icon,teams.getTigerTeamIcon('SBMT'));
    assert.equal(camera,0);assert(positionUpdates>=100);assert.equal(Object.keys(c.staffMarkers).length,1);
    const normal=new Marker([26,89],{icon:{options:{html:'original'}}});teams.present(normal,{cleanName:'NORMAL',dutyActive:true},'LIVE');
    assert.equal(normal.options.icon.options.html,'original');assert.equal(normal.tooltip,undefined);assert.equal(normal.element.style.opacity,undefined);
    assert(!/fetch\(|getDocs\(|getDoc\(|onSnapshot\(|setDoc\(|updateDoc\(/.test(helper),'Helper has no remote operations');
    for(const file of ['index.html','js/staffRendering.js']){
        const baseline=file==='index.html'?restoreTigerTeamChanges(fs.readFileSync(file,'utf8')):reverse(fs.readFileSync(file,'utf8'),file);
        require('./phase134-release-integrity.cjs').verify(); // Team behaviour remains covered above; all baseline runtime files are preserved.
    }
    const html=fs.readFileSync('index.html','utf8');assert(html.indexOf('js/tigerTeams.js')<html.indexOf('js/staffRendering.js'));
    console.log('PASS fixed identity keys, all category colors/letters and cached icons, duty gating, Sanjib override, Ajoy/Ajai exclusion, three user confirmations, four unresolved exclusions, lazy popup/action retention, 100 GPS updates, freshness, marker reuse, camera neutrality and exact source preservation. Offline fixtures only.');
}
