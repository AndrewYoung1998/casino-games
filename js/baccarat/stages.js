"use strict";
/* Baccarat — lessons and drills for all 5 stages. */
const TABLEAU=`<table><tr><th>Banker total</th><th>Banker draws when Player's 3rd card is…</th><th>Stands on</th></tr>
<tr><td>0, 1, 2</td><td>anything</td><td>—</td></tr><tr><td>3</td><td>0–7, 9</td><td>8</td></tr><tr><td>4</td><td>2–7</td><td>0, 1, 8, 9</td></tr><tr><td>5</td><td>4–7</td><td>0–3, 8, 9</td></tr><tr><td>6</td><td>6–7</td><td>0–5, 8, 9</td></tr><tr><td>7</td><td>never</td><td>always</td></tr></table>`;
const totalChoices=()=>Array.from({length:10},(_,i)=>({v:String(i),l:String(i)}));
const STAGES=[
{id:'totals',level:'Beginner',title:'Hand Totals',blurb:'Count like a baccarat dealer: tens are zero, only the last digit counts.',goal:'Goal: 90% on 20 hands.',
lesson:`<h3>Card values</h3><table><tr><th>Card</th><th>Value</th></tr><tr><td>Ace</td><td>1</td></tr><tr><td>2 – 9</td><td>Face value</td></tr><tr><td>10, J, Q, K</td><td>0</td></tr></table>
<h3>Only the last digit counts</h3><p>Add the cards and drop the tens digit. Totals always run from 0 to 9, and 9 is the best.</p><div class="chain">7 + 8 = 15 → <b>5</b> · K + 9 = 9 → <b>9</b> · 6 + 6 + 9 = 21 → <b>1</b></div>
<ul><li>You can never bust. 9 + 9 is just 8.</li><li>A two-card 8 or 9 is called a <b>natural</b>.</li></ul><p class="tip">Keys 1–9 answer 0–8, and 0 answers 9.</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(i){const n=i<10?2:pick([2,3]);const h=dealN(n),t=btotal(h),s=h.reduce((a,c)=>a+bv(c),0);
 return{html:`<div class="flash">${bacHand(h,'big deal')}</div><p class="ask">What is the baccarat total?</p>`,choices:totalChoices(),check:x=>+x===t,explain:`${h.map(c=>`${c.r}(${bv(c)})`).join(' + ')} = ${s}${s>=10?` → drop the tens → <b>${t}</b>`:` → <b>${t}</b>`}`}}})}},

{id:'player',level:'Beginner',title:'Naturals & Player’s Rule',blurb:'When the coup ends at once, and when Player takes a card.',goal:'Goal: 90% on 20 deals.',
lesson:`<h3>Step 1: check for a natural</h3><p>Both hands get two cards. If <b>either</b> hand totals 8 or 9, that's a natural. Both hands stand and the coup is over.</p>
<h3>Step 2: Player's rule</h3><table><tr><th>Player total</th><th>Action</th></tr><tr><td>0 – 5</td><td class="pos"><b>Draws</b> a third card</td></tr><tr><td>6 – 7</td><td><b>Stands</b></td></tr><tr><td>8 – 9</td><td>Natural, so the coup is over</td></tr></table>
<p>Player always acts before Banker, and nobody makes a choice. The dealer follows these rules exactly.</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const deck=makeShoe(1);let P=deck.slice(0,2),B=deck.slice(2,4);if(Math.random()<.35)P=handWithTotal(pick([5,6,7,8,9]));
 const pt=btotal(P),bt=btotal(B),nat=pt>=8||bt>=8,a=nat?'N':playerDraws(pt)?'D':'S';
 return{html:`<div class="mini-table"><div><div class="lbl">Player</div>${bacHand(P)}</div><div><div class="lbl">Banker</div>${bacHand(B)}</div></div><p class="ask">What happens next?</p>`,
 choices:[{v:'N',l:'Natural — both stand'},{v:'D',l:'Player draws'},{v:'S',l:'Player stands'}],check:x=>x===a,
 explain:`Player ${pt}, Banker ${bt}. ${nat?`${pt>=8&&bt>=8?'Both hands have':pt>=8?'Player has':'Banker has'} a natural (8 or 9) → <b>both stand</b>.`:`No natural. Player ${pt} → <b>${a==='D'?'draws (0–5)':'stands (6–7)'}</b>.`}`}}})}},

{id:'banker',level:'Intermediate',title:'Banker’s Rule',blurb:'The famous drawing chart, drilled until it’s automatic.',goal:'Goal: 85% on 25 deals.',
lesson:`<h3>If Player stood</h3><p>Banker uses Player's rule: draw on 0–5, stand on 6–7.</p>
<h3>If Player drew a third card</h3><p>Banker's decision depends on Banker's total <b>and the value of Player's third card</b>:</p>${TABLEAU}
<h3>Memory trick</h3><p>Read it as a ladder. As Banker's total goes up by one, the range of Player cards that make Banker draw starts higher:</p>
<div class="chain">3 → all but 8 · 4 → 2-7 · 5 → 4-7 · 6 → 6-7 · 7 → stand</div>`,
drill(el){runDrill(el,this,{total:25,pass:.85,gen(){const stood=Math.random()<.2;const bt=stood?pick([3,4,5,6,7]):pick([0,1,2,3,3,4,4,4,5,5,5,6,6,6,7]);const B=handWithTotal(bt);
 let html,p3=null;if(stood){const pt=pick([6,7]);html=`<div class="mini-table"><div><div class="lbl">Player · stood on ${pt}</div>${bacHand(handWithTotal(pt))}</div><div><div class="lbl">Banker · ${bt}</div>${bacHand(B)}</div></div>`}
 else{const P=handWithTotal(pick([0,1,2,3,4,5]));const c3=pick(RANKS.map(r=>({r,s:pick(SUITS)})));p3=bv(c3);P.push(c3);html=`<div class="mini-table"><div><div class="lbl">Player · drew a ${p3}</div>${bacHand(P)}</div><div><div class="lbl">Banker · ${bt}</div>${bacHand(B)}</div></div>`}
 const a=bankerDraws(bt,p3)?'D':'S';
 return{html:html+'<p class="ask">Does Banker draw?</p>',choices:[{v:'D',l:'Banker draws'},{v:'S',l:'Banker stands'}],check:x=>x===a,explain:bankerReason(bt,p3)}}})}},

{id:'payouts',level:'Intermediate',title:'Winners & Payouts',blurb:'Call the winner and settle the bet, commission included.',goal:'Goal: 80% on 12 coups.',
lesson:`<h3>Payouts</h3><table><tr><th>Bet</th><th>Pays</th><th>On a tie</th><th>House edge</th></tr><tr><td><b>Player</b></td><td>1 : 1</td><td>Push</td><td>1.24%</td></tr><tr><td><b>Banker</b></td><td>1 : 1 minus 5% commission (0.95 : 1)</td><td>Push</td><td>1.06%</td></tr><tr><td><b>Tie</b></td><td>8 : 1</td><td>Wins</td><td>14.36%</td></tr></table>
<h3>Examples</h3><div class="chain">$100 on Banker, Banker wins → +$95 · $100 on Player, it's a tie → $0 · $20 on Tie, tie → +$160</div>
<p>Answer with your <b>net</b> result. Use the − button for a loss.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,gen(){let c;for(let i=0;i<50;i++){c=dealCoup(makeShoe(1));if(c.winner==='T'||Math.random()<.8)break}
 const side=pick(['P','B','B','T']),amt=side==='T'?pick([10,20,25]):pick([20,40,100,200]),net=bacSettle(side,amt,c.winner);
 return{type:'number',html:`<div class="info">Your bet: <b>$${amt}</b> on <b>${WIN_NAME[side]}</b></div><div class="mini-table"><div><div class="lbl">Player</div>${bacHand(c.P)}</div><div><div class="lbl">Banker</div>${bacHand(c.B)}</div></div><p class="ask">Net result in dollars?</p>`,
 check:v=>v===net,explain:`Player ${c.pt}, Banker ${c.bt} → <b>${c.winner==='T'?'Tie':WIN_NAME[c.winner]+' wins'}</b>. ${side==='B'&&c.winner==='B'?`Banker pays 0.95 × $${amt}`:side==='T'&&c.winner==='T'?`Tie pays 8 × $${amt}`:c.winner==='T'?'Player and Banker bets push on a tie':side===c.winner?`Player pays 1 × $${amt}`:'Your bet loses'} → <b>${net>=0?'+':'−'}$${Math.abs(net)}</b>.`}}})}},

{id:'shoe',level:'Advanced',title:'Deal the Shoe',blurb:'A live eight-deck shoe. Bet, then call every draw before the dealer does.',goal:'Pass: 20+ coups with at least 90% of draw calls correct.',
settings:[{k:'unit',label:'Chip size',opts:[[10,'$10'],[25,'$25'],[100,'$100']],def:25}],
lesson:`<h3>Run the table</h3><p>An eight-deck shoe with a $1,000 practice bankroll. Each coup:</p><ol><li>Place a bet on Player, Banker or Tie (or skip betting).</li><li>The first four cards are dealt. Call what happens: natural, Player draws, or Player stands.</li><li>If the coup continues, call whether <b>Banker draws</b>.</li><li>The dealer finishes the coup and settles your bet.</li></ol>
<p>The <b>bead road</b> tracks results the way casino scoreboards do.</p><div class="tip">Scoreboards make streaks look meaningful, but every coup is independent. Patterns don't predict the next result. Banker is still the best bet and Tie still the worst.</div>
<p class="small">Keys: P/B/T to bet, Enter to deal, 1–3 to answer.</p>`,
drill(el){bacTable(el,this)}}
];
