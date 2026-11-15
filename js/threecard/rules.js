"use strict";
/* Three Card Poker — paytables, dealer qualifying, the Q-6-4 play rule and bet settlement.
   Paytables used throughout: Ante bonus 5/4/1, Pair Plus 40/30/6/4/1 (the common US tables). */
const TCP_ANTE_BONUS={5:5,4:4,3:1};      // eval3 cat → multiplier (straight flush, trips, straight)
const TCP_PAIR_PLUS={5:40,4:30,3:6,2:4,1:1};
/* Dealer needs Queen-high or better to qualify. */
const tcpQualifies=h=>eval3(h).cat>0||Math.max(...h.map(rv))>=12;
/* Optimal strategy: play any pair or better, or Q-6-4 or better; fold everything else. */
function tcpShouldPlay(h){const e=eval3(h);if(e.cat>0)return true;return cmpScore(h.map(rv).sort((a,b)=>b-a),[12,6,4])>=0}
const money=n=>(n<0?'−$':'+$')+Math.abs(n);
/* Settle one hand. Play bet always equals the Ante. Returns {net, lines[], outcome, ep, ed}. */
function tcpSettle(p,d,ante,pp,played){
 const ep=eval3(p),ed=eval3(d),lines=[];let net=0,outcome;
 if(pp){const m=TCP_PAIR_PLUS[ep.cat];if(m){net+=pp*m;lines.push(`Pair Plus: ${ep.name} pays ${m}:1 → +$${pp*m}`)}else{net-=pp;lines.push(`Pair Plus: no pair or better → −$${pp}`)}}
 if(!played){net-=ante;lines.push(`Folded → Ante lost −$${ante}`);return{net,lines,outcome:'fold',ep,ed}}
 const ab=TCP_ANTE_BONUS[ep.cat];if(ab){net+=ante*ab;lines.push(`Ante bonus: ${ep.name} pays ${ab}:1 → +$${ante*ab}`)}
 if(!tcpQualifies(d)){net+=ante;lines.push(`Dealer doesn’t qualify (needs Q-high) → Ante +$${ante}, Play pushes`);outcome='noqual'}
 else{const c=cmpScore(ep.score,ed.score);
  if(c>0){net+=2*ante;lines.push(`You beat the dealer → Ante +$${ante}, Play +$${ante}`);outcome='win'}
  else if(c<0){net-=2*ante;lines.push(`Dealer wins → Ante −$${ante}, Play −$${ante}`);outcome='lose'}
  else{lines.push('Exact tie → Ante and Play push');outcome='push'}}
 return{net,lines,outcome,ep,ed};
}
/* Deal a 3-card hand of a chosen category (for drills). */
function tcpHandOfCat(cat){for(let i=0;i<20000;i++){const h=dealN(3);if(eval3(h).cat===cat)return h}return dealN(3)}
/* A high-card hand close to the Q-6-4 line, the decisions players get wrong most. */
function tcpBorderline(){for(let i=0;i<20000;i++){const h=dealN(3),e=eval3(h);if(e.cat)continue;const v=h.map(rv).sort((a,b)=>b-a);if(v[0]===12||(v[0]===11&&Math.random()<.3)||(v[0]===13&&Math.random()<.3))return h}return dealN(3)}
const tcpHandHTML=(h,cls='deal')=>`<div class="hand">${h.map(c=>cardHTML(c,cls)).join('')}</div>`;
