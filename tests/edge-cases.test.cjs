const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const core=require('../visualizations/wireframes/core.js');
const {Store}=require('../src/backup/store.js');

test('correcting a buy-in to zero cannot erase prior money or a recorded shortcut',()=>{
 const empty={id:1,buy:0,last:0,out:null,paidIn:0,paidOut:0};
 assert(core.canRemoveSeat(empty,[]));
 for(const field of ['buy','last','paidIn','paidOut','priorOut'])assert(!core.canRemoveSeat({...empty,[field]:100},[]),field);
 assert(!core.canRemoveSeat({...empty,out:0},[]));
 assert(!core.canRemoveSeat(empty,[{from:1,to:'bank',amount:100}]));
 assert(!core.canRemoveSeat(empty,[{from:'bank',to:1,amount:100,reversed:true}]));
});

test('Escape and discard cannot dismiss an entry until its pending save finishes',()=>{
 let saving=true,closed=0;
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{open:false,close(){closed++},showModal(){this.open=true}});return elements.get(id)};
 const listeners={};
 const ctx=vm.createContext({window:{CashBackupUI:{state:()=>({saving}),capture(){}}},document:{addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn)},$:element});
 vm.runInContext(fs.readFileSync('visualizations/wireframes/entry.js','utf8'),ctx);
 ctx.sheet=element('#sheet');
 vm.runInContext("draft={committed:true,stage:'review',amount:'500',initial:'',payment:'received',reason:''};close()",ctx);
 assert.equal(closed,0);
 for(const listener of listeners.click)listener({target:{closest:selector=>selector==='[data-loss]'?{dataset:{loss:'discard'}}:null}});
 assert.equal(closed,0);
 saving=false;vm.runInContext('close()',ctx);assert.equal(closed,2);
});

test('device reads await transaction completion and reject an abort even after request success',async()=>{
 let tx,request;
 const store=new Store();store.db={transaction(){tx={objectStore:()=>({get(){request={};return request}})};return tx}};
 const first=store.read();await Promise.resolve();request.result={revision:1};request.onsuccess();
 let done=false;first.then(()=>{done=true});await Promise.resolve();assert(!done);
 tx.oncomplete();assert.deepEqual(await first,{revision:1});
 const aborted=store.read();await Promise.resolve();request.result={revision:2};request.onsuccess();tx.onabort();
 await assert.rejects(aborted,/Could not read/);
});

test('three thousand mixed-payment settlements conserve exact paise in both modes',()=>{
 let seed=98317;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
 for(let run=0;run<3000;run++){
  const players=Array.from({length:1+random(15)},(_,i)=>({id:i+1,name:'Player '+i,buy:random(10000000),out:random(10000000),paidIn:random(10000000),paidOut:random(10000000)}));
  const table={players,bankerId:run%2?players[0].id:undefined};
  const payments=Array.from({length:random(20)},()=>({from:random(players.length)+1,to:'bank',amount:random(1000000),recent:false}));
  for(const mode of ['banker','direct']){
   const rows=core.obligations(table,payments),transfers=core.suggestTransfers(rows,mode);
   assert(transfers.every(t=>t.from!==t.to&&Number.isSafeInteger(t.amount)&&t.amount>0));
   const after=core.obligations(table,[...payments,...transfers.map(t=>({...t,recent:false}))]);
   assert.deepEqual(after,[],`run ${run}, mode ${mode}`);
  }
 }
});

test('received rebuy after a downward correction cannot overflow retained payment totals',()=>{
 const ctx=vm.createContext({document:{addEventListener(){}},CashCore:core});
 vm.runInContext(fs.readFileSync('visualizations/wireframes/entry.js','utf8'),ctx);
 vm.runInContext("draft={kind:'rebuy',amount:'1',payment:'received',player:{buy:0,paidIn:CashCore.MAX_AMOUNT}}",ctx);
 assert.match(vm.runInContext('entryError()',ctx),/received money/);
 vm.runInContext("draft.payment='later'",ctx);assert.equal(vm.runInContext('entryError()',ctx),'');
});

test('UI capacity limits stop before attempting a save or opening a money draft',()=>{
 const nodes=new Map(),listeners={};
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{style:{},open:false,querySelector(){return null},querySelectorAll(){return []},addEventListener(){},setAttribute(){},innerHTML:'',textContent:''});return nodes.get(selector)};
 const context=vm.createContext({window:{CASH_OUT_PLATFORM:true,scrollTo(){}},document:{querySelector:node,documentElement:{dataset:{theme:'dark'}},addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn)},CashCore:core,CashUI:new Proxy({},{get:()=>()=>''}),CashMotion:{enter(){}},crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},close(){}});
 vm.runInContext(fs.readFileSync('visualizations/wireframes/app.js','utf8'),context);
 vm.runInContext("contacts=Array.from({length:1000},(_,i)=>({id:i+1}));playerForm()",context);
 assert.match(node('#toast').textContent,/1,000/);
 vm.runInContext("table.players=Array.from({length:100},(_,i)=>({id:i+1}));seat(101)",context);
 assert.match(node('#toast').textContent,/100 players/);
 assert.equal(vm.runInContext('draft',context),null);
});
