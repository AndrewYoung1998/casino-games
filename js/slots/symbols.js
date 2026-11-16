"use strict";
/* Slots — how each machine's symbols look, plus static grids for the drills.
   Depends on: machines.js */
const GEM=c=>`<i class="gem ${c}"></i>`;
const SYM={
 classic:{
  '7':{h:'<b class="c7">7</b>',n:'Seven'},
  B3:{h:'<span class="bars"><i>BAR</i><i>BAR</i><i>BAR</i></span>',n:'Triple bar'},
  B2:{h:'<span class="bars"><i>BAR</i><i>BAR</i></span>',n:'Double bar'},
  B1:{h:'<span class="bars"><i>BAR</i></span>',n:'Single bar'},
  CH:{h:'<span class="emo">🍒</span>',n:'Cherry'},
  BL:{h:'',n:'Blank'}},
 fiesta:{
  D:{h:'<span class="emo">💎</span>',n:'Diamond'},B:{h:'<span class="emo">🔔</span>',n:'Bell'},M:{h:'<span class="emo">🍉</span>',n:'Melon'},
  G:{h:'<span class="emo">🍇</span>',n:'Grapes'},O:{h:'<span class="emo">🍊</span>',n:'Orange'},L:{h:'<span class="emo">🍋</span>',n:'Lemon'},
  C:{h:'<span class="emo">🍒</span>',n:'Cherry'},W:{h:'<span class="wild">WILD</span>',n:'Wild'},S:{h:'<span class="scat"><span class="emo">⭐</span><small>BONUS</small></span>',n:'Scatter star'}},
 temple:{
  K:{h:'<span class="emo">👑</span>',n:'Crown'},A:{h:'<span class="emo">🗿</span>',n:'Idol'},G:{h:'<span class="emo">💎</span>',n:'Diamond'},
  R:{h:GEM('r'),n:'Ruby'},Y:{h:GEM('y'),n:'Topaz'},N:{h:GEM('g'),n:'Emerald'},U:{h:GEM('b'),n:'Sapphire'},
  S:{h:'<span class="scat sun"><span class="emo">☀️</span><small>FREE</small></span>',n:'Sun scatter'}},
 dragon:{
  D:{h:'<span class="emo">🐉</span>',n:'Dragon'},L:{h:'<span class="emo">🏮</span>',n:'Lantern'},E:{h:'<span class="emo">🧧</span>',n:'Red envelope'},
  A:{h:'<b class="lt a">A</b>',n:'Ace'},K:{h:'<b class="lt k">K</b>',n:'King'},Q:{h:'<b class="lt q">Q</b>',n:'Queen'},J:{h:'<b class="lt j">J</b>',n:'Jack'},
  W:{h:'<span class="wild pearl">WILD</span>',n:'Pearl wild'}}
};
/* bet in dollars → coin label for Dragon's Hoard */
const money=v=>'$'+(Math.round(v*100)/100).toLocaleString('en-US',{minimumFractionDigits:v%1?2:0,maximumFractionDigits:2});
function coinHTML(c,bet){const jp=typeof c.coin==='string';return `<span class="coin ${jp?'cjp '+c.coin.toLowerCase():''}"><b>${jp?c.coin:money(c.coin*bet)}</b></span>`}
function symHTML(m,k,bet=1){if(k&&typeof k==='object')return coinHTML(k,bet);const s=SYM[m][k];return s?s.h:''}
const symName=(m,k)=>SYM[m][k].n;
/* random symbol for spinning filler */
const FILLER={classic:()=>pick(['7','B3','B2','B1','CH','BL','BL','BL']),fiesta:()=>pick('DBMGOLCCLLOW'.split('')),temple:()=>pick('KAGRYNUUNY'.split('')),dragon:()=>pick('DLEAKQJJQK'.split(''))};
/* payline overlay (SVG in cell units). lines = [{rows:[...], len, color}] */
const LINE_COLORS=['#fbbf24','#f472b6','#34d399','#60a5fa','#f87171','#a78bfa','#fb923c','#2dd4bf','#e879f9','#facc15'];
function linesSVG(lines,cols=5,rows=3){return `<svg class="lines" viewBox="0 0 ${cols*100} ${rows*100}" preserveAspectRatio="none">${lines.map((l,i)=>`<polyline points="${l.rows.map((r,c)=>`${c*100+50},${r*100+50}`).join(' ')}" stroke="${l.color||LINE_COLORS[i%LINE_COLORS.length]}" />`).join('')}</svg>`}
/* static grid (drills): grid[reel][row]; opts.hits = Set of "r,k"; opts.lines for overlays */
function staticGrid(m,grid,opts={}){
 const hits=opts.hits||new Set();
 return `<div class="sgrid m-${m}" style="--cols:${grid.length};--rows:${grid[0].length}"><div class="reels">${grid.map((col,r)=>`<div class="reel"><div class="strip">${col.map((s,k)=>`<div class="cell ${hits.has(r+','+k)?'hit':''}">${symHTML(m,s,opts.bet||1)}</div>`).join('')}</div></div>`).join('')}</div>${opts.lines?linesSVG(opts.lines,grid.length,grid[0].length):''}${opts.payline?'<div class="payline"></div>':''}</div>`;
}
