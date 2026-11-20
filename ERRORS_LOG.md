# Reusable pitfalls

- Money-dialog busy guard: `CashPolish.pending` disables the submitter before invoking its handler. Treat `disabled` plus `aria-busy` as the current accepted submission, while rejecting ordinary disabled buttons before starting pending feedback. Keep the form submission lock, draft committed flag, warning acknowledgement and awaited ledger write. Regression tests cover review, exactly-once save and retry after rejection.

- Entry previews must calculate the post-operation balance. Buy/rebuy/re-entry adds new buy-in money to the predicted difference; using the old negative difference produces a false warning even when the draft resolves it. Keep cash-out and payment-state checks separate.
