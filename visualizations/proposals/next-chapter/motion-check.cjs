const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=__dirname,app=fs.readFileSync(root+'/app.js','utf8');
// A route change must update the existing nav links, never replace their DOM.
let writes=0;const links=['home','players','history','insights'].map(route=>({active:false,attrs:{href:'#'+route},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},classList:{toggle(){}}}));
const nav={querySelector:()=>({}),querySelectorAll:()=>links,set innerHTML(v){writes++}};
const source=app.slice(app.indexOf('function updateNavigation('),app.indexOf('function render()'));
const navContext=vm.createContext({$:()=>nav});vm.runInContext(source,navContext);vm.runInContext("updateNavigation('unused','history')",navContext);assert.equal(writes,0);assert.equal(links[2].attrs['aria-current'],'page');vm.runInContext("updateNavigation('unused','players')",navContext);assert.equal(links[2].attrs['aria-current'],undefined);assert.equal(links[1].attrs['aria-current'],'page');
// Pending decorative entrances are cancelled on route mounts and motion-preference changes.
const listeners={},running=[],reduce={matches:false,addEventListener:(type,fn)=>listeners.reduce=fn};let previousMounts=0;
const context=vm.createContext({matchMedia:()=>reduce,document:{addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>null,fonts:{ready:Promise.resolve()}},window:{CashMotionLibrary:{mount(){previousMounts++}},addEventListener:(type,fn)=>listeners[type]=fn},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
vm.runInContext(fs.readFileSync(root+'/glass-motion.js','utf8'),context);
const container={querySelectorAll:()=>Array.from({length:10},()=>({animate(frames,options){const run={options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true}};running.push(run);return run}}))};
context.window.CashMotionLibrary.revealHistory(container);assert.equal(running.length,4);assert.deepEqual(running.map(r=>r.options.delay),[0,40,80,120]);context.window.CashMotionLibrary.mount({});assert(running.every(r=>r.cancelled));assert.equal(previousMounts,1);
const stalePill={hidden:false};context.document.querySelector=()=>({querySelector:selector=>selector==='a.active'?null:stalePill});context.window.CashMotionLibrary.mount({});assert.equal(stalePill.hidden,true);context.document.querySelector=()=>null;
reduce.matches=true;context.window.CashMotionLibrary.revealHistory(container);assert.equal(running.length,4);listeners.reduce();
let lightWrites=0;const lightCard={getBoundingClientRect:()=>({left:10,top:20}),style:{setProperty(){lightWrites++}}};
const pointer={pointerType:'mouse',clientX:30,clientY:40,target:{closest:()=>lightCard}};
listeners.pointermove(pointer);assert.equal(lightWrites,0); // Reduced motion.
reduce.matches=false;listeners.pointermove(pointer);assert.equal(lightWrites,0); // Coarse pointer.
reduce.matches=true; // Fine and reduced use the same stub; build a separate preference below.
const pointerListeners={},fineContext=vm.createContext({matchMedia:q=>({matches:q.includes('hover'),addEventListener(){}}),document:{querySelector:()=>null,addEventListener:(type,fn)=>pointerListeners[type]=fn,fonts:{ready:Promise.resolve()}},window:{CashMotionLibrary:{mount(){}},addEventListener(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
vm.runInContext(fs.readFileSync(root+'/glass-motion.js','utf8'),fineContext);
pointerListeners.pointermove({...pointer,pointerType:'touch'});assert.equal(lightWrites,0);
pointerListeners.pointermove(pointer);assert.equal(lightWrites,2);
let seals=0;const seal={dataset:{celebrate:'table-session-one'},classList:{add(){seals++}}};const milestoneScreen={querySelector:()=>seal};
fineContext.window.CashMotionLibrary.mount(milestoneScreen);fineContext.window.CashMotionLibrary.mount(milestoneScreen);assert.equal(seals,1);
seal.dataset.celebrate='table-session-two';context.window.CashMotionLibrary.mount(milestoneScreen);assert.equal(seals,1); // Reduced preference keeps the complete seal static.
let deals=0;const dealCard={dataset:{deal:'Friday Night'},classList:{add(){deals++}}};const dealScreen={querySelector:selector=>selector==='[data-deal]'?dealCard:null};fineContext.window.CashMotionLibrary.mount(dealScreen);fineContext.window.CashMotionLibrary.mount(dealScreen);assert.equal(deals,1);dealCard.dataset.deal='Another Night';context.window.CashMotionLibrary.mount(dealScreen);assert.equal(deals,1);
const nightCSS=fs.readFileSync(root+'/game-night.css','utf8');assert(nightCSS.includes('prefers-reduced-motion:no-preference'));assert(!nightCSS.includes('infinite'));assert(nightCSS.includes('progress::-webkit-progress-value'));assert(nightCSS.includes('progress::-moz-progress-bar'));
const css=fs.readFileSync(root+'/glass-motion.css','utf8');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('prefers-reduced-transparency:reduce'));assert(css.includes('@supports ((backdrop-filter'));assert(!css.includes('@keyframes amount'));
console.log('Persistent navigation, capped stagger, cancellation and reduced-preference guards and fine-pointer spotlight and once-per-session completion seal/card deal pass.');
