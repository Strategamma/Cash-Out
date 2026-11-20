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

## Continuous corners — 19 November 2026
Audit/implementation: player, history and summary cards; live/recovery/insight/tournament panels; confirmation cards/dialogs; rectangular buttons/fields/keypad wells; inset notices/payment states and rectangular selection highlights. Larger surface radii and tighter inset/control radii share `corners.css`; Scorebook retains a more restrained scale. Library includes Surface/Control/Inset samples. Circles, capsule controls and receipt paper are excluded.

Uses native `corner-shape: squircle` as a G2-style visual treatment under `@supports`; existing circular-arc rounded corners remain on unsupported browsers. This is a web approximation, not a claim of native Apple geometry or measured CAD continuity. Reflective edge pseudo-elements inherit corner shape; no clip masks, new overflow, dependencies or corner animations.

Verification: 48-route and motion checks pass. Browser reports native support, `superellipse(2)` on cards/buttons/fields and 20px Scorebook / 24px Clubhouse surface radii; avatar/capsule stay `superellipse(1)`, paper receipt stays radius 0 with tear clip, glass highlight matches host and open dialog uses 28px squircle corners. Table layouts at 320/1280 in both directions have no horizontal overflow and retain 44px actions. Expanded management remains usable at 517px. Original test-entry tab was preserved; fresh preview used for QA. Physical iPhone and unsupported-browser rendering remain unverified; production unchanged.

API reference: [MDN corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape).

## Task-first hierarchy · 19 November 2026

Home leads with the active table, actual banker or missing-details state, exact buy-ins and Resume. Creation and recent games follow; inactive/empty Home retains illustration. Available players precede a collapsed seated group; search matches names and normalized phone digits. New player stays beside search.

Cash entry uses native decimal keyboard plus optional expandable keypad, additive shortcuts and explicit received/due radios. Compact review shows identity, amount, previous/new total, payment state and call-time behavior. No shortcut commits a transaction. Closing leads with named missing stacks; unaccounted amounts are provisional until every stack is entered. Exact balance/zero-stack gates remain. Settlement prioritizes the outstanding transfer and Record Payment; rake and actual payment records remain separate. Tournament Live leads with clock/blinds and Pause/Resume rather than promotional artwork.

`task-flow.css` shares both directions and loads before continuous-corner rules. The shared `resumeTableCard()` is also in Components. Magic Card-inspired pointer light adapts the pattern without React/shadcn dependencies; fine-pointer only, static with reduced motion/touch, no animated money. Existing screen transitions remain.

Verification: 48-route/assets and targeted task-state tests; motion/pointer guards; receipt export/share tests. Browser checked seven task routes in both directions at 320px, six routes including Components in both directions at 1280px, and phone visuals at 375px. No horizontal overflow in these checks; no captured console errors. At 320px, Resume/Review Amount/Record Payment/Resume Clock are in the first view. Browser exercised additive draft taps, received/due selection, edit preservation, seating/search and clock pause/resume. `task-first-home.png` records the new Scorebook Home. This verifies an in-memory design preview, not production financial storage, deployment, cloud backup or physical-device behavior.

## Game-night delight · 19 November 2026

- Shared session card now has original CSS playing-card/chip artwork and the “Game night, on.” welcome. Decorative artwork is hidden from assistive technology; no new assets, dependencies or network requests.
- Native labelled progress measures recorded cash-out stacks, not financial correctness. A three-step journey independently distinguishes a live table, exact reconciliation, and closed/fully settled player payments. Text alternatives announce completed/pending steps. Running table uses a compact progress variant.
- A “clean finish” seal appears only for nonempty tables with all stacks entered and exact balance. Payments remain separate. One 650ms maximum celebration per table key in the current page session; revisiting does not replay it. Reduced motion shows the complete static seal. Reconciliation controls and money digits never animate.
- Shared Components demonstrates the session surface and journey. Continuous corners include the new seal. Exact amounts stay on one line; banker details wrap or move below.
- Verified: 48 routes/assets plus incomplete/balanced/unbalanced/paid/empty progress tests; once-only/reduced-motion tests; receipt regression checks. Browser verified a fixture progressing from 2/4 to 3/4 recorded stacks and the seal after a final exact reconciliation. Checked Home/Table/Review/Components at 320px in both directions; Home at 1280px in all direction/theme combinations, no horizontal overflow or captured console errors. Visual checks at 375px. This remains an in-memory design preview; production storage, cloud, payments and deployment were not changed.

## More game-night character · 19 November 2026

- Home adds “Meet tonight’s lineup”: a native, collapsed-by-default disclosure with a felt-table illustration and every current player. Touch/keyboard opening and existing profile routing work; play/cash-out status remains factual. The overview explicitly does not assign seats. No native contact permission or storage behavior added.
- Original card/chip artwork now deals once per named table in the current page session (maximum 540ms including delay), entirely decorative. Reduced motion stays static; returning Home does not replay. No currency digit, input or confirmation animation.
- Tournament results keep the existing illustrative Jamie/Alex/Taylor finishing order and ₹7,500/₹4,500/₹3,000 prizes, now in a centred-champion podium. DOM order remains first/second/third. Every prize remains “not recorded paid”; primary payment review and sharing appear before the artwork. Components reuses the lineup and podium.
- Checks: 48-route/assets tests; lineup/empty/escaping/profile-button and podium assertions; one-shot/reduced-motion guards; receipt regressions. Browser checked lineup keyboard/touch opening and Alex profile navigation; Home/results/Components at 320px in both directions; Home/results at 1280px in both directions. No horizontal overflow or captured console errors. Visual inspection at 375px. Preview only; historical standings are fixtures, not a newly implemented tournament backend.

## Interaction choreography · 19 November 2026

`interaction-motion.css/js` adds Transitions.dev text-reveal and sliding-tab recipes, plus bounded profile/Home/list entrances, a chart stroke draw, insight-bar growth and session-row stagger. Primary money-entry routes retain their short existing page transition; monetary digits do not roll. Statistics reveal on native view timelines where supported, otherwise stay static. Disclosures expand using scoped intrinsic-size interpolation where supported; other browsers retain native opening/closing with an opening content fade. No new dependencies or perpetual animations.

Profile Overview/Sessions now updates only a named tabpanel. Identity, result and tab DOM remain mounted; the active pill slides and the panel enters directionally. Arrow keys, Home/End, selected/tab-stop state and focus are preserved. Entrance scheduling waits for native view-transition snapshot readiness; stale routes and interrupted animations are cancelled, including chart cleanup. OS reduced-motion changes cancel running work and leave final values visible. The review toolbar includes Replay motion; the existing generation reveal is separate.

Verification: 48 routes/assets; `motion-check.cjs`; new `interaction-motion-check.cjs` covers deferred entry, cancellation, reduced motion, positioning and stable profile updates; receipt regression tests. Browser exercised replay (observed intermediate card transforms and chart dash offset), rapid Overview/Sessions changes, keyboard selection, list/profile navigation and disclosure open/close. Player/Components/Home/Insights checked at 320px and 1280px in both directions, without horizontal overflow or captured console errors; visual checks at 375px. Physical Safari/iPhone motion remains untested. These changes are in the preview, not production storage/cloud/deployment.

### Premium motion pass

Exploration pages use directional perspective transitions and staggered depth entrances. The profile result card uses a flat outer hit area with a mouse-only four-degree tilt and soft glare; touch keeps vertical scrolling. Receipts unfold once on entry or Replay motion. All effects honor reduced motion; cash-entry and confirmation routes retain their short transition. Fresh review URL: `?direction=club&motion=premium-2#player`. Existing open tabs keep their previous scripts and sample state until reloaded.

### Connected interactions

Open `?direction=club&motion=connected-3#players`, then open a player. Selected avatar/name snapshots connect the screens. From Table, Add money/Cash out carries identity into entry; review carries the exact amount. Confirmation maps the reviewed card to the matching table player, with payment status still separate. Player filters preserve their DOM/focus and transition keyed cards in place. Returning to a route does not replay its heading reveal. Receipt sharing controls remain reachable in a dock above phone navigation.

`continuity-motion.js` extends the existing motion controller without dependencies; temporary snapshot names and queued list work clean up on completion, cancellation, route changes and reduced motion. `node continuity-check.cjs` verifies those boundaries plus unsupported-browser fallback. Browser checks covered profile naming/cleanup, rapid filters/focus, rebuy and cash-out reviews/confirmation, receipt identity, and receipt layouts at 320/1280px. Physical-device behavior remains unverified.
