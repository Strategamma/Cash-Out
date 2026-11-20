/* Presentation only. Ledger writes and their acknowledgement stay with the caller. */
(function(root){
 const media=root.matchMedia('(prefers-reduced-motion: reduce)'),runs=new Set(),seen=new Set();
 let active=null,epoch=0,lastView=null,intent=null,tilt=null;
 const fine=root.matchMedia('(hover:hover) and (pointer:fine)');
 function flatten(){if(tilt){tilt.style.setProperty('--tilt-x','0deg');tilt.style.setProperty('--tilt-y','0deg');tilt=null}}
 const quiet=()=>media.matches||document.documentElement.dataset.motion==='off';
 function animate(node,frames,duration=360,delay=0){if(!node?.animate||quiet())return;const run=node.animate(frames,{duration,delay,easing:'cubic-bezier(.22,1,.36,1)'});runs.add(run);run.finished.then(()=>runs.delete(run),()=>runs.delete(run));}
 function stop(){for(const run of runs)run.cancel();runs.clear()}
 function cancel(){flatten();epoch++;active?.transition?.skipTransition?.();active?.clean();active=null;stop()}
 function swap(update,{before=()=>{},after=()=>{},focus=()=>{},done=()=>{}}={}){
  cancel();const ticket=epoch,named=[];
  const mark=(node,name,kind='co-tracked')=>{if(!node||named.some(([n])=>n===node))return;named.push([node,node.style.viewTransitionName,node.style.viewTransitionClass]);node.style.viewTransitionName=name;node.style.viewTransitionClass=kind};
  const clean=()=>{for(const [node,name,kind]of named){node.style.viewTransitionName=name;node.style.viewTransitionClass=kind}named.length=0};
  let applied=false;
  const apply=()=>{if(ticket!==epoch)return;applied=true;update();after(mark)};
  const finish=()=>{if(ticket!==epoch)return;clean();active=null;focus();done()};
  if(quiet()||!document.startViewTransition){update();focus();done();return}
  before(mark);
  try{
   const transition=document.startViewTransition(apply);active={transition,clean};
   transition.ready?.catch(()=>{});transition.updateCallbackDone?.catch(()=>{});
   return transition.finished.catch(()=>{}).finally(finish);
  }catch(error){clean();if(!applied)apply();finish();if(applied&&ticket!==epoch)throw error}
 }
 function enter(scope,key){
  if(!scope||quiet())return;
  if(!seen.has(key)){seen.add(key);animate(scope.querySelector('.title-row'),[{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'none'}],300)}
  const selector=key==='profile'?'.co-depth,.co-tabs,#profile-panel':key==='players'?'#roster>.player':key==='table'?'.hero':'.list-card,.hero,.co-chart';
  [...scope.querySelectorAll(selector)].slice(0,4).forEach((node,i)=>animate(node,[{opacity:.4,transform:'perspective(1000px) translateY(18px) rotateX(-3deg)'},{opacity:1,transform:'none'}],420,i*40));
  const line=scope.querySelector('.co-chart polyline');if(line?.getTotalLength){const length=line.getTotalLength();animate(line,[{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],700)}
 }
 function render(update,key){
  const previous=lastView;lastView=key;
  const selected=intent;intent=null;
  const scope=()=>document.querySelector('#app');
  if(previous===null||previous===key||document.querySelector('#sheet[open]')){cancel();update();return}
  return swap(update,{
   before:mark=>{mark(scope(),'app-content');if(selected&&key==='profile'){mark(selected.face,'player-avatar');mark(selected.name,'player-name')}},
   after:mark=>{mark(scope(),'app-content');if(selected&&key==='profile'){mark(scope().querySelector('.co-profile-identity .avatar'),'player-avatar');mark(scope().querySelector('.co-profile-identity h2'),'player-name')}},
   focus:()=>{const heading=scope().querySelector('.title-row h2,.welcome-card h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}},
   done:()=>{if(!selected||key!=='profile')enter(scope(),key)}
  });
 }
 function filter(update){
  const list=document.querySelector('#app .players');if(!list)return update();
  const name=mark=>list.querySelectorAll('[data-player-id]').forEach(row=>mark(row,'table-player-'+row.dataset.playerId));
  swap(update,{before:name,after:name});
 }
 function panel(panel){stop();animate(panel,[{opacity:.4,transform:'translateX(10px)'},{opacity:1,transform:'none'}],240)}
 function reviewed(){const body=document.querySelector('#sheet-body');body?.classList.remove('animate-in');animate(body?.querySelector('.review-money'),[{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'none'}],240)}
 function committed(id){const row=document.querySelector(`.players [data-player-id="${id}"]`);if(!row)return;row.scrollIntoView({block:'nearest',behavior:'instant'});animate(row,[{opacity:.55,transform:'scale(.985)'},{opacity:1,transform:'none'}],360)}
 document.addEventListener('click',event=>{const b=event.target.closest('[data-action="profile"]');intent=null;if(!b)return;const card=b.closest('.roster-card,.session-row,.player')||b;intent={face:card.querySelector('.avatar'),name:card.querySelector('h3,.grow>strong')}} ,true);
 document.addEventListener('pointermove',event=>{if(quiet()||!fine.matches||event.pointerType!=='mouse'){flatten();return}const wrapper=event.target.closest('.co-depth');if(!wrapper){flatten();return}const card=wrapper.querySelector('.co-result'),r=wrapper.getBoundingClientRect();if(!card||!r.width||!r.height)return;if(tilt&&tilt!==card)flatten();tilt=card;const x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));card.style.setProperty('--tilt-x',(0.5-y)*8+'deg');card.style.setProperty('--tilt-y',(x-0.5)*8+'deg')});
 document.addEventListener('pointerout',event=>{if(event.target.closest('.co-depth')&&!event.relatedTarget?.closest?.('.co-depth'))flatten()});
 document.addEventListener('keydown',event=>{const tab=event.target.closest('.co-tabs [role="tab"]');if(!tab)return;const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')],i=tabs.indexOf(tab),n=event.key==='ArrowRight'?(i+1)%tabs.length:event.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;if(n===null)return;event.preventDefault();tabs[n].click();tabs[n].focus()});
 media.addEventListener('change',()=>{if(media.matches)cancel()});root.addEventListener('pagehide',cancel);
 root.CashPremium={render,filter,panel,reviewed,committed,cancel,swap};
})(window);
