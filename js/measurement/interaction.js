/* Isolated interaction prototype. No persistence, backend, location or export APIs. */
(function (w) {
 'use strict';
 w.BTRMeasurementPrototype={create({map,L,blocked=()=>false,changed=()=>{},forceTouchFallback=false}){
  const container=map.getContainer(),paneName='btrMeasurementVisuals';
  const pane=map.getPane(paneName)||map.createPane(paneName);pane.classList.add('btr-measurement-visuals');
  if(!pane.parentNode)map.getPane('mapPane').appendChild(pane);
  const group=L.featureGroup(),editGroup=L.layerGroup(),listeners=[],points=[],model=w.BTRMeasurementDocument.create();
  const editPane=map.getPane('btrMeasurementHandles')||map.createPane('btrMeasurementHandles');editPane.classList.add('btr-measurement-edit-handles');
  if(!editPane.parentNode)map.getPane('mapPane').appendChild(editPane);
  let preview=null,selectedVertex=0,dragIndex=null,rollingBack=false,coordinatePrecision=6,lastEditError=null;
  function syncPoints(){points.length=0;for(const p of model.get().coordinates)points.push([p[1],p[0]]);}
  let state='OFF',renderer=null,sequence=null,nextSequence=0,cancellations=0,disposed=false;
  const excludedSelector='.leaflet-marker-icon,.leaflet-popup,.leaflet-control,[role="dialog"],dialog,button,a,input,textarea,select,[contenteditable="true"],[data-measurement-ignore]';
  function excluded(target){return !!target?.closest?.(excludedSelector);}
  function active(){return state==='DRAWING'||state==='EDITING';}
  function notify(){changed(inspect());}
  function inspect(){return {state,mode:active()?'ON':'OFF',vertices:points.length,handlerCount:listeners.length,
   activeLayers:(map.hasLayer(group)?1:0)+(renderer&&map.hasLayer(renderer)?1:0)+group.getLayers().filter(l=>map.hasLayer(l)).length+editGroup.getLayers().filter(l=>map.hasLayer(l)).length+(map.hasLayer(editGroup)?1:0),
   geometryLayers:group.getLayers().length,editHandleCount:editGroup.getLayers().length,kind:model.get().kind,canUndo:model.history().undo,canRedo:model.history().redo,editing:state==='EDITING',editError:lastEditError||model.error(),gestureCancellations:cancellations,visualPaneChildren:pane.childElementCount,
   gesture:sequence?{id:sequence.id,invalid:sequence.invalid,multi:sequence.multi,ended:sequence.ended,consumed:sequence.consumed}:null};}
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push({target,type,fn,options});}
  function detach(){for(const l of listeners.splice(0))l.target.removeEventListener(l.type,l.fn,l.options);sequence=null;}
  function invalidate(){if(sequence&&!sequence.invalid){sequence.invalid=true;cancellations++;if(sequence.multi)abortEditMove();notify();}}
  function conflict(){if(!blocked())return false;cancel();return true;}
  function begin(id,x,y,target){
   if(!active()||conflict())return;
   if(sequence&&!sequence.ended&&sequence.ids.size){sequence.ids.add(id);sequence.multi=true;invalidate();return;}
   sequence={id:++nextSequence,ids:new Set([id]),startX:x,startY:y,endX:x,endY:y,at:performance.now(),ended:false,invalid:false,multi:false,consumed:false,excluded:excluded(target)};
  }
  function move(id,x,y){if(!sequence||!sequence.ids.has(id))return;sequence.endX=x;sequence.endY=y;
   if(Math.hypot(x-sequence.startX,y-sequence.startY)>8)invalidate();}
  function end(id,x,y,cancelled){if(!sequence||!sequence.ids.has(id))return;move(id,x,y);if(cancelled)invalidate();sequence.ids.delete(id);
   if(!sequence.ids.size){sequence.ended=true;sequence.endAt=performance.now();if(performance.now()-sequence.at>1000)invalidate();}}
  function pointerDown(e){if(e.button!==0&&e.pointerType!=='touch')return;begin(e.pointerId,e.clientX,e.clientY,e.target);}
  function pointerMove(e){move(e.pointerId,e.clientX,e.clientY);if(e.pointerType==='mouse')updatePreview(e);}
  function pointerUp(e){end(e.pointerId,e.clientX,e.clientY,false);}
  function pointerCancel(e){abortEditMove();end(e.pointerId,e.clientX,e.clientY,true);}
  function touchStart(e){for(const t of e.changedTouches)begin(t.identifier,t.clientX,t.clientY,e.target);if(e.touches.length>1&&sequence){sequence.multi=true;invalidate();}}
  function touchMove(e){for(const t of e.changedTouches)move(t.identifier,t.clientX,t.clientY);}
  function touchEnd(e){if(e.type==='touchcancel')abortEditMove();for(const t of e.changedTouches)end(t.identifier,t.clientX,t.clientY,e.type==='touchcancel');}
  let ignoreMouseUntil=0;
  function fallbackTouchStart(e){ignoreMouseUntil=performance.now()+1200;touchStart(e);}
  function mouseDown(e){if(performance.now()>=ignoreMouseUntil&&e.button===0)begin('mouse',e.clientX,e.clientY,e.target);}
  function mouseMove(e){move('mouse',e.clientX,e.clientY);updatePreview(e);}
  function mouseUp(e){end('mouse',e.clientX,e.clientY,false);}
  function consume(e){e.preventDefault();e.stopImmediatePropagation();}
  function click(e){
   if(!active()||excluded(e.target))return;
   if(conflict()){consume(e);return;}
   consume(e);if(state!=='DRAWING')return;const g=sequence;
   if(!g||!g.ended||g.invalid||g.multi||g.excluded||g.consumed||e.detail===0||performance.now()-g.endAt>1000||Math.hypot(e.clientX-g.endX,e.clientY-g.endY)>16)return;
   g.consumed=true;const ll=map.mouseEventToLatLng(e);
   if(!Number.isFinite(ll.lat)||!Number.isFinite(ll.lng)||Math.abs(ll.lat)>90||Math.abs(ll.lng)>180)return;
   model.add([ll.lng,ll.lat]);syncPoints();preview=null;lastEditError=null;draw();notify();
  }
  function doubleClick(e){if(active()&&!excluded(e.target)){consume(e);}}
  function contextMenu(e){if(active()&&!excluded(e.target)){invalidate();consume(e);}}
  function interruption(e){if(e?.type==='blur'&&e.target!==w)return;invalidate();abortEditMove();preview=null;if(sequence){sequence.ids.clear();sequence.ended=true;sequence.endAt=performance.now();}}
  function visibility(){if(w.document.visibilityState!=='visible')interruption();}
  function clearGeometry(){group.clearLayers();if(map.hasLayer(group))map.removeLayer(group);if(renderer&&map.hasLayer(renderer))map.removeLayer(renderer);renderer=null;}
  function draw(){
   group.clearLayers();if(!points.length){clearGeometry();return;}
   if(!renderer)renderer=L.svg({pane:paneName});if(!map.hasLayer(group))group.addTo(map);
   if(points.length>1){const options={pane:paneName,renderer,interactive:false,color:'#38bdf8',weight:3,className:'btr-measurement-line',fillOpacity:.12};(model.get().kind==='area'&&points.length>=3?L.polygon(points,options):L.polyline(points,options)).addTo(group);}
   if(preview&&state==='DRAWING'){const route=[...points,[preview[1],preview[0]]],options={pane:paneName,renderer,interactive:false,color:'#38bdf8',weight:2,dashArray:'4 5',fillOpacity:.04,className:'btr-measurement-preview'};(model.get().kind==='area'&&route.length>=3?L.polygon(route,options):L.polyline(route,options)).addTo(group);}
   for(const ll of points)L.circleMarker(ll,{pane:paneName,renderer,interactive:false,radius:5,color:'#fff',weight:2,fillColor:'#0284c7',fillOpacity:1,className:'btr-measurement-dot'}).addTo(group);
  }
  
  function measurement(){const d=model.get();return {committed:model.measure(),preview:preview&&state==='DRAWING'?w.BTRGeometry.analyze(d.kind,[...d.coordinates,preview]):null,coordinateText:w.BTRGeometry.coordinateText(d.coordinates,coordinatePrecision),precision:coordinatePrecision,history:model.history(),selectedVertex,lastEditError:lastEditError||model.error()};}
  function updatePreview(e){if(state!=='DRAWING'||(sequence&&!sequence.ended))return;const r=container.getBoundingClientRect();if(excluded(e.target)||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(preview){preview=null;draw();notify();}return;}const ll=map.mouseEventToLatLng(e);if(!Number.isFinite(ll.lat)||!Number.isFinite(ll.lng)||Math.abs(ll.lat)>90||Math.abs(ll.lng)>180)return;preview=[ll.lng,ll.lat];draw();notify();}
  function clearEditHandles(){editGroup.clearLayers();if(map.hasLayer(editGroup))map.removeLayer(editGroup);dragIndex=null;}
  function refreshDocument(handles=true){syncPoints();preview=null;draw();if(handles&&state==='EDITING')syncEditHandles();notify();}
  function abortEditMove(){if(dragIndex==null||rollingBack)return;rollingBack=true;model.cancelMove();syncPoints();for(const handle of editGroup.getLayers()){handle.dragging?.disable();const p=model.get().coordinates[handle.__measurementIndex];if(p)handle.setLatLng([p[1],p[0]]);if(state==='EDITING')handle.dragging?.enable();}dragIndex=null;rollingBack=false;draw();}
  function syncEditHandles(){clearEditHandles();if(state!=='EDITING')return;const coords=model.get().coordinates;if(selectedVertex>=coords.length)selectedVertex=Math.max(0,coords.length-1);editGroup.addTo(map);
   coords.forEach((p,i)=>{const handle=L.marker([p[1],p[0]],{pane:'btrMeasurementHandles',draggable:true,autoPan:false,autoPanOnFocus:false,title:'Measurement vertex '+(i+1),icon:L.divIcon({className:'btr-measurement-handle',html:'<span>'+String(i+1)+'</span>',iconSize:[24,24],iconAnchor:[12,12]})});handle.__measurementIndex=i;
    handle.on('click',()=>{selectedVertex=i;notify();});
    handle.on('dragstart',()=>{selectedVertex=i;dragIndex=i;preview=null;lastEditError=null;});
    handle.on('drag',()=>{if(rollingBack||dragIndex!==i)return;const ll=handle.getLatLng();try{model.previewMove(i,[ll.lng,ll.lat]);refreshDocument(false);}catch(e){lastEditError=e.message;abortEditMove();notify();}});
    handle.on('dragend',()=>{if(rollingBack||dragIndex!==i)return;dragIndex=null;if(!model.commitMove())lastEditError=model.error();syncPoints();const p=model.get().coordinates[i];handle.setLatLng([p[1],p[0]]);draw();notify();});handle.addTo(editGroup);
   });
  }
  function edit(){if(state!=='FINISHED'||blocked()||!model.beginEdit())return false;state='EDITING';attachInput();selectedVertex=0;lastEditError=null;syncEditHandles();notify();return true;}
  function saveEdit(){if(state!=='EDITING')return false;abortEditMove();if(!model.saveEdit()){lastEditError=model.error()||'Complete a valid edit first';notify();return false;}state='FINISHED';detach();clearEditHandles();refreshDocument(false);return true;}
  function cancelEdit(){if(state!=='EDITING')return false;abortEditMove();model.cancelEdit();state='FINISHED';detach();clearEditHandles();lastEditError=null;refreshDocument(false);return true;}
  function addMidpoint(){if(state!=='EDITING')return false;const d=model.get(),i=selectedVertex,j=(i+1)%d.coordinates.length;if(d.coordinates.length<2||(d.kind==='distance'&&j===0))return false;const ok=model.insert(i,w.BTRGeometry.midpoint(d.coordinates[i],d.coordinates[j]));if(ok)selectedVertex=i+1;lastEditError=model.error();refreshDocument();return ok;}
  function removeVertex(){if(state!=='EDITING')return false;const ok=model.remove(selectedVertex);lastEditError=model.error();refreshDocument();return ok;}
  function attachInput(){
   if(listeners.length)return;

   const passiveCapture={capture:true,passive:true};
   if(w.PointerEvent&&!forceTouchFallback){
    listen(container,'pointerdown',pointerDown,passiveCapture);listen(w.document,'pointermove',pointerMove,passiveCapture);
    listen(w.document,'pointerup',pointerUp,passiveCapture);listen(w.document,'pointercancel',pointerCancel,passiveCapture);
   }else{
    listen(container,'touchstart',fallbackTouchStart,passiveCapture);listen(w.document,'touchmove',touchMove,passiveCapture);
    listen(w.document,'touchend',touchEnd,passiveCapture);listen(w.document,'touchcancel',touchEnd,passiveCapture);
    listen(container,'mousedown',mouseDown,passiveCapture);listen(w.document,'mousemove',mouseMove,passiveCapture);listen(w.document,'mouseup',mouseUp,passiveCapture);
   }
   listen(container,'click',click,{capture:true});listen(container,'dblclick',doubleClick,{capture:true});listen(container,'contextmenu',contextMenu,{capture:true});
   listen(w,'blur',interruption,passiveCapture);listen(w,'resize',interruption,passiveCapture);listen(w.document,'visibilitychange',visibility,passiveCapture);
  }
  function start(kind='distance'){if(disposed||active()||blocked())return false;clearEditHandles();clearGeometry();model.reset(kind);syncPoints();preview=null;lastEditError=null;state='DRAWING';sequence=null;attachInput();notify();return true;}
  function finish(){if(state!=='DRAWING'||!points.length)return false;const result=model.measure();if(!result.valid||(model.get().kind==='area'&&!result.complete)){lastEditError=result.error||'Area needs three distinct vertices';notify();return false;}state='FINISHED';detach();preview=null;draw();notify();return true;}
  function undo(){abortEditMove();const ok=model.undo();lastEditError=null;refreshDocument();return ok;}
  function redo(){abortEditMove();const ok=model.redo();lastEditError=null;refreshDocument();return ok;}
  function cancel(){abortEditMove();state='OFF';detach();clearEditHandles();model.reset();syncPoints();preview=null;lastEditError=null;clearGeometry();notify();}
  function clear(){if(state==='EDITING')return false;model.clear();syncPoints();clearGeometry();sequence=null;preview=null;lastEditError=null;if(state==='FINISHED')state='OFF';notify();return true;}
  function ownsOperationalInput(e){return active()&&!excluded(e?.originalEvent?.target||e?.target);}
  return {start,finish,undo,redo,cancel,clear,edit,saveEdit,cancelEdit,addMidpoint,removeVertex,measurement,setPrecision(n){coordinatePrecision=w.BTRGeometry.precision(n);notify();},setTemporary(kind,coords){cancel();model.reset(kind,coords);syncPoints();state='FINISHED';draw();notify();},inspect,ownsOperationalInput,active,geometry:()=>points.map(p=>p.slice()),
   reconcile(){return conflict();},destroy(){if(disposed)return;disposed=true;cancel();pane.remove();editPane.remove();}};
 }};
})(window);
