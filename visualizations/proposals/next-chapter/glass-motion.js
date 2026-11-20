/* Original orchestration inspired by Dribbble concepts; no external runtime. */
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let resizeFrame=0;
 const animations=new Set();
 function clear(){animations.forEach(run=>run.cancel());animations.clear()}
 function revealHistory(container){
  clear();if(reduce.matches)return;
  [...container.querySelectorAll('.card')].slice(0,4).forEach((node,index)=>{
   if(!node.animate)return;
   const run=node.animate([{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:250,delay:index*40,easing:'cubic-bezier(.22,1,.36,1)'});
   animations.add(run);run.finished.catch(()=>{}).finally(()=>animations.delete(run));
  });
 }
 function alignNavigation(animate=true){
  const nav=document.querySelector('#navigation .nav'),active=nav?.querySelector('a.active');if(!nav)return;
  let pill=nav.querySelector('.nav-indicator'),initial=!pill;
  if(!active){if(pill)pill.hidden=true;return}
  if(pill)pill.hidden=false;
  if(!pill){pill=document.createElement('span');pill.className='nav-indicator';pill.setAttribute('aria-hidden','true');nav.prepend(pill)}
  if(initial||!animate||reduce.matches)nav.setAttribute('data-measuring','');
  pill.style.width=active.offsetWidth+'px';pill.style.height=active.offsetHeight+'px';pill.style.transform=`translate(${active.offsetLeft}px,${active.offsetTop}px)`;
  if(nav.hasAttribute('data-measuring')){void pill.offsetWidth;nav.removeAttribute('data-measuring')}
 }
 // Magic Card-inspired pointer light is an enhancement for fine pointers only.
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 document.addEventListener('pointermove',event=>{
  if(reduce.matches||!fine.matches||event.pointerType==='touch')return;
  const card=event.target.closest('.magic-card');if(!card)return;
  const rect=card.getBoundingClientRect();
  card.style.setProperty('--spot-x',(event.clientX-rect.left)+'px');
  card.style.setProperty('--spot-y',(event.clientY-rect.top)+'px');
 });
 const celebrated=new Set();
 function celebrateMilestone(screen){
  const seal=screen?.querySelector?.('[data-celebrate]');if(!seal)return;
  const key=seal.dataset.celebrate;if(!key||celebrated.has(key))return;
  celebrated.add(key);
  if(!reduce.matches)seal.classList.add('celebrate-once');
 }
 const dealt=new Set();
 function dealCards(screen){
  const card=screen?.querySelector?.('[data-deal]');if(!card)return;
  const key=card.dataset.deal;if(!key||dealt.has(key))return;
  dealt.add(key);if(!reduce.matches)card.classList.add('deal-once');
 }
 const previousMount=window.CashMotionLibrary.mount;
 window.CashMotionLibrary.mount=screen=>{clear();previousMount(screen);alignNavigation();celebrateMilestone(screen);dealCards(screen)};
 window.CashMotionLibrary.revealHistory=revealHistory;
 window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>alignNavigation(false))});
 reduce.addEventListener('change',()=>{clear();alignNavigation(false)});
 window.addEventListener('pagehide',clear);
 document.fonts.ready.then(()=>alignNavigation(false));
 alignNavigation(false);
 celebrateMilestone(document.querySelector('#screen'));
 dealCards(document.querySelector('#screen'));
})();
