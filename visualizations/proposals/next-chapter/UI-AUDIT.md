# UI review — 19 November 2026

Scope: current next-chapter wireframes, primarily Scorebook light at 375×812. Browser inspected Home, Add player, Buy-in, Amount review, End-table review, Settlement, Payment, History, Insights, Settings, Cloud, Restore, Tournament and Table settings (14 screens). Running-table layout was also observed. Initial review was observational; implementation status follows below. Positions include the review toolbar and are evidence about this preview, not physical-device or deployed-app behavior.

## Implementation status

Implemented in this preview: resume-first Home; compact entry/review with optional keypad; available-first, phone-capable seating; missing-stack-first reconciliation; compact settlement; timer-first Tournament Live. Shared resume surface added to the component library. History, Insights and recovery recommendations below remain follow-up work. Production UI is unchanged.

## Recommended order

| Priority | Area | Observed friction | Recommended enhancement |
|---|---|---|---|
| 1 | Home during a game | Live table starts near y=734, below illustration/new-game actions. Create cash table is prominent although an existing cash table blocks it. Source also always says “You’re banking.” | Make Resume table the first card while a game is active, show player/pending-payment counts and the actual banker. Demote creation actions; use illustration-led layout for the empty state. |
| 1 | Cash entry and buy-in review | Buy-in screen is about 938px tall; Review amount begins near y=1014. Amount review is about 809px tall with Record near y=856. Identity and totals repeat across large blocks. | Reuse the compact cash-out review pattern. Keep draft amount, additive shortcuts and payment selection together; keep Review/Record reachable. A sticky action must clear navigation and the software keyboard. Never turn shortcuts into commits. |
| 1 | Tournament Live | Promotional trophy panel precedes the timer. Resume/Take break begin near y=943; entrants/actions are farther down. | Put current blinds, clock, pause/resume and next level/break first. Use trophy artwork in setup/results. Show registration cutoff and remaining players as compact status rows. |
| 1 | End-table review | About 1039px tall. Disabled Confirm follows the entire stack list; large summary precedes actionable missing stacks. | Put a “2 stacks missing” task list first, with named players and Enter stack. Keep a compact buy-ins/cash-outs/rake summary. Distinguish “not fully counted yet” from a final discrepancy, retaining exact balance and zero-stack checks. |
| 2 | Settlement/payment | About 934px tall; one transfer still takes a large hero, routing selector and card. Payment confirmation begins near y=754. | Compact transfer rows with payer → recipient, outstanding amount and Record payment; show partial/paid status inline. Disclose routing explanation and secondary export/history controls. Keep real payments separate from poker result. |
| 2 | Add player/search | 15-player list is about 1425px tall. Already-seated players occupy the first rows; Create player is at the bottom. All rows repeat absent-phone copy. | Put available/recent players first; collapse seated players. Put Create player near search and in no-results state. Omit repeated missing-phone text in selection mode. Source at app.js rosterRows filters names only although UI promises name/phone search; align behavior and wording. |
| 2 | Settings/cloud/table setup | Settings about 1293px, Cloud about 1013px and Table settings about 1123px. Connection CTA is near y=810 on Cloud. Explanations/illustration precede action. | Show compact save/backup health and one connection action at top. Group banker, play rule and stakes; disclose long explanations. Show provider, last successful backup and failed/pending state. Keep unsupported iCloud automation explicit. |
| 2 | History | Ten tables make a roughly 2007px list; “Balanced” is repeated independently from outstanding payments. | Add All / Payments due filtering, date grouping and search. Use compact rows with separate accounting and payment statuses. Provide Resume settlement directly for unpaid tables. |
| 3 | Insights | Roughly 1799px tall; decorative summary and several large surfaces precede player analysis. | Lead with useful metrics, date/game scope and player selection. Put the chart next; preserve exact source table and sample sizes. Keep CSV phase-two availability explicit. |
| 2 | Touch/type consistency | Add-player and end-table row actions measured 40px tall; many metadata labels are 9–10px. | Standardize interactive targets to at least 44px and make key statuses readable at phone width. Compact spacing and redundant copy rather than shrinking important text. |

## Preserve

- Individual call-time state beside each player; early-profit exception review.
- Unknown active results, exact INR amounts, zero stacks and reconciliation safeguards.
- Compact player cards, separate payment balances, branded private receipt PNGs.
- Continuous-corner scale with rounded fallback; reduced motion/transparency behavior.

Suggested first design pass: active-game Home, compact Buy-in/Review, operational Tournament Live. Then end-table/settlement, roster and recovery. These are recommendations, not newly implemented features or validation of production/cloud behavior.
