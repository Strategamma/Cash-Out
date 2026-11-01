# Cash Out — product and visual brief

## Goal and state
Build quickly: a private, phone-first poker accounting app for accurate buy-ins, cash-outs, history, and settlement. Offline-capable PWA is the preferred direction under discussion; no implementation has started. Native contacts support is dropped.

## Confirmed requirements
- Create private tables with no information leakage.
- Add players with name, optional phone number, and optional user-selected photo.
- Enter buy-in through a numeric keypad. Seat the player and show total buy-in and photo when available.
- Inline actions: edit buy-in, add money/rebuy, and cash out by entering total stack.
- Show each cashed-out player's profit/loss. Keep them visible and editable.
- Delete a player with confirmation.
- Reusable player cards: historic statistics, Add to table CTA, and delete action.
- Optional stakes setup for reference; all buy-ins, rebuys and cash-outs use cash only.
- Current table standings and end-of-table smart who-owes-whom calculator.
- Reminder for anyone not cashed out; exact reminder mechanism remains undecided.
- Well-structured downloadable CSV and durable table/player history for long-term reference.
- Essential backup/export and restoration, including history and photos. CSV alone is not a complete backup.
- Offline local use after app assets and relevant data download.
- Earlier requirements for Apple/Google cloud saving and sending information to others remain; provider integration and sharing behavior are undecided.
- One host edits each table. Other people receive shared summaries without editing access; multi-user editing is out of current scope.
- Rake appears as a special player-like card on the table. Add rake repeatedly throughout a session; retain each addition and show its running total. It is a typed rake account, not an ordinary player with a buy-in or poker statistics.
- Show accumulated rake without requiring a recipient. Distribution is handled outside the app. Keep rake visible as a separate allocation in results, CSV, and settlement; do not assign it to the banker or distribute it to players. If obligations cannot balance without a rake recipient, show the remaining rake allocation explicitly rather than inventing a recipient or claiming complete settlement.
- Phase one prioritizes robust, mistake-resistant data collection. Phase two adds an insights engine that accepts a valid saved CSV and generates insights, after sufficient data has been collected.

## Accepted accounting and recovery details
- **Settlement model:** banker custody is the default, but direct player-to-player settlement is also required. Suggest transfers that clear actual outstanding balances while reducing payment count; do not claim a mathematically minimum transfer count without proving it. Record actual payer, recipient, amount, and table for every payment. Support mixed banker/direct payments without double-counting, preserve completed transfers, and recalculate remaining obligations after corrections. Profit/loss alone is insufficient when money has already changed hands. Exact mode selection and unpaid buy-in rules remain open.
- **Balance checks:** recalculate after every confirmed financial event, including rake additions/corrections. Remaining expected stack value = total player buy-ins − recorded player cash-out stack values − accumulated rake. A positive remainder while players are active is not an error; their current stacks are unknown. Warn immediately if recorded cash-outs plus rake exceed buy-ins. Full check on last actual player's cash-out and End table: require explicit stack entry for everyone, including zero, then verify total buy-ins = total player cash-outs + rake. Show exact difference; block balanced closure/final settlement until resolved. Never silently adjust results. Rake does not need a fictitious player cash-out and must not be counted twice. Chip balance is separate from actual cash paid.
- **Audit history:** preserve each buy-in, rebuy, cash-out, correction, and recorded payment with transaction ID, timestamp, player ID, table ID, and a snapshot of table name/date/timezone/currency/stakes and relevant conversion settings. Preserve original entries; link corrections to the affected entry. Table renames or stakes changes must not rewrite historical transaction context.
- **Safe player removal:** archive players with financial history, preserving prior table and transaction records. Use a stable generated internal player ID. Optional, editable phone numbers are duplicate-search hints, not primary identity: shared/reassigned numbers and missing numbers must remain possible. Never automatically merge players by phone number.
- **Recovery:** autosave confirmed changes and support versioned full backup/export and validated restoration including history, transactions, and photos. Show save failures and last successful backup time. CSV remains an additional reporting format.
- **Rebuy shortcut:** persist each player's most recent confirmed buy-in/rebuy amount across tables. Each tap adds that amount to the editable draft: tapping a 500 shortcut twice adds 1,000. Repeated draft taps are intentional; repeated confirmation taps must not duplicate the committed transaction. Always show the final additional amount and resulting total buy-in before banker confirmation.
- **Live results:** show active players as Playing, with final profit/loss unknown until cash-out stack entry. Do not infer a loss from buy-in alone.
- **Recent tables:** each recent table opens saved results and settlement instructions, including unresolved items. Derive outstanding instructions from saved transactions/payment records; do not lose prior payments when correcting a table. Unbalanced tables show the issue instead of final instructions.

## Payment status placement — proposed, pending approval
Show a small payment summary on each seated player card (for example, Buy-ins: 500 paid / 200 due). In the buy-in/rebuy sheet, place a separate payment control below the amount. In the cash-out sheet show stack value and payout status separately. Record actual amounts paid so partial payments are possible; derive Paid / Part paid / Unpaid from those records. End-table review and recent-table detail show a settlement list with player, outstanding direction/amount, and Record payment action. Recording a cash-out must not silently imply the payout was made. Banker collection/payout instructions must account for payments already recorded rather than using profit/loss alone.

## Visual direction
- Local exports now unblock design: `visualizations/ui-kit/` contains all 105 SVGs from the supplied ZIPs, extracted foundation CSS/JSON, a geometry/filter inventory, and a measurement README. Use these local sources instead of waiting for Figma access. Font metadata, responsive layout, interaction variants, and usage terms remain unverified; static exports are not native Apple materials.
- Current reference: [user's duplicated kit](https://www.figma.com/design/pNeYPyWISvwz3XiJwsY9Ce/). This supersedes the original file for future work. Both create-session and root metadata reads still returned missing edit access. Account check confirmed the connected account has a View seat; this does not establish the precise cause of file-level denial. Verify matching account and Can edit access; do not assume the duplicate is accessible or inspected.
- Latest retry at node 5:2 returned missing edit access for both file session and metadata. No component contents were accessible.
- Required reference: [iOS 26 UI Kit — Liquid Glass Components](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=0-1). Inspect components, variants, and usage/license terms before adapting. Figma connection was retried: session and metadata calls both reported missing edit access. Component inspection remains blocked; use an editable duplicate or obtain editor access.
- User-selected component references in the same file: [5:29](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=5-29), [5:13](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=5-13), [7:4](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=7-4), [5:11](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=5-11), [5:2](https://www.figma.com/design/dF6SKuuLareSBPmjwPgoxu/?node-id=5-2). Retried file session and metadata at 5:29; both returned the same file-level edit-access error. Other selected nodes remain uninspected; do not infer their contents.
- Apple frosted-glass / Liquid Glass-inspired appearance, with dark and light themes.
- A PWA approximates the look through web styling; it does not use Apple's native Liquid Glass material.
- Phone-first spacing, comfortable touch targets, clear money hierarchy, and prominent numeric keypad.
- Proposed: glass navigation/toolbars/sheets with stable high-contrast surfaces for amounts and accounting details.
- Proposed: system/light/dark preference, reduced transparency/motion, scalable text, and explicit signs/labels alongside profit/loss colors.
- Proposed navigation: Tables / Players / History; Settings for appearance, backup, and restore.
- Proposed table screen: persistent summary, player cards, primary Add player action, and bottom sheets for buy-in/rebuy/cash-out entry.

## Recommended upgrades — proposals, not approved scope
2. **Track actual payments separately:** placement and support for credit/partial payments are proposed above; banker and direct settlement are required.
3. **Exact money:** select currency and smallest unit per table, use integer minor units or exact fixed precision, and accept money entries in cash only. Avoid floating-point money and silent rounding.
4. **Undo:** offer an explicit compensating correction while retaining the accepted audit history.
5. **Anonymization:** consider separately from the accepted archival requirement. Removing a seated player with transactions must explain and reconcile the effect.
6. **Speed up repeat games:** app-player search and reuse of a previous roster without copying transactions. Define how a cashed-out player returns to play. Rebuy draft shortcuts are confirmed above.
7. **Clear lifecycle:** Active → review → closed → settled. Corrections can reopen a table; recalculate outstanding settlement without forgetting transfers already paid.
8. **Additional privacy:** consider encrypted backups and optional app lock. Browser storage alone does not guarantee confidentiality or durability. Autosave and full recovery are confirmed above.
9. **Selective sharing:** preview exactly what is sent. Exclude phone numbers/photos from shared summaries by default. Keep private records out of URLs, public hosting assets, source repositories, and analytics.

## Proposed CSV structure
Provide player-summary and detailed-transaction CSVs. Summary: table ID/name/date/timezone/currency, player ID/name, total buy-in, cash-out value, profit/loss, cash-out status, and payment status. Transactions: transaction ID, table/player ID, timestamp, type, amount/currency, correction reference, and note. Use stable IDs, ISO timestamps, proper escaping, and spreadsheet-formula injection protection. Exclude personal contact fields by default. Mark unfinished results explicitly instead of exporting misleading zeros.

## Phase one — reliable data collection contract
- Use a versioned canonical transaction CSV as the phase-two input; readable summaries are separate exports. Freeze and document version-one columns before releasing data collection. Include dataset/schema version, unique event ID, table ID, participant/account ID and kind, participation ID, timestamp with timezone, event type, exact amount/unit, currency precision, table/stakes conversion snapshot, correction reference, and actual payment payer/payee where applicable. Include table completion/reconciliation state through explicit lifecycle records, so a CSV is self-contained for analysis.
- Persist each confirmed action atomically with an idempotency key; update visible totals only from committed records. Preserve draft inputs on save failure, show failure clearly, and support safe retry. Serialize writes and guard against stale simultaneous tabs.
- Validate finite, permitted-precision amounts and allowed event types. Buy-ins/rebuys must be positive; cash-out zero is explicit. Corrections use linked events rather than editing old financial records. Check table/account relationships and conversions. Never guess an invalid amount or silently round it.
- Every money entry clearly identifies table, player/rake account, action, unit, draft amount, and resulting total. Repeated shortcut taps modify the draft; one confirmation commits it. Add a review step for unusually large amounts with a threshold to be defined. Show a saved receipt with a correction action.
- Keep stable IDs across exports/restores and player renames. Do not identify people by name or phone alone. Record timestamps automatically and preserve correction history. Preserve rake events distinctly and exclude rake from player counts/statistics.
- Keep chip accounting and actual payments separate, including partial/direct/banker payments; payment completion is never inferred from cash-out entry alone.
- Backup/restore validation must cover schema version, IDs, references, totals, and photos. Preview restore conflicts; do not silently duplicate or overwrite records. Data migrations preserve old history. Surface missing/corrupt records instead of producing plausible totals.
- Verification before release: exact arithmetic and reconciliation with rake; rapid repeated confirms; storage failure/retry; interrupted saves; offline restart; corrections after payment; backup/export/import round-trip; duplicate IDs; mixed currency; and escaped CSV names that resemble spreadsheet formulas. Document the matching decoding rule so exports stay safe and round-trip losslessly.

## Phase two — CSV insights engine
- Import a canonical CSV exported by phase one and generate insights after validation. A valid file means supported schema, required columns/types, consistent IDs/references, valid corrections and event ordering, exact units, and internally consistent accounting—not merely parsable CSV. Validate safely within documented size limits.
- Provide a sample/template and import preview showing tables, players, dates, currencies, incomplete/unbalanced tables, and row-specific errors. Reject invalid files explicitly; never silently skip rows. Accept byte-equivalent repeated event IDs once; reject conflicting duplicates. Recognize missing referenced records and incomplete exports.
- Apply corrections once, deduplicate overlapping exports, and preserve recorded payments. Import for analysis must not mutate the live ledger. Report exclusions and data-quality warnings. Final performance aggregates use completed/reconciled records; incomplete tables remain visible separately. Settlement completion is a separate status.
- Proposed initial insights: sessions per player, total buy-ins/rebuys, net results, winning-session percentage, result trends, rake per table and over time, and outstanding payments. Do not combine currencies without an explicit conversion policy. Avoid skill/risk predictions or hourly rates without the necessary data. Exact metrics and charts will be selected in phase two.
- Prefer local analysis for privacy and offline operation; any server upload requires an explicit architecture/privacy decision. No external AI service is required to calculate these descriptive statistics.

## Decisions before implementation
- Single-host editing is confirmed; how should shared summaries be delivered (file, text, or private link)?
- Are all buy-ins paid upfront, or must credit/partial payments be supported? How should banker versus direct settlement be selected per table?
- Confirmed: INR only in v1, exact integer paise and up to two decimal places. Currency switching is deferred; stack entry is cash only.
- Confirmed: automatic cloud autosave/sync and recoverable cloud backup are required in v1, with minimal setup. Google Drive and iCloud support are required; minimize ongoing backend spend. Do not equate private CloudKit data with visible iCloud Drive files.
- Historical stats: suggested baseline is completed sessions, buy-ins, net result, and per-session results. Exclude unfinished sessions from final aggregates.
- Rake distribution is deliberately outside app scope and does not block closing a chip-balanced table. Distinguish external rake allocation from completed player payments.

## Proposed starting assumptions for wireframes and backend
Single-host editing and shared summaries are confirmed. V1 must combine local-first storage with automatic authenticated cloud saving, retry/recovery and versioned backups; manual export is an additional fallback. Use INR with integer paise and cash-only money entry; currency switching is deferred. Re-entry adds a participation segment while retaining earlier cash-outs. Include repeatable rake entries; use in-app unfinished-table reminders initially. Access control, encryption/key recovery, and authenticated sync must be designed if server-backed private sharing or backup is selected.

Wireframes should cover table creation, player selection/cards, buy-in/rebuy draft, cash-out, balance review, settlement/payments, recent-table details, and backup/restore in both themes. Model players, tables, participation segments, financial events, actual payments, corrections, and backup versions separately.

## Future verification
Check rebuys, zero-stack cash-outs, corrections, re-entry, duplicate names, unfinished players, imbalance, exact decimal conversions, and settlement conservation. Check airplane-mode reload, restart recovery, save failure, backup/restore round-trip, CSV opening, and narrow iPhone layouts in both themes. Verify on a real iPhone before claiming device readiness.

## V1 cloud-saving acceptance requirements
- User signs in once; confirmed changes save locally immediately and upload automatically when connectivity/authentication permit, without selecting files or tapping Backup each session.
- Distinguish Saved on this device, Syncing, Saved to cloud, Offline/pending and Action needed. Never display cloud success before server acknowledgement; expose last successful sync and backup times.
- Restore tables, players, photos, financial events and history after reinstall or device replacement using the same account. Pending photo uploads remain visible and retryable.
- Sync is not the whole backup solution: retain versioned recoverable snapshots so deletion or corruption cannot overwrite the only recovery copy. Retention/provider choice remains to be finalized.
- Queue offline writes with stable event IDs; retry without duplicate financial entries. Explicit revisions/conflict handling and a single-writer table policy must prevent silent financial overwrites across tabs/devices.
- Store only under the authenticated owner; verify access rules, account switching and sign-out isolation. Social sign-in does not itself grant iCloud/Google Drive access.
- Require first sign-in online. Offline work queues locally; no cloud upload can occur without connectivity. Do not promise continued uploads while an iPhone suspends/closes the PWA; retry on resume.
- Verify offline/reopen recovery, network interruption, expired sign-in, failed uploads, duplicate retry, owner isolation, conflict handling and restoring an older backup before release.
- Architecture proposal: static PWA + durable local ledger/outbox, direct Google Drive backups and private CloudKit backups. CloudKit JS requires an existing CloudKit app/container and enabled web services; Apple Developer Program enrollment normally costs USD 99/year. No-own-backend design is the target; provider quotas/authentication and real-iPhone feasibility need a focused integration spike before committing. These are integrations to build, not existing capabilities.

### iCloud integration boundary
- iCloud is required alongside Google Drive. Proposed UX offers a primary backup provider; do not silently assume both accounts must be connected or duplicate every upload to both.
- Apple’s supported web route is CloudKit JS accessing the app’s private CloudKit database, which counts against the user’s iCloud quota; it is not a general browser API for writing visible iCloud Drive folders.
- Validate Apple Developer membership, CloudKit app/container and web-service setup; then prove Safari/installed-PWA authorization, private asset/record upload, token renewal and restore on a real iPhone. Do not promise automatic background execution while suspended.
- Manual Save to Files/iCloud Drive export remains a fallback, not a substitute for the required automatic cloud saving.
- Cost distinction: no self-hosted backend is the goal; Apple’s normal annual developer membership means this is not a zero-total-cost solution. No enrollment or payment is authorized by these notes.
- References checked: https://developer.apple.com/documentation/cloudkitjs ; https://developer.apple.com/documentation/cloudkit/ckcontainer/privateclouddatabase ; https://developer.apple.com/programs/whats-included/ .

### Implemented backup foundation (prototype, not production release)
- Google Drive app-data-only permission approved; implemented in `src/backup/`, with opt-in IndexedDB autosave and settings integration. Exact OAuth scope: `https://www.googleapis.com/auth/drive.appdata`.
- Cloud connection awaits a Google Cloud Web OAuth client ID/authorized origin; setup guide in `docs/GOOGLE_DRIVE_SETUP.md`. No real provider connection or paid services were activated.
- Retention is explicitly confirmed by the user: latest ten snapshots per collection by default, or retain all. Older versions are deleted only after a newer upload succeeds. Existing collections remain after restore.
- This is recoverable snapshot backup, not completed multi-device synchronization or an immutable production ledger. iCloud remains required and unimplemented.
