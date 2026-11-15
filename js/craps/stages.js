"use strict";
/* Craps — lessons and drills for all 7 stages. */
const WAYS_TABLE=`<table><tr><th>Total</th>${[2,3,4,5,6,7,8,9,10,11,12].map(t=>`<td><b>${t}</b></td>`).join('')}</tr><tr><th>Ways</th>${[2,3,4,5,6,7,8,9,10,11,12].map(t=>`<td>${WAYS(t)}</td>`).join('')}</tr></table>`;
const dicePrompt=(t,extra='')=>{const[a,b]=diceFor(t);return `${extra}<div class="flash" style="min-height:120px">${diceHTML(a,b,'big tumble')}</div>`};
const puck=p=>`<span class="puck ${p?'on':''}">${p?'ON '+p:'OFF'}</span>`;
const STAGES=[
{id:'dice',level:'Beginner',title:'Dice Math',blurb:'36 combinations decide everything. Learn why 7 rules the table.',goal:'Goal: 85% on 15 questions.',
lesson:`<h3>Two dice, 36 combinations</h3><p>Each die has 6 faces, so two dice can land 36 ways. Totals in the middle can be made more ways than totals at the edges:</p>${WAYS_TABLE}
<ul><li><b>7 is the most common total</b>: 6 ways out of 36, or 1 roll in 6.</li><li>2 and 12 are the rarest, with 1 way each.</li><li>The table is symmetric: 6 and 8 have 5 ways each, 5 and 9 have 4, and 4 and 10 have 3.</li><li><b>Odds against</b> a number before a 7 compares its ways to 7's six: 4 vs 7 is 3 ways against 6, so 2 to 1 against.</li></ul>`,
drill(el){runDrill(el,this,{total:15,pass:.85,auto:true,gen(){
 if(Math.random()<.7){const t=2+rnd(11);return{html:`<div class="flash" style="min-height:100px"><span class="bigtotal">${t}</span></div><p class="ask">How many ways can two dice make ${t}?</p>`,choices:[1,2,3,4,5,6].map(v=>({v:String(v),l:String(v)})),check:x=>+x===WAYS(t),explain:`${t} can be rolled <b>${WAYS(t)}</b> way${WAYS(t)>1?'s':''} out of 36.`}}
 const p=pick(POINTS),o={4:'2 to 1',10:'2 to 1',5:'3 to 2',9:'3 to 2',6:'6 to 5',8:'6 to 5'}[p];
 return{html:`<p class="info big">Odds against rolling a <b>${p}</b> before a <b>7</b>?</p>`,choices:['2 to 1','3 to 2','6 to 5','1 to 1'].map(c=>({v:c,l:c})),check:x=>x===o,explain:`7 has 6 ways and ${p} has ${WAYS(p)}, so ${6} : ${WAYS(p)} = <b>${o}</b>.`}}})}},

{id:'comeout',level:'Beginner',title:'The Come-Out Roll',blurb:'The first roll of a round: natural, craps, or a point.',goal:'Goal: 90% on 20 rolls.',
lesson:`<h3>How a round starts</h3><p>A round starts with the <b>come-out roll</b>. The dealer's puck says <b>OFF</b>. Bet the <b>Pass Line</b> before it.</p>
<table><tr><th>Come-out roll</th><th>Pass Line</th></tr><tr><td><b>7 or 11</b> ("natural")</td><td class="pos">Wins even money</td></tr><tr><td><b>2, 3 or 12</b> ("craps")</td><td class="neg">Loses</td></tr><tr><td><b>4, 5, 6, 8, 9, 10</b></td><td>That number becomes the <b>point</b>, and the puck flips ON</td></tr></table>
<p>On the come-out, the Pass Line wins 8 ways (7 and 11) and loses only 4 ways (2, 3, 12).</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const t=pick([7,7,11,2,3,12,4,5,6,8,9,10,4,5,6,8,9,10]),r=passResult(null,t);
 return{html:dicePrompt(t,`<div class="info">Come-out roll ${puck(null)}</div>`)+'<p class="ask">What happens to the Pass Line?</p>',choices:[{v:'win',l:'Pass wins'},{v:'lose',l:'Pass loses'},{v:'point',l:'Point is set'}],check:x=>x===r,
 explain:`Rolled <b>${t}</b>: ${r==='win'?'a natural, so <b>Pass wins</b>.':r==='lose'?'craps, so <b>Pass loses</b>.':`<b>${t} becomes the point</b>. Now the shooter needs another ${t} before a 7.`}`}}})}},

{id:'point',level:'Beginner',title:'Making the Point',blurb:'Once a point is set, it’s the point versus seven.',goal:'Goal: 90% on 20 rolls.',
lesson:`<h3>The point phase</h3><p>With the puck ON, only two numbers matter to the Pass Line:</p><table><tr><th>Roll</th><th>Pass Line</th></tr><tr><td>The point again</td><td class="pos">Wins. The round ends and the next roll is a new come-out</td></tr><tr><td><b>7</b> ("seven-out")</td><td class="neg">Loses, and the dice pass to the next shooter</td></tr><tr><td>Anything else</td><td>Nothing happens; keep rolling</td></tr></table>
<p>2, 3, 11 and 12 don't matter to the Pass Line here, and neither does any other point number.</p>
<table><tr><th>Point</th><th>Chance to make it</th></tr><tr><td>6 or 8</td><td>5 ways vs 6 → 45.5%</td></tr><tr><td>5 or 9</td><td>4 vs 6 → 40.0%</td></tr><tr><td>4 or 10</td><td>3 vs 6 → 33.3%</td></tr></table>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const p=pick(POINTS),t=Math.random()<.3?p:Math.random()<.4?7:2+rnd(11),r=passResult(p,t);
 return{html:dicePrompt(t,`<div class="info">Point ${puck(p)}</div>`)+'<p class="ask">What happens to the Pass Line?</p>',choices:[{v:'win',l:'Pass wins'},{v:'lose',l:'Pass loses'},{v:'none',l:'Nothing — roll again'}],check:x=>x===r,
 explain:`Point is ${p}, rolled <b>${t}</b>: ${r==='win'?'point made, so <b>Pass wins</b>.':r==='lose'?'seven-out, so <b>Pass loses</b>.':'no decision. Only the point or a 7 matters now.'}`}}})}},

{id:'dontcome',level:'Intermediate',title:'Don’t Pass & Come',blurb:'Bet with the dice or against them, at any point in the round.',goal:'Goal: 85% on 16 situations.',
lesson:`<h3>Don't Pass: the opposite bet</h3><table><tr><th>Roll</th><th>Don't Pass</th></tr><tr><td>Come-out 2 or 3</td><td class="pos">Wins</td></tr><tr><td>Come-out <b>12</b></td><td>Push (the "bar 12" rule, which keeps the house edge)</td></tr><tr><td>Come-out 7 or 11</td><td class="neg">Loses</td></tr><tr><td>After a point: 7 first</td><td class="pos">Wins</td></tr><tr><td>After a point: the point first</td><td class="neg">Loses</td></tr></table>
<h3>Come bets</h3><p>A Come bet works like a fresh Pass Line bet made <b>after</b> a point is set. The very next roll is its own come-out:</p><ul><li>7 or 11 → Come wins. 2, 3 or 12 → Come loses.</li><li>Any point number → the bet <b>moves to that number</b> and wins if it repeats before a 7.</li></ul><p><b>Don't Come</b> is the reverse, just as Don't Pass reverses Pass.</p>`,
drill(el){runDrill(el,this,{total:16,pass:.85,auto:true,gen(){const kind=pick(['dco','dpt','come']);
 if(kind==='dco'){const t=pick([2,3,12,12,7,11,4,6,9]),r=dontResult(null,t);return{html:dicePrompt(t,`<div class="info">Don't Pass · come-out ${puck(null)}</div>`)+'<p class="ask">What happens to the Don’t Pass bet?</p>',choices:[{v:'win',l:'Wins'},{v:'lose',l:'Loses'},{v:'push',l:'Pushes'},{v:'point',l:'Point is set'}],check:x=>x===r,explain:`Come-out ${t}: Don't Pass <b>${{win:'wins',lose:'loses',push:'pushes (bar 12)',point:'waits: point set'}[r]}</b>.`}}
 if(kind==='dpt'){const p=pick(POINTS),t=pick([7,7,p,p,2+rnd(11)]),r=dontResult(p,t);return{html:dicePrompt(t,`<div class="info">Don't Pass · point ${puck(p)}</div>`)+'<p class="ask">What happens to the Don’t Pass bet?</p>',choices:[{v:'win',l:'Wins'},{v:'lose',l:'Loses'},{v:'none',l:'Nothing yet'}],check:x=>x===r,explain:`Point ${p}, rolled ${t}: Don't Pass <b>${{win:'wins (7 before the point)',lose:'loses (point made)',none:'waits'}[r]}</b>.`}}
 const p=pick(POINTS),t=pick([7,11,2,3,12,4,5,6,8,9,10,4,5,6,8,9,10]),r=t===7||t===11?'win':[2,3,12].includes(t)?'lose':'move';
 return{html:dicePrompt(t,`<div class="info">New Come bet · point already ${puck(p)}</div>`)+'<p class="ask">What happens to the Come bet?</p>',choices:[{v:'win',l:'Come wins'},{v:'lose',l:'Come loses'},{v:'move',l:'Moves to the number'}],check:x=>x===r,explain:`The Come bet treats this as its own come-out: ${t} → <b>${r==='win'?'wins':r==='lose'?'loses':`moves to the ${t}`}</b>.${r==='win'&&t===7?' (The same 7 is a seven-out for the Pass Line.)':''}`}}})}},

{id:'odds',level:'Intermediate',title:'Odds Bets',blurb:'The only bet in the casino with zero house edge.',goal:'Goal: 80% on 12 payouts.',
lesson:`<h3>Taking odds</h3><p>Once a point is set, you can add an <b>odds bet</b> behind your Pass Line. It wins and loses with your Pass bet, but it's paid at <b>true odds</b>, so the house has no edge on it.</p>
<table><tr><th>Point</th><th>Odds pay</th><th>Bet in multiples of</th></tr><tr><td>4 or 10</td><td class="n">2 : 1</td><td>any amount</td></tr><tr><td>5 or 9</td><td class="n">3 : 2</td><td>$2</td></tr><tr><td>6 or 8</td><td class="n">6 : 5</td><td>$5</td></tr></table>
<div class="chain">$10 Pass + $20 odds, point 5, shooter makes it → $10 + $30 = <b>+$40</b></div>
<p>Many casinos allow "3-4-5x odds": up to 3× your line bet on 4/10, 4× on 5/9 and 5× on 6/8. The more odds you take, the lower the edge on your total action.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,gen(i){const p=pick(POINTS),line=pick([5,10,10,25]),mult=pick([1,2,3]);let odds=line*mult;if([6,8].includes(p))odds=Math.ceil(odds/5)*5;if([5,9].includes(p)&&odds%2)odds+=1;
 const total=i%2===0;const ans=total?line+oddsWin(p,odds):oddsWin(p,odds);
 return{type:'number',html:`<div class="info">Pass <b>$${line}</b> + odds <b>$${odds}</b> · point ${puck(p)}</div><div class="flash" style="min-height:100px">${diceHTML(...diceFor(p),'big tumble')}</div><p class="ask">Shooter made the point. ${total?'Total won on Pass + odds?':'What does the odds bet win?'}</p>`,
 check:v=>v===ans,explain:`Odds on ${p} pay ${ODDS_PAY[p].join(':')}: $${odds} × ${ODDS_PAY[p][0]}/${ODDS_PAY[p][1]} = $${oddsWin(p,odds)}${total?` · plus $${line} on the Pass Line = <b>$${ans}</b>`:` → <b>$${ans}</b>`}.`}}})}},

{id:'place',level:'Advanced',title:'Place, Field & Props',blurb:'Pay the popular bets, and learn which ones to skip.',goal:'Goal: 80% on 14 questions.',
lesson:`<h3>Place bets</h3><p>A place bet picks one point number to roll before a 7. Place bets stay up after they win and are usually "off" on the come-out.</p><table><tr><th>Place</th><th>Pays</th><th>Bet in multiples of</th><th>House edge</th></tr><tr><td>6 or 8</td><td class="n">7 : 6</td><td>$6</td><td class="pos">1.52%</td></tr><tr><td>5 or 9</td><td class="n">7 : 5</td><td>$5</td><td>4.00%</td></tr><tr><td>4 or 10</td><td class="n">9 : 5</td><td>$5</td><td class="neg">6.67%</td></tr></table>
<h3>The Field (one roll)</h3><p>Wins on 2, 3, 4, 9, 10, 11 or 12. The 2 and 12 pay 2:1 and the rest pay 1:1. Loses on 5, 6, 7 or 8. It looks like it covers a lot, but the losing numbers come up more often, giving a 5.56% edge.</p>
<h3>Proposition bets (center of the table)</h3><table><tr><th>Bet</th><th>Pays</th><th>House edge</th></tr><tr><td>Any 7 (one roll)</td><td>4 : 1</td><td class="neg">16.67%</td></tr><tr><td>Any craps (2, 3, 12)</td><td>7 : 1</td><td class="neg">11.11%</td></tr><tr><td>Hard 6 / Hard 8</td><td>9 : 1</td><td class="neg">9.09%</td></tr><tr><td>Yo (11)</td><td>15 : 1</td><td class="neg">11.11%</td></tr></table><div class="tip">Best play: Pass or Don't Pass with full odds, plus Place 6 and 8 if you want more action. Skip the props.</div>`,
drill(el){const Q=[
 {q:'Which bet has the lowest house edge?',c:['Field','Place 6','Any 7','Place 4'],a:'Place 6',e:'Place 6/8: 1.52%. Field 5.56%, Place 4: 6.67%, Any 7: 16.67%.'},
 {q:'Which of these is the worst bet?',c:['Pass Line','Place 8','Any 7','Don’t Pass'],a:'Any 7',e:'Any 7 pays 4:1 on true odds of 5:1, a 16.67% edge.'},
 {q:'Which bet has zero house edge?',c:['Field','Odds behind the line','Hard 8','Place 6'],a:'Odds behind the line',e:'Odds bets pay true odds.'},
 {q:'Is a Place 6 bet working on the come-out roll by default?',c:['Yes','No — it’s off'],a:'No — it’s off',e:'Place bets are off on the come-out unless you call them on.'}];
 runDrill(el,this,{total:14,pass:.8,gen(i){
 if(i%4===3){const x=Q[(i>>2)%Q.length];return{html:`<p class="info big" style="font-size:1.1rem">${x.q}</p>`,choices:x.c.map(c=>({v:c,l:c})),check:v=>v===x.a,explain:x.e}}
 if(Math.random()<.6){const n=pick([6,8,6,8,5,9,4,10]),amt=[6,8].includes(n)?pick([6,12,18,30]):pick([5,10,15,25]),w=placeWin(n,amt);
  return{type:'number',html:`<div class="info">Place <b>${n}</b> for <b>$${amt}</b></div><div class="flash" style="min-height:100px">${diceHTML(...diceFor(n),'big tumble')}</div><p class="ask">A ${n} rolls. How much does it win?</p>`,check:v=>v===w,explain:`Place ${n} pays ${PLACE_PAY[n].join(':')}: $${amt} × ${PLACE_PAY[n][0]}/${PLACE_PAY[n][1]} = <b>$${w}</b>.`}}
 const t=2+rnd(11),amt=pick([5,10,25]),m=FIELD_WIN(t),net=m?amt*m:-amt;
 return{type:'number',html:`<div class="info">Field bet <b>$${amt}</b></div><div class="flash" style="min-height:100px">${diceHTML(...diceFor(t),'big tumble')}</div><p class="ask">Rolled ${t}. Net result?</p>`,check:v=>v===net,explain:m?`${t} is a field number${m===2?' paying 2:1':''} → <b>+$${net}</b>.`:`${t} isn't in the field → <b>−$${amt}</b>.`}}})}},

{id:'table',level:'Expert',title:'Live Dice Table',blurb:'Shoot the dice: line bets, odds, place 6/8 and the field.',goal:'Pass: settle 15+ rolls that have action, at least 80% correctly.',
lesson:`<h3>A full craps table</h3><p>A real layout in 3D with a $500 practice bankroll. Throw the dice across the felt and bet like you would in a casino:</p><ul><li><b>Pass Line / Don't Pass Bar</b> ($10 per tap). On the come-out only.</li><li><b>Odds</b> behind your Pass bet (1×, 2× or 3×) once a point is set.</li><li><b>Come / Don't Come</b> ($10). Once a point is set. The chip travels to the number rolled (red chips are Come, black are Don't Come).</li><li><b>Place 4, 5, 6, 8, 9, 10</b>: tap a point box. Working while a point is on.</li><li><b>Field</b> ($5). One roll; 2 and 12 pay double.</li></ul>
<p>Whenever a roll settles any of your bets, enter your <b>net result for that roll</b> before the dealer pays.</p><p class="small">Keys: R or Enter to throw.</p>`,
 drill(el){crapsTable(el,this)}}
];
