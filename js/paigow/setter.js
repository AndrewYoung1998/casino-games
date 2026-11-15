"use strict";
/* Pai Gow Poker — tap-to-set UI: pick 2 cards for the low hand, see both hands live, foul warning.
   pgSetter(el, cards, onLock(mask)) → {lock()} */
function pgSetter(el,cards,onLock,{button='Set hand'}={}){
 let mask=0,done=false;
 function render(){
  const low=cards.filter((_,i)=>mask&(1<<i)),high=cards.filter((_,i)=>!(mask&(1<<i))),n=low.length;
  let status='Tap 2 cards for the <b>low hand</b>.';
  if(n===2){const f=isFoul(high,low);status=f?`<span class="no">⚠ Foul: the five-card hand must beat the two-card hand.</span>`:`High: <b>${evalHigh(high).name}</b> · Low: <b>${evalLow(low).name}</b>`}
  el.innerHTML=`<div class="pgset ${done?'done':''}"><div class="pgrow">${cards.map((c,i)=>`<button class="pickcard ${mask&(1<<i)?'low':''}" data-i="${i}" ${done?'disabled':''}>${cardHTML(c,'deal')}<span class="lowtag">LOW</span></button>`).join('')}</div>
   <div class="pgstatus">${status}</div><button class="btn primary lockin" ${n===2&&!isFoul(high,low)&&!done?'':'disabled'}>${button} <span class="kbd">Enter</span></button></div>`;
  el.querySelectorAll('.pickcard').forEach(b=>b.onclick=()=>toggle(+b.dataset.i));
  $('.lockin',el).onclick=lock;
 }
 function toggle(i){if(done)return;if(mask&(1<<i))mask^=1<<i;else{if(((mask>>>0).toString(2).match(/1/g)||[]).length>=2)return;mask|=1<<i}render()}
 function lock(){const low=cards.filter((_,i)=>mask&(1<<i)),high=cards.filter((_,i)=>!(mask&(1<<i)));if(low.length!==2||isFoul(high,low)||done)return;done=true;render();onLock(mask,{high,low})}
 render();
 return{lock,toggle,showBest(m){el.querySelectorAll('.pickcard').forEach((b,i)=>b.classList.toggle('best',!!(m&(1<<i))))}};
}
const pgSetHTML=(s,label)=>`<div class="pgpair"><div class="lbl">${label}</div><div class="pghand"><div><div class="mini">High · ${evalHigh(s.high).name}</div><div class="hand">${pgSort(s.high).map(c=>cardHTML(c,'sm')).join('')}</div></div><div><div class="mini">Low · ${evalLow(s.low).name}</div><div class="hand">${pgSort(s.low).map(c=>cardHTML(c,'sm')).join('')}</div></div></div></div>`;
