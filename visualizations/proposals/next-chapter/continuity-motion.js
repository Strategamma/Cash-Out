/* Shared snapshots explain context; they never interpolate ledger values. */
(()=>{
 const api=window.CashMotionLibrary,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let intent=null,shared=[],destination=null,listTransition=null,listCleanup=()=>{},listEpoch=0,completed=null;
 const enabled=()=>Boolean(document.startViewTransition)&&!reduce.matches;
 function mark(node,name,collection=shared){if(!node||collection.some(([existing])=>existing===node))return;collection.push([node,node.style.viewTransitionName,node.style.viewTransitionClass]);node.style.viewTransitionName=name;node.style.viewTransitionClass='tracked-player'}
 function restore(collection){for(const [node,name,kind]of collection){node.style.viewTransitionName=name;node.style.viewTransitionClass=kind}collection.length=0}
 function finish(){restore(shared);destination=null;api.sharedActive=false;if(completed?.isConnected)completed.classList.add('recorded-player');completed=null}
 function avatar(scope,id){return scope?.querySelector(`[data-motion-player="${id}"]`)}
 function title(scope){return scope?.querySelector('.ledger-name,.grow>strong,h2,.name')}
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');intent=null;if(!b||!enabled())return;
  const action=b.dataset.action;
  if(['profile','rebuy','reentry','cashout'].includes(action)){
   const scope=b.closest('.ledger-player,.list-row,.lineup-player,.insight-player-card')||b;
   const face=avatar(scope,b.dataset.id);if(face)intent={id:b.dataset.id,face,title:title(scope)};
  }
  if(['confirm-cashout','confirm-amount'].includes(action)){
   const card=document.querySelector('.cash-review-card,.entry-review'),face=card?.querySelector('[data-motion-player]');
   if(card&&face)intent={id:face.dataset.motionPlayer,card};
  }
 },true);
 document.addEventListener('submit',event=>{
  intent=null;if(!enabled()||!['amount','cashout'].includes(event.target.dataset.form))return;
  const face=document.querySelector('#screen .identity [data-motion-player]');
  if(face)intent={id:face.dataset.motionPlayer,face,title:document.querySelector('#screen .identity .name'),amount:document.querySelector('#amount,#cash-stack')};
 },true);
 api.prepareContinuity=route=>{
  finish();const next=intent;intent=null;if(!enabled()||!next||route==='early-exit')return;
  const targets=['player','buy-in','cash-out','amount-review','cash-out-review','table'];if(!targets.includes(route))return;
  destination={...next,route};
  if(next.card&&route==='table')mark(next.card,'selected-player-card');
  else{mark(next.face,'selected-player-avatar');mark(next.title,'selected-player-name');if(next.amount&&['amount-review','cash-out-review'].includes(route))mark(next.amount,'reviewed-cash-amount')}
  api.sharedActive=shared.length>0;
 };
 const mount=api.mount;
 api.mount=scope=>{
  if(destination){
   const {id,route,card,amount}=destination;
   if(card&&route==='table'){
    const target=scope.querySelector(`.ledger-player[data-player-id="${id}"]`);mark(target,'selected-player-card');
    if(target){completed=target;target.scrollIntoView?.({block:'nearest',behavior:'instant'})}
   }else{
    const face=avatar(scope,id);mark(face,'selected-player-avatar');
    const parent=face?.closest('.profile-identity,.identity,.ledger-player');mark(title(parent),'selected-player-name');
    if(amount)mark(scope.querySelector('.entry-amount strong,.cash-review-stack strong'),'reviewed-cash-amount');
   }
  }
  mount(scope);
 };
 api.finishContinuity=finish;
 api.cancelListTransition=()=>{listEpoch++;listTransition?.skipTransition?.();listTransition=null;listCleanup();listCleanup=()=>{}};
 api.filterPlayers=update=>{
  api.cancelListTransition();finish();
  const list=document.querySelector('#table-players');if(!list||!enabled()){update();return}
  const epoch=listEpoch,named=[],screen=document.querySelector('#screen'),oldName=screen.style.viewTransitionName;
  screen.style.viewTransitionName='none';
  const nameRows=()=>list.querySelectorAll('.ledger-player[data-player-id]').forEach(row=>mark(row,'filtered-player-'+row.dataset.playerId,named));
  nameRows();const cleanup=()=>{restore(named);screen.style.viewTransitionName=oldName};listCleanup=cleanup;
  let transition;
  try{transition=document.startViewTransition(()=>{if(epoch!==listEpoch||document.querySelector('#table-players')!==list)return;update();nameRows()})}
  catch{cleanup();listCleanup=()=>{};update();return}
  listTransition=transition;transition.ready?.catch(()=>{});transition.updateCallbackDone?.catch(()=>{});
  transition.finished.catch(()=>{}).finally(()=>{if(listTransition!==transition)return;cleanup();listTransition=null;listCleanup=()=>{}});
 };
 reduce.addEventListener('change',()=>{if(reduce.matches){finish();api.cancelListTransition()}});
 window.addEventListener('pagehide',()=>{finish();api.cancelListTransition();intent=null});
})();
