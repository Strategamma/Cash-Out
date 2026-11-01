const {test}=require('node:test');const assert=require('node:assert/strict');
const {Drive,SCOPE,MAX_BYTES,BackupError}=require('./drive.js');const {Controller}=require('./controller.js');
const response=(data,status=200,headers={})=>new Response(data===null?null:JSON.stringify(data),{status,headers});
const record=()=>({datasetId:'dataset',revision:1,updatedAt:'2026-11-01T10:00:00.000Z',payload:{value:1}});
class MemoryStore{async read(){return structuredClone(this.value||null)}async write(value,expected){if(this.fail)throw new Error('Storage full');if((this.value?.revision||0)!==expected)throw new Error('Other tab changed data');this.value=structuredClone(value)}}
function setup(t,changes={}){const store=new MemoryStore(),uploads=[];let owner='one';const drive={owner:async()=>({id:owner,email:owner+'@example.test'}),upload:async r=>{uploads.push(r);return {id:'file'}},prune:async()=>{},list:async()=>[],download:async()=>({format:'cash-out-drive',version:1,payload:{value:10},revision:1,datasetId:'old'}),...changes};const c=new Controller({store,validate:p=>{if(!p||!Number.isInteger(p.value))throw new Error('Invalid payload')},driveFactory:()=>drive,clock:()=>1000,id:()=> 'new-dataset',delay:60000});t.after(()=>c.disconnect());return {c,store,drive,uploads,owner:value=>owner=value}}
async function linked(c){await c.enable({value:1});await c.connect({token:'secret'});await c.activate();}

test('Drive lists only app-data snapshots, including pagination',async()=>{
 const urls=[];const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async(url,options)=>{urls.push(url);assert.equal(options.headers.Authorization,'Bearer secret');return response(urls.length===1?{files:[{id:'one'}],nextPageToken:'next'}:{files:[{id:'two'}]})}});
 assert.deepEqual((await drive.list()).map(f=>f.id),['one','two']);for(const url of urls){assert.equal(new URL(url).searchParams.get('spaces'),'appDataFolder');assert.match(new URL(url).searchParams.get('q'),/cashOutBackup/)}assert.equal(new URL(urls[1]).searchParams.get('pageToken'),'next');assert.equal(SCOPE,'https://www.googleapis.com/auth/drive.appdata');
});
test('snapshot upload is private, resumable and confirmed only by a returned file ID',async()=>{
 const calls=[];const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async(url,options)=>{calls.push({url,options});if(calls.length===1)return response({files:[]});if(calls.length===2)return response(null,200,{Location:'https://www.googleapis.com/upload/drive/v3/files?upload_id=one'});return response({id:'saved-file'})}});
 assert.equal((await drive.upload(record())).id,'saved-file');const metadata=JSON.parse(calls[1].options.body);assert.deepEqual(metadata.parents,['appDataFolder']);assert.equal(metadata.appProperties.writeId,'dataset:1');const body=JSON.parse(await calls[2].options.body.text());assert.equal(body.payload.value,1);assert.ok(!JSON.stringify(body).includes('secret'));
});
test('retries discover an existing write instead of creating another snapshot',async()=>{
 let count=0;const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async()=>{count++;return response({files:[{id:'existing'}]})}});assert.equal((await drive.upload(record())).id,'existing');assert.equal(count,1);
});
test('unexpected upload destinations never receive an OAuth token',async()=>{
 let count=0;const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async()=>++count===1?response({files:[]}):response(null,200,{Location:'https://attacker.test/upload'})});await assert.rejects(()=>drive.upload(record()),e=>e.code==='protocol');assert.equal(count,2);
});
test('expired, revoked, full-storage and rate-limited requests are distinguished',async()=>{
 let count=0;const expired=new Drive({token:'secret',expiresAt:1,clock:()=>2,fetcher:async()=>{count++}});await assert.rejects(()=>expired.list(),e=>e.code==='auth');assert.equal(count,0);
 for(const [status,reason,code] of [[401,'','auth'],[403,'storageQuotaExceeded','storage'],[403,'insufficientPermissions','permission'],[403,'userRateLimitExceeded','retry'],[429,'','retry'],[503,'','retry']]){const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async()=>response({error:{errors:[{reason}]}},status)});await assert.rejects(()=>drive.list(),e=>e.code===code)}
});
test('restore rejects oversized files, unsupported data and path injection',async()=>{
 const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async()=>response({format:'wrong'})});await assert.rejects(()=>drive.download({id:'x',size:MAX_BYTES+1}),e=>e.code==='size');await assert.rejects(()=>drive.download({id:'../about'}),e=>e.code==='format');await assert.rejects(()=>drive.download({id:'x'}),e=>e.code==='format');
});
test('retention deletes only older snapshots in the selected collection after success',async()=>{
 const files=Array.from({length:12},(_,i)=>({id:'file'+i,appProperties:{dataset:'dataset',cashOutBackup:'v1'}}));files.push({id:'unrelated',appProperties:{dataset:'other',cashOutBackup:'v1'}});const deleted=[];
 const drive=new Drive({token:'secret',expiresAt:100,clock:()=>0,fetcher:async(url,options)=>{if(options.method==='DELETE'){deleted.push(url.split('/').at(-1));return response(null,204)}return response({files})}});
 await drive.prune('dataset',10,'missing');assert.equal(deleted.length,0);await drive.prune('dataset',10,'file0');assert.deepEqual(deleted,['file10','file11']);
});
test('local saves serialize, skip unchanged data and survive reinitialization',async t=>{
 const {c,store}=setup(t);await c.enable({value:1});await Promise.all([c.save({value:2}),c.save({value:3}),c.save({value:3})]);assert.equal(store.value.revision,3);assert.equal(store.value.payload.value,3);assert.equal(c.state().pending,true);
 const other=new Controller({store,validate:()=>{},driveFactory:()=>null});assert.deepEqual(await other.init(),{value:3});assert.ok(other.enabled);
});
test('device save failure blocks uploads and does not claim success',async t=>{
 const {c,store}=setup(t);await c.enable({value:1});store.fail=true;await assert.rejects(()=>c.save({value:2}));assert.equal(c.state().error,'local');assert.equal(store.value.payload.value,1);
});
test('another writer cannot be silently overwritten',async t=>{
 const {c,store}=setup(t);await c.enable({value:1});store.value.revision++;await assert.rejects(()=>c.save({value:2}));assert.equal(c.state().error,'local');
});
test('cloud success waits for upload acknowledgement and tokens never enter stored records',async t=>{
 let finish;const {c,store}=setup(t,{upload:()=>new Promise(resolve=>finish=resolve)});await linked(c);const pending=c.flush();assert.equal(c.state().lastCloud,undefined);assert.equal(c.state().busy,true);finish({id:'file'});await pending;assert.ok(c.state().lastCloud);assert.equal(c.state().pending,false);assert.ok(!JSON.stringify(store.value).includes('secret'));
});
test('changes during an upload stay pending for another snapshot',async t=>{
 let finish;const {c}=setup(t,{upload:()=>new Promise(resolve=>finish=resolve)});await linked(c);const pending=c.flush();await c.save({value:2});finish({id:'file'});await pending;assert.equal(c.state().pending,true);assert.equal(c.record.syncedRevision,1);assert.equal(c.record.revision,2);
});
test('disconnect ignores late upload completion',async t=>{
 let finish;const {c}=setup(t,{upload:()=>new Promise(resolve=>finish=resolve)});await linked(c);const pending=c.flush();c.disconnect();finish({id:'file'});await pending;assert.equal(c.state().lastCloud,undefined);assert.equal(c.state().pending,true);
});
test('switching Google accounts pauses uploads instead of sending local data elsewhere',async t=>{
 const {c,owner,uploads}=setup(t);await linked(c);c.disconnect();owner('two');await c.connect({token:'another'});assert.ok(c.state().accountMismatch);await c.flush();assert.equal(uploads.length,0);await assert.rejects(()=>c.activate());
});
test('restore is validated, owner-bound and local-first, without overwriting on failure',async t=>{
 const {c,store}=setup(t);await linked(c);const data=await c.preview({id:'file'});store.fail=true;await assert.rejects(()=>c.restore(data));assert.equal(store.value.payload.value,1);store.fail=false;assert.deepEqual(await c.restore(data),{value:10});assert.equal(store.value.payload.value,10);assert.equal(store.value.ownerId,'one');
 const stale=await c.preview({id:'file'});c.disconnect();await assert.rejects(()=>c.restore(stale));assert.equal(store.value.payload.value,10);
});
test('authentication failure keeps pending local data for reconnection',async t=>{
 const {c}=setup(t,{upload:async()=>{throw new BackupError('auth','Reconnect')}});await linked(c);await c.flush();assert.equal(c.state().error,'auth');assert.equal(c.state().pending,true);assert.equal(c.state().configured,false);
});

test('invalid local payloads stop autosave instead of advertising saved state',async t=>{
 const {c,store}=setup(t);await c.enable({value:1});await assert.rejects(()=>c.save({value:'wrong'}));assert.equal(c.state().error,'local');assert.equal(store.value.payload.value,1);
});
test('queued activation cannot bind to an account changed after confirmation',async t=>{
 const {c,owner}=setup(t);await c.enable({value:1});await c.connect({token:'first'});let release;const hold=c.queue(()=>new Promise(resolve=>release=resolve));await Promise.resolve();const activating=c.activate();c.disconnect();owner('two');await c.connect({token:'second'});release();await hold;await assert.rejects(()=>activating);assert.equal(c.record.ownerId,undefined);
});
