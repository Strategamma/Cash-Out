const {test}=require('node:test');
const assert=require('node:assert/strict');
const L=require('../src/ledger/ledger.js');
const core=require('../visualizations/wireframes/core.js');
const history=require('../visualizations/wireframes/history.js');
const {Controller}=require('../src/backup/controller.js');
const date='2026-11-01',time=date+'T10:00:00.000Z';
function empty(){return {table:{id:'table-one',name:'Friday',date,banker:'You',small:50,big:100,rake:0,closed:false,mode:'banker',players:[],events:[]},contacts:[],payments:[],historyTables:[]};}
const fresh=()=>L.create(empty(),{id:'workspace',time});
let count=0;
function change(data,kind,mutate,meta={}){const next=L.copy(data);mutate(next);const result=L.append(data,next,{id:'op-'+(++count),time,kind,...meta});L.validate(result,core,history);return result;}
function seated(){let data=change(fresh(),'player-created',s=>s.contacts.push({id:1,name:'Alex',phone:'',last:500000}));return change(data,'buy',s=>s.table.players.push({...s.contacts[0],buy:500000,out:null,paidIn:500000,paidOut:0}),{family:'buy-in',subjectId:1});}
test('first workspace is empty and complete audit replay validates exact paise amounts',()=>{
 const first=fresh();assert.equal(first.contacts.length,0);assert.equal(first.historyTables.length,0);
 const data=change(seated(),'rebuy',s=>{s.table.players[0].buy+=125050;s.table.players[0].paidIn+=125050;},{family:'buy-in',subjectId:1});
 assert.equal(data.table.players[0].buy,625050);assert.equal(data.ledger.entries.length,3);assert.equal(data.ledger.entries.at(-1).table.name,'Friday');assert.equal(data.ledger.entries.at(-1).table.currency,'INR');
 assert.equal(first.ledger.entries.length,0);
});
test('corrections keep original records and link to the prior matching player and table',()=>{
 const first=seated();const data=change(first,'edit',s=>{s.table.players[0].buy=450000;},{family:'buy-in',subjectId:1,correction:true,reason:'Initial amount miscounted'});
 assert.equal(data.ledger.entries.at(-1).correctionOf,first.ledger.entries.at(-1).id);
 assert.equal(first.table.players[0].buy,500000);
 assert.throws(()=>change(first,'edit',s=>{s.table.players[0].buy=0;},{correction:true,reason:''}),/reason/);
});
test('same operation ID cannot apply a second buy-in and no-op navigation adds no transaction',()=>{
 const data=seated(),next=L.copy(data);next.table.players[0].buy+=500000;
 assert.deepEqual(L.append(data,next,{id:data.ledger.entries.at(-1).id,kind:'buy',time}),data);
 assert.deepEqual(L.append(data,L.copy(data),{id:'navigation',kind:'nav',time}),data);
});
test('completed tables and their outstanding payments survive starting a new table',()=>{
 let data=change(seated(),'cashout',s=>{s.table.players[0].out=500000;},{subjectId:1});
 data=change(data,'table-closed',s=>{s.table.closed=true;});
 data=change(data,'table-created',s=>{s.historyTables.push({...L.copy(s.table),payments:L.copy(s.payments)});s.table={...empty().table,id:'table-two',name:'Saturday'};s.payments=[];});
 assert.equal(data.historyTables[0].players[0].paidOut,0);assert.equal(core.obligations(data.historyTables[0],[])[0].net,-500000);
 assert.equal(data.ledger.entries.at(-1).table.id,'table-two');
 data=change(data,'settlement-payment',s=>s.historyTables[0].payments.push({id:'payment',from:'bank',to:1,amount:500000,recent:false}),{table:data.historyTables[0]});
 assert.equal(core.obligations(data.historyTables[0],data.historyTables[0].payments).length,0);
});
test('replay rejects edited totals, missing/reordered/duplicate entries and invalid table snapshots',()=>{
 const data=seated();
 for(const corrupt of [d=>{d.table.players[0].buy++;},d=>d.ledger.entries.shift(),d=>d.ledger.entries.reverse(),d=>{d.ledger.entries[1].id=d.ledger.entries[0].id;},d=>{d.ledger.entries[1].table.name='Other table';},d=>{d.ledger.entries[1].changes[0].path=['__proto__','polluted'];}]){const bad=L.copy(data);corrupt(bad);assert.throws(()=>L.validate(bad,core,history));}
 assert.equal({}.polluted,undefined);
});
test('replay rejects invalid intermediate financial values even if the final state was repaired',()=>{
 const first=seated(),bad=L.copy(first);bad.table.players[0].buy=-1;
 const intermediate=L.append(first,bad,{id:'bad',kind:'edit',time});
 const repaired=L.append(intermediate,first,{id:'repair',kind:'edit',time});
 assert.throws(()=>L.validate(repaired,core,history),/Invalid buy-in/);
});
test('full backups survive JSON round trip; financial updates do not repeat unchanged photos',()=>{
 const initial=seated();const photo='data:image/png;base64,'+'A'.repeat(1000);
 const withPhoto=change(initial,'player-edited',s=>{s.contacts[0].photo=photo;s.table.players[0].photo=photo;});
 const next=change(withPhoto,'rebuy',s=>{s.table.players[0].buy+=100;},{family:'buy-in',subjectId:1});
 assert(!JSON.stringify(next.ledger.entries.at(-1)).includes(photo));
 L.validate(JSON.parse(JSON.stringify(next)),core,history);
});
test('payment reversals reference the original transaction and retain its record',()=>{
 let data=change(seated(),'cashout',s=>{s.table.players[0].out=500000;});
 data=change(data,'settlement-payment',s=>s.payments.push({id:'paid',from:'bank',to:1,amount:500000,recent:false}));
 const original=data.ledger.entries.at(-1).id;
 data=change(data,'payment-reversed',s=>{s.payments[0].reversed=true;s.payments.push({id:'undo',from:1,to:'bank',amount:500000,recent:false,reverses:'paid',reason:'Wrong record'});},{correction:true,reason:'Wrong record',paymentId:'paid'});
 assert.equal(data.ledger.entries.at(-1).correctionOf,original);assert.equal(data.payments.length,2);assert.equal(core.obligations(data.table,data.payments)[0].net,-500000);
});
test('CSV contains a baseline and exact changes with units and formula protection',()=>{
 const data=change(seated(),'player-edited',s=>{s.contacts[0].name='=FORMULA';});const csv=L.csv(data);
 assert(csv.includes('"record_type"'));assert(csv.includes('"baseline"'));assert(csv.includes('"paise"'));assert(csv.includes('500000'));assert(csv.includes('"table_id"'));assert(csv.includes('"correction_of"'));
 const tricky=change(data,'player-edited',s=>{s.contacts[0].name='=FORMULA';s.table.name='=SUM(1,2)';});
 const exported=change(tricky,'rebuy',s=>{s.table.players[0].buy++;},{subjectId:1});
 assert(L.csv(exported).includes("\"'=SUM(1,2)\""));assert(L.csv(exported).includes("\"'=FORMULA\""));
});
function saving(){
 const store={value:null,fail:false,async read(){return this.value;},async write(record,revision){if(this.fail)throw Error('Disk full');if((this.value?.revision||0)!==revision)throw Error('Another tab changed records');this.value=L.copy(record);}};
 const controller=new Controller({store,validate:data=>L.validate(data,core,history),driveFactory:()=>null,id:()=> 'dataset'});return {store,controller};
}
test('transaction promise waits for local acknowledgement and can reload the complete ledger',async()=>{
 const {store,controller}=saving();const before=seated();await controller.enable(before);
 const next=L.copy(before);next.table.players[0].buy+=100;
 let release;const write=store.write.bind(store);store.write=(...args)=>new Promise(resolve=>{release=async()=>resolve(await write(...args));});
 let done=false;const pending=L.commit(controller,before,next,{id:'waiting',kind:'rebuy',time}).then(data=>{done=true;return data;});
 await new Promise(resolve=>setImmediate(resolve));assert(!done);assert.equal(store.value.payload.table.players[0].buy,500000);await release();const result=await pending;assert(done);assert.equal(result.table.players[0].buy,500100);
 const reload=new Controller({store,validate:d=>L.validate(d,core,history),driveFactory:()=>null});assert.deepEqual(await reload.init(),result);
});
test('failed and stale writes preserve the prior durable state and reject later false success',async()=>{
 const {store,controller}=saving();const before=seated();await controller.enable(before);const next=L.copy(before);next.table.players[0].buy++;
 store.fail=true;await assert.rejects(()=>L.commit(controller,before,next,{id:'failure',kind:'rebuy',time}),/Disk full/);assert.deepEqual(store.value.payload,before);
 await assert.rejects(()=>L.commit(controller,before,next,{id:'retry',kind:'rebuy',time}),/Disk full/);
 const other=saving();await other.controller.enable(before);other.store.value.revision++;await assert.rejects(()=>L.commit(other.controller,before,next,{id:'stale',kind:'rebuy',time}),/Another tab/);assert.deepEqual(other.store.value.payload,before);
});
