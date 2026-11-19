const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/receipt-export.js','utf8');
async function setup({supported=true,shareError=null,missingBanker=false}={}){
 const events={},button={disabled:false,isConnected:true,textContent:''},status={textContent:''},draws=[];let observer,downloads=0,shares=0,current={needsBanker:missingBanker,banker:'Riley Shah',name:'Player <private>',table:'Friday Night',date:'Current table',entries:[['Buy-in',5000]],buy:5000,out:3000,received:0,paid:0,result:-2000,due:2000,label:'STILL TO PAY',direction:'Player → Banker',reference:'Current table snapshot'};
 const ctx={measureText:text=>({width:String(text).length*14}),fillText(...args){draws.push(args)},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},setLineDash(){},drawImage(){}};
 class MockFile{constructor(blobs,name,options){this.name=name;this.type=options.type;this.blobs=blobs}}
 const document={querySelector:s=>s.includes('native-share')?button:s==='#receipt-share-status'?status:{},createElement:type=>type==='canvas'?{getContext:()=>ctx,toBlob:fn=>fn({type:'image/png'})}:{click(){downloads++},remove(){}},body:{append(){}},addEventListener:(type,fn)=>events[type]=fn};
 vm.runInNewContext(source,{document,location:{hash:'#share-preview'},shareContext:'receipt',receiptModel:()=>current,money:n=>'₹'+n,signed:n=>String(n),Image:class{async decode(){}},File:MockFile,MutationObserver:class{constructor(fn){observer=fn}observe(){}},navigator:{canShare:()=>supported,async share({files}){assert.equal(files[0].type,'image/png');shares++;if(shareError)throw shareError}},URL:{createObjectURL:()=> 'blob:local',revokeObjectURL(){}},setTimeout(){},toast(){}});
 await new Promise(resolve=>setImmediate(resolve));
 const click=async action=>events.click({target:{closest:()=>({dataset:{action},disabled:false,isConnected:true})}});
 return{button,status,draws,click,counts:()=>({downloads,shares}),change:()=>{current={...current,name:'Changed player'}}};
}
(async()=>{
 const ready=await setup();assert.equal(ready.button.disabled,false);assert(ready.status.textContent.includes('PNG ready'));assert(ready.draws.some(([text])=>text==='STILL TO PAY'));assert(ready.draws.some(([text])=>text==='Cash game · Banker: Riley Shah'));await ready.click('download-receipt');assert.equal(ready.counts().downloads,1);await ready.click('native-share-receipt');assert.equal(ready.counts().shares,1);
 ready.change();await ready.click('native-share-receipt');assert.equal(ready.counts().shares,1,'Never share a stale player image');
 const unnamed=await setup({missingBanker:true});assert.equal(unnamed.button.disabled,true);await unnamed.click('download-receipt');assert.equal(unnamed.counts().downloads,0);
 const fallback=await setup({supported:false});assert.equal(fallback.button.disabled,true);await fallback.click('download-receipt');assert.equal(fallback.counts().downloads,1);
 const cancel=await setup({shareError:{name:'AbortError'}});await cancel.click('native-share-receipt');assert(cancel.status.textContent.includes('cancelled'));
 const denied=await setup({shareError:{name:'NotAllowedError'}});await denied.click('native-share-receipt');assert(denied.status.textContent.includes('Download'));
 console.log('Receipt PNG generation, stale identity guard, download fallback, share cancellation and denied-share recovery pass.');
})().catch(error=>{console.error(error);process.exitCode=1});
