"use strict";
/* Craps — the live dice table (stage 7). */
function crapsTable(el,stage){
 const S={bank:500,point:null,bets:{pass:0,dont:0,odds:0,place6:0,place8:0,field:0},dice:[3,4],phase:'bet',pending:null,n:0,ok:0,rolls:0,fb:'',msg:'Come-out roll. Bet the Pass or Don’t Pass line, then roll.',passed:false};
 const STEP={pass:10,dont:10,place6:6,place8:6,field:5};
 const can=k=>k==='pass'||k==='dont'?!S.point:k==='odds'?!!(S.point&&S.bets.pass):true;
 function add(k,amt){if(S.phase!=='bet'||!can(k))return;if(amt>S.bank){S.msg='Not enough bankroll.';return render()}S.bets[k]+=amt;S.bank-=amt;render()}
 function take(k){if(S.phase!=='bet'||!S.bets[k]||k==='pass'&&S.point||k==='dont'&&S.point)return;S.bank+=S.bets[k];S.bets[k]=0;if(k==='pass'){S.bank+=S.bets.odds;S.bets.odds=0}render()}
 function oddsTo(m){if(!can('odds'))return;const p=S.point;let want=S.bets.pass*m;if([6,8].includes(p))want=Math.ceil(want/5)*5;if([5,9].includes(p)&&want%2)want++;const d=want-S.bets.odds;if(d>S.bank)return;S.bank-=d;S.bets.odds=want;render()}
 async function roll(){
  if(S.phase!=='bet')return;S.phase='rolling';S.fb='';render();
  const d=roll2(),t=d[0]+d[1],before={...S.bets},pt=S.point;await throwDice($('.tray',el),d[0],d[1]);if(!el.isConnected)return;
  S.dice=d;S.rolls++;
  const stake=Object.values(before).reduce((a,b)=>a+b,0);
  const r=resolveRoll(S.bets,S.point,t);
  S.pending={r,t,before,pt};
  const point=r.point;S.point=point;
  const desc=pt?(t===pt?`Point ${t} made!`:t===7?'Seven-out!':`${t} — no decision on the line.`):(t===7||t===11?`Natural ${t}!`:[2,3,12].includes(t)?`Craps ${t}!`:`Point is ${t}.`);
  if(r.lines.length&&r.lines.some(l=>/wins|loses/.test(l))){S.phase='settle';S.msg=`Rolled <b>${t}</b>. ${desc} Settle: your net for this roll?`}
  else{applyMoney();S.phase='bet';S.msg=`Rolled <b>${t}</b>. ${desc}`+(r.lines.length?' '+r.lines.join(' · '):'')}
  render();
 }
 function applyMoney(){const{r,before}=S.pending;
  // Stakes leave the bankroll when placed. A bet that comes down returns its stake;
  // r.net then adds profit for wins and subtracts the stake for losses.
  let back=0;for(const k in before){const gone=before[k]-S.bets[k];if(gone>0)back+=gone}
  S.bank+=back+r.net;S.pending=null}
 function settle(v){const{r}=S.pending,ok=v===r.net;S.n++;if(ok)S.ok++;
  S.fb=`${ok?'<span class="ok">✓ Correct':`<span class="no">✗ Net was ${r.net>=0?'+':'−'}$${Math.abs(r.net)}`}</span><div class="settle">${r.lines.join('<br>')}</div>`;
  applyMoney();S.phase='bet';S.msg=S.point?`Point is ${S.point}.`:'Come-out roll.';
  if(S.n>=15&&S.ok/S.n>=.8){markStage(stage,S.ok/S.n,true);if(!S.passed){S.passed=true;S.msg+=' 🏆 Stage passed!'}}
  render()}
 const spot=(k,label,sub)=>`<button class="cspot ${k} ${S.bets[k]?'has':''}" data-k="${k}" ${S.phase==='bet'&&can(k)?'':'disabled'}><b>${label}</b><small>${sub}</small>${S.bets[k]?`<span class="chip3">${S.bets[k]}</span>`:''}</button>`;
 function render(){
  const onTable=Object.values(S.bets).reduce((a,b)=>a+b,0);
  el.innerHTML=`<div class="felt crp"><div class="shoebar"><div>${puck(S.point)} <span class="small">rolls: ${S.rolls}</span></div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b><br><span class="small">on table $${onTable}</span></div></div>
   <div class="diceArea">${dice3dHTML(S.dice[0],S.dice[1])}<div class="sum">${S.phase==='rolling'?'…':S.dice[0]+S.dice[1]}</div></div>
   <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div><div class="controls"></div>
   <div class="ctable"><div class="cgrid">
    ${spot('place6','Place 6','7:6 · $6')}${spot('place8','Place 8','7:6 · $6')}
    ${spot('field','Field','2·3·4·9·10·11·12 · $5')}
    ${spot('dont','Don’t Pass','bar 12 · $10')}
    ${spot('pass','Pass Line','1:1 · $10')}
   </div>
   </div><div class="oddsrow ${can('odds')?'':'off'}"><span>Odds behind Pass${S.bets.odds?`: <b>$${S.bets.odds}</b>`:''}</span>${[1,2,3].map(m=>`<button class="btn sm" data-o="${m}" ${S.phase==='bet'&&can('odds')?'':'disabled'}>${m}×</button>`).join('')}</div>
   <div class="acts" style="margin-top:8px"><button class="btn ghost sm" data-a="down" ${S.phase==='bet'&&['place6','place8','field','odds'].some(k=>S.bets[k])||(!S.point&&(S.bets.pass||S.bets.dont))?'':'disabled'}>Take down bets</button></div><p class="small" style="text-align:center;margin:6px 0 0">Tap a spot to add a chip. Pass and Don’t Pass are locked in once a point is set.</p>
  </div>
  <div class="stats"><div class="stat"><b>${S.n}</b>rolls settled</div><div class="stat"><b>${S.n?Math.round(S.ok/S.n*100)+'%':'—'}</b>payout accuracy</div><div class="stat"><b style="color:${S.bank+onTable>=500?'var(--good)':'var(--bad)'}">${S.bank+onTable>=500?'+':'−'}$${Math.abs(S.bank+onTable-500)}</b>session</div></div>`;
  el.querySelectorAll('.cspot').forEach(b=>{b.onclick=()=>add(b.dataset.k,STEP[b.dataset.k]);b.oncontextmenu=e=>{e.preventDefault();take(b.dataset.k)}});
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>oddsTo(+b.dataset.o));
  $('[data-a=down]',el).onclick=()=>{if(S.phase!=='bet')return;for(const k of['odds','place6','place8','field'])if(S.bets[k]){S.bank+=S.bets[k];S.bets[k]=0}if(!S.point)for(const k of['pass','dont'])if(S.bets[k]){S.bank+=S.bets[k];S.bets[k]=0}render()};
  const ctl=$('.controls',el);keyHandler=null;
  if(S.phase==='settle'){ctl.innerHTML=`<form class="numform">${numHTML()}<button class="btn primary">Settle</button></form>`;wireNum(ctl);const f=$('form',ctl),inp=$('input',ctl);f.onsubmit=e=>{e.preventDefault();const v=readNum(inp);if(!isNaN(v))settle(v)};if(matchMedia('(hover:hover)').matches)inp.focus({preventScroll:true})}
  else{ctl.innerHTML=`<button class="btn primary" data-a="roll" ${S.phase==='bet'?'':'disabled'}>🎲 Roll the dice <span class="kbd">R</span></button>`;ctl.querySelector('[data-a=roll]').onclick=roll;keyHandler=e=>{if(e.key==='Enter'||e.key.toLowerCase()==='r'){e.preventDefault();roll()}}}
 }
 render();
}
