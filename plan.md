# Match approved first-run design
- Goal: Restore visual fidelity to the approved first-run screens.
- Scope: First-run headings, illustrations, actions, success card and contact form presentation; preserve persistence and financial flows.
- Approach: Isolate first-run presentation from generic app styles; reuse approved artwork and proportions, keep one motion owner.
- Risks: Global style leakage, hidden controls at phone widths, animation overlap and focus regressions.
- Verification: Existing contact tests/full suite/build, rendered app versus reference at phone widths and both themes, save/reload on disposable data only.

- Result: Restored approved first-run composition and shared artwork, including saved-contact card and photo selector. 116 tests/build passed; isolated browser save flow and dark/light 320/390px views verified.
