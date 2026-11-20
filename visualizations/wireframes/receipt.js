/* A receipt is an immutable snapshot, never an instruction to move money. */
(function(root){
 const UI=typeof module==='object'&&module.exports?require('./components.js'):root.CashUI;
 const Core=typeof module==='object'&&module.exports?require('./core.js'):root.CashCore;
 function model(table,player,payments=[],timestamp=new Date().toISOString()){
  if(player.out===null)throw Error('Enter the final stack before making a receipt.');
  return Object.freeze({gameType:table.type||'cash',key:String(player.id)+'-'+timestamp,table:table.name,banker:table.banker,needsBanker:!table.banker||table.banker==='You',name:player.name,buy:player.buy,out:player.out,result:player.out-player.buy,net:player.id===table.bankerId?null:(Core.obligations(table,payments).find(p=>p.id===player.id)?.net||0),timestamp});
 }
 const signed=n=>(n<0?'−':'+')+UI.money(Math.abs(n));
 function lines(m){return [[m.gameType==='tournament'?'Total entries':'Total buy-ins',UI.money(m.buy)],[m.gameType==='tournament'?'Prize allocation':'Cash-out stack',UI.money(m.out)],[m.gameType==='tournament'?'Tournament result':'Poker result',signed(m.result)],[m.net===null?'Banker position':m.net>0?'Still to pay':m.net<0?'Still to receive':'Payments settled',m.net===null?'Review table settlement':UI.money(Math.abs(m.net))]]}
 function html(m){const esc=UI.escape;return `<article class="app-receipt" data-receipt-key="${esc(m.key)}" aria-label="Receipt for ${esc(m.name)}"><img class="receipt-logo" src="assets/brand/cash-out-wordmark-light.svg" alt="Cash Out"><p class="receipt-kicker">PLAYER RECEIPT · INR</p><hr><h3>${esc(m.name)}</h3><p>${esc(m.table)}<br>Banker: ${esc(m.needsBanker?'Name needed':m.banker)}</p><hr>${lines(m).map(([label,value])=>`<div class="receipt-line"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}<hr><p class="receipt-foot">Snapshot: ${esc(m.timestamp)}<br>Payments and poker result are separate.<br>Record only · no money transferred.</p></article><div class="receipt-dock">${m.needsBanker?UI.button({label:'Add banker name',action:'receipt-banker',variant:'primary'}):UI.button({label:'Share receipt',action:'receipt-share',variant:'primary'})}${m.needsBanker?'':UI.button({label:'Save PNG',action:'receipt-save',variant:'secondary'})}</div><p class="hint">Only this player’s name, amounts and table details. No phone number or photo.</p>`}
 function text(m){return ['CASH OUT · PLAYER RECEIPT',m.name,m.table,'Banker: '+m.banker,'',...lines(m).map(([label,value])=>label+': '+value),'','Snapshot: '+m.timestamp,'Record only · no money transferred.'].join('\n')}
 function current(m){const el=document.querySelector('.app-receipt');return el?.dataset.receiptKey===m.key}
 async function png(m){
  const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1050;const c=canvas.getContext('2d');if(!c)throw Error('Image export is unavailable in this browser.');
  c.fillStyle='#ede9dc';c.fillRect(0,0,720,1050);c.fillStyle='#223c2e';c.font='bold 36px monospace';c.textAlign='center';
  const image=new Image();image.src='assets/brand/cash-out-wordmark-light.svg';try{await image.decode();c.drawImage(image,180,48,360,78)}catch{c.fillText('CASH OUT',360,95)}
  c.font='19px monospace';c.fillText('PLAYER RECEIPT · INR',360,165);c.textAlign='left';
  const rule=y=>{c.strokeStyle='#74816f';c.setLineDash([7,5]);c.beginPath();c.moveTo(44,y);c.lineTo(676,y);c.stroke()};
  const write=(s,y,font='23px monospace')=>{c.font=font;c.fillText(s,44,y,632)};
  rule(205);write(m.name,262,'bold 30px monospace');write(m.table,307);write('Banker: '+m.banker,350);rule(390);
  lines(m).forEach(([label,value],i)=>{const y=445+i*100;write(label,y,'20px monospace');write(value,y+36,'bold 28px monospace')});rule(865);
  write('Snapshot: '+m.timestamp,912,'17px monospace');write('Payments and poker result are separate.',953,'18px monospace');write('Record only · no money transferred.',995,'18px monospace');
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not create the receipt image.')),'image/png'));
 }
 function filename(m){return 'cash-out-'+m.name.replace(/[^a-z0-9]+/gi,'-').slice(0,60)+'.png'}
 function download(blob,m){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename(m);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 async function save(m){if(!m||m.needsBanker||!current(m))return;const blob=await png(m);if(current(m))download(blob,m)}
 async function share(m){if(!m||m.needsBanker||!current(m))return;const blob=await png(m);if(!current(m))return;const file=new File([blob],filename(m),{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Cash Out · '+m.name})}catch(error){if(error.name!=='AbortError')throw error}}else download(blob,m)}
 const api={model,html,text,save,share};if(typeof module==='object'&&module.exports)module.exports=api;else root.CashReceipt=api;
})(typeof window==='undefined'?{}:window);
