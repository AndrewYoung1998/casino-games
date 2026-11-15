"use strict";
/* Pai Gow Poker — joker-aware hand evaluation, foul check, scoring a round, and the House Way.
   Deck: 52 cards + 1 Joker. The Joker counts as an Ace, or completes a straight, flush or straight flush.
   Note: casino house ways differ slightly; this file encodes one common, documented version. */
const isJoker=c=>c.r==='JK';
const pgv=c=>isJoker(c)?14:rv(c);                    // value for pairing (Joker pairs as an Ace)
const PG_NAMES={10:'Five aces'};
/* Five-card high hand. Five aces (4 Aces + Joker) is the top hand. */
function evalHigh(cs){
 const j=cs.findIndex(isJoker);if(j<0)return eval5(cs);
 const rest=cs.filter((_,i)=>i!==j);
 if(rest.filter(c=>c.r==='A').length===4)return{cat:10,name:'Five aces',score:[10]};
 let best=null;
 const suited=rest.every(c=>c.s===rest[0].s);
 for(const r of RANKS)for(const s of SUITS){if(r!=='A'&&!suited&&s!==SUITS[0])continue;const e=eval5([...rest,{r,s}]);if(r!=='A'&&![4,5,8,9].includes(e.cat))continue;if(!best||cmpScore(e.score,best.score)>0)best=e}
 return best;
}
/* Two-card low hand: a pair or two high cards. */
function evalLow(cs){const v=cs.map(pgv).sort((a,b)=>b-a);return v[0]===v[1]?{cat:1,name:`Pair of ${plural(v[0])}`,score:[1,v[0]]}:{cat:0,name:`${VAL_NAME[v[0]]}-${VAL_NAME[v[1]]}`,score:[0,v[0],v[1]]}}
/* The five-card hand must outrank the two-card hand. */
function isFoul(high,low,h=evalHigh(high),l=evalLow(low)){if(h.cat>=2)return false;return cmpScore(h.score,l.score)<=0}
/* Compare a player's set hand to the banker's. Copies (exact ties) go to the banker. */
function pgResult(p,b){const hi=cmpScore(evalHigh(p.high).score,evalHigh(b.high).score)>0,lo=cmpScore(evalLow(p.low).score,evalLow(b.low).score)>0;return hi&&lo?'win':!hi&&!lo?'lose':'push'}
const pgSettle=(res,bet)=>res==='win'?Math.round(bet*.95*100)/100:res==='lose'?-bet:0;
/* All legal ways to set 7 cards: low = indices i<j. */
function pgSplits(cs){const out=[];for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){const low=[cs[i],cs[j]],high=cs.filter((_,k)=>k!==i&&k!==j),he=evalHigh(high),le=evalLow(low);out.push({low,high,he,le,mask:(1<<i)|(1<<j),foul:isFoul(high,low,he,le)})}return out}
const SFCATS=[4,5,8,9];
/* House Way: returns {high, low, mask, why}. */
function houseWay(cs){
 const splits=pgSplits(cs).filter(s=>!s.foul),vals=cs.map(pgv),cnt={};vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
 const byN=n=>Object.keys(cnt).map(Number).filter(v=>cnt[v]===n).sort((a,b)=>b-a);
 const quads=Object.keys(cnt).map(Number).filter(v=>cnt[v]>=4),trips=byN(3),pairs=byN(2),singles=byN(1);
 const lowVals=s=>s.low.map(pgv).sort((a,b)=>b-a),highHas=(s,v,n)=>s.high.filter(c=>pgv(c)===v).length>=n,lowIsPair=(s,v)=>s.low.every(c=>pgv(c)===v);
 const pickBest=pred=>{let best=null;for(const s of splits){if(!pred(s))continue;const k=[...s.le.score,...s.he.score];if(!best||cmpScore(k,best.k)>0)best={...s,k}}return best};
 const sf=pickBest(s=>SFCATS.includes(s.he.cat));
 let r,why;
 if(cnt[14]===5){if(pairs.includes(13)){r=pickBest(s=>lowIsPair(s,13));why='Five aces with a pair of Kings: Kings go in the low hand.'}else{r=pickBest(s=>lowIsPair(s,14));why='Five aces: split, with a pair of Aces in the low hand.'}}
 else if(quads.length){const q=quads[0];
  if(pairs.length||trips.length){const p=Math.max(...pairs,...trips);r=pickBest(s=>highHas(s,q,4)&&lowIsPair(s,p));why=`Four ${plural(q)} plus a pair: keep the four together and play the pair low.`}
  else if(q<=6){r=pickBest(s=>highHas(s,q,4));why=`Four ${plural(q)} (6s or lower): always keep them together.`}
  else if(q<=10&&singles.includes(14)){r=pickBest(s=>highHas(s,q,4)&&lowVals(s).includes(14));why=`Four ${plural(q)} with an Ace: keep them together, Ace in the low hand.`}
  else{r=pickBest(s=>lowIsPair(s,q));why=`Four ${plural(q)} (7s or higher): split them into two pairs.`}}
 else if(trips.length>=2){r=pickBest(s=>lowIsPair(s,trips[0])&&highHas(s,trips[1],3));why='Two three-of-a-kinds: split the higher one, a pair in the low hand.'}
 else if(trips.length&&pairs.length){r=pickBest(s=>highHas(s,trips[0],3)&&lowIsPair(s,pairs[0]));why='Full house: trips stay high, the pair plays low.'}
 else if(trips.length){const t=trips[0];
  if(t===14){r=pickBest(s=>highHas(s,14,2)&&lowVals(s).includes(14));why='Three Aces: split. Pair of Aces high, one Ace low.'}
  else if(sf){r=sf;why='Three of a kind plus a straight/flush: play the straight or flush high, best two cards low.'}
  else{r=pickBest(s=>highHas(s,t,3));why=`Three ${plural(t)}: keep them high, best two cards low.`}}
 else if(pairs.length>=3){r=pickBest(s=>lowIsPair(s,pairs[0]));why='Three pairs: the highest pair goes in the low hand.'}
 else if(pairs.length===2){const[h,l]=pairs;
  if(h<=10&&singles.includes(14)){r=pickBest(s=>highHas(s,h,2)&&highHas(s,l,2)&&lowVals(s).includes(14));why='Two pair, 10s or lower, with an Ace: keep both pairs high, Ace low.'}
  else{r=pickBest(s=>highHas(s,h,2)&&lowIsPair(s,l));why='Two pair: split. Higher pair high, lower pair low.'}}
 else if(pairs.length===1){
  if(sf){r=sf;why='One pair plus a straight or flush: play the straight/flush high, best two cards low.'}
  else{r=pickBest(s=>highHas(s,pairs[0],2));why=`One pair: keep the ${plural(pairs[0])} high, the next two highest cards low.`}}
 else{
  if(sf){r=sf;why='No pair, but a straight or flush: play it high, best two cards low.'}
  else{const top=Math.max(...vals);r=pickBest(s=>highHas(s,top,1));why='No pair: highest card stays high, the next two highest go low.'}}
 if(!r){r=pickBest(()=>true);why='Best legal setting.'}
 return{high:r.high,low:r.low,mask:r.mask,why};
}
/* Same strength as the House Way setting? (suits/order don't matter) */
function sameSetting(a,b){return cmpScore(evalHigh(a.high).score,evalHigh(b.high).score)===0&&cmpScore(evalLow(a.low).score,evalLow(b.low).score)===0}
const pgDeal=()=>makeShoe(1,1);
const pgSort=cs=>[...cs].sort((a,b)=>pgv(b)-pgv(a));
