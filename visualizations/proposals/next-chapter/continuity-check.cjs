const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/continuity-motion.js','utf8');
function setup({reduced=false,native=true}={}){
 const events={},preference={matches:reduced,addEventListener:(k,fn)=>events.preference=fn},transitions=[];
 const node=(id)=>({dataset:{playerId:id,motionPlayer:id},style:{viewTransitionName:'',viewTransitionClass:''},classList:{add(){}},querySelector(){return null}});
 const oldFace=node('1'),newFace=node('1'),oldTitle=node(),newTitle=node(),row=node('1'),screen=node();
 const oldScope={querySelector:s=>s.includes('data-motion-player')?oldFace:oldTitle};
 newFace.closest=()=>({querySelector:()=>newTitle});
 const newScope={querySelector:s=>s.includes('data-motion-player')?newFace:null};
 let rows=[row];const list={querySelectorAll:()=>rows};
 const document={addEventListener:(k,fn)=>events[k]=fn,querySelector:s=>s==='#table-players'?list:s==='#screen'?screen:null};
 if(native)document.startViewTransition=update=>{let resolve;const t={update,ready:Promise.resolve(),finished:new Promise(r=>resolve=r),resolve:()=>resolve(),skipTransition(){this.skipped=true}};transitions.push(t);return t};
 const api={mount(){}};vm.runInNewContext(source,{window:{CashMotionLibrary:api,addEventListener(){}},document,matchMedia:()=>preference});
 const click=()=>events.click({target:{closest:()=>({dataset:{action:'profile',id:'1'},closest:()=>oldScope})}});
 return {api,click,oldFace,newFace,oldTitle,newTitle,newScope,screen,row,transitions,preference,events,setRows:v=>rows=v,node};
}
(async()=>{
 const s=setup();s.click();s.api.prepareContinuity('player');assert.equal(s.oldFace.style.viewTransitionName,'selected-player-avatar');
 s.api.mount(s.newScope);assert.equal(s.newFace.style.viewTransitionName,'selected-player-avatar');assert.equal(s.newTitle.style.viewTransitionName,'selected-player-name');assert(s.api.sharedActive);
 s.api.finishContinuity();for(const n of [s.oldFace,s.newFace,s.oldTitle,s.newTitle])assert.equal(n.style.viewTransitionName,'');assert(!s.api.sharedActive);
 s.click();s.api.prepareContinuity('early-exit');assert(!s.api.sharedActive,'House-exception dialog must stay independent');
 let updated=0;s.api.filterPlayers(()=>updated++);const first=s.transitions[0];assert.equal(s.row.style.viewTransitionName,'filtered-player-1');
 s.api.filterPlayers(()=>updated++);const second=s.transitions[1];assert(first.skipped);first.update();assert.equal(updated,0,'Skipped callback must not render stale filter work');second.update();assert.equal(updated,1);
 second.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();assert.equal(s.row.style.viewTransitionName,'');assert.equal(s.screen.style.viewTransitionName,'');
 s.api.filterPlayers(()=>updated++);const third=s.transitions[2];s.api.cancelListTransition();third.update();assert.equal(updated,1,'Navigating away cancels pending list mutation');
 for(const options of [{reduced:true},{native:false}]){const fallback=setup(options);fallback.click();fallback.api.prepareContinuity('player');assert(!fallback.api.sharedActive);let calls=0;fallback.api.filterPlayers(()=>calls++);assert.equal(calls,1);assert.equal(fallback.transitions.length,0)}
 console.log('Shared identity naming/cleanup, dialog exclusion, rapid filter cancellation and reduced/unsupported paths pass.');
})().catch(error=>{console.error(error);process.exitCode=1});
