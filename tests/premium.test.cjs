const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const Receipt=require('../visualizations/wireframes/receipt.js'),Core=require('../visualizations/wireframes/core.js'),UI=require('../visualizations/wireframes/components.js');
const p={id:1,name:'Alex',buy:500000,out:300000,paidIn:500000,paidOut:0},table={name:'Friday',banker:'Jamie',players:[p]};
test('a losing player can still have a payout due; receipt distinguishes result and actual payments',()=>{const m=Receipt.model(table,p);assert.equal(m.result,-200000);assert.equal(m.net,-300000);assert.match(Receipt.text(m),/Still to receive: ₹3,000/);assert.match(Receipt.text(m),/Poker result: −₹2,000/);assert(Object.isFrozen(m));p.name='Changed';assert.equal(m.name,'Alex');p.name='Alex'});
test('receipt includes unpaid buy-ins and recorded transfers, exact paise and explicit banker position',()=>{const player={...p,buy:500001,paidIn:0,out:300000};const t={...table,players:[player]};assert.equal(Receipt.model(t,player).net,200001);assert.equal(Receipt.model(t,player,[{from:1,to:'bank',amount:100001,recent:false}]).net,100000);assert.equal(Receipt.model({...t,bankerId:1},player).net,null);assert.match(Receipt.text(Receipt.model({...t,bankerId:1},player)),/Review table settlement/)});
test('receipt refuses live stacks, escapes names, excludes contact details and requires a named banker',()=>{assert.throws(()=>Receipt.model(table,{...p,out:null}));const html=Receipt.html(Receipt.model({...table,banker:'You'},{...p,name:'<script>',phone:'SECRET',photo:'PRIVATE'}));assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('SECRET'));assert(!html.includes('PRIVATE'));assert(html.includes('Add banker name'));assert(!html.includes('data-action="receipt-share"'))});
function motion(reduced=false,native=true){
 const changes=[],transitions=[],events={},preference={matches:reduced,addEventListener:(t,f)=>events.preference=f};
 const document={documentElement:{dataset:{}},querySelector:()=>null,addEventListener(){}};
 if(native)document.startViewTransition=update=>{let finish;const t={update,finished:new Promise(r=>finish=r),ready:Promise.resolve(),finish:()=>finish(),skipTransition(){this.skipped=true}};transitions.push(t);return t};
 const ctx={document,window:{matchMedia:()=>preference,addEventListener(){}}};vm.runInNewContext(fs.readFileSync('visualizations/wireframes/premium.js','utf8'),ctx);return {api:ctx.window.CashPremium,changes,transitions,events,preference};
}
test('interrupted native presentation never executes stale DOM work; fallback updates synchronously',async()=>{const {api,transitions}=motion();let count=0;api.swap(()=>count+=1);api.swap(()=>count+=10);transitions[0].update();assert.equal(count,0);transitions[1].update();assert.equal(count,10);transitions[1].finish();await Promise.resolve();for(const args of [[true,true],[false,false]]){const {api}=motion(...args);let called=0;api.swap(()=>called++);assert.equal(called,1)}});
test('temporary native names restore on cancellation and reduced-motion changes',()=>{const {api,preference,events}=motion(),node={style:{viewTransitionName:'original',viewTransitionClass:''}};api.swap(()=>{}, {before:mark=>mark(node,'selected')});assert.equal(node.style.viewTransitionName,'selected');preference.matches=true;events.preference();assert.equal(node.style.viewTransitionName,'original')});
test('receipt export abandoned during image creation never downloads another player snapshot',async()=>{
 let key,blobReady,downloads=0;const ctx2d=new Proxy({},{get:()=>()=>{}}),doc={querySelector:()=>({dataset:{receiptKey:key}}),createElement:tag=>tag==='canvas'?{getContext:()=>ctx2d,toBlob:fn=>blobReady=fn}:{click:()=>downloads++}};
 const context={window:{CashUI:UI,CashCore:Core},document:doc,Image:class{decode(){return Promise.resolve()}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},setTimeout:fn=>fn(),navigator:{}};
 vm.runInNewContext(fs.readFileSync('visualizations/wireframes/receipt.js','utf8'),context);const model=context.window.CashReceipt.model(table,p);key=model.key;const saving=context.window.CashReceipt.save(model);await new Promise(setImmediate);assert(blobReady);key='other-receipt';blobReady({});await saving;assert.equal(downloads,0);
});
test('busy visual state does not block an otherwise validated review',()=>{
 let opened=0;const nodes={'#confirm-amount':{disabled:true,hasAttribute:k=>k==='aria-busy'},'#sheet-body .entry-person':null,'#sheet-body':{prepend(){}}};
 const context={document:{addEventListener(){}},window:{},isPlatform:true,CashCore:Core,CashUI:{reviewSummary:()=>''},$:s=>nodes[s],modal:()=>opened++,table:{name:'QA',rake:0},remaining:()=>1000000,money:UI.money,esc:UI.escape,entryTitle:()=>'',draft:{kind:'rebuy',amount:'100',payment:'received',stage:'entry',player:{buy:500000,last:500000,out:null,paidIn:500000},reason:''}};
 vm.runInNewContext(fs.readFileSync('visualizations/wireframes/entry.js','utf8')+'\nreviewEntry();',context);assert.equal(opened,1);assert.equal(context.draft.stage,'review');
 nodes['#confirm-amount'].hasAttribute=()=>false;context.draft.stage='entry';vm.runInNewContext('reviewEntry()',context);assert.equal(opened,1);
});
test('reviewed entry saves once despite busy styling and duplicate callbacks; save rejection remains retryable',async()=>{
 const p={...table.players[0],buy:500000,last:500000,out:null,paidIn:500000};let writes=0,release,fail=false;
 const buttons={'#save-entry':{disabled:true,hasAttribute:k=>k==='aria-busy'},'#large-ack':null,'#discard-sheet':{close(){}},'#save-error':{textContent:''}};
 const context={document:{addEventListener(){}},window:{},sheet:{close(){}},CashCore:Core,$:s=>buttons[s],draft:{kind:'rebuy',id:1,key:'one',stage:'review',amount:'100',player:p,payment:'received',reason:'',returnView:'table'},contacts:[],table:{players:[p]},isPlatform:true,playing:()=>[p],event(){},render(){},notify(){},money:UI.money,persistChange:async(kind,mutate)=>{writes++;await new Promise(r=>release=r);if(fail)throw Error('Disk full');mutate()}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('visualizations/wireframes/entry.js','utf8'),context);
 const first=vm.runInContext('commitAmount()',context);await vm.runInContext('commitAmount()',context);assert.equal(writes,1);release();await first;assert.equal(p.buy,510000);assert.equal(p.paidIn,510000);
 context.draft={kind:'rebuy',id:1,key:'two',stage:'review',amount:'100',player:p,payment:'received',reason:'',returnView:'table'};fail=true;const rejected=vm.runInContext('commitAmount()',context);release();await rejected;assert.equal(context.draft.committed,false);assert.equal(buttons['#save-error'].textContent,'Disk full');assert.equal(p.buy,510000);
});

test('a new buy-in that resolves an imbalance does not retain the old discrepancy warning',()=>{
 let html='';const nodes={'#confirm-amount':{disabled:false},'#sheet-body .entry-person':null};
 const context={document:{addEventListener(){}},window:{},isPlatform:true,CashCore:Core,CashUI:{reviewSummary:()=>''},$:s=>nodes[s],modal:(title,kicker,body)=>html=body,table:{name:'QA',rake:0},remaining:()=>-100,money:UI.money,esc:UI.escape,entryTitle:()=>'',draft:{kind:'buy',amount:'1000',payment:'received',stage:'entry',player:{buy:0,last:0,out:null,paidIn:0},reason:''}};
 vm.runInNewContext(fs.readFileSync('visualizations/wireframes/entry.js','utf8')+'\nreviewEntry();',context);assert(!html.includes('would exceed buy-ins'));assert(!html.includes('id="large-ack"'));
});
