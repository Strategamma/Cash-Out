(function(root){
 const clone=value=>JSON.parse(JSON.stringify(value));
 class Controller{
  constructor({store,validate,driveFactory,onChange=()=>{},delay=30000,clock=Date.now,id=()=>crypto.randomUUID()}){
   Object.assign(this,{store,validate,driveFactory,onChange,delay,clock,id});this.record=null;this.enabled=false;this.drive=null;this.owner=null;this.epoch=0;this.serial=Promise.resolve();this.message='';this.error='';this.retries=0;
  }
  state(){return {enabled:this.enabled,configured:Boolean(this.drive),account:this.owner?.email||this.owner?.name||'',pending:Boolean(this.record&&this.record.syncedRevision!==this.record.revision),lastLocal:this.record?.updatedAt,lastCloud:this.record?.lastBackupAt,revision:this.record?.revision||0,busy:Boolean(this.busy),error:this.error,message:this.message,accountMismatch:Boolean(this.record?.ownerId&&this.owner&&this.record.ownerId!==this.owner.id),bound:Boolean(this.record?.ownerId)}}
  emit(){this.onChange(this.state())}
  async init(){
   try{const record=await this.store.read();if(record){if(record.schema!==1||typeof record.datasetId!=='string'||!Number.isSafeInteger(record.revision)||record.revision<1)throw new Error('Invalid local record.');this.validate(record.payload);this.record=record;this.enabled=true;this.lastJSON=JSON.stringify(record.payload)}this.emit();return record?.payload||null}
   catch{this.error='local';this.message='Device backup could not be read. It has not been replaced. Export current records before making changes.';this.blocked=true;this.emit();return null}
  }
  queue(task){const next=this.serial.then(task);this.serial=next.catch(()=>{});return next}
  async enable(payload){if(this.blocked)throw new Error(this.message);this.enabled=true;await this.save(payload)}
  save(payload){
   if(!this.enabled||this.blocked)return Promise.resolve();
   const json=JSON.stringify(payload);if(json===this.lastJSON)return this.serial;const snapshot=JSON.parse(json);
   return this.queue(async()=>{
    if(this.blocked||json===this.lastJSON)return;
    try{this.validate(snapshot)}catch(e){this.error='local';this.message='Autosave validation failed: '+e.message;this.blocked=true;this.emit();throw e}const previous=this.record?.revision||0;
    const record={...this.record,schema:1,datasetId:this.record?.datasetId||this.id(),revision:previous+1,payload:snapshot,updatedAt:new Date(this.clock()).toISOString(),syncedRevision:this.record?.syncedRevision||0};
    try{await this.store.write(record,previous)}catch(e){this.error='local';this.message=e.message;this.blocked=true;this.emit();throw e}
    this.record=record;this.lastJSON=json;this.error='';this.message='';this.emit();this.schedule();
   });
  }
  async connect(credentials){
   this.disconnect();const epoch=this.epoch;
   const drive=this.driveFactory(credentials);const owner=await drive.owner();if(epoch!==this.epoch)return;
   this.drive=drive;this.owner=owner;this.error='';this.message='';
   if(this.record?.ownerId&&this.record.ownerId!==owner.id){this.error='account';this.message='This device’s records belong to another Google account. Automatic upload is paused. You can review this account’s backups before restoring.'}
   this.emit();if(this.record?.ownerId===owner.id)this.schedule(0);
  }
  async activate({retention=10}={}){
   if(!this.drive||!this.owner||!this.record)throw new Error('Connect Google Drive and enable device autosave first.');
   if(this.record.ownerId&&this.record.ownerId!==this.owner.id)throw new Error('Restore this account’s backup before enabling uploads for another account.');
   const ownerId=this.owner.id,epoch=this.epoch;
   await this.queue(async()=>{if(epoch!==this.epoch||this.owner?.id!==ownerId)throw new Error('Connection changed. Enable backup again.');const next={...this.record,ownerId,retention:retention===10?10:0};await this.store.write(next,this.record.revision);this.record=next});
   this.emit();this.schedule(0);
  }
  disconnect(){clearTimeout(this.timer);this.epoch++;this.drive=null;this.owner=null;this.error='';this.message='';this.emit()}
  schedule(delay=this.delay){clearTimeout(this.timer);if(!this.drive||!this.record?.ownerId||this.record.ownerId!==this.owner?.id||this.blocked)return;this.timer=setTimeout(()=>this.flush(),delay)}
  async flush(){
   clearTimeout(this.timer);if(this.busy||this.blocked||!this.drive||!this.record||this.record.ownerId!==this.owner?.id||this.record.syncedRevision===this.record.revision)return;
   const snapshot=clone(this.record),drive=this.drive,epoch=this.epoch;this.busy=true;this.emit();
   try{
    const uploaded=await drive.upload(snapshot);if(epoch!==this.epoch)return;
    await this.queue(async()=>{
     if(epoch!==this.epoch)return;
     const next={...this.record,syncedRevision:Math.max(this.record.syncedRevision||0,snapshot.revision),lastBackupAt:new Date(this.clock()).toISOString()};
     try{await this.store.write(next,this.record.revision)}catch(e){e.code='local';this.blocked=true;throw e}this.record=next;
    });
    this.retries=0;this.error='';this.message='';
    if(epoch===this.epoch&&snapshot.retention){try{await drive.prune(snapshot.datasetId,snapshot.retention,uploaded.id)}catch{this.message='Backup saved. Older snapshot cleanup needs another attempt.'}}
   }catch(e){
    if(epoch!==this.epoch)return;
    this.error=e.code||'network';this.message=e.message||'Backup failed. Your local copy is safe.';
    if(['auth','permission'].includes(this.error)){this.drive=null;this.owner=null}
    else if(['retry','network'].includes(this.error)&&this.retries<3){this.retries++;this.schedule(1000*2**this.retries)}
   }finally{this.busy=false;this.emit();if(!this.error&&this.record?.syncedRevision!==this.record?.revision)this.schedule()}
  }
  async list(){if(!this.drive)throw new Error('Reconnect Google Drive first.');return this.drive.list()}
  async preview(file){if(!this.drive)throw new Error('Reconnect Google Drive first.');const epoch=this.epoch,ownerId=this.owner.id;const data=await this.drive.download(file);if(epoch!==this.epoch)throw new Error('Connection changed. Select the backup again.');this.validate(data.payload);return {...data,sourceOwner:ownerId,sourceEpoch:epoch}}
  async restore(data,{retention=10}={}){
   this.validate(data.payload);if(!this.owner||data.sourceOwner!==this.owner.id||data.sourceEpoch!==this.epoch)throw new Error('Connection changed. Select the backup again.');
   return this.queue(async()=>{
    if(data.sourceOwner!==this.owner?.id||data.sourceEpoch!==this.epoch)throw new Error('Connection changed. Select the backup again.');
    const previous=this.record?.revision||0;
    const record={schema:1,datasetId:this.id(),revision:previous+1,payload:clone(data.payload),updatedAt:new Date(this.clock()).toISOString(),syncedRevision:0,ownerId:this.owner.id,retention:retention===10?10:0};
    await this.store.write(record,previous);this.record=record;this.enabled=true;this.lastJSON=JSON.stringify(record.payload);this.blocked=false;this.error='';this.message='';this.emit();this.schedule();return clone(record.payload);
   });
  }
 }
 const api={Controller};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashBackupController=api;
})(typeof window==='undefined'?{}:window);
