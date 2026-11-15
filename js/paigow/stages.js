"use strict";
/* Pai Gow Poker — lessons and drills for all 6 stages. */
const PG_RANKS=['Five aces','Straight flush','Four of a kind','Full house','Flush','Straight','Three of a kind','Two pair','One pair','High card'];
const pgCatName=e=>e.cat===10?'Five aces':e.cat>=8?'Straight flush':HAND5[e.cat];
/* Seven cards whose House Way falls in a chosen bucket (for focused drills). */
function pgHandWhere(pred){for(let i=0;i<3000;i++){const h=pgDeal().slice(0,7);if(pred(h))return h}return pgDeal().slice(0,7)}
const pairCount=h=>{const c={};h.forEach(x=>{const v=pgv(x);c[v]=(c[v]||0)+1});return Object.values(c)};
const isSimple=h=>{const c=pairCount(h);return Math.max(...c)<=2&&!pgSplits(h).some(s=>!s.foul&&[4,5,8,9].includes(s.he.cat))};
function setQuestion(h,html){
 const hw=houseWay(h);let setter=null,chosen=null;
 return{html,custom(ans,respond){setter=pgSetter(ans,h,(m,s)=>{chosen=s;respond(m)},{button:'Lock in'})},
  onKey(e){if(e.key==='Enter'){e.preventDefault();setter&&setter.lock()}},
  check:m=>{const low=h.filter((_,i)=>m&(1<<i)),high=h.filter((_,i)=>!(m&(1<<i)));return sameSetting({high,low},hw)},
  reveal(){setter&&setter.showBest(hw.mask)},
  get explain(){return `House Way: low hand <b>${handStr(pgSort(hw.low))}</b>, high hand ${evalHigh(hw.high).name.toLowerCase()}. <i>${hw.why}</i>`}}}
const STAGES=[
{id:'hands',level:'Beginner',title:'Hands & the Joker',blurb:'Poker rankings with one twist: a semi-wild Joker.',goal:'Goal: 90% on 20 hands.',
lesson:`<h3>53 cards</h3><p>Pai Gow uses a standard deck <b>plus one Joker</b>. The Joker is <b>semi-wild</b>: it can be used</p><ul><li>as an <b>Ace</b>, or</li><li>to complete a <b>straight</b>, <b>flush</b> or <b>straight flush</b>.</li></ul><p>It can't fill in anything else: J-J-JOKER is a pair of Jacks plus an Ace, not three Jacks.</p>
<h3>Five-card rankings</h3><table><tr><th>#</th><th>Hand</th></tr>${PG_RANKS.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${r}${i===0?' (four Aces + Joker, the best hand)':''}</td></tr>`).join('')}</table>
<h3>Two-card rankings</h3><p>Only two kinds: a <b>pair</b> beats any two unpaired cards. The best two-card hand is a pair of Aces (or Ace + Joker).</p>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(i){let h;for(let n=0;n<4000;n++){const d=pgDeal(),c=d.slice(0,5);if(i%3===0&&!c.some(isJoker)){c[0]={r:'JK',s:'★'}}const e=evalHigh(c),k=pgCatName(e);if(k==='High card'&&Math.random()<.7)continue;if(k==='One pair'&&Math.random()<.5)continue;h=c;break}
 const e=evalHigh(h),name=pgCatName(e);
 return{html:`<div class="flash"><div class="hand">${h.map(c=>cardHTML(c,'deal')).join('')}</div></div><p class="ask">What is the best hand?</p>`,choices:PG_RANKS.map(r=>({v:r,l:r})),check:x=>x===name,explain:`<b>${name}</b>.${h.some(isJoker)?(e.cat===10?' The Joker makes the fifth Ace.':[4,5,8,9].includes(e.cat)?' The Joker completes the '+name.toLowerCase()+'.':' The Joker plays as an Ace.'):''}`}}})}},

{id:'fouls',level:'Beginner',title:'Setting & Fouls',blurb:'Two hands from seven cards, and the one rule you can’t break.',goal:'Goal: 90% on 15 settings.',
lesson:`<h3>Setting your hand</h3><p>You're dealt <b>seven</b> cards and split them into:</p><ul><li>a <b>five-card high hand</b> ("back" or "bottom"), and</li><li>a <b>two-card low hand</b> ("front", "top" or "small").</li></ul>
<h3>The rule</h3><div class="tip" style="font-size:1.05rem">The five-card hand must <b>rank higher</b> than the two-card hand.</div>
<p>If it doesn't, the hand is a <b>foul</b>. Depending on the casino, it's reset by the dealer or forfeited. Examples:</p>
<table><tr><th>High (5)</th><th>Low (2)</th><th></th></tr><tr><td>K-K-9-5-2</td><td>Q-J</td><td class="pos">Legal: pair beats no pair</td></tr><tr><td>A-9-7-5-3</td><td>K-Q</td><td class="pos">Legal: A-high beats K-high</td></tr><tr><td>Q-9-7-5-3</td><td>K-J</td><td class="neg">Foul: K-high low beats Q-high high</td></tr><tr><td>A-K-9-5-2</td><td>8-8</td><td class="neg">Foul: the low hand has a pair</td></tr></table>`,
drill(el){runDrill(el,this,{total:15,pass:.9,auto:true,gen(){const h=pgDeal().slice(0,7),sp=pgSplits(h);const want=Math.random()<.5;let s=sp.filter(x=>x.foul===want);if(!s.length)s=sp;const x=pick(s);
 return{html:`${pgSetHTML(x,'Proposed setting')}<p class="ask">Legal or foul?</p>`,choices:[{v:'ok',l:'Legal'},{v:'foul',l:'Foul'}],check:v=>v===(x.foul?'foul':'ok'),explain:x.foul?`<b>Foul.</b> ${x.le.name} in the low hand beats or ties ${x.he.name.toLowerCase()} in the high hand.`:`<b>Legal.</b> ${x.he.name} (high) outranks ${x.le.name} (low).`}}})}},

{id:'showdown',level:'Intermediate',title:'Win, Push or Lose',blurb:'Compare both hands with the banker, and see why ties favor the bank.',goal:'Goal: 85% on 15 showdowns.',
lesson:`<h3>Two comparisons</h3><p>Your high hand plays the banker's high hand, and your low hand plays the banker's low hand.</p><table><tr><th>Result</th><th>Outcome</th></tr><tr><td>Win both</td><td class="pos"><b>Win</b>: paid 1:1 minus 5% commission</td></tr><tr><td>Win one, lose one</td><td><b>Push</b>: bet returned</td></tr><tr><td>Lose both</td><td class="neg"><b>Lose</b></td></tr></table>
<p><b>Copies:</b> if a hand ties exactly, the <b>banker wins that hand</b>. That rule plus the 5% commission is the house edge. About 41% of hands push, which makes Pai Gow one of the slowest, lowest-swing games in the casino.</p>`,
drill(el){runDrill(el,this,{total:15,pass:.85,auto:true,gen(){const d=pgDeal(),p=houseWay(d.slice(0,7)),b=houseWay(d.slice(7,14)),r=pgResult(p,b);
 const hi=cmpScore(evalHigh(p.high).score,evalHigh(b.high).score),lo=cmpScore(evalLow(p.low).score,evalLow(b.low).score);
 return{html:`${pgSetHTML(b,'Banker')}${pgSetHTML(p,'You')}<p class="ask">Result?</p>`,choices:[{v:'win',l:'Win'},{v:'push',l:'Push'},{v:'lose',l:'Lose'}],check:x=>x===r,
 explain:`High: ${hi>0?'you win':hi<0?'banker wins':'copy → banker'} · Low: ${lo>0?'you win':lo<0?'banker wins':'copy → banker'} → <b>${r}</b>.`}}})}},

{id:'housewayA',level:'Intermediate',title:'House Way: Pairs',blurb:'Set no-pair, one-pair, two-pair and three-pair hands like the dealer.',goal:'Goal: 80% on 15 hands. Tap 2 cards for the low hand.',
lesson:`<h3>The House Way</h3><p>The dealer must set the banker hand by a fixed method called the <b>House Way</b>. Using it yourself is close to optimal, and you can always ask the dealer to set your hand that way. Casino versions differ slightly; this academy uses a common one:</p>
<table><tr><th>You have</th><th>Set it like this</th></tr><tr><td>No pair</td><td>Highest card in the high hand, next two highest in the low hand</td></tr><tr><td>One pair</td><td>Pair in the high hand, next two highest in the low hand</td></tr><tr><td>Two pair</td><td>Split them: higher pair high, lower pair low. <b>Exception:</b> if the higher pair is 10s or lower and you hold an Ace, keep both pairs high and play the Ace low</td></tr><tr><td>Three pair</td><td>Highest pair goes in the low hand</td></tr></table>
<p>A straight or flush hiding in a no-pair or one-pair hand is played in the high hand (stage 5).</p>`,
drill(el){runDrill(el,this,{total:15,pass:.8,gen(){const h=pgHandWhere(x=>isSimple(x)&&(Math.random()<.35||Math.max(...pairCount(x))===2));return setQuestion(h,'<p class="ask">Set the hand the House Way.</p>')}})}},

{id:'housewayB',level:'Advanced',title:'House Way: Big Hands',blurb:'Trips, straights, flushes, full houses, quads and five aces.',goal:'Goal: 80% on 15 hands.',
lesson:`<table><tr><th>You have</th><th>Set it like this</th></tr><tr><td>Straight or flush (no pair, or one pair)</td><td>Play it high, using the five cards that leave the best low hand</td></tr><tr><td>Three of a kind</td><td>Keep it high. <b>Three Aces:</b> pair of Aces high, one Ace low</td></tr><tr><td>Two three-of-a-kinds</td><td>Split the higher set: a pair from it goes low</td></tr><tr><td>Full house</td><td>Trips high, pair low</td></tr><tr><td>Four of a kind</td><td>2s–6s: keep together. 7s–10s: split into two pairs, unless you have an Ace (then keep together, Ace low). Jacks or higher: split</td></tr><tr><td>Five aces</td><td>Pair of Aces low, unless you have a pair of Kings (Kings low)</td></tr></table>
<div class="tip">The aim is always to give the low hand enough strength to win while keeping the high hand ahead. Splitting big hands earns more pushes than losses.</div>`,
drill(el){runDrill(el,this,{total:15,pass:.8,gen(){const h=pgHandWhere(x=>!isSimple(x));return setQuestion(h,'<p class="ask">Set the hand the House Way.</p>')}})}},

{id:'table',level:'Expert',title:'Casino Table',blurb:'Bet, set your seven cards, and face the banker’s House Way.',goal:'Pass: 20+ hands with at least 80% set the House Way.',
settings:[{k:'bet',label:'Bet',opts:[[10,'$10'],[25,'$25'],[100,'$100']],def:25}],
lesson:`<h3>Play it out</h3><p>A $1,000 practice bankroll. Each hand you get seven cards. Set them, then the dealer reveals the banker's seven cards, set by the House Way. Wins pay 1:1 minus 5% commission.</p>
<p>After every hand you'll see whether your setting matched the House Way and how the hand was decided. Stuck? Press <b>Show House Way</b> to see the setting, but that hand won't count toward your accuracy.</p>
<p class="small">Keys: Enter to set the hand or deal.</p>`,
drill(el){pgTable(el,this)}}
];
