/* Fixed elapsed-time minimums, persisted with each confirmed play period. */
(function(root){
 const minute=60000;
 const validTime=n=>Number.isSafeInteger(n)&&n>0&&n<=8640000000000000;
 const validMinimum=n=>Number.isInteger(n)&&n>=0&&n<=1440;
 function start(player,minimumMinutes=180,now=Date.now()){
  if(!validMinimum(minimumMinutes)||!validTime(now))throw Error('Use a minimum between 0 and 1,440 minutes.');
  (player.playPeriods??=[]).push({startedAt:now,minimumMinutes});
 }
 function current(player){return player?.playPeriods?.at(-1)}
 function status(player,now=Date.now(),uncertain=false){
  const period=current(player);
  if(!period)return {kind:'unknown',label:'Time not recorded',remaining:null};
  if(uncertain||!validTime(now)||now<period.startedAt||period.timeUncertain)return {kind:'unknown',label:'Check device time',remaining:null};
  const remaining=Math.max(0,period.startedAt+period.minimumMinutes*minute-now);
  return {kind:remaining?'waiting':'eligible',label:remaining?format(remaining)+' left':'Eligible to leave',remaining,deadline:period.startedAt+period.minimumMinutes*minute};
 }
 function format(ms){const seconds=Math.ceil(Math.max(0,ms)/1000),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')}
 function warning(player,cumulativeOut,now=Date.now(),uncertain=false){const state=status(player,now,uncertain);return cumulativeOut>player.buy&&state.kind!=='eligible'?state:null}
 function finish(player,{now=Date.now(),reason='',uncertain=false}={}){const period=current(player);if(!period)return;if(!validTime(now))throw Error('Invalid clock time.');period.endedAt??=now;if(uncertain||now<period.startedAt)period.timeUncertain=true;if(reason)period.earlyExitReason=reason.trim()}
 function validate(table){
  if(table.callTimeMinutes!==undefined&&!validMinimum(table.callTimeMinutes))throw Error('Invalid table call-time minimum.');
  for(const p of table.players){if(p.playPeriods===undefined)continue;if(!Array.isArray(p.playPeriods)||p.playPeriods.length>1000)throw Error('Invalid play periods.');for(const period of p.playPeriods){if(!period||!validTime(period.startedAt)||!validMinimum(period.minimumMinutes)||period.endedAt!==undefined&&(!validTime(period.endedAt)||period.endedAt<period.startedAt&&!period.timeUncertain)||period.timeUncertain!==undefined&&typeof period.timeUncertain!=='boolean'||period.earlyExitReason!==undefined&&(typeof period.earlyExitReason!=='string'||period.earlyExitReason.trim().length<3||period.earlyExitReason.length>160))throw Error('Invalid saved call-time record.');}}
 }
 const api={start,current,status,warning,finish,validate,format,validMinimum};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashCallTime=api;
})(typeof window==='undefined'?{}:window);
