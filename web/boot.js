(function(){
 const root=new URL('./',document.currentScript.src);
 const state={offline:'Preparing offline files…',update:false,storage:'Checking browser storage…',persistent:null,install:'',busy:false};
 let prompt=null,registration=null;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const mode=()=>CashRecovery.installMode({standalone:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints,prompt:Boolean(prompt)});
 function panel(){
  const installed=mode()==='standalone',ios=mode()==='ios';
  return `<section class="recovery-panel" aria-label="Installation and device storage"><h3>App & device storage</h3><div class="recovery-status" role="status"><strong>${esc(state.offline)}</strong><p>${navigator.onLine?'Online':'Offline · cloud backup waits for a connection'}</p></div>${state.update?'<div class="notice">An update is waiting. Finish your entries, then close every Cash Out window and reopen. Your saved records stay on this device.</div>':''}<p>${esc(state.storage)}</p><p class="muted">${state.persistent===true?'Browser granted persistent storage. Clearing app/browser data can still delete records.':state.persistent===false?'Browser storage is not protected from automatic eviction. Keep a separate backup.':'Storage protection status is unavailable in this browser.'}</p><div class="actions"><button class="secondary" type="button" data-recovery="storage" ${state.busy?'disabled':''}>${state.busy?'Checking…':'Check storage & request protection'}</button></div><h3>${installed?'Running as an installed app':'Install on this device'}</h3><p>${installed?'Cash Out is running in standalone mode.':ios?'In Safari, tap Share → Add to Home Screen. Enable Open as Web App if offered, then tap Add.':mode()==='prompt'?'Install Cash Out to open it from your home screen.':'Open the browser menu and choose Install app or Add to Home screen if available. On desktop, look for the install icon in the address bar.'}</p>${mode()==='prompt'?'<button class="secondary" type="button" data-recovery="install">Install Cash Out</button>':''}${state.install?`<p role="status">${esc(state.install)}</p>`:''}<p class="hint">Open online once to prepare offline files. Installation does not create a cloud backup.</p><details class="privacy-details"><summary>Privacy & recovery</summary><p>Tables, names, optional phone numbers/photos and the audit ledger stay in this browser’s device storage. GitHub Pages serves public app files; player records are not sent to the repository.</p><p>Connecting Google Drive sends full backups to that account’s Cash Out app-data folder. Google handles sign-in. Tokens stay in memory. Automatic iCloud backup is not connected.</p><p>Full backups and transaction CSVs are unencrypted private files. Summary exports omit phone numbers and photos. Downloading does not send files to anyone.</p><p>Save a full backup through Files to iCloud Drive or another location. Check it exists before clearing browser data, changing browser/address or uninstalling. Restore from Settings after reviewing its contents.</p></details></section>`;
 }
 function render(){const mount=document.querySelector('#device-recovery-mount');if(mount)mount.innerHTML=panel();}
 async function storage(request=false){
  state.busy=true;render();
  try{
   const api=navigator.storage;
   state.persistent=typeof api?.persisted==='function'?await api.persisted():null;
   if(request&&state.persistent!==true&&typeof api?.persist==='function')state.persistent=await api.persist();
   const estimate=await api?.estimate?.();const mb=n=>(n/1048576).toLocaleString(undefined,{maximumFractionDigits:1})+' MB';
   state.storage=Number.isFinite(estimate?.usage)&&Number.isFinite(estimate?.quota)?`${mb(estimate.usage)} used of approximately ${mb(estimate.quota)} browser allowance. Includes cache and other data on this site.`:'This browser does not report its storage allowance.';
  }catch{state.storage='Storage check failed. Existing records have not changed.';state.persistent=null;}
  finally{state.busy=false;render();}
 }
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;render();});
 window.addEventListener('appinstalled',()=>{prompt=null;state.install='Installation request accepted. Check your home screen and launch Cash Out from its icon.';render();});
 window.addEventListener('online',render);window.addEventListener('offline',render);
 document.addEventListener('click',async event=>{
  const action=event.target.closest('[data-recovery]')?.dataset.recovery;if(!action)return;
  if(action==='storage'){await storage(true);return;}
  if(action==='install'&&prompt){const current=prompt;prompt=null;render();try{await current.prompt();const result=await current.userChoice;state.install=result.outcome==='accepted'?'Installation requested. Launch the home-screen icon to verify.':'Installation dismissed. You can still use Cash Out in this browser.';}catch{state.install='Installation could not open. Use your browser menu instead.';}render();}
 });
 window.CashDeviceUI={panel,mount:render};
 async function start(){
  storage();
  if(!('serviceWorker' in navigator)){state.offline='Offline app loading is unavailable in this browser.';render();return;}
  try{
   registration=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'});
   function refresh(){state.update=Boolean(registration.waiting);state.offline=registration.active?'Offline app files are ready.':'Preparing offline files…';render();}
   function watch(worker){worker?.addEventListener('statechange',()=>{if(worker.state==='redundant'&&!registration.active){state.offline='Offline setup failed. Stay online and reopen to retry.';render();}else refresh();});}
   refresh();watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));
   navigator.serviceWorker.ready.then(refresh);
  }catch{state.offline='Offline setup failed. Keep online and reopen to retry.';render();}
 }
 window.addEventListener('load',start);
})();
