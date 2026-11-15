"use strict";
/* Video Poker — the playable 9/6 Jacks or Better machine (stage 6). */
function vpMachine(el,stage){
 const S={credits:1000,coins:5,phase:'idle',deck:[],hand:[],mask:0,hint:false,n:0,ok:0,bet:0,won:0,msg:'Bet up to 5 coins and press Deal.',fb:'',last:null,passed:false};
 function deal(){if(S.credits<S.coins){S.msg='Out of credits — reload the stage to reset.';return render()}
  S.credits-=S.coins;S.bet+=S.coins;S.deck=makeShoe(1);S.hand=S.deck.splice(0,5);S.mask=0;S.phase='hold';S.msg='Tap cards to hold, then Draw.';S.fb='';S.last=null;render()}
 function draw(){
  const g=vpGrade(S.hand,S.mask);S.n++;if(g.ok)S.ok++;
  const bm=maskCards(S.hand,g.best.masks[0]);
  S.fb=g.ok?`<span class="ok">✓ Correct hold — ${g.best.rule} (step ${g.best.step}).</span>`:`<span class="no">✗ Best: ${bm.length?'hold '+handStr(bm):'draw five'} — ${g.best.rule} (step ${g.best.step}). You played ${g.mine?g.mine.rule+' (step '+g.mine.step+')':'a non-strategy hold'}.</span>`;
  S.hand=S.hand.map((c,i)=>S.mask&(1<<i)?c:S.deck.shift());
  const p=vpPayout(S.hand,S.coins);S.last=p;S.credits+=p.win;S.won+=p.win;
  S.msg=p.win?`<span style="color:#fde68a">${p.name.toUpperCase()} — WIN ${p.win}</span>`:p.name;
  S.phase='idle';
  if(S.n>=30&&S.ok/S.n>=.85){markStage(stage,S.ok/S.n,true);if(!S.passed){S.passed=true;S.fb+=' 🏆 Stage passed!'}}
  render();
 }
 const toggle=i=>{if(S.phase!=='hold')return;S.mask^=1<<i;render()};
 function render(){
  const best=S.phase==='hold'&&S.hint?vpBestHold(S.hand).masks[0]:-1;
  el.innerHTML=`<div class="vp-machine">
   <table class="vp-pay">${VP_PAY.map((r,i)=>`<tr class="${S.last&&S.last.row===i?'hit':''}"><td>${r[1]}</td>${[1,2,3,4,5].map(c=>`<td class="${c===S.coins?'col':''}">${vpPayFor(i,c)}</td>`).join('')}</tr>`).join('')}</table>
   <div class="vp-cards">${S.hand.length?S.hand.map((c,i)=>`<button class="pickcard ${S.mask&(1<<i)?'held':''} ${best>=0&&best&(1<<i)?'hintc':''}" data-i="${i}" ${S.phase==='hold'?'':'disabled'}>${cardHTML(c,S.phase==='hold'?'deal':'')}<span class="heldtag">HELD</span></button>`).join(''):Array(5).fill(`<div class="pickcard">${backHTML()}</div>`).join('')}</div>
   <div class="vp-msg">${S.msg}</div>
   <div class="vp-bar"><div>CREDITS <b>${S.credits}</b></div><div>BET <b>${S.coins}</b></div><label class="tog"><input type="checkbox" class="hint" ${S.hint?'checked':''}> Hints</label></div>
   <div class="vp-controls"><button class="btn" data-a="one" ${S.phase==='hold'?'disabled':''}>Bet one <span class="kbd">B</span></button><button class="btn" data-a="max" ${S.phase==='hold'?'disabled':''}>Bet max <span class="kbd">M</span></button><button class="btn primary" data-a="go">${S.phase==='hold'?'Draw':'Deal'} <span class="kbd">Enter</span></button></div>
  </div><div class="fbline" style="margin-top:10px">${S.fb}</div>
  <div class="stats"><div class="stat"><b>${S.n}</b>hands</div><div class="stat"><b>${S.n?Math.round(S.ok/S.n*100)+'%':'—'}</b>hold accuracy</div><div class="stat"><b>${S.bet?(S.won/S.bet*100).toFixed(1)+'%':'—'}</b>session return</div></div>`;
  el.querySelectorAll('.vp-cards button').forEach(b=>b.onclick=()=>toggle(+b.dataset.i));
  $('.hint',el).onchange=e=>{S.hint=e.target.checked;render()};
  el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
  keyHandler=e=>{if(/^[1-5]$/.test(e.key))toggle(+e.key-1);else if(e.key==='Enter'){e.preventDefault();act('go')}else if(e.key.toLowerCase()==='b')act('one');else if(e.key.toLowerCase()==='m')act('max')};
 }
 function act(a){if(a==='go')return S.phase==='hold'?draw():deal();if(S.phase==='hold')return;if(a==='one')S.coins=S.coins%5+1;if(a==='max')S.coins=5;render()}
 render();
}
