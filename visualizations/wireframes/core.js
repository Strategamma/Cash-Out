/* Exact arithmetic and validation shared by the preview and its targeted checks. */
(function (root) {
  const MAX_AMOUNT = 99999999999;
  const integer = n => Number.isSafeInteger(n) && n >= 0 && n <= MAX_AMOUNT;

  function parseAmount(text) {
    if (typeof text !== 'string' || !/^\d{1,9}(?:\.\d{0,2})?$/.test(text)) return null;
    const [whole, decimal = ''] = text.split('.');
    const amount = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
    return integer(amount) ? amount : null;
  }

  function inputValue(text, unit, bigBlind) {
    const amount = parseAmount(text);
    if (amount === null) return null;
    const value = unit === 'bb' ? amount * bigBlind : amount;
    return integer(value) ? value : null;
  }

  function balance(table) {
    const buy = table.players.reduce((sum, p) => sum + p.buy, 0);
    const out = table.players.reduce((sum, p) => sum + (p.out ?? p.priorOut ?? 0), 0);
    const pending = table.players.filter(p => p.out === null);
    const difference = buy - out - table.rake;
    return { buy, out, pending, difference, balanced: table.players.length > 0 && pending.length === 0 && difference === 0 };
  }

  function obligations(table, payments, recent = false) {
    return table.players.filter(p => p.id !== table.bankerId).map(p => {
      let net = p.buy - p.paidIn - ((p.out ?? p.priorOut ?? 0) - p.paidOut);
      for (const payment of payments.filter(x => x.recent === recent)) {
        if (payment.from === p.id) net -= payment.amount;
        if (payment.to === p.id) net += payment.amount;
      }
      return { id: p.id, name: p.name, net };
    }).filter(p => p.net !== 0);
  }

  function canRemoveSeat(player, payments) {
    return Boolean(player) && player.out === null &&
      [player.buy, player.last, player.paidIn, player.paidOut, player.priorOut || 0].every(n => n === 0) &&
      !payments.some(pay => pay.from === player.id || pay.to === player.id);
  }

  function filterPlayers(table, payments, filter = 'all') {
    const outstanding = new Set(obligations(table, payments).map(p => p.id));
    return table.players.filter(p => filter === 'playing' ? p.out === null : filter === 'cashed' ? p.out !== null : filter === 'outstanding' ? outstanding.has(p.id) : true);
  }

  function suggestTransfers(rows, mode, bankerName = 'Banker') {
    if (mode === 'banker') return rows.map(p => ({
      from: p.net > 0 ? p.id : 'bank', to: p.net > 0 ? 'bank' : p.id,
      amount: Math.abs(p.net), label: p.net > 0 ? `${p.name} → ${bankerName}` : `${bankerName} → ${p.name}`
    }));
    const debtors = rows.filter(p => p.net > 0).map(p => ({ ...p })).sort((a, b) => b.net - a.net || a.id - b.id);
    const creditors = rows.filter(p => p.net < 0).map(p => ({ ...p, net: -p.net })).sort((a, b) => b.net - a.net || a.id - b.id);
    const result = [];
    for (const from of debtors) for (const to of creditors) {
      const amount = Math.min(from.net, to.net);
      if (!amount) continue;
      result.push({ from: from.id, to: to.id, amount, label: `${from.name} → ${to.name}` });
      from.net -= amount;
      to.net -= amount;
    }
    for (const p of debtors.filter(p => p.net)) result.push({ from: p.id, to: 'bank', amount: p.net, label: `${p.name} → ${bankerName}` });
    for (const p of creditors.filter(p => p.net)) result.push({ from: 'bank', to: p.id, amount: p.net, label: `${bankerName} → ${p.name}` });
    return result;
  }

  function summaryModel(table, payments) {
    const totals = balance(table);
    return {
      name: table.name, banker: table.banker, rake: table.rake,
      totals: {buy:totals.buy,out:totals.out,difference:totals.difference,balanced:totals.balanced,pending:totals.pending.length},
      players: table.players.map(p=>({name:p.name,buy:p.buy,out:p.out,net:p.out===null?null:p.out-p.buy})),
      transfers: totals.balanced ? suggestTransfers(obligations(table,payments),table.mode,table.banker==='You'?'Banker (you)':`Banker (${table.banker})`) : []
    };
  }

  function validateBackup(data) {
    const fail = reason => { throw new Error(reason); };
    const text = (s, length = 80) => typeof s === 'string' && s.trim().length > 0 && s.length <= length;
    if (!data || data.demo !== true || data.version !== 1) fail('Choose a version 1 Cash Out demo backup.');
    const t = data.table;
    if (!t || !text(t.name) || !text(t.banker) || !['banker', 'direct'].includes(t.mode) || typeof t.closed !== 'boolean') fail('Invalid table details.');
    if (![t.small, t.big].every(n => Number.isSafeInteger(n) && n > 0 && n <= 100000) || t.small > t.big || !integer(t.rake)) fail('Invalid stakes or rake.');
    if (!Array.isArray(t.players) || t.players.length > 100 || !Array.isArray(data.contacts) || data.contacts.length > 1000 || !Array.isArray(data.payments) || data.payments.length > 10000 || !Array.isArray(t.events) || t.events.length > 10000) fail('Missing or oversized record collections.');
    const validPlayer = p => p && Number.isSafeInteger(p.id) && p.id > 0 && text(p.name, 60) && (p.phone === undefined || typeof p.phone === 'string' && p.phone.length <= 60) && (!p.photo || typeof p.photo === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(p.photo) && p.photo.length <= 4100000);
    for (const list of [t.players, data.contacts]) {
      if (new Set(list.map(p => p?.id)).size !== list.length || list.some(p => !validPlayer(p))) fail('Duplicate player IDs or invalid player details.');
    }
    if (t.players.some(p => ![p.buy, p.last, p.paidIn, p.paidOut].every(integer) || !(p.out === null || integer(p.out)) || p.priorOut !== undefined && (!integer(p.priorOut) || p.out !== null && p.out < p.priorOut) || p.out === null && p.paidOut > 0 && !(p.priorOut > 0))) fail('Invalid buy-in, stack, or payment amounts.');
    if (data.contacts.some(p => !integer(p.last))) fail('Invalid saved shortcut amount.');
    if (t.players.some(p => !data.contacts.some(c => c.id === p.id))) fail('A seated player is missing from the roster.');
    if (t.bankerId !== undefined && !data.contacts.some(p=>p.id===t.bankerId)) fail('Unknown banker contact.');
    const recentIds = new Set([21, 22, 23, 24]);
    const paymentIds = data.payments.filter(p => p?.id !== undefined).map(p => p.id);
    if (paymentIds.some(id => !text(id,100)) || new Set(paymentIds).size !== paymentIds.length) fail('Duplicate or invalid payment IDs.');
    for (const pay of data.payments) {
      if (!pay || typeof pay !== 'object') fail('Invalid payment record.');
      const ids = pay.recent ? recentIds : new Set(t.players.map(p => p.id));
      if (!pay || typeof pay.recent !== 'boolean' || !integer(pay.amount) || pay.amount === 0 || pay.from === pay.to || ![pay.from, pay.to].every(id => id === 'bank' || ids.has(id))) fail('Invalid payment or unknown payer/recipient.');
      if (pay.reverses) {
        const original = data.payments.find(p => p.id === pay.reverses);
        if (!original || original.reverses || !original.reversed || pay.from !== original.to || pay.to !== original.from || pay.amount !== original.amount || pay.recent !== original.recent || !text(pay.reason,160) || data.payments.filter(p=>p.reverses===pay.reverses).length !== 1) fail('Invalid payment correction.');
      }
      if (pay.reversed && (!pay.id || !data.payments.some(p=>p.reverses===pay.id))) fail('Missing payment reversal.');
    }
    if (t.events.some(e => !e || !text(e.title, 200) || !text(e.detail, 1000))) fail('Invalid activity history.');
    if (t.closed && !balance(t).balanced) fail('A closed table must have complete, balanced stacks.');
    return data;
  }

  const api = { MAX_AMOUNT, integer, parseAmount, inputValue, balance, obligations, canRemoveSeat, filterPlayers, suggestTransfers, summaryModel, validateBackup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CashCore = api;
})(typeof window === 'undefined' ? {} : window);
