# Cash Out

## Current state
UI: `visualizations/wireframes/`; replay-validated v2 ledger: `src/ledger/`. Empty built workspace; awaited IndexedDB saves; seeded preview separate. Capacitor 8 Android/iOS projects, native export share sheet, 57 tests. `npm ci`, `npm run native:sync`; native/Pages workflows. Local SDK/Xcode/auth unavailable; publishing/native compilation pending. User has no Apple membership/Xcode: iPhone uses free PWA. Cloud deferred; iCloud unbuilt. Guides: `docs/MOBILE.md`, `docs/PLATFORM_SETUP.md`.

## Confirmed requirements
- iPhone-first, cross-platform; offline after app/data download.
- V1 requires Google Drive and iCloud automatic saving/backups with minimal setup. Provider integration and Apple membership cost need validation.
- One host edits; others receive read-only summaries of results and remaining payments. Delivery method undecided.
- No native contacts. Saved players have a name, optional phone/photo. Banker selects a saved player or host; stable banker ID prevents self-payments.
- Private tables; searchable seating; all/playing/cashed/outstanding filters; keypad buy-in entry; player cards showing total buy-in; inline edit/rebuy/cash-out; profit/loss; cashed-out players remain editable; confirmed deletion.
- Reusable player cards with history and Add to table; INR-only numeric cash entry (paise); currency switching later; optional stakes; current standings; unfinished cash-out reminders; final who-owes-whom calculation.
- Glass UI; light/dark themes, subtle poker line art.
- Emphasis: blue buy-ins, amber owed, green settled; adapted shadcn motion with reduced-motion support.
- Support banker custody and smart direct player-to-player settlement, including mixed actual payments. Reduce transfer count using outstanding balances; preserve completed payments. Upfront-only versus credit/partial payments and mode selection remain undecided.
- Recompute chip totals after confirmed edits; full reconciliation on last cash-out and End table. Flag missing cash-outs and exact imbalance; do not finalize unbalanced settlement. Active stacks are unknown, not losses.
- Preserve transaction audit history including table details/settings snapshots and correction references. Archive players with history; stable internal IDs, optional phone as a duplicate hint only.
- Persist last confirmed buy-in/rebuy per player. Each shortcut tap adds again to draft; banker sees final additional amount and resulting total before confirmation. Prevent duplicate committed submissions.
- Recent tables expose saved results and settlement instructions with outstanding issues/payments.
- Autosave confirmed changes; full versioned backup/restore includes photos and history, with visible save failures/backup status.
- Rake: special table card, repeated additions/history, excluded from player stats. Reconcile buy-ins = player cash-outs + rake. Display total; distribution handled outside app. Keep rake separate in settlement.
- Phase one: robust data collection with exact validated amounts, atomic/idempotent writes, correction history, and versioned self-contained transaction CSV. Phase two: validate/import CSV and generate insights. Keep analysis separate from live records.

## Architecture constraints
- A PWA approximates Apple's glass appearance with web styling rather than native Liquid Glass.
- Design source: 105 SVGs in `visualizations/ui-kit/`, extracted CSS/JSON tokens. Figma unnecessary; typography/layout/license remain unverified.
- Keep records out of public assets/URLs.
- Offline changes cannot reach other devices or cloud backups until connectivity returns. Local browser storage can be cleared or evicted, so it must not be the only recoverable copy of important data.

## Detailed brief
`visualizations/PRODUCT_BRIEF.md`: requirements. `visualizations/wireframes/README.md`: UI/safeguards; `QA.md`: preview evidence/limits. Built app autosaves by default.
