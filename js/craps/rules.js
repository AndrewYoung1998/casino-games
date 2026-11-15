"use strict";
/* Craps — dice math, line/odds/place/field payouts and the roll resolver used by the live table.
   Rules used: Field pays 2:1 on 2 and 12 (1:1 on 3,4,9,10,11). Don't Pass bars 12. */
const WAYS=t=>6-Math.abs(t-7);                       // ways to roll a total with two dice (of 36)
const POINTS=[4,5,6,8,9,10];
/* True-odds payout on an odds bet behind the Pass line (profit). */
const ODDS_PAY={4:[2,1],10:[2,1],5:[3,2],9:[3,2],6:[6,5],8:[6,5]};
const oddsWin=(p,amt)=>amt*ODDS_PAY[p][0]/ODDS_PAY[p][1];
/* Place bet payouts (profit). */
const PLACE_PAY={6:[7,6],8:[7,6],5:[7,5],9:[7,5],4:[9,5],10:[9,5]};
const placeWin=(n,amt)=>amt*PLACE_PAY[n][0]/PLACE_PAY[n][1];
const FIELD_WIN=t=>t===2||t===12?2:[3,4,9,10,11].includes(t)?1:0;
const roll2=()=>[1+rnd(6),1+rnd(6)];
/* Pass line result on a roll: 'win' | 'lose' | 'point' (come-out sets point) | 'none'. */
function passResult(point,t){if(!point)return t===7||t===11?'win':[2,3,12].includes(t)?'lose':'point';return t===point?'win':t===7?'lose':'none'}
function dontResult(point,t){if(!point)return t===2||t===3?'win':t===12?'push':t===7||t===11?'lose':'point';return t===7?'win':t===point?'lose':'none'}
/* Resolve one roll for the live table. bets: {pass,dont,odds,place6,place8,field}. Mutates bets, returns {net,lines,point}. */
function resolveRoll(bets,point,t){
 let net=0;const L=[],pay=(name,p)=>{net+=p;L.push(`${name} ${p>=0?'wins +$'+p:'loses −$'+(-p)}`)};
 if(bets.field){const m=FIELD_WIN(t);pay('Field $'+bets.field,m?bets.field*m:-bets.field);bets.field=0}
 const pr=passResult(point,t),dr=dontResult(point,t);
 if(bets.pass){if(pr==='win'){pay('Pass $'+bets.pass,bets.pass);bets.pass=0;if(bets.odds){pay(`Odds $${bets.odds} (${ODDS_PAY[point].join(':')})`,oddsWin(point,bets.odds));bets.odds=0}}
  else if(pr==='lose'){pay('Pass $'+bets.pass,-bets.pass);bets.pass=0;if(bets.odds){pay('Odds $'+bets.odds,-bets.odds);bets.odds=0}}}
 if(bets.dont){if(dr==='win'){pay("Don't Pass $"+bets.dont,bets.dont);bets.dont=0}else if(dr==='lose'){pay("Don't Pass $"+bets.dont,-bets.dont);bets.dont=0}else if(dr==='push')L.push("Don't Pass pushes on 12 (barred)")}
 if(point){for(const n of[6,8]){const k='place'+n;if(!bets[k])continue;if(t===n)pay(`Place ${n} $${bets[k]} (7:6, stays up)`,placeWin(n,bets[k]));else if(t===7){pay(`Place ${n} $${bets[k]}`,-bets[k]);bets[k]=0}}}
 let np=point;if(!point&&pr==='point')np=t;else if(point&&(t===point||t===7))np=null;
 return{net,lines:L,point:np};
}
/* ---------- dice rendering ---------- */
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=(n,cls='')=>`<span class="die ${cls}">${Array.from({length:9},(_,i)=>`<i class="${PIPS[n].includes(i)?'v':''}"></i>`).join('')}</span>`;
const diceHTML=(a,b,cls='')=>`<div class="dice">${dieHTML(a,cls)}${dieHTML(b,cls)}</div>`;
/* A specific pair of dice for a total (random which pair). */
function diceFor(t){const opts=[];for(let a=1;a<=6;a++){const b=t-a;if(b>=1&&b<=6)opts.push([a,b])}return pick(opts)}
