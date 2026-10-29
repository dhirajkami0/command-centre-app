/* Copied temporary coordinates and undo/redo only. Never stores an official feature reference. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry.js'));else root.BTRMeasurementDocument=factory(root.BTRGeometry);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
 'use strict';const clone=x=>JSON.parse(JSON.stringify(x));
 function create(){let entries=[{kind:'distance',coordinates:[]}],cursor=0,draft=null,editing=null,error=null;
  const current=()=>draft||entries[cursor];
  function snapshot(){return clone({entries,cursor});}
  function commit(next){next={kind:next.kind,coordinates:next.coordinates.map(G.position)};if(JSON.stringify(next)===JSON.stringify(entries[cursor])){draft=null;return false;}entries=entries.slice(0,cursor+1);entries.push(clone(next));cursor++;draft=null;error=null;return true;}
  function validEdit(next){const r=G.analyze(next.kind,next.coordinates);return r.valid&&(next.kind!=='area'||r.complete)&&next.coordinates.length>=1;}
  function changeEdit(next){if(!editing){error='Enter temporary vertex editing first';return false;}if(!validEdit(next)){error=G.analyze(next.kind,next.coordinates).error||'Too few vertices';return false;}return commit(next);}
  return {
   get:()=>clone(current()),snapshot,measure:()=>G.analyze(current().kind,current().coordinates),error:()=>error,
   history:()=>({undo:cursor>0,redo:cursor<entries.length-1,entries:entries.length,editing:!!editing}),
   reset(kind='distance',coordinates=[]){if(!['distance','area'].includes(kind))throw Error('Invalid measurement type');entries=[{kind,coordinates:coordinates.map(G.position)}];cursor=0;draft=null;editing=null;error=null;},
   setKind(kind){if(!['distance','area'].includes(kind))throw Error('Invalid measurement type');if(editing){error='Finish or cancel vertex editing before changing measurement type';return false;}return commit({...current(),kind});},
   add(p){return commit({...current(),coordinates:[...current().coordinates,G.position(p)]});},
   clear(){return commit({...current(),coordinates:[]});},
   undo(){if(cursor===0||(editing&&!validEdit(entries[cursor-1])))return false;cursor--;draft=null;error=null;return true;},
   redo(){if(cursor>=entries.length-1||(editing&&!validEdit(entries[cursor+1])))return false;cursor++;draft=null;error=null;return true;},
   beginEdit(){if(editing||!validEdit(current()))return false;editing=snapshot();return true;},
   previewMove(i,p){if(!editing||!Number.isInteger(i)||i<0||i>=current().coordinates.length)return false;const next=clone(current());next.coordinates[i]=G.position(p);draft=next;return true;},
   commitMove(){if(!draft)return false;const next=draft;if(!validEdit(next)){error=G.analyze(next.kind,next.coordinates).error||'Invalid edit';draft=null;return false;}return commit(next);},
   cancelMove(){draft=null;},
   move(i,p){if(!this.previewMove(i,p))return false;return this.commitMove();},
   insert(after,p){if(!Number.isInteger(after)||after<0||after>=current().coordinates.length)return false;const next=clone(current());next.coordinates.splice(after+1,0,G.position(p));return changeEdit(next);},
   remove(i){if(!Number.isInteger(i)||i<0||i>=current().coordinates.length)return false;const next=clone(current());next.coordinates.splice(i,1);return changeEdit(next);},
   saveEdit(){if(!editing||!validEdit(current()))return false;if(draft&&!this.commitMove())return false;editing=null;error=null;return true;},
   cancelEdit(){if(!editing)return false;entries=editing.entries;cursor=editing.cursor;editing=null;draft=null;error=null;return true;}
  };
 }
 return Object.freeze({create});
});
