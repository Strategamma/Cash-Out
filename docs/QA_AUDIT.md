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

## App polish integration — 20 Nov 2026

88 tests pass; `npm run build` packages 42 public files with a content-hashed offline shell. New tests cover receipt arithmetic/privacy/identity and stale export cancellation, presentation cancellation/reduced motion, and the pending-button review/save regression (duplicate lock and failed-write retry retained). Browser used isolated localhost origins, created real records via UI, confirmed buy-in survival after reload, then tested cash-out reconciliation, profile/keyboard tabs, rapid filters, Settings and a real PNG receipt download. Responsive checks at 320/375/1280px and both themes found no horizontal overflow or console warnings/errors. Shared library keyboard tabs checked. Screenshots: `visualizations/wireframes/screenshots/app-connected-{dark,light}.png`. These checks do not prove GitHub deployment, Google/iCloud configuration, native share targets or physical iPhone behavior.

## 20 November — clocks and tournaments

110 automated tests pass; dependency-free public build contains 48 files. New checks cover independent 3-hour clocks, late joins, re-entry, unknown/backward clock state, early-profit warning, immutable periods and ledger replay. Tournament tests cover fees versus chips/prizes, entry idempotency, deadlines, paused/break/recovered clocks, grouped ties and exact paise allocation, unpaid entry guards, malformed restores, elimination corrections, phase validation and full ledger replay.

Browser used only `?backupTest=1`: saved a 3-player tournament with ₹3,000 pool/₹300 fees, reloaded its running clock, tied two eliminations, blocked finalization until a ₹1,100 contribution was recorded, then retained ₹3,000 unpaid prizes. A losing player’s receipt correctly showed −₹350 result and ₹750 still to receive. Starting a cash table archived the tournament without changing its payments. Cash clock retained 180 minutes after table minimum changed to zero; the later player was eligible immediately. Early-profit exception alone did not bypass a separate imbalance acknowledgement. Explicit ₹1,001/₹999 stacks balanced ₹2,000 before closing. History filters/details checked at 320px; desktop checks at 1280px. Google, iCloud, phone file/share sheets and physical PWA installation remain unverified.

Fixed during this pass: new buy-ins resolving a negative balance previously showed the old imbalance warning. Review now includes the incoming buy-in; regression test covers it. Timers depend on device wall time across app closures; observed drift/backward time is flagged, but offline tamper-proof time is not claimed.

Public host check, 20 November: `https://strategamma.github.io/Cash-Out/` returned HTTP 200 and redirected in HTML to the app; the new tournament module returned 404. Existing hosting is reachable, but current changes have not been published. Packaging now includes both theme-specific symbol assets referenced by the runtime component library; the asset check covers static runtime image references as well as HTML/CSS.

Final responsive check: tournament prize cells now override the shared flex-row percentage cap. At 320px, all three rendered prizes are one line (18px high), content width equals viewport width, and historical receipt actions remain available. Component library at 320px has zero missing images and no warning/error console entries, including after switching themes. User app returned to its separate production database; disposable QA data was not copied into it.

## 21 November — approved first-run flow

116 automated checks pass, including six new contact-flow/identity checks: audited backup round trip, one optional self identity, save-only versus explicit seating, awaited-save/failure behavior, restored-object edits, active banker names and preserved closed snapshots. Targeted tests passed again after the empty-history destination fix; the public build contains 48 files.

Browser QA used a fresh origin (127.0.0.1:9193) with backupTest=1. Empty-name submit focused the field and exposed its error; name-only My contact saved, survived reload and defaulted banker selection without an extra name field. Creating a table added no seat. Creating a contact through Add player opened a separate buy-in review; cancelling retained the contact and left zero seats. Standalone contact save returned to contacts. Editing My contact updated the linked active banker name. Empty History returns to the named empty table. Dark/light narrow-phone views (320px), production home (390px), and component catalogue rendered without observed console warnings/errors. Saved-card avatar was explicitly measured at 42px after fixing a fit-content override.

User-origin records were not populated with QA data; its offline shell was refreshed without clearing storage. Screenshot: visualizations/wireframes/screenshots/first-run-home.png. These checks do not verify cloud setup, deployment or physical-phone behavior.

First-run visual fidelity pass: compared the approved saved-contact screen against the app. Removed the generic context row from empty/success views, restored approved SVG fills and typography, styled the saved contact and optional photo selector, and reduced overlapping page transition movement. All 116 checks pass; 48-file build passes. Browser verified the edited contact save path and 27px heading, 52px CTAs, no horizontal overflow at 320/390px, and both themes without console warnings/errors on the isolated QA origin. Screenshot: visualizations/wireframes/screenshots/first-run-saved-refined.png. Existing records and cloud configuration were unchanged.
