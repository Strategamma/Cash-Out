import {Capacitor} from '@capacitor/core';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {App} from '@capacitor/app';
import {createExporter} from './native-export.cjs';

const isNative=()=>Capacitor.isNativePlatform();
window.CashNative={isNative,exportFile:createExporter({filesystem:Filesystem,share:Share,directory:Directory.Cache,encoding:Encoding.UTF8})};
if(isNative()){
 // WKWebView custom origins may lack randomUUID, but support secure random bytes.
 if(!crypto.randomUUID)crypto.randomUUID=()=>{
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 };
 App.addListener('backButton',()=>{
  const state=window.CashBackupUI?.state();if(!state?.ready||state.saving)return;
  if(document.querySelector('#sheet')?.open){close();return;}
  if(view!=='tables'){historyView=false;go('tables');return;}
  App.exitApp();
 });
}
