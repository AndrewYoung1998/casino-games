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
