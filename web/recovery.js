(function(root){
 function reminder({revision,cloudCurrent=false,receipt,workspaceId,now=Date.now()}){
  const valid=receipt?.workspaceId===workspaceId&&Number.isFinite(Date.parse(receipt.at))&&Date.parse(receipt.at)<=now&&Number.isSafeInteger(receipt.revision)&&receipt.revision<=revision;
  if(cloudCurrent)return {due:false,text:'Google Drive has the current saved revision.'};
  if(!valid)return {due:true,text:'No independent backup confirmed. Export a full backup, then check it in Files or your chosen drive.'};
  if(now-Date.parse(receipt.at)>=7*86400000)return {due:true,text:'Your confirmed file backup is over a week old. Save a fresh copy.'};
  if(receipt.revision<revision)return {due:true,text:'New changes need a fresh file backup.'};
  return {due:false,text:'You confirmed a file backup of the current saved revision. Keep it outside this browser.'};
 }
 function installMode({standalone=false,userAgent='',platform='',maxTouchPoints=0,prompt=false}={}){
  if(standalone)return 'standalone';
  if(/iPhone|iPad|iPod/.test(userAgent)||platform==='MacIntel'&&maxTouchPoints>1)return 'ios';
  return prompt?'prompt':'manual';
 }
 const api={reminder,installMode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashRecovery=api;
})(typeof window==='undefined'?{}:window);
