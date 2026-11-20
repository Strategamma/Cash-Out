const {test}=require('node:test'),assert=require('node:assert/strict');
const UI=require('../visualizations/wireframes/components.js');
const player={id:1,name:'Jamie',buy:500000,out:null,paidIn:0,paidOut:0};
test('playing cards keep unknown results separate from outstanding buy-in payments',()=>{
 const html=UI.playerCard(player,500000);
 assert.match(html,/Playing · result pending/);assert.match(html,/Buy-in payment outstanding · ₹5,000/);
 assert(!html.includes('player-ledger'));assert(!html.includes('−₹5,000'));
 assert.match(html,/data-action="rebuy"/);assert.match(html,/data-action="cashout"/);
});
test('losing players can receive cash-outs; card shows result and payment obligation independently',()=>{
 const html=UI.playerCard({...player,out:300000},-300000);
 assert.match(html,/<dt>Buy-in<\/dt>/);assert.match(html,/<dt>Cash-out<\/dt>/);assert.match(html,/−₹2,000/);
 assert.match(html,/Still to receive/);assert.match(html,/<strong>₹3,000<\/strong>/);assert(!html.includes('Still to pay'));
 const owed=UI.playerCard({...player,out:300000},200000);assert.match(owed,/Still to pay/);assert.match(owed,/<strong>₹2,000<\/strong>/);
});
test('zero stacks remain explicit; settled cards escape names and preserve all independent actions',()=>{
 const html=UI.playerCard({...player,name:'<script>"',out:0},0);
 assert.match(html,/&lt;script&gt;&quot;/);assert(!html.includes('<script>'));assert.match(html,/−₹5,000/);
 assert.match(html,/Payments settled/);assert.match(html,/<dt>Cash-out<\/dt><dd><span class="ui-amount ">₹0<\/span>/);
 for(const action of ['cashout','payment','player-receipt','player-menu'])assert.match(html,new RegExp('data-action="'+action+'"'));
});
