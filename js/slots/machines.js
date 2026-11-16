"use strict";
/* Slots — the math behind every machine. Pure functions with no DOM, so the RTP
   figures shown in the game can be checked by simulation (SLOT_RNG is swappable).
   Machines: classic (3-reel, 1 line), fiesta (5x3, 20 lines, wilds, free spins),
   temple (243 ways, tumbling reels, rising multiplier), dragon (243 ways + Hold & Spin). */
let SLOT_RNG=Math.random;
const sr=n=>Math.floor(SLOT_RNG()*n);
/* weighted pick: w is an array of weights → index */
function wpick(w){let t=0;for(const x of w)t+=x;let r=SLOT_RNG()*t;for(let i=0;i<w.length;i++){r-=w[i];if(r<0)return i}return w.length-1}
/* fixed-seed shuffle so reel strips are identical on every load */
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function stripFrom(counts,seed){const r=seeded(seed),a=[];for(const[k,n]of Object.entries(counts))for(let i=0;i<n;i++)a.push(k);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 // avoid identical neighbours so the window looks varied
 for(let i=1;i<a.length;i++)if(a[i]===a[i-1]){const j=(i+2)%a.length;[a[i],a[j]]=[a[j],a[i]]}return a}

/* ======================= 1. Liberty 7s — classic 3-reel ======================= */
/* Each reel has 22 physical stops (11 symbols, 11 blanks). Each stop has a weight on a
   64-entry "virtual reel": the RNG picks a virtual stop, which maps to a physical one.
   Blanks right next to the 7 carry extra weight, which is how classic machines make
   near misses look common. */
const CL_SYMS=['7','B3','B2','B1','CH'];
const CL_REELS=[
 {s:['7','B1','CH','B2','B1','B3','B1','CH','B2','B1','B3'],weights:[1,6,4,2,4,2,3,2,4,2,3,2,4,2,4,1,3,1,4,1,3,6]},
 {s:['7','B1','B2','CH','B1','B3','B2','B1','CH','B1','B3'],weights:[1,6,4,3,3,3,1,3,4,2,3,2,3,2,4,2,1,2,4,2,3,6]},
 {s:['7','B1','B3','B1','CH','B2','B1','B3','B2','B1','CH'],weights:[1,6,4,3,3,3,4,3,1,2,3,2,4,2,3,2,3,2,4,2,1,6]}
];
/* physical strip: symbol, blank, symbol, blank … ; weights are in the same order and sum to 64 */
CL_REELS.forEach(r=>{r.strip=r.s.flatMap(x=>[x,'BL'])});
const isBar=s=>s==='B1'||s==='B2'||s==='B3';
/* pays per coin for a 3-symbol line; 777 at max coins pays 1000 instead of 600 */
function classicPay(l,coins=1){
 const [a,b,c]=l;
 if(a==='7'&&b==='7'&&c==='7')return coins===3?2500:500*coins;
 if(a===b&&b===c&&a==='B3')return 50*coins;
 if(a===b&&b===c&&a==='B2')return 25*coins;
 if(a===b&&b===c&&a==='CH')return 10*coins;
 if(a===b&&b===c&&a==='B1')return 10*coins;
 if(isBar(a)&&isBar(b)&&isBar(c))return 5*coins;
 const ch=l.filter(x=>x==='CH').length;
 return (ch===2?5:ch===1?2:0)*coins;
}
const CL_PAYTABLE=[['7 7 7','500 / 1000 / 2500'],['3BAR ×3','50'],['2BAR ×3','25'],['BAR ×3','10'],['Cherry ×3','10'],['Any 3 bars','5'],['Any 2 cherries','5'],['Any 1 cherry','2']];
function classicSpin(){const stops=CL_REELS.map(r=>wpick(r.weights));return{stops,line:stops.map((s,i)=>CL_REELS[i].strip[s])}}
/* visible window for reel i at stop s: [above, payline, below] */
const classicWindow=(i,s)=>{const st=CL_REELS[i].strip,n=st.length;return[st[(s-1+n)%n],st[s],st[(s+1)%n]]};

/* ======================= 2. Fruit Fiesta — 5×3 video slot, 20 lines ======================= */
const FI_LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,2,1],
 [1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0],[2,2,0,2,2],[0,2,0,2,0]];
/* pays per line bet for 3 / 4 / 5 in a row from the left reel */
const FI_PAYS={D:[75,375,1500],B:[40,150,600],M:[25,75,300],G:[15,45,180],O:[7,30,120],L:[6,25,90],C:[3,15,60]};
const FI_SCAT=[0,0,0,2,10,50]; // × total bet for 3/4/5 scatters anywhere
const FI_FREE=10,FI_FREE_MULT=3;
const FI_STRIPS=[
 stripFrom({D:2,B:3,M:4,G:5,O:6,L:6,C:7,S:1},11),
 stripFrom({D:2,B:3,M:4,G:5,O:6,L:6,C:7,W:2,S:1},22),
 stripFrom({D:2,B:3,M:4,G:5,O:6,L:6,C:7,W:2,S:1},33),
 stripFrom({D:2,B:3,M:4,G:5,O:6,L:6,C:7,W:2,S:1},44),
 stripFrom({D:2,B:3,M:4,G:5,O:6,L:6,C:7,S:1},55)];
/* grid[reel][row] */
function stripWindow(strip,s,rows=3){const n=strip.length;return Array.from({length:rows},(_,k)=>strip[(s+k)%n])}
function fiestaGrid(){return FI_STRIPS.map(st=>stripWindow(st,sr(st.length)))}
/* evaluate one line: returns {sym,len,pay} (pay per line bet) */
function fiestaLine(grid,line){
 let sym=null,len=0;
 for(let r=0;r<5;r++){const s=grid[r][line[r]];
  if(s==='S')break;
  if(s==='W'){len++;continue}
  if(sym===null){sym=s;len++;continue}
  if(s===sym){len++;continue}
  break}
 if(!sym||len<3)return{sym,len,pay:0};
 return{sym,len,pay:FI_PAYS[sym][len-3]};
}
/* full evaluation in units of line bet (total bet = 20 line bets) */
function fiestaEval(grid){
 const wins=[];let lineSum=0;
 FI_LINES.forEach((l,i)=>{const w=fiestaLine(grid,l);if(w.pay){wins.push({line:i,sym:w.sym,len:w.len,pay:w.pay});lineSum+=w.pay}});
 const sc=[];grid.forEach((col,r)=>col.forEach((s,k)=>{if(s==='S')sc.push([r,k])}));
 const scatPay=FI_SCAT[Math.min(sc.length,5)]*20;
 return{wins,lineSum,scat:sc,scatPay,free:sc.length>=3?FI_FREE:0,total:lineSum+scatPay};
}

/* ======================= 3. Temple Tumble — 243 ways with tumbling reels ======================= */
/* Any symbol on adjacent reels from the left pays. Ways = product of matching symbols per reel.
   Winning symbols vanish, the rest fall, new ones drop in, and each tumble raises the multiplier. */
const TE_PAYS={K:[13,40,170],A:[8,27,100],G:[5,17,67],R:[3,9,30],Y:[2,8,22],N:[2,5,17],U:[1,4,13]}; // per 1/20 of bet, 3/4/5 reels
const TE_W=[
 {K:3,A:4,G:5,R:8,Y:9,N:10,U:11,S:2},
 {K:3,A:4,G:5,R:8,Y:9,N:10,U:11,S:0},
 {K:3,A:4,G:5,R:8,Y:9,N:10,U:11,S:2},
 {K:3,A:4,G:5,R:8,Y:9,N:10,U:11,S:0},
 {K:3,A:4,G:5,R:8,Y:9,N:10,U:11,S:2}];
const TE_MULT=[1,2,3,5],TE_FMULT=[3,6,9,15],TE_FREE=10;
function teCell(r,free){const w=TE_W[r],ks=Object.keys(w).filter(k=>!(free&&k==='S'));return ks[wpick(ks.map(k=>w[k]))]}
function templeGrid(free){return Array.from({length:5},(_,r)=>Array.from({length:3},()=>teCell(r,free)))}
/* ways evaluation shared with Dragon's Hoard. pays: table, skip: symbols that never pay */
function waysEval(grid,pays,wild){
 const wins=[];let sum=0;
 for(const s of Object.keys(pays)){
  let len=0,ways=1;const cells=[];
  for(let r=0;r<grid.length;r++){const hit=[];grid[r].forEach((x,k)=>{if(x===s||(wild&&x===wild))hit.push([r,k])});if(!hit.length)break;len++;ways*=hit.length;cells.push(...hit)}
  if(len>=3){const p=pays[s][len-3]*ways;wins.push({sym:s,len,ways,pay:p,cells});sum+=p}
 }
 return{wins,sum};
}
/* run one full tumble sequence. Returns steps for the animation plus totals (units: bet/20). */
function templeSpin(free=false){
 let grid=templeGrid(free);const steps=[];let total=0,level=0;
 const ladder=free?TE_FMULT:TE_MULT;
 for(;;){
  const ev=waysEval(grid,TE_PAYS);
  if(!ev.wins.length){steps.push({grid:grid.map(c=>c.slice()),wins:[],mult:ladder[Math.min(level,3)],win:0});break}
  const mult=ladder[Math.min(level,3)],win=ev.sum*mult;total+=win;
  const gone=new Set();ev.wins.forEach(w=>w.cells.forEach(([r,k])=>gone.add(r+','+k)));
  steps.push({grid:grid.map(c=>c.slice()),wins:ev.wins,mult,win,gone:[...gone]});
  // tumble: keep survivors (bottom-aligned), fill new from the top
  const next=grid.map((col,r)=>{const keep=col.filter((x,k)=>!gone.has(r+','+k));const n=3-keep.length;return[...Array.from({length:n},()=>teCell(r,free)),...keep]});
  grid=next;level++;
 }
 const final=steps[steps.length-1].grid;let sc=0;final.forEach(c=>c.forEach(x=>{if(x==='S')sc++}));
 return{steps,total,scatters:sc,free:!free&&sc>=3?TE_FREE:0};
}

/* ======================= 4. Dragon's Hoard — 243 ways + Hold & Spin ======================= */
const DR_PAYS={D:[28,90,330],L:[17,55,165],E:[11,33,110],A:[5,13,44],K:[3,11,33],Q:[3,9,28],J:[2,7,22]};
const DR_W={D:3,L:4,E:5,A:8,K:9,Q:10,J:11,W:0};
const DR_WILDW=[0,3,3,3,0]; // wild dragon pearl on reels 2-4
const DR_COIN_P=0.12,DR_TRIGGER=6,DR_RESPIN_P=0.06,DR_GRAND=1000;
/* coin values in multiples of total bet; jackpots are strings */
const DR_COINS=[[1,30],[2,24],[3,16],[5,11],[8,7],[10,5],[15,3],['MINI',1.6],['MINOR',.45],['MAJOR',.08]];
const DR_JP={MINI:20,MINOR:50,MAJOR:200,GRAND:DR_GRAND};
const coinValue=v=>typeof v==='number'?v:DR_JP[v];
function drCoin(){return{coin:DR_COINS[wpick(DR_COINS.map(c=>c[1]))][0]}}
function drCell(r){if(SLOT_RNG()<DR_COIN_P)return drCoin();const ks=Object.keys(DR_W),w=ks.map(k=>k==='W'?DR_WILDW[r]:DR_W[k]);return ks[wpick(w)]}
function dragonGrid(){return Array.from({length:5},(_,r)=>Array.from({length:3},()=>drCell(r)))}
function dragonEval(grid){
 const plain=grid.map(c=>c.map(x=>typeof x==='object'?'$':x));
 const ev=waysEval(plain,DR_PAYS,'W');
 let coins=0;grid.forEach(c=>c.forEach(x=>{if(typeof x==='object')coins++}));
 return{wins:ev.wins,sum:ev.sum,coins,trigger:coins>=DR_TRIGGER};
}
/* Hold & Spin feature: coins lock, 3 respins, each new coin resets to 3. Returns frames for animation. */
function holdAndSpin(grid){
 const board=grid.map(c=>c.map(x=>typeof x==='object'?x:null));
 const frames=[];let left=3;
 while(left>0){
  const landed=[];
  board.forEach((c,r)=>c.forEach((x,k)=>{if(!x&&SLOT_RNG()<DR_RESPIN_P){board[r][k]=drCoin();landed.push([r,k])}}));
  left=landed.length?3:left-1;
  frames.push({board:board.map(c=>c.slice()),landed,left});
  if(board.every(c=>c.every(x=>x)))break;
 }
 const full=board.every(c=>c.every(x=>x));
 let sum=0;board.forEach(c=>c.forEach(x=>{if(x)sum+=coinValue(x.coin)}));
 if(full)sum+=DR_GRAND;
 return{frames,sum,full};
}

/* ======================= simulation helpers (used by tests and the volatility lesson) ======================= */
/* one complete spin's return as a multiple of total bet (free spins and features included) */
const SIM={
 classic(coins=1){return classicPay(classicSpin().line,coins)/coins},
 fiesta(){const ev=fiestaEval(fiestaGrid());let x=ev.total/20,free=ev.free;while(free>0){free--;const f=fiestaEval(fiestaGrid());x+=f.total/20*FI_FREE_MULT;free+=f.free}return x},
 temple(){const s=templeSpin(false);let x=s.total/20;for(let i=0;i<s.free;i++)x+=templeSpin(true).total/20;return x},
 dragon(){const g=dragonGrid(),ev=dragonEval(g);let x=ev.sum/20;if(ev.trigger)x+=holdAndSpin(g).sum;return x}
};
if(typeof module!=='undefined')module.exports={SIM,classicPay,classicSpin,CL_REELS,fiestaEval,fiestaGrid,fiestaLine,FI_LINES,FI_PAYS,FI_STRIPS,templeSpin,waysEval,dragonGrid,dragonEval,holdAndSpin,setRNG:f=>{SLOT_RNG=f}};

/* published figures — exact for Liberty 7s, 6-million-spin simulations for the rest
   (hit = any win; ldw = "loss disguised as a win": a win smaller than the bet; net = win bigger than the bet) */
const SLOT_INFO={
 classic:{rtp:93.6,vol:'Low–medium',sd:2.6,hit:26.3,ldw:0,net:26.3,top:'2,500 coins (3-coin 7 7 7)'},
 fiesta:{rtp:95.8,vol:'Medium',sd:3.4,hit:49.7,ldw:27.4,net:22.0,top:'1,500× line bet + free spins at 3×'},
 temple:{rtp:95.7,vol:'Medium–high',sd:4.6,hit:39.4,ldw:23.3,net:15.6,top:'Tumbles up to 5× (15× in free spins)'},
 dragon:{rtp:95.5,vol:'High',sd:6.5,hit:41.7,ldw:23.2,net:18.1,top:'GRAND jackpot 1,000× bet'}
};
if(typeof module!=='undefined')module.exports.SLOT_INFO=SLOT_INFO;
