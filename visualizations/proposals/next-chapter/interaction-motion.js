/* Choreography for exploration; confirmation data and money digits never tween. */
(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)'),active=new Map();
 let awaitingPage=false,pendingScreen=null;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 let resetDepth=()=>{};
 function wireDepth(scope){
  resetDepth();
  const wrapper=scope?.querySelector?.('.profile-depth'),card=wrapper?.querySelector('.t-tilt-card');if(!card)return;
  const reset=()=>{wrapper.classList.remove('is-hover');card.classList.remove('is-tilting');card.style.setProperty('--tilt-rx','0deg');card.style.setProperty('--tilt-ry','0deg')};
  wrapper.onpointermove=event=>{if(media.matches||!fine.matches||event.pointerType!=='mouse'){reset();return}const r=wrapper.getBoundingClientRect();if(!r.width||!r.height)return;const x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));wrapper.classList.add('is-hover');card.classList.add('is-tilting');for(const [key,value]of Object.entries({'--tilt-rx':(0.5-y)*8+'deg','--tilt-ry':(x-0.5)*8+'deg','--tilt-gx':x*100+'%','--tilt-gy':y*100+'%'}))card.style.setProperty(key,value)};
  wrapper.onpointerleave=reset;wrapper.onpointercancel=reset;resetDepth=reset;
 }
 const visited=new Set();
 const ease='cubic-bezier(.22,1,.36,1)';
 function clear(){for(const [node,item] of active){item.run.cancel();item.cleanup?.()}active.clear()}
 function play(node,frames,options={},cleanup){
  if(!node?.animate||media.matches){cleanup?.();return}
  const previous=active.get(node);if(previous){previous.run.cancel();previous.cleanup?.()}
  const run=node.animate(frames,{duration:400,easing:ease,...options});
  const item={run,cleanup};active.set(node,item);
  const finish=()=>{if(active.get(node)!==item)return;active.delete(node);cleanup?.()};
  run.finished.then(finish,finish);return run;
 }
 function moveTab(segment,animate=false){
  const pill=segment?.querySelector('.t-tabs-pill'),tab=segment?.querySelector('[aria-selected="true"]');if(!pill||!tab)return;
  if(!animate||media.matches)pill.style.transition='none';
  pill.style.transform=`translateX(${tab.offsetLeft}px)`;pill.style.width=tab.offsetWidth+'px';
  if(!animate||media.matches){void pill.offsetWidth;pill.style.transition=''}
 }
 function chartEntrance(scope){
  if(media.matches)return;
  const line=scope?.querySelector?.('.profile-trend .chart .line');
  if(line?.getTotalLength&&line.animate){
   const length=Math.ceil(line.getTotalLength());
   line.style.strokeDasharray=String(length);
   play(line,[{strokeDashoffset:length},{strokeDashoffset:0}],{duration:800,delay:100},()=>line.style.removeProperty('stroke-dasharray'));
  }
  [...(scope?.querySelectorAll?.('.insight-bars button>span')||[])].slice(0,10).forEach((bar,i)=>{
   bar.style.transformOrigin='bottom';play(bar,[{transform:'scaleY(.08)',opacity:.4},{transform:'scaleY(1)',opacity:1}],{duration:500,delay:i*25});
  });
 }
 function headingEntrance(scope){
  const block=scope?.querySelector?.('.page-heading');if(!block||media.matches)return;
  const lines=[...block.children].slice(0,2);block.classList.add('t-stagger');
  lines.forEach((line,i)=>{line.classList.add('t-stagger-line');if(i===1)line.classList.add('t-stagger-line--2')});
  block.classList.remove('is-shown');void block.offsetHeight;block.classList.add('is-shown');
 }
 function panelEntrance(panel,previous){
  if(!panel)return;
  play(panel,[{opacity:.35,transform:`translateX(${previous==='overview'?12:-12}px)`},{opacity:1,transform:'none'}],{duration:250});
  [...panel.querySelectorAll('.session-list>.list-row')].slice(0,5).forEach((row,i)=>play(row,[{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350,delay:i*40}));
  chartEntrance(panel);wireDisclosures(panel);
 }
 const disclosureSelector='details.table-lineup,details.player-options,details.source-disclosure,details.completed-stacks,details.seated-players,details.ledger-manage';
 function wireDisclosures(scope){scope?.querySelectorAll?.(disclosureSelector).forEach(node=>node.classList.add('motion-disclosure'))}
 function enter(scope){
  if(!scope)return;
  wireDepth(scope);
  scope.querySelectorAll?.('.profile-segment').forEach(segment=>moveTab(segment,false));wireDisclosures(scope);
  if(media.matches)return;
  const route=document.querySelector('.device')?.dataset.route;
  if(['current-receipt','receipt'].includes(route)){const receipt=scope.querySelector('.receipt');if(receipt){receipt.style.transformOrigin='bottom center';play(receipt,[{opacity:.4,transform:'perspective(1000px) translateY(36px) rotateX(3deg) scale(.98)'},{opacity:1,transform:'none'}],{duration:550})}return}
  // Frequent cash-entry routes keep their existing short page transition only.
  if(!['home','player','players','history','insights','tournament-results','components'].includes(route))return;
  if(window.CashMotionLibrary.sharedActive)return;
  if(!visited.has(route)){headingEntrance(scope);visited.add(route)}
  const selector=route==='player'?'.profile-identity,.profile-depth,.profile-segment,#profile-player-profile-panel':route==='home'?'.resume-card,.night-progress,.table-lineup':route==='insights'?'.insight-overview,.insight-metrics,.insight-chart':route==='players'?'#roster-results>.list-row':route==='history'?'#history-results>.card':'.tournament-podium,.podium-pool';
  [...scope.querySelectorAll(selector)].slice(0,4).forEach((node,i)=>play(node,[{opacity:.25,transform:'perspective(1000px) translateY(24px) rotateX(-4deg) scale(.98)'},{opacity:1,transform:'none'}],{duration:520,delay:i*55}));
  chartEntrance(scope);
 }
 const previousMount=window.CashMotionLibrary.mount;
 window.CashMotionLibrary.mount=scope=>{clear();previousMount(scope);if(awaitingPage)pendingScreen=scope;else enter(scope)};
 window.CashMotionLibrary.beginNavigation=route=>{resetDepth();if(document.documentElement)document.documentElement.dataset.motionLane=['home','player','players','history','insights','tournament-results'].includes(route)?'explore':'task';clear();awaitingPage=true;pendingScreen=null};
 window.CashMotionLibrary.enterAfterNavigation=()=>{awaitingPage=false;const scope=pendingScreen;pendingScreen=null;if(scope)enter(scope)};
 window.CashMotionLibrary.switchProfile=(segment,panel,previous)=>{clear();moveTab(segment,true);panelEntrance(panel,previous)};
 document.addEventListener('click',event=>{if(event.target.closest('#motion-preview')){clear();enter(document.querySelector('#screen'))}});
 document.addEventListener('keydown',event=>{
  const tab=event.target.closest('.profile-segment [role=tab]');if(!tab)return;
  const tabs=[...tab.closest('.profile-segment').querySelectorAll('[role=tab]')],index=tabs.indexOf(tab);
  const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index-1+tabs.length)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
  if(next===null)return;event.preventDefault();tabs[next].focus({preventScroll:true});tabs[next].click();
 });
 document.addEventListener('toggle',event=>{
  const details=event.target;if(!details.matches?.(disclosureSelector)||!details.open||media.matches)return;
  // Safari/Firefox keep native disclosure semantics and get a content fade when intrinsic height interpolation is unavailable.
  if(CSS.supports('interpolate-size: allow-keywords'))return;
  [...details.children].filter(node=>node.tagName!=='SUMMARY').slice(0,2).forEach(node=>play(node,[{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:250}));
 },true);
 window.addEventListener('resize',()=>document.querySelectorAll('.profile-segment').forEach(segment=>moveTab(segment,false)));
 media.addEventListener('change',()=>{resetDepth();clear();document.querySelectorAll('.profile-segment').forEach(segment=>moveTab(segment,false))});
 window.addEventListener('pagehide',()=>{clear();pendingScreen=null;awaitingPage=false});
 enter(document.querySelector('#screen'));
})();
