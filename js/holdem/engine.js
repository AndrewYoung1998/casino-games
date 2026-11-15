"use strict";
/* Texas Hold'em — No-Limit betting engine: blinds, betting rounds, streets, side pots, showdown.
   Pure state functions (no DOM) so they can be tested headless. */
function newTable(names,stack=1000,sb=10,bb=20){
 return{players:names.map((n,i)=>({name:n,stack,hole:[],folded:false,allin:false,bet:0,contrib:0,acted:false,human:i===0,shown:false})),
  button:names.length-1,sb,bb,board:[],deck:[],street:'pre',currentBet:0,minRaise:bb,toAct:0,log:[],handNo:0,over:true,results:null,startStack:stack};
}
const canAct=p=>!p.folded&&!p.allin;
/* "You bet" vs "Ace bets" */
const vb=(p,third,base)=>p.human?base:third;
const potTotal=T=>T.players.reduce((a,p)=>a+p.contrib,0);
const nextIdx=(T,i,pred)=>{for(let k=1;k<=T.players.length;k++){const j=(i+k)%T.players.length;if(pred(T.players[j]))return j}return -1};
function put(p,amt){amt=Math.max(0,Math.min(amt,p.stack));p.stack-=amt;p.bet+=amt;p.contrib+=amt;if(p.stack===0)p.allin=true;return amt}
function startHand(T){
 for(const p of T.players)if(p.stack<T.bb){T.log.push(`${p.name} ${vb(p,'rebuys','rebuy')} for ${T.startStack}.`);p.stack=T.startStack;p.rebuys=(p.rebuys||0)+1}
 T.handNo++;T.over=false;T.results=null;T.board=[];T.deck=makeShoe(1);T.street='pre';
 for(const p of T.players)Object.assign(p,{hole:[T.deck.pop(),T.deck.pop()],folded:false,allin:false,bet:0,contrib:0,acted:false,shown:false});
 T.button=(T.button+1)%T.players.length;
 const sbI=nextIdx(T,T.button,()=>true),bbI=nextIdx(T,sbI,()=>true);
 put(T.players[sbI],T.sb);put(T.players[bbI],T.bb);T.currentBet=T.bb;T.minRaise=T.bb;
 T.log.push(`— Hand ${T.handNo}: ${T.players[T.button].name} ${vb(T.players[T.button],'has','have')} the button. Blinds ${T.sb}/${T.bb}.`);
 T.toAct=nextIdx(T,bbI,canAct);
}
const toCall=(T,i)=>Math.max(0,T.currentBet-T.players[i].bet);
/* Legal raise-to amounts. */
function raiseTo(T,i,kind){const p=T.players[i],tc=toCall(T,i),pot=potTotal(T);let size=kind==='half'?Math.round((pot+tc)/2):kind==='pot'?pot+tc:Infinity;size=Math.max(size,T.minRaise);return Math.min(T.currentBet+size,p.bet+p.stack)}
function act(T,i,action,to){
 const p=T.players[i],tc=toCall(T,i);let msg;
 if(action==='fold'){p.folded=true;msg=`${p.name} ${vb(p,'folds','fold')}.`}
 else if(action==='check'){msg=`${p.name} ${vb(p,'checks','check')}.`}
 else if(action==='call'){const a=put(p,tc);msg=`${p.name} ${vb(p,'calls','call')} ${a}${p.allin?' (all-in)':''}.`}
 else{ // raise / bet / allin: `to` is the total bet this street
  to=action==='allin'?p.bet+p.stack:Math.min(to,p.bet+p.stack);
  const prev=T.currentBet;put(p,to-p.bet);
  if(p.bet>prev){const inc=p.bet-prev;if(inc>=T.minRaise)T.minRaise=inc;T.currentBet=p.bet;for(const q of T.players)if(q!==p&&canAct(q))q.acted=false}
  msg=`${p.name} ${prev===0?vb(p,'bets','bet'):vb(p,'raises to','raise to')} ${p.bet}${p.allin?' (all-in)':''}.`}
 p.acted=true;T.log.push(msg);advance(T);
}
function advance(T){
 const live=T.players.filter(p=>!p.folded);
 if(live.length===1)return finish(T,[{winners:[live[0]],amount:potTotal(T),hand:null}]);
 const actors=T.players.filter(canAct);
 const done=actors.length===0||actors.every(p=>p.acted&&p.bet===T.currentBet)||(actors.length===1&&actors[0].bet>=T.currentBet&&live.length>1&&actors[0].acted)||(actors.length===1&&actors[0].bet>=Math.max(...live.map(p=>p.bet))&&live.filter(canAct).length===1&&live.every(p=>p===actors[0]||p.allin));
 if(!done){T.toAct=nextIdx(T,T.toAct,q=>canAct(q)&&!(q.acted&&q.bet===T.currentBet));return}
 nextStreet(T);
}
function nextStreet(T){
 for(const p of T.players){p.bet=0;p.acted=false}T.currentBet=0;T.minRaise=T.bb;
 const deal=n=>{T.deck.pop();for(let k=0;k<n;k++)T.board.push(T.deck.pop())}; // burn + deal
 if(T.street==='pre'){deal(3);T.street='flop'}else if(T.street==='flop'){deal(1);T.street='turn'}else if(T.street==='turn'){deal(1);T.street='river'}else return showdown(T);
 T.log.push(`${T.street[0].toUpperCase()+T.street.slice(1)}: ${handStr(T.board)}`);
 const actors=T.players.filter(canAct);
 if(actors.length<=1)return nextStreet(T); // everyone else all-in: run it out
 T.toAct=nextIdx(T,T.button,canAct);
}
/* Side pots: each level of contribution forms a pot shared by the best eligible hand(s). */
function showdown(T){
 const live=T.players.filter(p=>!p.folded);live.forEach(p=>p.shown=true);
 const ev=new Map(live.map(p=>[p,eval7([...p.hole,...T.board])]));
 const levels=[...new Set(T.players.map(p=>p.contrib).filter(c=>c>0))].sort((a,b)=>a-b);let prev=0;const pots=[];
 for(const L of levels){const amount=T.players.reduce((a,p)=>a+Math.max(0,Math.min(p.contrib,L)-prev),0);const elig=live.filter(p=>p.contrib>=L);prev=L;if(!amount)continue;
  if(!elig.length){pots.push({winners:live,amount,hand:null});continue} // can't happen with live eligible, safety
  let best=[elig[0]];for(const p of elig.slice(1)){const c=cmpScore(ev.get(p).score,ev.get(best[0]).score);if(c>0)best=[p];else if(c===0)best.push(p)}
  pots.push({winners:best,amount,hand:ev.get(best[0]).name});}
 // pots with the same winners are one pot as far as the players are concerned
 const merged=[];for(const pt of pots){const last=merged[merged.length-1];if(last&&last.winners.length===pt.winners.length&&last.winners.every(w=>pt.winners.includes(w))){last.amount+=pt.amount}else merged.push({...pt})}
 merged.forEach((pt,i)=>{pt.label=merged.length>1?(i===0?'Main pot':'Side pot'+(merged.length>2?' '+i:'')):'Pot'});
 finish(T,merged,ev);
}
function finish(T,pots,ev){
 for(const pot of pots){const share=Math.floor(pot.amount/pot.winners.length);let rem=pot.amount-share*pot.winners.length;for(const w of pot.winners){w.stack+=share+(rem>0?1:0);if(rem>0)rem--}
  T.log.push(`${pot.label&&pot.label!=='Pot'?pot.label+': ':''}${pot.winners.map(w=>w.name).join(' & ')} ${pot.winners.length>1?'split':vb(pot.winners[0],'wins','win')} ${pot.amount}${pot.hand?' with '+pot.hand.toLowerCase():''}.`)}
 T.results={pots,ev};T.over=true;for(const p of T.players){p.bet=0}
}
