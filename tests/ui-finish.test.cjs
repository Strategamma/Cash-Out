const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function app(){
 const nodes=new Map();const node=s=>{if(!nodes.has(s))nodes.set(s,{style:{},open:false,querySelector(){return null},querySelectorAll(){return []},addEventListener(){},setAttribute(){},innerHTML:'',textContent:''});return nodes.get(s)};
 const context=vm.createContext({window:{CASH_OUT_PLATFORM:true,scrollTo(){}},document:{querySelector:node,documentElement:{dataset:{theme:'dark'}},addEventListener(){}},CashCore:require('../visualizations/wireframes/core.js'),CashUI:require('../visualizations/wireframes/components.js'),CashHistory:require('../visualizations/wireframes/history.js'),CashProfile:require('../visualizations/wireframes/profile.js'),CashMotion:{enter(){}},crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},close(){}});
 vm.runInContext(fs.readFileSync('visualizations/wireframes/app.js','utf8'),context);return code=>vm.runInContext(code,context);
}
test('untouched workspace has a clear first action and no fabricated live game or recent history',()=>{const run=app(),before=run('JSON.stringify({table,contacts,historyTables,payments})'),html=run('tablesPage()');assert.match(html,/Create your first table/);assert(!html.includes('Live table'));assert(!html.includes('Recent nights'));assert(!html.includes('₹0'));assert.equal(run('JSON.stringify({table,contacts,historyTables,payments})'),before)});
test('named empty and populated tables show honest state, actual date and escaped banker',()=>{const run=app();run("table.name='Saved night';table.date='2026-11-20';table.banker='<Host>'");let html=run('tablesPage()');assert.match(html,/Ready to start/);assert.match(html,/2026-11-20/);assert.match(html,/Banker: &lt;Host&gt;/);assert(!html.includes('Create your first table'));run("table.players=[{id:1,name:'Alex',buy:12345,out:null,paidIn:12345,paidOut:0}]");html=run('tablesPage()');assert.match(html,/In play/);assert.match(html,/₹123.45/);assert.match(html,/1 player ·/);assert.match(html,/Resume table/)});
test('empty roster/history/insights explain their next step; active table is retained as the destination',()=>{const run=app();assert.match(run('playersPage()'),/Keep your regulars close/);assert.match(run('historyPage()'),/Start a table/);const insight=run('insightsPage()');assert.match(insight,/Let your history take shape/);assert(!insight.includes('TOTAL BUY-IN VOLUME'));run("table.players=[{id:1,name:'Alex',buy:10000,out:null}]");assert.match(run('historyPage()'),/Back to your table/);assert.match(run('insightsPage()'),/Back to your table/);assert.equal(run('table.players[0].out'),null)});
test('close review puts missing stacks first and blocks a provisional zero difference',()=>{
 const run=app();run("table.rake=100000;table.players=[{id:1,name:'Alex',buy:500000,out:900000,paidIn:500000,paidOut:0},{id:2,name:'Jamie',buy:500000,out:null,paidIn:500000,paidOut:0}]");
 const before=run('JSON.stringify(table)'),html=run('reviewPage()');
 assert(html.indexOf('1 stack to enter')<html.indexOf('TABLE CHECK'));assert.match(html,/Stacks missing/);assert.match(html,/Provisional until every player/);assert.match(html,/data-action="close-table"[^>]*disabled/);assert.equal(run('JSON.stringify(table)'),before);
});
test('explicit zero cash-out enables a balanced review; a paise mismatch blocks closing',()=>{
 const run=app();run("table.rake=100000;table.players=[{id:1,name:'Alex',buy:500000,out:900000,paidIn:500000,paidOut:0},{id:2,name:'Jamie',buy:500000,out:0,paidIn:500000,paidOut:0}]");
 let html=run('reviewPage()');assert.match(html,/Balanced/);assert.match(html,/<details class="stack-records"><summary>Review 2 recorded stacks/);assert.match(html,/<small>₹0<\/small>/);assert(!/data-action="close-table"[^>]*disabled/.test(html));
 run('table.players[1].out=1');html=run('reviewPage()');assert.match(html,/Needs review/);assert.match(html,/−₹0.01/);assert.match(html,/exceed buy-ins by ₹0.01/);assert.match(html,/data-action="close-table"[^>]*disabled/);
});
test('settlement cards exclude recorded transfers and still open a separate payment confirmation',()=>{
 const run=app();run("table.rake=0;table.mode='direct';table.players=[{id:1,name:'Alex',buy:500000,out:700000,paidIn:0,paidOut:0},{id:2,name:'Jamie',buy:500000,out:300000,paidIn:0,paidOut:0}]");
 let html=run('settlePage()');assert.match(html,/Jamie → Alex/);assert.match(html,/₹2,000/);assert.match(html,/data-action="record-transfer"/);assert(!html.includes('data-action="confirm-transfer"'));
 run("payments=[{from:2,to:1,amount:200000,recent:false}]");html=run('settlePage()');assert.match(html,/All player payments recorded/);assert(!html.includes('data-action="record-transfer"'));
 const UI=require('../visualizations/wireframes/components.js');assert(!UI.transferCard({label:'<script>',amount:100,index:0}).includes('<script>'));
});
