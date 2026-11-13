# UI polish proposal — awaiting review

Standalone wireframe study, not an approved application change. Open `index.html` through the project preview server. No ledger, IndexedDB, cloud, service worker or production scripts are loaded; screens use independent illustrative states. Outside the public build allowlist.

Preserve Cash Out's existing SVG wordmark, black spade, green/black glass, cash-only INR and local-save safeguards. Proposed improvements: amount hierarchy, consistent player actions, clear review totals/receipt status, separated settlement direction/state and contextual player history. Existing navigation, search, payment filters, corrections, exports and backup controls must remain when applying this direction; the board shows only focused screen sections.

Motion: restrained press feedback, short sheet entrance and checkmark after acknowledgement. Exact amounts never count up or roll. Only animate opacity/transform, respect OS reduced motion, never delay actual persistence or announce success before acknowledgement. The preview's 750ms delay is solely a simulation. Graphics: static SVG chip/card line art and emerald illumination, with opaque-enough number surfaces. No new libraries/assets required.

Use 16px editable fields, 44–48px targets and phone safe areas in production. Some metadata is compact in these overview wireframes. Wireframe interaction coverage: filter; theme/motion toggle; pending save locks; retained draft/retry; blocked storage warning; two-step payment recording. Buttons without a simulated flow explain the proposed action in the design status area. History chart is illustrative, not connected to application records.

Checked in the local browser: dark/light rendering; 375px portrait and 812px landscape without horizontal overflow; filter; locked saving state; failure with retained draft and retry; blocked warning; separate payment confirmation; reduced-motion checkmark animation resolves to `none`. No browser warning/error entries. Desktop theme boards saved alongside this file. No production code changes or deployment in this design pass.

## Game-night expansion

`game-night.html`: illustrated insights (phase 2), per-player minimum-play/call-time clocks, receipt and one-table tournament setup/live/payout sections. Planned arrival/departure interpretation was rejected by the user and replaced. Table setting defines X; each player card counts independently from its own confirmed buy-in. Red until elapsed; then green. Early profitable cash-out opens a warning with a house-exception path into normal review. Rebuys not resetting time is a draft assumption, not a confirmed rule.

Checked: late-joiner Jamie has 110m remaining versus Alex's 80m and already-eligible Sam. Advancing the demo by 80m makes Alex eligible while Jamie still has 30m. Jamie's popup uses Jamie's own name, elapsed time and amounts. Override changes no other clocks. Also checked tournament Setup/Live/Payout views, resume control state, elimination confirmation, payout arithmetic, theme switch and 375/812px no-overflow checks. No browser warning/error entries. These are wireframe simulations; no platform feature implementation, persistence or real-device clock guarantee.
