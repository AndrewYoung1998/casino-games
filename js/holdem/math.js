"use strict";
/* Texas Hold'em — equity (Monte Carlo), outs, pot odds and opening ranges.
   Cards are {r,s}; eval7 comes from js/shared/poker.js. */
const sameCard=(a,b)=>a.r===b.r&&a.s===b.s;
const remaining=used=>makeShoe(1).filter(c=>!used.some(u=>sameCard(u,c)));
/* Chance to win (ties count as a share) against `opp` random hands. */
function equity(hole,board,opp=1,iters=400){
 const deck0=remaining([...hole,...board]);let score=0;
 for(let it=0;it<iters;it++){
  const d=shuffle(deck0.slice());let k=0;const hands=[];for(let o=0;o<opp;o++)hands.push([d[k++],d[k++]]);
  const b=board.concat(d.slice(k,k+5-board.length));
  const me=eval7([...hole,...b]).score;let best=0,ties=1;
  for(const h of hands){const c=cmpScore(eval7([...h,...b]).score,me);if(c>0){best=-1;break}if(c===0)ties++}
  if(best===0)score+=1/ties;
 }
 return score/iters;
}
/* Unseen cards that lift the hand to category ≥ target (eval5 categories: 4 = straight). */
function outsTo(hole,board,target=4){const used=[...hole,...board];return remaining(used).filter(c=>eval7([...used,c]).cat>=target)}
/* Exact chance to hit at least one of `outs` cards with `cards` to come (47 unseen on the flop, 46 on the turn). */
const hitChance=(outs,cardsToCome)=>cardsToCome===2?1-((47-outs)*(46-outs))/(47*46):outs/46;
/* Equity needed to call: call ÷ (pot after your call). `pot` includes the bet you face. */
const potOddsNeed=(pot,call)=>call/(pot+call);
/* ---------- starting hands ---------- */
const HR='23456789TJQKA';
const rch=c=>c.r==='10'?'T':c.r;
function handCode(a,b){let x=rch(a),y=rch(b);if(HR.indexOf(x)<HR.indexOf(y))[x,y]=[y,x];return x===y?x+y:x+y+(a.s===b.s?'s':'o')}
/* Expand "66+, A9s+, KTs+, AJo+, T9s" into a Set of hand codes. */
function expandRange(str){const out=new Set();
 for(let t of str.split(',').map(x=>x.trim()).filter(Boolean)){const plus=t.endsWith('+');if(plus)t=t.slice(0,-1);
  if(t.length===2){const i=HR.indexOf(t[0]);for(let j=i;j<(plus?13:i+1);j++)out.add(HR[j]+HR[j])}
  else{const hi=t[0],lo=HR.indexOf(t[1]),suf=t[2],top=HR.indexOf(hi);for(let j=lo;j<(plus?top:lo+1);j++)out.add(hi+HR[j]+suf)}}
 return out}
/* Simplified 6-max opening ranges (first in, raise or fold). */
const OPEN_RANGES={
 'Early (UTG)':'66+, A9s+, KTs+, QTs+, JTs, AJo+, KQo',
 'Middle (Hijack)':'44+, A7s+, A5s, K9s+, Q9s+, J9s+, T9s, ATo+, KJo+',
 'Cutoff':'22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 87s, 76s, A8o+, KTo+, QTo+, JTo',
 'Button':'22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 86s+, 75s+, 65s, 54s, A2o+, K8o+, Q9o+, J9o+, T9o, 98o'};
const RANGE_SETS=Object.fromEntries(Object.entries(OPEN_RANGES).map(([k,v])=>[k,expandRange(v)]));
