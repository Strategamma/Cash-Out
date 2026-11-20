/* Framework-free UI primitives. Text is escaped; `content` is trusted internal HTML. */
(function (root) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const paths = {
    tables: '<rect x="3" y="5" width="18" height="14" rx="5"/><path d="M8 9h8M8 13h5"/>',
    players: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-4-5"/>',
    history: '<path d="M3 11a9 9 0 1 1 2.5 7M3 4v7h7M12 7v5l3 2"/>',
    insights: '<path d="M4 20h16M7 16v-5M12 16V5M17 16V8"/>',
    settings: '<path d="M9.4 4.2 10 2.5h4l.6 1.7 1.5.9 1.8-.3 2 3.4-1.2 1.4v1.8l1.2 1.4-2 3.4-1.8-.3-1.5.9-.6 1.7h-4l-.6-1.7-1.5-.9-1.8.3-2-3.4 1.2-1.4V9.6L4.1 8.2l2-3.4 1.8.3Z" transform="translate(0 1.5)"/><circle cx="12" cy="12" r="3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    moon: '<path d="M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    warning: '<path d="m12 3 10 18H2Z"/><path d="M12 9v5M12 17v.1"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    chip: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>'
  };
  const icon = (name, size = 20) => `<svg class="ui-icon" width="${Number(size)}" height="${Number(size)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.chip}</svg>`;

  function button({ label = '', content, action, variant = 'secondary', attributes = '', disabled = false, type = 'button' } = {}) {
    return `<button type="${escape(type)}" class="${escape(variant)}"${action ? ` data-action="${escape(action)}"` : ''}${disabled ? ' disabled' : ''} ${attributes}>${content ?? escape(label)}</button>`;
  }
  function toggle({label,checked=false,action='theme'}) {
    return `<button type="button" class="ui-switch" role="switch" aria-label="${escape(label)}" aria-checked="${checked}" data-action="${escape(action)}"><span></span></button>`;
  }
  function wordmark(size = 'normal') {
    return `<span class="wordmark ${size === 'compact' ? 'wordmark-compact' : size === 'large' ? 'wordmark-large' : ''}"><img class="brand-on-light" src="assets/brand/cash-out-wordmark-light.svg?v=15" alt="Cash Out" width="598" height="112"><img class="brand-on-dark" src="assets/brand/cash-out-wordmark-dark.svg?v=15" alt="Cash Out" width="598" height="112"></span>`;
  }
  function badge(label, tone = 'neutral') {
    return `<span class="tag ui-badge ${escape(tone)}">${tone === 'green' ? icon('check',12) : tone === 'warning' ? icon('warning',12) : ''}${escape(label)}</span>`;
  }
  function avatar(player, size = 'normal') {
    const safe = typeof player.photo === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(player.photo);
    const initials = String(player.name || '?').trim().split(/\s+/).map(word => word[0]).slice(0,2).join('');
    return `<div class="avatar ${size === 'large' ? 'avatar-large' : ''}">${safe ? `<img src="${escape(player.photo)}" alt="">` : escape(initials)}</div>`;
  }
  function money(cents) {
    if (!Number.isSafeInteger(cents)) return '—';
    return '₹' + (cents/100).toLocaleString('en-IN', { minimumFractionDigits:cents%100?2:0, maximumFractionDigits:2 });
  }
  function amount(cents, { signed = false, label = '' } = {}) {
    return `<span class="ui-amount ${signed ? cents >= 0 ? 'positive' : 'negative' : ''}">${signed ? (cents >= 0 ? '+' : '−') + money(Math.abs(cents)) : money(cents)}</span>${label ? `<small class="ui-amount-label">${escape(label)}</small>` : ''}`;
  }
  function notice(text, tone = 'warning') {
    return `<div class="notice ${tone === 'success' ? 'good' : tone === 'error' ? 'ui-error' : ''}" ${tone === 'error' ? 'role="alert"' : ''}>${icon(tone === 'success' ? 'check' : 'warning',18)}<span>${escape(text)}</span></div>`;
  }
  function field({ id, label, optional = false, placeholder = '', value = '', error = '', type = 'text', attributes = '' }) {
    return `<label for="${escape(id)}">${escape(label)}${optional ? ' <small>optional</small>' : ''}</label><input id="${escape(id)}" type="${escape(type)}" placeholder="${escape(placeholder)}" value="${escape(value)}"${error ? ` aria-invalid="true" aria-describedby="${escape(id)}-error"` : ''} ${attributes}>${error ? `<p id="${escape(id)}-error" class="error" role="alert">${escape(error)}</p>` : ''}`;
  }
  function actionRow({label,description,action}) {return `<button type="button" class="settings-row action-row" data-action="${escape(action)}"><span><strong>${escape(label)}</strong><small>${escape(description)}</small></span>${icon('arrow',18)}</button>`;}
  function segment(options, selected, action = 'mode', label) {
    return `<div class="segment" role="group" aria-label="${escape(label || (action === 'unit' ? 'Entry unit' : 'Settlement route'))}">${options.map(option => button({label:option.label,action,variant:option.value === selected ? 'active' : '',attributes:`data-value="${escape(option.value)}" aria-pressed="${option.value === selected}"`})).join('')}</div>`;
  }
  function keypad() {
    return `<div class="keypad" role="group" aria-label="Amount keypad">${['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => button({label:key,action:'key',variant:key==='⌫'?'small':'',attributes:`data-value="${key}" aria-label="${key === '⌫' ? 'Backspace' : key === '.' ? 'Decimal point' : key}"`})).join('')}</div>`;
  }
  function empty({ title, description, actionLabel, action = 'add-player' }) {
    return `<div class="empty empty-table"><div class="empty-symbol">${icon('tables',32)}</div><h3>${escape(title)}</h3><p>${escape(description)}</p>${actionLabel ? button({label:actionLabel,action,variant:'primary'}) : ''}</div>`;
  }
  function reviewSummary({ tableName, playerName, cents, resultCents, label = 'AMOUNT TO RECORD', resultLabel = 'Total after this', detail = '' }) {
    return `<div class="review-subject"><span>${escape(tableName)}</span><strong>${escape(playerName)}</strong></div><div class="review-money"><span>${escape(label)}</span><strong>${money(cents)}</strong>${detail ? `<small>${escape(detail)}</small>` : ''}</div><div class="row"><span>${escape(resultLabel)}</span><strong>${money(resultCents)}</strong></div>`;
  }
  function tableCheck({buy,out,rake,pending=[],difference,balanced}) {
    const missing=pending.length;
    return `<section class="balance-card" aria-label="Table balance check"><header><span class="eyebrow">TABLE CHECK</span>${badge(missing?'Stacks missing':balanced?'Balanced':'Needs review',missing?'warning':balanced?'green':'error')}</header><p>${missing?'Expected remaining stacks':'Balance difference'}</p><strong class="balance-value ${difference<0||!missing&&!balanced?'negative':balanced?'positive':''}">${difference<0?'−'+money(Math.abs(difference)):money(difference)}</strong><dl class="balance-breakdown"><div><dt>Buy-ins</dt><dd>${money(buy)}</dd></div><div><dt>Cash-outs</dt><dd>${money(out)}</dd></div><div><dt>Rake</dt><dd>${money(rake)}</dd></div></dl><small>${difference<0?`Cash-outs and rake exceed buy-ins by ${money(-difference)}. Review the entries.`:missing?'Provisional until every player has a stack.':balanced?'Buy-ins = cash-outs + rake. Payments are checked separately.':'Review the entries before closing the table.'}</small></section>`;
  }
  function transferCard({label,amount:cash,index}) {
    return `<article class="transfer-card"><header><span class="eyebrow">TRANSFER ${String(index+1).padStart(2,'0')}</span><span class="tag warning">Not recorded</span></header><h3>${escape(label)}</h3><p class="transfer-value">${money(cash)}</p><footer><small>Confirm after money changes hands.</small>${button({label:'Record paid',action:'record-transfer',variant:'secondary',attributes:`data-index="${Number(index)}"`})}</footer></article>`;
  }
  function callClock(player){
    const clock=typeof module!=='undefined'&&module.exports?require('./call-time.js'):root.CashCallTime;
    if(player.out!==null||!clock)return '';
    const state=clock.status(player),period=clock.current(player);
    return `<span class="call-clock ${state.kind}" data-call-player="${escape(player.id)}"${period?` data-clock-start="${period.startedAt}" data-clock-minimum="${period.minimumMinutes}"`:''}>${escape(state.label)}</span>`;
  }
  function playerCard(player, net) {
    const complete = player.out !== null;
    const result = (player.out ?? 0) - player.buy;
    const status = complete ? 'Cashed out' : 'Playing';
    const paymentLabel = net > 0 ? 'Still to pay' : net < 0 ? 'Still to receive' : 'Payments settled';
    const paymentTone = net > 0 ? 'is-owed' : net < 0 ? 'is-due' : 'is-settled';
    return `<article class="player ${complete ? 'is-cashed-out' : 'is-playing'}" data-player-id="${escape(player.id)}" aria-label="${escape(player.name)} player card">
      <header class="player-top">${avatar(player)}<div class="player-name"><div class="player-title"><h3>${escape(player.name)}</h3>${callClock(player)}</div>${complete ? '' : '<small><span class="status-dot"></span>Playing · result pending</small>'}</div>${complete ? `<span class="player-state">${icon('check',13)}${status}</span>` : `<div class="player-value">${amount(player.buy,{label:'Total buy-in'})}</div>`}</header>
      ${complete ? `<dl class="player-ledger"><div><dt>Buy-in</dt><dd>${amount(player.buy)}</dd></div><div><dt>Cash-out</dt><dd>${amount(player.out)}</dd></div><div><dt>Result</dt><dd>${amount(result,{signed:true})}</dd></div></dl><div class="player-payment ${paymentTone}"><span>${icon(net === 0 ? 'check' : 'arrow',14)}${paymentLabel}</span>${net === 0 ? '' : `<strong>${money(Math.abs(net))}</strong>`}</div>` : net > 0 ? `<div class="unpaid-line">Buy-in payment outstanding · ${money(net)}</div>` : ''}
      <footer class="player-bottom">${button({label:complete?'Edit stack':'+ Add money',action:complete?'cashout':'rebuy',variant:complete?'text-button edit-action':'text-button add-action',attributes:`data-id="${player.id}"`})}${button({label:complete?'Payments':'Cash out',action:complete?'payment':'cashout',variant:complete?'text-button payments-action':'text-button cashout-action',attributes:`data-id="${player.id}"`})}${complete ? button({label:'Receipt',action:'player-receipt',variant:'text-button',attributes:`data-id="${player.id}"`}) : ''}${button({content:icon('more',18),action:'player-menu',variant:'text-button ellipsis',attributes:`data-id="${player.id}" aria-label="More actions for ${escape(player.name)}"`})}</footer>
    </article>`;
  }
  function emptyArtwork(kind){const content=kind==='contacts'?`<g transform="translate(58 28) rotate(-9 65 55)"><rect width="142" height="110" rx="21" fill="var(--first-paper, var(--surface))" stroke="var(--muted)" stroke-opacity=".35"/><circle cx="45" cy="42" r="16" fill="none" stroke="var(--accent)" stroke-width="1.6"/><path d="M23 78c1-23 43-23 44 0M83 36h34M83 46h23M83 70h29M83 79h18" stroke="var(--accent)" stroke-opacity=".65" fill="none" stroke-linecap="round" stroke-width="2"/></g><g transform="translate(191 123)"><circle r="21" fill="var(--accent)"/><path d="M-7 0H7M0-7V7" stroke="var(--first-on-green, var(--page))" stroke-width="2" stroke-linecap="round"/></g>`:kind==='history'?`<rect x="73" y="22" width="115" height="139" rx="14" fill="var(--first-paper, var(--surface))" stroke="var(--muted)" stroke-opacity=".3"/><path d="M95 52h70M95 65h47M95 89h27m17 0h26M95 105h27m17 0h26M95 130h70" stroke="var(--accent)" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/><circle cx="188" cy="126" r="25" fill="var(--page)" stroke="var(--accent)" stroke-opacity=".65"/><path d="M188 112v15l9 6" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>`:`<ellipse cx="136" cy="139" rx="86" ry="19" fill="none" stroke="var(--muted)" stroke-opacity=".2"/><g transform="translate(56 30) rotate(-18 43 55)"><rect width="85" height="116" rx="13" fill="var(--first-paper, var(--surface))" stroke="var(--muted)" stroke-opacity=".4"/><rect x="8" y="8" width="69" height="100" rx="8" fill="none" stroke="var(--accent)" stroke-opacity=".25"/><path d="M43 34C34 45 22 48 22 61c0 12 15 15 21 5 6 10 21 7 21-5 0-13-12-16-21-27Z" fill="var(--accent)" fill-opacity=".7"/><path d="m43 62-6 19h12Z" fill="var(--accent)" fill-opacity=".7"/></g><g transform="translate(153 120) rotate(15)"><circle r="36" fill="var(--first-paper, var(--surface))" stroke="var(--accent)" stroke-opacity=".7"/><circle r="24" fill="none" stroke="var(--accent)" stroke-opacity=".7"/><path d="M0-35v10M0 25v10M-35 0h10M25 0h10M-25-25l7 7M18 18l7 7M25-25l-7 7M-18 18l-7 7" stroke="var(--accent)" stroke-opacity=".7" stroke-width="5"/></g>`;return `<div class="first-run-art"><svg viewBox="0 0 270 185" aria-hidden="true">${content}</svg></div>`}
  function emptyScene({kind='games',title,description,primary,secondary,footnote=''}) {
    return `<section class="first-run-empty">${emptyArtwork(kind)}<h3>${escape(title)}</h3><p>${escape(description)}</p><div class="actions">${primary?button({...primary,content:escape(primary.label)+' '+icon('arrow',17),variant:'primary'}):''}${secondary?button({...secondary,variant:'secondary'}):''}</div>${footnote?`<small class="first-run-footnote">${escape(footnote)}</small>`:''}</section>`;
  }
  const api = { escape, icon, button, toggle, wordmark, badge, avatar, money, amount, notice, field, actionRow, segment, keypad, empty, emptyArtwork, emptyScene, reviewSummary, tableCheck, transferCard, callClock, playerCard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CashUI = api;
})(typeof window === 'undefined' ? {} : window);
