const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('./core.js');
const UI = require('./components.js');

const player = (id, buy, out, paidIn = 0, paidOut = 0) => ({ id, name:'Player '+id, phone:'', buy, out, paidIn, paidOut, last:buy });
const table = () => ({ name:'Test table', banker:'Host', small:50, big:100, rake:40000, closed:true, mode:'banker',
  players:[player(1,500000,680000,500000),player(2,500000,280000,500000)], events:[] });

test('money stays exact and malformed/overprecise/negative values are rejected', () => {
  assert.equal(C.parseAmount('0.10'),10);
  assert.equal(C.parseAmount('1.01')+C.parseAmount('0.09'),110);
  assert.equal(C.parseAmount('0'),0);
  for(const text of ['', '-2','1,000','1e6','NaN','1.001','1.2.3','9999999999']) assert.equal(C.parseAmount(text),null);
  assert.equal(C.inputValue('1.25','bb',100),12500);
  assert.equal(C.inputValue('999999999','bb',100),null);
});
test('rake participates once in reconciliation; missing and zero stacks differ', () => {
  const t=table();
  assert.equal(C.balance(t).balanced,true);
  t.players[1].out=null;
  assert.equal(C.balance(t).balanced,false);
  assert.equal(C.balance(t).pending.length,1);
  t.players[1].out=0;
  assert.equal(C.balance(t).pending.length,0);
  assert.equal(C.balance(t).difference,280000);
  t.players[1].out=300000;
  assert.equal(C.balance(t).difference,-20000);
});
test('empty tables cannot be finalized', () => {
  assert.equal(C.balance({players:[],rake:0}).balanced,false);
});
test('re-entry preserves earlier cash-outs while new stack is unknown', () => {
  const t=table();t.closed=false;
  t.players[0]={...t.players[0],buy:700000,priorOut:680000,out:null};
  assert.equal(C.balance(t).out,960000);
  assert.equal(C.balance(t).difference,200000);
  t.players[0].out=880000;
  assert.equal(C.balance(t).balanced,true);
});
test('banker owes full unpaid cash-out when buy-ins were received', () => {
  const t=table();
  const transfers=C.suggestTransfers(C.obligations(t,[]),'banker');
  assert.equal(transfers.reduce((s,p)=>s+p.amount,0),960000);
  assert.ok(transfers.every(p=>p.from==='bank'));
});
test('direct settlement conserves all balances and leaves rake with banker allocation', () => {
  const t=table();t.players.forEach(p=>p.paidIn=0);
  const rows=C.obligations(t,[]),transfers=C.suggestTransfers(rows,'direct');
  assert.ok(transfers.some(p=>p.from===2&&p.to===1&&p.amount===180000));
  assert.ok(transfers.some(p=>p.to==='bank'&&p.amount===40000));
  const payments=transfers.map(p=>({...p,recent:false}));
  assert.deepEqual(C.obligations(t,payments),[]);
  assert.equal(payments.filter(p=>p.to==='bank').reduce((s,p)=>s+p.amount,0),t.rake);
});
test('partial and mixed payments reduce only remaining obligations', () => {
  const t=table();t.players.forEach(p=>p.paidIn=0);
  const payments=[{from:2,to:1,amount:100000,recent:false},{from:2,to:'bank',amount:40000,recent:false}];
  assert.deepEqual(C.obligations(t,payments).map(p=>p.net),[-80000,80000]);
  assert.deepEqual(C.suggestTransfers(C.obligations(t,payments),'direct').map(p=>p.amount),[80000]);
  assert.equal(C.obligations(t,[...payments,{from:2,to:1,amount:80000,recent:true}])[0].net,-80000);
});
test('correction after payout exposes a return obligation instead of losing payment', () => {
  const t=table();t.players[0].paidOut=680000;t.players[0].out=600000;
  assert.equal(C.obligations(t,[]).find(p=>p.id===1).net,80000);
});
test('payment record reversal retains history and restores the outstanding balance', () => {
  const t=table();
  const pay={id:'p1',from:'bank',to:1,amount:100000,recent:false};
  const correction={id:'p2',from:1,to:'bank',amount:100000,recent:false,reverses:'p1',reason:'Marked paid by mistake'};
  assert.equal(C.obligations(t,[pay])[0].net,-580000);
  pay.reversed=true;
  assert.deepEqual(C.obligations(t,[pay,correction]),C.obligations(t,[]));
  const data={demo:true,version:1,table:t,contacts:structuredClone(t.players),payments:[pay,correction]};
  assert.deepEqual(C.validateBackup(JSON.parse(JSON.stringify(data))),data);
  const bad=structuredClone(data);bad.payments.push({...correction,id:'p3'});
  assert.throws(()=>C.validateBackup(bad));
});
test('demo backup validation checks duplicate IDs, relationships, amounts and closure', () => {
  const t=table();const data={demo:true,version:1,table:t,contacts:structuredClone(t.players),payments:[]};
  assert.equal(C.validateBackup(data),data);
  for(const mutate of [
    d=>d.table.players.push({...d.table.players[0]}),
    d=>d.table.players[0].buy=-1,
    d=>d.table.players[0].out=null,
    d=>d.table.players[0].priorOut=-100,
    d=>d.contacts=[],
    d=>d.payments.push({from:100,to:'bank',amount:1,recent:false}),
    d=>d.contacts[0].photo='javascript:alert(1)',
    d=>d.table.mode='mystery',
    d=>d.table.events.push({title:'x'}),
  ]) {const bad=structuredClone(data);mutate(bad);assert.throws(()=>C.validateBackup(bad));}
});
test('UI primitives escape user text and keep controls accessible', () => {
  assert.ok(UI.button({label:'<img onerror=x>'}).includes('&lt;img'));
  assert.ok(UI.avatar({name:'<evil>',photo:'javascript:alert(1)'}).includes('&lt;'));
  assert.ok(!UI.avatar({name:'X',photo:'javascript:alert(1)'}).includes('<img'));
  assert.ok(UI.field({id:'name',label:'Name',error:'Required'}).includes('aria-invalid="true"'));
  assert.equal((UI.keypad().match(/<button /g)||[]).length,12);
});

test('player filters distinguish stack status from outstanding buy-ins and payouts',()=>{
 const table={players:[{id:1,name:'Playing paid',buy:10000,out:null,paidIn:10000,paidOut:0},{id:2,name:'Playing unpaid',buy:10000,out:null,paidIn:0,paidOut:0},{id:3,name:'Zero cash-out',buy:10000,out:0,paidIn:10000,paidOut:0},{id:4,name:'Payout pending',buy:10000,out:12000,paidIn:10000,paidOut:0}]};
 const ids=filter=>C.filterPlayers(table,[],filter).map(p=>p.id);
 assert.deepEqual(ids('all'),[1,2,3,4]);assert.deepEqual(ids('playing'),[1,2]);assert.deepEqual(ids('cashed'),[3,4]);assert.deepEqual(ids('outstanding'),[2,4]);
 const payments=[{from:2,to:'bank',amount:10000,recent:false},{from:'bank',to:4,amount:12000,recent:false}];
 assert.deepEqual(C.filterPlayers(table,payments,'outstanding'),[]);assert.equal(table.players.length,4);
});

test('a seated banker never receives a self-payment instruction',()=>{
 const t=table();t.bankerId=1;t.banker='Player 1';
 const rows=C.obligations(t,[]);assert.deepEqual(rows.map(p=>p.id),[2]);
 assert.deepEqual(C.filterPlayers(t,[],'outstanding').map(p=>p.id),[2]);
 const report=C.summaryModel(t,[]);assert.equal(report.players.length,2);assert.equal(report.transfers.length,1);assert.equal(report.transfers[0].label,'Banker (Player 1) → Player 2');assert.equal(report.totals.buy,1000000);
});
test('share summary excludes private fields and withholds unfinished settlement',()=>{
 const t=table();t.players[0].phone='123456789';t.players[0].photo='private-photo';
 const final=C.summaryModel(t,[]);assert.ok(final.totals.balanced);assert.equal(final.players[0].net,180000);assert.equal(final.transfers.length,2);assert.ok(!JSON.stringify(final).includes('123456789'));assert.ok(!JSON.stringify(final).includes('private-photo'));
 t.players[0].out=null;const unfinished=C.summaryModel(t,[]);assert.equal(unfinished.players[0].net,null);assert.equal(unfinished.totals.pending,1);assert.deepEqual(unfinished.transfers,[]);
 t.players[0].out=680001;assert.deepEqual(C.summaryModel(t,[]).transfers,[]);
});
