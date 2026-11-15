"use strict";
/* Texas Hold'em — lessons and drills for all 8 stages. */
const HAND_CHOICES=[...HAND5].reverse().map(h=>({v:h,l:h}));
const H=(cs,cls='deal')=>`<div class="hand">${cs.map(c=>cardHTML(c,cls)).join('')}</div>`;
const boardHTML=b=>`<div class="board"><div class="lbl">Board</div>${H(b,'deal')}</div>`;
/* Deal hole + board (n cards) whose current hand is pair or worse and that has 4–15 outs to a straight or better. */
function drawSpot(nBoard){for(let i=0;i<3000;i++){const d=makeShoe(1),hole=d.slice(0,2),board=d.slice(2,2+nBoard);if(eval7([...hole,...board]).cat>1)continue;const o=outsTo(hole,board,4);if(o.length>=4&&o.length<=15)return{hole,board,outs:o}}return drawSpot(nBoard)}
const outsText=o=>{const by={};o.forEach(c=>(by[c.s]=by[c.s]||[]).push(c.r));return Object.entries(by).map(([s,rs])=>rs.join(' ')+s).join(' · ')};
const RANK_TABLE=`<table class="ranks"><tr><th>#</th><th>Hand</th><th>Example</th></tr>${[['Royal flush','A♠ K♠ Q♠ J♠ 10♠'],['Straight flush','9♥ 8♥ 7♥ 6♥ 5♥'],['Four of a kind','Q♣ Q♦ Q♥ Q♠ 3♦'],['Full house','K♠ K♥ K♦ 4♣ 4♠'],['Flush','A♦ J♦ 8♦ 5♦ 2♦'],['Straight','10♣ 9♦ 8♠ 7♥ 6♣'],['Three of a kind','7♠ 7♥ 7♦ K♣ 2♠'],['Two pair','J♥ J♣ 4♠ 4♦ A♥'],['One pair','10♠ 10♦ K♥ 6♣ 3♠'],['High card','A♣ Q♦ 9♠ 5♥ 3♣']].map(([n,e],i)=>`<tr><td class="n">${i+1}</td><td><b>${n}</b></td><td>${e}</td></tr>`).join('')}</table>`;
const STAGES=[
{id:'ranks',level:'Beginner',title:'Hand Rankings',blurb:'The ten poker hands, best to worst, until they’re instant.',goal:'Goal: 90% on 20 hands.',
lesson:`<h3>How Hold'em works</h3><ol><li>Two players post <b>blinds</b> (forced bets) to start the pot.</li><li>Everyone gets two private <b>hole cards</b>. Then comes the first betting round.</li><li><b>The flop:</b> three shared cards, then betting. <b>The turn:</b> a fourth card, then betting. <b>The river:</b> a fifth card, then the last round of betting.</li><li>On each turn you can <b>fold</b>, <b>check</b> (if nobody has bet), <b>call</b> or <b>bet/raise</b>.</li><li><b>Showdown:</b> the best five-card hand from your two cards plus the five on the board wins.</li></ol>
<h3>Hand rankings</h3>${RANK_TABLE}<p>Within a type, higher cards win: a pair of Kings beats a pair of Queens, and with the same pair the next-highest card (the <b>kicker</b>) decides.</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const h=buildHand5(pick([0,1,1,2,2,3,3,4,4,5,5,6,6,7,8,9])),name=eval5(h).name;return{html:`<div class="flash">${H(h)}</div><p class="ask">What hand is this?</p>`,choices:HAND_CHOICES,check:x=>x===name,explain:`<b>${name}</b>.`}}})}},

{id:'best5',level:'Beginner',title:'Best Five of Seven',blurb:'Read the board plus your two cards and find your real hand.',goal:'Goal: 85% on 15 boards.',
lesson:`<h3>Seven cards, best five</h3><p>Your hand is the <b>best five</b> of your 2 hole cards plus the 5 board cards. You can use both hole cards, one, or none ("playing the board").</p>
<ul><li>A four-card flush on the board plus one of your cards of that suit is a flush.</li><li>A pair on the board counts for everyone. A pair in your hand on a paired board is <b>two pair</b>.</li><li>Look for straights on the board that need just one of your cards.</li></ul>`,
drill(el){runDrill(el,this,{total:15,pass:.85,auto:true,gen(){let d,e;for(let i=0;i<200;i++){d=makeShoe(1);e=eval7(d.slice(0,7));if(e.cat>=2||Math.random()<.25)break}const hole=d.slice(0,2),board=d.slice(2,7);
 return{html:`${boardHTML(board)}<div class="lbl" style="margin-top:8px">Your hole cards</div>${H(hole)}<p class="ask">What is your best hand?</p>`,choices:HAND_CHOICES,check:x=>x===e.name,explain:`<b>${e.name}</b>, using ${handStr(e.cards)}.`}}})}},

{id:'showdown',level:'Beginner',title:'Showdown',blurb:'Two or three players turn their cards over. Who takes the pot?',goal:'Goal: 85% on 15 showdowns.',
lesson:`<h3>Reading a showdown</h3><ol><li>Find each player's best five cards.</li><li>Compare hand types first.</li><li>Same type? Compare the cards that make it, then the kickers.</li><li>If the best five cards match exactly in rank, the pot is <b>split</b>. Suits never break ties.</li></ol>`,
drill(el){runDrill(el,this,{total:15,pass:.85,auto:true,gen(){const n=pick([2,2,3]),d=makeShoe(1),hands=[];for(let i=0;i<n;i++)hands.push(d.slice(i*2,i*2+2));const board=d.slice(n*2,n*2+5);
 const ev=hands.map(h=>eval7([...h,...board]));let best=[0];for(let i=1;i<n;i++){const c=cmpScore(ev[i].score,ev[best[0]].score);if(c>0)best=[i];else if(c===0)best.push(i)}const ans=best.length>1?'split':String(best[0]);
 return{html:`${boardHTML(board)}<div class="players">${hands.map((h,i)=>`<div><div class="lbl">Player ${i+1}</div>${H(h)}</div>`).join('')}</div><p class="ask">Who wins?</p>`,choices:[...hands.map((_,i)=>({v:String(i),l:'Player '+(i+1)})),{v:'split',l:'Split pot'}],check:x=>x===ans,
 explain:ev.map((e,i)=>`Player ${i+1}: <b>${e.name}</b> (${handStr(e.cards)})`).join('<br>')+`<br>→ <b>${ans==='split'?'Split pot':'Player '+(best[0]+1)+' wins'}</b>`}}})}},

{id:'outs',level:'Intermediate',title:'Counting Outs',blurb:'How many cards turn your draw into a winner?',goal:'Goal: 80% on 12 draws.',
lesson:`<h3>Outs</h3><p>An <b>out</b> is an unseen card that completes your hand. Count them by draw type:</p><table><tr><th>Draw</th><th>Example</th><th>Outs</th></tr><tr><td>Flush draw (4 suited)</td><td>A♥ 7♥ on K♥ 9♥ 2♣</td><td class="n">9</td></tr><tr><td>Open-ended straight draw</td><td>8 9 on 10 J 2</td><td class="n">8</td></tr><tr><td>Gutshot (inside) straight draw</td><td>8 9 on J Q 2</td><td class="n">4</td></tr><tr><td>Flush + open-ended combo</td><td>8♥ 9♥ on 10♥ J♥ 2♠</td><td class="n">15</td></tr><tr><td>Double gutshot</td><td>9 J on 7 10 K</td><td class="n">8</td></tr></table>
<p>Don't count a card twice. In the combo draw, the 7♥ and Q♥ make both a flush and a straight, so 9 + 8 − 2 = 15.</p><p>In this drill, count the cards that give you a <b>straight or better</b>.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,gen(i){const s=drawSpot(i<6?3:4);return{type:'number',html:`${boardHTML(s.board)}<div class="lbl" style="margin-top:8px">Your hand</div>${H(s.hole)}<p class="ask">How many outs to make a straight or better?</p>`,check:v=>v===s.outs.length,explain:`<b>${s.outs.length} outs</b>: ${outsText(s.outs)}`}}})}},

{id:'rule24',level:'Intermediate',title:'The Rule of 2 and 4',blurb:'Turn outs into a percentage in your head.',goal:'Goal: 80% on 12 questions.',
lesson:`<h3>Quick percentages</h3><ul><li><b>On the flop</b>, with two cards to come: outs × <b>4</b> ≈ your chance to hit by the river.</li><li><b>On the turn</b>, with one card to come: outs × <b>2</b> ≈ your chance to hit on the river.</li></ul>
<table><tr><th>Outs</th><th>Flop → river</th><th>Turn → river</th></tr>${[4,8,9,12,15].map(o=>`<tr><td>${o}</td><td>${(hitChance(o,2)*100).toFixed(1)}% (rule: ${o*4}%)</td><td>${(hitChance(o,1)*100).toFixed(1)}% (rule: ${o*2}%)</td></tr>`).join('')}</table>
<p>The rule runs a little high with many outs, but it's close enough to make decisions at the table.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,gen(i){const outs=pick([4,6,8,9,10,12,15]),cards=i%2?1:2,ex=Math.round(hitChance(outs,cards)*100);
 const opts=new Set([ex]);[ex-15,ex+15,ex-25,ex+25,Math.round(ex/2),Math.min(95,ex*2)].filter(x=>x>1&&x<99&&Math.abs(x-ex)>=8).forEach(x=>{if(opts.size<4)opts.add(x)});
 return{html:`<p class="info big"><b>${outs}</b> outs ${cards===2?'on the <b>flop</b> (two cards to come)':'on the <b>turn</b> (one card to come)'}</p><p class="ask">About how likely are you to hit?</p>`,choices:[...opts].sort((a,b)=>a-b).map(x=>({v:String(x),l:x+'%'})),check:x=>+x===ex,
 explain:`Rule of ${cards===2?4:2}: ${outs} × ${cards===2?4:2} = ${outs*(cards===2?4:2)}%. Exact: <b>${(hitChance(outs,cards)*100).toFixed(1)}%</b>.`}}})}},

{id:'potodds',level:'Advanced',title:'Pot Odds',blurb:'Is the price right? Compare the pot odds to your chance to win.',goal:'Goal: 80% on 14 decisions.',
lesson:`<h3>The price of a call</h3><p><b>Pot odds</b> compare what you must call with what you can win. The equity you need is:</p><div class="tip" style="text-align:center;font-size:1.05rem">needed % = call ÷ (pot after your call)</div>
<div class="chain">Pot $80, opponent bets $40 → you call $40 into $80 + $40 + $40 = $160 → need 40/160 = <b>25%</b></div>
<table><tr><th>Bet size</th><th>Equity needed</th></tr><tr><td>¼ pot</td><td>17%</td></tr><tr><td>⅓ pot</td><td>20%</td></tr><tr><td>½ pot</td><td>25%</td></tr><tr><td>¾ pot</td><td>30%</td></tr><tr><td>Pot</td><td>33%</td></tr></table>
<p><b>Decision:</b> call when your chance to win (from outs) is greater than the equity needed. Otherwise fold. On the turn, 9 outs ≈ 19.6%, so call a ¼-pot bet (17%) but fold to a ½-pot bet (25%).</p>`,
drill(el){runDrill(el,this,{total:14,pass:.8,gen(i){const pot=pick([40,60,80,100,120,150,200]),frac=pick([.25,1/3,.5,.75,1]),bet=Math.round(pot*frac/5)*5||5,need=potOddsNeed(pot+bet,bet);
 if(i%2===0)return{type:'number',html:`<p class="info big">Pot <b>$${pot}</b> · opponent bets <b>$${bet}</b></p><p class="ask">What equity (%) do you need to call? (nearest whole number)</p>`,check:v=>Math.abs(v-need*100)<=1.01,explain:`Call $${bet} to win a pot of $${pot+bet*2} after your call → ${bet}/${pot+bet*2} = <b>${(need*100).toFixed(1)}%</b>.`};
 const outs=pick([4,8,9,12,15]),eq=hitChance(outs,1),call=eq>=need;
 return{html:`<p class="info big">Turn · <b>${outs} outs</b> · pot <b>$${pot}</b> · opponent bets <b>$${bet}</b></p><p class="ask">Call or fold? (assume you win only if you hit)</p>`,choices:[{v:'call',l:'Call'},{v:'fold',l:'Fold'}],check:x=>x===(call?'call':'fold'),
 explain:`Your chance: ${outs}/46 = ${(eq*100).toFixed(1)}%. Price: ${(need*100).toFixed(1)}%. → <b>${call?'Call':'Fold'}</b>.`}}})}},

{id:'preflop',level:'Advanced',title:'Starting Hands',blurb:'Which hands to open from each seat, and which to fold.',goal:'Goal: 85% on 25 hands.',
lesson:`<h3>Position decides your range</h3><p>Acting later is a big advantage, so you can open more hands the closer you sit to the button. Here are this academy's simplified opening ranges for a 6-player table, used when everyone before you has folded:</p>
<table><tr><th>Seat</th><th>Raise with</th><th>About</th></tr>${Object.entries(OPEN_RANGES).map(([k,v])=>`<tr><td><b>${k}</b></td><td style="font-size:.82rem">${v}</td><td>${{'Early (UTG)':'11%','Middle (Hijack)':'16%','Cutoff':'26%','Button':'42%'}[k]}</td></tr>`).join('')}</table>
<p class="small">How to read it: "s" means suited, "o" means offsuit, and "+" means the hand and everything better of the same kind. A9s+ means A9s, ATs, AJs, AQs and AKs. 66+ means 66 through AA.</p>
<div class="tip">Hands outside the range get folded, even ones that look pretty like K-J offsuit under the gun.</div>`,
drill(el){runDrill(el,this,{total:25,pass:.85,auto:true,gen(){const pos=pick(Object.keys(OPEN_RANGES));let h,code;
 for(let n=0;n<200;n++){h=dealN(2);code=handCode(h[0],h[1]);const inAny=Object.values(RANGE_SETS).some(s=>s.has(code));if(inAny||Math.random()<.25)break}
 const raise=RANGE_SETS[pos].has(code);
 return{html:`<p class="info">Folded to you in <b>${pos}</b></p><div class="flash">${H(h,'big deal')}</div><p class="ask">${code}: raise or fold?</p>`,choices:[{v:'raise',l:'Raise'},{v:'fold',l:'Fold'}],check:x=>x===(raise?'raise':'fold'),
 explain:`<b>${code}</b> is ${raise?'in':'not in'} the ${pos} range → <b>${raise?'raise':'fold'}</b>.<br><span class="small">${OPEN_RANGES[pos]}</span>`}}})}},

{id:'table',level:'Expert',title:'Play the Table',blurb:'No-Limit Hold’em against three computer opponents, with a coach.',goal:'Pass: 25+ graded decisions (facing a bet) with at least 75% correct.',
settings:[{k:'coach',label:'Coach',opts:[['on','On'],['off','Off']],def:'on'}],
lesson:`<h3>Real hands, real decisions</h3><p>Four players, 1,000 chips each, blinds 10/20. Three computer opponents play straightforward poker: they bet strong hands, sometimes bluff, and fold weak hands to big bets.</p>
<p>The <b>coach</b> shows, on your turn:</p><ul><li>your current hand,</li><li>your <b>equity</b>: your chance to win against the players still in, estimated by simulating the rest of the hand,</li><li>the <b>pot odds</b> you're getting when facing a bet.</li></ul>
<p>Every time you face a bet, your decision is graded. Calling or raising is correct when your equity beats the price, and folding is correct when it doesn't. Turn the coach off once you can estimate both yourself.</p>
<div class="tip">Equity here is measured against random hands. Real opponents who bet usually hold better than random, so in a casino you should tighten up from these numbers.</div>
<p class="small">Keys: F fold · C check/call · B bet/raise ½ pot · P pot · A all-in.</p>`,
drill(el){holdemTable(el,this)}}
];
