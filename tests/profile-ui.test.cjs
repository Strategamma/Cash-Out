const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../visualizations/wireframes/profile.js'),H=require('../visualizations/wireframes/history.js');
const row=(net,extras={})=>({tableId:'one',name:'Friday',date:'2026-11-13',buy:500000,out:500000+net,net,cumulative:net,...extras});
test('empty profiles show no fabricated result or interactive chart',()=>{
 const s=H.stats([],1),html=P.summary(s)+P.chart(s.trend)+P.statistics(s);
 assert.match(html,/No completed sessions yet/);assert(!html.includes('type="range"'));assert(!html.includes('+₹0'));assert.match(html,/Average win<\/span><strong class="\s*">—/);
});
test('single losing session stays readable with finite in-bounds geometry and disabled inspector',()=>{
 const html=P.chart([row(-200000)]);
 assert(!/NaN|Infinity/.test(html));assert.match(html,/max="0"/);assert.match(html,/ disabled/);assert.match(html,/−₹2,000/);
 const coords=html.match(/circle cx="([\d.]+)" cy="([\d.]+)"/);assert(+coords[1]<=318);assert(+coords[2]>=22&&+coords[2]<=112);
});
test('chart clamps stale selection after history changes and preserves paise',()=>{
 const html=P.chart([row(12345),row(-20001,{cumulative:-7656})],99);
 assert.match(html,/value="1"/);assert.match(html,/−₹200.01/);assert.match(html,/−₹76.56 cumulative/);
 assert.match(P.chart([row(0)],-7),/value="0"/);
});
test('saved player history excludes unbalanced tables and reports exact matching statistics',()=>{
 const {tables}=H.seed(),s=H.stats(tables,1);
 assert.equal(s.net,s.trend.reduce((n,r)=>n+r.net,0));
 assert(P.summary(s).includes(String(s.sessions)));assert(P.statistics(s).includes('Average loss'));
 const bad={...tables[0],id:'bad',players:tables[0].players.map(p=>({...p,out:p.out+1}))};
 assert.deepEqual(H.stats([...tables,bad],1),s);
 assert.equal((P.sessions(s.recent).match(/data-action="recent"/g)||[]).length,s.sessions);
});
test('profile text and table identities cannot inject markup; break-even is explicit',()=>{
 const r=row(0,{name:'<script>alert(1)</script>',tableId:'" onfocus="bad'}),html=P.sessions([r])+P.chart([r]);
 assert(!html.includes('<script>'));assert(!html.includes('data-table-id="" onfocus='));assert.match(html,/Break-even/);assert.match(html,/&lt;script&gt;/);
});
function motion(){const ctx=vm.createContext({window:{addEventListener(){}},document:{addEventListener(){}}});vm.runInContext(fs.readFileSync('visualizations/wireframes/ui-polish.js','utf8'),ctx);return ctx.window.CashPolish}
function button(){return {innerHTML:'Confirm ₹1,000',disabled:false,attrs:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}}}
test('pending financial actions stay disabled until the actual promise completes',async()=>{
 const b=button();let release;const pending=motion().pending(b,()=>new Promise(r=>release=r));assert(b.disabled);assert.equal(b.attrs['aria-busy'],'true');assert.equal(b.innerHTML,'Confirm ₹1,000');release();await pending;assert(!b.disabled);assert.equal(b.attrs['aria-busy'],undefined);
});
test('failed action restores retry without swallowing failure or claiming success',async()=>{
 const b=button();await assert.rejects(motion().pending(b,async()=>{throw Error('Disk full')}),/Disk full/);assert(!b.disabled);assert.equal(b.innerHTML,'Confirm ₹1,000');assert.equal(b.attrs['aria-busy'],undefined);
});
test('completion from a replaced modal leaves the detached button untouched',async()=>{
 const b=button();let release;const pending=motion().pending(b,()=>new Promise(r=>release=r));b.isConnected=false;b.innerHTML='Detached';release();await pending;assert.equal(b.innerHTML,'Detached');
});
test('decorative tracking respects reduced motion, manual motion-off and touch input',()=>{
 let reduce=true,mode='on',event,updates=[];
 const card={getBoundingClientRect:()=>({left:10,top:20}),style:{setProperty:(...v)=>updates.push(v)}};
 const ctx=vm.createContext({window:{matchMedia:()=>({matches:reduce}),addEventListener(){}},document:{documentElement:{dataset:{get motion(){return mode}}},addEventListener:(type,fn)=>{if(type==='pointermove')event=fn}}});
 vm.runInContext(fs.readFileSync('visualizations/wireframes/ui-polish.js','utf8'),ctx);
 const pointer={pointerType:'mouse',clientX:40,clientY:60,target:{closest:()=>card}};
 event(pointer);assert.equal(updates.length,0);reduce=false;mode='off';event(pointer);assert.equal(updates.length,0);
 mode='on';event({...pointer,pointerType:'touch'});assert.equal(updates.length,0);event(pointer);assert.deepEqual(updates,[['--glow-x','30px'],['--glow-y','40px']]);
});
