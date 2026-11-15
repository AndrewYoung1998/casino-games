"use strict";
/* Baccarat — the live eight-deck shoe (stage 5). */
function bacTable(el,stage){
 const unit=+getS(stage,'unit');
 const S={shoe:makeShoe(BAC_DECKS),bank:1000,side:null,bet:0,phase:'bet',c:null,show:{P:0,B:0},q:null,calls:0,ok:0,n:0,road:[],fb:'',msg:'Choose a bet, or just deal to practice the rules.',passed:false};
 S.cut=Math.round(BAC_DECKS*52*.15);
 function placeBet(side){if(S.phase!=='bet')return;if(S.side===side){S.bet+=unit}else{S.side=side;S.bet=unit}if(S.bet>S.bank)S.bet=S.bank;render()}
 function clearBet(){S.side=null;S.bet=0;render()}
 function deal(){
  if(S.shoe.length<=S.cut){S.shoe=makeShoe(BAC_DECKS);S.road=[];S.msg='🔀 Cut card reached — new shoe.'}else S.msg='';
  S.c=dealCoup(S.shoe);S.show={P:2,B:2};S.fb='';S.phase='q1';render();
 }
 function answer(v){
  const c=S.c;S.calls++;
  if(S.phase==='q1'){const a=c.natural?'N':playerDraws(c.pt0)?'D':'S',ok=v===a;if(ok)S.ok++;
   S.fb=`${ok?'<span class="ok">✓':'<span class="no">✗'} ${c.natural?`Natural ${Math.max(c.pt0,c.bt0)} — both stand.`:`Player ${c.pt0} → ${a==='D'?'draws':'stands'}.`}</span>`;
   if(c.natural)return finish();
   if(c.P.length===3)S.show.P=3;S.phase='q2';return render()}
  if(S.phase==='q2'){const a=c.B.length===3?'D':'S',ok=v===a;if(ok)S.ok++;S.fb+=` ${ok?'<span class="ok">✓':'<span class="no">✗'} ${bankerReason(c.bt0,c.p3)}</span>`;S.show.B=c.B.length;return finish()}
 }
 function finish(){
  const c=S.c;S.show={P:c.P.length,B:c.B.length};S.n++;S.road.push(c.winner);
  let line=`Player ${c.pt} · Banker ${c.bt} → <b>${c.winner==='T'?'Tie':WIN_NAME[c.winner]+' wins'}</b>`;
  if(S.side){const net=bacSettle(S.side,S.bet,c.winner);S.bank=Math.round((S.bank+net)*100)/100;line+=` · your $${S.bet} on ${WIN_NAME[S.side]}: <b style="color:${net>0?'var(--good)':net<0?'var(--bad)':'var(--ink)'}">${net>0?'+':net<0?'−':'±'}$${Math.abs(net)}</b>`}
  S.msg=line;S.phase='result';
  if(S.n>=20&&S.ok/S.calls>=.9){markStage(stage,S.ok/S.calls,true);if(!S.passed){S.passed=true;S.msg+=' · 🏆 Stage passed!'}}
  render();
 }
 function road(){const cols=[];S.road.forEach((r,i)=>{const c=Math.floor(i/6);(cols[c]=cols[c]||[]).push(r)});return `<div class="road">${cols.map(col=>`<div class="rcol">${col.map(r=>`<span class="bead ${r}">${r}</span>`).join('')}</div>`).join('')}</div>`}
 function render(){
  const c=S.c,cnt=k=>S.road.filter(x=>x===k).length;
  el.innerHTML=`<div class="felt bac">
   <div class="shoebar"><div>Shoe: ${S.shoe.length} cards left</div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b></div></div>
   <div class="bac-hands"><div class="seat"><div class="lbl">Player${c?' · '+btotal(c.P.slice(0,S.show.P)):''}</div><div class="hand">${c?c.P.slice(0,S.show.P).map((x,i)=>cardHTML(x,i>=2?'deal side':'deal')).join(''):backHTML()+backHTML()}</div></div>
   <div class="seat"><div class="lbl">Banker${c?' · '+btotal(c.B.slice(0,S.show.B)):''}</div><div class="hand">${c?c.B.slice(0,S.show.B).map((x,i)=>cardHTML(x,i>=2?'deal side':'deal')).join(''):backHTML()+backHTML()}</div></div></div>
   <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div><div class="controls"></div></div>
   <div class="road-wrap"><div class="lbl">Bead road · Banker ${cnt('B')} · Player ${cnt('P')} · Tie ${cnt('T')}</div>${road()}</div>
   <div class="stats"><div class="stat"><b>${S.n}</b>coups</div><div class="stat"><b>${S.calls?Math.round(S.ok/S.calls*100)+'%':'—'}</b>draw calls</div><div class="stat"><b style="color:${S.bank>=1000?'var(--good)':'var(--bad)'}">${S.bank>=1000?'+':'−'}$${Math.abs(Math.round((S.bank-1000)*100)/100)}</b>session</div></div>`;
  const ctl=$('.controls',el);
  if(S.phase==='bet'||S.phase==='result'){
   ctl.innerHTML=`<div class="bets">${['P','B','T'].map(k=>`<button class="betspot ${k} ${S.side===k?'on':''}" data-s="${k}"><b>${WIN_NAME[k]}</b><small>${k==='B'?'0.95:1':k==='T'?'8:1':'1:1'}</small>${S.side===k?`<span class="stake">$${S.bet}</span>`:''}</button>`).join('')}</div>
   <div class="acts" style="margin-top:10px">${S.side?'<button class="btn ghost sm" data-a="clear">Clear bet</button>':''}<button class="btn primary" data-a="deal">Deal${S.side?` · $${S.bet} on ${WIN_NAME[S.side]}`:' (no bet)'} <span class="kbd">Enter</span></button></div>`;
   if(S.phase==='result')S.phase='bet';
   ctl.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>placeBet(b.dataset.s));
   ctl.querySelector('[data-a=deal]').onclick=deal;const cl=ctl.querySelector('[data-a=clear]');if(cl)cl.onclick=clearBet;
   keyHandler=e=>{const k=e.key.toUpperCase();if('PBT'.includes(k)&&k.length===1)placeBet(k);else if(e.key==='Enter'){e.preventDefault();deal()}};
  }else{
   const opts=S.phase==='q1'?[['N','Natural — stand'],['D','Player draws'],['S','Player stands']]:[['D','Banker draws'],['S','Banker stands']];
   ctl.innerHTML=`<div class="ask">${S.phase==='q1'?'What happens next?':'Does Banker draw?'}</div><div class="acts">${opts.map(([v,l],i)=>`<button class="btn" data-v="${v}">${l} <span class="kbd">${i+1}</span></button>`).join('')}</div>`;
   ctl.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>answer(b.dataset.v));
   keyHandler=e=>{const i=+e.key-1;if(opts[i])answer(opts[i][0])};
  }
 }
 render();
}
