"use strict";
/* Baccarat — card values, the third-card (tableau) rules, coup dealing and bet settlement.
   Standard Punto Banco: 8 decks, Banker pays 0.95:1 (5% commission), Tie pays 8:1. */
const BAC_DECKS=8;
const bv=c=>c.r==='A'?1:isNaN(+c.r)||c.r==='10'?0:+c.r;   // A=1, 2–9 face, 10/J/Q/K=0
const btotal=cs=>cs.reduce((a,c)=>a+bv(c),0)%10;
/* Player's rule: draw on 0–5, stand on 6–7 (8–9 is a natural and ends the coup). */
const playerDraws=pt=>pt<=5;
/* Banker's rule. p3 = value of Player's third card, or null if Player stood. */
function bankerDraws(bt,p3){
 if(p3==null)return bt<=5;
 if(bt<=2)return true;
 if(bt===3)return p3!==8;
 if(bt===4)return p3>=2&&p3<=7;
 if(bt===5)return p3>=4&&p3<=7;
 if(bt===6)return p3===6||p3===7;
 return false;
}
function bankerReason(bt,p3){
 if(p3==null)return `Player stood, so Banker plays like Player: draw on 0–5, stand on 6–7. Banker has ${bt} → <b>${bt<=5?'draws':'stands'}</b>.`;
 const rule={0:'0–2 always draws',1:'0–2 always draws',2:'0–2 always draws',3:'3 draws unless Player’s third card is 8',4:'4 draws if Player’s third card is 2–7',5:'5 draws if Player’s third card is 4–7',6:'6 draws only if Player’s third card is 6 or 7',7:'7 always stands'}[bt];
 return `Banker ${rule}. Player's third card is ${p3} → <b>${bankerDraws(bt,p3)?'draws':'stands'}</b>.`;
}
/* Deal a full coup from a shoe (array, consumed with shift). */
function dealCoup(shoe){
 const P=[shoe.shift()],B=[shoe.shift()];P.push(shoe.shift());B.push(shoe.shift());
 const pt0=btotal(P),bt0=btotal(B),natural=pt0>=8||bt0>=8;let p3=null;
 if(!natural){if(playerDraws(pt0)){P.push(shoe.shift());p3=bv(P[2])}if(bankerDraws(bt0,p3))B.push(shoe.shift())}
 const pt=btotal(P),bt=btotal(B);
 return{P,B,pt,bt,pt0,bt0,natural,p3,winner:pt>bt?'P':bt>pt?'B':'T'};
}
const WIN_NAME={P:'Player',B:'Banker',T:'Tie'};
/* Net result of a bet: side ∈ P|B|T. */
function bacSettle(side,amt,winner){
 if(winner==='T')return side==='T'?amt*8:0;
 if(side==='T')return -amt;
 if(side!==winner)return -amt;
 return side==='B'?Math.round(amt*0.95*100)/100:amt;
}
const bacHand=(cs,cls='deal')=>`<div class="hand">${cs.map(c=>cardHTML(c,cls)).join('')}</div>`;
/* Two-card hand with a chosen total (for drills). */
function handWithTotal(t){for(let i=0;i<500;i++){const h=dealN(2);if(btotal(h)===t)return h}return dealN(2)}
