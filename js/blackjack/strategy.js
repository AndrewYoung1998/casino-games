"use strict";
/* Blackjack — Blackjack rules engine: hand values, basic strategy, Illustrious 18 deviations, bet ramp */
/* ---------- blackjack logic ---------- */
function handVal(cards){let t=0,a=0;for(const c of cards){if(c.r==='A'){t+=11;a++}else if(isTen(c.r))t+=10;else t+=+c.r}while(t>21&&a){t-=10;a--}return{total:t,soft:a>0}}
const isPair=cs=>cs.length===2&&key(cs[0].r)===key(cs[1].r);
function label(cards){if(isPair(cards)){const k=key(cards[0].r);return `Pair of ${k==='A'?'Aces':k==='T'?'10s':k+'s'}`}const v=handVal(cards);return `${v.soft?'Soft':'Hard'} ${v.total}`}
function makeHard(t){for(let n=0;n<200;n++){const a=2+rnd(9),b=t-a;if(b>=2&&b<=10&&a!==b)return[mk(a===10?'T':String(a)),mk(b===10?'T':String(b))]}return[mk('T'),mk(String(t-10))]}
/* Illustrious 18 for multi-deck, dealer stands soft 17, Hi-Lo */
const I18=[
 {name:'Insurance',ins:true,up:'A',idx:3,act:'Y',alt:'N'},
 {name:'16 vs 10',t:16,up:'T',idx:0,act:'S',alt:'H'},
 {name:'15 vs 10',t:15,up:'T',idx:4,act:'S',alt:'H'},
 {name:'10,10 vs 5',pair:true,up:'5',idx:5,act:'P',alt:'S'},
 {name:'10,10 vs 6',pair:true,up:'6',idx:4,act:'P',alt:'S'},
 {name:'10 vs 10',t:10,up:'T',idx:4,act:'D',alt:'H'},
 {name:'12 vs 3',t:12,up:'3',idx:2,act:'S',alt:'H'},
 {name:'12 vs 2',t:12,up:'2',idx:3,act:'S',alt:'H'},
 {name:'11 vs A',t:11,up:'A',idx:1,act:'D',alt:'H'},
 {name:'9 vs 2',t:9,up:'2',idx:1,act:'D',alt:'H'},
 {name:'10 vs A',t:10,up:'A',idx:4,act:'D',alt:'H'},
 {name:'9 vs 7',t:9,up:'7',idx:3,act:'D',alt:'H'},
 {name:'16 vs 9',t:16,up:'9',idx:5,act:'S',alt:'H'},
 {name:'13 vs 2',t:13,up:'2',idx:-1,dir:'<=',act:'H',alt:'S'},
 {name:'12 vs 4',t:12,up:'4',idx:-1,dir:'<=',act:'H',alt:'S'},
 {name:'12 vs 5',t:12,up:'5',idx:-2,dir:'<=',act:'H',alt:'S'},
 {name:'12 vs 6',t:12,up:'6',idx:-1,dir:'<=',act:'H',alt:'S'},
 {name:'13 vs 3',t:13,up:'3',idx:-2,dir:'<=',act:'H',alt:'S'}
];
function deviation(cards,u,tc,canD,pair){
 const hv=handVal(cards);
 for(const d of I18){
  if(d.ins||d.up!==u)continue;
  if(d.pair){if(pair&&key(cards[0].r)==='T')return tc>=d.idx?'P':'S';continue}
  if(pair||hv.soft||hv.total!==d.t)continue;
  const hit=d.dir==='<='?tc<=d.idx:tc>=d.idx;
  let a=hit?d.act:d.alt;if(a==='D'&&!canD)a='H';return a;
 }
 return null;
}
function strategy(cards,up,tc,canD,canP,useDev=true){
 const u=key(up),uv=u==='A'?11:u==='T'?10:+u;
 const pair=canP&&isPair(cards);
 if(useDev&&tc!=null){const d=deviation(cards,u,tc,canD,pair);if(d)return d}
 if(pair){const p=key(cards[0].r),pv=p==='A'?11:p==='T'?10:+p;
  if(pv===11||pv===8)return'P';
  if(pv===9)return[2,3,4,5,6,8,9].includes(uv)?'P':'S';
  if((pv===7||pv===2||pv===3)&&uv<=7)return'P';
  if(pv===6&&uv<=6)return'P';
  if(pv===4&&(uv===5||uv===6))return'P';
 }
 const{total:t,soft}=handVal(cards);const D=f=>canD?'D':f;
 if(soft){
  if(t>=19)return'S';
  if(t===18)return uv>=3&&uv<=6?D('S'):uv<=8?'S':'H';
  if(t===17)return uv>=3&&uv<=6?D('H'):'H';
  if(t>=15)return uv>=4&&uv<=6?D('H'):'H';
  if(t>=13)return uv>=5&&uv<=6?D('H'):'H';
  return'H';
 }
 if(t>=17)return'S';
 if(t>=13)return uv<=6?'S':'H';
 if(t===12)return uv>=4&&uv<=6?'S':'H';
 if(t===11)return uv<=10?D('H'):'H';
 if(t===10)return uv<=9?D('H'):'H';
 if(t===9)return uv>=3&&uv<=6?D('H'):'H';
 return'H';
}
function rowText(cards){const{total:t,soft}=handVal(cards);
 if(isPair(cards)){const p=key(cards[0].r);return({A:'Always split Aces.',8:'Always split 8s.',T:'Never split 10s — 20 is a great hand.',9:'Split 9s vs 2–6 and 8–9; stand vs 7, 10, A.',7:'Split 7s vs 2–7, otherwise hit.',6:'Split 6s vs 2–6, otherwise hit.',5:'Never split 5s — play them as hard 10.',4:'Split 4s only vs 5–6, otherwise hit.',3:'Split 2s and 3s vs 2–7, otherwise hit.',2:'Split 2s and 3s vs 2–7, otherwise hit.'})[p]}
 if(soft){if(t>=19)return'Soft 19+ always stands.';if(t===18)return'Soft 18: double vs 3–6, stand vs 2/7/8, hit vs 9/10/A.';if(t===17)return'Soft 17: double vs 3–6, otherwise hit.';if(t>=15)return'Soft 15–16: double vs 4–6, otherwise hit.';return'Soft 13–14: double vs 5–6, otherwise hit.'}
 if(t>=17)return'Hard 17+ always stands.';if(t>=13)return'Hard 13–16: stand vs 2–6, hit vs 7 or higher.';if(t===12)return'Hard 12: stand vs 4–6 only, otherwise hit.';if(t===11)return'Hard 11: double vs everything except an Ace.';if(t===10)return'Hard 10: double vs 2–9.';if(t===9)return'Hard 9: double vs 3–6.';return'Hard 8 or less: always hit.'}
function chartHTML(){
 const ups=['2','3','4','5','6','7','8','9','T','A'];
 const head=`<tr><th>You \\ Dealer</th>${ups.map(u=>`<th>${u==='T'?'10':u}</th>`).join('')}</tr>`;
 const row=(lab,cs)=>`<tr><td>${lab}</td>${ups.map(u=>{const a=strategy(cs,u==='T'?'10':u,null,true,true,false);return `<td class="a${a}">${a}</td>`}).join('')}</tr>`;
 let hard='',soft='',pairs='';
 for(let t=17;t>=8;t--){const cs=t<=12?[{r:t-2===10?'10':String(t-2)},{r:'2'}]:[{r:'10'},{r:String(t-10)}];hard+=row(t===17?'17+':t===8?'8 or less':String(t),cs)}
 for(let x=9;x>=2;x--)soft+=row(`A,${x} (soft ${11+x})`,[{r:'A'},{r:String(x)}]);
 for(const p of['A','10','9','8','7','6','5','4','3','2'])pairs+=row(`${p},${p}`,[{r:p},{r:p}]);
 return `<p class="legend"><span class="aH">H Hit</span><span class="aS">S Stand</span><span class="aD">D Double</span><span class="aP">P Split</span></p><p class="small">If doubling isn't allowed (3+ cards), hit instead — except soft 18, which stands.</p><h3>Hard totals</h3><div class="chart-wrap"><table class="chart">${head}${hard}</table></div><h3>Soft totals</h3><div class="chart-wrap"><table class="chart">${head}${soft}</table></div><h3>Pairs</h3><div class="chart-wrap"><table class="chart">${head}${pairs}</table></div>`}
function handPrompt(cards,up){return `<div class="mini-table"><div><div class="lbl">Dealer</div><div class="hand">${cardHTML(up,'deal')}${backHTML()}</div></div><div><div class="lbl">You · ${label(cards)}</div><div class="hand">${cards.map(c=>cardHTML(c,'deal')).join('')}</div></div></div>`}
const ramp=tc=>tc<=-2?'W':tc<=1?'1':tc===2?'2':tc===3?'4':tc===4?'6':'8';
