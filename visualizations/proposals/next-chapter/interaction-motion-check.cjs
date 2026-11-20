const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/interaction-motion.js','utf8');
function environment(reduced=false){
 const events={},runs=[],preference={matches:reduced,addEventListener:(type,fn)=>events.preference=fn};
 const nodes=()=>({style:{removeProperty(){}},animate(frames,options){const run={frames,options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true}};runs.push(run);return run}});
 const result=nodes(),line={...nodes(),getTotalLength:()=>100},pill={style:{},offsetWidth:100},tab={offsetLeft:104,offsetWidth:100},segment={querySelector:s=>s==='.t-tabs-pill'?pill:tab};
 const scope={querySelector:s=>s==='.profile-trend .chart .line'?line:null,querySelectorAll:s=>s==='.profile-segment'?[segment]:s.startsWith('.profile-identity')?[result]:[]};
 const document={querySelector:s=>s==='.device'?{dataset:{route:'player'}}:s==='#screen'?scope:null,querySelectorAll:s=>s==='.profile-segment'?[segment]:[],addEventListener:(type,fn)=>events[type]=fn};
 const window={CashMotionLibrary:{mount(){}},addEventListener:(type,fn)=>events[type]=fn};
 vm.runInNewContext(source,{document,window,matchMedia:()=>preference,CSS:{supports:()=>true}});
 return {api:window.CashMotionLibrary,runs,scope,result,preference,events,pill,segment};
}
const full=environment();assert.equal(full.runs.length,2);assert.equal(full.pill.style.transform,'translateX(104px)');
full.api.beginNavigation();assert(full.runs.every(run=>run.cancelled));full.api.mount(full.scope);assert.equal(full.runs.length,2,'Entrance must await the view-transition snapshot');full.api.enterAfterNavigation();assert.equal(full.runs.length,4);full.api.enterAfterNavigation();assert.equal(full.runs.length,4,'Ready/finished must not double-play');
full.api.beginNavigation();full.api.mount(full.scope);full.api.beginNavigation();full.api.enterAfterNavigation();assert.equal(full.runs.length,4,'Stale deferred work is discarded');
const reduced=environment(true);assert.equal(reduced.runs.length,0);reduced.api.beginNavigation();reduced.api.mount(reduced.scope);reduced.api.enterAfterNavigation();assert.equal(reduced.runs.length,0);reduced.api.switchProfile(reduced.segment,{querySelectorAll:()=>[],querySelector:()=>null},'overview');assert.equal(reduced.runs.length,0);
full.preference.matches=true;full.events.preference();assert(full.runs.every(run=>run.cancelled));
const app=fs.readFileSync(__dirname+'/app.js','utf8'),start=app.indexOf("case'profile-tab':"),end=app.indexOf("case'filter':",start),branch=app.slice(start,end);
const attributes={},classList={toggle(){}},controls=[{classList,setAttribute(k,v){attributes['first-'+k]=v}},{classList,setAttribute(k,v){attributes['second-'+k]=v}}];
const segment={querySelectorAll:()=>controls},panel={setAttribute(k,v){attributes[k]=v},innerHTML:''};let switched=0,rendered=0;
const button=Object.assign(controls[1],{id:'sessions',dataset:{value:'sessions'},closest:()=>segment,getAttribute:()=> 'profile-player-profile-panel'});
const ctx={profileTab:'overview',b:button,currentRoute:'player',document:{getElementById:()=>panel},profilePanel:()=>'<div>Sessions</div>',profileTrend(){},profileSessionRows(){},render(){rendered++},window:{CashMotionLibrary:{switchProfile(){switched++}}}};
vm.runInNewContext("switch('profile-tab'){"+branch+'}',ctx);assert.equal(rendered,0,'Profile tab must not rebuild the header');assert.equal(switched,1);assert.equal(panel.innerHTML,'<div>Sessions</div>');assert.equal(attributes['second-aria-selected'],'true');assert.equal(attributes['first-aria-selected'],'false');assert.equal(attributes['aria-labelledby'],'sessions');
console.log('Deferred entrances, cancellation, reduced motion, sliding-tab positioning and stable profile DOM pass.');

// Pointer depth is isolated from entrance transforms and must never capture touch scrolling.
const depthStyles={},depthClasses=new Set();
const depthCard={style:{setProperty:(k,v)=>depthStyles[k]=v},classList:{add:v=>depthClasses.add(v),remove:v=>depthClasses.delete(v)}};
const depthWrapper={classList:depthCard.classList,querySelector:()=>depthCard,getBoundingClientRect:()=>({left:0,top:0,width:200,height:100})};
const depthContext={media:{matches:false},fine:{matches:true},resetDepth(){},Object,Math};
vm.runInNewContext(source.slice(source.indexOf(' function wireDepth'),source.indexOf(" const ease=")),depthContext);
depthContext.wireDepth({querySelector:()=>depthWrapper});
depthWrapper.onpointermove({pointerType:'mouse',clientX:200,clientY:0});
assert.equal(depthStyles['--tilt-rx'],'4deg');assert.equal(depthStyles['--tilt-ry'],'4deg');
depthWrapper.onpointermove({pointerType:'touch',clientX:200,clientY:0});assert.equal(depthStyles['--tilt-rx'],'0deg');assert(!depthClasses.has('is-hover'));
depthContext.media.matches=true;depthWrapper.onpointermove({pointerType:'mouse',clientX:200,clientY:0});assert.equal(depthStyles['--tilt-ry'],'0deg');
depthContext.media.matches=false;depthContext.fine.matches=false;depthWrapper.onpointermove({pointerType:'mouse',clientX:200,clientY:0});assert.equal(depthStyles['--tilt-rx'],'0deg');
console.log('Depth clamps at four degrees; touch, coarse pointers and reduced motion remain flat.');
