# Prototype state audit

Verified locally on 1 November 2026. This is evidence for the review prototype, not a production-release or physical-iPhone certification.

## Automated checks
`node --test visualizations/wireframes/core.test.cjs visualizations/wireframes/history.test.cjs`: 18 passing checks covering exact decimal inputs, invalid precision/ranges, explicit zero versus missing stacks, empty table closure, rake reconciliation, re-entry, banker obligations, direct settlement conservation, mixed/partial payments, corrections after payout, payment-record reversal, backup validation/round-trip, and HTML escaping.

`node --check` passed for app, entry, components, and catalogue scripts.

## Browser observations
| Flow/state | Observed result |
|---|---|
| Active table, light/dark | Readable hierarchy; playing players have no finalized loss |
| 320px table and catalogue | No horizontal overflow |
| 390px table | No horizontal overflow; light/dark and amount review inspected |
| 1440px desktop | No horizontal overflow; table/sidebar/navigation alignment inspected; catalogue inspected in both themes |
| Repeated last-buy-in shortcut | Two +₹5,000 taps produce ₹10,000 additional / ₹15,000 total, before recording |
| Payment choice | Review blocked until Received now or Not yet is chosen |
| Duplicate confirmation | Double-clicking Record ₹1,000 changed total once to ₹21,000 |
| Changed draft | Close opens a discard dialog; Keep editing preserves the review |
| Invalid precision | 1.001 blocked |
| Explicit zero | ₹0 stack accepted through review |
| Excess cash-out | A ₹10,000 stack with ₹8,600 available warns of ₹1,400 overage; Record disabled until acknowledgement |
| Cash-out correction | Reason required; old/new amounts shown; ₹200 discrepancy corrected to zero |
| Missing cash-outs | Confirm table & settle disabled |
| Unbalanced completed table | Exact ₹200 discrepancy shown; closure disabled |
| Balanced completed table | Closure enabled; banker settlement excludes prior payouts |
| Partial payout | ₹2,000 payout reduces ₹7,200 due to ₹5,200; ₹8,000 overpayment blocked |
| Payment correction | Reversing a mistaken ₹1,000 record restores ₹7,200 due; original/reversal retained |
| Re-entry | Player returns to Playing; previous ₹7,200 cash-out retained in table totals |
| Repeated rake | Two confirmed ₹200 additions raise ₹400 rake to ₹800 |
| Rake correction | Correct ₹400 to ₹200 requires a reason and shows previous amount |
| Simulated save failure | No mutation on first attempt; draft retained; retry applies ₹1,000 once |
| Empty table | Empty-state action shown; cancelling initial buy-in leaves zero seats |
| Player search | No-results message shown |
| Duplicate player | Existing name triggers acknowledgement instead of silently creating/merging |
| Archive | Confirmation explains retained history; player removed from roster but seat preserved |
| Recent table | Saved example opens results/settlement with one remaining ₹5,600 payout |
| Cash-only entry | Big-blind selection/conversion removed; buy-ins, rebuys and cash-outs use cash |
| Invalid backup example | Validation message stays visible inside the restore dialog; no data replacement |
| Valid backup example | Replacement preview before confirmation; confirmation restores sample records |
| Insights | Ten balanced sample tables, fifteen players, ninety seats; calculated totals and leaderboard; CSV analysis remains phase two |
| Final app/catalogue console | No application errors observed |

## Remaining checks and boundaries
- Actual OS file-picker backup round-trip and photo-picker interaction were not verified successfully in browser automation. Backup validation/JSON round-trip are unit-checked, and restore preview/application are browser-checked using labeled built-in example data.
- Physical iPhone keyboard/safe-area/VoiceOver behavior, PWA installation/offline caching, IndexedDB durability, real write failures, cloud recovery, migrations, and multi-tab protection await production implementation.
- Native Reduced Motion/Transparency settings were not exercised on hardware; CSS fallbacks exist.
- Historical records are synthetic; profiles and charts are calculated from those records. Canonical CSV ingestion is phase two; the download is a sample reporting CSV.
- No claim that every possible state combination is tested. Review flows and representative failure/correction states are documented above; retain this matrix as implementation grows.

Screenshots are in `screenshots/`: table dark/light, amount review, desktop layout, and catalogue dark/light.

## Emphasis/motion update
Stronger type and semantic action/payment colors verified in dark/light themes. Updated 320px and 390px layouts showed no horizontal overflow. Native dialog computed animation was `enter`, 200ms. Catalogue replay computed `enter`, 200ms; enabling reduced-motion preview changed it to `none`. Two +₹5,000 taps still reviewed exactly ₹10,000 additional / ₹15,000 total; discard guard remained functional. All 11 targeted checks passed and no application console errors were observed. System-level reduced motion remains untested on physical hardware. New screenshots: `emphasis-light.png`, `emphasis-dark.png`, and `emphasis-motion.png`.

## History follow-up
Generator tests verify ten reproducible tables, nine unique seats each, all fifteen players represented and exact reconciliation including rake. Calculation fixtures cover conditional averages, extrema, cumulative trend, exclusions and deduplication. Historical payment isolation and JSON round-trip validation pass. Browser verified profile → session → table → settlement, payment recording/reason-required reversal, separate table balances, restore preview with ten past tables, theme switch with pointer/Space, and top-left review navigation. Profiles/insights/history detail showed no horizontal overflow at 320px; roster/settings/profile checked at 390px, desktop profile at 1280px. Both themes inspected; no console errors/warnings observed. Screenshots: `history-profile-dark.png`, `history-insights-light.png`. Production persistence, physical iPhone testing and canonical CSV import remain outside this prototype.

Cash-only follow-up: removed unit selectors and BB conversion from entry/review and catalogue. Browser verified ₹5,000 rebuy reviews as ₹5,000 additional / ₹10,000 total, and ₹6,500 cash-out shows +₹1,500. Existing 15 checks and script syntax checks pass. Evidence: `screenshots/cash-only-entry.png`.

Numeric/glass follow-up: browser verified typed letters and invalid replacements (`500abc`, `1e3`) preserve the prior valid amount; ₹5,000.25 reviews unchanged. Light/dark phone backgrounds inspected; line art is decorative, local and noninteractive. Existing 15 accounting/history tests and entry/app syntax checks pass. Physical iPhone keyboard/paste behavior remains untested. Evidence: `screenshots/glass-theme-dark.png`, `screenshots/glass-theme-light.png`.

Wordmark/filter follow-up: 16 tests pass, including stack-status vs payment-status filtering, zero cash-out and paid-obligation exclusions. Browser verified initial counts 4/2/2/1 and exact matching names, then confirmed a sample payout and observed outstanding 0/empty state with full totals unchanged. Green/black wordmark checked in both themes; 320px document width equals viewport. App/components/catalogue syntax checks pass. Evidence: `screenshots/wordmark-filters.png`.

Cut/Ace SVG branding: all four exported SVGs parse successfully and contain no bitmap images or font text nodes. Wordmark/symbol inspected side by side on light/dark surfaces. An isolated app preview confirmed light SVG visible/dark SVG hidden after theme switch, with both assets loaded. Script syntax checks passed. Screenshot: `screenshots/cut-ace-brand.png`.

Contact/summary follow-up: all 18 tests pass. Added coverage for a seated banker (no self-transfer; all player results still included), private-field exclusion and incomplete/unbalanced summary gating. Browser created a table with Jordan Patel selected as banker and zero automatic seats; searched Morgan (two matches), a nonexistent name (empty state), and Alex (opens buy-in without committing). Historical settlement showed the new title and accurate structured summary with two remaining transfers; an empty live summary withheld payment instructions. At 390px, document width was 390 and dialog width 390 with no internal horizontal overflow. No console errors/warnings. SVG family rebuilt with solid spade and parsed successfully. Evidence: `screenshots/structured-summary.png`, `screenshots/solid-spade-brand.png`. Physical iPhone native picker/keyboard behavior remains unverified.

Black-spade steering: rebuilt six valid SVG exports with solid near-black spades and fine light outlines in dark variants. Both surfaces visually inspected; comparison saved to `screenshots/solid-spade-brand.png`.

## Google Drive backup foundation
`node --test src/backup/backup.test.cjs visualizations/wireframes/core.test.cjs visualizations/wireframes/history.test.cjs`: 36 pass. Eighteen backup checks cover restricted app-data listing, resumable upload/acknowledgement, idempotent lookup, malicious destination rejection, expiry/revocation/quota errors, size/format validation, confirmed retention, serialized local writes, local failure/conflicts, owner binding, late completion, restore and account-switch races. All provider requests in these tests are mocked.

Browser QA used the separate `backupTest=1` IndexedDB workspace. Confirmed ₹1,250.50 rebuy survived a reload exactly; a second tab's stale save triggered a visible revision conflict rather than overwriting the newer phone/player data. Unconfigured Connect Google Drive was disabled, setup instructions visible, and no Google SDK script was loaded. Real IndexedDB was exercised; no user Drive data was accessed.

Live Google OAuth/upload/list/restore, Safari/installed-PWA behavior, device eviction, real permission/full-storage errors, production ledger atomicity, cross-device conflict handling and iCloud remain unverified/unbuilt as applicable. No Google Cloud project or paid service was created. Evidence: `screenshots/drive-backup-settings.png`. The earlier reset-on-reload boundary now applies only when device autosave has not been enabled.
