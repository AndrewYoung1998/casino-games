"use strict";
/* Shared — the "academy" shell every trainer uses: stage list, lesson/practice tabs,
   settings, number input, keyboard shortcuts and the generic quiz runner.
   Depends on: core.js, progress.js

   A game defines STAGES (array of stage objects) and calls createAcademy({...}) last.
   Stage object: { id, level, title, blurb, goal, lesson (HTML), settings?, drill(el) }
   Inside drill(), call runDrill(el, this, {total, pass, auto?, gen(i) → question}). */
let ACADEMY=null, store=null;
const save=()=>Progress.save(ACADEMY.id,store);
const getS=(st,k)=>{const v=store.settings[st.id+'.'+k];return v!=null?v:st.settings.find(s=>s.k===k).def};
/* Record a stage result; keeps the best score and never "un-passes" a stage. */
function markStage(stage,pct,passed){const p=store.done[stage.id];store.done[stage.id]={passed:passed||!!(p&&p.passed),best:Math.max(pct,p?p.best:0)};save()}
const unlocked=i=>store.unlockAll||i===0||!!(store.done[ACADEMY.stages[i-1].id]&&store.done[ACADEMY.stages[i-1].id].passed);

/* ---------- number input with −, +, ± buttons (iOS numeric keypads have no minus) ---------- */
function numHTML(cls='num'){return `<div class="numwrap"><button type="button" class="pm" data-step="-1" aria-label="minus one">−</button><input class="${cls}" type="text" inputmode="numeric" placeholder="0" autocomplete="off"><button type="button" class="pm" data-step="1" aria-label="plus one">+</button><button type="button" class="pm" data-neg="1" aria-label="flip sign">±</button></div>`}
function wireNum(root){root.querySelectorAll('.numwrap').forEach(w=>{const inp=$('input',w);w.querySelectorAll('.pm').forEach(b=>b.onclick=()=>{let v=readNum(inp);if(isNaN(v))v=0;if(b.dataset.neg)v=-v;else v+=+b.dataset.step;inp.value=sgn(v)})})}
const readNum=inp=>parseInt(String(inp.value).trim().replace('−','-').replace('+',''),10);

/* One active keyboard handler at a time; views set it, navigation clears it. */
let keyHandler=null;
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;if(keyHandler)keyHandler(e)});

/* ---------- generic drill runner ----------
   gen(i) returns a question:
   { html, explain, check(answer)→bool,
     choices:[{v,l}]  OR  type:'number'  OR  custom(answerEl, respond) for bespoke inputs,
     onKey?(event) keyboard handling for custom inputs,
     play?(promptEl) async animation before answering,
     reveal?(promptEl) called after answering } */
function runDrill(el,stage,cfg){
 let i=0,score=0,streak=0,qid=0;
 el.innerHTML=`<div class="hud"><span class="hq"></span><span class="hk"></span><span class="hs"></span></div><div class="prog"><div></div></div><div class="area"></div><div class="fb"></div>`;
 const area=$('.area',el),fb=$('.fb',el);
 const hud=()=>{$('.hq',el).textContent=`Question ${Math.min(i+1,cfg.total)} of ${cfg.total}`;$('.hs',el).textContent=`✓ ${score}`;$('.hk',el).textContent=streak>=3?`🔥 ${streak} in a row`:'';$('.prog div',el).style.width=(i/cfg.total*100)+'%'};
 async function next(){
  const my=++qid;
  if(i>=cfg.total)return finish();
  hud();fb.innerHTML='';keyHandler=null;
  const q=cfg.gen(i);
  area.innerHTML=`<div class="prompt">${q.html}</div><div class="answer"></div>`;
  const prompt=$('.prompt',area),ans=$('.answer',area);
  if(q.play){await q.play(prompt);if(!el.isConnected||my!==qid)return}
  let answered=false,nextBtn=null;
  const respond=v=>{
   if(answered)return;answered=true;
   const ok=q.check(v);if(ok){score++;streak++}else streak=0;i++;hud();
   ans.querySelectorAll('button,input').forEach(b=>b.disabled=true);
   if(q.choices)ans.querySelectorAll('.choice').forEach(b=>{if(q.check(b.dataset.v))b.classList.add('right');else if(b.dataset.v===String(v))b.classList.add('wrong')});
   if(q.reveal)q.reveal(prompt);
   fb.innerHTML=`<div class="verdict ${ok?'ok':'no'}"><b>${ok?pick(['Correct!','Nice.','Exactly.','Spot on.']):'Not quite.'}</b> ${q.explain}</div><button class="btn primary nx">${i>=cfg.total?'See results':'Next →'} <span class="kbd">Enter</span></button>`;
   nextBtn=$('.nx',fb);nextBtn.onclick=()=>{if(my===qid)next()};
   if(cfg.auto&&ok)setTimeout(()=>{if(my===qid&&el.isConnected)next()},700);
  };
  if(q.type==='number'){
   ans.innerHTML=`<form class="numform">${numHTML()}<button class="btn primary">Submit</button></form>`;wireNum(ans);
   const inp=$('input',ans);$('form',ans).onsubmit=e=>{e.preventDefault();const v=readNum(inp);if(isNaN(v)){inp.focus();return}respond(v)};
   if(matchMedia('(hover:hover)').matches)inp.focus({preventScroll:true});
  }else if(q.custom){
   q.custom(ans,respond);
  }else{
   ans.innerHTML=`<div class="choices">${q.choices.map((c,k)=>`<button class="btn choice" data-v="${c.v}"><span class="kbd">${k+1}</span> ${c.l}</button>`).join('')}</div>`;
   ans.querySelectorAll('.choice').forEach(b=>b.onclick=()=>respond(b.dataset.v));
  }
  keyHandler=e=>{
   if(e.key==='Enter'&&nextBtn){e.preventDefault();nextBtn.click();return}
   if(!answered&&q.onKey){q.onKey(e);return}
   if(!answered&&q.choices&&/^[0-9]$/.test(e.key)){const b=ans.querySelectorAll('.choice')[e.key==='0'?9:+e.key-1];if(b)b.click()}
  };
 }
 function finish(){
  keyHandler=null;
  const pct=score/cfg.total,pass=pct>=cfg.pass;markStage(stage,pct,pass);
  const S=ACADEMY.stages,nx=S[S.indexOf(stage)+1];
  el.innerHTML=`<div class="result"><div class="big">${Math.round(pct*100)}%</div><p>${score} of ${cfg.total} correct. ${pass?'<b>Stage passed!</b> 🎉':`You need ${Math.round(cfg.pass*100)}% to pass — run it again.`}</p><div class="row"><button class="btn again">Try again</button>${pass&&nx?`<a class="btn primary" href="#${nx.id}">Next: ${nx.title} →</a>`:''}</div></div>`;
  $('.again',el).onclick=()=>runDrill(el,stage,cfg);
 }
 next();
}

/* ---------- views ---------- */
function home(){
 const app=$('#app'),STAGES=ACADEMY.stages,LEVELS=ACADEMY.levels;
 keyHandler=null;
 const done=STAGES.filter(s=>store.done[s.id]&&store.done[s.id].passed).length;
 app.innerHTML=`<a class="btn ghost sm" href="${ACADEMY.back}" style="margin-top:6px">← Casino Academy</a><header class="hero"><div class="logo">${ACADEMY.logo}</div><h1>${ACADEMY.title}</h1><p class="sub">${ACADEMY.subtitle}</p><div class="pbar"><div style="width:${done/STAGES.length*100}%"></div></div><p class="small">${done} of ${STAGES.length} stages passed</p></header>
 ${LEVELS.map(L=>`<div class="group-h">${L}</div>${STAGES.map((s,i)=>s.level!==L?'':(()=>{const u=unlocked(i),d=store.done[s.id];return `<a class="stage ${u?'':'locked'} ${d&&d.passed?'passed':''}" href="#${s.id}"><div class="num">${d&&d.passed?'✓':u?i+1:'🔒'}</div><div><span class="lvl ${s.level.toLowerCase()}">Stage ${i+1}</span><h3>${s.title}</h3><p>${s.blurb}</p>${d?`<div class="best">Best: ${Math.round(d.best*100)}%${d.passed?' · passed':''}</div>`:''}</div></a>`})()).join('')}`).join('')}
 <footer class="foot"><label class="tog"><input type="checkbox" id="ua" ${store.unlockAll?'checked':''}> Unlock all stages</label><button class="btn ghost sm" id="rst">Reset progress</button></footer>`;
 $('#ua').onchange=e=>{store.unlockAll=e.target.checked;save();home()};
 const r=$('#rst');let armed=false;r.onclick=()=>{if(!armed){armed=true;r.textContent='Tap again to confirm';setTimeout(()=>{armed=false;if(r.isConnected)r.textContent='Reset progress'},3000);return}store.done={};save();home()};
}
function stageView(idx){
 const app=$('#app'),STAGES=ACADEMY.stages;
 const s=STAGES[idx],u=unlocked(idx);
 app.innerHTML=`<div class="topbar"><a href="#" class="btn ghost sm">← All stages</a><span class="lvl ${s.level.toLowerCase()}">${s.level} · Stage ${idx+1} of ${STAGES.length}</span></div><h2 class="stitle">${s.title}</h2><div class="tabs"><button data-t="lesson">Lesson</button><button data-t="drill">Practice</button></div><section class="pane"></section>`;
 const pane=$('.pane',app),tabs=app.querySelectorAll('.tabs button');
 function show(t){
  tabs.forEach(b=>b.classList.toggle('on',b.dataset.t===t));keyHandler=null;
  if(t==='lesson'){pane.innerHTML=`<article class="lesson">${s.lesson}</article><button class="btn primary go">Start practice →</button>`;$('.go',pane).onclick=()=>{show('drill');window.scrollTo(0,0)};return}
  if(!u){pane.innerHTML=`<div class="locked-msg">🔒 Pass <b>${STAGES[idx-1].title}</b> to unlock this drill, or turn on “Unlock all stages” on the home screen.</div>`;return}
  pane.innerHTML=`${s.settings?`<div class="settings">${s.settings.map(o=>`<label>${o.label}<select data-k="${o.k}">${o.opts.map(([v,l])=>`<option value="${v}" ${String(getS(s,o.k))===String(v)?'selected':''}>${l}</option>`).join('')}</select></label>`).join('')}</div>`:''}<div class="goal">${s.goal}</div><div class="drillbox"></div>`;
  const box=$('.drillbox',pane);
  pane.querySelectorAll('.settings select').forEach(sel=>sel.onchange=()=>{store.settings[s.id+'.'+sel.dataset.k]=sel.value;save();box.innerHTML='';s.drill(box)});
  s.drill(box);
 }
 tabs.forEach(b=>b.onclick=()=>show(b.dataset.t));
 show('lesson');window.scrollTo(0,0);
}
function route(){const id=location.hash.slice(1),i=ACADEMY.stages.findIndex(s=>s.id===id);if(i<0)home();else stageView(i)}
/* Start the trainer. cfg: {id, title, subtitle, logo, stages, levels, back} */
function createAcademy(cfg){
 ACADEMY=Object.assign({logo:'♠<span class="r">♥</span><span class="r">♦</span>♣',back:'../../index.html',levels:['Beginner','Intermediate','Advanced','Expert']},cfg);
 store=Progress.load(ACADEMY.id);
 window.addEventListener('hashchange',route);route();
}
