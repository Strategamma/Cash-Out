# Cash Out

## Current state
PWA; native tooling removed. UI: `visualizations/wireframes/`; v2 ledger: `src/ledger/`. Empty workspace; awaited IndexedDB saves. Dependency-free Node 22+: `npm test` (110 checks), `npm run build`; Pages workflow. Google activation deferred until deployment; automatic iCloud unresolved. Recovery/install Settings: `web/boot.js`, `web/recovery.js`; explicit file receipts, storage/install/offline status. QA: `docs/QA_AUDIT.md`. Roadmap: `docs/ROADMAP.md`. Current changes unpublished. Setup: `docs/PLATFORM_SETUP.md`.

## Confirmed requirements
- iPhone-first, cross-platform; offline after app/data download.
- V1 requires Google Drive and iCloud automatic saving/backups with minimal setup. Provider integration/costs need validation.
- One host edits; others receive exported read-only summaries/receipts. No live shared tables.
- No native contacts. Saved players have a name, optional phone/photo. Banker selects a saved player or host; stable banker ID prevents self-payments.
- Private tables; searchable seating/status filters; reviewed numeric buy-in/rebuy/cash-out/correction; profit/loss; cashed-out seats stay editable; confirmed deletion.
- Player history; INR integer paise; optional stakes; missing-stack reminders; who-owes-whom settlement. Currency selection later.
- Glass UI; light/dark themes, subtle poker line art. Shared components and compact recovery rows.
- Per-player call times default 180 minutes; confirmed buy-in starts a clock, rebuys preserve it, re-entry restarts it. Settings affect future starts. Early-profit exit needs acknowledged reason; never a hard block. Saved elapsed timestamps, no tick writes; device time is not trusted server time.
- One-table tournaments: locked rules, fees separate from prizes, cash entries separate from chips, late/rebuy/add-on cutoffs, saved blind/break clock, tied eliminations and exact reviewed prizes. Entry contributions must be received before finalization; payouts remain separate. Tournament history/receipts stay out of cash statistics.
- Support banker custody and smart direct player-to-player settlement, including mixed actual payments. Reduce transfer count using outstanding balances; preserve completed payments. Credit, partial payments and selectable routing supported.
- Reconcile on last cash-out and End table. Flag missing stacks and exact imbalance; never finalize unbalanced settlement. Active stacks are unknown, not losses.
- Preserve transaction audit history including table details/settings snapshots and correction references. Archive players with history; stable internal IDs, optional phone as a duplicate hint only.
- Last-buy-in shortcuts add repeatedly to the draft; review final addition/resulting total. Prevent duplicate commits.
- History retains results and outstanding settlements.
- Autosave confirmed changes; full versioned backup/restore includes photos and history, with visible save failures/backup status.
- Rake: special table card, repeated additions/history, excluded from player stats. Reconcile buy-ins = player cash-outs + rake. Display total; distribution handled outside app. Keep rake separate in settlement.
- Phase one: robust data collection with exact validated amounts, atomic/idempotent writes, correction history, and versioned self-contained transaction CSV. Phase two: validate/import CSV and generate insights. Keep analysis separate from live records.

## Architecture constraints
- A PWA approximates Apple's glass appearance with web styling rather than native Liquid Glass.
- Keep records out of public assets/URLs.
- Offline changes stay local; browser data can be cleared/evicted. Keep independent recoverable backups.

## Detailed brief
`docs/FEATURE_EXPANSION.md`: accepted features. `visualizations/PRODUCT_BRIEF.md`: brief. UI safeguards: `visualizations/wireframes/README.md`. App motion/receipts: `premium.*`, `receipt.js`; profile: `profile.js`; clocks: `call-time*.js`; tournaments: `tournament*.js`. Design previews remain separate from actual app evidence.
