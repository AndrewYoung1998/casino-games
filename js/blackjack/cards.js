"use strict";
/* Blackjack — card-value helpers, counting systems (Hi-Lo, KO, …), running-count tally and discard-tray drawing.
   Shared helpers (cards, shuffle, $, sgn…) come from js/shared/core.js */

const isTen=r=>r==='10'||r==='J'||r==='Q'||r==='K';
const key=r=>isTen(r)?'T':r;
const mk=k=>({r:k==='T'?pick(['10','J','Q','K']):k,s:pick(SUITS)});
const ACT={H:'Hit',S:'Stand',D:'Double',P:'Split'};

/* ---------- counting systems ---------- */
const SYSTEMS={
 'Hi-Lo':{v:{2:1,3:1,4:1,5:1,6:1,7:0,8:0,9:0,T:-1,A:-1},lvl:1,bal:'Balanced',bc:.97,pe:.51},
 'KO':{v:{2:1,3:1,4:1,5:1,6:1,7:1,8:0,9:0,T:-1,A:-1},lvl:1,bal:'Unbalanced',bc:.98,pe:.55},
 'Hi-Opt I':{v:{2:0,3:1,4:1,5:1,6:1,7:0,8:0,9:0,T:-1,A:0},lvl:1,bal:'Balanced',bc:.88,pe:.61},
 'Hi-Opt II':{v:{2:1,3:1,4:2,5:2,6:1,7:1,8:0,9:0,T:-2,A:0},lvl:2,bal:'Balanced',bc:.91,pe:.67},
 'Omega II':{v:{2:1,3:1,4:2,5:2,6:2,7:1,8:0,9:-1,T:-2,A:0},lvl:2,bal:'Balanced',bc:.92,pe:.67},
 'Zen':{v:{2:1,3:1,4:2,5:2,6:2,7:1,8:0,9:0,T:-2,A:-1},lvl:2,bal:'Balanced',bc:.96,pe:.63}
};
const val=(r,sys='Hi-Lo')=>SYSTEMS[sys].v[key(r)];
function systemsTable(){const ks=['2','3','4','5','6','7','8','9','T','A'];
 return `<div class="chart-wrap"><table><tr><th>System</th>${ks.map(k=>`<th>${k==='T'?'10':k}</th>`).join('')}<th>Type</th><th>BC</th><th>PE</th></tr>${Object.entries(SYSTEMS).map(([n,s])=>`<tr><td style="text-align:left;white-space:nowrap"><b>${n}</b></td>${ks.map(k=>{const v=s.v[k];return `<td class="${v>0?'pos':v<0?'neg':''}">${sgn(v)}</td>`}).join('')}<td>${s.bal}</td><td>${s.bc}</td><td>${s.pe}</td></tr>`).join('')}</table></div>`}
function sysRow(sys){const ks=['2','3','4','5','6','7','8','9','T','A'];return `<br><span class="small">${ks.map(k=>`${k==='T'?'10':k}:${sgn(SYSTEMS[sys].v[k])}`).join(' · ')}</span>`}

/* ---------- rendering helpers ---------- */
function tally(cards,sys='Hi-Lo'){let r=0;return `<div class="tally">${cards.map(c=>{const v=val(c.r,sys);r+=v;return `<div class="tcell">${cardHTML(c,'sm')}<span class="${v>0?'pos':v<0?'neg':''}">${sgn(r)}</span></div>`}).join('')}</div>`}
function traySVG(disc,total=6,ref=false,scale=1){
 const per=26,H=total*per,w=70,h=Math.round(disc*per),W=ref?190:92;
 let ln='';for(let y=3;y<h;y+=3)ln+=`<line x1="10" x2="${8+w}" y1="${H+12-y}" y2="${H+12-y}"/>`;
 let rl='';if(ref)for(let y=3;y<per;y+=3)rl+=`<line x1="120" x2="174" y1="${H+12-y}" y2="${H+12-y}"/>`;
 return `<svg viewBox="0 0 ${W} ${H+34}" width="${W*scale}" height="${(H+34)*scale}" role="img" aria-label="Discard tray"><rect x="5" y="6" width="${w+8}" height="${H+10}" rx="5" fill="#0e1016" stroke="#8b7cff" stroke-opacity=".6" stroke-width="1.5"/><rect x="9" y="${H+12-h}" width="${w}" height="${h}" fill="#e6e8f0"/><g stroke="#b4b9c9" stroke-width="1">${ln}</g><text x="${9+w/2}" y="${H+31}" text-anchor="middle" font-size="12" fill="#8a91a5">discards</text>${ref?`<rect x="120" y="${H+12-per}" width="54" height="${per}" fill="#e6e8f0"/><g stroke="#b4b9c9" stroke-width="1">${rl}</g><text x="147" y="${H+31}" text-anchor="middle" font-size="12" fill="#8a91a5">= 1 deck</text>`:''}</svg>`}
