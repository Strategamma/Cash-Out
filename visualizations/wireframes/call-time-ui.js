/* Clocks never write on a tick; confirmed actions carry their saved timestamps. */
function openCallSettings(){
 modal('Minimum play time','TABLE SETTINGS',`<label for="call-minimum">Call time · minutes</label><input id="call-minimum" type="number" min="0" max="1440" step="1" value="${table.callTimeMinutes??180}" required><p class="muted">Default: 180 minutes (3 hours). Use 0 to turn off the minimum for future starts. Existing player clocks keep their saved minimum. Re-entry starts a fresh clock; rebuys do not restart it.</p><div class="actions"><button type="submit" class="primary">Save for future starts</button></div>`,async()=>{const minimum=Number($('#call-minimum').value);if(!CashCallTime.validMinimum(minimum))return notify('Use a whole number from 0 to 1,440 minutes.');await persistChange('call-time-settings-changed',()=>{table.callTimeMinutes=minimum});forceClose();render()});
}
(function(){
 let lastWall=Date.now(),lastMono=performance.now(),changed=false;
 function refresh(){
  const now=Date.now(),mono=performance.now();if(Math.abs((now-lastWall)-(mono-lastMono))>120000)changed=true;lastWall=now;lastMono=mono;
  for(const node of document.querySelectorAll('[data-call-player]')){
   const player=table.players.find(p=>String(p.id)===node.dataset.callPlayer);if(!player)continue;
   const state=CashCallTime.status(player,now,changed);node.className='call-clock '+state.kind;node.textContent=state.label;node.title=state.deadline?'Eligible after '+new Date(state.deadline).toLocaleTimeString():state.label;
  }
 }
 window.CashClockUI={uncertain:()=>changed,refresh};
 setInterval(refresh,1000);document.addEventListener('visibilitychange',refresh);refresh();
})();
