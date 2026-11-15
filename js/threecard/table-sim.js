"use strict";
/* Three Card Poker — the full table (stage 5). */
function tcpTable(el,stage){
 const S={bank:500,ante:+getS(stage,'ante'),pp:+getS(stage,'pp'),phase:'bet',p:[],d:[],n:0,dec:0,ok:0,fb:'',msg:'Press Deal to start. Bets come out of a $500 practice bankroll.',lines:[],passed:false};
 function deal(){const deck=makeShoe(1);S.p=deck.slice(0,3);S.d=deck.slice(3,6);S.bank-=S.ante+S.pp;S.phase='decide';S.msg='';S.fb='';S.lines=[];render()}
 function decide(play){
  const right=tcpShouldPlay(S.p)===play;S.dec++;if(right)S.ok++;
  const e=eval3(S.p);S.fb=right?`<span class="ok">✓ Correct — ${play?'play':'fold'} ${e.cat?e.name.toLowerCase():'this hand'}.</span>`:`<span class="no">✗ ${tcpShouldPlay(S.p)?'Play':'Fold'} is correct: ${e.cat?e.name+' always plays':'compare to Q-6-4'}.</span>`;
  if(play)S.bank-=S.ante;
  const r=tcpSettle(S.p,S.d,S.ante,S.pp,play);
  S.bank+=S.ante+S.pp+(play?S.ante:0)+r.net; // return stakes, then apply net
  S.lines=r.lines;S.msg=`${r.outcome==='fold'?'You folded.':`Dealer: ${r.ed.name}${tcpQualifies(S.d)?'':' (doesn’t qualify)'}.`} Net this hand: <b style="color:${r.net>=0?'var(--good)':'var(--bad)'}">${money(r.net)}</b>`;
  S.n++;S.phase='result';
  if(S.n>=20&&S.ok/S.dec>=.9){markStage(stage,S.ok/S.dec,true);if(!S.passed){S.passed=true;S.msg+=' · 🏆 Stage passed!'}}
  render();
 }
 function render(){
  const pct=(a,b)=>b?Math.round(a/b*100)+'%':'—';
  el.innerHTML=`<div class="felt"><div class="shoebar"><div>Ante $${S.ante} · Pair Plus ${S.pp?'$'+S.pp:'off'}</div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b></div></div>
  <div class="seat"><div class="lbl">Dealer${S.phase==='result'?' · '+eval3(S.d).name:''}</div><div class="hand">${S.d.length?S.d.map(c=>S.phase==='result'?cardHTML(c,'deal'):backHTML()).join(''):backHTML()+backHTML()+backHTML()}</div></div>
  <div class="seat"><div class="lbl">You${S.p.length?' · '+eval3(S.p).name:''}</div><div class="hand">${S.p.length?S.p.map(c=>cardHTML(c,'deal')).join(''):backHTML()+backHTML()+backHTML()}</div></div>
  <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div>${S.lines.length?`<div class="settle">${S.lines.map(l=>`<div>${l}</div>`).join('')}</div>`:''}<div class="controls"></div></div>
  <div class="stats"><div class="stat"><b>${S.n}</b>hands</div><div class="stat"><b>${pct(S.ok,S.dec)}</b>decision accuracy</div><div class="stat"><b style="color:${S.bank>=500?'var(--good)':'var(--bad)'}">${S.bank>=500?'+':'−'}$${Math.abs(S.bank-500)}</b>session</div></div>`;
  const ctl=$('.controls',el);
  if(S.phase==='decide'){ctl.innerHTML=`<div class="acts"><button class="btn" data-a="P">Play $${S.ante} <span class="kbd">P</span></button><button class="btn" data-a="F">Fold <span class="kbd">F</span></button></div>`;ctl.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>decide(b.dataset.a==='P'));keyHandler=e=>{const k=e.key.toUpperCase();if(k==='P')decide(true);if(k==='F')decide(false)}}
  else{ctl.innerHTML=`<button class="btn primary">Deal${S.n?' next hand':''} <span class="kbd">Enter</span></button>`;$('button',ctl).onclick=deal;keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();deal()}}}
 }
 render();
}
