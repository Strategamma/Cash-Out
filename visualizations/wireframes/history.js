/* Deterministic demo records, not real player history. All money uses minor units. */
(function(root){
  function seed(){
    const names=['Alex Morgan','Jamie Chen','Sam Rivera','Taylor Reed','Jordan Patel','Casey Brooks','Morgan Lee','Riley Shah','Avery Singh','Quinn Parker','Drew Wilson','Cameron Ali','Skyler Kim','Robin Das','Charlie Evans'];
    const contacts=names.map((name,i)=>({id:i+1,name,phone:'',last:500000}));
    let state=314159;
    const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
    const tables=Array.from({length:10},(_,i)=>{
      const shuffled=[...contacts];
      for(let j=shuffled.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[shuffled[j],shuffled[k]]=[shuffled[k],shuffled[j]]}
      const players=shuffled.slice(0,9).map(p=>({...p,buy:(1+Math.floor(random()*3))*500000}));
      const total=players.reduce((s,p)=>s+p.buy,0), rake=60000+i%3*20000;
      const weights=players.map(()=>.1+random()*2), sum=weights.reduce((a,b)=>a+b,0);
      let allocated=0;
      players.forEach((p,j)=>{p.out=j===8?total-rake-allocated:Math.floor((total-rake)*weights[j]/sum/10000)*10000;allocated+=p.out;p.paidIn=p.buy;p.paidOut=i>=8&&j<2?0:p.out});
      const date=`2026-10-${String(3+i*3).padStart(2,'0')}`,name=['Saturday Regulars','Midweek Mix','Friday Night','Sunday Session','After Hours'][i%5]+' '+(Math.floor(i/5)+1);
      return {id:'past-'+(i+1),name,date,banker:'You',small:50,big:100,rake,closed:true,mode:'banker',players,payments:[],events:[{title:'Table closed',detail:`${name} · ${date} · all nine stacks balance with rake`}]};
    });
    return {contacts,tables};
  }
  function completed(tables){
    const seen=new Set();
    return tables.filter(t=>{
      const valid=t.type!=='tournament'&&t.closed&&t.players.length>0&&t.players.every(p=>Number.isSafeInteger(p.out)&&p.out>=0&&Number.isSafeInteger(p.buy)&&p.buy>=0)&&t.players.reduce((s,p)=>s+p.buy-p.out,0)===t.rake;
      if(!valid||seen.has(t.id))return false;seen.add(t.id);return true;
    }).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  }
  function stats(tables,id){
    const sessions=completed(tables).flatMap(t=>t.players.filter(p=>p.id===id).map(p=>({tableId:t.id,name:t.name,date:t.date,buy:p.buy,out:p.out,net:p.out-p.buy})));
    const wins=sessions.filter(s=>s.net>0),losses=sessions.filter(s=>s.net<0);
    const sum=(list,key)=>list.reduce((s,p)=>s+p[key],0),avg=(list,key)=>list.length?Math.round(sum(list,key)/list.length):null;
    let running=0;
    return {sessions:sessions.length,wins:wins.length,losses:losses.length,net:sum(sessions,'net'),buy:sum(sessions,'buy'),averageBuy:avg(sessions,'buy'),averageWin:avg(wins,'net'),averageLoss:avg(losses,'net'),biggestWin:wins.length?Math.max(...wins.map(s=>s.net)):null,biggestLoss:losses.length?Math.min(...losses.map(s=>s.net)):null,winRate:sessions.length?Math.round(wins.length/sessions.length*100):null,trend:sessions.map(s=>({...s,cumulative:running+=s.net})),recent:[...sessions].reverse()};
  }
  function validate(tables,contacts,core){
    if(!Array.isArray(tables)||tables.length>1000)throw new Error('Invalid history collection.');
    const ids=new Set();
    for(const t of tables){
      if(typeof t.id!=='string'||!t.id||ids.has(t.id)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))throw new Error('Duplicate history ID or invalid date.');
      ids.add(t.id);
      if(!t.closed)throw new Error('History must contain completed tables.');
      core.validateBackup({demo:true,version:1,table:t,contacts,payments:t.payments});
    }
  }
  const api={seed,completed,stats,validate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashHistory=api;
})(typeof window==='undefined'?{}:window);
