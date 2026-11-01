/* Optional backup integration for the review prototype. No SDK loads without a client ID. */
(function(){
 const platform=Boolean(window.CASH_OUT_PLATFORM),native=Boolean(window.CashNative?.isNative());
 let ledgerPayload=null,saving=false;
 let ready=false,sdkReady=false,sdkError='',authBusy=false,abort,files=[];
 const config=window.CASH_OUT_GOOGLE||{};
 let clientId=config.clientId||'';
 try{clientId=clientId||localStorage.getItem('cash-out-google-client-id')||''}catch{}
 const validate=payload=>{if(platform)return CashLedger.validate(payload,CashCore,CashHistory);CashCore.validateBackup(payload);CashHistory.validate(payload.historyTables||[],payload.contacts,CashCore)};
 const snapshot=()=>JSON.parse(JSON.stringify(platform?{format:'cash-out-ledger',version:2,table,contacts,payments,historyTables,ledger:ledgerPayload?.ledger}:{demo:true,version:1,table,contacts,payments,historyTables}));
 function apply(data){if(platform)ledgerPayload=CashLedger.copy(data);table=data.table;contacts=data.contacts;payments=data.payments;historyTables=data.historyTables||[];selectedHistoryId=historyTables.at(-1)?.id;nextId=Math.max(16,...contacts.map(p=>p.id+1));historyView=false;playerFilter='all'}
 const controller=new CashBackupController.Controller({store:new CashBackupStore.Store(undefined,new URLSearchParams(location.search).has('backupTest')?(platform?'cash-out-platform-test-v1':'cash-out-backup-test-v1'):(platform?'cash-out-platform-v1':'cash-out-backup-v1')),validate,delay:config.backupDelayMs||30000,
  driveFactory:credentials=>{abort?.abort();abort=new AbortController();return new CashDrive.Drive({...credentials,signal:abort.signal})},onChange:update});
 const time=value=>value?new Date(value).toLocaleString():'Not yet';
 function status(){const s=controller.state();if(saving)return 'Saving on this device…';if(s.busy)return 'Backing up to Google Drive…';if(s.error||s.message)return s.message;if(!s.enabled)return 'Device autosave is off';if(!navigator.onLine)return 'Saved on this device · offline';if(!s.configured)return s.bound?'Saved on this device · reconnect Drive':'Saved on this device · cloud not connected';if(!s.bound)return 'Google connected · enable automatic backup';return s.pending?'Saved on this device · cloud backup pending':'Saved to Google Drive'}
 function panel(){if(platform)return platformPanel();const s=controller.state();return `<section class="backup-panel" aria-label="Autosave and Google Drive"><div class="notice ${s.error?'ui-error':s.enabled?'good':''}" role="status">${esc(status())}</div><p class="hint">${s.account?'Google account: '+esc(s.account)+'<br>':''}Device save: ${esc(time(s.lastLocal))}<br>Cloud backup: ${esc(time(s.lastCloud))}</p><div class="actions">${!s.enabled?btn('Enable device autosave','device-autosave','primary'):''}${btn(s.configured?'Reconnect / choose account':'Connect Google Drive','drive-connect','secondary',!clientId||!sdkReady||authBusy||s.error==='local'?'disabled':'')}${s.configured?btn('Back up now','drive-now','secondary',s.busy||s.accountMismatch||s.error==='local'?'disabled':'')+btn('Restore from Google Drive','drive-list','secondary')+btn('Disconnect Google Drive','drive-disconnect','text-button'):''}</div>${s.enabled?'<p class="hint">These prototype records now survive reloads on this device. Draft amounts are not saved.</p>':''}<p class="hint">Only Cash Out’s private app-data folder is requested. Tokens are kept in memory; reconnect after reload or expiry.</p>${!clientId?'<div class="notice">Google setup is needed before a real connection can be made. Device autosave works without it.</div>':''}${sdkError?`<div class="notice ui-error">${esc(sdkError)}</div>`:''}<details><summary>Google connection setup</summary><label for="google-client-id">Public Web OAuth client ID</label><input id="google-client-id" value="${esc(clientId)}" placeholder="…apps.googleusercontent.com" autocomplete="off" spellcheck="false">${btn('Save connection settings','drive-config','secondary')}<a class="library-link" href="../../docs/GOOGLE_DRIVE_SETUP.md" target="_blank" rel="noopener">Setup instructions ↗</a></details><p class="hint">Standard Drive API use currently has no extra charge within Google’s limits. Backups use your Google storage; extra storage is optional and paid to Google. iCloud connection is still to be built.</p></section>`}
 function update(){
  const mount=document.querySelector('#backup-panel-mount');if(mount)mount.innerHTML=panel();
  const label=document.querySelector('.prototype>#prototype-status');if(label&&(controller.enabled||platform))label.textContent=(platform?'':'Prototype · ')+status();
 }
 function report(error){notify(error?.message||'Backup action failed. Your local records have not been removed.');update()}
 async function initSDK(){
  sdkReady=false;sdkError='';update();if(!clientId||native)return;
  try{
   await new Promise((resolve,reject)=>{
    if(window.google?.accounts?.oauth2)return resolve();
    const existing=document.querySelector('#google-identity-sdk');existing?.remove();
    const script=document.createElement('script');script.id='google-identity-sdk';script.src='https://accounts.google.com/gsi/client';script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
    const timeout=setTimeout(()=>reject(new Error('Google sign-in did not load. Check connectivity or content blockers, then save connection settings again.')),12000);
    script.onload=()=>{clearTimeout(timeout);resolve()};script.onerror=()=>{clearTimeout(timeout);reject(new Error('Google sign-in could not load.'))};document.head.append(script);
   });
   sdkReady=true;update();
  }catch(e){sdkError=e.message;update()}
 }
 async function enable(){await controller.enable(snapshot());update()}
 function activation(){
  if(controller.state().accountMismatch)return;
  modal('Enable Drive backups?','AUTOMATIC SNAPSHOTS',`<p>Save ${platform?'these saved tables':'these prototype tables'}, player contact details, photos and history to <strong>${esc(controller.state().account)}</strong>?</p><p class="hint">The backup is private to your Google account. Only Cash Out’s app-data permission is requested.</p><label class="check"><input id="backup-retention" type="checkbox" checked> Keep the latest 10 snapshots in this backup collection. Older snapshots are permanently deleted after a newer backup succeeds.</label><p class="hint">Uncheck to retain all versions. Photos and retained versions use your Google Drive storage.</p><div class="actions"><button class="primary" type="submit">Enable automatic Drive backup</button></div>`,async()=>{await controller.activate({retention:$('#backup-retention').checked?10:0});forceClose();update()});
 }
 function connect(){
  if(native)return report(new Error('Native cloud sign-in is not configured yet. Export a full backup instead.'));if(!sdkReady||!clientId||authBusy)return;
  authBusy=true;update();
  const client=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:CashDrive.SCOPE,include_granted_scopes:false,
   error_callback:error=>{authBusy=false;report(new Error(error.type==='popup_closed'?'Google connection cancelled. Device saves continue.':'Google sign-in could not open. Allow its popup and try again.'))},
   callback:async response=>{
    authBusy=false;
    if(response.error||!response.access_token||!Number(response.expires_in)||!String(response.scope||'').split(' ').includes(CashDrive.SCOPE)){report(new Error('Drive permission was not granted. Device saves continue.'));return}
    try{await enable();await controller.connect({token:response.access_token,expiresAt:Date.now()+Number(response.expires_in)*1000-10000});if(controller.state().accountMismatch)notify(controller.state().message);else if(!controller.state().bound)activation()}catch(e){report(e)}update();
   }});
  client.requestAccessToken({prompt:'select_account'});
 }
 async function list(){
  files=await controller.list();
  modal('Restore a Drive backup','REVIEW BEFORE REPLACING',`<p class="muted">${esc(controller.state().account)} · ${files.length} snapshots. Restoring replaces this device’s prototype records. Export a local copy first.</p><div class="detail-list">${files.map((f,i)=>`<div class="payment"><div class="grow"><strong>${esc(time(f.createdTime))}</strong><small>${esc(f.name)} · ${Math.ceil(Number(f.size||0)/1024)} KB</small></div>${btn('Preview','drive-preview','',`data-index="${i}"`)}</div>`).join('')||'<p>No Cash Out backups were found in this Google account.</p>'}</div>`);
 }
 async function preview(index){
  const file=files[index];if(!file)return;
  const data=await controller.preview(file),p=data.payload;
  modal('Restore this cloud backup?','VALIDATED BACKUP PREVIEW',`<div class="hero"><h3>${esc(p.table.name)}</h3><p>${p.contacts.length} saved players · ${(p.historyTables||[]).length} past tables</p></div><div class="notice">This replaces this device’s records and binds future backups to ${esc(controller.state().account)}. Automatic backups will be enabled for that account after restoration.</div><label class="check"><input id="restore-retention" type="checkbox" checked> Keep the latest 10 snapshots in this restored collection; permanently remove older ones after a successful backup.</label><div class="actions"><button class="primary" type="submit">Restore cloud backup</button></div>`,async()=>{const payload=await controller.restore(data,{retention:$('#restore-retention').checked?10:0});apply(payload);forceClose();go('table');notify('Cloud backup restored on this device.')});
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;
  if(action==='drive-connect'){connect();return}
  if(action==='drive-disconnect'){abort?.abort();controller.disconnect();return}
  if(action==='drive-config'){
   const value=$('#google-client-id').value.trim();
   if(!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(value)){report(new Error('Enter a Web OAuth client ID ending in .apps.googleusercontent.com. No client secret is needed.'));return}
   if(controller.state().configured){report(new Error('Disconnect Google Drive before changing the client ID.'));return}
   clientId=value;try{localStorage.setItem('cash-out-google-client-id',value)}catch{}initSDK();return;
  }
  const tasks={'device-autosave':enable,'drive-now':()=>controller.state().bound?controller.flush():activation(),'drive-list':list,'drive-preview':()=>preview(Number(button.dataset.index))};
  if(tasks[action])Promise.resolve().then(tasks[action]).catch(report);
 });
 window.addEventListener('online',()=>{controller.schedule(0);update()});window.addEventListener('offline',update);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){controller.schedule(0);update()}});
 function platformPanel(){const s=controller.state();return `<section class="backup-panel" aria-label="Device saves and cloud backups"><div class="notice ${s.error?'ui-error':'good'}" role="status">${esc(status())}</div><p class="hint">Last device save: ${esc(time(s.lastLocal))}<br>Cloud backup: ${esc(time(s.lastCloud))}</p>${s.error==='local'?'<div class="notice ui-error">Recording is paused. Export the last saved backup, then reload. Nothing new will be marked saved.</div>':''}<p>Confirmed changes save automatically on this device. Cloud setup can be completed after deployment.</p>${clientId&&!native?`<div class="actions">${btn(s.configured?'Reconnect Google Drive':'Connect Google Drive','drive-connect','secondary',!sdkReady||authBusy?'disabled':'')}${s.configured?btn('Back up now','drive-now','secondary')+btn('Restore from Google Drive','drive-list','secondary')+btn('Disconnect Google Drive','drive-disconnect','text-button'):''}</div>`:'<p class="hint">Google Drive is not configured yet. Export a full backup regularly until cloud backup is connected. iCloud remains to be implemented.</p>'}<p class="hint">This device copy can be lost if app/browser data is cleared. Full backups include player photos and the complete audit trail.</p></section>`}
 async function commit(meta,mutate){
  if(!platform)return mutate();
  if(!ready||saving)throw new Error('A device save is already in progress. Please wait.');
  if(controller.blocked)throw new Error(controller.message||'Recording is paused. Export and reload.');
  const before=snapshot(),beforeNextId=nextId,context={historyView,selectedHistoryId,playerFilter};
  saving=true;$('#app').inert=true;$('#navigation').inert=true;sheet.inert=true;update();
  try{
   mutate();
   const payload=await CashLedger.commit(controller,before,snapshot(),{id:crypto.randomUUID(),time:new Date().toISOString(),...meta});
   apply(payload);historyView=context.historyView;selectedHistoryId=context.selectedHistoryId;playerFilter=context.playerFilter;
   return payload;
  }catch(error){apply(before);historyView=context.historyView;selectedHistoryId=context.selectedHistoryId;playerFilter=context.playerFilter;nextId=beforeNextId;if(draft?.player){draft.player=table.players.find(p=>p.id===draft.id)||{...contacts.find(p=>p.id===draft.id),buy:0,out:null,priorOut:0,paidIn:0,paidOut:0}}throw error;}
  finally{saving=false;$('#app').inert=false;$('#navigation').inert=false;sheet.inert=false;update()}
 }
 async function exportFull(){if(!ledgerPayload)return notify('No readable saved workspace is available. Existing storage has not been replaced.');try{await download('cash-out-full-backup.json',JSON.stringify(ledgerPayload),'application/json');notify(native?'Share sheet closed. Check that you saved the backup in your chosen location.':'Full backup downloaded. Keep it somewhere safe.')}catch(error){report(error)}}
 async function exportCSV(){if(!ledgerPayload)return;try{await download('cash-out-transactions-v2.csv',CashLedger.csv(ledgerPayload),'text/csv');notify(native?'Share sheet closed. Check your exported CSV in its destination.':'Private transaction CSV downloaded. Use a summary for sharing.')}catch(error){report(error)}}
 function activity(){const t=historyView?recentData():table,entries=ledgerPayload?.ledger.entries.filter(e=>e.table.id===t.id)||[];modal('Table activity','SAVED TRANSACTIONS',`<p>${esc(t.name)} · ${entries.length} saved entries</p><div class="detail-list">${[...entries].reverse().map(e=>`<p><strong>${esc(e.kind.replaceAll('-',' '))}</strong><small>${esc(time(e.time))} · ${e.table.currency} · ${esc(e.table.banker)} banking</small>${e.subjectName?`<small>${esc(e.subjectName)}</small>`:''}${e.changes.filter(c=>['buy','out','rake','paidIn','paidOut','amount'].includes(String(c.path.at(-1)))&&typeof c.after==='number').map(c=>`<small>${esc(String(c.path.at(-1)))}: ${typeof c.before==='number'?money(c.before)+' → ':''}${money(c.after)}</small>`).join('')}${e.changes.filter(c=>c.add&&c.after&&typeof c.after==='object'&&Number.isInteger(c.after.amount)).map(c=>`<small>Payment: ${money(c.after.amount)}</small>`).join('')}${e.reason?`<small>Reason: ${esc(e.reason)}</small>`:''}<small>${e.correctionOf?'Corrects transaction '+esc(e.correctionOf):'Transaction '+esc(e.id)}</small></p>`).join('')||'<p>No transactions for this table yet.</p>'}</div><p class="hint">Every saved entry retains its table settings and exact before/after values. Export the full backup or transaction CSV for the complete record.</p>`)}
 function importFull(){
  modal('Restore a full backup','PREVIEW BEFORE REPLACING',`<p class="muted">Restore a version 2 full backup, or explicitly import a version 1 prototype snapshot. Export your current backup first.</p><label for="full-backup-file">Cash Out JSON backup</label><input id="full-backup-file" type="file" accept=".json" required><button type="submit" class="primary">Validate & preview</button>`,async()=>{
   const file=$('#full-backup-file').files[0];if(!file)return;
   if(file.size>50000000)throw new Error('Backup exceeds the 50 MB limit.');
   let data=JSON.parse(await file.text()),legacy=false;
   if(data.demo===true&&data.version===1){
    CashCore.validateBackup(data);CashHistory.validate(data.historyTables||[],data.contacts,CashCore);
    data=CashLedger.copy(data);data.historyTables=data.historyTables||[];data.table.date=data.table.date||today();data.table.id=data.table.id||crypto.randomUUID();
    data=CashLedger.create(data,{kind:'legacy-snapshot-import'});legacy=true;
   }
   validate(data);
   modal('Restore this workspace?','VALIDATED BACKUP',`<div class="hero"><h3>${esc(data.table.name)}</h3><p>${data.contacts.length} players · ${data.historyTables.length} retained tables · ${data.ledger.entries.length} transactions</p></div>${legacy?'<div class="notice">This is a prototype snapshot. Its existing values become an imported baseline; earlier transactions cannot be reconstructed. It may contain sample records.</div>':''}<div class="notice">This replaces the current workspace on this device. Export your existing full backup first.</div><button type="submit" class="primary">Restore on this device</button>`,async()=>{
    if(saving)throw new Error('Wait for the current save to finish.');
    saving=true;sheet.inert=true;$('#app').inert=true;$('#navigation').inert=true;update();
    try{await controller.save(data);if(controller.blocked)throw new Error(controller.message);apply(data);forceClose();go('tables');notify('Backup restored and saved on this device.')}finally{saving=false;sheet.inert=false;$('#app').inert=false;$('#navigation').inert=false;update()}
   });
  });
 }
 window.CashBackupUI={panel,state:()=>({...controller.state(),saving,ready}),commit,export:exportFull,import:importFull,csv:exportCSV,activity,capture:()=>{if(ready&&!platform)controller.save(snapshot()).catch(report)}};
 (async()=>{
  $('#app').inert=true;$('#navigation').inert=true;
  try{const saved=await controller.init();if(saved)apply(saved);else if(platform&&!controller.blocked){ledgerPayload=CashLedger.create({table,contacts,payments,historyTables});await controller.enable(ledgerPayload);apply(ledgerPayload)}ready=true;render();update();initSDK()}catch(error){report(error)}
  finally{$('#app').inert=false;$('#navigation').inert=false}
 })();
})();
