"use strict";
/* Casino Academy — reusable visual pieces (mini cards, chips, dice, roulette wheel, video poker screen).
   Each function returns an HTML string. */
const $=s=>document.querySelector(s);
/* ---------- helpers ---------- */
const RED=new Set(['♥','♦']);
function mc(code){ // "A♠", "10♥", "JK" (joker), "??" (back)
 if(code==='??')return `<span class="mc back"></span>`;
 if(code==='JK')return `<span class="mc joker"><span>★</span><span class="s">J</span><span></span></span>`;
 const s=code.slice(-1),r=code.slice(0,-1);
 return `<span class="mc ${RED.has(s)?'red':''}"><span>${r}</span><span class="s">${s}</span><span></span></span>`}
function fan(codes,spread=14){const n=codes.length,mid=(n-1)/2;return `<div class="fan">${codes.map((c,i)=>mc(c).replace('class="mc','style="--r:'+((i-mid)*spread)+'deg;--x:'+((i-mid)*10)+'px;z-index:'+i+'" class="mc')).join('')}</div>`}
const chip=(color,x,y)=>`<span class="chip" style="background:${color};left:${x}%;top:${y}%"></span>`;
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const die=n=>`<span class="die">${Array.from({length:9},(_,i)=>`<i class="${PIPS[n].includes(i)?'v':''}"></i>`).join('')}</span>`;
function wheel(){
 const order=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
 const reds=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);const n=order.length;let p='';
 order.forEach((num,i)=>{const a0=(i/n)*2*Math.PI-Math.PI/2,a1=((i+1)/n)*2*Math.PI-Math.PI/2;const R=60,r=36;
  const pt=(a,rad)=>`${(64+rad*Math.cos(a)).toFixed(2)} ${(64+rad*Math.sin(a)).toFixed(2)}`;
  p+=`<path d="M${pt(a0,r)} L${pt(a0,R)} A${R} ${R} 0 0 1 ${pt(a1,R)} L${pt(a1,r)} A${r} ${r} 0 0 0 ${pt(a0,r)}Z" fill="${num===0?'#10b981':reds.has(num)?'#e11d48':'#111827'}" stroke="#d4af37" stroke-width=".5"/>`;
  const am=(a0+a1)/2;p+=`<text x="${(64+52*Math.cos(am)).toFixed(1)}" y="${(64+52*Math.sin(am)).toFixed(1)}" font-size="5.5" fill="#fff" text-anchor="middle" dominant-baseline="middle" font-weight="700" transform="rotate(${(am*180/Math.PI+90).toFixed(1)} ${(64+52*Math.cos(am)).toFixed(1)} ${(64+52*Math.sin(am)).toFixed(1)})">${num}</text>`});
 return `<svg class="wheel" viewBox="0 0 128 128"><circle cx="64" cy="64" r="63" fill="#5b3a1a" stroke="#d4af37" stroke-width="2"/>${p}<circle cx="64" cy="64" r="36" fill="#3b2410" stroke="#d4af37"/><circle cx="64" cy="64" r="22" fill="#2a1a0b"/><g stroke="#d4af37" stroke-width="3" stroke-linecap="round"><line x1="64" y1="48" x2="64" y2="80"/><line x1="48" y1="64" x2="80" y2="64"/></g><circle cx="64" cy="64" r="5" fill="#d4af37"/><circle cx="64" cy="10" r="3.2" fill="#fff"/></svg>`}
function screen(){return `<div class="screen"><div class="pay">JACKS OR BETTER</div><div class="row">${['K♠','K♥','7♦','K♣','2♠'].map(mc).join('')}</div><div class="holds"><span class="h">HELD</span><span class="h">HELD</span><span></span><span class="h">HELD</span><span></span></div></div>`}

/* mini slot machine: three windows of spinning symbols */
function slotIcon(){const col=['7','🍒','💎','🔔','7','🍋'];const reel=d=>`<span class="sw"><span class="ss" style="animation-delay:${d}s">${[...col,...col].map(x=>`<i>${x}</i>`).join('')}</span></span>`;return `<div class="slotico"><div class="sm-top">777</div><div class="sm-win">${reel(0)}${reel(-.35)}${reel(-.7)}</div><span class="sm-lever"></span></div>`}
