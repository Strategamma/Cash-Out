# Table flow wireframes — 14 November 2026

Review only; app code, persistence, build assets and accounting engine are unchanged. This is a focused revision of the master table/entry flow. Green/black identity, light/dark themes, existing SVG wordmark and semantic money colors are retained. No packages or remote assets.

## Review

Open `index.html` through the project server. The review screen map is outside the product; it exposes running, empty, entry, confirmation, pending, failure, saved, closure and backup states. Every state is hash-linkable. Product controls use ordinary actions without failure simulators or clock-advance controls.

Running table: compact sticky totals; calculated expected stacks explicitly distinguished from unknown live stacks; search, counted filters, sorting; independent red/green call badges beside names. Default rule remains three hours. Payment status stays separate from poker results. Tables keep cashed-out players visible.

Entry: repeated shortcuts add to the draft; amount is cash only, numeric with up to two decimal places. Review identifies player, operation, amount, resulting total and received/unpaid choice. Zero cash-out is valid; zero rebuy is not. Profitable early exit opens an overridable warning. Final confirmation records once in preview memory only; no real save or transfer occurs.

Pending and failure routes are static design states. Failure retains the draft with a same-entry retry; pending disables recording. Saved state highlights the changed card and offers inspect/correct paths. Direct-linking Saved applies one illustrative rebuy to keep its totals consistent. Corrections retain the original record in the proposed flow.

Closure guides missing stacks → exact reconciliation → actual payments. Missing or unbalanced stacks block the next step. Backup distinguishes device, cloud and confirmed file copies; cloud setup/export controls explicitly explain that no integration runs here. Existing master designs are linked for player selection, settings, receipts, corrections and payments.

Respect reduced motion. Monetary values stay static. No production implementation or device/cloud acceptance is implied.

## Verification

Syntax and all nine route renders passed. Targeted checks verified duplicate confirmation adds once, valid zero stack and rejection of malformed/overprecise amounts. Browser checks covered combined search/filter, repeated shortcuts (₹2,000 → ₹6,000), reviewed new total, failure draft retention, saved card/filter retention, profitable early-exit override, disabled pending confirmation, 320px/375px layouts, light/dark and sticky summary at 8px while scrolling. App tests/build were not rerun because app assets were unchanged.
