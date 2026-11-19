/* Deliberate design-review moment. Never a loading state or automatic route effect. */
import {generate} from './vendor/generation/ui-generation.js';
const button=document.querySelector('#generation-preview');
let run=null,revision=0;
function cancel(){revision++;run?.cancel();run=null;button.disabled=false;button.removeAttribute('aria-busy')}
button.addEventListener('click',async()=>{
 cancel();const request=revision;button.disabled=true;button.setAttribute('aria-busy','true');
 try{
  await document.fonts.ready;
  if(request!==revision)return;
  const target=document.querySelector('#screen .insight-chart, #screen .recovery-feature, #screen .tournament-archive, #screen .card, #screen .welcome')||document.querySelector('#screen .page-heading');
  if(!target)return;
  target.scrollIntoView({block:'center',behavior:'instant'});
  await Promise.all([...target.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
  if(request!==revision||!target.isConnected)return;
  run=generate(target,{variant:'ui',mode:'skeleton',maxParts:30,keys:3});
  await run.finished;
 }catch(error){console.warn('Design reveal unavailable:',error.message)}finally{if(request===revision){run=null;button.disabled=false;button.removeAttribute('aria-busy')}}
});
window.addEventListener('hashchange',cancel);
document.querySelectorAll('[data-direction-choice],#theme-control').forEach(control=>control.addEventListener('click',cancel));
// Dynamic controls can replace the target without changing the hash.
document.addEventListener('click',event=>{if(event.target.closest('#screen [data-action="history-kind"],#screen [data-action="profile-tab"],#screen [data-action="theme"]'))cancel()});
window.addEventListener('pagehide',cancel);
