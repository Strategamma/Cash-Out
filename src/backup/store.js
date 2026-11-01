(function(root){
 class Store{
  constructor(indexedDB=root.indexedDB,name='cash-out-backup-v1'){this.indexedDB=indexedDB;this.name=name}
  async open(){
   if(this.db)return this.db;
   this.db=await new Promise((resolve,reject)=>{const r=this.indexedDB.open(this.name,1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Device storage could not open.'));r.onblocked=()=>reject(new Error('Close other Cash Out tabs to update device storage.'))});
   this.db.onversionchange=()=>{this.db.close();this.db=null};return this.db;
  }
  async read(){const db=await this.open();return new Promise((resolve,reject)=>{const t=db.transaction('records','readonly'),r=t.objectStore('records').get('current');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(new Error('Could not read the device backup.'))})}
  async write(record,expectedRevision){
   const db=await this.open();return new Promise((resolve,reject)=>{
    const t=db.transaction('records','readwrite'),s=t.objectStore('records');let error;
    const r=s.get('current');r.onsuccess=()=>{
     if((r.result?.revision||0)!==expectedRevision){error=new Error('Records changed in another tab. Reload before saving more changes.');t.abort();return}
     s.put(record,'current');
    };
    t.oncomplete=()=>resolve(record);t.onabort=t.onerror=()=>reject(error||new Error('Device save failed. Keep this tab open and export a backup.'));
   });
  }
 }
 const api={Store};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashBackupStore=api;
})(typeof window==='undefined'?{}:window);
