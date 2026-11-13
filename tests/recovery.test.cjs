const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {reminder,installMode}=require('../web/recovery.js');
const now=Date.parse('2026-11-13T12:00:00Z'),base={revision:5,workspaceId:'one',now};
test('reminders distinguish no backup, stale revision, stale age and another workspace',()=>{
 assert(reminder(base).due);
 const receipt={workspaceId:'one',revision:5,at:new Date(now).toISOString()};assert(!reminder({...base,receipt}).due);
 assert(reminder({...base,revision:6,receipt}).due);assert(reminder({...base,receipt:{...receipt,workspaceId:'two'}}).due);
 assert(reminder({...base,receipt:{...receipt,at:new Date(now-8*86400000).toISOString()}}).due);
 assert(reminder({...base,receipt:{...receipt,revision:99}}).due);assert(reminder({...base,receipt:{...receipt,at:'invalid'}}).due);
 assert(!reminder({...base,cloudCurrent:true}).due);
});
test('install guidance handles iPhone, desktop-mode iPad, browser prompt and actual standalone execution',()=>{
 assert.equal(installMode({userAgent:'iPhone'}),'ios');assert.equal(installMode({platform:'MacIntel',maxTouchPoints:5}),'ios');assert.equal(installMode({prompt:true}),'prompt');assert.equal(installMode({userAgent:'iPhone',standalone:true}),'standalone');assert.equal(installMode({}),'manual');
});
function boot({service=true,storage={},registration,registerError=false,ua='Android',standalone=false}={}){
 const events={},clicks={},mount={innerHTML:''};let requests=0,persistCalls=0;
 const nav={onLine:true,userAgent:ua,platform:'',maxTouchPoints:0,storage:{...storage}};
 if(storage.persist)nav.storage.persist=async()=>{persistCalls++;return storage.persist();};
 const reg=registration||{active:{},waiting:null,addEventListener(){}};
 if(service)nav.serviceWorker={register:async()=>{requests++;if(registerError)throw Error('failed');return reg;},ready:Promise.resolve(reg)};
 const window={addEventListener:(name,cb)=>events[name]=cb};const document={currentScript:{src:'https://example.test/repo/boot.js'},querySelector:()=>mount,addEventListener:(name,cb)=>clicks[name]=cb};
 const context={window,document,navigator:nav,URL,matchMedia:()=>({matches:standalone}),CashRecovery:{installMode},console};
 vm.runInNewContext(fs.readFileSync('web/boot.js','utf8'),context);
 return {window,events,clicks,mount,nav,requests:()=>requests,persistCalls:()=>persistCalls};
}
test('offline readiness requires active worker; waiting updates never force reload or skip waiting',async()=>{
 const b=boot({registration:{active:{},waiting:{},addEventListener(){}}});await b.events.load();await Promise.resolve();assert.match(b.mount.innerHTML,/Offline app files are ready/);assert.match(b.mount.innerHTML,/An update is waiting/);
 const source=fs.readFileSync('web/boot.js','utf8');assert(!source.includes('skipWaiting'));assert(!source.includes('location.reload'));
 const pending=boot({registration:{active:null,waiting:null,addEventListener(){}}});await pending.events.load();assert.match(pending.mount.innerHTML,/Preparing offline files/);
});
test('unsupported APIs and failed registration remain visible without blocking local records',async()=>{
 const unsupported=boot({service:false});await unsupported.events.load();assert.match(unsupported.mount.innerHTML,/unavailable/);
 const failure=boot({registerError:true});await failure.events.load();assert.match(failure.mount.innerHTML,/Offline setup failed/);
});
test('storage protection is user requested and denied/failed requests are honest',async()=>{
 const denied=boot({storage:{persisted:async()=>false,persist:async()=>false,estimate:async()=>({usage:1048576,quota:10485760})}});await denied.events.load();await new Promise(r=>setImmediate(r));assert.equal(denied.persistCalls(),0);
 await denied.clicks.click({target:{closest:()=>({dataset:{recovery:'storage'}})}});assert.equal(denied.persistCalls(),1);assert.match(denied.mount.innerHTML,/not protected/);assert.match(denied.mount.innerHTML,/1 MB/);
 const failed=boot({storage:{persisted:async()=>{throw Error('denied')}}});await failed.events.load();await new Promise(r=>setImmediate(r));assert.match(failed.mount.innerHTML,/Storage check failed/);
});
test('install acceptance only reports a request; standalone detection controls installed status',async()=>{
 const b=boot();let prevented=false;b.events.beforeinstallprompt({preventDefault(){prevented=true},prompt:async()=>{},userChoice:Promise.resolve({outcome:'accepted'})});assert(prevented);assert.match(b.mount.innerHTML,/Install Cash Out/);
 await b.clicks.click({target:{closest:()=>({dataset:{recovery:'install'}})}});assert.match(b.mount.innerHTML,/Installation requested/);assert(!b.mount.innerHTML.includes('Running as an installed app'));
 const ios=boot({ua:'iPhone'});ios.window.CashDeviceUI.mount();assert.match(ios.mount.innerHTML,/Share → Add to Home Screen/);
 const standalone=boot({standalone:true});standalone.window.CashDeviceUI.mount();assert.match(standalone.mount.innerHTML,/Running as an installed app/);
});
