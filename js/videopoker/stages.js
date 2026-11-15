"use strict";
/* Video Poker — lessons and drills for all 6 stages. */
const VP_CATS=['Royal flush','Straight flush','Four of a kind','Full house','Flush','Straight','Three of a kind','Two pair','Jacks or better','No win'];
const C5=(rs,suits)=>rs.map((r,i)=>({r,s:suits?suits[i]:pick(SUITS)}));
/* Build a 5-card hand that lands in VP_CATS[i]. */
function vpHandOfCat(i){
 const s=pick(SUITS),R=['A','2','3','4','5','6','7','8','9','10','J','Q','K','A'];
 if(i===0)return shuffle(C5(['10','J','Q','K','A'],Array(5).fill(s)));
 if(i===1){const st=rnd(9);return shuffle(C5(R.slice(st,st+5),Array(5).fill(s)))}
 if(i===2){const r=pick(RANKS);let k;do k=pick(RANKS);while(k===r);return shuffle([...SUITS.map(x=>({r,s:x})),{r:k,s:pick(SUITS)}])}
 if(i===3){const a=pick(RANKS);let b;do b=pick(RANKS);while(b===a);return shuffle([...shuffle([...SUITS]).slice(0,3).map(x=>({r:a,s:x})),...shuffle([...SUITS]).slice(0,2).map(x=>({r:b,s:x}))])}
 for(let n=0;n<50000;n++){const h=dealN(5),p=vpPayout(h,1);const idx=p.row<0?9:p.row;if(idx===i)return h}
 return dealN(5);
}
const vpRow=(h,mask,cls='')=>`<div class="hand vprow ${cls}">${h.map((c,i)=>`<div class="vpc ${mask&(1<<i)?'held':'dim'}">${cardHTML(c)}<span class="heldtag">HELD</span></div>`).join('')}</div>`;
/* Custom answer UI: tap cards to hold, then lock in. Answer value = 5-bit mask. */
function vpHoldQuestion(hand,html,explainExtra=''){
 let mask=0,ansEl=null,done=false;const g=()=>vpBestHold(hand);
 const toggle=i=>{if(done)return;mask^=1<<i;ansEl.querySelectorAll('.pickcard')[i].classList.toggle('held',!!(mask&(1<<i)))};
 const best=g();
 return{html,
  custom(ans,respond){ansEl=ans;ans.innerHTML=`<div class="holdpick"><div class="pickrow">${hand.map((c,i)=>`<button class="pickcard" data-i="${i}" aria-label="Hold card ${i+1}">${cardHTML(c,'deal')}<span class="heldtag">HELD</span><span class="kbd">${i+1}</span></button>`).join('')}</div><button class="btn primary lockin">Lock in holds <span class="kbd">Enter</span></button></div>`;
   ans.querySelectorAll('.pickcard').forEach(b=>b.onclick=()=>toggle(+b.dataset.i));
   $('.lockin',ans).onclick=()=>{done=true;$('.holdpick',ans).classList.add('done');respond(mask)};
   this._lock=()=>$('.lockin',ans).click()},
  onKey(e){if(/^[1-5]$/.test(e.key))toggle(+e.key-1);else if(e.key==='Enter'){e.preventDefault();this._lock()}},
  check:m=>best.masks.includes(+m),
  reveal(){ansEl.querySelectorAll('.pickcard').forEach((b,i)=>{b.classList.toggle('best',!!(best.masks[0]&(1<<i)))})},
  get explain(){const c=vpClassify(maskCards(hand,mask));const bm=maskCards(hand,best.masks[0]);
   return `Best play: ${bm.length?'hold <b>'+handStr(bm)+'</b>':'<b>draw five new cards</b>'} — <i>${best.rule}</i> (step ${best.step} of 16).${best.masks.includes(mask)?'':`<br>You held ${mask?handStr(maskCards(hand,mask)):'nothing'}: ${c?`<i>${VP_LADDER[c[0]-1]}</i> (step ${c[0]})`:'not a strategy pattern'}.`}${explainExtra}`}};
}
const ladderHTML=(hi=[])=>`<table><tr><th>Step</th><th>Hold</th></tr>${VP_LADDER.map((r,i)=>`<tr${hi.includes(i+1)?' style="background:rgba(236,72,153,.08)"':''}><td class="n">${i+1}</td><td>${r}</td></tr>`).join('')}</table>`;
const STAGES=[
{id:'ranks',level:'Beginner',title:'Winning Hands',blurb:'Spot every paying hand in Jacks or Better instantly.',goal:'Goal: 90% on 20 hands.',
lesson:`<h3>How the game works</h3><ol><li>Bet 1 to 5 coins.</li><li>You're dealt five cards from a freshly shuffled 52-card deck.</li><li>Choose which cards to <b>hold</b>.</li><li>The rest are replaced from the same deck.</li><li>Your final hand is paid from the paytable.</li></ol>
<h3>The paying hands, best first</h3><table><tr><th>Hand</th><th>Example</th></tr><tr><td><b>Royal flush</b></td><td>10♠ J♠ Q♠ K♠ A♠</td></tr><tr><td><b>Straight flush</b></td><td>5♥ 6♥ 7♥ 8♥ 9♥</td></tr><tr><td><b>Four of a kind</b></td><td>9♣ 9♦ 9♥ 9♠ 2♦</td></tr><tr><td><b>Full house</b></td><td>K♠ K♦ K♣ 4♥ 4♠</td></tr><tr><td><b>Flush</b></td><td>A♦ J♦ 8♦ 5♦ 2♦</td></tr><tr><td><b>Straight</b></td><td>A♣ 2♦ 3♠ 4♥ 5♣ <small>(Ace can be low or high)</small></td></tr><tr><td><b>Three of a kind</b></td><td>7♠ 7♥ 7♦ K♣ 2♠</td></tr><tr><td><b>Two pair</b></td><td>J♥ J♣ 4♠ 4♦ A♥</td></tr><tr><td><b>Jacks or better</b></td><td>A pair of J, Q, K or A</td></tr></table>
<div class="tip">A pair of 10s or lower pays <b>nothing</b>. That's what "Jacks or Better" means.</div>`,
drill(el){runDrill(el,this,{total:20,pass:.9,auto:true,gen(){const i=pick([0,1,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9]);const h=vpHandOfCat(i);const e=eval5(h);
 return{html:`<div class="flash"><div class="hand">${h.map(c=>cardHTML(c,'deal')).join('')}</div></div><p class="ask">What does this hand pay as?</p>`,choices:VP_CATS.map((c,k)=>({v:String(k),l:c})),check:x=>+x===i,
 explain:`<b>${VP_CATS[i]}</b>.${i===9&&e.cat===1?' A pair below Jacks doesn’t pay.':''}${i===5&&h.some(c=>c.r==='A')&&h.some(c=>c.r==='2')?' Ace plays low here.':''}`}}})}},

{id:'paytable',level:'Beginner',title:'The Paytable',blurb:'Read paytables, and see why 9/6 and five coins matter.',goal:'Goal: 85% on 15 questions.',
lesson:`<h3>Full-pay 9/6 Jacks or Better</h3><table><tr><th>Hand</th><th>1 coin</th><th>2</th><th>3</th><th>4</th><th>5 coins</th></tr>${VP_PAY.map((r,i)=>`<tr><td>${r[1]}</td>${[1,2,3,4,5].map(c=>`<td class="n"${i===0&&c===5?' style="color:#fde68a"':''}>${vpPayFor(i,c)}</td>`).join('')}</tr>`).join('')}</table>
<ul><li>Pays rise in step with coins, <b>except the royal flush</b>: 250 per coin up to 4 coins, then 4000 (800 per coin) at 5 coins. That bonus is worth about 1.5% of return, so <b>always bet 5 coins</b>.</li><li>"9/6" means the full house pays 9 and the flush pays 6 per coin. Casinos lower those two numbers to cut the return:</li></ul>
<table><tr><th>Paytable (FH/Flush)</th><th>Return with perfect play</th></tr><tr><td><b>9/6</b></td><td class="pos">99.54%</td></tr><tr><td>8/6</td><td>98.39%</td></tr><tr><td>8/5</td><td>97.30%</td></tr><tr><td>7/5</td><td>96.15%</td></tr><tr><td>6/5</td><td>95.00%</td></tr></table>`,
drill(el){runDrill(el,this,{total:15,pass:.85,gen(i){
 if(i%5===4){const qs=[
  {q:'Which machine should you play?',c:['9/6','8/5','7/5','6/5'],a:'9/6',e:'9/6 returns 99.54% with perfect play, the best of these.'},
  {q:'How many coins should you bet?',c:['1','3','5','It doesn’t matter'],a:'5',e:'Only 5 coins unlocks the 4000-coin royal flush, worth about 1.5% of return.'},
  {q:'What is the lowest paying hand?',c:['Any pair','Pair of 10s','Pair of Jacks','Two pair'],a:'Pair of Jacks',e:'Jacks or better pays 1 per coin. 10s and lower pay nothing.'},
  {q:'On an "8/5" machine, what does a flush pay per coin?',c:['8','5','6','9'],a:'5',e:'The second number is the flush payout.'}];const x=pick(qs);
  return{html:`<p class="info big">${x.q}</p>`,choices:x.c.map(c=>({v:c,l:c})),check:v=>v===x.a,explain:x.e}}
 const r=rnd(9),c=r===0?pick([4,5,5]):1+rnd(5),pay=vpPayFor(r,c);
 return{type:'number',html:`<div class="flash" style="min-height:110px"><div class="info big">${VP_PAY[r][1]}<br>bet <b>${c}</b> coin${c>1?'s':''}</div></div><p class="ask">How many coins does it pay? (9/6 table)</p>`,check:v=>v===pay,explain:`${VP_PAY[r][1]} pays ${r===0&&c===5?'4000 at 5 coins (the royal bonus)':VP_PAY[r][2]+' × '+c} = <b>${pay}</b>.`}}})}},

{id:'pairs',level:'Intermediate',title:'Holding Made Hands',blurb:'Pairs, two pair, trips and the 4-to-a-royal exception.',goal:'Goal: 85% on 20 hands. Tap cards (or press 1–5) to hold.',
lesson:`<h3>The strategy ladder</h3><p>For each hand, find the <b>highest line on this list</b> that your cards match, and hold exactly those cards. This is the standard "simple strategy" for 9/6 Jacks or Better. It returns 99.46%, within 0.08% of computer-perfect play.</p>${ladderHTML([1,2,3,4,5,6,9])}
<h3>The rules that trip people up</h3><ul><li><b>4 to a royal beats everything except a pat straight flush or better</b>. Break a paying flush or straight, or a high pair, to chase the 4000.</li><li><b>Never hold a kicker</b> with a pair (K-K-A → hold only K-K).</li><li><b>A high pair beats 4 to a flush</b>, and a low pair beats 4 to an outside straight.</li><li>Two pair: hold both pairs and draw one.</li></ul>`,
drill(el){runDrill(el,this,{total:20,pass:.85,gen(){const h=vpHandForSteps([1,2,3,4,5,6,6,9,9]);return vpHoldQuestion(h,`<p class="ask">Which cards do you hold?</p>`)}})}},

{id:'draws',level:'Intermediate',title:'Holding Draws',blurb:'Flush draws, straights, high cards — and when to toss it all.',goal:'Goal: 80% on 20 hands.',
lesson:`<h3>When you don't have a pair</h3><p>Most hands are dealt with nothing, and that's where the money is won or lost. Use the lower half of the ladder:</p>${ladderHTML([7,8,10,11,12,13,14,15,16])}
<h3>Key ideas</h3><ul><li><b>High cards</b> (J, Q, K, A) matter because a pair of them pays.</li><li>With three unsuited high cards, keep the <b>lowest two</b>. A-K-Q → hold K-Q, since they make more straights.</li><li>An <b>outside straight</b> is open on both ends (5-6-7-8). An <b>inside straight</b> (5-6-8-9) is almost never held in this simple strategy.</li><li>With nothing at all, hold nothing and draw five. That beats holding a single low card.</li></ul>`,
drill(el){runDrill(el,this,{total:20,pass:.8,gen(){const h=vpHandForSteps([7,8,8,10,10,11,12,13,13,14,15,15,16]);return vpHoldQuestion(h,`<p class="ask">Which cards do you hold?</p>`)}})}},

{id:'compare',level:'Advanced',title:'Which Hold Is Better?',blurb:'Two tempting options. Pick the one the ladder ranks higher.',goal:'Goal: 85% on 15 decisions.',
lesson:`<h3>Thinking in ladder steps</h3><p>Most mistakes happen when a hand offers two reasonable holds. The ladder settles it: the option on the <b>higher step</b> is better.</p>
<table><tr><th>Hand</th><th>Option A</th><th>Option B</th><th>Better</th></tr><tr><td>K♠ K♥ 7♠ 4♠ 2♠</td><td>K-K (high pair, step 6)</td><td>4 spades (4 to a flush, step 8)</td><td><b>A</b></td></tr><tr><td>10♥ J♥ Q♥ K♥ 9♣</td><td>Pat straight (step 3)</td><td>4 to a royal (step 2)</td><td><b>B</b></td></tr><tr><td>5♦ 5♣ 6♦ 7♦ 8♦</td><td>Low pair (step 9)</td><td>4 to a straight flush (step 4)</td><td><b>B</b></td></tr></table>`,
drill(el){runDrill(el,this,{total:15,pass:.85,gen(){
 for(let n=0;n<500;n++){const h=vpHandForSteps([2,3,4,5,6,7,8,9,10,11,12,13]);const b=vpBestHold(h);const alts=[];
  for(let m=0;m<32;m++){const c=vpClassify(maskCards(h,m));if(c&&c[0]>b.step&&c[0]<16)alts.push([c[0],m])}
  if(!alts.length)continue;alts.sort((a,b2)=>a[0]-b2[0]);const alt=pick(alts.slice(0,Math.min(2,alts.length)));
  const opts=shuffle([{m:b.masks[0],step:b.step,good:1},{m:alt[1],step:alt[0],good:0}]);
  return{html:`<p class="ask">Which hold is better?</p><div class="cmp"><div class="lbl">Option A</div>${vpRow(h,opts[0].m)}<div class="lbl">Option B</div>${vpRow(h,opts[1].m)}</div>`,choices:[{v:'0',l:'Option A'},{v:'1',l:'Option B'}],check:x=>opts[+x].good===1,
   explain:`${['A','B'][opts.findIndex(o=>o.good)]} is better: <i>${VP_LADDER[b.step-1]}</i> (step ${b.step}) beats <i>${VP_LADDER[alt[0]-1]}</i> (step ${alt[0]}).`}}
 return this.gen()}})}},

{id:'machine',level:'Expert',title:'Play the Machine',blurb:'A full 9/6 machine with credits, hints and graded holds.',goal:'Pass: 30+ hands with at least 85% of holds correct.',
lesson:`<h3>Your own 9/6 machine</h3><p>Start with 1,000 credits. Bet 1–5 coins, deal, tap cards to hold, then draw. After every draw you'll see:</p><ul><li>Whether your hold matched the strategy ladder, and which step it was.</li><li>Running hold accuracy, credits, and your actual return.</li></ul>
<p>Turn on <b>Hints</b> to see the best hold highlighted before you draw. It's useful while learning, but turn it off for the test.</p>
<div class="tip">Even perfect play has big swings. About 1 hand in 40,000 is a royal flush, and that's where much of the return comes from. A short session showing 90% return is normal.</div>
<p class="small">Keys: 1–5 hold, Enter deal/draw, B bet one, M bet max.</p>`,
drill(el){vpMachine(el,this)}}
];
