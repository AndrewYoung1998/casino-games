"use strict";
/* Pai Gow Poker — the casino table (stage 6). */
function pgTable(el,stage){
 const bet=+getS(stage,'bet');
 const S={bank:1000,phase:'idle',p:[],b:[],n:0,ok:0,hinted:false,res:null,fb:'',msg:'Press Deal to get seven cards.',passed:false,setter:null,mine:null,bank_set:null};
 function deal(){const d=pgDeal();S.p=pgSort(d.slice(0,7));S.b=d.slice(7,14);S.phase='set';S.hinted=false;S.fb='';S.msg='Tap 2 cards for your low hand.';S.bank-=bet;render()}
 function locked(m,mine){
  const hw=houseWay(S.p),match=sameSetting(mine,hw);if(!S.hinted){S.n++;if(match)S.ok++}
  S.bank_set=houseWay(S.b);S.mine=mine;const r=pgResult(mine,S.bank_set),net=pgSettle(r,bet);S.bank=Math.round((S.bank+bet+net)*100)/100;
  S.msg=`<b style="color:${r==='win'?'var(--good)':r==='lose'?'var(--bad)':'var(--ink)'}">${r==='win'?`Win +$${net}`:r==='lose'?`Lose −$${bet}`:'Push'}</b>`;
  S.fb=(S.hinted?'<span class="small">House Way was shown, so this hand isn’t graded.</span> ':match?'<span class="ok">✓ Set the House Way.</span>':`<span class="no">✗ House Way: low ${handStr(pgSort(hw.low))} — ${hw.why}</span>`);
  S.phase='result';
  if(S.n>=20&&S.ok/S.n>=.8){markStage(stage,S.ok/S.n,true);if(!S.passed){S.passed=true;S.msg+=' · 🏆 Stage passed!'}}
  render();
 }
 function render(){
  el.innerHTML=`<div class="felt pg"><div class="shoebar"><div>Bet $${bet} · 5% commission on wins</div><div style="text-align:right">Bankroll<br><b style="color:var(--ink);font-size:1.15rem">$${S.bank}</b></div></div>
   <div class="seat">${S.phase==='result'?pgSetHTML(S.bank_set,'Banker (House Way)'):`<div class="lbl">Banker</div><div class="hand">${Array(7).fill(backHTML('sm')).join('')}</div>`}</div>
   <div class="seat">${S.phase==='result'?pgSetHTML(S.mine,'You'):'<div class="lbl">You</div><div class="setbox"></div>'}</div>
   <div class="msg">${S.msg}</div><div class="fbline">${S.fb}</div><div class="controls"></div></div>
   <div class="stats"><div class="stat"><b>${S.n}</b>graded hands</div><div class="stat"><b>${S.n?Math.round(S.ok/S.n*100)+'%':'—'}</b>House Way match</div><div class="stat"><b style="color:${S.bank>=1000?'var(--good)':'var(--bad)'}">${S.bank>=1000?'+':'−'}$${Math.abs(Math.round((S.bank-1000)*100)/100)}</b>session</div></div>`;
  const ctl=$('.controls',el);keyHandler=null;
  if(S.phase==='set'){S.setter=pgSetter($('.setbox',el),S.p,locked);ctl.innerHTML=`<button class="btn ghost sm" data-a="hint">Show House Way</button>`;ctl.querySelector('[data-a=hint]').onclick=()=>{S.hinted=true;S.setter.showBest(houseWay(S.p).mask)};keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();S.setter.lock()}}}
  else{if(S.phase==='idle')$('.setbox',el).innerHTML=`<div class="hand">${Array(7).fill(backHTML('sm')).join('')}</div>`;ctl.innerHTML=`<button class="btn primary" data-a="deal">Deal${S.n?' next hand':''} <span class="kbd">Enter</span></button>`;ctl.querySelector('[data-a=deal]').onclick=deal;keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();deal()}}}
 }
 render();
}
