const {test}=require('node:test');
const assert=require('node:assert/strict');
const H=require('./history.js'),C=require('./core.js');
test('ten reproducible balanced nine-seat tables cover all fifteen identities',()=>{
 const {contacts,tables}=H.seed();assert.equal(contacts.length,15);assert.equal(tables.length,10);assert.deepEqual(H.seed().tables,tables);
 const ids=new Set();for(const t of tables){assert.equal(t.players.length,9);assert.equal(new Set(t.players.map(p=>p.id)).size,9);assert.ok(C.balance(t).balanced);t.players.forEach(p=>{assert.ok(contacts.some(c=>c.id===p.id));ids.add(p.id)});assert.equal(t.players.reduce((n,p)=>n+p.out-p.buy,0),-t.rake)}assert.equal(ids.size,15);H.validate(tables,contacts,C);
});
test('conditional averages, extrema, win rate and cumulative trend use actual final results',()=>{
 const table=(id,out)=>({id,date:'2026-10-0'+id,closed:true,rake:0,players:[{id:1,buy:10000,out},{id:2,buy:10000,out:20000-out}]});
 const s=H.stats([table('3',9000),table('1',13000),table('2',8000),table('4',10000)],1);
 assert.deepEqual([s.sessions,s.wins,s.losses,s.winRate,s.net,s.averageWin,s.averageLoss,s.biggestWin,s.biggestLoss,s.averageBuy],[4,1,2,25,0,3000,-1500,3000,-2000,10000]);assert.deepEqual(s.trend.map(r=>r.cumulative),[3000,1000,0,0]);
 assert.equal(H.stats([table('1',13000)],1).averageLoss,null);assert.equal(H.stats([],1).winRate,null);
});
test('unfinished, unbalanced and duplicate tables cannot inflate statistics',()=>{
 const {tables}=H.seed(),t=tables[0],id=t.players[0].id;
 const unfinished={...t,id:'unfinished',closed:false},bad=structuredClone(t);bad.id='bad';bad.players[0].out++;
 assert.equal(H.stats([t,t,unfinished,bad],id).sessions,1);
});
test('historical payments stay table-scoped and survive validated JSON backup',()=>{
 const {tables,contacts}=H.seed(),t=tables.at(-1),other=tables.at(-2);
 const before=C.suggestTransfers(C.obligations(other,other.payments),'banker');
 const transfer=C.suggestTransfers(C.obligations(t,t.payments),'banker')[0];
 t.payments.push({...transfer,id:'historical-payment',recent:false});
 assert.deepEqual(C.suggestTransfers(C.obligations(other,other.payments),'banker'),before);
 const copy=JSON.parse(JSON.stringify({historyTables:tables,contacts}));H.validate(copy.historyTables,copy.contacts,C);assert.deepEqual(copy.historyTables,tables);
 const statsBefore=H.stats(tables,t.players[0].id);t.payments=[];assert.deepEqual(H.stats(tables,t.players[0].id),statsBefore);
 const bad=structuredClone(tables);bad[0].players[0].out++;assert.throws(()=>H.validate(bad,contacts,C));
});
