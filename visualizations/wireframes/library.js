const UI = CashUI;
const specimen = (title, html) => `<div class="specimen"><h3>${UI.escape(title)}</h3>${html}</div>`;
const button = (label, variant, disabled = false) => UI.button({label,variant,disabled});
const players = [
  {id:1,name:'Alex Morgan',buy:500000,out:null},
  {id:2,name:'Jamie Chen',buy:500000,out:null},
  {id:3,name:'Sam Rivera',buy:500000,out:720000},
  {id:4,name:'Taylor Reed',buy:500000,out:380000}
];
const section = (title, description, body) => `<section class="catalog-section"><h2>${title}</h2><p>${description}</p>${body}</section>`;
const palette = ['bg-primary','bg-secondary','bg-tertiary','label-primary','system-blue','system-green','system-red','separator'];
document.querySelector('#catalog-content').innerHTML = section('Wordmark & symbol','Cut / Ace: custom vector lettering, solid ace-of-spades A and chip O. Transparent; theme-aware ink.',UI.wordmark('large')+'<p><span class="wordmark" style="--wordmark-width:80px"><img class="brand-on-light" src="assets/brand/cash-out-symbol-light.svg?v=15" alt="Cash Out chip and spade symbol"><img class="brand-on-dark" src="assets/brand/cash-out-symbol-dark.svg?v=15" alt="Cash Out chip and spade symbol"></span></p>') +  section('Appearance switch','Accessible toggle with checked and unchecked states.',specimen('Dark appearance', UI.toggle({label:'Dark appearance',checked:true,action:'catalog-toggle'}))+specimen('Light appearance',UI.toggle({label:'Light appearance',action:'catalog-toggle'}))) +
  section('01 / Foundations','Extracted kit values, mapped to Cash Out’s material and semantic layers.',
    `<div class="swatches">${palette.map(name=>`<div class="swatch"><div style="background:var(--color-${name})"></div>${name}<code>--color-${name}</code></div>`).join('')}</div><div class="radius-samples" style="margin-top:20px">${[['xs',4],['sm',8],['md',12],['lg',16],['xl',20],['2xl',28]].map(([name,n])=>`<div style="border-radius:${n}px">${name} / ${n}</div>`).join('')}</div>`) +
  section('02 / Actions','One primary action per flow. Disabled controls stay distinct; destructive actions are separated.',
    `<div class="catalog-grid">${specimen('Primary / secondary / disabled',`<div class="stack">${button('Review amount →','primary')}${button('Edit amount','secondary')}${button('Enter amount to continue','primary',true)}</div>`)}${specimen('Destructive / ghost / icon',`<div class="stack">${button('Discard changes','secondary destructive')}${button('View activity','ghost')}<div class="inline">${UI.button({content:UI.icon('settings'),variant:'icon',attributes:'aria-label="Settings example"'})}${UI.button({content:UI.icon('plus'),variant:'icon',attributes:'aria-label="Add example"'})}${UI.button({content:UI.icon('close'),variant:'icon',attributes:'aria-label="Close example"'})}</div></div>`)}</div>`) +
  section('03 / Status & feedback','Text and icons accompany color. Incomplete, invalid, and saved states are different.',
    `<div class="inline">${UI.badge('Playing')}${UI.badge('Balanced','green')}${UI.badge('Payment due','warning')}${UI.badge('Needs review','error')}${UI.badge('Private')}</div><div class="catalog-grid" style="margin-top:20px">${specimen('Success and warning',UI.notice('All stacks entered. The table balances.','success')+UI.notice('Two players still need a cash-out.'))}${specimen('Failure without data loss',UI.notice('Nothing was saved. Your amount is kept; retry safely.','error'))}</div>`) +
  section('04 / Input & selection','Explicit labels, inline errors, decimal validation, and a separate payment choice.',
    `<div class="catalog-grid">${specimen('Text field / optional / invalid',`<div class="field-group">${UI.field({id:'catalog-name',label:'Player name',placeholder:'Name'})}${UI.field({id:'catalog-phone',label:'Phone number',optional:true,type:'tel',placeholder:'Optional'})}${UI.field({id:'catalog-error',label:'Amount',value:'1.001',error:'Use no more than two decimal places.'})}</div>`)}${specimen('Cash amount and keypad',`<div class="amount-box"><small>AMOUNT TO ADD · ₹</small><input id="catalog-amount" class="amount-input" aria-label="Keypad example amount" inputmode="none" value="0" readonly></div>${UI.keypad()}`)}</div>`) +
  section('05 / Player states','The same player-card renderer used by the app. Final results never appear for an active player.',
    `<div class="catalog-grid">${specimen('Playing / paid buy-in',UI.playerCard(players[0],0))}${specimen('Playing / buy-in due',UI.playerCard(players[1],500000))}${specimen('Cashed out / payout due',UI.playerCard(players[2],-720000))}${specimen('Cashed out / settled',UI.playerCard(players[3],0))}</div>`) +
  section('06 / Empty & confirmation','Empty states explain the next step. Money is reviewed before it is committed.',
    `<div class="catalog-grid">${specimen('Empty table',UI.empty({title:'Your first seat is open',description:'Players join after their buy-in is confirmed.',actionLabel:'Add your first player'}))}${specimen('Review dialog',`<div class="review-money"><span>ADDITIONAL BUY-IN</span><strong>₹1,000</strong></div><div class="row"><span>Total after this</span><strong>₹6,000</strong></div>${UI.button({label:'Open review example',variant:'primary',attributes:'id="open-library-dialog"'})}`)}</div>`);

document.querySelector('#library-dialog .review-subject').outerHTML = '';
document.querySelector('#library-dialog .review-money').outerHTML = '';
document.querySelector('#library-dialog .row').outerHTML = '';
document.querySelector('#library-dialog-title').insertAdjacentHTML('afterend',UI.reviewSummary({tableName:'Friday Night',playerName:'Alex Morgan',cents:100000,resultCents:600000,label:'AMOUNT TO ADD',resultLabel:'Total buy-in after this'}));
document.querySelector('#catalog-content').insertAdjacentHTML('beforeend',section('07 / Emphasis & motion','Shadcn fade/zoom/slide conventions, adapted to the shared native components. No motion on amounts or confirmation controls.',`<div class="catalog-grid">${specimen('Text & color hierarchy',`<div class="motion-sample" id="motion-example"><h3>Ready to settle</h3>${UI.amount(1580000,{label:'Player payments remaining'})}<p>Totals lead. Supporting labels stay quiet.</p><div class="inline" style="margin-top:16px"><span class="payment-chip is-owed">₹1,000 owed</span><span class="payment-chip is-due">₹2,200 due</span><span class="payment-chip is-settled">Settled</span></div></div>`)}${specimen('Replay & reduced motion',`<div class="stack"><button type="button" class="primary" id="replay-motion">Replay entrance</button><label class="check"><input id="preview-reduced-motion" type="checkbox"> Preview reduced motion</label><p class="hint">200ms fade + 8px slide. Dialogs use a small zoom on desktop and slide on phones. Your system’s reduced-motion setting always wins.</p><a href="THIRD_PARTY_NOTICES.md" style="color:var(--accent);font-size:12px">Animation sources & license ↗</a></div>`)}</div>`));
document.querySelector('#replay-motion').onclick=()=>CashMotion.enter(document.querySelector('#motion-example'),'page');
document.querySelector('#preview-reduced-motion').onchange=e=>{document.documentElement.dataset.motion=e.target.checked?'off':'on'};
document.querySelector('#library-theme').innerHTML = UI.icon('sun');
document.querySelector('#library-theme').onclick = () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  document.querySelector('#library-theme').innerHTML = UI.icon(dark ? 'moon' : 'sun');
  document.querySelector('#library-theme').setAttribute('aria-label',dark?'Switch to dark theme':'Switch to light theme');
};
document.querySelector('#open-library-dialog').onclick = () => document.querySelector('#library-dialog').showModal();
document.querySelector('#library-confirm').onclick = () => document.querySelector('#library-dialog').close();
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) return;
  if (b.dataset.action === 'key') {
    const input = document.querySelector('#catalog-amount');
    let text = input.value === '0' ? '' : input.value;
    const key = b.dataset.value;
    if (key === '⌫') text = text.slice(0,-1);
    else if (key !== '.' || !text.includes('.')) text += key;
    input.value = text || '0';
  }
});

document.addEventListener('click',e=>{const toggle=e.target.closest('[data-action="catalog-toggle"]');if(toggle)toggle.setAttribute('aria-checked',toggle.getAttribute('aria-checked')!=='true')});

// Catalogue fixtures stay separate from the platform's saved records.
const profileFixture=CashHistory.seed();
const profileExample=CashHistory.stats(profileFixture.tables,1);
let catalogProfileTab='overview';
function renderProfileExample(){
 const el=document.querySelector('#catalog-profile');
 el.innerHTML=CashProfile.summary(profileExample)+CashProfile.tabs(catalogProfileTab,profileExample.sessions)+(catalogProfileTab==='overview'?CashProfile.chart(profileExample.trend)+CashProfile.statistics(profileExample):CashProfile.sessions(profileExample.recent));
 CashPolish.mount(el);
}
document.querySelector('#catalog-content').insertAdjacentHTML('beforeend',section('08 / Saved-record profiles','Shared production renderers; these catalogue examples use clearly separated sample records. Inspect sessions with the slider or arrow keys.','<div id="catalog-profile" class="specimen" style="max-width:520px"></div>'));
renderProfileExample();
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b?.dataset.action==='profile-tab'){catalogProfileTab=b.dataset.value;renderProfileExample();document.querySelector('#catalog-profile .active')?.focus({preventScroll:true})}if(b?.dataset.action==='recent'&&b.closest('#catalog-profile')){document.querySelector('#catalog-profile').insertAdjacentHTML('beforeend','<p class="hint" role="status">Sample table. Open the app to inspect your saved session records.</p>')}});
document.addEventListener('input',e=>{if(e.target.id!=='profile-session')return;const holder=document.createElement('div');holder.innerHTML=CashProfile.chart(profileExample.trend,Number(e.target.value));const chart=e.target.closest('.co-chart');chart.querySelector('svg').outerHTML=holder.querySelector('svg').outerHTML;chart.querySelector('.co-session-readout').innerHTML=holder.querySelector('.co-session-readout').innerHTML;e.target.setAttribute('aria-valuetext',holder.querySelector('input').getAttribute('aria-valuetext'))});
CashPolish.mount(document.querySelector('#catalog-content'));
