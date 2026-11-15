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
/* ---------- 3D wheel ----------
   A tilted (CSS perspective) wheel: wooden bowl, rotor drawn in SVG, fixed lighting overlay, and a ball
   animated with requestAnimationFrame. The ball orbits against the rotor, drops off the track,
   and locks into the winning pocket. ROU_STATE keeps the angle so re-renders don't jump. */
const ROU_STATE={angle:0,ball:null};
function wheelSVG(american){
 const order=american?US_ORDER:EU_ORDER,n=order.length;let p='';
 const pt=(a,rad)=>`${(100+rad*Math.cos(a)).toFixed(2)} ${(100+rad*Math.sin(a)).toFixed(2)}`;
 const arc=(a0,a1,r0,r1)=>`M${pt(a0,r0)} L${pt(a0,r1)} A${r1} ${r1} 0 0 1 ${pt(a1,r1)} L${pt(a1,r0)} A${r0} ${r0} 0 0 0 ${pt(a0,r0)}Z`;
 order.forEach((num,i)=>{const a0=(i/n)*2*Math.PI-Math.PI/2-Math.PI/n,a1=a0+2*Math.PI/n,c=colorOf(num),fill=c==='green'?'#059669':c==='red'?'#d0213f':'#141418',deep=c==='green'?'#03513a':c==='red'?'#7f1024':'#060608';
  p+=`<path d="${arc(a0,a1,80,97)}" fill="${fill}"/><path d="${arc(a0,a1,62,80)}" fill="${deep}"/>`;
  const am=(a0+a1)/2,x=(100+88.5*Math.cos(am)).toFixed(1),y=(100+88.5*Math.sin(am)).toFixed(1);
  p+=`<text x="${x}" y="${y}" font-size="7.2" fill="#fff" text-anchor="middle" dominant-baseline="middle" font-weight="800" transform="rotate(${(am*180/Math.PI+90).toFixed(1)} ${x} ${y})">${num}</text>`;
  p+=`<line x1="${(100+62*Math.cos(a0)).toFixed(2)}" y1="${(100+62*Math.sin(a0)).toFixed(2)}" x2="${(100+97*Math.cos(a0)).toFixed(2)}" y2="${(100+97*Math.sin(a0)).toFixed(2)}" stroke="url(#fret)" stroke-width="1.1"/>`});
 const spokes=[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4;return `<line x1="${(100+20*Math.cos(a)).toFixed(1)}" y1="${(100+20*Math.sin(a)).toFixed(1)}" x2="${(100+60*Math.cos(a)).toFixed(1)}" y2="${(100+60*Math.sin(a)).toFixed(1)}" stroke="#c9a24a" stroke-width="${k%2?0.8:1.6}" opacity=".8"/>`}).join('');
 return `<div class="wheelbox w3d"><div class="w3d-shadow"></div><div class="w3d-tilt"><div class="w3d-side"></div><div class="w3d-bowl"></div>
  <svg class="w3d-rotor" viewBox="0 0 200 200"><defs>
   <radialGradient id="cone" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f3d58a"/><stop offset=".18" stop-color="#b8862f"/><stop offset=".35" stop-color="#6b3f17"/><stop offset=".95" stop-color="#3a2109"/></radialGradient>
   <linearGradient id="fret" x1="0" x2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#b8862f"/></linearGradient>
   <radialGradient id="turret" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fff7d6"/><stop offset=".5" stop-color="#d4a94a"/><stop offset="1" stop-color="#7a5418"/></radialGradient></defs>
   <circle cx="100" cy="100" r="99" fill="#2b1a0b"/>${p}
   <circle cx="100" cy="100" r="97" fill="none" stroke="#d4af37" stroke-width="1.6"/><circle cx="100" cy="100" r="80" fill="none" stroke="#d4af37" stroke-width=".9"/><circle cx="100" cy="100" r="62" fill="url(#cone)" stroke="#d4af37" stroke-width="1.4"/>
   ${spokes}<circle cx="100" cy="100" r="20" fill="url(#turret)" stroke="#7a5418" stroke-width=".8"/>
   <g stroke="url(#turret)" stroke-width="4.5" stroke-linecap="round"><line x1="100" y1="78" x2="100" y2="122"/><line x1="78" y1="100" x2="122" y2="100"/></g>
   <circle cx="100" cy="78" r="4" fill="url(#turret)"/><circle cx="100" cy="122" r="4" fill="url(#turret)"/><circle cx="78" cy="100" r="4" fill="url(#turret)"/><circle cx="122" cy="100" r="4" fill="url(#turret)"/>
   <circle cx="100" cy="100" r="7" fill="url(#turret)" stroke="#7a5418" stroke-width=".6"/></svg>
  <div class="w3d-light"></div><div class="w3d-ball"></div></div></div>`;
}
/* Geometry of the tilted plane, in px. Rotor fills 84% of the bowl. */
function wheelGeom(box){const W=box.querySelector('.w3d-tilt').offsetWidth;return{W,c:W/2,track:W*.455,pocket:W*.42*.71,ball:W*.05}}
function placeBall(box,angleDeg,r){const g=wheelGeom(box),b=box.querySelector('.w3d-ball'),a=angleDeg*Math.PI/180;b.style.width=b.style.height=g.ball+'px';b.style.left=(g.c+r*Math.sin(a)-g.ball/2)+'px';b.style.top=(g.c-r*Math.cos(a)-g.ball)+'px';b.style.opacity=1}
/* Re-apply the stored wheel/ball position after a re-render. */
function applyWheel(box,american){if(!box)return;box.querySelector('.w3d-rotor').style.transform=`rotate(${ROU_STATE.angle}deg)`;const b=ROU_STATE.ball;if(b&&b.american===american){const n=(american?US_ORDER:EU_ORDER).length;placeBall(box,ROU_STATE.angle+b.i*360/n,wheelGeom(box).pocket)}else box.querySelector('.w3d-ball').style.opacity=0}
/* Spin: rotor turns clockwise, ball runs counter-clockwise, drops, and lands in `num`. Resolves when it settles. */
function spinTo(box,american,num,ms=5600){
 const order=american?US_ORDER:EU_ORDER,n=order.length,seg=360/n,i=order.findIndex(x=>String(x)===String(num));
 const rotor=box.querySelector('.w3d-rotor'),g=wheelGeom(box);
 const w0=ROU_STATE.angle,wTot=720+rnd(360),TL=ms*.74,easeW=t=>1-Math.pow(1-t,3),easeB=t=>1-Math.pow(1-t,2.2);
 const wAt=t=>w0+wTot*easeW(Math.min(t/ms,1));
 const lock=wAt(TL)+i*seg,bTot=1440+rnd(180),b0=lock+bTot;
 const bAt=t=>b0-bTot*easeB(Math.min(t/TL,1));
 const rAt=t=>{const d=TL*.62;if(t<d)return g.track;const p=Math.min((t-d)/(TL-d),1);return g.track-(g.track-g.pocket)*(p*p*(3-2*p))+Math.sin(p*Math.PI*4)*(1-p)*g.W*.018};
 ROU_STATE.ball=null;
 return new Promise(res=>{const t0=performance.now();
  const frame=now=>{const t=now-t0;if(!box.isConnected)return res();const wa=wAt(t);rotor.style.transform=`rotate(${wa}deg)`;
   if(t<TL)placeBall(box,bAt(t),rAt(t));else placeBall(box,wa+i*seg,g.pocket);
   if(t<ms)requestAnimationFrame(frame);else{ROU_STATE.angle=wAt(ms)%360;ROU_STATE.ball={i,american};res()}};
  requestAnimationFrame(frame)});
}
const spinNumber=american=>{const o=american?US_ORDER:EU_ORDER;return o[rnd(o.length)]};
const numBadge=n=>`<span class="nb ${colorOf(n)}">${n}</span>`;
