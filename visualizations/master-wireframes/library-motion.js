/* Plain DOM ports of selected upstream UI components; see THIRD_PARTY_NOTICES.md. */
(function(root){
 const reduced=()=>Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 const state=new WeakMap(),segments=new Map();
 const check='<span class="t-success-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 13l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
 const spinner='<svg class="action-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="42 57" stroke-linecap="round"/></svg>';
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function moveSegment(segment){
  const children=Array.from(segment.children).filter(el=>el.matches('a,button'));
  const selected=children.find(el=>el.classList.contains('selected'));if(!selected)return;
  let indicator=segment.querySelector('.selection-indicator');if(!indicator){indicator=document.createElement('span');indicator.className='selection-indicator';indicator.setAttribute('aria-hidden','true');segment.prepend(indicator)}
  segment.classList.add('has-indicator');const parent=segment.getBoundingClientRect(),rect=selected.getBoundingClientRect();
  const key=segment.getAttribute('aria-label')||'segment',index=children.indexOf(selected),previous=segments.get(key),left=rect.left-parent.left;
  indicator.style.left=left+'px';indicator.style.width=rect.width+'px';
  if(previous!==undefined&&previous!==index&&!reduced())indicator.animate?.([{transform:`translateX(${(previous-index)*rect.width}px)`},{transform:'translateX(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
  segments.set(key,index);
 }
 function mount(screen){
  screen.querySelector('.page-heading')?.classList.add('mu-blur-fade');
  const host=screen.querySelector('.hero,.clock-panel');if(host&&!host.querySelector('.mu-shine-border')){host.classList.add('mu-shine-host');const shine=document.createElement('span');shine.className='mu-shine-border';shine.setAttribute('aria-hidden','true');host.append(shine)}
  screen.querySelectorAll('.segment').forEach(moveSegment);
  screen.querySelectorAll('.spectrum-stat').forEach((card,index)=>card.style.setProperty('--stat-delay',Math.min(index,3)*40+'ms'));
 }
 function resetButton(button){const saved=state.get(button);if(!saved||saved.busy)return;button.innerHTML=saved.html;button.disabled=saved.disabled;button.removeAttribute('aria-busy');delete button.dataset.state;state.delete(button)}
 async function runButton(button,action,{loadingLabel='Saving…',successLabel='Saved',errorLabel='Try again'}={}){
  if(state.get(button)?.busy)return false;
  const saved=state.get(button)||{html:button.innerHTML,disabled:button.disabled};saved.busy=true;state.set(button,saved);
  button.classList.add('spectrum-action');button.dataset.state='loading';button.disabled=true;button.setAttribute('aria-busy','true');button.innerHTML=`<span class="action-content">${spinner}<span>${escape(loadingLabel)}</span></span>`;
  try{await action();saved.busy=false;if(button.isConnected===false)return true;button.dataset.state='success';button.removeAttribute('aria-busy');button.innerHTML=`<span class="action-content">${check}<span>${escape(successLabel)}</span></span>`;announce(successLabel);return true}
  catch(error){saved.busy=false;if(button.isConnected===false)return false;button.dataset.state='error';button.disabled=false;button.removeAttribute('aria-busy');button.innerHTML=`<span class="action-content"><span aria-hidden="true">×</span><span>${escape(errorLabel)}</span></span>`;announce(error.message||'Action failed. Your entry is kept.');return false}
 }
 function announce(text,success=false){const el=document.querySelector('#toast');if(!el)return;el.classList.add('has-status');el.innerHTML=(success?check:'')+`<span>${escape(text)}</span>`}
 async function closeModal(dialog){if(reduced())return;dialog.classList.add('is-closing');await Promise.allSettled(Array.from(dialog.getAnimations?.()||[]).map(a=>a.finished))}
 document.addEventListener('input',e=>{const form=e.target.closest('form');form?.querySelectorAll('.spectrum-action').forEach(resetButton)});
 document.addEventListener('pointermove',e=>{if(reduced()||e.pointerType!=='mouse')return;const card=e.target.closest('.magic-card');if(!card)return;const rect=card.getBoundingClientRect();card.style.setProperty('--glow-x',(e.clientX-rect.left)+'px');card.style.setProperty('--glow-y',(e.clientY-rect.top)+'px')});
 let resizeFrame;root.addEventListener('resize',()=>{root.cancelAnimationFrame(resizeFrame);resizeFrame=root.requestAnimationFrame(()=>document.querySelectorAll('.segment').forEach(moveSegment))});
 root.CashMotionLibrary={mount,moveSegment,runButton,resetButton,announce,closeModal};
})(window);
