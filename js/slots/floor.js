"use strict";
/* Slots — the playable machines (stages 7–10). Play money only.
   One shared bankroll across machines, kept in the academy settings.
   Depends on: core.js, academy.js (store, save, markStage, keyHandler), machines.js, symbols.js */
const FLOOR={
 classic:{name:'Liberty 7s',tag:'Classic 3-reel · 1 payline',cols:3,rows:3,bets:[1,2,3],def:0,coin:true,mission:30},
 fiesta:{name:'Fruit Fiesta',tag:'5 reels · 20 lines · wilds · free spins',cols:5,rows:3,bets:[1,2,5,10,25],def:0,mission:30},
 temple:{name:'Temple Tumble',tag:'243 ways · tumbling reels · multipliers',cols:5,rows:3,bets:[1,2,5,10,25],def:0,mission:30},
 dragon:{name:'Dragon’s Hoard',tag:'243 ways · Hold & Spin · 4 jackpots',cols:5,rows:3,bets:[1,2,5,10,25],def:0,mission:30}
};
const START_BANK=1000;
const bankGet=()=>{const v=store.settings.slotBank;return v==null?START_BANK:+v};
const bankSet=v=>{store.settings.slotBank=Math.round(v*100)/100;save()};
const setOn=(k,d)=>{const v=store.settings[k];return v==null?d:v==='on'};

/* ---------- tiny synth (no audio files) ---------- */
const SFX={ctx:null,
 t(f,d=.08,type='square',v=.035,at=0){if(!setOn('slotSound',true))return;try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();const c=this.ctx;if(c.state==='suspended')c.resume();const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at;o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.03)}catch(e){}},
 stop(){this.t(150,.07,'triangle',.07)},
 tease(){[330,392,440,494].forEach((f,i)=>this.t(f,.12,'sine',.03,i*.09))},
 win(){[523,659,784].forEach((f,i)=>this.t(f,.13,'square',.03,i*.07))},
 big(){[392,523,659,784,1047,784,1047,1319].forEach((f,i)=>this.t(f,.2,'square',.035,i*.11))},
 coin(){this.t(1500,.05,'sine',.05);this.t(2000,.08,'sine',.04,.05)},
 feature(){[262,330,392,523,659,784,1047].forEach((f,i)=>this.t(f,.22,'sawtooth',.025,i*.09))},
 click(){this.t(700,.03,'triangle',.025)}
};

function slotMachine(el,id,stage){
 const F=FLOOR[id],I=SLOT_INFO[id];
 const S={bet:F.bets[F.def],busy:false,auto:0,free:0,freeTotal:0,freeMult:1,round:0,grid:null,hist:[bankGet()],
  sess:{spins:0,wag:0,ret:0,hits:0,ldw:0,big:0,features:0}};
 const spinsKey='slots.spins.'+id;
 const lifetime=()=>+(store.settings[spinsKey]||0);
 const betLabel=b=>F.coin?`${b} coin${b>1?'s':''} · ${money(b)}`:money(b);
 /* ---------- initial grid ---------- */
 function randomGrid(){
  if(id==='classic')return CL_REELS.map((r,i)=>classicWindow(i,wpick(r.weights)));
  if(id==='fiesta')return fiestaGrid();
  if(id==='temple')return templeGrid(false);
  return dragonGrid().map(c=>c.map(x=>typeof x==='object'?FILLER.dragon():x));
 }
 S.grid=randomGrid();
 const jackpots=()=>id!=='dragon'?'':`<div class="jps">${['MINI','MINOR','MAJOR','GRAND'].map(k=>`<div class="jp ${k.toLowerCase()}"><small>${k}</small><b>${money(DR_JP[k]*S.bet)}</b></div>`).join('')}</div>`;
 const ladder=()=>id!=='temple'?'':`<div class="ladder">${(TE_MULT).map((m,i)=>`<span data-i="${i}">${m}×</span>`).join('')}</div>`;
 el.innerHTML=`<div class="slot m-${id}" style="--cols:${F.cols};--rows:${F.rows}">
  <div class="marquee"><div class="bulbs">${Array.from({length:18},(_,i)=>`<i style="animation-delay:${(i%3)*.25}s"></i>`).join('')}</div><h3>${F.name}</h3><p>${F.tag}</p></div>
  <div class="topinfo">${jackpots()}${ladder()}<div class="freebar" hidden></div></div>
  <div class="reelwin"><div class="reels">${S.grid.map(()=>`<div class="reel"><div class="strip"></div></div>`).join('')}</div>${id==='classic'?'<div class="payline"></div>':''}<div class="ovl"></div><div class="banner" hidden></div><div class="fx"></div></div>
  <div class="msg" aria-live="polite">Press <b>SPIN</b> or the space bar. Play money only.</div>
  <div class="meters"><div><small>Credits</small><b class="m-bank"></b></div><div><small>Bet</small><b class="m-bet"></b></div><div><small>Win</small><b class="m-win">$0</b></div></div>
  <div class="controls">
   <div class="betctl"><button class="btn sm b-down" aria-label="lower bet">−</button><button class="btn sm b-up" aria-label="raise bet">+</button></div>
   <button class="spinbtn" aria-label="spin"><span>SPIN</span></button>
   <div class="side"><button class="btn sm b-auto">Auto</button><button class="btn sm b-turbo">⚡ Turbo</button><button class="btn sm b-snd">🔊</button><button class="btn sm b-pay">Paytable</button></div>
  </div>
  <div class="honest"></div>
  <button class="btn sm b-refill" hidden>Refill to $1,000 (play money)</button>
 </div>
 <div class="paytable" hidden></div>
 <div class="sess"></div>`;
 const reels=[...el.querySelectorAll('.reel')],win=$('.reelwin',el),ovl=$('.ovl',el),banner=$('.banner',el),fx=$('.fx',el),msgEl=$('.msg',el),slot=$('.slot',el);
 const cellHTML=s=>`<div class="cell">${symHTML(id,s,S.bet)}</div>`;
 function setReel(r,col){const st=reels[r].firstElementChild;st.style.transform='';st.innerHTML=cellHTML(FILLER[id]())+col.map(cellHTML).join('')}
 const cellEl=(r,k)=>reels[r].firstElementChild.children[k+1];
 S.grid.forEach((c,r)=>setReel(r,c));
 const msg=h=>{msgEl.innerHTML=h};
 /* ---------- meters, stats, paytable ---------- */
 function meters(){
  $('.m-bank',el).textContent=money(bankGet());$('.m-bet',el).textContent=betLabel(S.bet);
  const lock=S.busy||S.fs;
  $('.b-down',el).disabled=lock||S.bet===F.bets[0];$('.b-up',el).disabled=lock||S.bet===F.bets[F.bets.length-1];
  $('.spinbtn',el).disabled=S.busy&&!S.auto;$('.spinbtn span',el).textContent=S.auto?'STOP':S.fs?'FREE':'SPIN';
  $('.b-auto',el).textContent=S.auto?`Auto ${S.auto}`:'Auto';$('.b-auto',el).classList.toggle('on',!!S.auto);
  $('.b-turbo',el).classList.toggle('on',setOn('slotTurbo',false));$('.b-snd',el).textContent=setOn('slotSound',true)?'🔊':'🔇';
  $('.b-refill',el).hidden=!(bankGet()<F.bets[0]&&!S.busy);
  const tj=$('.topinfo .jps',el);if(tj)tj.outerHTML=jackpots();
 }
 function spark(){const h=S.hist.slice(-200);if(h.length<2)return'';const mn=Math.min(...h),mx=Math.max(...h),rg=mx-mn||1;
  const pts=h.map((v,i)=>`${(i/(h.length-1)*300).toFixed(1)},${(56-(v-mn)/rg*50).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 300 60" preserveAspectRatio="none"><polyline points="${pts}"/></svg><div class="sparkl"><span>${money(mn)}</span><span>Credits, last ${h.length-1} spins</span><span>${money(mx)}</span></div>`}
 function stats(){
  const s=S.sess,ret=s.wag?s.ret/s.wag*100:0,n=lifetime(),need=F.mission;
  $('.sess',el).innerHTML=`<div class="mission ${n>=need?'done':''}"><div><b>${n>=need?'🏆 Stage passed':'Mission'}</b> · ${n>=need?'keep playing as long as you like':`play ${need} spins on ${F.name}`}</div><div class="mbar"><div style="width:${Math.min(100,n/need*100)}%"></div></div><small>${Math.min(n,need)} / ${need}</small></div>
  <div class="sgrid2">
   <div><small>Spins</small><b>${s.spins}</b></div><div><small>Wagered</small><b>${money(s.wag)}</b></div><div><small>Returned</small><b>${money(s.ret)}</b></div>
   <div><small>Session return</small><b class="${s.wag?(ret>=100?'pos':'neg'):''}">${s.wag?ret.toFixed(1)+'%':'—'}</b></div><div><small>Machine RTP</small><b>${I.rtp}%</b></div><div><small>Volatility</small><b>${I.vol}</b></div>
   <div><small>Hit rate</small><b>${s.spins?(s.hits/s.spins*100).toFixed(0)+'%':'—'}</b></div><div><small>Losses disguised as wins</small><b>${s.ldw}</b></div><div><small>Biggest win</small><b>${money(s.big)}</b></div>
  </div>${spark()}
  <p class="small">Your session return will swing far above and below ${I.rtp}%. RTP only shows up over hundreds of thousands of spins; that gap is what volatility means.</p>`;
 }
 function paytable(){
  const b=S.bet;let h='';
  if(id==='classic')h=`<table><tr><th>Line</th><th>Pays (coins)</th></tr>${CL_PAYTABLE.map(([a,p])=>`<tr><td>${a.replace(/7 7 7/,'<b class="c7 sm">7</b><b class="c7 sm">7</b><b class="c7 sm">7</b>')}</td><td class="n">${p.includes('/')?p+' <small>(1/2/3 coins)</small>':'× '+p+' per coin'}</td></tr>`).join('')}</table><p class="small">Pays on the middle line only. The 3-coin 7 7 7 pays 2,500 instead of 1,500, so the max bet adds a little RTP (93.62% → 93.75%).</p>`;
  if(id==='fiesta')h=`<table><tr><th>Symbol</th><th>×3</th><th>×4</th><th>×5</th></tr>${Object.entries(FI_PAYS).map(([k,p])=>`<tr><td><span class="pt">${symHTML('fiesta',k)}</span> ${symName('fiesta',k)}</td>${p.map(x=>`<td class="n">${money(x*b/20)}</td>`).join('')}</tr>`).join('')}</table><p class="small">Line wins pay left to right on any of 20 lines (amounts shown for your ${money(b)} bet, ${money(b/20)} per line). <b>WILD</b> (reels 2–4) stands in for any fruit. <b>3 / 4 / 5 ⭐</b> anywhere pay ${FI_SCAT.slice(3).map(x=>money(x*b)).join(' / ')} and award <b>10 free spins at 3×</b> (they can retrigger).</p>`;
  if(id==='temple')h=`<table><tr><th>Symbol</th><th>×3</th><th>×4</th><th>×5</th></tr>${Object.entries(TE_PAYS).map(([k,p])=>`<tr><td><span class="pt">${symHTML('temple',k)}</span> ${symName('temple',k)}</td>${p.map(x=>`<td class="n">${money(x*b/20)}</td>`).join('')}</tr>`).join('')}</table><p class="small">243 ways: a symbol on adjacent reels from the left pays, in any row. Two on a reel doubles the ways. Winning symbols explode and new ones tumble in; the multiplier climbs <b>1× → 2× → 3× → 5×</b> per tumble. <b>3 ☀️</b> on reels 1, 3 and 5 award <b>10 free spins</b> with a <b>3× → 6× → 9× → 15×</b> ladder.</p>`;
  if(id==='dragon')h=`<table><tr><th>Symbol</th><th>×3</th><th>×4</th><th>×5</th></tr>${Object.entries(DR_PAYS).map(([k,p])=>`<tr><td><span class="pt">${symHTML('dragon',k)}</span> ${symName('dragon',k)}</td>${p.map(x=>`<td class="n">${money(x*b/20)}</td>`).join('')}</tr>`).join('')}</table><p class="small">243 ways, with a <b>WILD</b> pearl on reels 2–4. <b>6 or more coins</b> start <b>Hold & Spin</b>: coins lock, you get 3 respins, and every new coin resets the count to 3. Coins are worth 1×–15× your bet or a MINI (20×), MINOR (50×) or MAJOR (200×) jackpot. Fill all 15 spots for the <b>GRAND (1,000×)</b>. Coins pay only in the feature.</p>`;
  $('.paytable',el).innerHTML=`<h4>${F.name} paytable</h4>${h}<p class="small">RTP ${I.rtp}% · ${I.vol} volatility · hits ${I.hit}% of spins${I.ldw?`, but ${I.ldw}% of spins are wins smaller than the bet`:''}.</p>`;
 }
 /* ---------- reel animation ---------- */
 const turbo=()=>setOn('slotTurbo',false);
 async function spinTo(grid,tease=[]){
  const cell=reels[0].clientHeight/F.rows,base=turbo()?240:560,stag=turbo()?80:170;
  await Promise.all(reels.map((reel,r)=>{
   const st=reel.firstElementChild,cur=S.grid[r],extra=tease[r]?16:0,k=8+r*(turbo()?2:4)+extra;
   const seq=[FILLER[id](),...grid[r],...Array.from({length:k},()=>FILLER[id]()),...cur];
   st.innerHTML=seq.map(cellHTML).join('');
   reel.classList.add('spinning');
   const dur=base+r*stag+extra*(turbo()?25:70);
   if(tease[r])setTimeout(()=>{if(reel.isConnected){reel.classList.add('tease');SFX.tease()}},base+(r-1)*stag);
   const a=st.animate([{transform:`translateY(${-(1+F.rows+k)*cell}px)`},{transform:`translateY(${-cell}px)`}],{duration:dur,easing:'cubic-bezier(.22,.15,.3,1.1)'});
   return a.finished.then(()=>{reel.classList.remove('spinning','tease');setReel(r,grid[r]);SFX.stop()});
  }));
  S.grid=grid.map(c=>c.slice());
 }
 function hit(cells){cells.forEach(([r,k])=>{const c=cellEl(r,k);if(c)c.classList.add('hit')})}
 function clearWins(){ovl.innerHTML='';el.querySelectorAll('.cell.hit').forEach(c=>c.classList.remove('hit'))}
 function showBanner(title,amt,cls=''){
  banner.className='banner '+cls;banner.hidden=false;banner.innerHTML=`<b>${title}</b>${amt!=null?`<span class="amt">${money(0)}</span>`:''}`;
  if(amt!=null){const a=$('.amt',banner),t0=performance.now(),d=turbo()?600:1400;(function step(t){const p=Math.min(1,(t-t0)/d);a.textContent=money(amt*(1-Math.pow(1-p,3)));if(p<1&&banner.isConnected)requestAnimationFrame(step)})(t0)}
  if(/big|huge|mega|grand/.test(cls)){fx.innerHTML=Array.from({length:28},()=>`<i style="left:${Math.random()*100}%;animation-delay:${Math.random()*.6}s;animation-duration:${1.2+Math.random()}s"></i>`).join('');setTimeout(()=>{fx.innerHTML=''},2600)}
  return sleep(turbo()?900:1900).then(()=>{banner.hidden=true});
 }
 const pause=ms=>sleep(turbo()?ms*.45:ms);
 const pay=v=>{const x=Math.round(v*100)/100;if(x>0){bankSet(bankGet()+x);S.round+=x;$('.m-win',el).textContent=money(S.round);$('.m-bank',el).textContent=money(bankGet())}return x};
 const tierOf=x=>x>=50*S.bet?['MEGA WIN','mega']:x>=25*S.bet?['HUGE WIN','huge']:x>=10*S.bet?['BIG WIN','big']:null;

 /* ---------- one play of each machine (returns when presentation is done) ---------- */
 async function playClassic(){
  const r=classicSpin(),grid=r.stops.map((s,i)=>classicWindow(i,s));await spinTo(grid);
  const coins=S.bet,p=classicPay(r.line,coins);
  if(p){const chOnly=!r.line.every(x=>x!=='CH')&&!(r.line.every(x=>isBar(x)||x==='7'));hit(r.line.map((x,i)=>[i,1]).filter(([i])=>!chOnly||r.line[i]==='CH'));win.classList.add('lit');SFX.win();pay(p);
   msg(`<b>${r.line.map(x=>symName('classic',x)).join(' · ')}</b> pays <b>${p} coin${p>1?'s':''}</b> (${money(p)}).`)}
  else{const near=grid.some((c,i)=>c[1]!=='7'&&(c[0]==='7'||c[2]==='7'))&&r.line.includes('7');
   msg(near?'So close? A 7 sat right next to the line. <span class="small">Not really close: the blanks beside each 7 carry 6× the weight of the 7 itself. See stage 6.</span>':'No win this spin.')}
 }
 async function playFiesta(){
  const g=fiestaGrid(),tease=[];let sc=0;g.forEach((c,r)=>{tease[r]=sc>=2;sc+=c.filter(x=>x==='S').length});
  await spinTo(g,tease);
  const ev=fiestaEval(g),lb=S.bet/20,m=S.fs?FI_FREE_MULT:1;
  if(ev.wins.length){ovl.innerHTML=linesSVG(ev.wins.map(w=>({rows:FI_LINES[w.line],color:LINE_COLORS[w.line%LINE_COLORS.length]})));
   ev.wins.forEach(w=>hit(FI_LINES[w.line].slice(0,w.len).map((k,r)=>[r,k])))}
  if(ev.scat.length>=3)hit(ev.scat);
  const x=pay(ev.total*lb*m);
  if(x){SFX.win();const top=ev.wins.slice().sort((a,b)=>b.pay-a.pay).slice(0,2).map(w=>`Line ${w.line+1}: ${w.len} × ${symHTML('fiesta',w.sym)} ${money(w.pay*lb*m)}`).join(' · ');
   msg(`${top}${ev.wins.length>2?` · +${ev.wins.length-2} more line${ev.wins.length>3?'s':''}`:''}${ev.scatPay?` · ⭐ scatter ${money(ev.scatPay*lb*m)}`:''}${m>1?' <b>(3× free spin)</b>':''}`)}
  else msg(S.fs?'Free spin: no win.':'No win this spin.');
  if(ev.free){await pause(700);S.free+=ev.free;SFX.feature();if(!S.inFree)S.sess.features++;await showBanner(S.inFree?`+${ev.free} FREE SPINS`:`${ev.free} FREE SPINS · ALL WINS 3×`,null,'feature');S.inFree=true}
  return x;
 }
 async function playTemple(){
  const free=!!S.fs,s=templeSpin(free),lad=free?TE_FMULT:TE_MULT;
  const setLad=i=>el.querySelectorAll('.ladder span').forEach(x=>x.classList.toggle('on',+x.dataset.i===Math.min(i,3)));
  setLad(0);await spinTo(s.steps[0].grid);let tot=0;
  for(let i=0;i<s.steps.length;i++){
   const st=s.steps[i];if(!st.wins.length)break;setLad(i);
   hit(st.gone.map(x=>x.split(',').map(Number)));SFX.win();
   const x=pay(st.win*S.bet/20);tot+=x;
   msg(`${i?`Tumble ${i} · `:''}${st.wins.map(w=>`${w.len} × ${symHTML('temple',w.sym)} ×${w.ways} way${w.ways>1?'s':''}`).join(' · ')} · <b>${lad[Math.min(i,3)]}×</b> = ${money(x)}`);
   await pause(800);
   st.gone.forEach(g=>{const[r,k]=g.split(',').map(Number);const c=cellEl(r,k);if(c)c.classList.add('pop')});SFX.coin();
   await pause(380);
   await tumbleTo(st.grid,st.gone,s.steps[i+1].grid);
  }
  if(s.steps.length>1)msg(`${s.steps.length-1} tumble${s.steps.length>2?'s':''}: ${money(tot)} total${free?' (free spin)':''}.`);else msg(free?'Free spin: no win.':'No win this spin.');
  if(s.free){const sc=[];S.grid.forEach((c,r)=>c.forEach((x,k)=>{if(x==='S')sc.push([r,k])}));hit(sc);await pause(700);S.free+=s.free;S.sess.features++;S.inFree=true;SFX.feature();
   $('.ladder',el).outerHTML=`<div class="ladder free">${TE_FMULT.map((m,i)=>`<span data-i="${i}">${m}×</span>`).join('')}</div>`;
   await showBanner('10 FREE SPINS · 3× 6× 9× 15×',null,'feature')}
  return tot;
 }
 /* drop animation: survivors fall into place, new symbols fall from above */
 async function tumbleTo(old,gone,next){
  const cell=reels[0].clientHeight/F.rows,gs=new Set(gone),anims=[];
  next.forEach((col,r)=>{
   const keep=old[r].map((x,k)=>k).filter(k=>!gs.has(r+','+k)),n=F.rows-keep.length;
   setReel(r,col);if(!n)return;
   col.forEach((x,j)=>{const shift=j<n?n:j-keep[j-n];if(!shift)return;const c=cellEl(r,j);
    anims.push(c.animate([{transform:`translateY(${-shift*cell}px)`},{transform:'translateY(0)'}],{duration:(turbo()?160:300)+shift*60,easing:'cubic-bezier(.3,0,.5,1.25)'}).finished)});
  });
  S.grid=next.map(c=>c.slice());await Promise.all(anims);
 }
 async function playDragon(){
  const g=dragonGrid(),tease=[];let co=0;g.forEach((c,r)=>{tease[r]=co>=4;co+=c.filter(x=>typeof x==='object').length});
  await spinTo(g,tease);
  const ev=dragonEval(g);let x=0;
  if(ev.wins.length){ev.wins.forEach(w=>hit(w.cells));SFX.win();x+=pay(ev.sum*S.bet/20);
   msg(ev.wins.map(w=>`${w.len} × ${symHTML('dragon',w.sym)} ×${w.ways} way${w.ways>1?'s':''} = ${money(w.pay*S.bet/20)}`).join(' · '))}
  else msg(ev.coins?`${ev.coins} coin${ev.coins>1?'s':''}. Six or more start Hold & Spin.`:'No win this spin.');
  if(ev.trigger){await pause(600);x+=await holdSpin(g)}
  return x;
 }
 async function holdSpin(g){
  S.sess.features++;SFX.feature();await showBanner('HOLD & SPIN',null,'feature');
  slot.classList.add('holding');
  const h=holdAndSpin(g);
  const cellOf=(r,k)=>cellEl(r,k);
  g.forEach((c,r)=>c.forEach((x,k)=>{const el2=cellOf(r,k);if(typeof x==='object')el2.classList.add('locked');else el2.innerHTML=''}));
  const bar=$('.freebar',el);bar.hidden=false;
  const show=left=>{bar.innerHTML=`Respins left ${[1,2,3].map(i=>`<i class="${i<=left?'on':''}"></i>`).join('')}`};show(3);
  for(const f of h.frames){
   el.querySelectorAll('.cell:not(.locked)').forEach(c=>c.classList.add('roll'));
   await pause(650);el.querySelectorAll('.cell.roll').forEach(c=>c.classList.remove('roll'));
   f.landed.forEach(([r,k])=>{const c=cellOf(r,k);c.innerHTML=coinHTML(f.board[r][k],S.bet);c.classList.add('locked','pop-in');SFX.coin()});
   show(f.left);if(f.landed.length){bar.classList.add('reset');setTimeout(()=>bar.classList.remove('reset'),500)}
   await pause(f.landed.length?650:420);
  }
  if(h.full){await showBanner('GRAND JACKPOT',DR_GRAND*S.bet,'grand')}
  const x=pay(h.sum*S.bet);
  msg(`Hold & Spin collected <b>${money(x)}</b>${h.full?' including the GRAND':''}.`);
  bar.hidden=true;
  S.grid=h.frames.length?h.frames[h.frames.length-1].board.map(c=>c.map(x=>x||FILLER.dragon())):S.grid;
  return x;
 }
 /* ---------- a full paid round (plus any free spins it awards) ---------- */
 async function round(){
  if(S.busy)return;
  if(bankGet()<S.bet){msg('Not enough credits for that bet. Lower the bet or refill.');S.auto=0;meters();return}
  S.busy=true;S.round=0;S.inFree=false;S.freeTotal=0;bankSet(bankGet()-S.bet);S.sess.spins++;S.sess.wag+=S.bet;
  store.settings[spinsKey]=lifetime()+1;save();
  $('.m-win',el).textContent='$0';$('.honest',el).innerHTML='';win.classList.remove('lit');clearWins();meters();
  const play={classic:playClassic,fiesta:playFiesta,temple:playTemple,dragon:playDragon}[id];
  await play();if(!el.isConnected)return;
  if(S.free>0){
   const bar=$('.freebar',el);bar.hidden=false;let n=0;S.fs=true;slot.classList.add('freemode');meters();
   while(S.free>0&&el.isConnected){S.free--;n++;bar.innerHTML=`Free spin ${n} · ${S.free} left · won ${money(S.freeTotal)}`;await pause(500);clearWins();
    const before=S.round;await play();S.freeTotal+=S.round-before;bar.innerHTML=`Free spin ${n} · ${S.free} left · won ${money(S.freeTotal)}`;await pause(500)}
   if(!el.isConnected)return;
   S.fs=false;slot.classList.remove('freemode');bar.hidden=true;if(id==='temple')$('.ladder',el).outerHTML=`<div class="ladder">${TE_MULT.map((m,i)=>`<span data-i="${i}">${m}×</span>`).join('')}</div>`;
   await showBanner('FREE SPINS WON',S.freeTotal,'feature');
  }
  slot.classList.remove('holding');el.querySelectorAll('.cell.locked').forEach(c=>c.classList.remove('locked','pop-in'));
  const x=Math.round(S.round*100)/100,t=tierOf(x);
  if(t){SFX.big();await showBanner(t[0],x,t[1])}
  S.sess.ret+=x;if(x>0)S.sess.hits++;if(x>0&&x<S.bet)S.sess.ldw++;S.sess.big=Math.max(S.sess.big,x);S.hist.push(bankGet());
  const net=Math.round((x-S.bet)*100)/100;
  $('.honest',el).innerHTML=x===0?`Bet ${money(S.bet)} · returned $0 · <b class="neg">net −${money(S.bet)}</b>`:
   `Bet ${money(S.bet)} · returned ${money(x)} · <b class="${net>0?'pos':net<0?'neg':''}">net ${net>0?'+':net<0?'−':''}${money(Math.abs(net))}</b>${x<S.bet?' <span class="ldw">Loss disguised as a win</span>':''}`;
  if(lifetime()>=F.mission){const d=store.done[stage.id];if(!(d&&d.passed)){markStage(stage,1,true);msg(msgEl.innerHTML+' 🏆 <b>Stage passed!</b>')}}
  S.busy=false;stats();meters();
  if(S.auto>0){S.auto--;meters();if(S.auto>0&&bankGet()>=S.bet){await sleep(turbo()?150:450);if(el.isConnected&&S.auto>0&&!S.busy)round()}else{S.auto=0;meters()}}
 }
 /* ---------- controls ---------- */
 $('.spinbtn',el).onclick=()=>{if(S.auto){S.auto=0;meters();return}round()};
 $('.b-down',el).onclick=()=>{S.bet=F.bets[Math.max(0,F.bets.indexOf(S.bet)-1)];SFX.click();refreshBet()};
 $('.b-up',el).onclick=()=>{S.bet=F.bets[Math.min(F.bets.length-1,F.bets.indexOf(S.bet)+1)];SFX.click();refreshBet()};
 function refreshBet(){meters();paytable()}
 $('.b-auto',el).onclick=()=>{const seq=[0,10,25,50];S.auto=seq[(seq.indexOf(S.auto)+1)%seq.length]||0;meters();if(S.auto&&!S.busy){S.auto++;round()}};
 $('.b-turbo',el).onclick=()=>{store.settings.slotTurbo=turbo()?'off':'on';save();meters()};
 $('.b-snd',el).onclick=()=>{store.settings.slotSound=setOn('slotSound',true)?'off':'on';save();meters();SFX.click()};
 $('.b-pay',el).onclick=()=>{const p=$('.paytable',el);p.hidden=!p.hidden;$('.b-pay',el).classList.toggle('on',!p.hidden)};
 $('.b-refill',el).onclick=()=>{bankSet(START_BANK);S.hist.push(START_BANK);meters();stats();msg('Credits refilled to $1,000. Still play money.')};
 banner.onclick=()=>{banner.hidden=true};
 keyHandler=e=>{if(e.code==='Space'||e.key===' '){e.preventDefault();$('.spinbtn',el).click()}};
 meters();stats();paytable();
}
