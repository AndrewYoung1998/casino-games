"use strict";
/* Shared — saves each game's progress in localStorage so the hub can show it.
   Storage key per game: "casino-academy:<gameId>".
   Shape: { done: { <stageId>: {passed, best} }, unlockAll, settings: {} } */
const Progress={
 key:id=>'casino-academy:'+id,
 load(id){
  const base={done:{},unlockAll:false,settings:{}};
  try{
   let raw=localStorage.getItem(this.key(id));
   if(!raw&&id==='blackjack')raw=localStorage.getItem('cca-v1'); // migrate the original single-file trainer
   return Object.assign(base,JSON.parse(raw||'null')||{});
  }catch(e){return base}
 },
 save(id,state){try{localStorage.setItem(this.key(id),JSON.stringify(state))}catch(e){}},
 /* Number of stages passed, for the hub tiles. */
 passed(id){const d=this.load(id).done;return Object.values(d).filter(x=>x&&x.passed).length}
};
