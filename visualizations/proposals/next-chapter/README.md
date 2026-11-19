# Cash Out — two complete directions

15 November 2026. Standalone design prototype; production app, storage/ledger, build and cloud code are unchanged. Use the top review bar to switch **01 Clubhouse / 02 Scorebook**, change appearance, or open **All screens**. Both directions expose the same 48 deep-linked screens/states. Query `?direction=club` or `?direction=paper` selects the visual direction; hashes select a page.

## Feature coverage

- Home: create cash table, start single-table tournament, current cash game, recent tables, tournament shortcut and backup status.
- Cash table: compact sticky totals, searchable cards, counted filters, independent call clocks beside names, late joiners, 3h default, unknown live profit, rebuy/re-entry, cash stack including zero, inline correction, payments, repeated rake and activity.
- Money: numeric cash keypad and additive shortcuts; received/unpaid choice; amount/player/table review; amount-specific final button; early-profit warning with explicit house exception; close only with every stack and exact rake reconciliation. Stack entry does not imply payout.
- Players: search, seat existing player, new/edit saved contact with optional phone/photo, archive retaining history, profile, conditional win/loss/average metrics, cumulative chart and sessions.
- History: ten past cash tables, completed results, outstanding settlements, receipt access and export paths.
- Settlement: banker/direct choices, remaining payments, partial payment entry, corrections/reversal reasons, and who pays whom.
- Receipts: branded paper receipt, buy-in chronology, poker profit/loss separate from receive/pay/settled balances; player-only sharing preview excludes contacts/photos.
- Tournament: single table, setup/rule review, blind/ante/break schedule, persistent-clock design, seats/entries/rebuys/add-ons and registration cutoffs, reviewed elimination, exact prize pool/fees and prizes separate from payments; final standings and sharing.
- Insights: illustrated saved-data charts and source values/sample sizes; CSV import/validation design is phase 2. Does not imply a production insights engine.
- Recovery: local versus cloud status, restricted Google app-data permission, iCloud file path with automatic integration explicitly unresolved, full backup/restore review, independent backup reminder, install/offline and privacy.
- States: rake entry/review, share review, pending/error/successful save and empty table; reusable component route.

## Design boundaries

Existing master interactions are retained and composed into the new system. Source fixtures are illustrative; money is in INR cash, not big-blind stack entry. No real money, cloud upload or persistence occurs. Individual receipt PNG downloads are real local files; supported browsers can open native file sharing after review. Exported fixtures are explicitly marked as sample data. Some secondary service actions show their review/handoff copy rather than invoking a provider. Pending/error/success routes are deliberate design states accessible through the review map, outside the product UI.

The table/home data and historical receipt data represent different sessions. Historical analytics remain illustrative, not generated from an actual imported CSV. This is not a production implementation of all 48 screens.

## Sources

See [REFERENCES.md](REFERENCES.md) for dated 2025–2026 websites and native motion guidance. The interaction model and foundation CSS originate from the project’s master wireframes; no upstream component runtime is copied into this proposal.

## Verification — 15 November 2026

`node visualizations/proposals/next-chapter/verify.cjs` passes: 48 routes, local assets, cash draft validation, independent call clocks, receipt identity, duplicate confirmation lock and three motion paths. Browser checks covered both directions at 320px/375px and desktop sizes, additive rebuy review, early-profit override, receipt/share identity, tournament rule review, level-one reset and the scheduled break. Seven key routes per direction fit 320px without horizontal overflow.

The in-app browser lacks native View Transitions; its immediate/fade fallback was checked visually, while API-present and reduced-motion behavior were checked with mocks. Screenshots: `clubhouse-home.png`, `scorebook-home.png`, `clubhouse-table.png`, `scorebook-tournament.png`. No production provider, persistence, device-install or deployment acceptance is implied.

## Detail revision — 17 November 2026

Settings uses an illustrated local/cloud status panel and grouped recovery rows; history has an in-place, counted cash/tournament selector. Insights has a dated bar inspector with keyboard and touch slider access, a semantic exact-value source table, and a reusable player card with fixture-derived net result, winning-session count and trend. These same primitives appear in Components in both directions.

Replay reveal in the external review toolbar uses the unchanged transitions.dev generation runtime, on demand only. It awaits fonts/image layout and cancels when navigation or direction/theme changes remove the target. It represents a design reveal, not AI processing or real data generation. Source and license: `vendor/generation/PROVENANCE.md`.

Checks: all 48 routes/assets and previous draft/receipt/motion guards pass; added checks cover history branches, source total ₹9,20,000 and player metrics +₹12,400 / 6 winning sessions. Browser checks covered 16 combinations (Settings, History, Insights, Components × both directions × 320px/1280px) without overflow or missing images. Inspected 375px layouts, source disclosure, click/End-key chart inspection, history selection, reveal completion and cancellation. No warning/error logs were observed in the checked reveal flow. Reduced-motion handling is preserved in the unchanged vendor runtime; OS reduced-motion behavior was not physically tested. Production code remains unchanged.

## Glass & continuity revision — 19 November 2026

`glass-motion.css` / `glass-motion.js` add iOS-style frosted surfaces in both directions, static green light fields, reflective edges, solid money-entry fields and paper receipts. The material falls back to a solid fill without backdrop support; reduced-transparency and forced-colors preferences have explicit styles. No dependency was added.

Navigation links survive route changes so a measured highlight can slide between them. Settings clears the primary-section highlight. History retains its selector, state and focus while replacing only results; the first four result cards enter with a short capped stagger. New runs cancel prior decorative entrances. Chart values/heights never animate; active-bar lighting changes. Hover movement applies only to nonfinancial surfaces on precise pointers. The component showcase uses the same shared materials and controls.

Verification: `node visualizations/proposals/next-chapter/verify.cjs` passes 48 routes/assets and accounting/draft/receipt checks; `node visualizations/proposals/next-chapter/motion-check.cjs` passes persistent-nav DOM, stale selection, stagger cap, cancellation and reduced-motion checks. Browser checks covered 24 combinations of Home/Table/History/Settings/Insights/Components × Clubhouse/Scorebook × 320px/1280px without horizontal overflow. Also inspected Scorebook light/dark, chart tap/End-key inspection, focus retained on history selection, settings highlight clearing, frosted computed styles and opaque cash input. OS reduced-motion/transparency preferences and physical iPhone rendering remain unverified. Production PWA/ledger/cloud code is unchanged.

## Running-table card hierarchy — 19 November 2026

`card-layout.css` and the shared `playerCard()` now separate identity/call clock, play status, buy-in/stack, finalized poker result, payment strip and actions. Playing cards expose Add money / Cash out; closed cards expose View receipt / Edit stack. Manage retains reasoned correction, re-entry and actual received/payout detail. The whole card is not clickable; profile navigation and financial actions have independent controls. Zero stacks remain finalized losses, never “In play.”

The running-table heading and summary are more compact, four filters fit one row with counts, and filter changes retain keyboard focus. All four fixture player states appear in Components. Cards use inline-size container queries with a readable base layout. Shared View Transition cancellation also consumes `ready` / `updateCallbackDone` promise rejections; rapid cancellation remains covered by motion checks.

Verification: 48-route/safeguard and focused motion checks pass. Added card assertions cover active unknown result, unpaid buy-in, payout due, settled loss, zero-stack loss and escaped long-name markup. Browser checks covered Table + Components in both directions at 320px/375px/1280px (12 settled combinations), no horizontal overflow and measured profile/action targets at least 44px tall. Search, cashed-out filter focus, Manage expansion and Sam’s current receipt identity/amounts were checked. Physical iPhone, OS accessibility settings and long-name visual testing remain pending. Native transition cancellation can appear in browser diagnostics during rapid route changes; accounting and action paths are unchanged. Production app untouched.

## Stone light theme and receipt export — 19 November 2026
Light Clubhouse uses muted sage/stone surfaces; Scorebook uses warmer stone. Existing semantic color tokens and solid/low-transparency fallbacks remain. Dark palettes are preserved.

`receiptModel()` and `receiptDocument()` share the visible receipt and export data. `receipt-export.js` generates a local branded PNG with transaction rows, cash-out/result and actual payment balance, plus sample-data labeling. Active results remain unknown and balances provisional. Native file sharing is capability-checked and prebuilt before the user tap; cancellation/errors retain download access. No phone/photo or other player results enter the model. Table/tournament sharing remains a design handoff.

Verification: 48-route checks, motion checks and `node visualizations/proposals/next-chapter/receipt-check.cjs` pass. Receipt assertions cover loss-with-payout, loss-with-debt, settled loss and active provisional balance. PNG downloaded and visually inspected after fixing mixed-size text baselines. Mock checks cover stale identity, unsupported file sharing, cancellation and denial. Browser layout: Settings both directions at 320/375/1280 (6 combinations), Receipt both directions/themes at 320/1280 (8); no horizontal overflow. Native share capability reported available, but no recipient was selected and physical iPhone sharing/printing remain unverified. Production ledger/PWA unchanged.

## Compact roster and banker details — 19 November 2026
Player cards now combine closed buy-in/stack/result in one row; play status and individual call time align right. Payment balances stay separate. More sits beside the two primary actions and expands native details for corrections and recorded payments. Receipt Share/Save PNG actions share one row; the top Table link supplies return navigation.

Create table and Table settings share a banker fieldset: select saved player or enter another name; full name required, phone optional and excluded from receipts/PNG. Current receipts use the chosen banker in metadata and payment direction, and require missing details before export. A banker’s own receipt shows an internal balance without self-transfer. Historical fixtures do not invent missing names. Running-table creation is blocked inline with existing-table context and Return/Review actions; financial data cannot be replaced.

Verification: 48-route/accounting checks, receipt/export recovery tests and motion checks pass. Additional assertions cover blocked setup, banker escaping/private-phone exclusion, missing-name export and self-transfer prevention. Browser checked saved-player selection/save and named receipt direction, inline current-table guard, native More expansion, and both directions at 320/375/517/1280 (8 combinations), with no horizontal overflow and all card action/profile/disclosure targets at least 44px. Closed cards reduced from 408px to about 230px at the same 517px viewport. Production unchanged; physical iPhone and deployment not verified.

## Compact management and cash-out confirmation — 19 November 2026
Expanded More keeps its summary beside primary actions instead of creating a new full-width row. Correction/re-entry actions and received/payout metrics are paired; one short note retains the accounting distinction. App settings remains global; the running table uses a labeled Table setup link with a table icon.

Cash-out review combines identity, call-time state, cash stack and buy-in/result metrics in one card. It retains zero-stack wording, previous cash-outs on re-entry, separate-payout notice, 48px Record/Edit actions and the existing early-profit dialog/override. No ledger/commit behavior changed.

Verification: 48-route/safeguard, motion and receipt-export checks pass. Added assertions cover compact markup, settings distinction, zero-stack loss, early-profit dialog, acknowledged exception and re-entry result. Browser checked confirmation and expanded management in both directions at 320/375/517/1280 (16 combinations), no horizontal overflow, aligned More/action rows and 44px management targets. Confirmation screen fell from 738px to 465px at 517×703; Record action sits above navigation. Expanded panel measures 145–160px. Screenshots: `cashout-review-compact.png`, `manage-panel-compact.png`. Physical iPhone/deployment remain unverified; production code unchanged.
