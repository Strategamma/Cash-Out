/* Injected adapters make the native export contract testable without a device. */
function createExporter({filesystem,share,directory,encoding,id=()=>crypto.randomUUID()}){
 let busy=false;
 return async function exportFile(name,text){
  if(busy)throw new Error('An export is already open. Finish it before exporting again.');
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(name)||typeof text!=='string')throw new Error('Invalid export file.');
  busy=true;
  try{
   // A new path prevents a later export replacing a file another app is reading.
   const path=`exports/${id()}/${name}`;
   const file=await filesystem.writeFile({path,data:text,directory,encoding,recursive:true});
   if(!file?.uri)throw new Error('The device did not create the export file.');
   await share.share({title:'Cash Out export',files:[file.uri],dialogTitle:'Save or share your Cash Out file'});
   return {shared:true};
  }finally{busy=false;}
 };
}
module.exports={createExporter};
