"use strict";
/* Three Card Poker — lessons and drills for all 5 stages. */
const TCP_RANK_TABLE=`<table><tr><th>#</th><th>Hand</th><th>Example</th><th>How often</th></tr>
<tr><td>1</td><td><b>Straight flush</b></td><td>Q♥ J♥ 10♥</td><td>0.22%</td></tr>
<tr><td>2</td><td><b>Three of a kind</b></td><td>7♠ 7♦ 7♣</td><td>0.24%</td></tr>
<tr><td>3</td><td><b>Straight</b></td><td>4♦ 5♣ 6♠</td><td>3.26%</td></tr>
<tr><td>4</td><td><b>Flush</b></td><td>K♠ 9♠ 3♠</td><td>4.96%</td></tr>
<tr><td>5</td><td><b>Pair</b></td><td>8♥ 8♣ A♦</td><td>16.94%</td></tr>
<tr><td>6</td><td><b>High card</b></td><td>A♣ 10♦ 6♠</td><td>74.39%</td></tr></table>`;
const STAGES=[
{id:'ranks',level:'Beginner',title:'Hand Rankings',blurb:'Three cards change the rules. Learn why a straight beats a flush.',goal:'Goal: 90% on 20 hands.',
lesson:`<h3>Only three cards</h3><p>With three cards, some hands are rarer than in regular poker, so the order changes. A <b>straight beats a flush</b>, and <b>three of a kind beats a straight</b>.</p>${TCP_RANK_TABLE}
<ul><li>Aces can play high (A-K-Q, the best straight) or low (A-2-3, the lowest straight).</li><li>Q-K-A is a straight, but K-A-2 is not. Straights don't wrap around.</li><li>Within the same hand type, the highest card decides. A pair is compared on the pair first, then the third card.</li></ul>
<p class="tip">On a keyboard, press 1–6 to answer.</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const h=tcpHandOfCat(pick([0,1,1,2,2,3,3,4,5])),cat=eval3(h).cat;
 return{html:`<div class="flash">${tcpHandHTML(h,'big deal')}</div><p class="ask">What hand is this?</p>`,choices:[5,4,3,2,1,0].map(c=>({v:String(c),l:HAND3[c]})),check:x=>+x===cat,explain:`${handStr(h)} is a <b>${HAND3[cat]}</b>.${cat===3&&h.some(c=>c.r==='A')?' Aces can play low or high in a straight.':''}`}}})}},

{id:'showdown',level:'Beginner',title:'Who Wins?',blurb:'Compare your hand to the dealer’s, including kickers and ties.',goal:'Goal: 85% on 15 showdowns.',
lesson:`<h3>Comparing hands</h3><ol><li>The higher-ranked hand type wins (see Stage 1).</li><li>With the same type, compare the highest cards: a <b>pair</b> is compared on the pair rank first, then the third card.</li><li>Straights are compared by their top card. A-K-Q is highest and A-2-3 is lowest.</li><li>If every card matches in rank, it's a <b>tie</b>. Suits never break ties.</li></ol>
<div class="chain">K♠ 9♦ 4♣ vs K♥ 9♣ 2♦ → you win (4 beats 2)</div>`,
drill(el){runDrill(el,this,{total:15,pass:.85,auto:true,gen(){let p,d;
 if(Math.random()<.45){const cat=pick([0,0,1,1,2,3]);p=tcpHandOfCat(cat);for(let i=0;i<5000;i++){d=dealN(3);if(eval3(d).cat===cat&&!d.some(c=>p.some(x=>x.r===c.r&&x.s===c.s)))break}}else{const deck=makeShoe(1);p=deck.slice(0,3);d=deck.slice(3,6)}
 const ep=eval3(p),ed=eval3(d),c=cmpScore(ep.score,ed.score),a=c>0?'P':c<0?'D':'T';
 return{html:`<div class="mini-table"><div><div class="lbl">Dealer</div>${tcpHandHTML(d)}</div><div><div class="lbl">You</div>${tcpHandHTML(p)}</div></div><p class="ask">Who wins?</p>`,choices:[{v:'P',l:'You'},{v:'D',l:'Dealer'},{v:'T',l:'Tie'}],check:x=>x===a,
 explain:`You: <b>${ep.name}</b> · Dealer: <b>${ed.name}</b>. ${ep.cat!==ed.cat?`${(c>0?ep:ed).name} ranks higher.`:c===0?'Every card matches in rank, so it’s a tie.':'Same hand type, so the higher cards decide.'}`}}})}},

{id:'q64',level:'Intermediate',title:'The Q-6-4 Rule',blurb:'The only strategy decision in the game: play or fold.',goal:'Goal: 90% on 25 hands.',
lesson:`<h3>One rule is the whole strategy</h3><p>After seeing your three cards, you either <b>fold</b> and lose your Ante, or <b>play</b> by matching your Ante with a Play bet. The best strategy, worked out by computer:</p>
<div class="tip" style="font-size:1.1rem;text-align:center"><b>Play Q-6-4 or better. Fold anything worse.</b></div>
<table><tr><th>Hand</th><th>Decision</th><th>Why</th></tr><tr><td>Any pair or better</td><td class="pos"><b>Play</b></td><td>Always</td></tr><tr><td>K-x-x, A-x-x</td><td class="pos"><b>Play</b></td><td>Above Q-6-4</td></tr><tr><td>Q-7-2</td><td class="pos"><b>Play</b></td><td>7 beats 6</td></tr><tr><td>Q-6-4, Q-6-5</td><td class="pos"><b>Play</b></td><td>At or above the line</td></tr><tr><td>Q-6-3</td><td class="neg"><b>Fold</b></td><td>3 is below 4</td></tr><tr><td>Q-5-4</td><td class="neg"><b>Fold</b></td><td>5 is below 6</td></tr><tr><td>J-10-9 (not a straight)</td><td class="neg"><b>Fold</b></td><td>Jack-high</td></tr></table>
<h3>How to check fast</h3><ol><li>Pair, flush or straight? <b>Play.</b></li><li>King or Ace high? <b>Play.</b></li><li>Jack-high or lower? <b>Fold.</b></li><li>Queen-high: look at the second card. 7 or higher → play. 5 or lower → fold. Exactly 6 → play only if the third card is 4 or higher.</li></ol>
<p>Playing this way keeps the house edge at its lowest, about 3.37% of the Ante.</p>`,
drill(el){runDrill(el,this,{total:25,pass:.9,auto:true,gen(){const h=Math.random()<.65?tcpBorderline():dealN(3),play=tcpShouldPlay(h),e=eval3(h),v=h.map(rv).sort((a,b)=>b-a);
 return{html:`<div class="flash">${tcpHandHTML(h,'big deal')}</div><p class="ask">Play or fold?</p>`,choices:[{v:'P',l:'Play'},{v:'F',l:'Fold'}],check:x=>x===(play?'P':'F'),
 explain:e.cat?`${e.name} — always <b>play</b>.`:`${v.map(x=>VAL_NAME[x].replace('Queen','Q').replace('King','K').replace('Ace','A').replace('Jack','J')).join('-')} is ${play?'at or above':'below'} Q-6-4 → <b>${play?'play':'fold'}</b>.`}}})}},

{id:'payouts',level:'Intermediate',title:'Payouts',blurb:'Settle Ante, Play, Ante bonus and Pair Plus like a dealer.',goal:'Goal: 80% on 12 hands.',
lesson:`<h3>Three bets, settled separately</h3><table><tr><th>Bet</th><th>When it pays</th></tr><tr><td><b>Ante</b></td><td>1:1 if you win, <b>or</b> if the dealer doesn't qualify</td></tr><tr><td><b>Play</b></td><td>1:1 if you beat a qualifying dealer. Pushes if the dealer doesn't qualify</td></tr><tr><td><b>Ante bonus</b></td><td>Paid on strong hands even if the dealer wins</td></tr><tr><td><b>Pair Plus</b></td><td>Paid on your hand alone, even if you fold</td></tr></table>
<h3>Paytables used here</h3><table><tr><th>Hand</th><th>Ante bonus</th><th>Pair Plus</th></tr><tr><td>Straight flush</td><td>5:1</td><td>40:1</td></tr><tr><td>Three of a kind</td><td>4:1</td><td>30:1</td></tr><tr><td>Straight</td><td>1:1</td><td>6:1</td></tr><tr><td>Flush</td><td>—</td><td>4:1</td></tr><tr><td>Pair</td><td>—</td><td>1:1</td></tr></table>
<h3>Worked example</h3><p>$10 Ante, $10 Play, $5 Pair Plus. You have a <b>straight</b>, and the dealer has K-high, which qualifies, so you win:</p><div class="chain">Pair Plus 6:1 = +$30 · Ante bonus 1:1 = +$10 · Ante +$10 · Play +$10 → <b>+$60</b></div>
<p>Enter your answer as the <b>net</b> result: the total won minus the total lost. Use the − button for a loss.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,gen(){const deck=makeShoe(1);let p=deck.slice(0,3);if(Math.random()<.5)p=tcpHandOfCat(pick([1,2,3,4,5]));const d=makeShoe(1).filter(c=>!p.some(x=>x.r===c.r&&x.s===c.s)).slice(0,3);
 const ante=pick([5,10,25]),pp=pick([0,5,5,10]),played=tcpShouldPlay(p),r=tcpSettle(p,d,ante,pp,played);
 return{type:'number',html:`<div class="info">Ante <b>$${ante}</b> · Pair Plus <b>${pp?'$'+pp:'none'}</b> · You ${played?`<b>play</b> ($${ante})`:'<b>fold</b>'}</div><div class="mini-table"><div><div class="lbl">Dealer · ${r.ed.name}${tcpQualifies(d)?'':' · doesn’t qualify'}</div>${tcpHandHTML(d)}</div><div><div class="lbl">You · ${r.ep.name}</div>${tcpHandHTML(p)}</div></div><p class="ask">What is your net result in dollars?</p>`,
 check:v=>v===r.net,explain:`<b>${money(r.net)}</b><br>${r.lines.map(l=>'• '+l).join('<br>')}`}}})}},

{id:'table',level:'Advanced',title:'Casino Table',blurb:'Play real hands with a bankroll. Every decision is graded.',goal:'Pass: 20+ hands with at least 90% correct play/fold decisions.',
settings:[{k:'ante',label:'Ante',opts:[[5,'$5'],[10,'$10'],[25,'$25']],def:10},{k:'pp',label:'Pair Plus',opts:[[0,'Off'],[5,'$5'],[10,'$10']],def:5}],
lesson:`<h3>Put it together</h3><p>Play hand after hand against the dealer with a $500 bankroll. You'll get:</p><ul><li>Instant feedback on every play/fold decision against the Q-6-4 rule.</li><li>A line-by-line settlement of each bet, so you learn the payouts.</li><li>Running stats for decision accuracy and how your bankroll is doing.</li></ul>
<div class="tip"><b>Reality check:</b> even with perfect play, the Ante/Play edge is about 3.4%. Pair Plus at 40/30/6/4/1 has an edge of about 2.3%, so in the long run the bankroll drifts down. The goal is perfect decisions, not profit.</div>
<p class="small">Keys: P to play, F to fold, Enter to deal the next hand.</p>`,
drill(el){tcpTable(el,this)}}
];
