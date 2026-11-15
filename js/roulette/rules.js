"use strict";
/* Roulette — wheel orders, colors, bet definitions, payouts and the betting layout component.
   Bets are keyed strings: 'n:17' (straight), 'red','black','even','odd','low','high',
   'dz1'..'dz3' (dozens), 'col1'..'col3' (columns). Drill-only bets use explicit number lists. */
const EU_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const US_ORDER=[0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,'00',27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const colorOf=n=>n===0||n==='00'?'green':REDS.has(n)?'red':'black';
const dozenOf=n=>Math.ceil(n/12);
const columnOf=n=>((n-1)%3)+1;           // column 1 = 1,4,7…34
const OUTSIDE={red:'Red',black:'Black',even:'Even',odd:'Odd',low:'1–18',high:'19–36',dz1:'1st 12',dz2:'2nd 12',dz3:'3rd 12',col1:'Column 1',col2:'Column 2',col3:'Column 3'};
const NUMS=Array.from({length:36},(_,i)=>i+1);
/* Numbers covered by a bet key. */
function coverage(key){
 if(key.startsWith('n:')){const v=key.slice(2);return[v==='00'?'00':+v]}
 if(key==='red')return NUMS.filter(n=>REDS.has(n));if(key==='black')return NUMS.filter(n=>!REDS.has(n));
 if(key==='even')return NUMS.filter(n=>n%2===0);if(key==='odd')return NUMS.filter(n=>n%2===1);
 if(key==='low')return NUMS.filter(n=>n<=18);if(key==='high')return NUMS.filter(n=>n>=19);
 if(key.startsWith('dz'))return NUMS.filter(n=>dozenOf(n)===+key[2]);
 if(key.startsWith('col'))return NUMS.filter(n=>columnOf(n)===+key[3]);
 return[];
}
/* Payout ratio (X to 1) by how many numbers a bet covers. Top line (5 numbers) pays 6:1. */
const RATIO={1:35,2:17,3:11,4:8,5:6,6:5,12:2,18:1};
const BET_NAME={1:'Straight up',2:'Split',3:'Street',4:'Corner',5:'Top line',6:'Six line',12:'Dozen / Column',18:'Even money'};
const keyLabel=k=>k.startsWith('n:')?`Straight ${k.slice(2)}`:OUTSIDE[k];
/* Net result of a set of bets {key|label: {nums, amt}} for a winning number. */
function settleBets(bets,win){
 let net=0;const lines=[];
 for(const b of bets){const r=RATIO[b.nums.length];if(b.nums.includes(win)){net+=b.amt*r;lines.push(`${b.label} $${b.amt} wins ${r}:1 → +$${b.amt*r}`)}else{net-=b.amt;lines.push(`${b.label} $${b.amt} loses → −$${b.amt}`)}}
 return{net,lines};
}
/* ---------- vertical betting layout (how real tables look from the dealer's end) ---------- */
function layoutHTML({american=false,hl=[],chips={},clickable=false}={}){
 const hs=new Set(hl.map(String)),cell=(key,txt,cls,style)=>`<${clickable?'button':'div'} class="lc ${cls} ${chips[key]?'has':''}" data-k="${key}" style="${style}">${txt}${chips[key]?`<span class="chipm">${chips[key]}</span>`:''}</${clickable?'button':'div'}>`;
 let h=`<div class="layout ${american?'us':''}">`;
 h+=`<div class="zeros" style="grid-column:3/6;grid-row:1">${cell('n:0','0','num green'+(hs.has('0')?' hl':''),'')}${american?cell('n:00','00','num green'+(hs.has('00')?' hl':''),''):''}</div>`;
 for(const n of NUMS){const row=Math.ceil(n/3)+1,col=columnOf(n)+2;h+=cell('n:'+n,n,`num ${colorOf(n)}${hs.has(String(n))?' hl':''}`,`grid-row:${row};grid-column:${col}`)}
 for(let d=1;d<=3;d++)h+=cell('dz'+d,`<span class="vt">${OUTSIDE['dz'+d]}</span>`,'out'+(hs.has('dz'+d)?' hl':''),`grid-row:${2+(d-1)*4}/span 4;grid-column:2`);
 ['low','even','red','black','odd','high'].forEach((k,i)=>h+=cell(k,k==='red'?'<i class="dia r"></i>':k==='black'?'<i class="dia b"></i>':`<span class="vt">${OUTSIDE[k]}</span>`,'out'+(hs.has(k)?' hl':''),`grid-row:${2+i*2}/span 2;grid-column:1`));
 for(let c=1;c<=3;c++)h+=cell('col'+c,'2:1','out colb'+(hs.has('col'+c)?' hl':''),`grid-row:14;grid-column:${c+2}`);
 return h+'</div>';
}
/* ---------- wheel ---------- */
function wheelSVG(american){
 const order=american?US_ORDER:EU_ORDER,n=order.length;let p='';
 order.forEach((num,i)=>{const a0=(i/n)*2*Math.PI-Math.PI/2-Math.PI/n,a1=a0+2*Math.PI/n,R=96,r=60;
  const pt=(a,rad)=>`${(100+rad*Math.cos(a)).toFixed(2)} ${(100+rad*Math.sin(a)).toFixed(2)}`;const c=colorOf(num);
  p+=`<path d="M${pt(a0,r)} L${pt(a0,R)} A${R} ${R} 0 0 1 ${pt(a1,R)} L${pt(a1,r)} A${r} ${r} 0 0 0 ${pt(a0,r)}Z" fill="${c==='green'?'#059669':c==='red'?'#e11d48':'#111827'}" stroke="#d4af37" stroke-width=".6"/>`;
  const am=(a0+a1)/2,x=(100+84*Math.cos(am)).toFixed(1),y=(100+84*Math.sin(am)).toFixed(1);
  p+=`<text x="${x}" y="${y}" font-size="8" fill="#fff" text-anchor="middle" dominant-baseline="middle" font-weight="700" transform="rotate(${(am*180/Math.PI+90).toFixed(1)} ${x} ${y})">${num}</text>`});
 return `<div class="wheelbox"><svg viewBox="0 0 200 200" class="rwheel"><g class="rot"><circle cx="100" cy="100" r="99" fill="#4a2f15" stroke="#d4af37" stroke-width="2"/>${p}<circle cx="100" cy="100" r="60" fill="#3b2410" stroke="#d4af37"/><circle cx="100" cy="100" r="34" fill="#2a1a0b"/><g stroke="#d4af37" stroke-width="5" stroke-linecap="round"><line x1="100" y1="74" x2="100" y2="126"/><line x1="74" y1="100" x2="126" y2="100"/></g><circle cx="100" cy="100" r="8" fill="#d4af37"/></g><circle class="ball" cx="100" cy="11" r="4.2" fill="#fff"/></svg><div class="pointer"></div></div>`;
}
/* Rotate the wheel so `num` lands under the pointer at the top. Resolves when the spin ends. */
function spinTo(box,american,num,ms=4200){
 const order=american?US_ORDER:EU_ORDER,i=order.findIndex(x=>String(x)===String(num)),seg=360/order.length;
 const g=box.querySelector('.rot'),ball=box.querySelector('.ball');
 const prev=+(g.dataset.deg||0),target=prev-(prev%360)+360*5+(360-i*seg);
 ball.style.opacity=0;g.style.transition=`transform ${ms}ms cubic-bezier(.12,.6,.15,1)`;g.style.transformOrigin='100px 100px';g.style.transform=`rotate(${target}deg)`;g.dataset.deg=target;
 return new Promise(r=>setTimeout(()=>{ball.style.opacity=1;r()},ms));
}
const spinNumber=american=>{const o=american?US_ORDER:EU_ORDER;return o[rnd(o.length)]};
const numBadge=n=>`<span class="nb ${colorOf(n)}">${n}</span>`;
