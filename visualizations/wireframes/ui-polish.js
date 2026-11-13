/* Native ports of pinned Magic UI / Spectrum UI / transitions.dev sources.
   See THIRD_PARTY_NOTICES.md. No persistence or accounting mutations. */
(function(root){
 const reduced=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off';
 const positions=new Map();
 function segment(el){
  const buttons=Array.from(el.children).filter(b=>b.matches('button'));
  const active=buttons.find(b=>b.classList.contains('active'));if(!active)return;
  let indicator=el.querySelector('.co-selection');if(!indicator){indicator=document.createElement('span');indicator.className='co-selection';indicator.setAttribute('aria-hidden','true');el.prepend(indicator)}
  el.classList.add('co-segment');const base=el.getBoundingClientRect(),rect=active.getBoundingClientRect(),index=buttons.indexOf(active),key=el.getAttribute('aria-label')||'settlement',old=positions.get(key);
  indicator.style.left=rect.left-base.left+'px';indicator.style.width=rect.width+'px';
  if(old!==undefined&&old!==index&&!reduced())indicator.animate?.([{transform:`translateX(${(old-index)*rect.width}px)`},{transform:'translateX(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
  positions.set(key,index);
 }
 function mount(el,entrance=false){
  if(entrance)el.querySelector('.title-row>div')?.classList.add('co-heading-enter');
  el.querySelectorAll('.segment').forEach(segment);
  el.querySelectorAll('.spectrum-stat').forEach((card,i)=>card.style.setProperty('--stat-delay',Math.min(i,3)*40+'ms'));
  el.querySelectorAll('.hero').forEach(card=>card.classList.add('magic-card'));
 }
 // Caller owns validation, duplicate locks and error reporting. Never infer success.
 async function pending(button,action){
  if(!button)return action();
  const html=button.innerHTML,disabled=button.disabled;
  button.disabled=true;button.setAttribute('aria-busy','true');button.classList.add('co-pending');
  try{return await action()}finally{if(button.isConnected!==false){button.innerHTML=html;button.disabled=disabled;button.removeAttribute('aria-busy');button.classList.remove('co-pending')}}
 }
 document.addEventListener('pointermove',e=>{if(reduced()||e.pointerType!=='mouse')return;const card=e.target.closest('.magic-card');if(!card)return;const rect=card.getBoundingClientRect();card.style.setProperty('--glow-x',e.clientX-rect.left+'px');card.style.setProperty('--glow-y',e.clientY-rect.top+'px')});
 root.addEventListener('resize',()=>document.querySelectorAll('.segment').forEach(segment));
 root.CashPolish={mount,pending};
})(window);
