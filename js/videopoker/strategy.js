"use strict";
/* Video Poker — 9/6 Jacks or Better paytable and hold strategy.
   Strategy is the well-known 16-step "simple strategy" for 9/6 Jacks or Better
   (about 99.46% return vs 99.54% for computer-perfect play). */
const VP_PAY=[ // [eval5 category or 'jacks', name, pays per coin at 1–4 coins]
 [9,'Royal flush',250],[8,'Straight flush',50],[7,'Four of a kind',25],[6,'Full house',9],[5,'Flush',6],[4,'Straight',4],[3,'Three of a kind',3],[2,'Two pair',2],['jacks','Jacks or better',1]];
/* Payout in coins for a final hand. Royal at 5 coins pays 4000 (800 per coin). */
function vpPayout(cards,coins){
 const e=eval5(cards);let row=null;
 if(e.cat>=2)row=VP_PAY.find(r=>r[0]===e.cat);else if(e.cat===1&&e.score[1]>=11)row=VP_PAY[8];
 if(!row)return{win:0,name:e.cat===1?'Low pair — no pay':'No win',row:-1};
 return{win:e.cat===9&&coins===5?4000:row[2]*coins,name:row[1],row:VP_PAY.indexOf(row)};
}
const vpPayFor=(i,coins)=>i===0&&coins===5?4000:VP_PAY[i][2]*coins;
/* The strategy ladder, best first. */
const VP_LADDER=['Royal flush, straight flush or four of a kind','4 to a royal flush','Three of a kind, straight, flush or full house','4 to a straight flush','Two pair','High pair (Jacks or better)','3 to a royal flush','4 to a flush','Low pair (2s–10s)','4 to an outside straight','2 suited high cards','3 to a straight flush','2 unsuited high cards (if 3+, keep the lowest 2)','Suited 10 with a J, Q or K','One high card (J, Q, K or A)','Draw five new cards'];
const isHigh=v=>v>=11;
function fitsStraight(v){const u=new Set(v);if(u.size!==v.length)return false;if(Math.max(...v)-Math.min(...v)<=4)return true;if(v.includes(14)){const lo=v.map(x=>x===14?1:x);return Math.max(...lo)-Math.min(...lo)<=4}return false}
function isOutside(v){const s=[...v].sort((a,b)=>a-b);return new Set(s).size===4&&s[3]-s[0]===3&&s[0]>=2&&s[3]<=13}
/* Classify an exact set of held cards → [ladderStep 1–16, tiebreak] or null if it isn't a strategy pattern. */
function vpClassify(held){
 const k=held.length,v=held.map(rv),suited=k>0&&held.every(c=>c.s===held[0].s),g=groups(v).map(x=>x[1]);
 if(k===5){const e=eval5(held);if(e.cat>=7)return[1,0];if(e.cat>=4)return[3,1];return null} // tiebreak 1: never break a pat full house down to trips
 if(k===4){if(g[0]===4)return[1,0];if(suited&&v.every(x=>x>=10))return[2,0];if(g[0]===2&&g[1]===2)return[5,0];if(suited&&fitsStraight(v))return[4,0];if(suited)return[8,0];if(isOutside(v))return[10,0];return null}
 if(k===3){if(g[0]===3)return[3,0];if(suited&&v.every(x=>x>=10))return[7,0];if(suited&&fitsStraight(v))return[12,0];return null}
 if(k===2){if(g[0]===2)return isHigh(v[0])?[6,0]:[9,0];if(v.every(isHigh))return suited?[11,0]:[13,-(v[0]+v[1])];if(suited&&v.includes(10)&&v.some(x=>x>=11&&x<=13))return[14,0];return null}
 if(k===1)return isHigh(v[0])?[15,0]:null;
 return[16,0];
}
const maskCards=(hand,m)=>hand.filter((_,i)=>m&(1<<i));
/* Best hold: returns {masks:[...all equally good masks], step, rule}. */
function vpBestHold(hand){
 let best=null,masks=[];
 for(let m=0;m<32;m++){const c=vpClassify(maskCards(hand,m));if(!c)continue;const key=[-c[0],c[1]];const cmp=best?cmpScore(key,best):1;if(cmp>0){best=key;masks=[m]}else if(cmp===0)masks.push(m)}
 const step=-best[0];return{masks,step,rule:VP_LADDER[step-1]};
}
/* Grade a hold mask against the best. */
function vpGrade(hand,mask){const b=vpBestHold(hand),c=vpClassify(maskCards(hand,mask));return{ok:b.masks.includes(mask),best:b,mine:c?{step:c[0],rule:VP_LADDER[c[0]-1]}:null}}
/* Deal a hand whose best hold is one of the given ladder steps (for focused drills). */
function vpHandForSteps(steps){for(let i=0;i<4000;i++){const h=dealN(5);if(steps.includes(vpBestHold(h).step))return h}return dealN(5)}
