"use strict";
/* Craps — dice math, line/odds/place/field payouts and the roll resolver used by the live table.
   Rules used: Field pays 2:1 on 2 and 12 (1:1 on 3,4,9,10,11). Don't Pass bars 12. */
const WAYS=t=>6-Math.abs(t-7);                       // ways to roll a total with two dice (of 36)
const POINTS=[4,5,6,8,9,10];
/* True-odds payout on an odds bet behind the Pass line (profit). */
const ODDS_PAY={4:[2,1],10:[2,1],5:[3,2],9:[3,2],6:[6,5],8:[6,5]};
const oddsWin=(p,amt)=>amt*ODDS_PAY[p][0]/ODDS_PAY[p][1];
/* Place bet payouts (profit). */
const PLACE_PAY={6:[7,6],8:[7,6],5:[7,5],9:[7,5],4:[9,5],10:[9,5]};
const placeWin=(n,amt)=>amt*PLACE_PAY[n][0]/PLACE_PAY[n][1];
const FIELD_WIN=t=>t===2||t===12?2:[3,4,9,10,11].includes(t)?1:0;
const roll2=()=>[1+rnd(6),1+rnd(6)];
/* Pass line result on a roll: 'win' | 'lose' | 'point' (come-out sets point) | 'none'. */
function passResult(point,t){if(!point)return t===7||t===11?'win':[2,3,12].includes(t)?'lose':'point';return t===point?'win':t===7?'lose':'none'}
function dontResult(point,t){if(!point)return t===2||t===3?'win':t===12?'push':t===7||t===11?'lose':'point';return t===7?'win':t===point?'lose':'none'}
/* Resolve one roll for the live table. Mutates `bets` and returns
   {net, lines, point, credit}:  net = profit − losses (what the player settles),
   credit = money that goes back to the bankroll now (stake + profit of bets that win and come down,
   profit only for place bets, which stay up). Stakes left the bankroll when the bets were placed.
   bets: {pass, dont, odds, field, place4…place10, come, dcome, comeOn:{n:amt}, dcomeOn:{n:amt}} */
const PLACE_NUMS=[4,5,6,8,9,10];
function newBets(){return{pass:0,dont:0,odds:0,field:0,come:0,dcome:0,comeOn:{},dcomeOn:{},...Object.fromEntries(PLACE_NUMS.map(n=>['place'+n,0]))}}
const betsOnTable=b=>b.pass+b.dont+b.odds+b.field+b.come+b.dcome+PLACE_NUMS.reduce((a,n)=>a+b['place'+n],0)+Object.values(b.comeOn).reduce((a,x)=>a+x,0)+Object.values(b.dcomeOn).reduce((a,x)=>a+x,0);
function resolveRoll(bets,point,t){
 let net=0,credit=0;const L=[];
 const win=(name,stake,profit,comesDown=true)=>{net+=profit;credit+=profit+(comesDown?stake:0);L.push(`${name} wins +$${profit}`)};
 const lose=(name,stake)=>{net-=stake;L.push(`${name} loses −$${stake}`)};
 if(bets.field){const m=FIELD_WIN(t);m?win('Field $'+bets.field,bets.field,bets.field*m):lose('Field $'+bets.field,bets.field);bets.field=0}
 const pr=passResult(point,t),dr=dontResult(point,t);
 if(bets.pass){if(pr==='win'){win('Pass $'+bets.pass,bets.pass,bets.pass);if(bets.odds)win(`Odds $${bets.odds} (${ODDS_PAY[point].join(':')})`,bets.odds,oddsWin(point,bets.odds));bets.pass=bets.odds=0}
  else if(pr==='lose'){lose('Pass $'+bets.pass,bets.pass);if(bets.odds)lose('Odds $'+bets.odds,bets.odds);bets.pass=bets.odds=0}}
 if(bets.dont){if(dr==='win'){win("Don't Pass $"+bets.dont,bets.dont,bets.dont);bets.dont=0}else if(dr==='lose'){lose("Don't Pass $"+bets.dont,bets.dont);bets.dont=0}else if(dr==='push')L.push("Don't Pass pushes on 12 (barred)")}
 // Come / Don't Come bets already sitting on a number
 for(const n of Object.keys(bets.comeOn).map(Number)){const a=bets.comeOn[n];if(t===n){win(`Come on ${n} $${a}`,a,a);delete bets.comeOn[n]}else if(t===7){lose(`Come on ${n} $${a}`,a);delete bets.comeOn[n]}}
 for(const n of Object.keys(bets.dcomeOn).map(Number)){const a=bets.dcomeOn[n];if(t===7){win(`Don't Come on ${n} $${a}`,a,a);delete bets.dcomeOn[n]}else if(t===n){lose(`Don't Come on ${n} $${a}`,a);delete bets.dcomeOn[n]}}
 // New Come / Don't Come bets: this roll is their own come-out
 if(bets.come){const a=bets.come;if(t===7||t===11){win('Come $'+a,a,a);bets.come=0}else if([2,3,12].includes(t)){lose('Come $'+a,a);bets.come=0}else{bets.comeOn[t]=(bets.comeOn[t]||0)+a;bets.come=0;L.push(`Come $${a} moves to ${t}`)}}
 if(bets.dcome){const a=bets.dcome;if(t===2||t===3){win("Don't Come $"+a,a,a);bets.dcome=0}else if(t===12)L.push("Don't Come pushes on 12");else if(t===7||t===11){lose("Don't Come $"+a,a);bets.dcome=0}else{bets.dcomeOn[t]=(bets.dcomeOn[t]||0)+a;bets.dcome=0;L.push(`Don't Come $${a} moves to ${t}`)}}
 // Place bets work only while a point is on, and stay up after a win
 if(point)for(const n of PLACE_NUMS){const k='place'+n,a=bets[k];if(!a)continue;if(t===n)win(`Place ${n} $${a} (${PLACE_PAY[n].join(':')}, stays up)`,a,placeWin(n,a),false);else if(t===7){lose(`Place ${n} $${a}`,a);bets[k]=0}}
 let np=point;if(!point&&pr==='point')np=t;else if(point&&(t===point||t===7))np=null;
 return{net,lines:L,point:np,credit};
}
/* ---------- dice rendering ---------- */
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=(n,cls='')=>`<span class="die ${cls}">${Array.from({length:9},(_,i)=>`<i class="${PIPS[n].includes(i)?'v':''}"></i>`).join('')}</span>`;
const diceHTML=(a,b,cls='')=>`<div class="dice">${dieHTML(a,cls)}${dieHTML(b,cls)}</div>`;
/* A specific pair of dice for a total (random which pair). */
function diceFor(t){const opts=[];for(let a=1;a<=6;a++){const b=t-a;if(b>=1&&b<=6)opts.push([a,b])}return pick(opts)}

/* ---------- 3D dice ----------
   Each die is a CSS cube with all six faces (opposite faces sum to 7): +Z 1, −Z 6, +X 3, −X 4, ±Y 2/5.
   Dice live inside the tilted table plane, so the face pointing up (+Z) is the result.
   Three inner "core" panels fill the cube so the felt never shows through the rounded edges. */
const FACE_POS={1:'translateZ(var(--h))',6:'rotateY(180deg) translateZ(var(--h))',3:'rotateY(90deg) translateZ(var(--h))',4:'rotateY(-90deg) translateZ(var(--h))',2:'rotateX(90deg) translateZ(var(--h))',5:'rotateX(-90deg) translateZ(var(--h))'};
const SHOW={1:[0,0],6:[0,180],3:[0,-90],4:[0,90],2:[-90,0],5:[90,0]};   // cube rotation [x,y] that turns face v to +Z (up)
const faceHTML=v=>`<div class="face" style="transform:${FACE_POS[v]}">${Array.from({length:9},(_,i)=>`<i class="${PIPS[v].includes(i)?'v':''}"></i>`).join('')}</div>`;
const cubeTransform=(v,spin=0,z=0)=>{const[x,y]=SHOW[v];return `rotateZ(${z}deg) rotateX(${x+360*spin}deg) rotateY(${y+360*spin}deg)`};
const dieHTML3=(v,k,z)=>`<div class="dshadow s${k}"></div><div class="die3 d${k}"><div class="cube" style="transform:${cubeTransform(v,0,z)}"><div class="core"></div><div class="core cx"></div><div class="core cy"></div>${[1,2,3,4,5,6].map(faceHTML).join('')}</div></div>`;
/* Place a die (and its shadow) in table-plane coordinates: x,y on the felt, z height above it. */
function placeDie(table,k,x,y,z,size){const d=table.querySelector('.die3.d'+k),s=table.querySelector('.dshadow.s'+k);d.style.transform=`translate3d(${x-size/2}px,${y-size/2}px,${z+size/2}px)`;s.style.transform=`translate3d(${x-size*.6}px,${y-size*.6}px,1px) scale(${1-Math.min(z,160)/320})`;s.style.opacity=Math.max(.15,.7-z/250)}
/* Throw both dice from the player's side across the felt, off the back wall, to a stop. */
function throwDice(table,a,b,{W,H,size},state,ms=1500){
 const from=[[W*.62,H+30],[W*.7,H+50]],wallY=size*.9+12,ease=t=>1-Math.pow(1-t,3);
 const plan=[0,1].map(k=>{const wx=W*(.35+Math.random()*.35)+(k?size*.8:0),fx=W*(.25+Math.random()*.5)+(k?size*1.2:-size*.2),fy=H*(.3+Math.random()*.28);return{sx:from[k][0],sy:from[k][1],wx,wy:wallY,fx:Math.min(W-size,Math.max(size,fx)),fy,delay:k*70}});
 // keep the two dice at least ~1.6 dice apart so they never overlap
 if(Math.hypot(plan[0].fx-plan[1].fx,plan[0].fy-plan[1].fy)<size*1.6){plan[1].fx=Math.min(W-size,plan[0].fx+size*1.9);if(plan[1].fx-plan[0].fx<size*1.6)plan[1].fx=Math.max(size,plan[0].fx-size*1.9)}
 [a,b].forEach((v,k)=>{const cube=table.querySelector('.die3.d'+k+' .cube'),spin=3+rnd(2),z=rnd(4)*90;
  cube.style.transition='none';cube.style.transform=`rotateZ(${rnd(360)}deg) rotateX(${rnd(360)}deg) rotateY(${rnd(360)}deg)`;void cube.offsetWidth;
  setTimeout(()=>{cube.style.transition=`transform ${ms-plan[k].delay}ms cubic-bezier(.1,.7,.2,1)`;cube.style.transform=cubeTransform(v,spin,z)},plan[k].delay);
  state[k]={x:plan[k].fx,y:plan[k].fy,z};});
 return new Promise(res=>{const t0=performance.now();
  const frame=now=>{if(!table.isConnected)return res();let done=true;
   plan.forEach((p,k)=>{const t=Math.max(0,now-t0-p.delay),T=ms-p.delay,u=Math.min(t/T,1);if(u<1)done=false;
    let x,y,z;if(u<.38){const q=u/.38;x=p.sx+(p.wx-p.sx)*q;y=p.sy+(p.wy-p.sy)*q;z=size*.3+170*Math.sin(Math.PI*q)*(1-q*.35)}
    else{const q=(u-.38)/.62,e=ease(q);x=p.wx+(p.fx-p.wx)*e;y=p.wy+(p.fy-p.wy)*e;z=Math.abs(Math.sin(q*Math.PI*3.2))*60*Math.pow(1-q,2.2)}
    placeDie(table,k,x,y,z,size)});
   if(!done)requestAnimationFrame(frame);else res()};
  requestAnimationFrame(frame)});
}
