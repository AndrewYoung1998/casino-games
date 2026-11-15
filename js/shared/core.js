"use strict";
/* Shared — small helpers and playing-card rendering used by every game trainer.
   Load first. Cards are plain objects: {r:'A', s:'♠'}. */
const $=(s,el=document)=>el.querySelector(s);
const RANKS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sgn=n=>n>0?'+'+n:String(n);
const randCard=()=>({r:pick(RANKS),s:pick(SUITS)});
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
/* Build and shuffle `decks` standard decks, plus optional jokers ({r:'JK',s:'★'}). */
function makeShoe(decks=1,jokers=0){const s=[];for(let k=0;k<decks;k++)for(const r of RANKS)for(const su of SUITS)s.push({r,s:su});for(let j=0;j<jokers;j++)s.push({r:'JK',s:'★'});return shuffle(s)}
/* Card HTML. Extra classes: big | sm | deal (pop-in animation). */
function cardHTML(c,cls=''){if(c.r==='JK')return `<div class="card joker ${cls}"><span class="tl">J<br>★</span><span class="mid">★</span><span class="br">J<br>★</span></div>`;const red=c.s==='♥'||c.s==='♦';return `<div class="card ${red?'red':''} ${cls}"><span class="tl">${c.r}<br>${c.s}</span><span class="mid">${c.s}</span><span class="br">${c.r}<br>${c.s}</span></div>`}
const backHTML=(cls='')=>`<div class="card back ${cls}"></div>`;
