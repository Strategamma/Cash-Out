const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=__dirname,app=fs.readFileSync(root+'/app.js','utf8');
// A route change must update the existing nav links, never replace their DOM.
let writes=0;const links=['home','players','history','insights'].map(route=>({active:false,attrs:{href:'#'+route},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},classList:{toggle(){}}}));
const nav={querySelector:()=>({}),querySelectorAll:()=>links,set innerHTML(v){writes++}};
const source=app.slice(app.indexOf('function updateNavigation('),app.indexOf('function render()'));
const navContext=vm.createContext({$:()=>nav});vm.runInContext(source,navContext);vm.runInContext("updateNavigation('unused','history')",navContext);assert.equal(writes,0);assert.equal(links[2].attrs['aria-current'],'page');vm.runInContext("updateNavigation('unused','players')",navContext);assert.equal(links[2].attrs['aria-current'],undefined);assert.equal(links[1].attrs['aria-current'],'page');
// Pending decorative entrances are cancelled on route mounts and motion-preference changes.
const listeners={},running=[],reduce={matches:false,addEventListener:(type,fn)=>listeners.reduce=fn};let previousMounts=0;
const context=vm.createContext({matchMedia:()=>reduce,document:{querySelector:()=>null,fonts:{ready:Promise.resolve()}},window:{CashMotionLibrary:{mount(){previousMounts++}},addEventListener:(type,fn)=>listeners[type]=fn},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
vm.runInContext(fs.readFileSync(root+'/glass-motion.js','utf8'),context);
const container={querySelectorAll:()=>Array.from({length:10},()=>({animate(frames,options){const run={options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true}};running.push(run);return run}}))};
context.window.CashMotionLibrary.revealHistory(container);assert.equal(running.length,4);assert.deepEqual(running.map(r=>r.options.delay),[0,40,80,120]);context.window.CashMotionLibrary.mount({});assert(running.every(r=>r.cancelled));assert.equal(previousMounts,1);
const stalePill={hidden:false};context.document.querySelector=()=>({querySelector:selector=>selector==='a.active'?null:stalePill});context.window.CashMotionLibrary.mount({});assert.equal(stalePill.hidden,true);context.document.querySelector=()=>null;
reduce.matches=true;context.window.CashMotionLibrary.revealHistory(container);assert.equal(running.length,4);listeners.reduce();
const css=fs.readFileSync(root+'/glass-motion.css','utf8');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('prefers-reduced-transparency:reduce'));assert(css.includes('@supports ((backdrop-filter'));assert(!css.includes('@keyframes amount'));
console.log('Persistent navigation, capped stagger, cancellation and reduced-preference guards pass.');
