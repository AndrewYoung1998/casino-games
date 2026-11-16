"use strict";
/* Slots — lessons and drills for all 10 stages. Stages 7–10 are the playable machines (floor.js). */
const FRUITS=['D','B','M','G','O','L','C'];
const payTableHTML=(m,pays,unit=1,title='Line pays (line bet $1)')=>`<table class="mini-pay"><tr><th>${title}</th><th>×3</th><th>×4</th><th>×5</th></tr>${Object.entries(pays).map(([k,p])=>`<tr><td><span class="pt">${symHTML(m,k)}</span></td>${p.map(x=>`<td class="n">${money(x*unit)}</td>`).join('')}</tr>`).join('')}</table>`;
const CL_PAY_HTML=`<table class="mini-pay"><tr><th>Line (per coin)</th><th>Pays</th></tr>${CL_PAYTABLE.map(([a,p])=>`<tr><td>${a}</td><td class="n">${p.includes('/')?'500 · 1,000 · 2,500 (1/2/3 coins)':p}</td></tr>`).join('')}</table>`;
function classicRule(l){const[a,b,c]=l;
 if(a==='7'&&b==='7'&&c==='7')return'7 7 7, the jackpot';
 if(a===b&&b===c&&['B3','B2','B1','CH'].includes(a))return'three '+symName('classic',a).toLowerCase()+'s';
 if(l.every(isBar))return'any three bars (mixed)';
 const ch=l.filter(x=>x==='CH').length;return ch?`${ch} cherr${ch>1?'ies':'y'} on the line`:'no paying combination'}
/* random fiesta grid of fruit only */
const fruitGrid=()=>Array.from({length:5},()=>Array.from({length:3},()=>pick(FRUITS)));
/* force a line to start with `len` of sym (wilds at given reels) */
function forceLine(g,line,sym,len,wilds=[]){for(let r=0;r<len;r++)g[r][line[r]]=wilds.includes(r)?'W':sym;if(len<5){let o=pick(FRUITS.filter(x=>x!==sym));g[len][line[len]]=o}return g}
const lineName=i=>`Line ${i+1}`;

const STAGES=[
{id:'how',level:'Beginner',title:'How a Slot Works',blurb:'Random numbers, virtual reels and paytables. What really happens when you press spin.',goal:'Goal: 85% on 12 spins.',
lesson:`<h3>The reels are just a display</h3><p>Inside every modern slot is a <b>random number generator (RNG)</b> cycling through numbers thousands of times a second. The instant you press spin, it picks a number for each reel, and that decides the result. The spinning animation that follows is theater: the outcome was locked in before the reels started moving.</p>
<h3>Virtual reels</h3><p>A classic reel shows about 22 spots (symbols and the blanks between them). The machine maps those to a longer <b>virtual reel</b> where some spots get more entries than others. On <b>Liberty 7s</b>, our classic machine, each reel has 64 virtual stops:</p>
<table><tr><th>Spot</th><th>Virtual stops (of 64)</th><th>Chance per reel</th></tr><tr><td>The 7</td><td class="n">1</td><td class="n">1.6%</td></tr><tr><td>Each blank next to the 7</td><td class="n">6</td><td class="n">9.4%</td></tr><tr><td>A single bar</td><td class="n">4</td><td class="n">6.3%</td></tr></table>
<p>That's why 7 7 7 lands about once every 262,144 spins (64 × 64 × 64) even though a 7 seems to fly by on every spin.</p>
<h3>The paytable</h3><p>Every machine posts a <b>paytable</b>: which combinations pay, and how much per coin. Liberty 7s pays only on the center line:</p>${CL_PAY_HTML}
<ul><li>Only the <b>highest</b> win on a line is paid.</li><li>Cherries count anywhere on the line. One cherry pays 2.</li><li>"Any 3 bars" means a mix of single, double and triple bars.</li></ul>`,
drill(el){runDrill(el,this,{total:12,pass:.85,auto:true,gen(){
 let line,coins=Math.random()<.3?pick([2,3]):1;
 if(Math.random()<.25)line=pick([['7','7','7'],['B3','B3','B3'],['B2','B2','B2'],['B1','B1','B1'],['CH','CH','CH'],['B1','B3','B2'],['B2','B2','B1'],['CH','B1','CH'],['7','CH','BL'],['7','7','B3'],['B3','B3','CH']]);
 else{const want=Math.random()<.65;for(let t=0;t<200;t++){line=classicSpin().line;if((classicPay(line)>0)===want)break}}
 const p=classicPay(line,coins),grid=line.map(s=>[FILLER.classic(),s,FILLER.classic()]);
 return{html:`<div class="drillmachine m-classic">${staticGrid('classic',grid,{payline:true})}</div><p class="ask">Bet: <b>${coins} coin${coins>1?'s':''}</b>. How many coins does the center line pay?</p><details class="peek"><summary>Paytable</summary>${CL_PAY_HTML}</details>`,
  type:'number',check:x=>x===p,explain:`That's ${classicRule(line)}: <b>${p}</b> coin${p===1?'':'s'}${p&&coins>1?` (${line.every(x=>x==='7')&&coins===3?'the max-coin jackpot':`${p/coins} per coin × ${coins}`})`:''}.`}}})}},

{id:'lines',level:'Beginner',title:'Paylines',blurb:'Read a 5-reel, 20-line video slot like a pro.',goal:'Goal: 80% on 12 lines.',
lesson:`<h3>Five reels, many lines</h3><p>Video slots show a grid, usually 5 reels by 3 rows. A <b>payline</b> is a path across the grid, one symbol per reel. <b>Fruit Fiesta</b> has 20 fixed lines, and your total bet is split evenly across them: a $1 spin is 5¢ per line.</p>
<h3>How a line pays</h3><ul><li>Matching symbols must start on <b>reel 1</b> (the far left) and run on <b>consecutive</b> reels.</li><li>3, 4 or 5 in a row pay more and more, multiplied by your <b>line bet</b>.</li><li>Three matching fruit on reels 2, 3 and 4 pay <b>nothing</b>: the run didn't start on reel 1.</li><li>Each line pays only its best win, and wins on different lines add up.</li></ul>
${payTableHTML('fiesta',FI_PAYS)}
<p class="small">In this drill your line bet is $1, so the table reads straight off. In the real game, divide by 20 lines: a 3-cherry line on a $1 spin pays 15¢.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,auto:false,gen(){
 const li=rnd(20),line=FI_LINES[li],g=fruitGrid(),sym=pick(FRUITS),kind=Math.random();
 if(kind<.6)forceLine(g,line,sym,3+rnd(3));
 else if(kind<.85){g[0][line[0]]=pick(FRUITS.filter(x=>x!==sym));for(let r=1;r<4;r++)g[r][line[r]]=sym}
 const w=fiestaLine(g,line),hits=new Set(w.pay?line.slice(0,w.len).map((k,r)=>r+','+k):[]);
 return{html:`<div class="drillmachine m-fiesta">${staticGrid('fiesta',g,{lines:[{rows:line,color:'#fbbf24'}],hits:new Set()})}</div><p class="ask"><b>${lineName(li)}</b> is drawn. Line bet $1. What does this line pay?</p><details class="peek"><summary>Paytable</summary>${payTableHTML('fiesta',FI_PAYS)}</details>`,
  type:'number',check:x=>x===w.pay,
  reveal(p){p.querySelector('.sgrid').outerHTML=staticGrid('fiesta',g,{lines:[{rows:line,color:'#fbbf24'}],hits})},
  explain:w.pay?`${w.len} × ${symHTML('fiesta',w.sym)} from reel 1 pays <b>$${w.pay}</b>.`:`<b>$0.</b> ${g[0][line[0]]!==g[1][line[1]]?'The run must start on reel 1, and reel 1 doesn’t match reel 2.':'Only two match from the left; a line needs 3.'}`}}})}},

{id:'wilds',level:'Beginner',title:'Wilds & Scatters',blurb:'Substitutes, scatter pays and how free spins trigger.',goal:'Goal: 80% on 12 questions.',
lesson:`<h3>Wild symbols</h3><p>A <b>WILD</b> stands in for any regular symbol to complete a line. In Fruit Fiesta, wilds appear only on reels 2, 3 and 4, so reel 1 always sets which fruit the line is paying.</p><p>Example: 🍉 WILD 🍉 🍉 🍇 is <b>four melons</b>.</p>
<h3>Scatters</h3><p>A <b>scatter</b> pays wherever it lands; it doesn't need to be on a line. Scatter pays are multiplied by your <b>total bet</b>, not the line bet.</p>
<table><tr><th>⭐ anywhere</th><th>Pays</th><th>Also awards</th></tr><tr><td>3</td><td class="n">2 × total bet</td><td>10 free spins</td></tr><tr><td>4</td><td class="n">10 × total bet</td><td>10 free spins</td></tr><tr><td>5</td><td class="n">50 × total bet</td><td>10 free spins</td></tr></table>
<p>Wilds never substitute for scatters. During free spins every win pays <b>3×</b>, and landing 3 more stars adds 10 more spins.</p>
<p class="small">Free spins feel like a gift, but they are already counted in the machine's RTP. About 15% of Fruit Fiesta's return comes from them.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,auto:false,gen(){
 if(Math.random()<.6){
  const li=rnd(20),line=FI_LINES[li],g=fruitGrid(),sym=pick(FRUITS),len=3+rnd(3),wl=[1,2,3].filter(r=>r<len&&Math.random()<.5);if(!wl.length)wl.push(1);
  forceLine(g,line,sym,Math.max(len,wl[wl.length-1]+1),wl);
  const w=fiestaLine(g,line);
  return{html:`<div class="drillmachine m-fiesta">${staticGrid('fiesta',g,{lines:[{rows:line,color:'#fbbf24'}]})}</div><p class="ask"><b>${lineName(li)}</b>, line bet $1. What does it pay?</p><details class="peek"><summary>Paytable</summary>${payTableHTML('fiesta',FI_PAYS)}</details>`,type:'number',check:x=>x===w.pay,
   explain:w.pay?`The wild${wl.length>1?'s act':' acts'} as ${symHTML('fiesta',w.sym)}: ${w.len} in a row pays <b>$${w.pay}</b>.`:'<b>$0.</b> Not 3 in a row from reel 1.'}}
 const n=2+rnd(4),bet=pick([1,2,5,10]),g=fruitGrid(),rs=shuffle([0,1,2,3,4]).slice(0,n);rs.forEach(r=>{g[r][rnd(3)]='S'});
 const pay=FI_SCAT[n]*bet;
 if(Math.random()<.5)return{html:`<div class="drillmachine m-fiesta">${staticGrid('fiesta',g,{})}</div><p class="ask">Total bet <b>${money(bet)}</b>. How many dollars do the ⭐ scatters pay?</p>`,type:'number',check:x=>x===pay,explain:n>=3?`${n} scatters pay ${FI_SCAT[n]} × total bet = <b>${money(pay)}</b>, plus 10 free spins.`:`<b>$0.</b> Two scatters pay nothing; you need 3.`};
 return{html:`<div class="drillmachine m-fiesta">${staticGrid('fiesta',g,{})}</div><p class="ask">How many free spins does this spin award?</p>`,choices:[0,10,20,30].map(v=>({v:String(v),l:String(v)})),check:x=>+x===(n>=3?10:0),explain:n>=3?`${n} stars anywhere: <b>10 free spins</b>. More stars raise the scatter pay, not the spin count.`:'<b>None.</b> It takes 3 stars.'}}})}},

{id:'rtp',level:'Intermediate',title:'RTP & House Edge',blurb:'What “95% return” really means for your wallet.',goal:'Goal: 80% on 12 questions.',
lesson:`<h3>Return to player</h3><p><b>RTP</b> is the share of all money wagered that a machine pays back over its lifetime. A 95% machine keeps 5% (its house edge). It's a long-run average across millions of spins, never a promise for your session.</p>
<h3>The cost of play</h3><p>Expected loss = <b>bet × spins × house edge</b>.</p><table><tr><th>Bet</th><th>Spins / hour</th><th>RTP</th><th>Expected loss per hour</th></tr><tr><td class="n">$1</td><td class="n">600</td><td class="n">95%</td><td class="n">$30</td></tr><tr><td class="n">$3</td><td class="n">600</td><td class="n">92%</td><td class="n">$144</td></tr><tr><td class="n">$0.50</td><td class="n">600</td><td class="n">88%</td><td class="n">$36</td></tr></table>
<p>Slots are fast, about 500–900 spins an hour, so even a small edge adds up. Bet size and speed matter as much as RTP.</p>
<h3>What real machines hold</h3><p>In Nevada in 2025, slot machines held about 7–8% of money played overall, and <b>penny slots held about 9%</b>, the most of any denomination. Higher-denomination machines generally pay back more.</p>
<ul><li>RTP doesn't change after a win or a loss. Every spin has the same odds.</li><li>Bonus features and jackpots are <b>inside</b> the RTP, not extra.</li></ul>`,
drill(el){runDrill(el,this,{total:12,pass:.8,auto:false,gen(){
 const k=Math.random();
 if(k<.4){const b=pick([1,2,3,5]),n=pick([100,200,400,500,600]),r=pick([88,90,92,94,95,96]),loss=b*n*(100-r)/100;
  return{html:`<p class="info big">${money(b)} a spin · ${n} spins · RTP ${r}%</p><p class="ask">Expected loss in dollars?</p>`,type:'number',check:x=>x===-loss||x===loss,explain:`${money(b)} × ${n} = ${money(b*n)} wagered. The edge is ${100-r}%, so expect to lose <b>${money(loss)}</b>.`}}
 if(k<.55){const w=pick([200,500,1000,2000]),r=pick([90,92,94,95,96]),back=w*r/100;return{html:`<p class="info big">You cycle <b>${money(w)}</b> through a ${r}% machine.</p><p class="ask">On average, how many dollars come back?</p>`,type:'number',check:x=>x===back,explain:`${r}% of ${money(w)} is <b>${money(back)}</b>. The other ${money(w-back)} is the house's.`}}
 if(k<.8){const n=pick([500,600,800]);let A,B;for(;;){A={b:pick([1,2,3]),r:pick([86,88,90,92])};B={b:pick([2,3,5]),r:pick([94,95,96,97])};if(A.b*(100-A.r)!==B.b*(100-B.r)||Math.random()<.2)break}
  const la=A.b*n*(100-A.r)/100,lb=B.b*n*(100-B.r)/100,ans=la>lb?'A':lb>la?'B':'same';
  return{html:`<p class="info big">${n} spins an hour on either machine.</p><div class="vs"><div><b>Machine A</b><span>${money(A.b)} a spin</span><span>RTP ${A.r}%</span></div><div><b>Machine B</b><span>${money(B.b)} a spin</span><span>RTP ${B.r}%</span></div></div><p class="ask">Which costs more per hour?</p>`,
   choices:[{v:'A',l:'Machine A'},{v:'B',l:'Machine B'},{v:'same',l:'The same'}],check:x=>x===ans,explain:`A loses ${money(la)}/hour, B loses ${money(lb)}/hour. ${ans==='same'?'<b>The same.</b>':`<b>Machine ${ans}</b> costs more`}${ans==='B'?', despite the better RTP, because of the bigger bet.':'.'}`}}
 const Q=pick([
  {q:'A machine has a 95% RTP. What does that mean?',c:['Over a very long run it pays back $95 of every $100 bet','You get back 95% of your money each session','95% of spins are winners','You lose 5% of your bankroll on every spin'],a:0,e:'RTP is a lifetime average over millions of spins. Your session can land anywhere.'},
  {q:'You just hit a $500 win on a 92% machine. What is its RTP on your next spin?',c:['Still 92%','Lower; it just paid out','Higher; it’s hot','0% until it recovers'],a:0,e:'Each spin is independent. The RTP never changes from spin to spin.'},
  {q:'Where does the free-spins bonus fit in a slot’s RTP?',c:['It’s already counted inside the RTP','It’s added on top of the RTP','It doesn’t affect RTP','It lowers the RTP'],a:0,e:'The stated RTP includes every feature and jackpot.'},
  {q:'In Nevada, which denomination of slot held the most in 2025?',c:['Penny slots','Dollar slots','$5 slots','High-limit slots'],a:0,e:'Penny machines held about 9%, the highest of any denomination.'}]);
 const ord=shuffle(Q.c.map((c,i)=>i));return{html:`<p class="info big">${Q.q}</p>`,choices:ord.map(i=>({v:String(i),l:Q.c[i]})),check:x=>+x===Q.a,explain:Q.e}}})}},

{id:'vol',level:'Intermediate',title:'Volatility & Hit Frequency',blurb:'Same RTP, totally different ride. Pick machines for your goals.',goal:'Goal: 80% on 12 questions.',
lesson:`<h3>Volatility is the shape of the ride</h3><p>Two machines can share a 95% RTP and feel nothing alike. <b>Volatility</b> describes how that 95% is paid out:</p>
<table><tr><th></th><th>Low volatility</th><th>High volatility</th></tr><tr><td>Wins</td><td>Small and frequent</td><td>Rare but large</td></tr><tr><td>Bankroll</td><td>Drifts down slowly</td><td>Long slides, then spikes</td></tr><tr><td>Good for</td><td>Long playtime on a budget</td><td>A shot at a big hit</td></tr></table>
<h3>Hit frequency</h3><p><b>Hit frequency</b> is how often a spin pays anything. "1 in 4" means about 25 winning spins per 100. A high hit frequency doesn't mean you win money that often: many hits pay less than you bet.</p>
<h3>The floor in this academy</h3><table><tr><th>Machine</th><th>RTP</th><th>Volatility</th><th>Hits</th></tr><tr><td>Liberty 7s</td><td class="n">${SLOT_INFO.classic.rtp}%</td><td>${SLOT_INFO.classic.vol}</td><td class="n">${SLOT_INFO.classic.hit}%</td></tr><tr><td>Fruit Fiesta</td><td class="n">${SLOT_INFO.fiesta.rtp}%</td><td>${SLOT_INFO.fiesta.vol}</td><td class="n">${SLOT_INFO.fiesta.hit}%</td></tr><tr><td>Temple Tumble</td><td class="n">${SLOT_INFO.temple.rtp}%</td><td>${SLOT_INFO.temple.vol}</td><td class="n">${SLOT_INFO.temple.hit}%</td></tr><tr><td>Dragon’s Hoard</td><td class="n">${SLOT_INFO.dragon.rtp}%</td><td>${SLOT_INFO.dragon.vol}</td><td class="n">${SLOT_INFO.dragon.hit}%</td></tr></table>
<p class="small">Volatility doesn't change the house edge. It changes how wide your results spread around it.</p>`,
drill(el){runDrill(el,this,{total:12,pass:.8,auto:false,gen(){
 const k=Math.random();
 if(k<.25){const f=pick([3,4,5,8,10]),n=f*pick([20,30,50]);return{html:`<p class="info big">Hit frequency <b>1 in ${f}</b>. You play <b>${n}</b> spins.</p><p class="ask">About how many winning spins should you expect?</p>`,type:'number',check:x=>x===n/f,explain:`${n} ÷ ${f} = <b>${n/f}</b> winning spins on average, many of them smaller than your bet.`}}
 if(k<.55){const lo={h:pick([38,42,45,48]),t:pick([200,400,500])},hi={h:pick([14,18,22]),t:pick([2500,5000,10000])},sw=Math.random()<.5,A=sw?hi:lo,B=sw?lo:hi,ans=sw?'A':'B';
  return{html:`<p class="info big">Both machines return 95%.</p><div class="vs"><div><b>Machine A</b><span>Hits ${A.h}% of spins</span><span>Top prize ${A.t.toLocaleString()}×</span></div><div><b>Machine B</b><span>Hits ${B.h}% of spins</span><span>Top prize ${B.t.toLocaleString()}×</span></div></div><p class="ask">Which is more volatile?</p>`,choices:[{v:'A',l:'Machine A'},{v:'B',l:'Machine B'}],check:x=>x===ans,
   explain:`<b>Machine ${ans}</b>: fewer, bigger wins. With the same RTP, the money saved from small hits funds the giant top prize.`}}
 const Q=pick([
  {q:'You have $100 and want it to last as long as possible at $1 a spin. Which machine fits best?',c:['Low volatility','High volatility','It makes no difference'],a:0,e:'Frequent small wins slow the drain, so low volatility usually lasts longer.'},
  {q:'You only care about a chance at a huge win and accept long dry spells. Which fits?',c:['High volatility','Low volatility','It makes no difference'],a:0,e:'High volatility concentrates the return into rare, large hits.'},
  {q:'Does higher volatility mean a higher house edge?',c:['No, it changes the spread, not the edge','Yes, always','Only on penny slots'],a:0,e:'Two machines can share an RTP with very different volatility.'},
  {q:'A machine pays something on 50% of spins. How often do you finish a spin ahead?',c:['Less often than 50%','Exactly 50%','More often than 50%'],a:0,e:'Many hits pay less than the bet. On Fruit Fiesta, about 27% of spins are wins smaller than the bet.'},
  {q:'After 100 spins on a 95% machine, your session return is 140%. What does that say about the machine?',c:['Almost nothing; 100 spins is far too few','It’s a loose machine','It will now pay less to catch up'],a:0,e:'Short sessions swing wildly. RTP only shows up over enormous numbers of spins.'}]);
 const ord=shuffle(Q.c.map((c,i)=>i));return{html:`<p class="info big">${Q.q}</p>`,choices:ord.map(i=>({v:String(i),l:Q.c[i]})),check:x=>+x===Q.a,explain:Q.e}}})}},

{id:'myths',level:'Intermediate',title:'Myths, Near Misses & LDWs',blurb:'The psychology built into the machine, and how to see through it.',goal:'Goal: 85% on 14 questions.',
lesson:`<h3>Losses disguised as wins</h3><p>On a 20-line slot, a spin can "win" less than it cost. Bet $1, hit a 40¢ line, and the machine flashes and plays a jingle. You still lost 60¢. Researchers call this a <b>loss disguised as a win (LDW)</b>. Every machine here shows an honest meter with your real net after each spin.</p>
<h3>Near misses</h3><p>Two 7s on the line with the third just above it feels like you almost won. You didn't: on a classic machine the blanks next to the 7 can have <b>6 times</b> the weight of the 7 itself, so that picture comes up far more often than the jackpot does.</p>
<h3>Anticipation</h3><p>When two bonus symbols land, modern slots slow the last reels and play rising music. The result was already decided at the press; the slowdown is presentation only.</p>
<h3>Myths</h3><ul><li><b>"It's due."</b> Machines have no memory. A cold machine is exactly as likely to pay as a hot one.</li><li><b>Stopping the reels</b> with a second tap only skips the animation.</li><li><b>Player cards</b> track your play for rewards. They don't change your odds.</li></ul>
<h3>Credits aren't cents</h3><p>A "penny" slot betting 300 credits costs <b>$3 a spin</b>. Machines show credits on purpose: they feel smaller than dollars.</p>`,
drill(el){runDrill(el,this,{total:14,pass:.85,auto:false,gen(){
 const k=Math.random();
 if(k<.3){const bet=pick([5,10,20,25,40]),w=1+rnd(bet-1);return{html:`<div class="ldwdemo"><div class="flashwin">WINNER! <b>${money(w)}</b></div><p>Bet: <b>${money(bet)}</b></p></div><p class="ask">The machine celebrates. What's your net for the spin?</p>`,type:'number',check:x=>x===w-bet,explain:`${money(w)} back on a ${money(bet)} bet = <b>−${money(bet-w)}</b>. A loss disguised as a win.`}}
 if(k<.5){const d=pick([[1,'1¢'],[5,'5¢']]),cr=d[0]===1?pick([100,200,300,400,500]):pick([20,40,60,100]),dol=cr*d[0]/100;return{html:`<p class="info big">A <b>${d[1]}</b> machine. You bet <b>${cr} credits</b> a spin.</p><p class="ask">How many dollars per spin is that?</p>`,type:'number',check:x=>x===dol,explain:`${cr} × ${d[1]} = <b>${money(dol)}</b> a spin.`}}
 const T=pick([
  ['A machine that hasn’t paid in hours is due for a big win.',false,'Each spin is independent. The RNG has no memory.'],
  ['Stopping the reels early with a second tap can change the result.',false,'The result is set the instant you press spin.'],
  ['Two 7s on the line and one just above means you nearly hit the jackpot.',false,'Blanks beside the 7 are weighted far heavier. It was never close.'],
  ['The result of a spin is decided the instant you press the button.',true,'The RNG picks the outcome, then the reels animate it.'],
  ['Using a player’s club card lowers your odds.',false,'Cards track play for comps. Payback is the same.'],
  ['A slot that pays something on 45% of spins puts you ahead on 45% of spins.',false,'Many of those hits pay less than the bet.'],
  ['When the last reels slow down with rising music, the bonus is more likely to land.',false,'The outcome is already fixed; the slowdown is only presentation.'],
  ['On a classic machine, the jackpot symbol can be set to land less often than the blanks around it.',true,'That is how virtual reels work.'],
  ['Free spins and bonus rounds are included in a machine’s RTP.',true,'Every feature is part of the stated return.'],
  ['Some classic machines need max coins to pay the full top jackpot.',true,'Liberty 7s pays 2,500 for 3 coins but 1,000 for 2.'],
  ['A streak of losses means a win is more likely on the next spin.',false,'Every spin has the same odds.'],
  ['Penny slots usually keep a bigger share than dollar slots.',true,'In Nevada, pennies held about 9%, more than any other denomination.']]);
 return{html:`<p class="info big">“${T[0]}”</p>`,choices:[{v:'t',l:'True'},{v:'f',l:'False'}],check:x=>(x==='t')===T[1],explain:`<b>${T[1]?'True.':'False.'}</b> ${T[2]}`}}})}},

{id:'classic',level:'Advanced',title:'Liberty 7s',blurb:'A classic three-reel machine. One line, cherries, bars and the 7 7 7 jackpot.',goal:'Mission: play 30 spins. Your credits are shared by all four machines (play money).',
lesson:`<h3>The classic stepper</h3><p>Three reels, one payline and a 1-, 2- or 3-coin bet. This is the design that ruled casino floors for decades.</p><ul><li><b>RTP ${SLOT_INFO.classic.rtp}%</b> (exact: every one of the 262,144 virtual combinations counted).</li><li><b>Hits ${SLOT_INFO.classic.hit}%</b> of spins, and every hit pays at least double your bet, so there are no disguised losses here.</li><li>The <b>3-coin 7 7 7</b> pays 2,500 instead of 1,500: max coin nudges RTP from 93.62% to 93.75%.</li><li>Watch for <b>near misses</b>: when a 7 sits just off the line, the honest meter explains why.</li></ul>`,
drill(el){slotMachine(el,'classic',this)}},

{id:'fiesta',level:'Advanced',title:'Fruit Fiesta',blurb:'A modern 5-reel, 20-line video slot with wilds and 3× free spins.',goal:'Mission: play 30 spins. Your credits are shared by all four machines (play money).',
lesson:`<h3>The video slot</h3><p>Five reels, 20 fixed paylines, wilds on reels 2–4 and a ⭐ scatter that pays anywhere and awards <b>10 free spins at 3×</b>.</p><ul><li><b>RTP ${SLOT_INFO.fiesta.rtp}%</b> · ${SLOT_INFO.fiesta.vol} volatility (from 6 million simulated spins).</li><li>It pays something on <b>${SLOT_INFO.fiesta.hit}%</b> of spins, but <b>${SLOT_INFO.fiesta.ldw}%</b> are wins smaller than your bet. Only ${SLOT_INFO.fiesta.net}% of spins actually put you ahead.</li><li>Free spins arrive about once every 190 spins and carry about 15% of the return.</li><li>Two stars on the early reels trigger the <b>anticipation</b> slowdown. Now you know it's theater.</li></ul>`,
drill(el){slotMachine(el,'fiesta',this)}},

{id:'temple',level:'Expert',title:'Temple Tumble',blurb:'243 ways to win, tumbling reels and a multiplier that climbs with every cascade.',goal:'Mission: play 30 spins. Your credits are shared by all four machines (play money).',
lesson:`<h3>Ways and tumbles</h3><p>There are no lines. Any symbol landing on adjacent reels from the left pays, in any row, which makes <b>243 ways</b> (3 × 3 × 3 × 3 × 3). Two crowns on one reel count twice.</p><ul><li><b>Tumbles:</b> winning symbols explode, everything above drops down and new symbols fall in. A new win tumbles again.</li><li>Each tumble raises the multiplier: <b>1× → 2× → 3× → 5×</b>.</li><li><b>3 ☀️</b> on reels 1, 3 and 5 start 10 free spins with a <b>3× → 6× → 9× → 15×</b> ladder.</li><li><b>RTP ${SLOT_INFO.temple.rtp}%</b> · ${SLOT_INFO.temple.vol} volatility · hits ${SLOT_INFO.temple.hit}% of spins.</li></ul>`,
drill(el){slotMachine(el,'temple',this)}},

{id:'dragon',level:'Expert',title:'Dragon’s Hoard',blurb:'The modern hit format: Hold & Spin respins and four progressive-style jackpots.',goal:'Mission: play 30 spins. Your credits are shared by all four machines (play money).',
lesson:`<h3>Hold & Spin</h3><p>The format behind many of today's most popular machines. The base game is a 243-ways slot with a pearl <b>WILD</b>, but the excitement is the coins.</p><ul><li>Land <b>6 or more coins</b> to start Hold & Spin. Coins lock in place and you get <b>3 respins</b>.</li><li>Every new coin <b>resets the respins to 3</b>.</li><li>Coins are worth 1×–15× your bet or a <b>MINI</b> (20×), <b>MINOR</b> (50×) or <b>MAJOR</b> (200×). Fill all 15 spots for the <b>GRAND</b> (1,000×).</li><li><b>RTP ${SLOT_INFO.dragon.rtp}%</b> · ${SLOT_INFO.dragon.vol} volatility. The feature arrives about once in 180 spins and carries about a quarter of the return, so expect long stretches of slow decline.</li></ul>
<p class="small">These jackpots are fixed multiples of your bet. Real "progressive" jackpots grow as people play, funded by a slice of every bet, which comes out of the base game's return.</p>`,
drill(el){slotMachine(el,'dragon',this)}}
];
