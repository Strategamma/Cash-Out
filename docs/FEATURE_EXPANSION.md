# Accepted feature direction — 13 November 2026

Status: requirements and master production wireframes only. Do not apply application changes before design review. Canonical design: `visualizations/master-wireframes/`. Earlier studies are superseded.

## Accepted

- Illustrated game-night insights: playful lightweight SVGs, labelled charts, source data and sample sizes. Retain phase 2 for the insight engine/validated CSV import; collect required fields earlier. Separate cash and tournament datasets. Measure actual play time only when complete; never derive head-to-head winnings from session nets.
- Call time is a minimum-play rule, not planned arrival/departure (user correction). Set X in table settings; default is 3 hours. Clocks belong beside names on the running-table player cards, never on a separate clock page. Each player card has an independent clock anchored to that player’s own confirmed buy-in, including late joiners; there is no common table countdown. A confirmed buy-in starts the player clock; show red and remaining time until the minimum expires, then green with an explicit eligible label. An attempted profitable cash-out before the deadline must show a warning, but allow a confirmed friendly-house exception. Never auto-cash-out or mark money paid. Record the override in history. Draft assumptions awaiting review: the first confirmed buy-in at this table anchors time, rebuys do not restart it, time is continuous elapsed time, and profit compares cumulative table cash-outs (including this exit) against cumulative buy-ins. Re-entry timing and whether setting changes affect existing clocks need explicit policy before implementation. Store timestamps/minimum-rule snapshots and recover on reopen; warn on inconsistent device time rather than declaring early eligibility. Timing starts on confirmation even when entry money is still due; financial payment status remains separate.
- Individual receipt with a paper-slip appearance: table/date, player, exact buy-in/rebuy chronology, cash-out, poker result, received money, paid money and remaining obligation. Show snapshot time/revision and limit shared data to that player and relevant counterparties. No phone/photo leakage. Corrected receipts supersede earlier snapshots without rewriting history.
- One-table tournament first (confirmed by user). Own mode/type, chip stack separate from cash entry/prizes. Design includes blind/ante schedule and timer, breaks, starting stack, optional rebuy/add-on and late-registration cutoffs, elimination/finish order, prize-pool review and actual payouts.

## Tournament safeguards to implement after review

Lock and retain reviewed rules; audit later changes/reasons. Cash prize pool = prize contributions plus additions minus explicitly disclosed fees/refunds; entry payment status tracked separately. Handle unpaid entries before paying prizes; do not mistake promised contributions for cash held. Payouts must sum exactly to the pool in paise, with explicit deterministic rounding allocation. Rake model for cash games does not silently apply to tournaments. No automatic cash payout from eliminating a player; confirmation and correction history required. Address simultaneous eliminations/tied ranks explicitly before finalizing places. Heads-up ante policy and blind schedule belong to reviewed rules. Clocks must persist timestamps/paused state and recover after lock/closure/time change; preview timer is not production persistence. Multi-table seating/balancing is outside first scope.

## Rejected / unchanged

- No chip-count cash-out and no banker cash drawer.
- Keep exact reconciliation, missing-stack warnings and blocked unbalanced closure. The hope of no discrepancies is not grounds to remove checks; no additional speculative discrepancy engine is accepted.

## Review scope

The master set covers all core pages, in-flow confirmations and failure/recovery designs. Home exposes Create cash table and Start tournament. Tournament tabs use a continuous pill-shaped segmented control. Receipts use the existing Cash Out SVG logo; losses and payment balances are separate, including receive/pay/settled states. All numbers and interactions are illustrative. Production cash games stay cash-only. Existing local ledger, cloud work and app behavior remain unchanged.
