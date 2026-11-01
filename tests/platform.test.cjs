const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,env:{...process.env,GOOGLE_CLIENT_ID:''}});
const read=file=>fs.readFileSync(path.join(root,'dist',file),'utf8');
function worker({fail=false,scope='https://example.test/cash-out/'}={}){
 const handlers={},deleted=[],requested=[],stored=new Map();let claimed=false;
 const cache={addAll:async urls=>{requested.push(...urls);if(fail)throw Error('offline');for(const url of urls)stored.set(url,{cached:url});},match:async url=>stored.get(String(url))};
 const caches={open:async()=>cache,delete:async name=>{deleted.push(name);return true;},keys:async()=>['unrelated','cash-out-shell-%2Fother%2F-old','cash-out-shell-%2Fcash-out%2F-old']};
 const context={URL,Set,caches,fetch:async()=>{throw Error('network unavailable')},self:{registration:{scope},clients:{claim:async()=>{claimed=true}},addEventListener:(name,callback)=>handlers[name]=callback}};
 vm.runInNewContext(read('sw.js'),context);
 const lifecycle=async name=>{let promise;handlers[name]({waitUntil:p=>promise=p});await promise;};
 const request=async(url,method='GET')=>{let promise;handlers.fetch({request:{url,method},respondWith:p=>promise=p});return promise?await promise:undefined;};
 return {lifecycle,request,requested,deleted,claimed:()=>claimed};
}
test('build publishes only explicit public files and resolves local HTML/CSS asset references',()=>{
 const all=fs.readdirSync(path.join(root,'dist'),{recursive:true}).map(String);
 assert(!all.some(file=>/fixtures|screenshots|\.test\.|build_brand|backup\.json/.test(file)));
 for(const file of all.filter(f=>/\.(html|css)$/.test(f))){
  const content=read(file);
  for(const match of content.matchAll(/(?:src|href)="([^"]+)"|url\(['"]?([^)'"\s]+)['"]?\)/g)){
   const ref=(match[1]||match[2]).split(/[?#]/)[0];
   if(!ref||/^(https?:|data:|#)/.test(ref))continue;
   assert(fs.existsSync(path.resolve(root,'dist',path.dirname(file),ref)),`${file} missing ${ref}`);
  }
 }
 const manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(new URL(manifest.start_url,'https://example.test/repo/manifest.webmanifest').pathname,'/repo/visualizations/wireframes/index.html');
 assert(!read('sw.js').includes('__ASSETS__'));
 assert(read('visualizations/wireframes/index.html').includes('window.CASH_OUT_PLATFORM=true'));
 assert(!read('visualizations/wireframes/index.html').includes('EXPLORE A STATE'));
 assert(!read('visualizations/wireframes/library.html').includes('window.CASH_OUT_PLATFORM=true'));
});
test('offline worker serves repository root, app and versioned assets after successful install',async()=>{
 const w=worker();await w.lifecycle('install');
 assert(w.requested.every(url=>url.startsWith('https://example.test/cash-out/')));
 for(const url of ['https://example.test/cash-out/','https://example.test/cash-out/visualizations/wireframes/index.html?v=17','https://example.test/cash-out/src/backup/ui.js?v=17'])assert((await w.request(url)).cached);
});
test('worker never intercepts Drive/OAuth, writes, exports or another repository',async()=>{
 const w=worker();
 for(const [url,method] of [['https://www.googleapis.com/drive/v3/files','GET'],['https://accounts.google.com/gsi/client','GET'],['https://example.test/cash-out/private-backup.json','GET'],['https://example.test/another/index.html','GET'],['https://example.test/cash-out/index.html','POST']])assert.equal(await w.request(url,method),undefined);
});
test('failed offline installation rejects and removes incomplete cache',async()=>{
 const w=worker({fail:true});await assert.rejects(w.lifecycle('install'),/offline/);assert.equal(w.deleted.length,1);
});
test('activation removes only old caches for this scope and claims clients without forced reload',async()=>{
 const w=worker();await w.lifecycle('activate');assert.deepEqual(w.deleted,['cash-out-shell-%2Fcash-out%2F-old']);assert(w.claimed());assert(!read('sw.js').includes('skipWaiting'));
});
