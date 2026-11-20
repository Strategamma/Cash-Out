/* Directional route motion is progressive enhancement; every route works without it. */
let designTransition=null;
let designTrail=[location.hash.slice(1)||'home'];
function navigateDesign(){
 const target=location.hash||'#home',route=target.slice(1),seen=designTrail.lastIndexOf(route),direction=seen>=0?'backward':'forward';
 if(seen>=0)designTrail=designTrail.slice(0,seen+1);else designTrail.push(route);
 const focus=()=>{if((location.hash||'#home')===target&&!document.querySelector('dialog[open]'))$('#screen').focus({preventScroll:true})};
 const update=()=>{$('#screen').dataset.travel=direction;window.scrollTo({top:0,behavior:'instant'});render()};
 designTransition?.skipTransition?.();
 window.CashMotionLibrary?.cancelListTransition?.();
 if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches||route==='early-exit'){
  window.CashMotionLibrary?.finishContinuity?.();update();if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&route!=='early-exit'){$('#screen').classList.remove('fallback-enter');void $('#screen').offsetWidth;$('#screen').classList.add('fallback-enter')}focus();return;
 }
 try{
  window.CashMotionLibrary?.beginNavigation?.(route);
  window.CashMotionLibrary?.prepareContinuity?.(route);
  const supportsTypes=CSS.supports('selector(:active-view-transition-type(forward))');
  const transition=document.startViewTransition(supportsTypes?{update,types:[direction]}:update);
  designTransition=transition;
  transition.ready?.catch(()=>{});
  transition.ready?.then?.(()=>{if(designTransition===transition)window.CashMotionLibrary?.enterAfterNavigation?.()},()=>{if(designTransition===transition)window.CashMotionLibrary?.enterAfterNavigation?.()});
  transition.updateCallbackDone?.catch(()=>{});
  transition.finished.catch(()=>{}).finally(()=>{if(designTransition===transition){designTransition=null;window.CashMotionLibrary?.finishContinuity?.();window.CashMotionLibrary?.enterAfterNavigation?.();focus()}});
 }catch{window.CashMotionLibrary?.finishContinuity?.();update();window.CashMotionLibrary?.enterAfterNavigation?.();focus()}
}
function chooseDirection(direction,initial=false){
 document.documentElement.dataset.direction=direction;
 document.documentElement.dataset.theme=direction==='paper'?'light':'dark';
 document.querySelectorAll('[data-direction-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.directionChoice===direction)));
 const dark=document.documentElement.dataset.theme==='dark';$('#theme-control').textContent=dark?'Light theme':'Dark theme';$('#theme-control').setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
 const url=new URL(location.href);url.searchParams.set('direction',direction);history.replaceState(null,'',url);
 if(!initial)render();
}
document.querySelectorAll('[data-direction-choice]').forEach(b=>b.addEventListener('click',()=>chooseDirection(b.dataset.directionChoice)));
chooseDirection(new URLSearchParams(location.search).get('direction')==='paper'?'paper':'club',true);
render();
document.addEventListener('input',e=>{
 if(e.target.id==='table-search'){
  tableQuery=e.target.value;const temp=document.createElement('div');temp.innerHTML=table();$('#table-players').innerHTML=temp.querySelector('#table-players').innerHTML;
 }
 if(e.target.id==='rake-amount'){const value=e.target.value;if(/^\d{0,8}(?:\.\d{0,2})?$/.test(value))rakeDraft=value;else e.target.value=rakeDraft}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 if(b.dataset.action==='design-rake-confirm'){
  if(b.disabled)return;const n=amountValue(rakeDraft);if(n===null||n<=0)return;b.disabled=true;rakeTotal=Math.round((rakeTotal+n)*100)/100;tx.unshift({name:'Rake',time:'Now',title:'Rake added',amount:n});go('table');toast('Rake addition recorded in this design.');
 }
 if(b.dataset.action==='design-current-receipt'){currentReceiptPlayerId=Number(b.dataset.id);go('current-receipt')}
 if(b.dataset.action==='design-share-current'){shareContext='current';go('share-preview')}
 if(b.dataset.action==='design-share-method')info('Choose a destination','In the app, the device share sheet opens after this review. No summary has been sent from this design.','share-preview');
 if(b.dataset.action==='design-start-tournament'){if(b.disabled)return;b.disabled=true;tournamentStarted=true;tournamentBreak=false;tournamentLevel=1;tournamentSeconds=tournamentConfig.minutes*60;tournamentRunning=false;go('tournament');toast('Rules reviewed. Start the blind clock when the table is ready.')}
});
document.addEventListener('submit',e=>{
 if(e.target.dataset.form==='design-rake'){e.preventDefault();const n=amountValue(rakeDraft);if(n===null||n<=0){toast('Use a positive cash amount with up to two decimal places.');return}go('rake-review')}
 if(e.target.dataset.form==='design-csv'){e.preventDefault();info('CSV validation review','Schema, currency and exact amounts are checked before insights. Invalid rows list their row number and a specific reason. This design does not read or import the selected file.','csv-import')}
 
});
window.CashMotionLibrary={
 mount(){},
 announce(text){$('#toast').textContent=text},
 async runButton(button,action,{successLabel='Updated'}={}){if(button.disabled)return;button.disabled=true;button.setAttribute('aria-busy','true');try{await action();if(button.isConnected){button.textContent=successLabel;button.removeAttribute('aria-busy');toast(successLabel+' · design only.')}}catch(error){if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');toast(error.message)}}},
 async closeModal(){}
};

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 if(b.dataset.action==='history-kind'){if(historyKind===b.dataset.value)return;historyKind=b.dataset.value;const selector=b.closest('.history-selector');selector.style.setProperty('--selected',historyKind==='cash'?0:1);selector.querySelectorAll('button').forEach(control=>control.setAttribute('aria-pressed',String(control===b)));const results=$('#history-results');if(results){results.innerHTML=historyContent();window.CashMotionLibrary?.revealHistory(results)}b.focus({preventScroll:true})}
 if(b.dataset.action==='insight-session')selectInsightSession(Number(b.dataset.value));
});
function selectInsightSession(index){
 insightSession=Math.max(0,Math.min(9,index));
 document.querySelectorAll('[data-action="insight-session"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.value)===insightSession)));
 const slider=$('#insight-slider');slider.value=insightSession;slider.setAttribute('aria-valuetext',insightDates[insightSession]+', '+money(insightValues[insightSession]*1000)+' buy-ins');
 $('#insight-value').textContent=money(insightValues[insightSession]*1000);$('#insight-date').textContent=insightDates[insightSession]+' 2026 · session '+(insightSession+1)+' of 10';
}
document.addEventListener('keydown',e=>{
 const b=e.target.closest('[data-action="insight-session"]');if(!b)return;
 const index=Number(b.dataset.value),next=e.key==='ArrowRight'?Math.min(9,index+1):e.key==='ArrowLeft'?Math.max(0,index-1):e.key==='Home'?0:e.key==='End'?9:null;
 if(next===null)return;e.preventDefault();selectInsightSession(next);document.querySelector(`[data-action="insight-session"][data-value="${next}"]`)?.focus({preventScroll:true});
});

document.addEventListener('input',e=>{if(e.target.id==='insight-slider')selectInsightSession(Number(e.target.value))});
