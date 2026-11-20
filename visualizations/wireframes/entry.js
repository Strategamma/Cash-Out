/* Money-entry flow: draft → review → one committed sample event. */
let simulateSaveFailure = false;
let formDirty = false;

function amountSheet(kind, id) {
  let player = table.players.find(p => p.id === Number(id));
  if (kind === 'buy' && !player) {
    player = { ...contacts.find(p => p.id === Number(id)), buy: 0, out: null, priorOut: 0, paidIn: 0, paidOut: 0 };
  }
  const initialAmount = kind === 'cashout' && player.out !== null
    ? String((player.out - (player.priorOut || 0)) / 100)
    : kind === 'edit' ? String(player.buy / 100) : kind === 'rake-edit' ? String(table.rake / 100) : '';
  draft = {
    kind, id: player?.id, player, amount: initialAmount, initial: initialAmount,
    returnView: view, payment: null, reason: '', stage: 'entry',
    key: crypto.randomUUID(), committed: false, wasClosed: table.closed
  };
  drawEntry();
}

function entryTitle() {
  return { rebuy: 'Add money', cashout: draft.player?.out === null ? 'Cash out' : 'Correct cash-out',
    rake: 'Add rake', 'rake-edit': 'Correct rake', buy: 'Initial buy-in', edit: 'Correct buy-in', reentry: 'Return to play',
    receive: 'Receive payment', payout: 'Pay player' }[draft.kind];
}

function drawEntry() {
  const p = draft.player, kind = draft.kind;
  draft.stage = 'entry';
  const paymentsOnly = ['receive', 'payout'].includes(kind);
  const correction = ['edit','rake-edit'].includes(kind) || kind === 'cashout' && p.out !== null;
  const subject = p?.name || 'Rake account';
  modal(entryTitle(), table.name,
    `<div class="entry-person">${p ? avatar(p) : '<div class="avatar rake-icon">♜</div>'}<div><strong>${esc(subject)}</strong><small>${paymentsOnly ? 'Actual money · banker ↔ player' : ['rake','rake-edit'].includes(kind) ? 'A separate table allocation' : 'Buy-ins so far · ' + money(p.buy)}</small></div></div>
    <p class="muted">${kind === 'cashout' ? 'Enter the whole remaining stack, not the profit.' : paymentsOnly ? 'Record money only after it changes hands.' : ['edit','rake-edit'].includes(kind) ? 'Correct the recorded total. Actual payments stay unchanged.' : 'Shortcuts add to this draft. Review before saving.'}</p>
    <div class="amount-box"><small id="amount-label"></small><input id="amount" class="amount-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="0" aria-label="Amount" value="${esc(draft.amount)}"></div>
    ${['rebuy', 'rake', 'reentry'].includes(kind) ? `<div class="shortcuts">${btn('+' + (p ? money(p.last) : '₹200'), 'shortcut', '', `data-value="${p ? p.last / 100 : 200}"`)}${btn('+₹1,000', 'shortcut', '', 'data-value="1000"')}${btn('Clear', 'clear-amount', '')}</div>` : ''}
    <details class="entry-keypad"><summary>Use on-screen keypad</summary>${CashUI.keypad()}</details>
    <div id="amount-summary" class="entry-summary"></div>
    ${['rebuy', 'buy', 'reentry'].includes(kind) ? `<fieldset class="payment-choice"><legend>Has this money been received?</legend><label><input type="radio" name="received" value="received" ${draft.payment === 'received' ? 'checked' : ''}> Received now</label><label><input type="radio" name="received" value="later" ${draft.payment === 'later' ? 'checked' : ''}> Not yet · track as due</label></fieldset>` : ''}
    ${correction ? `<label for="correction-reason">Reason for correction</label><input id="correction-reason" maxlength="160" placeholder="For example, a stack was counted twice" value="${esc(draft.reason)}">` : ''}
    <p id="amount-error" class="error" role="alert"></p>
    <button type="submit" class="primary" id="confirm-amount">Review amount →</button>
    <p class="hint">Nothing is recorded until the next confirmation.</p>`, reviewEntry);
  updateAmount();
}

function value() { return draft ? CashCore.parseAmount(draft.amount) : null; }

function entryError() {
  const n = value(), p = draft.player;
  if (n === null) return draft.amount ? 'Use digits and up to two decimal places.' : '';
  if (n === 0 && !['cashout','rake-edit'].includes(draft.kind)) return 'Enter an amount greater than zero.';
  if (['rebuy','buy','reentry'].includes(draft.kind) && !CashCore.integer(p.buy + n)) return 'This would exceed the supported table amount.';
  if (['rebuy','buy','reentry'].includes(draft.kind) && draft.payment === 'received' && !CashCore.integer(p.paidIn + n)) return 'Total received money would exceed the supported amount.';
  if (draft.kind === 'rake' && !CashCore.integer(table.rake + n)) return 'This would exceed the supported rake amount.';
  if (draft.kind === 'cashout' && !CashCore.integer((p.priorOut || 0) + n)) return 'This would exceed the supported cash-out amount.';
  if (['receive','payout'].includes(draft.kind)) {
    const net = playerNet(p);
    const due = draft.kind === 'receive' ? Math.max(0,net) : Math.max(0,-net);
    if (n > due) return `Only ${money(due)} remains ${draft.kind === 'receive' ? 'to collect' : 'to pay'}.`;
  }
  return '';
}

function updateAmount() {
  if (!draft || draft.stage !== 'entry') return;
  const p = draft.player, kind = draft.kind, n = value();
  $('#amount').value = draft.amount;
  $('#amount-label').textContent = `${kind === 'cashout' ? 'REMAINING STACK' : kind === 'edit' ? 'CORRECTED BUY-IN TOTAL' : kind === 'rake-edit' ? 'CORRECTED RAKE TOTAL' : 'AMOUNT'} · ₹`;
  let text = 'Enter an amount to see the resulting total.';
  if (n !== null) {
    if (kind === 'cashout') text = `Cash-outs including earlier exits: ${money((p.priorOut || 0) + n)} · final result ${signed((p.priorOut || 0) + n - p.buy)}`;
    else if (kind === 'rake') text = `Add ${money(n)} → total rake ${money(table.rake + n)}`;
    else if (kind === 'rake-edit') text = `${money(table.rake)} → ${money(n)} total rake`;
    else if (kind === 'edit') text = `${money(p.buy)} → ${money(n)} total buy-in`;
    else if (['receive','payout'].includes(kind)) text = `${kind === 'receive' ? 'Receive' : 'Pay'} ${money(n)} · ${money(Math.abs(playerNet(p)))} outstanding`;
    else text = `Add ${money(n)} → total buy-in ${money(p.buy + n)}`;
  }
  $('#amount-summary').textContent = text;
  const error = entryError();
  $('#amount-error').textContent = error;
  const correction = ['edit','rake-edit'].includes(kind) || kind === 'cashout' && p.out !== null;
  $('#confirm-amount').disabled = n === null || Boolean(error) || ['rebuy','buy','reentry'].includes(kind) && !draft.payment || correction && draft.reason.trim().length < 3;
}

function addShortcut(amount) {
  const cash = value();
  if (cash === null && draft.amount) return notify('Clear or correct the current amount first.');
  const next = (cash || 0) + Math.round(Number(amount) * 100);
  if (!CashCore.integer(next)) return notify('That amount is too large.');
  draft.amount = String(next / 100);
  updateAmount();
}

function reviewEntry() {
  if (!draft || ($('#confirm-amount').disabled && !$('#confirm-amount').hasAttribute('aria-busy')) || entryError()) return;
  draft.stage = 'review';
  draft.callTimeWarning = null;
  const n = value(), p = draft.player, kind = draft.kind;
  const prior = ['rake','rake-edit'].includes(kind) ? table.rake : kind === 'cashout' ? p.out : p?.buy;
  const after = kind === 'rake-edit' ? n : kind === 'rake' ? table.rake + n : kind === 'cashout' ? (p.priorOut || 0) + n : kind === 'edit' ? n : ['receive','payout'].includes(kind) ? Math.abs(playerNet(p)) - n : p.buy + n;
  const unusuallyLarge = n >= 5000000 || ['rebuy','reentry'].includes(kind) && p.last > 0 && n > p.last * 5;
  const changed = ['edit','rake-edit'].includes(kind) || kind === 'cashout' && p.out !== null;
  const predictedDifference = kind === 'cashout' ? remaining() - (after - (p.out ?? p.priorOut ?? 0))
    : kind === 'rake-edit' ? remaining() + table.rake - n : kind === 'rake' ? remaining() - n : kind === 'edit' ? remaining() + n - p.buy : ['buy','rebuy','reentry'].includes(kind) ? remaining() + n : remaining();
  const discrepancy = !['receive','payout'].includes(kind) && predictedDifference < 0;
  const requireAcknowledgement = unusuallyLarge || discrepancy;
  draft.callTimeWarning=kind==='cashout'&&window.CashCallTime?CashCallTime.warning(p,after,p.out!==null?CashCallTime.current(p)?.endedAt??Date.now():Date.now(),window.CashClockUI?.uncertain()):null;
  const identity=$('#sheet-body .entry-person');
  modal('Check before recording', entryTitle(),
    `${CashUI.reviewSummary({tableName:table.name,playerName:p?.name||'Rake account',cents:n,resultCents:after,label:kind==='cashout'?'STACK TO CASH OUT':['edit','rake-edit'].includes(kind)?'CORRECTED TOTAL':'AMOUNT TO RECORD',resultLabel:['receive','payout'].includes(kind)?'Outstanding after payment':kind==='cashout'?'All cash-outs this table':['rake','rake-edit'].includes(kind)?'Total rake after this':'Total buy-in after this'})}
    ${changed && prior !== null ? `<div class="row"><span>Previously recorded</span><strong>${money(prior)}</strong></div><div class="notice">Correction: ${esc(draft.reason)}. Earlier activity and actual payments stay recorded.</div>` : ''}
    ${['rebuy','buy','reentry'].includes(kind) ? `<div class="row"><span>Payment</span><strong>${draft.payment === 'received' ? 'Received now' : 'Not received · due'}</strong></div>` : ''}
    ${kind === 'cashout' ? '<div class="notice">This records the stack. It does not mark a payout as paid.</div>' : ''}
    ${draft.wasClosed && !['receive','payout'].includes(kind) ? '<div class="notice">This change reopens the table for review. Existing payments stay recorded.</div>' : ''}
    ${discrepancy ? `<div class="notice ui-error">Cash-outs and rake would exceed buy-ins by ${money(-predictedDifference)}. Check the amount and missing buy-ins. The table cannot close until corrected.</div>` : ''}
    ${unusuallyLarge ? '<div class="notice">This amount is unusually large. Check the digits and cash amount.</div>' : ''}
    ${requireAcknowledgement ? '<label class="check large-check"><input type="checkbox" id="large-ack"> I checked the amount and the warning above.</label>' : ''}
    ${draft.callTimeWarning?`<div class="notice ui-error">${draft.callTimeWarning.kind==='waiting'?'Call time has not been reached. '+esc(draft.callTimeWarning.label)+'.':'The call time cannot be verified.'} This cash-out is in profit. A friendly-house exception can still be recorded.</div><label class="check"><input type="checkbox" id="call-override"> Allow an early-profit house exception</label><label for="call-override-reason">Reason for exception</label><input id="call-override-reason" maxlength="160" placeholder="For example, agreed with the table">`:''}
    <p id="save-error" class="error" role="alert"></p>
    <div class="actions"><button type="submit" class="primary" id="save-entry" ${requireAcknowledgement||draft.callTimeWarning ? 'disabled' : ''}>Record ${money(n)}</button><button type="button" class="secondary" data-entry="back">Edit amount</button></div>
    <p class="hint">${isPlatform?'Saved on this device after confirmation':'Sample data only'} · one confirmation, one entry.</p>`, commitAmount);
  if(identity){$('#sheet-body').prepend(identity);$('#sheet-body .review-subject')?.remove()}
  window.CashPremium?.reviewed();
}

async function commitAmount() {
  if(draft?.callTimeWarning&&(!$('#call-override')?.checked||String($('#call-override-reason')?.value||'').trim().length<3))return;
  if (!draft || draft.stage !== 'review' || draft.committed || ($('#save-entry').disabled && !$('#save-entry').hasAttribute('aria-busy')) || ($('#large-ack') && !$('#large-ack').checked)) return;
  if (simulateSaveFailure && !draft.retry) {
    draft.retry = true;
    $('#save-error').textContent = 'Simulated save failure. Nothing changed. Your amount is kept; retry safely.';
    $('#save-entry').textContent = 'Retry same entry';
    return;
  }
  draft.committed = true;
  $('#save-entry').disabled = true;
  const n = value(), p = draft.player, kind = draft.kind;
  const earlyReason=draft.callTimeWarning?$('#call-override-reason').value.trim():'';
  const correction=['edit','rake-edit'].includes(kind)||kind==='cashout'&&p.out!==null;
  try{await persistChange(kind,()=>{
  if (kind === 'rake-edit') {
    event('Rake corrected', `${money(table.rake)} → ${money(n)} · ${draft.reason}`);
    table.rake = n;
  } else if (kind === 'rake') {
    table.rake += n;
    event('Rake added', money(n));
  } else if (kind === 'cashout') {
    event(p.out === null ? 'Cash-out recorded' : 'Cash-out corrected', `${p.name} · stack ${money(n)}${draft.reason ? ' · ' + draft.reason : ''}`);
    p.out = (p.priorOut || 0) + n;
    window.CashCallTime?.finish(p,{reason:earlyReason,uncertain:window.CashClockUI?.uncertain()});
  } else if (kind === 'edit') {
    event('Buy-in corrected', `${p.name} · ${money(p.buy)} → ${money(n)} · ${draft.reason}`);
    p.buy = n;
  } else if (kind === 'receive' || kind === 'payout') {
    payments.push({ id:crypto.randomUUID(), timestamp:new Date().toISOString(), from: kind === 'receive' ? p.id : 'bank', to: kind === 'receive' ? 'bank' : p.id,
      amount: n, label: kind === 'receive' ? `${p.name} → Banker` : `Banker → ${p.name}`, recent: false });
    event('Payment recorded', `${p.name} · ${kind === 'receive' ? 'received' : 'paid'} ${money(n)}`);
  } else {
    if (kind === 'buy') table.players.push(p);
    if(['buy','reentry'].includes(kind))window.CashCallTime?.start(p,table.callTimeMinutes??180);
    if (kind === 'reentry') { p.priorOut = p.out; p.out = null; }
    p.buy += n;
    p.last = n;
    if (draft.payment === 'received') p.paidIn += n;
    const contact = contacts.find(c => c.id === p.id);
    if (contact) contact.last = n;
    event(kind === 'reentry' ? 'Player returned' : 'Buy-in recorded', `${p.name} · ${money(n)} · ${draft.payment === 'received' ? 'received' : 'unpaid'}`);
  }
  if (!['receive','payout'].includes(kind)) table.closed = false;
  },{id:draft.key,subjectId:p?.id??null,family:kind==='edit'||['buy','rebuy','reentry'].includes(kind)?'buy-in':kind==='rake-edit'?'rake':kind,correction,reason:[draft.reason,earlyReason?'Early-profit house exception: '+earlyReason:''].filter(Boolean).join(' · ')});}
  catch(error){draft.committed=false;$('#save-entry').disabled=false;$('#save-error').textContent=error.message||'Not saved. Keep this entry open.';return;}
  const returnView = draft.returnView;
  const next = kind === 'cashout' && !playing().length ? 'review' : kind === 'buy' || kind === 'reentry' ? 'table' : returnView;
  forceClose();
  view = next;
  await render();
  window.CashPremium?.committed(p?.id);
  notify(`${isPlatform?'Saved':'Sample'} ${['rake','rake-edit'].includes(kind) ? 'rake' : kind === 'cashout' ? 'cash-out' : kind === 'receive' || kind === 'payout' ? 'payment' : 'buy-in'} recorded · ${money(n)}`);
}

function forceClose() { $('#discard-sheet').close(); sheet.close(); draft = null; formDirty = false; window.CashBackupUI?.capture(); }

function close() {
  if (window.CashBackupUI?.state()?.saving) return;
  const moneyChanged = draft && !draft.committed && (draft.stage === 'review' || draft.amount !== draft.initial || draft.payment || draft.reason);
  if (!moneyChanged && !formDirty) return forceClose();
  if (!$('#discard-sheet').open) $('#discard-sheet').showModal();
}

document.addEventListener('change', e => {
  if (!draft && e.target.closest('#sheet') && e.target.matches('input,textarea,select') && e.target.id !== 'seat-search') formDirty = true;
  if (e.target.name === 'received' && draft) { draft.payment = e.target.value; updateAmount(); }
  if(['large-ack','call-override'].includes(e.target.id))updateReviewConfirmation();
});
function updateReviewConfirmation(){if(!draft||draft.stage!=='review')return;$('#save-entry').disabled=Boolean($('#large-ack')&&!$('#large-ack').checked)||Boolean(draft.callTimeWarning&&(!$('#call-override')?.checked||String($('#call-override-reason')?.value||'').trim().length<3))}
document.addEventListener('input', e => {
  if(e.target.id==='call-override-reason')updateReviewConfirmation();
  if (e.target.id === 'correction-reason' && draft) { draft.reason = e.target.value; updateAmount(); }
  if (!draft && e.target.closest('#sheet') && e.target.matches('input,textarea') && e.target.id !== 'seat-search') formDirty = true;
});
document.addEventListener('click', e => {
  const lossButton = e.target.closest('[data-loss]');
  if (lossButton) {
    if (lossButton.dataset.loss === 'discard') { if (!window.CashBackupUI?.state()?.saving) forceClose(); }
    else $('#discard-sheet').close();
    return;
  }
  const button = e.target.closest('[data-entry]');
  if (!button || !draft) return;
  if (button.dataset.entry === 'discard') forceClose();
  else drawEntry();
});

// Reject the whole edit: stripping letters could turn a bad paste into another amount.
const validAmountDraft = text => /^\d{0,9}(?:\.\d{0,2})?$/.test(text);
function amountInput(input) {
  if (!draft) return;
  if (!validAmountDraft(input.value)) {
    input.value = draft.amount;
    $('#amount-error').textContent = 'Use numbers and up to two decimal places only.';
    return;
  }
  draft.amount = input.value;
  updateAmount();
}
document.addEventListener('beforeinput', e => {
  if (e.target.id !== 'amount' || !draft || e.data === null || !e.inputType.startsWith('insert')) return;
  const input = e.target;
  const proposed = input.value.slice(0,input.selectionStart) + e.data + input.value.slice(input.selectionEnd);
  if (!validAmountDraft(proposed)) {
    e.preventDefault();
    $('#amount-error').textContent = 'Use numbers and up to two decimal places only.';
  }
});
