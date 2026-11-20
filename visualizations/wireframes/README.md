# Cash Out interactive design

Local, high-fidelity HTML/CSS/JS prototype. Open `index.html` through a static server; `library.html` is the reusable component catalogue. No build or package installation required.

From the project root:

```sh
python3 -m http.server 9184 --bind 127.0.0.1
```

Then open `http://127.0.0.1:9184/visualizations/wireframes/`.

## Scope
The starting financial records are synthetic. Settings now offers opt-in IndexedDB autosave; once enabled, confirmed records persist across reloads. Drive backup code uses only app-data permission, but real Google connection requires a public Web OAuth client ID and registered origin. Cloud credentials/uploads are never simulated as successful. The JSON snapshot format remains a demo/review format, not the production ledger or phase-two CSV contract. No real payments or analytics. See `../../docs/GOOGLE_DRIVE_SETUP.md` for setup, retention, costs and remaining integration checks.

Use Settings → Preview scenarios to inspect active, balanced, unbalanced, credit/direct, empty, and simulated save-failure states. The desktop side panel exposes the main scenarios. Settings also links to the component catalogue on mobile.

## Reusable component library
Load `../ui-kit/tokens.css`, `components.css`, and `components.js`. The catalogue does not load the prototype's `styles.css` or accounting scripts. `CashUI` is a framework-free HTML-rendering API:

- `button`, `icon`, `badge`, `avatar`
- `money`, `amount`, `reviewSummary`
- `notice`, `field`, `segment`, `keypad`
- `empty`, `playerCard`

Text parameters are escaped by default. Button `content` and `attributes` are for trusted application-owned markup only. Monetary arguments use integer minor units. `playerCard(player, net)` takes a signed outstanding obligation: positive means player owes, negative means player receives. Theme is selected with `data-theme="light"` or `data-theme="dark"` on the root element.

The app shares the library's buttons, icons, avatars, player cards, keypad, empty state, review summary, and styling. The catalogue shows normal, disabled, invalid, active/unpaid, cashed-out/due, settled, empty, and confirmation states. Catalogue specimens are component demonstrations, not live table actions.

`tokens.css` contains extracted kit foundations; semantic component tokens in `components.css` adapt them to Cash Out. Mint actions, slate backgrounds, typography, and layout are product design choices. Kit geometry informs 50px controls, 14px button radii, 28px glass surfaces, and 20px backdrop blur. SVG shadow parameters are not treated as equivalent CSS box-shadow blur values. No raster imagery is necessary for this financial UI; crisp vector icons preserve legibility at high pixel densities.

## Mistake prevention
Money flow: editable draft → review with player/table/action/unit/resulting total → explicit record. Repeated shortcut taps accumulate only in the draft; duplicate final submission is guarded. Buy-in payment status is an explicit choice. A new player is seated only after initial buy-in confirmation. Changed money/player forms get discard protection.

Cash-out zero must be explicit. Overprecision/negative inputs are rejected; money is calculated as integers. All money entry is cash only; stakes do not convert inputs. Large amounts and resulting cash-out/rake overages need acknowledgement. Corrections require a reason and retain activity/payment history. Rake can be added repeatedly or corrected. Returning players retain prior cash-outs. Actual partial payments, banker/direct routes, and record reversals remain separate from chip stacks.

## Emphasis and motion
Totals and reviewed amounts carry the largest type; player names, final results, and payment obligations are stronger than supporting labels. Blue means add money/payment tools, amber means money owed/correction, and green means settled/success. Text and signs remain alongside colors.

Optional `motion.css` and `motion.js` provide a small, attributed plain-CSS adaptation of shadcn's tw-animate-css fade/zoom/slide patterns. Use `CashMotion.enter(element, 'page')` for a 200ms fade/8px slide, or `'content'` for 150ms state content. Native dialogs use 200ms zoom on desktop and a short slide on phones. View transitions play only when navigating; keypad taps never replay the page animation. Closing and committing remain immediate. Amounts do not count/roll between values. OS reduced motion always disables these effects. The catalogue's Emphasis & motion section includes replay and a local reduced-motion preview. See `THIRD_PARTY_NOTICES.md` for sources/license.

Closing requires players, all cash-out stacks, and exact reconciliation including rake. Changes reopen the table for review. Rake distribution stays outside the app. Player archival preserves seated records; removing a seat with financial records is blocked. Duplicate names/phone hints require acknowledgement rather than automatic merging.

## Files and checks
- `app.js`: sample records, screens, navigation, and table interactions.
- `entry.js`: guarded money entry and review flow.
- `core.js`: exact arithmetic, reconciliation, settlement, and demo-backup validation.
- `components.js` / `components.css`: reusable presentation primitives.
- `library.html` / `library.js`: catalogue and interaction examples.
- `core.test.cjs`: targeted accounting, validation, reversal, and escaping checks.
- `QA.md`: observed states and evidence limits.

Run `node --test visualizations/wireframes/core.test.cjs` from the project root. Production persistence, write transactions, recovery from real storage failure, canonical CSV ingestion, and physical-iPhone verification remain future implementation work.

Amount typing accepts digits and one decimal point with up to two fractional digits. Invalid insertions are blocked; invalid replacement/paste events restore the last valid draft rather than stripping characters. Native decimal input hints supplement the custom keypad. Background artwork is local SVG card/chip line art with theme-aware light washes; it never receives pointer input and is hidden for reduced-transparency preferences.

Player filters: All, Playing, Cashed out and Payment outstanding, each with a live count. Outstanding includes either unpaid buy-ins or unpaid cash-outs after recorded payments. Filters never change totals or records; zero stacks count as cashed out. A zero-match state explains that only the list is filtered.

Brand: selected Cut/Ace direction uses font-free SVG paths in `assets/brand/`: solid spade replacing A, segmented chip O, matching standalone chip/spade symbol. `build_brand.py` produces adaptive/light/dark wordmarks and symbol from shared geometry. The app switches light/dark SVGs with its theme; standalone adaptive SVG uses system color scheme. No backing plate, bitmap or external font. Original raster options remain reference assets. Review/export page: `../branding/index.html`.

Table setup selects a banker from non-archived saved players or the host. Selection stores the player ID with a name snapshot; it never seats the banker or records money. A seated banker is excluded from external payment obligations to avoid self-payment instructions. Add player searches available non-archived/unseated contacts by name or phone, preserving the typed query and showing an explicit no-match state.

Table settlement replaces the former Settle up title. Share preview is a structured table summary showing totals, rake, realized results and remaining transfers; plain-text download uses the same accounting model. Pending results stay pending and incomplete/unbalanced tables suppress payment instructions. Names/amounts only; no phones or photos. The spade replacing A is solid black, with no letter cut-out. Dark variants use a fine light outline for visibility; wordmark and standalone symbol both have adaptive/light/dark SVG exports.

Backup module: `../../src/backup/` contains Drive transport, IndexedDB CAS snapshot store, serialized controller, public client configuration and UI integration. Tests cover upload acknowledgement, retries, token errors, owner isolation, retention and safe restoration. Device autosave and cloud status are separate; API mocks are not live-provider proof. Preview scenarios require replacement confirmation once autosave is enabled.

## Approved profile integration — 13 November 2026

The built PWA now uses `profile.js` and `ui-polish.css/js` for shared result surfaces, exact saved-record statistics, Overview/Sessions pills, keyboard/touch chart inspection and safe player options. `library.html` uses the same renderers with separate catalogue fixtures. No React or animation runtime was added. Native dialog submissions show pending feedback around the existing awaited action; validation/save failures retain the entry and never produce synthetic success. Reduced motion disables decorative tracking/entrances/rotation. Licenses are retained and precached.

Verification: 79-test full suite and all nine focused profile/motion tests passed (80 distinct tests after adding the last reduced-motion check). Build passed; all new runtime/license assets are precached and master fixtures are excluded. Built-app browser QA used an isolated origin and validated backup: saved profile totals, negative chart inspection, session-to-table navigation, empty profile, 320px/375px layouts, dark/light, and a player edit surviving reload. Physical-device/cloud/deployment acceptance remains separate.

## Approved app polish

`premium.css` / `premium.js` are the presentation layer shared with the component library: green glass/stone themes, compact player cards, desktop rail, progressive shared-identity navigation, keyed filters, stable keyboard profile tabs and bounded entrances. Storage and ledger calculations stay in the existing app/backup modules. Reduced-motion/manual-off and unsupported native-transition paths remain functional.

Cashed-out player cards expose a branded personal receipt. The snapshot separates poker result from outstanding payments, excludes contact phone/photo, and requires the banker's name before PNG/share. New table creation asks for the host name when banking; older unnamed tables can add it from their receipt. Banker IDs stay unchanged. Actual native-share targets and physical iPhone behavior need device validation.
