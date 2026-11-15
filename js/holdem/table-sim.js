"use strict";
/* Texas Hold'em — the playable table against three bots, with an optional coach (stage 8). */
function holdemTable(el,stage){
 const T=newTable(['You','Ace','Riverboat','Tight']),coachOn=getS(stage,'coach')==='on';
 const S={graded:0,ok:0,hands:0,fb:'',coach:null,passed:false,running:false};
 const me=()=>T.players[0];
 function coachInfo(){
  const p=me();if(p.folded||T.over)return null;const opp=T.players.filter(q=>!q.folded&&q!==p).length,tc=toCall(T,0),pot=potTotal(T);
  const e=equity(p.hole,T.board,opp,450),need=tc?tc/(pot+tc):0;
  return{e,need,tc,opp,hand:T.board.length?eval7([...p.hole,...T.board]).name:handCode(p.hole[0],p.hole[1])};
 }
 async function loop(){
  if(S.running)return;S.running=true;
  while(!T.over&&!T.players[T.toAct].human){render();await sleep(600);if(!el.isConnected){S.running=false;return}const d=botDecide(T,T.toAct);act(T,T.toAct,d.action,d.to)}
  S.running=false;S.coach=!T.over&&coachOn?coachInfo():null;if(!T.over&&!coachOn)S.coach=null;
  if(T.over)S.hands++;
  render();
 }
 function humanAct(kind){
  if(T.over||T.toAct!==0||S.running)return;const tc=toCall(T,0);
  if(tc>0){const c=S.coach||coachInfo();const cont=kind!=='fold',margin=.03;let right;if(Math.abs(c.e-c.need)<margin)right=true;else right=cont?c.e>c.need:c.e<c.need;
   S.graded++;if(right)S.ok++;
   S.fb=`${right?'<span class="ok">✓':'<span class="no">✗'} ${kind==='fold'?'Fold':'Continue'} with ${(c.e*100).toFixed(0)}% equity vs ${(c.need*100).toFixed(0)}% needed${right?'':' — '+(c.e>c.need?'the price was right to continue':'the price was too high')}.</span>`;
   if(S.graded>=25&&S.ok/S.graded>=.75){markStage(stage,S.ok/S.graded,true);if(!S.passed){S.passed=true;S.fb+=' 🏆 Stage passed!'}}}
  else S.fb='';
  if(kind==='fold')act(T,0,'fold');else if(kind==='call')act(T,0,tc?'call':'check');else if(kind==='allin')act(T,0,'allin');else act(T,0,'raise',raiseTo(T,0,kind));
  loop();
 }
 function next(){startHand(T);S.fb='';loop()}
 const seat=(p,i)=>{const show=p.human||(T.over&&p.shown);const isTurn=!T.over&&T.toAct===i;
  return `<div class="hseat ${p.folded?'folded':''} ${isTurn?'turn':''} ${p.human?'me':''}"><div class="sname">${p.name}${T.button===i?' <span class="dbtn">D</span>':''}</div>
  <div class="hand">${p.hole.length?p.hole.map(c=>show?cardHTML(c,'sm'):backHTML('sm')).join(''):backHTML('sm')+backHTML('sm')}</div>
  <div class="sstack">${p.stack}${p.allin?' · ALL-IN':p.folded?' · folded':''}</div>${p.bet?`<div class="sbet">${p.bet}</div>`:''}
  ${T.over&&p.shown&&T.results&&T.results.ev?`<div class="shand">${T.results.ev.get(p).name}</div>`:''}</div>`};
 function render(){
  const p=me(),tc=T.over?0:toCall(T,0),myTurn=!T.over&&T.toAct===0&&!S.running,pot=potTotal(T);
  el.innerHTML=`<div class="felt he">
   <div class="hbots">${T.players.slice(1).map((q,k)=>seat(q,k+1)).join('')}</div>
   <div class="hcenter"><div class="pot">Pot <b>${T.over&&T.results?T.results.pots.reduce((a,x)=>a+x.amount,0):pot}</b></div>${T.board.length?`<div class="hand">${T.board.map(c=>cardHTML(c,'deal')).join('')}</div>`:'<div class="small" style="padding:22px 0">'+(T.handNo?'Pre-flop':'Press Deal to start')+'</div>'}</div>
   <div class="hme">${seat(p,0)}</div>
   ${S.coach&&myTurn?`<div class="coach"><div><span>Hand</span><b>${S.coach.hand}</b></div><div><span>Equity vs ${S.coach.opp}</span><b>${(S.coach.e*100).toFixed(0)}%</b></div>${S.coach.tc?`<div><span>Need to call</span><b style="color:${S.coach.e>=S.coach.need?'var(--good)':'var(--bad)'}">${(S.coach.need*100).toFixed(0)}%</b></div>`:'<div><span>To call</span><b>0</b></div>'}</div>`:''}
   <div class="fbline">${S.fb}</div><div class="controls"></div>
   <div class="hlog">${T.log.slice(-7).map(l=>`<div>${l}</div>`).join('')}</div></div>
   <div class="stats"><div class="stat"><b>${S.hands}</b>hands</div><div class="stat"><b>${S.graded?Math.round(S.ok/S.graded*100)+'%':'—'}</b>graded (${S.graded})</div><div class="stat"><b style="color:${p.stack-(p.rebuys||0)*T.startStack>=T.startStack?'var(--good)':'var(--bad)'}">${p.stack}</b>chips${p.rebuys?` · ${p.rebuys} rebuy${p.rebuys>1?'s':''}`:''}</div></div>`;
  const ctl=$('.controls',el);keyHandler=null;
  if(T.over||!T.handNo){ctl.innerHTML=`<button class="btn primary" data-a="next">${T.handNo?'Next hand':'Deal'} <span class="kbd">Enter</span></button>`;$('[data-a=next]',ctl).onclick=next;keyHandler=e=>{if(e.key==='Enter'){e.preventDefault();next()}};return}
  if(!myTurn){ctl.innerHTML=`<div class="small">${T.players[T.toAct].name} is thinking…</div>`;return}
  const half=raiseTo(T,0,'half'),full=raiseTo(T,0,'pot'),all=p.bet+p.stack,canRaise=p.stack>tc;
  ctl.innerHTML=`<div class="acts">${tc?`<button class="btn" data-k="fold">Fold <span class="kbd">F</span></button>`:''}<button class="btn" data-k="call">${tc?`Call ${Math.min(tc,p.stack)}`:'Check'} <span class="kbd">C</span></button>
   ${canRaise&&half<all?`<button class="btn" data-k="half">${T.currentBet?'Raise':'Bet'} ${half} <span class="kbd">B</span></button>`:''}${canRaise&&full<all&&full!==half?`<button class="btn" data-k="pot">${T.currentBet?'Raise':'Bet'} ${full} <span class="kbd">P</span></button>`:''}${canRaise?`<button class="btn" data-k="allin">All-in ${all} <span class="kbd">A</span></button>`:''}</div>`;
  ctl.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>humanAct(b.dataset.k));
  keyHandler=e=>{const m={f:'fold',c:'call',b:'half',p:'pot',a:'allin'}[e.key.toLowerCase()];if(m&&ctl.querySelector(`[data-k=${m}]`))humanAct(m)};
 }
 render();
}
