const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname,source=fs.readFileSync(path.join(root,'app.js'),'utf8');
function setup(){
 const elements=new Map(),events={};
 const node=()=>({dataset:{},innerHTML:'',textContent:'',value:'',disabled:false,classList:{add(){},remove(){}},setAttribute(){},focus(){},querySelector(){return null}});
 const document={documentElement:{dataset:{theme:'dark'}},querySelector(s){if(!elements.has(s))elements.set(s,node());return elements.get(s)},querySelectorAll(){return []},addEventListener(type,fn){events[type]=fn}};
 const ctx=vm.createContext({document,window:{addEventListener(){},scrollTo(){}},location:{hash:'#home'},setInterval(){},setTimeout(){},clearTimeout(){},Date,innerWidth:1200});vm.runInContext(source,ctx);return{ctx,elements,events};
}
(async()=>{
 const {ctx,events}=setup(),routes=vm.runInContext('Object.keys(pages)',ctx);
 for(const route of routes){const html=vm.runInContext(`pages[${JSON.stringify(route)}]()`,ctx);assert(html.includes('<h1>'),route);assert(!html.includes('undefined'),route);for(const [,src] of html.matchAll(/src="([^"$]+)"/g))assert(fs.existsSync(path.resolve(root,src)),route+': '+src)}
 assert.equal(vm.runInContext('insightValues.reduce((a,b)=>a+b,0)',ctx),920);
 const chart=vm.runInContext('insightChart()',ctx);assert.equal((chart.match(/data-action="insight-session"/g)||[]).length,10);assert(chart.includes('<table>'));assert(chart.includes('₹9,20,000'));assert(!/<summary>[^]*?<h[1-6]/.test(chart.split('</summary>')[0]));assert(chart.includes('id="insight-slider"'));
 assert(vm.runInContext('insightPlayerCard()',ctx).includes('+₹12,400'));assert(vm.runInContext('insightPlayerCard()',ctx).includes('6 / 10'));
 vm.runInContext("historyKind='tournament'",ctx);assert(vm.runInContext('historyPage()',ctx).includes('1 completed tournament'));assert(!vm.runInContext('historyPage()',ctx).includes('Friday Regulars'));vm.runInContext("historyKind='cash'",ctx);
 assert(vm.runInContext('settings()',ctx).includes('Not connected'));assert(vm.runInContext('components()',ctx).includes('insight-player-card'));
 const activeCard=vm.runInContext('playerCard(players[0])',ctx);assert(activeCard.includes('In play'));assert(!activeCard.includes('ledger-result'));assert(activeCard.includes('data-clock="1"'));assert(activeCard.includes('Buy-in received'));
 const unpaidCard=vm.runInContext('playerCard(players[1])',ctx);assert(unpaidCard.includes('Buy-in unpaid'));assert(unpaidCard.includes('₹2,000'));
 const closedCard=vm.runInContext('playerCard(players[2])',ctx);assert(closedCard.includes('Cash-out stack'));assert(closedCard.includes('+₹2,200'));assert(closedCard.includes('Payout due'));assert(closedCard.includes('data-action="design-current-receipt"'));assert(!closedCard.includes('data-clock='));
 const settledCard=vm.runInContext('playerCard(players[3])',ctx);assert(settledCard.includes('−₹1,200'));assert(settledCard.includes('Payments settled'));
 const zeroCard=vm.runInContext('playerCard({...players[3],out:0,paid:0})',ctx);assert(zeroCard.includes('−₹5,000'));assert(zeroCard.includes('Payments settled'));assert(zeroCard.includes('is-closed'));
 const longCard=vm.runInContext('playerCard({...players[0],name:"A very long player name <script>"})',ctx);assert(longCard.includes('&lt;script&gt;'));assert(!longCard.includes('<script>'));
 assert.equal((vm.runInContext('components()',ctx).match(/class="player ledger-player/g)||[]).length,4);
 assert(vm.runInContext('table()',ctx).includes('aria-label="Table setup"'));assert(!vm.runInContext('table()',ctx).includes('aria-label="Table settings"'));
 const manageCard=vm.runInContext('playerCard(players[3])',ctx);assert(manageCard.includes('ledger-more-actions'));assert(manageCard.includes('<dl class="ledger-payment-details">'));assert(manageCard.includes('Return to play'));
 vm.runInContext("cashDraft={id:2,amount:'0',override:false}",ctx);const zeroReview=vm.runInContext('cashReview()',ctx);assert(zeroReview.includes('Record ₹0 stack'));assert(zeroReview.includes('−₹5,000'));assert(zeroReview.includes('₹0 records an empty stack'));assert(zeroReview.includes('Minimum met'));assert(!zeroReview.includes('hero-art'));
 vm.runInContext("cashDraft={id:1,amount:'7000',override:false}",ctx);assert(vm.runInContext('cashReview(true)',ctx).includes('id="early-exit-dialog"'));assert(vm.runInContext('cashReview(true)',ctx).includes('allow-early'));
 vm.runInContext('cashDraft.override=true',ctx);assert(vm.runInContext('cashReview()',ctx).includes('House exception acknowledged'));
 vm.runInContext("cashDraft={id:1,amount:'5000',override:false};players[0].priorOut=1000",ctx);const reentryReview=vm.runInContext('cashReview()',ctx);assert(reentryReview.includes('Previous cash-outs'));assert(reentryReview.includes('+₹1,000'));vm.runInContext("delete players[0].priorOut;cashDraft={id:1,amount:'',override:false}",ctx);
 assert.equal(routes.length,48);assert.equal(vm.runInContext('routeMeta.length',ctx),routes.length);
 assert.equal(vm.runInContext('balance().difference',ctx),8700);
 assert.equal(vm.runInContext('clockFor(players[0]).met',ctx),false);assert.equal(vm.runInContext('clockFor(players[1]).met',ctx),true);
 assert(vm.runInContext('currentReceipt()',ctx).includes('Banker → Sam Rivera'));assert(vm.runInContext('currentReceipt()',ctx).includes('+₹2,200'));
 for(const [id,label,result] of [['jamie','STILL TO RECEIVE','+₹2,200'],['alex','STILL TO RECEIVE','−₹2,000'],['sam','STILL TO PAY','−₹2,000'],['jordan','SETTLED','−₹5,000']]){vm.runInContext(`receiptId=${JSON.stringify(id)}`,ctx);const html=vm.runInContext('receipt()',ctx);assert(html.includes(label));assert(html.includes(result));assert(html.includes('Design preview · sample data'))}
 vm.runInContext("receiptId='jamie';currentReceiptPlayerId=1",ctx);const playingReceipt=vm.runInContext('currentReceipt()',ctx);assert(playingReceipt.includes('PROVISIONAL BALANCE'));assert(playingReceipt.includes('Not entered'));assert(!playingReceipt.includes('−₹5,000'));vm.runInContext('currentReceiptPlayerId=3',ctx);
 const blocked=vm.runInContext('newTable()',ctx);assert(blocked.includes('A table is already running'));assert(!blocked.includes('data-form="new-table"'));assert(blocked.includes('Review & close'));
 assert(vm.runInContext('currentReceipt()',ctx).includes('Add banker details'));
 vm.runInContext("tableBanker={id:'8',name:'Riley <Shah>',phone:'PRIVATE_PHONE'}",ctx);const namedReceipt=vm.runInContext('currentReceipt()',ctx);assert(namedReceipt.includes('Banker: Riley &lt;Shah&gt;'));assert(namedReceipt.includes('Riley &lt;Shah&gt; → Sam Rivera'));assert(!namedReceipt.includes('PRIVATE_PHONE'));assert(!namedReceipt.includes('Banker: You'));vm.runInContext("tableBanker={id:'3',name:'Sam Rivera',phone:''}",ctx);const bankerReceipt=vm.runInContext('currentReceipt()',ctx);assert(bankerReceipt.includes('no self-transfer'));assert(!bankerReceipt.includes('Sam Rivera → Sam Rivera'));assert(namedReceipt.includes('receipt-action-bar'));
 vm.runInContext("tableBanker={id:'host',name:'',phone:''};tableClosed=true",ctx);const createForm=vm.runInContext('newTable()',ctx);assert(createForm.includes('id="banker-name"'));assert(createForm.includes('id="banker-phone"'));assert(createForm.includes('Someone else'));vm.runInContext('tableClosed=false',ctx);
 vm.runInContext("shareContext='current'",ctx);assert(vm.runInContext('sharePreview()',ctx).includes('Sam Rivera'));
 vm.runInContext("amountDraft={kind:'rebuy',id:1,amount:'2000',received:'yes',reason:''}",ctx);const before=vm.runInContext('players[0].buy',ctx),button={dataset:{action:'confirm-amount'},disabled:false};await events.click({target:{closest:()=>button}});await events.click({target:{closest:()=>button}});assert.equal(vm.runInContext('players[0].buy',ctx),before+2000);
 assert.equal(vm.runInContext("amountValue('12.345')",ctx),null);assert.equal(vm.runInContext("amountValue('letters')",ctx),null);assert.equal(vm.runInContext("amountValue('0')",ctx),0);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(blindAtLevel(1))',ctx)),{small:25,big:50,ante:0});
 const motion=fs.readFileSync(path.join(root,'design.js'),'utf8').split('function chooseDirection')[0];
 async function checkMotion(reduce,native){let renders=0,focused=0,api=0,entrances=0,readyHandled=0;const screen={dataset:{},offsetWidth:1,classList:{remove(){},add(){entrances++}},focus(){focused++}};const document={querySelector:()=>null};if(native)document.startViewTransition=arg=>{api++;(typeof arg==='function'?arg:arg.update)();return{ready:{catch(){readyHandled++}},finished:Promise.resolve(),skipTransition(){}}};const env=vm.createContext({document,location:{hash:'#table'},window:{scrollTo(){}},CSS:{supports:()=>true},matchMedia:()=>({matches:reduce}),render(){renders++},$:()=>screen});vm.runInContext(motion,env);vm.runInContext('navigateDesign()',env);await Promise.resolve();await Promise.resolve();assert.equal(renders,1);assert.equal(focused,1);assert.equal(api,reduce||!native?0:1);assert.equal(entrances,reduce||native?0:1);assert.equal(readyHandled,reduce||!native?0:1)}
 await checkMotion(false,false);await checkMotion(true,true);await checkMotion(false,true);
 for(const name of ['index.html','foundation.css','design.css','design.js','README.md','REFERENCES.md'])assert(fs.existsSync(path.join(root,name)));
 console.log('48 routes and assets pass; exact draft guards, independent clocks, receipt identity, duplicate lock and 3 motion paths, counted history, source table totals and player metrics pass.');
})().catch(error=>{console.error(error);process.exitCode=1});
