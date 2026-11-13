# Bug audit — 13 November 2026

Result: 66 automated tests pass; dependency-free build succeeds (33 public files). No assertion that all possible bugs are eliminated. No production data used or deployments performed.

## Fixed

- **Pending-save dismissal:** Escape could close an entry during an awaited save, clearing its draft before success/failure handling. Normal dismissal and discard now wait for the save to finish.
- **Financial seat removal:** A downward correction to zero could make a seat removable despite retained money/history. Removal now requires zero buy-in, shortcut, received/paid money, prior exits and no payment references.
- **Aborted device reads:** IndexedDB reads previously resolved at request success, before transaction completion, and had no transaction-abort handler. They now wait for completion and reject aborts.
- **Received-money overflow:** After a downward buy-in correction, a received rebuy could exceed the supported cumulative received amount and trigger a validation/save lock. The draft now rejects this before confirmation.
- **Capacity boundary:** Creating a 1,001st contact or seating a 101st player reached schema limits only during saving. UI now stops those actions first.
- **Photo-bearing audit cost:** Replay validation copied entire photo-bearing state and table contents unnecessarily for every transaction. Validators now use the existing state, with only table metadata copied for context. Replay and intermediate-state validation remain intact. A 200-entry/1 MB-photo probe measured ~1,486 ms before; the 203-entry regression measured ~448 ms afterward on this Mac. Device performance will differ.

## Coverage and evidence

| Area | Evidence |
| --- | --- |
| Exact cash entry | Automated negative/letter/exponent/precision/bounds cases; browser rejected letters, retained numeric draft and required review. |
| Rebuys and receipts | Browser tapped prior-buy shortcut twice, reviewed ₹1,000 additional / ₹1,500 total, recorded unpaid, and recovered that total after reload. |
| Cash-outs/reconciliation | Zero versus missing stacks, re-entry, prior exits and repeated rake automated. Browser showed ₹100 over-allocation warning with disabled confirmation; corrected stack balanced before closing. |
| Payments | 3,000 deterministic randomized cases (1–15 players, partial/mixed payments and optional seated banker), each through banker and direct modes: all transfers positive, no self-payment, all balances settle exactly. Browser recorded ₹500, showed zero remaining, then reversed with reason and restored ₹500 due. |
| Correction/audit integrity | Reasons/references, duplicate operation IDs, altered totals, invalid intermediate state, reordered/duplicate entries, path injection and long photo-bearing replay checked. |
| Roster/history/stats | Seeded ten balanced nine-seat tables covering 15 players; archive/history validation, averages/extrema/trend and unfinished-table exclusion checked. Browser created another table, retained the previous unpaid table and displayed calculated player statistics. |
| Device saves | Awaited acknowledgement, reload, write/quota failure simulation, stale writer, pending dismissal and aborted reads checked. Actual quota exhaustion not induced. |
| Backup/CSV | JSON round trip, legacy validation, unsupported/corrupt data, correction export and spreadsheet formula escaping checked. File picker and actual Files/iCloud restore were not exercised this turn. |
| Cloud adapter | Mocked app-data pagination, upload acknowledgement, retries, retention, expiry/revocation/storage full, account switching, late completions and restore failure. No live Google connection. |
| PWA | Asset graph, subpath/cache scope, failed install cleanup, safe updates, install/protection denial and reminder states checked. Fresh built app reloaded successfully with its temporary HTTP server stopped. This tests server independence, not airplane-mode hardware behavior. |
| UI | Fresh Settings at 320×568: viewport/content both 320px. Existing populated desktop profile inspected. No warning/error console entries in either QA tab. Pending-save/capacity behavior also tested with DOM stubs. |

Browser functional session used the earlier cached build; fresh-build startup, Settings/layout and server-independent reload used a separate origin. Changed logic has targeted regression tests. Screenshot: `../visualizations/wireframes/screenshots/qa-player-history.png`.

## Still required before release

- Hosted HTTPS smoke test, live Google OAuth/upload/restore and automatic iCloud decision/implementation.
- Real iPhone Safari and Android Chrome install, numeric keyboard, image/file pickers, saved-file recovery, quit/reopen, airplane-mode cold launch and app update.
- Large real multi-table/photo datasets on phones. Automated stress is synthetic and does not establish years of acceptable device performance.
- Historical financial amounts are read-only once moved into past tables; payment reversal remains supported. Decide whether full historical financial editing is required before release.
- CSV insight import remains phase two. Cloud snapshots are backups, not live multi-device conflict merging.
