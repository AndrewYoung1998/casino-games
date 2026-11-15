"use strict";
/* Craps — the full 3D table (stage 7). The layout is drawn on a tilted felt plane (800 × 470 logical px)
   that scales to fit the screen. Dice are thrown across it, off the back wall, and come to rest on the felt. */
const CW=800,CH=470,DIE=46;
function crapsTable(el,stage){
 const S={bank:500,point:null,bets:newBets(),dice:[3,4],diceAt:[{x:330,y:200,z:0},{x:420,y:215,z:90}],phase:'bet',pending:null,n:0,ok:0,rolls:0,fb:'',msg:'Come-out roll. Bet the Pass or Don’t Pass line, then roll.',passed:false};
 const STEP={pass:10,dont:10,come:10,dcome:10,field:5,place4:5,place5:5,place6:6,place8:6,place9:5,place10:5};
 const can=k=>k==='pass'||k==='dont'?!S.point:k==='come'||k==='dcome'?!!S.point:k==='odds'?!!(S.point&&S.bets.pass):true;
 function add(k){if(S.phase!=='bet'||!can(k))return;const amt=STEP[k];if(amt>S.bank){S.msg='Not enough bankroll.';return render()}S.bets[k]+=amt;S.bank-=amt;S.msg='';render()}
 function oddsTo(m){if(S.phase!=='bet'||!can('odds'))return;const p=S.point;let want=S.bets.pass*m;if([6,8].includes(p))want=Math.ceil(want/5)*5;if([5,9].includes(p)&&want%2)want++;const d=want-S.bets.odds;if(d>S.bank)return;S.bank-=d;S.bets.odds=want;render()}
 function takeDown(){if(S.phase!=='bet')return;for(const k of['odds','field','come','dcome',...PLACE_NUMS.map(n=>'place'+n)])if(S.bets[k]){S.bank+=S.bets[k];S.bets[k]=0}if(!S.point)for(const k of['pass','dont'])if(S.bets[k]){S.bank+=S.bets[k];S.bets[k]=0}render()}
 async function roll(){
  if(S.phase!=='bet')return;S.phase='rolling';S.fb='';S.msg='';render();
  const d=roll2(),t=d[0]+d[1],pt=S.point;
  await throwDice($('.cplane',el),d[0],d[1],{W:CW,H:CH,size:DIE},S.diceAt);if(!el.isConnected)return;
  S.dice=d;S.rolls++;
  const r=resolveRoll(S.bets,S.point,t);S.pending=r;S.point=r.point;
  const desc=pt?(t===pt?`Point ${t} made!`:t===7?'Seven-out!':`No decision on the line.`):(t===7||t===11?`Natural ${t}!`:[2,3,12].includes(t)?`Craps ${t}!`:`The point is ${t}.`);
  if(r.lines.some(l=>/wins|loses/.test(l))){S.phase='settle';S.msg=`Rolled <b>${t}</b>. ${desc} Settle: your net for this roll?`}
  else{S.bank+=r.credit;S.pending=null;S.phase='bet';S.msg=`Rolled <b>${t}</b>. ${desc}`+(r.lines.length?' '+r.lines.join(' · '):'')}
  render();
 }
 function settle(v){const r=S.pending,ok=v===r.net;S.n++;if(ok)S.ok++;
  S.fb=`${ok?'<span class="ok">✓ Correct':`<span class="no">✗ Net was ${r.net>=0?'+':'−'}$${Math.abs(r.net)}`}</span><div class="settle">${r.lines.join('<br>')}</div>`;
  S.bank+=r.credit;S.pending=null;S.phase='bet';S.msg=S.point?`The point is ${S.point}.`:'Come-out roll.';
  if(S.n>=15&&S.ok/S.n>=.8){markStage(stage,S.ok/S.n,true);if(!S.passed){S.passed=true;S.msg+=' 🏆 Stage passed!'}}
  render()}
 const chip=(amt,cls='')=>amt?`<span class="tchip ${cls}">${amt}</span>`:'';
 const zone=(k,cls,inner)=>`<button class="cz ${cls} ${S.bets[k]?'has':''}" data-k="${k}" ${S.phase==='bet'&&can(k)?'':'disabled'}>${inner}${chip(S.bets[k])}</button>`;
 function tableHTML(){
  const B=S.bets,pointBox=n=>{const lab={6:'SIX',9:'NINE'}[n]||n;return `<button class="cz pbox ${S.point===n?'isPoint':''} ${B['place'+n]?'has':''}" data-k="place${n}" ${S.phase==='bet'?'':'disabled'}><span class="pnum">${lab}</span><small>place ${PLACE_PAY[n].join(':')}</small>${chip(B['place'+n])}${chip(B.comeOn[n],'c')}${chip(B.dcomeOn[n],'dc')}${S.point===n?'<span class="puck3 on">ON</span>':''}</button>`};
  return `<div class="cstage"><div class="cscale"><div class="cplane">
   <div class="wall"></div><div class="rail"></div>
   <div class="layoutp">
    <div class="prow">${zone('dcome','dcbar','<b>DON’T COME</b><small>BAR ⚅⚅</small>')}${PLACE_NUMS.map(pointBox).join('')}</div>
    ${zone('come','comez','<b class="big">COME</b>')}
    ${zone('field','fieldz','<div class="fnums"><span class="dbl">2</span>3 · 4 · 9 · 10 · 11<span class="dbl">12</span></div><b>FIELD</b><small>2 and 12 pay double</small>')}
    ${zone('dont','dontz','<b>DON’T PASS BAR</b><small>⚅⚅ bar 12</small>')}
    ${zone('pass','passz','<b class="big">PASS LINE</b>')}
    ${B.odds?`<span class="tchip odds">${B.odds}</span>`:''}
    ${!S.point?'<span class="puck3 off">OFF</span>':''}
   </div>
   ${dieHTML3(S.dice[0],0,S.diceAt[0].z)}${dieHTML3(S.dice[1],1,S.diceAt[1].z)}
  </div></div></div>`;
 }
 /* Fit the tilted table to the panel. Perspective widens the near edge, so measure the real projected box. */
 function fit(){const st=$('.cstage',el),pl=$('.cplane',el);if(!st||!pl)return;const rail=pl.querySelector('.rail');
  let s=Math.min(1,st.clientWidth/CW);st.style.setProperty('--s',s);
  const box=()=>{const a=pl.getBoundingClientRect(),b=rail.getBoundingClientRect();return{w:Math.max(a.right,b.right)-Math.min(a.left,b.left),bottom:Math.max(a.bottom,b.bottom),top:Math.min(a.top,b.top)}};
  let m=box();if(m.w>st.clientWidth){s*=st.clientWidth/m.w*.98;st.style.setProperty('--s',s);m=box()}
  st.style.height=Math.max(0,m.bottom-st.getBoundingClientRect().top+6)+'px';st.style.paddingTop='0'}
 function render(){
  const onTable=betsOnTable(S.bets);
  el.innerHTML=`<div class="felt crp">
   <div class="shoebar"><div>${puck(S.point)} <span class="small">rolls: ${S.rolls}</span></div><div style="text-align:right">Bankroll <b style="color:var(--ink);font-size:1.1rem">$${S.bank}</b><br><span class="small">on table $${onTable}</span></div></div>
   ${tableHTML()}
   <div class="rollinfo">${S.phase==='rolling'?'<span class="sum">…</span>':`<span class="readout">${dieHTML(S.dice[0],'mini')}<i>+</i>${dieHTML(S.dice[1],'mini')}<i>=</i><span class="sum">${S.dice[0]+S.dice[1]}</span></span>`}<span class="msg">${S.msg}</span></div><div class="fbline">${S.fb}</div><div class="controls"></div>
   <div class="oddsrow ${can('odds')?'':'off'}"><span>Odds behind Pass${S.bets.odds?`: <b>$${S.bets.odds}</b>`:''}</span>${[1,2,3].map(m=>`<button class="btn sm" data-o="${m}" ${S.phase==='bet'&&can('odds')?'':'disabled'}>${m}×</button>`).join('')}<button class="btn ghost sm" data-a="down" ${S.phase==='bet'&&onTable?'':'disabled'}>Take down</button></div>
   <p class="small" style="text-align:center;margin:6px 0 0">Tap the felt to bet. Pass/Don’t Pass on the come-out; Come/Don’t Come once a point is set. Place bets work while a point is on.</p>
  </div>
  <div class="stats"><div class="stat"><b>${S.n}</b>rolls settled</div><div class="stat"><b>${S.n?Math.round(S.ok/S.n*100)+'%':'—'}</b>payout accuracy</div><div class="stat"><b style="color:${S.bank+onTable>=500?'var(--good)':'var(--bad)'}">${S.bank+onTable>=500?'+':'−'}$${Math.abs(S.bank+onTable-500)}</b>session</div></div>`;
  fit();const plane=$('.cplane',el);S.diceAt.forEach((p,k)=>placeDie(plane,k,p.x,p.y,0,DIE));
  el.querySelectorAll('.cz').forEach(b=>b.onclick=()=>add(b.dataset.k));
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>oddsTo(+b.dataset.o));
  $('[data-a=down]',el).onclick=takeDown;
  const ctl=$('.controls',el);keyHandler=null;
  if(S.phase==='settle'){ctl.innerHTML=`<form class="numform">${numHTML()}<button class="btn primary">Settle</button></form>`;wireNum(ctl);const f=$('form',ctl),inp=$('input',ctl);f.onsubmit=e=>{e.preventDefault();const v=readNum(inp);if(!isNaN(v))settle(v)};if(matchMedia('(hover:hover)').matches)inp.focus({preventScroll:true})}
  else{ctl.innerHTML=`<button class="btn primary" data-a="roll" ${S.phase==='bet'?'':'disabled'}>🎲 Throw the dice <span class="kbd">R</span></button>`;ctl.querySelector('[data-a=roll]').onclick=roll;keyHandler=e=>{if(e.key==='Enter'||e.key.toLowerCase()==='r'){e.preventDefault();roll()}}}
 }
 addEventListener('resize',()=>{if(el.isConnected)fit()});
 render();
}
