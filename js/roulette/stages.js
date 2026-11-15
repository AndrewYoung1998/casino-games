"use strict";
/* Roulette — lessons and drills for all 5 stages. */
/* Random inside bet of a given size, for the layout drills. */
function randomInside(size){
 if(size===1){const n=1+rnd(36);return[n]}
 if(size===2){for(;;){const n=1+rnd(36);if(Math.random()<.5&&n<=33)return[n,n+3];if(columnOf(n)<3)return[n,n+1]}}
 if(size===3){const r=rnd(12);return[r*3+1,r*3+2,r*3+3]}
 if(size===4){for(;;){const n=1+rnd(32);if(columnOf(n)<3)return[n,n+1,n+3,n+4]}}
 if(size===6){const r=rnd(11);return[1,2,3,4,5,6].map(i=>r*3+i)}
}
const TYPE_CHOICES=[{v:'1',l:'Straight up'},{v:'2',l:'Split'},{v:'3',l:'Street'},{v:'4',l:'Corner'},{v:'6',l:'Six line'},{v:'12',l:'Dozen / Column'},{v:'18',l:'Even money'}];
const PAY_TABLE=`<table><tr><th>Bet</th><th>Numbers</th><th>Pays</th></tr><tr><td>Straight up</td><td>1</td><td class="n">35 : 1</td></tr><tr><td>Split</td><td>2 side by side</td><td class="n">17 : 1</td></tr><tr><td>Street</td><td>3 in a row</td><td class="n">11 : 1</td></tr><tr><td>Corner</td><td>4 in a square</td><td class="n">8 : 1</td></tr><tr><td>Six line</td><td>2 rows (6)</td><td class="n">5 : 1</td></tr><tr><td>Dozen / Column</td><td>12</td><td class="n">2 : 1</td></tr><tr><td>Red/Black · Odd/Even · 1–18/19–36</td><td>18</td><td class="n">1 : 1</td></tr></table>`;
const STAGES=[
{id:'layout',level:'Beginner',title:'Wheel & Layout',blurb:'Colors, dozens and columns: read the table at a glance.',goal:'Goal: 85% on 20 questions.',
lesson:`<h3>Two wheels</h3><table><tr><th>Wheel</th><th>Pockets</th><th>House edge</th></tr><tr><td><b>European</b> (single zero)</td><td>0, 1–36 = 37</td><td class="pos">2.70%</td></tr><tr><td><b>American</b> (double zero)</td><td>0, 00, 1–36 = 38</td><td class="neg">5.26%</td></tr></table>
<h3>The layout</h3><p>The numbers sit in a grid of 3 columns × 12 rows, counting across: 1-2-3, then 4-5-6, and so on. The zeros are green and sit at the top.</p>
<div class="lesson-layout">${layoutHTML({})}</div>
<ul><li><b>Dozens:</b> 1–12, 13–24, 25–36.</li><li><b>Columns:</b> column 1 is 1, 4, 7 … 34, column 2 is 2, 5, 8 … 35, and column 3 is 3, 6, 9 … 36.</li><li><b>Colors:</b> 18 red and 18 black, alternating in a pattern that isn't simply odd/even. 10 and 28 are both black even though their neighbors differ.</li><li>0 and 00 are neither red nor black, odd nor even. That's how the house wins every outside bet when the ball lands on zero.</li></ul>`,
drill(el){runDrill(el,this,{total:20,pass:.85,auto:true,gen(){const n=1+rnd(36),t=pick(['color','color','dozen','column','oddlow']);
 if(t==='color')return{html:`<div class="flash"><span class="bignum">${n}</span></div><p class="ask">What color is ${n}?</p>`,choices:[{v:'red',l:'Red'},{v:'black',l:'Black'}],check:x=>x===colorOf(n),explain:`${numBadge(n)} is <b>${colorOf(n)}</b>.`,reveal:p=>{$('.bignum',p).classList.add(colorOf(n))}};
 if(t==='dozen')return{html:`<div class="flash"><span class="bignum">${n}</span></div><p class="ask">Which dozen?</p>`,choices:[1,2,3].map(d=>({v:String(d),l:OUTSIDE['dz'+d]})),check:x=>+x===dozenOf(n),explain:`${n} is in the <b>${OUTSIDE['dz'+dozenOf(n)]}</b> (${dozenOf(n)*12-11}–${dozenOf(n)*12}).`};
 if(t==='column')return{html:`<div class="flash"><span class="bignum">${n}</span></div><p class="ask">Which column?</p>`,choices:[1,2,3].map(c=>({v:String(c),l:'Column '+c})),check:x=>+x===columnOf(n),explain:`${n} ÷ 3 leaves ${n%3} → <b>column ${columnOf(n)}</b> (${coverage('col'+columnOf(n)).slice(0,3).join(', ')} …).`};
 const z=Math.random()<.2,v=z?0:n;return{html:`<div class="flash"><span class="bignum">${v}</span></div><p class="ask">Does a bet on <b>Even</b> win?</p>`,choices:[{v:'y',l:'Yes'},{v:'n',l:'No'}],check:x=>x===(v&&v%2===0?'y':'n'),explain:v?`${v} is ${v%2?'odd':'even'}.`:'0 is not odd or even for betting. Every even-money bet loses.'}}})}},

{id:'bets',level:'Beginner',title:'Bet Types',blurb:'Name every inside and outside bet from where the chips sit.',goal:'Goal: 85% on 20 bets.',
lesson:`<h3>Inside bets</h3><p>These go on the numbers themselves. Placing a chip on a line or corner between numbers covers all the numbers it touches.</p>${PAY_TABLE}
<h3>Outside bets</h3><p>Dozens, columns and the even-money bets sit around the edge of the layout. They cover more numbers and pay less.</p>
<div class="tip">Shortcut: if a bet covers <i>k</i> numbers, it pays (36 ÷ <i>k</i>) − 1 to 1. Splits: 36 ÷ 2 − 1 = 17.</div>`,
drill(el){runDrill(el,this,{total:20,pass:.85,auto:true,gen(){const size=pick([1,2,2,3,3,4,4,6,6,12,18]);let hl,k;
 if(size<=6)hl=randomInside(size);else if(size===12){k=pick(['dz1','dz2','dz3','col1','col2','col3']);hl=[...coverage(k),k]}else{k=pick(['red','black','even','odd','low','high']);hl=[k]}
 return{html:`<div class="flash"><div class="lesson-layout">${layoutHTML({hl})}</div></div><p class="ask">What bet covers the highlighted area?</p>`,choices:TYPE_CHOICES,check:x=>+x===size,explain:`<b>${BET_NAME[size]}</b>: covers ${size} number${size>1?'s':''} and pays <b>${RATIO[size]}:1</b>.`}}})}},

{id:'payouts',level:'Intermediate',title:'Payouts',blurb:'Pay winning bets fast, from single chips to a full spread.',goal:'Goal: 80% on 14 spins.',
lesson:`${PAY_TABLE}<h3>Winnings vs net</h3><p>A winning bet gets paid its odds <b>and</b> keeps its original chips. $10 straight up that hits wins $350, and the $10 stays yours.</p>
<p>When you have several bets, your <b>net</b> result is the winnings minus the bets that lost:</p><div class="chain">$5 on 17 + $10 on Red + $10 on 2nd 12 · ball lands 17 (black) → +$175 − $10 + $20 = <b>+$185</b></div>
<p>The first questions ask what one winning bet pays. Later ones ask your net result across several bets.</p>`,
drill(el){runDrill(el,this,{total:14,pass:.8,gen(i){
 const mk=()=>{const size=pick([1,2,3,4,6,12,18]);let nums,label;if(size<=6){nums=randomInside(size);label=`${BET_NAME[size]} ${nums.join('-')}`}else{const k=size===12?pick(['dz1','dz2','dz3','col1','col2','col3']):pick(['red','black','even','odd','low','high']);nums=coverage(k);label=OUTSIDE[k]}return{nums,label,amt:pick([5,10,10,20,25])}};
 if(i<6){const b=mk();const w=pick(b.nums);return{type:'number',html:`<div class="info">Bet: <b>$${b.amt}</b> on <b>${b.label}</b></div><div class="flash" style="min-height:90px">Ball lands on&nbsp;${numBadge(w)}</div><p class="ask">How much does it win (not counting the original bet)?</p>`,check:v=>v===b.amt*RATIO[b.nums.length],explain:`${BET_NAME[b.nums.length]} pays ${RATIO[b.nums.length]}:1 → $${b.amt} × ${RATIO[b.nums.length]} = <b>$${b.amt*RATIO[b.nums.length]}</b>.`}}
 const bets=[mk(),mk(),...(Math.random()<.5?[mk()]:[])];const pool=bets.flatMap(b=>b.nums);const w=Math.random()<.8?pick(pool):1+rnd(36);const r=settleBets(bets,w);
 return{type:'number',html:`<div class="betlist">${bets.map(b=>`<div><b>$${b.amt}</b> on ${b.label}</div>`).join('')}</div><div class="flash" style="min-height:80px">Ball lands on&nbsp;${numBadge(w)}</div><p class="ask">Your net result in dollars?</p>`,check:v=>v===r.net,explain:`<b>${r.net>=0?'+':'−'}$${Math.abs(r.net)}</b><br>${r.lines.map(l=>'• '+l).join('<br>')}`}}})}},

{id:'odds',level:'Intermediate',title:'Odds & Myths',blurb:'House edge, betting systems and the gambler’s fallacy.',goal:'Goal: 80% on 10 questions.',
lesson:`<h3>Where the edge comes from</h3><p>A straight-up bet wins 1 time in 37 on a European wheel, which would be fair at 36:1. The casino pays 35:1. That one-unit gap is the <b>house edge</b>: 1 ÷ 37 = <b>2.70%</b>. On an American wheel it's 2 ÷ 38 = <b>5.26%</b>.</p>
<ul><li><b>Every bet has the same edge</b> on a given wheel. The one exception is the American top-line bet (0-00-1-2-3) at 7.89%.</li><li><b>La Partage / En Prison</b> rules (some single-zero tables) return half of an even-money bet when 0 hits, cutting that bet's edge to 1.35%.</li><li><b>Betting systems don't work.</b> Martingale (double after each loss) trades many small wins for rare huge losses at the table limit, and the edge is unchanged.</li><li><b>The wheel has no memory.</b> After 10 reds in a row, red is exactly as likely as ever.</li><li>Expected loss = total amount bet × house edge. $10 a spin for 100 spins on an American wheel is about $53 on average.</li></ul>`,
drill(el){const Q=shuffle([
 {q:'How many pockets does an American wheel have?',c:['36','37','38','40'],a:'38',e:'0, 00 and 1–36 = 38.'},
 {q:'House edge on a single-zero (European) wheel?',c:['1.35%','2.70%','5.26%','7.89%'],a:'2.70%',e:'1 ÷ 37 = 2.70%.'},
 {q:'House edge on a double-zero (American) wheel?',c:['2.70%','4.00%','5.26%','7.89%'],a:'5.26%',e:'2 ÷ 38 = 5.26%.'},
 {q:'Which is the worst bet on an American table?',c:['Straight up','Red','Top line 0-00-1-2-3','Column'],a:'Top line 0-00-1-2-3',e:'It covers 5 numbers but pays 6:1, a 7.89% edge.'},
 {q:'Red just hit 8 times in a row on a European wheel. Chance the next spin is red?',c:['Lower than usual','18/37 (48.6%), same as always','Higher than usual','50%'],a:'18/37 (48.6%), same as always',e:'Spins are independent. Believing otherwise is the gambler’s fallacy.'},
 {q:'Does the Martingale (double after every loss) beat roulette?',c:['Yes, eventually you always win','No: it risks big losses and the edge is unchanged','Only on European wheels','Only with even-money bets'],a:'No: it risks big losses and the edge is unchanged',e:'A losing streak hits the table limit or your bankroll, wiping out many small wins.'},
 {q:'With La Partage, a $20 Red bet when 0 hits…',c:['Loses $20','Returns $10','Pushes','Wins $20'],a:'Returns $10',e:'Half the even-money bet comes back, which halves the edge to 1.35%.'},
 {q:'Betting on 18 numbers vs 1 number on the same wheel. Which has the lower house edge?',c:['18 numbers','1 number','They are the same','Depends on the color'],a:'They are the same',e:'Every bet carries the same edge. Only the swings (variance) differ.'},
 {q:'Expected loss betting $10 per spin for 100 spins on an American wheel?',c:['About $5','About $27','About $53','About $100'],a:'About $53',e:'$1,000 total bet × 5.26% ≈ $53.'},
 {q:'Why does a 35:1 straight-up payout still favor the house?',c:['The ball is weighted','True odds are 36:1 on a 37-pocket wheel','Dealers can aim','Payouts are taxed'],a:'True odds are 36:1 on a 37-pocket wheel',e:'Fair pay would be 36:1. The missing unit is the edge.'},
 {q:'Which wheel should you choose if both are available?',c:['American','European (single zero)','Either, same odds','Whichever is hot'],a:'European (single zero)',e:'It has half the house edge: 2.70% vs 5.26%.'}]);
 runDrill(el,this,{total:10,pass:.8,gen(i){const x=Q[i%Q.length];return{html:`<p class="info big" style="font-size:1.1rem">${x.q}</p>`,choices:x.c.map(c=>({v:c,l:c})),check:v=>v===x.a,explain:x.e}}})}},

{id:'wheel',level:'Advanced',title:'Spin the Wheel',blurb:'Place real bets on a live layout, spin, and settle the payout yourself.',goal:'Pass: 10+ spins with bets, settling at least 80% of payouts correctly.',
settings:[{k:'wheel',label:'Wheel',opts:[['eu','European (0)'],['us','American (0, 00)']],def:'eu'},{k:'chip',label:'Chip',opts:[[1,'$1'],[5,'$5'],[25,'$25']],def:5}],
lesson:`<h3>Your own table</h3><p>You start with a $500 practice bankroll. Tap the layout to place chips on numbers or outside bets, and tap again to stack more. Then spin.</p>
<p>After each spin, <b>you</b> settle the bets: enter your net result before the dealer pays. Payout math is the skill real dealers drill.</p>
<p>Switch between European and American wheels in the settings and watch the gap between them in your results.</p>
<p class="small">Inside bets here are straight-up numbers. Splits, streets and corners are drilled in stages 2–3.</p>`,
drill(el){rouTable(el,this)}}
];
