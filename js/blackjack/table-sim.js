"use strict";
/* Blackjack — "Casino Floor" full six-deck table simulator (stage 11) */
/* ---------- casino simulator ---------- */
function casino(el,stage){
 const S={decks:6,unit:10,bank:1000,others:+getS(stage,'others'),pen:+getS(stage,'pen'),show:false,phase:'bet',hands:[],dealer:[],oth:[],active:0,msg:'Place a bet to start. Count every card you see — including the dealer’s hole card when it flips.',fb:'',n:0,dec:0,decOk:0,bets:0,betOk:0,chk:0,chkOk:0,since:0,reshuffle:false,holeShown:false,ins:0};
 function newShoe(){S.shoe=makeShoe(S.decks);S.rc=0;S.cutLeft=Math.round(S.decks*52*(1-S.pen))}
 newShoe();
 const dLeft=()=>Math.max(.5,Math.round(S.shoe.length/52*2)/2);
 const tcNow=()=>Math.floor(S.rc/dLeft());
 const draw=(vis=true)=>{const c=S.shoe.pop();if(vis)S.rc+=val(c.r);return c};
 const revealHole=()=>{if(!S.holeShown&&S.dealer[1]){S.holeShown=true;S.rc+=val(S.dealer[1].r)}};
 const pct=(a,b)=>b?Math.round(a/b*100)+'%':'—';
 function startRound(units){
  const tc=tcNow(),r=ramp(tc);S.bets++;S.msg='';S.holeShown=false;S.ins=0;
  if(units){const ok=r===String(units)||(r==='8'&&units>=8);if(ok)S.betOk++;S.fb=ok?`<span class="ok">✓ ${units}u is right for TC ${sgn(tc)}.</span>`:`<span class="no">✗ At TC ${sgn(tc)} the ramp says ${r==='W'?'sit out':r+'u'}.</span>`}
  else{if(r==='W'){S.betOk++;S.fb=`<span class="ok">✓ Smart sit-out at TC ${sgn(tc)}.</span>`}else S.fb=`<span class="no">✗ No need to sit out at TC ${sgn(tc)} — ramp says ${r}u.</span>`}
  S.hands=units?[{cards:[],bet:units}]:[];if(units)S.bank-=units*S.unit;
  S.oth=Array.from({length:Math.max(S.others,units?0:1)},()=>[]);
  for(const h of S.oth)h.push(draw());for(const h of S.hands)h.cards.push(draw());S.dealer=[draw()];
  for(const h of S.oth)h.push(draw());for(const h of S.hands)h.cards.push(draw());S.dealer.push(draw(false));
  S.active=0;
  if(units&&key(S.dealer[0].r)==='A'){S.phase='insurance';S.insTc=tcNow();render();return}
  afterIns();
 }
 function takeIns(yes){
  const h=S.hands[0],right=(S.insTc>=3)===yes;S.dec++;if(right)S.decOk++;
  S.fb+=` ${right?'<span class="ok">✓ Insurance decision correct':'<span class="no">✗ Insurance: take it only at TC ≥ +3'} (TC ${sgn(S.insTc)}).</span>`;
  if(yes){S.ins=h.bet/2;S.bank-=S.ins*S.unit}
  afterIns();
 }
 function afterIns(){
  const up=key(S.dealer[0].r);
  if((up==='A'||up==='T')&&handVal(S.dealer).total===21){
   revealHole();S.msg='Dealer has blackjack.';
   for(const h of S.hands){if(handVal(h.cards).total===21){S.bank+=h.bet*S.unit;h.res='Push'}else h.res='Lose'}
   if(S.ins){S.bank+=S.ins*3*S.unit;S.msg+=' Insurance pays 2:1.'}
   return endRound();
  }
  if(S.ins)S.msg='No dealer blackjack — insurance lost.';
  const h=S.hands[0];
  if(h&&handVal(h.cards).total===21){S.bank+=h.bet*S.unit*2.5;h.res='Blackjack!';h.done=true}
  for(const o of S.oth){for(;;){const v=handVal(o);if(v.total>=21)break;const a=strategy(o,S.dealer[0].r,null,o.length===2,false,false);if(a==='S')break;o.push(draw());if(a==='D')break}}
  if(!h||h.done)return dealerPlay();
  S.phase='play';render();
 }
 function act(a){
  const h=S.hands[S.active];if(!h)return;
  const canD=h.cards.length===2&&!h.splitAces,canP=isPair(h.cards)&&S.hands.length<4&&!h.splitAces;
  if((a==='D'&&!canD)||(a==='P'&&!canP))return;
  const tc=tcNow(),up=S.dealer[0].r,rec=strategy(h.cards,up,tc,canD,canP,true),bas=strategy(h.cards,up,null,canD,canP,false);
  S.dec++;
  if(rec===a){S.decOk++;S.fb=`<span class="ok">✓ ${ACT[a]} is correct${rec!==bas?` — nice index play (basic says ${ACT[bas]})`:''}.</span>`}
  else S.fb=`<span class="no">✗ Best play at TC ${sgn(tc)}: <b>${ACT[rec]}</b>${rec!==bas?` (count deviation — basic would ${ACT[bas]})`:''}.</span>`;
  if(a==='H'){h.cards.push(draw());const t=handVal(h.cards).total;if(t>=21){h.done=true;if(t>21)h.res='Bust'}}
  else if(a==='S')h.done=true;
  else if(a==='D'){S.bank-=h.bet*S.unit;h.bet*=2;h.cards.push(draw());h.done=true;if(handVal(h.cards).total>21)h.res='Bust'}
  else if(a==='P'){const c2=h.cards.pop();S.bank-=h.bet*S.unit;const nh={cards:[c2],bet:h.bet};const aces=c2.r==='A';h.cards.push(draw());nh.cards.push(draw());S.hands.splice(S.active+1,0,nh);if(aces){h.splitAces=nh.splitAces=true;h.done=nh.done=true}else if(handVal(h.cards).total===21)h.done=true}
  while(S.active<S.hands.length&&S.hands[S.active].done){S.active++;const n=S.hands[S.active];if(n&&handVal(n.cards).total===21)n.done=true}
  if(S.active>=S.hands.length)return dealerPlay();
  render();
 }
 function dealerPlay(){
  revealHole();
  const live=S.hands.some(h=>!h.res)||S.oth.some(o=>handVal(o).total<=21&&!(o.length===2&&handVal(o).total===21));
  if(live)while(handVal(S.dealer).total<17)S.dealer.push(draw());
  const d=handVal(S.dealer).total;
  for(const h of S.hands){if(h.res)continue;const t=handVal(h.cards).total;if(d>21||t>d){h.res='Win';S.bank+=h.bet*S.unit*2}else if(t===d){h.res='Push';S.bank+=h.bet*S.unit}else h.res='Lose'}
  S.msg=(S.msg?S.msg+' ':'')+(d>21?`Dealer busts with ${d}.`:`Dealer stands on ${d}.`)+(S.hands.length?'':' (You sat this one out.)');
  endRound();
 }
 function endRound(){
  S.n++;S.since++;S.phase='result';if(S.shoe.length<=S.cutLeft)S.reshuffle=true;
  if(S.n>=20&&S.dec&&S.decOk/S.dec>=.85&&S.chk>=6&&S.chkOk/S.chk>=.75){markStage(stage,S.decOk/S.dec,true);if(!S.passedNote){S.passedNote=true;S.msg+=' 🏆 Casino Floor passed!'}}
  render();
 }
 function nextHand(){
  S.hands=[];S.oth=[];S.dealer=[];S.fb='';S.msg='';
  if(S.reshuffle){newShoe();S.reshuffle=false;S.since=0;S.msg='🔀 Cut card reached — fresh shoe. Running count resets to 0.';S.phase='bet';return render()}
  if(S.since>=4||(S.since>=2&&Math.random()<.45)){S.since=0;S.phase='check';return render()}
  S.phase='bet';render();
 }
 function render(){
  const disc=(S.decks*52-S.shoe.length)/52;
  el.innerHTML=`<div class="felt">
   <div class="shoebar"><div>${traySVG(disc,6,false,.5)}</div><div style="text-align:center"><div class="cnt ${S.show?'':'hide'}">RC ${sgn(S.rc)} · ${dLeft()} decks · TC ${sgn(tcNow())}</div><label class="tog" style="margin-top:6px"><input type="checkbox" class="showc" ${S.show?'checked':''}> Show count (training wheels)</label></div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b></div></div>
   <div class="seat"><div class="lbl">Dealer${S.dealer.length&&S.holeShown?' · '+handVal(S.dealer).total:''}</div><div class="hand">${S.dealer.length?S.dealer.map((c,k)=>k===1&&!S.holeShown?backHTML():cardHTML(c)).join(''):backHTML()+backHTML()}</div></div>
   ${S.oth.length?`<div class="others">${S.oth.map((o,k)=>`<div class="seat"><div class="lbl">Player ${k+1} · ${handVal(o).total}</div><div class="hand">${o.map(c=>cardHTML(c,'sm')).join('')}</div></div>`).join('')}</div>`:''}
   <div class="you">${S.hands.map((h,k)=>{const v=handVal(h.cards);return `<div class="yh ${k===S.active&&S.phase==='play'?'act':''}"><div class="lbl">You${S.hands.length>1?' #'+(k+1):''} · ${v.soft&&v.total<21?'soft ':''}${v.total} · ${h.bet}u${h.res?` · <b style="color:${h.res==='Lose'||h.res==='Bust'?'var(--bad)':'var(--good)'}">${h.res}</b>`:''}</div><div class="hand">${h.cards.map(c=>cardHTML(c)).join('')}</div></div>`}).join('')}</div>
   <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div><div class="controls"></div></div>
   <div class="stats"><div class="stat"><b>${S.n}</b>hands</div><div class="stat"><b>${pct(S.decOk,S.dec)}</b>play accuracy</div><div class="stat"><b>${pct(S.betOk,S.bets)}</b>bet accuracy</div><div class="stat"><b>${pct(S.chkOk,S.chk)}</b>count checks</div></div>`;
  $('.showc',el).onchange=e=>{S.show=e.target.checked;render()};
  const ctl=$('.controls',el);keyHandler=null;
  if(S.phase==='bet'){
   ctl.innerHTML=`<div class="ask">Place your bet (1 unit = $${S.unit})</div><div class="chips">${[1,2,4,6,8,12].map(u=>`<button class="chip-btn" data-u="${u}">${u}u<small>$${u*S.unit}</small></button>`).join('')}</div><div style="margin-top:10px"><button class="btn ghost sm" data-u="0">Sit out this hand (Wong out)</button></div>`;
   ctl.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>startRound(+b.dataset.u||0));
  }else if(S.phase==='check'){
   ctl.innerHTML=`<form class="chk"><div class="ask">🧠 <b>Count check!</b> What are the counts right now?</div><div class="row2"><label>Running count${numHTML('rcv')}</label><label>True count${numHTML('tcv')}</label></div><button class="btn primary">Check</button></form>`;wireNum(ctl);
   $('form',ctl).onsubmit=e=>{e.preventDefault();const rv=readNum($('.rcv',ctl)),tv=readNum($('.tcv',ctl)),ex=S.rc/dLeft();const rOk=rv===S.rc,tOk=!isNaN(tv)&&Math.abs(tv-ex)<1;S.chk+=2;S.chkOk+=(rOk?1:0)+(tOk?1:0);
    S.fb=`<span class="${rOk?'ok':'no'}">${rOk?'✓':'✗'} Running count is ${sgn(S.rc)}</span> · <span class="${tOk?'ok':'no'}">${tOk?'✓':'✗'} True count ≈ ${sgn(S.rc)} ÷ ${dLeft()} = ${ex.toFixed(1)} → ${sgn(Math.floor(ex))}</span>`;S.phase='bet';render()};
  }else if(S.phase==='insurance'){
   ctl.innerHTML=`<div class="ask">Dealer shows an Ace. Insurance?</div><div class="acts"><button class="btn" data-i="1">Take insurance (${S.hands[0].bet/2}u)</button><button class="btn" data-i="0">No insurance</button></div>`;
   ctl.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>takeIns(b.dataset.i==='1'));
  }else if(S.phase==='play'){
   const h=S.hands[S.active],canD=h.cards.length===2&&!h.splitAces,canP=isPair(h.cards)&&S.hands.length<4&&!h.splitAces;
   ctl.innerHTML=`<div class="acts"><button class="btn" data-a="H">Hit <span class="kbd">H</span></button><button class="btn" data-a="S">Stand <span class="kbd">S</span></button><button class="btn" data-a="D" ${canD?'':'disabled'}>Double <span class="kbd">D</span></button><button class="btn" data-a="P" ${canP?'':'disabled'}>Split <span class="kbd">P</span></button></div>`;
   ctl.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
   keyHandler=e=>{const k=e.key.toUpperCase();if('HSDP'.includes(k)&&k.length===1)act(k)};
  }else if(S.phase==='result'){
   ctl.innerHTML=`<button class="btn primary nh">Next hand → <span class="kbd">Enter</span></button>`;$('.nh',ctl).onclick=nextHand;
   keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();nextHand()}};
  }
 }
 render();
}
