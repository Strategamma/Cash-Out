# Cash Out master wireframes

Canonical design set: `index.html`. Start on Home; use **All pages** on phones or the page map on desktop. All 38 routes are directly linkable and browser Back works. This supersedes the isolated proposal boards.

Product-facing UI uses normal actions, not scenario selectors, fake failure buttons or “advance clock” controls. The surrounding master page map is a review tool outside the product surface. Data is illustrative and held in memory; no application ledger, IndexedDB, Google/iCloud service, production service worker or real financial transfer is connected. Do not confuse this with a deployed functional release.

## Screens

- Home, create cash table, running table, table settings, add saved player.
- Initial buy-in/rebuy, amount review, cash-out entry, cash-out review, early-profit warning dialog, correction, reconciliation/close, activity.
- Saved players, new/edit player, profile, table history, historical results, game-night insights.
- Settlement, payment recording, payment history/reversal review, individual receipt.
- Tournament setup, blind/break structure, live clock, entrants/seats, entry/rebuy/add-on, elimination, payout structure, final standings.
- Settings, cloud connection, restore file, restore review, install, privacy/recovery.
- Reusable component library.

## Accepted details

Home exposes **Create cash table** and **Start tournament** together. Independent call clocks are beside names on running-table player cards. Default minimum is **3 hours**; late joiners have their own deadline. Red pending and green eligible include text labels. Profitable early exit opens a native dialog with **Keep playing** and **Cash out anyway · house exception**, then normal final amount review. Losing exits still follow ordinary review. Rebuys preserving the original clock is a draft policy; re-entry timing needs final product agreement.

Table-setting changes in this design affect new buy-ins; existing players keep their stored minimum. Preserve rule/timestamp snapshots and audit overrides in implementation. No separate player-clock page.

Receipts use the existing SVG Cash Out logo on the paper surface. The player selector demonstrates valid source identities, not artificial variant controls:

| Player | Poker result | Payment remaining |
| --- | --- | --- |
| Jamie | +₹2,200 | Receive ₹6,200 after partial payout |
| Alex | −₹2,000 | Receive ₹3,000 because buy-in was paid upfront |
| Sam | −₹2,000 | Pay ₹2,000 because buy-in was unpaid |
| Jordan | −₹5,000 | Settled, no remaining payment |

Receipts and settlement show an earlier completed table; the running table is a separate current session. Tournament navigation is a pill-shaped segmented control. Chips and cash remain separate. Insights are phase-2 designs; source values/sample sizes are visible, missing timing is excluded.

## Interaction/verification boundaries

Routes, filters, search, draft numeric entry, repeat shortcuts, review/confirm transitions, per-player timers, early-exit acknowledgement, player receipt selection, theme and tournament clock controls are interactive. Some outbound actions open a review/information screen, rather than invoking real provider/file sharing. Restore review and historical analytics use illustrative fixtures; there is no production import/analytics engine here. Print receipt uses browser print styling.

Selected library sources, versions, licenses and ports: `THIRD_PARTY_NOTICES.md`. The approved profile and selected motion ports are now also integrated into the PWA using saved records; this master remains a separate illustrative design set. Real app pending feedback follows its existing awaited action.

## Shared profile components

The player profile and `#components` share result surfaces, captioned statistics, pill navigation, a keyboard-inspectable cumulative chart and session rows. Magic UI MagicCard supplies a restrained pointer/focus gradient; Spectrum StatCards supply contextual static values. Financial numbers never roll. Four-card entrances stagger by 40ms; reduced motion removes entrance animation and pointer tracking. No new runtime dependencies.

## Verification — 13 November 2026

All 38 screen functions rendered with headings in the route smoke check. Browser checks covered the running-table clocks, default 3h setting, early-profit native dialog → house exception → final review, settings action success, loss/receive, loss/pay and settled receipts, receipt logo loading, sharing-review Back behavior and tournament payout navigation. Receipt and tournament views fit a 375px viewport without horizontal overflow; light receipt rendering was inspected. No warning/error console entries were reported during the checked flows.

The existing full suite passed 70 tests before the final late-completion motion guard. The updated 5-test UI-motion set then passed, including duplicate locks, failure/retry, reduced-motion close, pinned-source hashes and suppression of stale completion announcements (71 total tests now). No live provider or physical-device acceptance is implied. Main app build/persistence behavior is unchanged by this design work.

Profile/component polish follow-up: all 38 routes rendered again; JavaScript syntax and five motion/source-integrity tests passed. Browser checks covered Overview/Sessions switching, ten session rows, range Home/arrow-key inspection including a losing session, acknowledged component action, 320px/375px phone and 1100px desktop overflow checks, and light/dark profile rendering. Reduced-motion close is unit-tested; a physical-device or live-data analytics check was not performed.
