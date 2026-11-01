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
    return '₹' + (cents/100).toLocaleString('en-IN', { maximumFractionDigits:2 });
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
  function segment(options, selected, action = 'mode') {
    return `<div class="segment" role="group" aria-label="${action === 'unit' ? 'Entry unit' : 'Settlement route'}">${options.map(option => button({label:option.label,action,variant:option.value === selected ? 'active' : '',attributes:`data-value="${escape(option.value)}" aria-pressed="${option.value === selected}"`})).join('')}</div>`;
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
  function playerCard(player, net) {
    const complete = player.out !== null;
    const result = (player.out ?? 0) - player.buy;
    const status = complete ? 'Cashed out' : 'Playing';
    const payment = net > 0 ? `${money(net)} owed` : net < 0 ? `${money(-net)} due` : 'Settled';
    return `<article class="player" aria-label="${escape(player.name)} player card">
      <div class="player-top">${avatar(player)}<div class="player-name"><h3>${escape(player.name)}</h3><small><span class="status-dot ${complete ? 'complete' : ''}"></span>${status}${complete ? ' · ' + money(player.out) : ' · result pending'}</small></div><div class="player-value">${amount(player.buy,{label:'Total buy-in'})}</div></div>
      ${complete ? `<div class="player-result"><span>Final result</span>${amount(result,{signed:true})}<span class="payment-chip ${net>0?'is-owed':net<0?'is-due':'is-settled'}">${escape(payment)}</span></div>` : net > 0 ? `<div class="unpaid-line">Buy-in payment outstanding · ${money(net)}</div>` : ''}
      <div class="player-bottom">${button({label:complete?'Edit stack':'+ Add money',action:complete?'cashout':'rebuy',variant:complete?'text-button edit-action':'text-button add-action',attributes:`data-id="${player.id}"`})}${button({label:complete?'Payments':'Cash out',action:complete?'payment':'cashout',variant:complete?'text-button payments-action':'text-button cashout-action',attributes:`data-id="${player.id}"`})}${button({content:icon('more',18),action:'player-menu',variant:'text-button ellipsis',attributes:`data-id="${player.id}" aria-label="More actions for ${escape(player.name)}"`})}</div>
    </article>`;
  }
  const api = { escape, icon, button, toggle, wordmark, badge, avatar, money, amount, notice, field, segment, keypad, empty, reviewSummary, playerCard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CashUI = api;
})(typeof window === 'undefined' ? {} : window);
