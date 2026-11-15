"use strict";
/* Casino Academy — builds the dashboard and runs the rules sheet.
   Depends on: shared/progress.js, components.js, games-data.js */
/* ---------- progress (read from js/shared/progress.js) ---------- */
function progressHTML(g){
 if(g.status!=='live')return `<div class="tprog soon"><div class="tprog-top"><span>${g.stages} training stages planned</span></div></div>`;
 const n=Math.min(Progress.passed(g.id),g.stages),pct=n/g.stages*100;
 const label=n===0?'Not started':n===g.stages?'Mastered 🏆':`${n} of ${g.stages} stages passed`;
 return `<div class="tprog ${n===g.stages?'done':''}"><div class="tprog-top"><span>${label}</span><b>${Math.round(pct)}%</b></div><div class="tprog-bar"><div style="--w:${pct}%"></div></div></div>`;
}
/* ---------- build page ---------- */
$('#ticker').innerHTML=(TIPS.map(t=>`<span>✦ ${t}</span>`).join('')).repeat(2);
['#bt','#bb'].forEach(id=>{$(id).innerHTML=Array.from({length:34},(_,i)=>`<i style="animation-delay:${(i%6)*.22}s"></i>`).join('')});
$('#heroCards').innerHTML=[['A♠',6,18,-14],['K♥',88,14,12],['7♦',4,70,10],['Q♣',90,66,-10]].map(([c,x,y,r])=>mc(c).replace('class="mc',`style="left:${x}%;top:${y}%;transform:rotate(${r}deg);--r2:${r+6}deg;animation-delay:${Math.random()*3}s" class="mc`)).join('');
$('#floaties').innerHTML=Array.from({length:14},()=>{const s=['♠','♥','♦','♣','◆','●'][Math.floor(Math.random()*6)];return `<span class="floaty" style="left:${Math.random()*100}%;animation-duration:${18+Math.random()*22}s;animation-delay:${-Math.random()*30}s;color:${s==='♥'||s==='♦'?'#f43f5e':'#c4b5fd'};font-size:${18+Math.random()*26}px">${s}</span>`}).join('');
$('#filters').innerHTML=CATS.map(([k,l],i)=>`<button data-c="${k}" class="${i?'':'on'}">${l}</button>`).join('');
$('#tiles').innerHTML=GAMES.map((g,i)=>`<a class="tile" href="#${g.id}" data-cat="${g.cat}" style="--c1:${g.c1};--c2:${g.c2};--d:${i*.06}s"><div class="art">${g.icon()}</div><div class="tbody"><div class="badges">${g.status==='live'?'<span class="badge live">● Trainer live</span>':'<span class="badge soon">Trainer coming soon</span>'}<span class="badge">${g.diff}</span></div><h3>${g.name}</h3><p>${g.tag}</p><div class="meta"><div>House edge<b>${g.edge}</b></div><div style="text-align:right">Skill matters<div class="pips" style="justify-content:flex-end">${[1,2,3,4,5].map(n=>`<i class="${n<=g.skill?'on':''}"></i>`).join('')}</div></div></div>${progressHTML(g)}<span class="learn">Rules & strategy <span>→</span></span></div></a>`).join('');
const live=GAMES.filter(g=>g.status==='live').length;
function countUp(el,to){let n=0;if(to<=0){el.textContent=0;return}const t=setInterval(()=>{n++;el.textContent=n;if(n>=to)clearInterval(t)},70)}
countUp($('#sGames'),GAMES.length);countUp($('#sLive'),live);
const totalPassed=GAMES.filter(g=>g.status==='live').reduce((a,g)=>a+Math.min(Progress.passed(g.id),g.stages),0);countUp($('#sPassed'),totalPassed);
// filters
$('#filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#filters button').forEach(x=>x.classList.toggle('on',x===b));const c=b.dataset.c;document.querySelectorAll('.tile').forEach(t=>t.classList.toggle('hide',c!=='all'&&t.dataset.cat!==c))});
// tilt + glare
if(matchMedia('(hover:hover)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 document.querySelectorAll('.tile').forEach(t=>{t.addEventListener('mousemove',e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;t.style.setProperty('--ry',((x-.5)*10)+'deg');t.style.setProperty('--rx',((.5-y)*8)+'deg');t.style.setProperty('--gx',x*100+'%');t.style.setProperty('--gy',y*100+'%')});t.addEventListener('mouseleave',()=>{t.style.setProperty('--rx','0deg');t.style.setProperty('--ry','0deg')})});
}
// re-roll dice on hover
document.querySelectorAll('.tile[data-cat="dice"]').forEach(t=>t.addEventListener('mouseenter',()=>{t.querySelector('.dice').innerHTML=die(1+Math.floor(Math.random()*6))+die(1+Math.floor(Math.random()*6))}));
// odds chart
const max=Math.max(...ODDS.map(o=>o[2]));
$('#odds').innerHTML=ODDS.map(([g,b,v,c])=>`<div class="bar-row"><div class="lab"><b>${g}</b> · ${b}</div><div class="track"><div class="fill" data-w="${Math.max(1.5,Math.sqrt(v/max)*100)}" style="background:linear-gradient(90deg,${c},${c}99)"></div></div><div class="v" style="color:${v<1.5?'var(--good)':v<4?'#fde68a':'var(--bad)'}">${v.toFixed(2)}%</div></div>`).join('')+`<div class="legend"><span><i style="background:var(--good)"></i>Under 1.5% — best bets</span><span><i style="background:#fde68a"></i>1.5–4%</span><span><i style="background:var(--bad)"></i>Over 4% — avoid</span><span>Bars use a square-root scale so small edges stay visible.</span></div>`;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.fill').forEach((f,i)=>setTimeout(()=>f.style.width=f.dataset.w+'%',i*70));io.unobserve(e.target)}}),{threshold:.25});
io.observe($('#odds'));

/* ---------- rules sheet ---------- */
const ranksHTML=()=>`<p>Standard poker hand rankings, best to worst:</p><table class="ranks"><tr><th>#</th><th>Hand</th><th>Example</th></tr>${RANKS.map(([n,ex,d],i)=>`<tr><td class="n">${i+1}</td><td><b>${n}</b><br><small style="color:var(--muted)">${d}</small></td><td><div class="mcs">${ex.split(' ').map(mc).join('')}</div></td></tr>`).join('')}</table>`;
const TABS=[['overview','Overview'],['how','How to play'],['pay','Payouts'],['strat','Strategy'],['practice','Practice']];
let current=null,lastFocus=null;
function openGame(g){
 current=g;const sh=$('#sheet');sh.style.setProperty('--c1',g.c1);sh.style.setProperty('--c2',g.c2);
 $('#pico').innerHTML=g.icon();$('#ptitle').textContent=g.name;$('#ptag').textContent=g.tag;
 $('#ptabs').innerHTML=TABS.map(([k,l])=>`<button data-t="${k}">${k==='pay'&&g.pay==='RANKS'?'Hand rankings':l}</button>`).join('');
 $('#pfoot').innerHTML=g.status==='live'?`<small>${Progress.passed(g.id)?`Your progress: ${Math.min(Progress.passed(g.id),g.stages)} of ${g.stages} stages passed`:'Interactive trainer available now'}</small><a class="btn primary" href="${g.href}">${Progress.passed(g.id)?'Continue':'Open'} ${g.name} trainer →</a>`:`<small>Trainer in development. Learn the rules now and be ready.</small><button class="btn" data-t="practice">See the planned drills</button>`;
 tab('overview');lastFocus=document.activeElement;sh.classList.add('open');sh.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#pclose').focus();
}
function tab(k){if(!current)return;document.querySelectorAll('#ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k));const g=current;let h;
 if(k==='practice')h=`<h4>${g.status==='live'?'Ready to play':'What the trainer will include'}</h4><ul>${g.practice.map(p=>`<li>${p}</li>`).join('')}</ul>${g.status==='live'?`<div class="callout">Start at stage 1 and work up. Each stage unlocks the next once you hit the pass mark.</div>`:`<div class="callout">This trainer is next in the build queue. Every trainer follows the same path: rules → drills → strategy → full table.</div>`}`;
 else if(k==='pay'&&g.pay==='RANKS')h=ranksHTML();else h=g[k];
 $('#pbody').innerHTML=h;$('#pbody').scrollTop=0}
function closeSheet(){const sh=$('#sheet');sh.classList.remove('open');sh.setAttribute('aria-hidden','true');document.body.style.overflow='';current=null;if(lastFocus)lastFocus.focus()}
$('#ptabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)});
$('#pfoot').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b)tab(b.dataset.t)});
$('#pclose').onclick=()=>{history.replaceState(null,'',location.pathname);closeSheet()};
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')$('#pclose').click()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&current)$('#pclose').click()});
$('#browse').onclick=e=>{e.preventDefault();$('#games-grid').scrollIntoView({behavior:'smooth'})};
function route(){const g=GAMES.find(x=>x.id===location.hash.slice(1));if(g)openGame(g);else if(current)closeSheet()}
window.addEventListener('hashchange',route);route();

window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
