/* One-table tournament rules and exact cash/prize accounting. No UI or storage. */
(function(root){
 const MAX=99999999999,clone=x=>JSON.parse(JSON.stringify(x));
 const cash=n=>Number.isSafeInteger(n)&&n>=0&&n<=MAX;
 const whole=(n,max=1000000000)=>Number.isSafeInteger(n)&&n>0&&n<=max;
 const fail=s=>{throw Error(s)};
 const defaults=()=>({entry:100000,fee:0,startingChips:10000,rebuyChips:10000,addonChips:10000,lateUntil:3,rebuyUntil:3,addonUntil:3,payouts:[5000,3000,2000],levels:[{small:25,big:50,ante:0,minutes:20},{small:50,big:100,ante:0,minutes:20},{small:75,big:150,ante:150,minutes:20},{small:0,big:0,ante:0,minutes:5,break:true},{small:100,big:200,ante:200,minutes:20},{small:150,big:300,ante:300,minutes:20},{small:200,big:400,ante:400,minutes:20}]});
 function rulesValid(r){
  if(!r||!cash(r.entry)||!r.entry||!cash(r.fee)||!cash(r.entry+r.fee)||![r.startingChips,r.rebuyChips,r.addonChips].every(n=>whole(n))||!Array.isArray(r.levels)||!r.levels.length||r.levels.length>100||!Array.isArray(r.payouts)||!r.payouts.length||r.payouts.length>10||!r.payouts.every(n=>whole(n,10000))||r.payouts.reduce((s,n)=>s+n,0)!==10000)fail('Check entry, chips, schedule and payout percentages (total 100%).');
  if(![r.lateUntil,r.rebuyUntil,r.addonUntil].every(n=>Number.isInteger(n)&&n>=0&&n<=r.levels.length))fail('Cutoffs must be schedule levels, or 0 to disable.');
  for(const l of r.levels)if(!l||l.break!==undefined&&typeof l.break!=='boolean'||!whole(l.minutes,180)||!Number.isInteger(l.ante)||l.ante<0||l.ante>1000000000||!(l.break?l.small===0&&l.big===0&&l.ante===0:whole(l.small)&&whole(l.big)&&l.big>=l.small))fail('Use valid chip blinds/ante and whole level minutes.');
 }
 function setup(rules=defaults()){rulesValid(rules);return {version:1,phase:'registration',rules:clone(rules),entries:[],eliminations:[],clock:{level:0,remaining:rules.levels[0].minutes*60000,anchor:null}}}
 const pool=t=>t.tournament.entries.reduce((s,e)=>s+e.prize,0);
 const fees=t=>Array.isArray(t.tournament?.entries)?t.tournament.entries.reduce((s,e)=>s+e.fee,0):0;
 const eliminated=t=>new Set(t.tournament.eliminations.flatMap(g=>g.ids));
 const active=t=>t.players.filter(p=>!eliminated(t).has(p.id));
 function clock(t,now=Date.now()){
  const c=t.tournament.clock,levels=t.tournament.rules.levels;
  if(c.anchor!==null&&now<c.anchor)return {...c,issue:true};
  let level=c.level,remaining=c.remaining-(c.anchor===null?0:now-c.anchor);
  while(remaining<=0&&level<levels.length-1){level++;remaining+=levels[level].minutes*60000}
  return {level,remaining:Math.max(0,remaining),anchor:c.anchor,issue:Boolean(c.issue),break:Boolean(levels[level].break)};
 }
 function checkpoint(t,now){const c=clock(t,now);if(c.issue)fail('Device time changed. Pause and check the clock before continuing.');t.tournament.clock={level:c.level,remaining:c.remaining,anchor:c.anchor===null?null:now}}
 function expect(t,phases){if(t.type!=='tournament'||!phases.includes(t.tournament?.phase))fail('That action is unavailable in this tournament state.')}
 function add(t,player,kind='entry',received=false,now=Date.now(),id=crypto.randomUUID()){
  expect(t,['registration','running']);const tr=t.tournament,r=tr.rules,c=clock(t,now);if(c.issue)fail('Check device time first.');
  if(!['entry','rebuy','addon'].includes(kind))fail('Unknown tournament entry.');
  if(tr.entries.some(e=>e.id===id))return;
  let p=t.players.find(p=>p.id===player.id);
  if(kind==='entry'){
   if(p||t.players.length>=10)fail('Choose an unseated player; one table supports 10 players.');
   if(tr.phase==='running'&&(!r.lateUntil||c.level+1>r.lateUntil))fail('Late registration has closed.');
  }else{
   if(!p||tr.phase!=='running')fail('Start the tournament before rebuys/add-ons.');
   const cutoff=kind==='rebuy'?r.rebuyUntil:r.addonUntil;if(!cutoff||c.level+1>cutoff)fail('This entry window has closed.');
   if(kind==='addon'&&eliminated(t).has(p.id))fail('Only active players can add on.');
  }
  const amount=r.entry+r.fee;if(received&&!cash((p?.paidIn||0)+amount))fail('Received amount exceeds the supported limit.');if(!cash((p?.buy||0)+amount)||!cash(pool(t)+r.entry)||!cash(fees(t)+r.fee)||!cash(t.players.reduce((s,p)=>s+p.buy,0)+amount))fail('Tournament amount exceeds the supported limit.');
  if(!p){p={...clone(player),buy:0,last:amount,out:null,priorOut:0,paidIn:0,paidOut:0};t.players.push(p)}
  p.buy+=amount;if(received)p.paidIn+=amount;p.last=amount;
  if(kind==='rebuy')tr.eliminations=tr.eliminations.map(g=>({...g,ids:g.ids.filter(id=>id!==p.id)})).filter(g=>g.ids.length);
  tr.entries.push({id,playerId:p.id,kind,prize:r.entry,fee:r.fee,chips:kind==='entry'?r.startingChips:kind==='rebuy'?r.rebuyChips:r.addonChips,at:now});
 }
 function start(t,now=Date.now()){expect(t,['registration']);if(t.players.length<Math.max(2,t.tournament.rules.payouts.length))fail('Add at least '+Math.max(2,t.tournament.rules.payouts.length)+' players for this payout structure.');t.tournament.phase='running';t.tournament.clock.anchor=now;t.tournament.startedAt=now}
 function pause(t,now=Date.now()){expect(t,['running']);const c=clock(t,now);t.tournament.clock=c.issue?{...t.tournament.clock,anchor:null,issue:true}:{level:c.level,remaining:c.remaining,anchor:null}}
 function resume(t,now=Date.now(),ack=false){expect(t,['running']);const c=t.tournament.clock;if(c.anchor!==null)return;if(c.issue&&!ack)fail('Confirm the device time before resuming.');c.anchor=now;delete c.issue}
 function next(t,now=Date.now()){expect(t,['running']);checkpoint(t,now);const c=t.tournament.clock;if(c.level>=t.tournament.rules.levels.length-1)fail('This is the final scheduled level.');c.level++;c.remaining=t.tournament.rules.levels[c.level].minutes*60000}
 function eliminate(t,ids,now=Date.now()){
  expect(t,['running']);checkpoint(t,now);const live=new Set(active(t).map(p=>p.id));if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!live.has(id)))fail('Choose active players once.');if(ids.length>=live.size)fail('Leave one player as the tournament winner.');
  t.tournament.eliminations.push({ids:[...ids].sort((a,b)=>a-b),at:now});
  if(active(t).length<=1){t.tournament.phase='review';t.tournament.clock.anchor=null}
 }
 function undo(t){expect(t,['running','review']);if(!t.tournament.eliminations.length)fail('No elimination to correct.');t.tournament.eliminations.pop();t.tournament.phase='running';t.tournament.clock.anchor=null}
 function awards(t){
  expect(t,['review','finished']);const tr=t.tournament,prize=pool(t),slots=tr.rules.payouts.map(b=>Math.floor(prize*b/10000));let remainder=prize-slots.reduce((s,n)=>s+n,0);for(let i=0;remainder;i++,remainder--)slots[i%slots.length]++;
  const groups=[],live=active(t);if(live.length)groups.push({ids:live.map(p=>p.id)});groups.push(...[...tr.eliminations].reverse());let position=1;const rows=[];
  for(const group of groups){const total=Array.from({length:group.ids.length},(_,i)=>slots[position+i-1]||0).reduce((s,n)=>s+n,0),ids=[...group.ids].sort((a,b)=>a-b);ids.forEach((id,i)=>rows.push({id,rank:position,tied:ids.length>1,amount:Math.floor(total/ids.length)+(i<total%ids.length?1:0)}));position+=ids.length}
  return rows;
 }
 function due(t,payments=[]){return t.players.map(p=>({id:p.id,amount:p.buy-p.paidIn+payments.reduce((s,x)=>s+(x.to===p.id?x.amount:0)-(x.from===p.id?x.amount:0),0)})).filter(p=>p.amount>0)}
 function finalize(t,payments=[],now=Date.now()){expect(t,['review']);if(due(t,payments).length)fail('Record all entry contributions before finalizing prizes.');const rows=awards(t);if(rows.reduce((s,p)=>s+p.amount,0)!==pool(t)||rows.length!==t.players.length)fail('Prize allocations do not match the pool.');for(const row of rows)t.players.find(p=>p.id===row.id).out=row.amount;t.tournament.phase='finished';t.tournament.finishedAt=now;t.closed=true}
 function validate(t){
  if(t.type!==undefined&&!['cash','tournament'].includes(t.type))fail('Unknown game type.');if(t.type!=='tournament')return;
  const tr=t.tournament;if(!tr||tr.version!==1||!['registration','running','review','finished'].includes(tr.phase)||t.rake!==0)fail('Invalid tournament state.');rulesValid(tr.rules);
  if(!Array.isArray(tr.entries)||tr.entries.length>10000||new Set(tr.entries.map(e=>e.id)).size!==tr.entries.length||!Array.isArray(tr.eliminations)||tr.eliminations.length>1000)fail('Invalid tournament records.');
  if(t.players.length>10||tr.entries.some(e=>!e||typeof e.id!=='string'||!e.id||e.id.length>100||!t.players.some(p=>p.id===e.playerId)||!['entry','rebuy','addon'].includes(e.kind)||e.prize!==tr.rules.entry||e.fee!==tr.rules.fee||e.chips!==(e.kind==='entry'?tr.rules.startingChips:e.kind==='rebuy'?tr.rules.rebuyChips:tr.rules.addonChips)||!whole(e.at,8640000000000000)))fail('Invalid tournament contribution.');
  const all=tr.eliminations.flatMap(g=>g.ids||[]);if(new Set(all).size!==all.length||tr.eliminations.some(g=>!Array.isArray(g.ids)||!g.ids.length||!whole(g.at,8640000000000000)||g.ids.some(id=>!t.players.some(p=>p.id===id))))fail('Invalid elimination order.');
  for(const p of t.players)if(tr.entries.filter(e=>e.playerId===p.id&&e.kind==='entry').length!==1||p.buy!==tr.entries.filter(e=>e.playerId===p.id).reduce((s,e)=>s+e.prize+e.fee,0))fail('Entry cash does not match player totals.');
  const c=tr.clock;if(!c||!Number.isInteger(c.level)||c.level<0||c.level>=tr.rules.levels.length||!cash(c.remaining)||c.remaining>tr.rules.levels[c.level].minutes*60000||!(c.anchor===null||whole(c.anchor,8640000000000000)))fail('Invalid saved tournament clock.');
  if(c.issue!==undefined&&typeof c.issue!=='boolean')fail('Invalid saved clock uncertainty.');
  if(tr.phase==='registration'&&(c.anchor!==null||c.level!==0||c.remaining!==tr.rules.levels[0].minutes*60000||tr.entries.some(e=>e.kind!=='entry'))||tr.phase!=='registration'&&(!whole(tr.startedAt,8640000000000000)||t.players.length<Math.max(2,tr.rules.payouts.length))||tr.phase==='running'&&active(t).length<2||['review','finished'].includes(tr.phase)&&c.anchor!==null||tr.phase==='finished'&&!whole(tr.finishedAt,8640000000000000))fail('Tournament phase does not match its saved clock or registration.');
  if(t.closed!==(tr.phase==='finished')||tr.phase==='registration'&&tr.eliminations.length||['review','finished'].includes(tr.phase)&&active(t).length!==1||tr.phase!=='finished'&&t.players.some(p=>p.out!==null))fail('Tournament phase does not match its records.');
  if(tr.phase==='finished'){const rows=awards(t);for(const row of rows)if(t.players.find(p=>p.id===row.id).out!==row.amount)fail('Final prize does not match reviewed allocation.');}
 }
 const api={defaults,rulesValid,setup,pool,fees,active,clock,add,start,pause,resume,next,eliminate,undo,awards,due,finalize,validate};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashTournament=api;
})(typeof window==='undefined'?{}:window);
