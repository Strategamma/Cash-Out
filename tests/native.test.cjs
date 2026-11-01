const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createExporter}=require('../src/native-export.cjs');
function setup(overrides={}){
 const writes=[],shares=[];
 const exporter=createExporter({filesystem:{async writeFile(options){writes.push(options);return {uri:'file:///private/cache/'+options.path};}},share:{async share(options){shares.push(options);}},directory:'CACHE',encoding:'utf8',id:()=> 'unique-export',...overrides});
 return {exporter,writes,shares};
}
test('native exports use a private UTF-8 cache file and explicit system share sheet',async()=>{
 const {exporter,writes,shares}=setup();await exporter('cash-out-full-backup.json','{"INR":"₹1,250.50"}');
 assert.equal(writes[0].directory,'CACHE');assert.equal(writes[0].encoding,'utf8');assert.equal(writes[0].data,'{"INR":"₹1,250.50"}');assert.equal(writes[0].path,'exports/unique-export/cash-out-full-backup.json');assert.deepEqual(shares[0].files,['file:///private/cache/exports/unique-export/cash-out-full-backup.json']);
});
test('a failed file write never presents an empty or misleading export',async()=>{
 const {exporter,shares}=setup({filesystem:{async writeFile(){throw Error('Storage full');}}});await assert.rejects(()=>exporter('backup.json','data'),/Storage full/);assert.equal(shares.length,0);
});
test('cancellation errors are surfaced, and another export can safely be attempted',async()=>{
 let count=0;const {exporter}=setup({share:{async share(){if(++count===1)throw Error('Share cancelled');}}});await assert.rejects(()=>exporter('backup.json','data'),/cancelled/);await exporter('backup.json','data');assert.equal(count,2);
});
test('duplicate export taps and unsafe file paths are rejected',async()=>{
 let release;const {exporter,shares}=setup({filesystem:{writeFile:()=>new Promise(resolve=>{release=()=>resolve({uri:'file:///private/cache/export.json'});})}});
 const first=exporter('backup.json','data');await assert.rejects(()=>exporter('backup.json','data'),/already open/);release();await first;assert.equal(shares.length,1);
 for(const name of ['../backup.json','folder/file.json','/absolute.json'])await assert.rejects(()=>exporter(name,'data'),/Invalid export/);
});
test('native configuration bundles local assets without a remote server or broad file permissions',()=>{
 const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const config=JSON.parse(read('capacitor.config.json'));assert.equal(config.appId,'com.strategamma.cashout');assert.equal(config.webDir,'dist');assert.equal(config.server,undefined);
 const android=read('android/app/src/main/AndroidManifest.xml');assert(android.includes('android:allowBackup="false"'));assert(!android.includes('WRITE_EXTERNAL_STORAGE'));assert(!android.includes('READ_CONTACTS'));assert(read('android/app/build.gradle').includes('applicationIdSuffix ".beta"'));
 assert(read('ios/App/App/PrivacyInfo.xcprivacy').includes('C617.1'));assert(read('ios/App/App.xcodeproj/project.pbxproj').includes('PrivacyInfo.xcprivacy in Resources'));
 assert(read('web/boot.js').includes('CashNative?.isNative()'));
});
