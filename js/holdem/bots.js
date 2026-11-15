"use strict";
/* Texas Hold'em — computer opponents. Simple, readable logic:
   estimate equity against the players still in, compare with the price, add a little randomness and bluffing. */
const BOT_STYLE={Ace:{aggr:1.0,bluff:.07},Riverboat:{aggr:1.25,bluff:.12},Tight:{aggr:.8,bluff:.03}};
function botDecide(T,i){
 const p=T.players[i],style=BOT_STYLE[p.name]||{aggr:1,bluff:.07},opp=T.players.filter(q=>!q.folded&&q!==p).length;
 const e=equity(p.hole,T.board,opp,160),r=e*(opp+1)*style.aggr,tc=toCall(T,i),pot=potTotal(T),x=Math.random();
 if(tc===0){
  if(r>1.7||(r>1.25&&x<.5)||x<style.bluff)return{action:'raise',to:raiseTo(T,i,x<.55?'half':'pot')};
  return{action:'check'};
 }
 const need=tc/(pot+tc);
 if(e<need*.95&&x>style.bluff*.8){if(tc<=T.bb&&e>.18)return{action:'call'};return{action:'fold'}}
 if(r>1.9&&x<.55&&p.stack>tc)return{action:'raise',to:raiseTo(T,i,x<.3?'pot':'half')};
 return{action:'call'};
}
