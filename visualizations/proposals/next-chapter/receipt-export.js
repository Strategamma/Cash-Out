/* Generate locally from the same model as the visible receipt. No uploads. */
(()=>{
 let prepared=null,generation=0;
 const current=()=>location.hash==='#current-receipt'||location.hash==='#share-preview'&&shareContext==='current';
 const model=()=>receiptModel(current());
 const key=m=>JSON.stringify(m);
 const status=text=>{const node=document.querySelector('#receipt-share-status');if(node)node.textContent=text};
 async function imageFile(m){
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Image export is unavailable.');
  const width=720,pad=52,lines=[];let y=138;
  ctx.font='22px monospace';
  const wrap=(text,max)=>{const result=[];let line='';for(const char of String(text)){if(ctx.measureText(line+char).width>max&&line){result.push(line);line=''}line+=char}result.push(line);return result};
  const text=(value,options={})=>{for(const line of wrap(value,width-pad*2)){lines.push({kind:'text',value:line,y,...options});y+=options.size?options.size+14:34}};
  const rule=()=>{y+=15;lines.push({kind:'rule',y});y+=30};
  const row=(label,value,bold=false)=>{const right=ctx.measureText(value).width;const parts=wrap(label,width-pad*2-right-30);parts.forEach((part,i)=>{lines.push({kind:'row',label:part,value:i===parts.length-1?value:'',y,bold});y+=38})};
  text('PLAYER RECEIPT · INR',{center:true,size:18});rule();text(m.name,{size:30,bold:true});text(m.table);text(m.date);text('Cash game · Banker: '+(m.banker||'Not recorded'));rule();
  m.entries.forEach(([label,n])=>row(label,n<0?signed(n):money(n)));rule();row('Total buy-ins',money(m.buy));row('Cash-out stack',m.out===null?'Not entered':money(m.out));row('Poker result',m.result===null?'Playing':signed(m.result),true);rule();row('Buy-ins received',money(m.received));row('Payout recorded',money(m.paid));rule();
  text(m.label,{center:true,size:18});text(money(Math.abs(m.due)),{center:true,size:46,bold:true});text(m.direction,{center:true});if(m.out===null)text('Final balance follows cash-out.',{center:true,size:18});rule();text(m.reference,{center:true,size:18});text('Design preview · sample data',{center:true,size:18});text('Record only · no money transferred',{center:true,size:18});y+=38;
  canvas.width=width;canvas.height=y+18;
  ctx.fillStyle='#ede9dc';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(width,0);ctx.lineTo(width,y);for(let x=width;x>=0;x-=24)ctx.lineTo(x,y+(Math.round(x/24)%2?14:0));ctx.closePath();ctx.fill();
  ctx.fillStyle='#273b30';ctx.textBaseline='top';
  for(const line of lines){ctx.font=`${line.bold?'700':'400'} ${line.size||22}px monospace`;ctx.textAlign=line.center?'center':'left';if(line.kind==='rule'){ctx.strokeStyle='#6e7a69';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(pad,line.y);ctx.lineTo(width-pad,line.y);ctx.stroke();ctx.setLineDash([])}else if(line.kind==='row'){ctx.fillText(line.label,pad,line.y);ctx.textAlign='right';ctx.fillText(line.value,width-pad,line.y)}else ctx.fillText(line.value,line.center?width/2:pad,line.y)}
  const logo=new Image();logo.src='../../wireframes/assets/brand/cash-out-wordmark-light.svg';await logo.decode();ctx.drawImage(logo,190,40,340,62);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Could not create the image.');
  const slug=m.name.normalize('NFKD').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,60)||'player';
  return new File([blob],`cash-out-${slug}-receipt.png`,{type:'image/png'});
 }
 function canShare(file){try{return !!(navigator.share&&navigator.canShare?.({files:[file]}))}catch{return false}}
 async function prepare(){
  const token=++generation;prepared=null;
  const button=document.querySelector('[data-action="native-share-receipt"]');if(!button)return;
  if(model()?.needsBanker){button.disabled=true;button.textContent='Add banker details first';status('Add the banker’s name in Table settings before sharing.');return}
  button.disabled=true;
  try{const m=model(),file=await imageFile(m);if(token!==generation||!button.isConnected)return;prepared={file,key:key(m)};const supported=canShare(file);button.disabled=!supported;button.textContent=supported?'Share receipt image':'Use Download PNG';status(supported?'PNG ready. Choose a recipient in your device’s share sheet. Nothing has been sent.':'Device file sharing is unavailable here. Download the PNG, then attach it to your message.');}
  catch{if(token!==generation)return;button.textContent='Image unavailable';status('Could not prepare the image. Try Download PNG again.');}
 }
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action;if(!['download-receipt','native-share-receipt'].includes(action)||button.disabled)return;
  const m=model();if(!m)return;if(m.needsBanker){toast('Add the banker’s name in Table settings first.');return}
  if(action==='native-share-receipt'){
   if(!prepared||prepared.key!==key(m)){prepare();status('Receipt changed. Preparing a fresh image; tap Share again when ready.');return}
   button.disabled=true;
   try{await navigator.share({files:[prepared.file],title:'Cash Out · Player receipt'});status('Share sheet completed. Delivery is handled by your chosen app.');}
   catch(error){status(error.name==='AbortError'?'Sharing cancelled. Nothing changed.':'Sharing could not open. Download the PNG instead.');}
   finally{if(button.isConnected)button.disabled=false}return;
  }
  button.disabled=true;
  try{const file=prepared?.key===key(m)?prepared.file:await imageFile(m);const url=URL.createObjectURL(file),anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status('PNG download requested. Attach the image to your preferred message app.');}
  catch{toast('Receipt image could not be created. Please try again.');}finally{button.disabled=false}
 });
 const observer=new MutationObserver(()=>prepare());observer.observe(document.querySelector('#screen'),{childList:true});prepare();
})();
