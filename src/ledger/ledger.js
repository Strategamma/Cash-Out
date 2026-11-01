/* A self-contained audit log and its current projection travel in every full backup. */
(function(root){
 const copy=value=>JSON.parse(JSON.stringify(value));
 const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
 const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
 const fields=['table','contacts','payments','historyTables'];
 const state=data=>Object.fromEntries(fields.map(key=>[key,copy(data[key])]));
 const fail=message=>{throw new Error(message)};
 function validateState(data,core,history){
  core.validateBackup({demo:true,version:1,...state(data)});
  history.validate(data.historyTables,data.contacts,core);
  const tables=[data.table,...data.historyTables];
  if(tables.some(t=>typeof t.id!=='string'||!t.id||t.id.length>100)||new Set(tables.map(t=>t.id)).size!==tables.length)fail('Duplicate or missing table identity.');
  if(tables.some(t=>!/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')))fail('Missing table date.');
  for(const t of tables){
   const b=core.balance(t);
   if(!Number.isSafeInteger(b.buy)||!Number.isSafeInteger(b.out))fail('Table totals exceed exact arithmetic limits.');
  }
 }
 function diff(before,after,path=[],result=[]){
  if(same(before,after))return result;
  if(before&&after&&typeof before==='object'&&typeof after==='object'&&Array.isArray(before)===Array.isArray(after)){
   if(Array.isArray(before)){
    const shared=Math.min(before.length,after.length);
    for(let i=0;i<shared;i++)diff(before[i],after[i],[...path,i],result);
    for(let i=before.length-1;i>=after.length;i--)result.push({path:[...path,i],before:copy(before[i]),remove:true});
    for(let i=shared;i<after.length;i++)result.push({path:[...path,i],add:true,after:copy(after[i])});
   }else{
    for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
     if(!Object.hasOwn(after,key))result.push({path:[...path,key],before:copy(before[key]),remove:true});
     else if(!Object.hasOwn(before,key))result.push({path:[...path,key],add:true,after:copy(after[key])});
     else diff(before[key],after[key],[...path,key],result);
    }
   }
  }else result.push({path,before:copy(before),after:copy(after)});
  return result;
 }
 function replayChange(data,change){
  const path=change.path;
  if(!Array.isArray(path)||!fields.includes(path[0])||path.some(key=>!['string','number'].includes(typeof key)||['__proto__','constructor','prototype'].includes(key)))fail('Invalid ledger path.');
  let target=data;
  for(const key of path.slice(0,-1)){if(!target||Array.isArray(target)&&!Number.isSafeInteger(key)||!Object.hasOwn(target,key))fail('Broken ledger path.');target=target[key];}
  const key=path.at(-1);
  if(!target||typeof target!=='object')fail('Invalid ledger target.');
  if(Array.isArray(target)&&(!Number.isSafeInteger(key)||key<0))fail('Invalid ledger array index.');
  if(change.add){
   if(Array.isArray(target)){if(key!==target.length)fail('Invalid ledger array append.');target.push(copy(change.after));}
   else{if(Object.hasOwn(target,key))fail('Ledger field already exists.');target[key]=copy(change.after);}
  }else{
   if(!Object.hasOwn(target,key)||!same(target[key],change.before))fail('Ledger does not match its earlier records.');
   if(change.remove){if(Array.isArray(target)){if(key!==target.length-1)fail('Invalid ledger array removal.');target.pop();}else delete target[key];}
   else target[key]=copy(change.after);
  }
 }
 function create(initial,{id=crypto.randomUUID(),time=new Date().toISOString(),kind='workspace-created'}={}){
  const base=state(initial);
  return {format:'cash-out-ledger',version:2,...copy(base),ledger:{id,createdAt:time,origin:kind,base,entries:[]}};
 }
 function append(previous,next,meta){
  if(previous.ledger.entries.some(e=>e.id===meta.id))return copy(previous);
  const changes=diff(state(previous),state(next));
  if(!changes.length)return copy(previous);
  if(!meta.id||!meta.kind||!Number.isFinite(Date.parse(meta.time)))fail('Missing transaction identity or timestamp.');
  if(meta.correction&&String(meta.reason||'').trim().length<3)fail('A correction needs a reason.');
  const table=meta.table||(meta.kind==='table-created'?next.table:previous.table);
  const prior=meta.correction?previous.ledger.entries.findLast(e=>e.table.id===table.id&&(meta.paymentId?e.changes.some(c=>c.after?.id===meta.paymentId):e.subjectId===(meta.subjectId??null)&&e.family===meta.family)):null;
  const subjectId=meta.paymentId&&prior?prior.subjectId:meta.subjectId??null;
  const family=meta.paymentId&&prior?prior.family:meta.family||meta.kind;
  const entry={id:meta.id,sequence:previous.ledger.entries.length+1,time:meta.time,kind:meta.kind,family,subjectId,subjectName:next.contacts.find(p=>p.id===subjectId)?.name||'',reason:meta.reason||'',correction:Boolean(meta.correction),correctionOf:prior?.id||null,
   table:{id:table.id,name:table.name,date:table.date,currency:'INR',banker:table.banker,bankerId:table.bankerId??null,smallBlind:table.small,bigBlind:table.big},changes};
  return {format:'cash-out-ledger',version:2,...state(next),ledger:{...copy(previous.ledger),entries:[...copy(previous.ledger.entries),entry]}};
 }
 function validate(data,core,history){
  if(data?.format!=='cash-out-ledger'||data.version!==2||!data.ledger||typeof data.ledger.id!=='string'||!Number.isFinite(Date.parse(data.ledger.createdAt))||!Array.isArray(data.ledger.entries))fail('Choose a version 2 Cash Out full backup.');
  validateState(data,core,history);
  const projection=copy(data.ledger.base),ids=new Set();
  validateState(projection,core,history);
  for(const [i,e] of data.ledger.entries.entries()){
   if(!e||typeof e.id!=='string'||!e.id||ids.has(e.id)||e.sequence!==i+1||!Number.isFinite(Date.parse(e.time))||typeof e.kind!=='string'||!e.kind||typeof e.family!=='string'||!e.table?.id||e.table.currency!=='INR'||!Array.isArray(e.changes)||!e.changes.length)fail('Invalid or duplicate ledger transaction.');
   if(e.correction&&String(e.reason||'').trim().length<3)fail('Missing correction reason.');
   if(e.correctionOf&&!data.ledger.entries.slice(0,i).some(prior=>prior.id===e.correctionOf&&prior.table.id===e.table.id&&prior.subjectId===e.subjectId&&prior.family===e.family))fail('Invalid correction reference.');
   const contexts=copy([projection.table,...projection.historyTables]);
   ids.add(e.id);for(const change of e.changes)replayChange(projection,change);
   validateState(projection,core,history);
   const context=[...contexts,projection.table,...projection.historyTables].find(t=>t.id===e.table.id);
   if(!context||e.table.name!==context.name||e.table.date!==context.date||e.table.smallBlind!==context.small||e.table.bigBlind!==context.big||e.table.banker!==context.banker||(e.table.bankerId??null)!==(context.bankerId??null))fail('Transaction table context does not match its recorded state.');
  }
  if(!same(projection,state(data)))fail('Backup totals do not match the transaction ledger.');
  return data;
 }
 function csv(data){
  const cell=value=>'"'+String(value??'').replace(/^[=+@\-]/,"'$&").replace(/"/g,'""')+'"';
  const rows=[['schema','record_type','workspace_id','transaction_id','sequence','timestamp','kind','table_id','table_name','table_date','currency','banker','banker_id','small_blind_INR','big_blind_INR','player_id','player_name','reason','correction_of','amount_unit','data_json']];
  rows.push([2,'baseline',data.ledger.id,'',0,data.ledger.createdAt,data.ledger.origin,'','','','INR','','','','','','','','','paise',JSON.stringify(data.ledger.base)]);
  for(const e of data.ledger.entries)rows.push([2,'transaction',data.ledger.id,e.id,e.sequence,e.time,e.kind,e.table.id,e.table.name,e.table.date,'INR',e.table.banker,e.table.bankerId,e.table.smallBlind,e.table.bigBlind,e.subjectId,e.subjectName,e.reason,e.correctionOf,'paise',JSON.stringify(e.changes)]);
  return rows.map(row=>row.map(cell).join(',')).join('\r\n');
 }
 async function commit(controller,previous,next,meta){
  if(controller.blocked||!controller.enabled)fail(controller.message||'Device saving is unavailable. Reload before recording more changes.');
  const payload=append(previous,next,meta);
  await controller.save(payload);
  if(controller.blocked||!same(controller.record?.payload,payload))fail(controller.message||'The device did not confirm this save.');
  return payload;
 }
 const api={copy,state,create,append,validate,validateState,csv,commit};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashLedger=api;
})(typeof window==='undefined'?{}:window);
