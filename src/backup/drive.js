/* Direct Drive access: only appDataFolder; no client secret or stored OAuth token. */
(function(root){
 const SCOPE='https://www.googleapis.com/auth/drive.appdata';
 const API='https://www.googleapis.com/drive/v3';
 const MAX_BYTES=50*1024*1024;
 class BackupError extends Error{constructor(code,message){super(message);this.code=code}}
 const quote=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
 class Drive {
  constructor({token,expiresAt,fetcher=fetch,signal,clock=Date.now}){Object.assign(this,{token,expiresAt,fetcher,signal,clock})}
  async request(url,options={}){
   if(this.clock()>=this.expiresAt)throw new BackupError('auth','Reconnect Google Drive to continue backing up.');
   const response=await this.fetcher(url,{...options,headers:{...options.headers,Authorization:'Bearer '+this.token},signal:this.signal});
   if(!response.ok){
    if(response.status===401)throw new BackupError('auth','Google authorization expired. Reconnect Google Drive.');
    let reason='';try{const body=await response.json();reason=body.error?.errors?.[0]?.reason||''}catch{}
    if(reason==='storageQuotaExceeded')throw new BackupError('storage','Your Google Drive storage is full. Free space or upgrade your Google storage.');
    if(/dailyLimit|dailyQuota|quotaExceeded/i.test(reason))throw new BackupError('quota','Google Drive quota reached. Automatic retries are paused; your local copy is safe.');
    if(response.status===429||response.status>=500||/rateLimit|userRateLimit/i.test(reason))throw new BackupError('retry','Google Drive is busy. Your local copy is safe; retry shortly.');
    if(response.status===403)throw new BackupError('permission','Drive access was denied. Check permission and reconnect.');
    throw new BackupError('request','Google Drive request failed ('+response.status+'). Your local copy is safe.');
   }
   return response;
  }
  async owner(){const r=await this.request(API+'/about?fields=user(permissionId,emailAddress,displayName)');const {user}=await r.json();if(!user?.permissionId)throw new BackupError('account','Could not verify this Google Drive account.');return {id:user.permissionId,email:user.emailAddress||'',name:user.displayName||''}}
  async list({datasetId,writeId}={}){
   let q="trashed = false and appProperties has { key='cashOutBackup' and value='v1' }";
   if(datasetId)q+=` and appProperties has { key='dataset' and value='${quote(datasetId)}' }`;
   if(writeId)q+=` and appProperties has { key='writeId' and value='${quote(writeId)}' }`;
   const files=[];let pageToken,pages=0;
   do{
    if(++pages>20)throw new BackupError('limit','Too many backup pages returned. Listing was stopped.');
    const query=new URLSearchParams({spaces:'appDataFolder',q,orderBy:'createdTime desc',pageSize:'100',fields:'nextPageToken,files(id,name,createdTime,size,appProperties)'});
    if(pageToken)query.set('pageToken',pageToken);
    const result=await (await this.request(API+'/files?'+query)).json();
    files.push(...(result.files||[]));pageToken=result.nextPageToken;
    if(files.length>1000)throw new BackupError('limit','More than 1,000 backups found. Narrow the backup collection before continuing.');
   }while(pageToken);
   return files;
  }
  async upload(record){
   const writeId=record.datasetId+':'+record.revision;
   const existing=(await this.list({datasetId:record.datasetId,writeId}))[0];if(existing)return existing;
   const content=JSON.stringify({format:'cash-out-drive',version:1,datasetId:record.datasetId,revision:record.revision,savedAt:record.updatedAt,payload:record.payload});
   const blob=new Blob([content],{type:'application/json'});
   if(blob.size>MAX_BYTES)throw new BackupError('size','This backup exceeds the current 50 MB limit. Nothing has been removed.');
   const metadata={name:'cash-out-'+record.updatedAt.replace(/[:.]/g,'-')+'.json',parents:['appDataFolder'],appProperties:{cashOutBackup:'v1',dataset:record.datasetId,writeId}};
   const start=await this.request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,createdTime',{
    method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(blob.size)},body:JSON.stringify(metadata)
   });
   const location=start.headers.get('Location');let url;try{url=new URL(location)}catch{throw new BackupError('protocol','Google did not return a valid upload session.')}
   if(url.origin!=='https://www.googleapis.com'||!url.pathname.startsWith('/upload/drive/v3/files'))throw new BackupError('protocol','Unexpected Google upload destination.');
   const file=await (await this.request(url.href,{method:'PUT',headers:{'Content-Type':'application/json'},body:blob})).json();
   if(!file?.id)throw new BackupError('protocol','Google did not confirm a backup file.');
   return file;
  }
  async prune(datasetId,keep,newestId){
   if(!Number.isInteger(keep)||keep<2)return;
   const files=await this.list({datasetId});
   if(!files.some(f=>f.id===newestId))return;
   const old=files.filter(f=>f.id!==newestId).slice(keep-1);
   for(const file of old){
    if(file.appProperties?.dataset!==datasetId||file.appProperties?.cashOutBackup!=='v1'||!/^[A-Za-z0-9_-]+$/.test(file.id))continue;
    await this.request(API+'/files/'+file.id,{method:'DELETE'});
   }
  }
  async download(file){
   if(!/^[A-Za-z0-9_-]+$/.test(file.id))throw new BackupError('format','Invalid backup file ID.');
   if(Number(file.size)>MAX_BYTES)throw new BackupError('size','This backup exceeds the 50 MB restore limit.');
   const response=await this.request(API+'/files/'+file.id+'?alt=media');
   const length=Number(response.headers.get('Content-Length'));if(length>MAX_BYTES)throw new BackupError('size','This backup exceeds the 50 MB restore limit.');
   const text=await response.text();if(new Blob([text]).size>MAX_BYTES)throw new BackupError('size','This backup exceeds the 50 MB restore limit.');
   let data;try{data=JSON.parse(text)}catch{throw new BackupError('format','This is not a valid JSON backup.')}
   if(data?.format!=='cash-out-drive'||data.version!==1||typeof data.datasetId!=='string'||!Number.isSafeInteger(data.revision)||data.revision<1||!data.payload)throw new BackupError('format','Unsupported Cash Out backup format.');
   return data;
  }
 }
 const api={SCOPE,MAX_BYTES,BackupError,Drive};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashDrive=api;
})(typeof window==='undefined'?{}:window);
