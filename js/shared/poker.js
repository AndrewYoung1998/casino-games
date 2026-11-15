"use strict";
/* Shared — poker hand evaluation for 3-card and 5-card hands.
   Used by Three Card Poker, Video Poker, and later Pai Gow and Hold'em.
   Every evaluator returns {cat, name, score}; compare two hands with cmpScore(a.score, b.score). */
const RANK_VAL={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};
const rv=c=>RANK_VAL[c.r];
const VAL_NAME={2:'Two',3:'Three',4:'Four',5:'Five',6:'Six',7:'Seven',8:'Eight',9:'Nine',10:'Ten',11:'Jack',12:'Queen',13:'King',14:'Ace'};
const plural=v=>v===6?'Sixes':VAL_NAME[v]+'s';
const handStr=cs=>cs.map(c=>c.r+c.s).join(' ');
/* Lexicographic compare of score arrays: >0 means a wins. */
function cmpScore(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0}
/* High card of a straight formed by distinct values (Ace can play low), or 0. */
function straightHigh(vals){
 const u=[...new Set(vals)].sort((a,b)=>b-a);if(u.length!==vals.length)return 0;
 if(u[0]-u[u.length-1]===u.length-1)return u[0];
 if(u[0]===14){const lo=u.slice(1).concat(1);if(lo[0]-lo[lo.length-1]===lo.length-1)return lo[0]}
 return 0;
}
function groups(vals){const m={};vals.forEach(v=>m[v]=(m[v]||0)+1);return Object.entries(m).map(([v,n])=>[+v,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0])}

/* Three-card hands: a straight beats a flush, and three of a kind beats a straight. */
const HAND3=['High card','Pair','Flush','Straight','Three of a kind','Straight flush'];
function eval3(cs){
 const v=cs.map(rv).sort((a,b)=>b-a),flush=cs.every(c=>c.s===cs[0].s),sh=straightHigh(v),g=groups(v);let cat,score;
 if(sh&&flush){cat=5;score=[5,sh]}
 else if(g[0][1]===3){cat=4;score=[4,v[0]]}
 else if(sh){cat=3;score=[3,sh]}
 else if(flush){cat=2;score=[2,...v]}
 else if(g[0][1]===2){cat=1;score=[1,g[0][0],g[1][0]]}
 else{cat=0;score=[0,...v]}
 return{cat,name:HAND3[cat],score};
}

/* Five-card hands, standard rankings. */
const HAND5=['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush','Royal flush'];
function eval5(cs){
 const v=cs.map(rv).sort((a,b)=>b-a),flush=cs.every(c=>c.s===cs[0].s),sh=straightHigh(v),g=groups(v),k=g.map(x=>x[0]);let cat,score;
 if(sh&&flush){cat=sh===14?9:8;score=[cat,sh]}
 else if(g[0][1]===4){cat=7;score=[7,...k]}
 else if(g[0][1]===3&&g[1][1]===2){cat=6;score=[6,...k]}
 else if(flush){cat=5;score=[5,...v]}
 else if(sh){cat=4;score=[4,sh]}
 else if(g[0][1]===3){cat=3;score=[3,...k]}
 else if(g[0][1]===2&&g[1][1]===2){cat=2;score=[2,...k]}
 else if(g[0][1]===2){cat=1;score=[1,...k]}
 else{cat=0;score=[0,...v]}
 return{cat,name:HAND5[cat],score};
}
/* Deal n distinct cards from a fresh deck. */
const dealN=n=>makeShoe(1).slice(0,n);

/* Best five-card hand from 5, 6 or 7 cards (Hold'em). Returns the eval5 result plus .cards (the five used). */
function eval7(cs){
 if(cs.length===5){const e=eval5(cs);e.cards=cs;return e}
 const drop=cs.length-5;let best=null;
 const tryFive=five=>{const e=eval5(five);if(!best||cmpScore(e.score,best.score)>0){best=e;best.cards=five}};
 if(drop===1)for(let a=0;a<cs.length;a++)tryFive(cs.filter((_,i)=>i!==a));
 else for(let a=0;a<cs.length;a++)for(let b=a+1;b<cs.length;b++)tryFive(cs.filter((_,i)=>i!==a&&i!==b));
 return best;
}

/* ---------- build a hand of an exact category (for drills) ----------
   Builds the hand directly instead of searching random deals, so rare hands
   (royal and straight flushes) appear instantly. Always verified with the evaluator. */
const SEQ=['A','2','3','4','5','6','7','8','9','10','J','Q','K','A'];
function distinctRanks(n,exclude=[]){return shuffle(RANKS.filter(r=>!exclude.includes(r))).slice(0,n)}
function buildHand5(cat){
 for(let tries=0;tries<500;tries++){
  const s=pick(SUITS),rs=()=>pick(SUITS);let h;
  if(cat===9)h=['10','J','Q','K','A'].map(r=>({r,s}));
  else if(cat===8){const st=rnd(9);h=SEQ.slice(st,st+5).map(r=>({r,s}))}
  else if(cat===7){const[a,k]=distinctRanks(2);h=[...SUITS.map(x=>({r:a,s:x})),{r:k,s:rs()}]}
  else if(cat===6){const[a,b]=distinctRanks(2);h=[...shuffle([...SUITS]).slice(0,3).map(x=>({r:a,s:x})),...shuffle([...SUITS]).slice(0,2).map(x=>({r:b,s:x}))]}
  else if(cat===5)h=distinctRanks(5).map(r=>({r,s}));
  else if(cat===4){const st=rnd(10);h=SEQ.slice(st,st+5).map(r=>({r,s:rs()}))}
  else if(cat===3){const[a,...k]=distinctRanks(3);h=[...shuffle([...SUITS]).slice(0,3).map(x=>({r:a,s:x})),...k.map(r=>({r,s:rs()}))]}
  else if(cat===2){const[a,b,k]=distinctRanks(3);h=[...shuffle([...SUITS]).slice(0,2).map(x=>({r:a,s:x})),...shuffle([...SUITS]).slice(0,2).map(x=>({r:b,s:x})),{r:k,s:rs()}]}
  else if(cat===1){const[a,...k]=distinctRanks(4);h=[...shuffle([...SUITS]).slice(0,2).map(x=>({r:a,s:x})),...k.map(r=>({r,s:rs()}))]}
  else h=distinctRanks(5).map(r=>({r,s:rs()}));
  if(eval5(h).cat===cat)return shuffle(h);
 }
 return dealN(5);
}
/* Three-card version (Three Card Poker categories: 0 high … 5 straight flush). */
function buildHand3(cat){
 for(let tries=0;tries<500;tries++){
  const s=pick(SUITS),rs=()=>pick(SUITS);let h;
  if(cat===5){const st=rnd(12);h=SEQ.slice(st,st+3).map(r=>({r,s}))}
  else if(cat===4){const a=pick(RANKS);h=shuffle([...SUITS]).slice(0,3).map(x=>({r:a,s:x}))}
  else if(cat===3){const st=rnd(12);h=SEQ.slice(st,st+3).map(r=>({r,s:rs()}))}
  else if(cat===2)h=distinctRanks(3).map(r=>({r,s}));
  else if(cat===1){const[a,k]=distinctRanks(2);h=[...shuffle([...SUITS]).slice(0,2).map(x=>({r:a,s:x})),{r:k,s:rs()}]}
  else h=distinctRanks(3).map(r=>({r,s:rs()}));
  if(eval3(h).cat===cat)return shuffle(h);
 }
 return dealN(3);
}
