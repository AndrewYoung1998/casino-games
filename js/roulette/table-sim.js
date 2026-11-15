"use strict";
/* Roulette — the live table with a spinning wheel (stage 5). */
function rouTable(el,stage){
 const american=getS(stage,'wheel')==='us',chip=+getS(stage,'chip');
 const S={bank:500,bets:{},hist:[],phase:'bet',win:null,n:0,ok:0,spun:0,msg:'Tap the layout to place chips, then Spin.',fb:'',lastBets:{},passed:false};
 const total=()=>Object.values(S.bets).reduce((a,b)=>a+b,0);
 const betList=bs=>Object.entries(bs).map(([k,amt])=>({key:k,label:keyLabel(k),nums:coverage(k),amt}));
 function place(k){if(S.phase!=='bet')return;if(total()+chip>S.bank){S.msg='Not enough bankroll for another chip.';return render()}S.bets[k]=(S.bets[k]||0)+chip;S.msg='';render()}
 async function spin(){
  if(S.phase!=='bet')return;S.phase='spinning';S.lastBets={...S.bets};S.win=spinNumber(american);S.fb='';S.msg='No more bets…';render();
  const wb=$('.wheelbox',el);if(wb.getBoundingClientRect().top<0||wb.getBoundingClientRect().bottom>innerHeight)wb.scrollIntoView({behavior:'smooth',block:'center'});
  await spinTo($('.wheelbox',el),american,S.win);if(!el.isConnected)return;
  S.hist.unshift(S.win);S.hist=S.hist.slice(0,14);
  if(total()){S.phase='settle';S.msg=`${numBadge(S.win)} ${colorOf(S.win)}. Settle your bets: what's your net result?`}else{S.phase='bet';S.msg=`${numBadge(S.win)} ${colorOf(S.win)}. (No bets placed.)`}
  render();
 }
 function settle(v){
  const r=settleBets(betList(S.bets),S.win),ok=v===r.net;S.n++;if(ok)S.ok++;S.bank+=r.net;
  S.fb=`${ok?'<span class="ok">✓ Correct':'<span class="no">✗ Net was '+(r.net>=0?'+':'−')+'$'+Math.abs(r.net)}</span><div class="settle">${r.lines.join('<br>')}</div>`;
  S.msg=`${numBadge(S.win)} → net <b style="color:${r.net>=0?'var(--good)':'var(--bad)'}">${r.net>=0?'+':'−'}$${Math.abs(r.net)}</b>`;
  S.bets={};S.phase='bet';
  if(S.n>=10&&S.ok/S.n>=.8){markStage(stage,S.ok/S.n,true);if(!S.passed){S.passed=true;S.msg+=' · 🏆 Stage passed!'}}
  render();
 }
 function render(){
  el.innerHTML=`<div class="felt rou"><div class="shoebar"><div>${american?'American · 0 & 00':'European · single 0'}<br>Chip $${chip}</div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b></div></div>
   <div class="rou-top">${wheelSVG(american)}<div class="hist"><div class="lbl">Last spins</div><div>${S.hist.map(numBadge).join('')||'<span class="small">—</span>'}</div></div></div>
   <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div>
   <div class="controls"></div>
   ${layoutHTML({american,chips:S.phase==='settle'?S.lastBets:S.bets,clickable:true,hl:S.win!=null&&S.phase!=='spinning'?[String(S.win)]:[]})}
  </div>
  <div class="stats"><div class="stat"><b>${S.n}</b>spins settled</div><div class="stat"><b>${S.n?Math.round(S.ok/S.n*100)+'%':'—'}</b>payout accuracy</div><div class="stat"><b style="color:${S.bank>=500?'var(--good)':'var(--bad)'}">${S.bank>=500?'+':'−'}$${Math.abs(S.bank-500)}</b>session</div></div>`;
  applyWheel($('.wheelbox',el),american);
  el.querySelectorAll('.layout .lc').forEach(b=>b.onclick=()=>place(b.dataset.k));
  const ctl=$('.controls',el);keyHandler=null;
  if(S.phase==='bet'){ctl.innerHTML=`<div class="acts"><button class="btn ghost sm" data-a="clear" ${total()?'':'disabled'}>Clear</button><button class="btn ghost sm" data-a="rebet" ${Object.keys(S.lastBets).length&&!total()?'':'disabled'}>Rebet</button><button class="btn primary" data-a="spin">Spin${total()?` · $${total()} on the table`:''} <span class="kbd">Enter</span></button></div>`;
   ctl.querySelector('[data-a=clear]').onclick=()=>{S.bets={};render()};ctl.querySelector('[data-a=rebet]').onclick=()=>{if(Object.values(S.lastBets).reduce((a,b)=>a+b,0)<=S.bank){S.bets={...S.lastBets};render()}};ctl.querySelector('[data-a=spin]').onclick=spin;
   keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();spin()}}}
  else if(S.phase==='settle'){ctl.innerHTML=`<form class="numform">${numHTML()}<button class="btn primary">Settle</button></form>`;wireNum(ctl);const f=$('form',ctl),inp=$('input',ctl);f.onsubmit=e=>{e.preventDefault();const v=readNum(inp);if(!isNaN(v))settle(v)};if(matchMedia('(hover:hover)').matches)inp.focus({preventScroll:true})}
 }
 render();
}
