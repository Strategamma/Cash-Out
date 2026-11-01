(function(){
 if(window.CashNative?.isNative()||!('serviceWorker' in navigator))return;
 const root=new URL('./',document.currentScript.src);
 // Keep an active table open; updates take effect after old clients close.
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'})
   .catch(error=>{console.warn('Offline setup failed:',error.message);const label=document.querySelector('#prototype-status');if(label)label.textContent='Prototype · offline setup failed; keep online and reload';});
 });
})();
