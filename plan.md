# UX/UI audit and fixes
- Goal: Remove verified friction and confusing actions across the app.
- Scope: Contextual contact/seating actions, appearance persistence, mobile controls and form feedback; preserve ledger arithmetic and record history.
- Approach: Reproduce issues in isolated browser data, fix shared causes with existing patterns and no dependencies.
- Risks: Wrong-table seating, hidden controls, stale async photo reads, unavailable browser storage and navigation regressions.
- Verification: Targeted UI regression tests, full suite/build; browser contact/table/amount/profile/history/settings/tournament views at narrow widths, both themes and reload.

- Result: Fixed contextual routing/seat guards, theme persistence, avatar sizing, action priority, phone control sizing/focus clearance and photo selection feedback. 120 automated checks/build passed; isolated packaged flows and populated source layouts verified. Physical-device and cloud/deployment verification remain separate.
