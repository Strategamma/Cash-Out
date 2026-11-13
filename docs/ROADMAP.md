# Cash Out release roadmap

Checked 13 November 2026. Scope: an installable iPhone/Android PWA, hosted on GitHub Pages, with reliable private accounting and recoverable records. No native builds or third-party build dependencies.

## Built and locally verified

- [x] Private local workspace; empty first run, separate design samples.
- [x] Players with optional phone/photo, search and duplicate hints; archive preserves history.
- [x] INR keypad buy-ins, rebuys, cash-outs and rake; draft/review/confirm flow.
- [x] Paid/unpaid records, banker/direct settlement, payment reversals and reconciliation.
- [x] Awaited atomic IndexedDB saves, duplicate-operation protection and stale-tab rejection.
- [x] Append-only audit ledger with table snapshots, reasons and correction references.
- [x] Completed table retention, outstanding historical payments and calculated player stats.
- [x] Full versioned JSON backup, validated restore, legacy snapshot import and transaction CSV export.
- [x] Offline app shell, installation manifest/icons, light/dark UI and phone install instructions.
- [x] Google Drive app-data adapter, account binding, retries and versioned backup controls; provider behavior tested with mocks, not a live account.
- [x] GitHub Pages workflow; allowlisted public build excludes private records.

Evidence: 66 automated checks pass after the full bug audit; see `docs/QA_AUDIT.md` for coverage, fixes and limitations. Earlier browser checks covered exact amounts after reload, retained table payments, reversal, stale-tab conflict, full export/restore and mobile layout. They do not replace physical-device or live-cloud checks.

## Release path, in order

| Step | Remaining work | Owner / completion evidence |
| --- | --- | --- |
| 1. Publish local beta | Push the two local commits and enable Pages → GitHub Actions. | Repository owner authenticates/pushes; successful Pages workflow and reachable HTTPS app. At audit, remote HEAD is `9ca8c59`; local HEAD is `79ca47d`; Pages returns 404. |
| 2. Device/recovery UX — implemented | Persistent-storage request/status, storage estimate, revision-aware file backup reminders, explicit export-file confirmation, offline-ready/update states, privacy notice and platform install controls. | 58 automated checks; browser storage denial/export-unconfirmed/320px layout verified. Physical-device install and actual saved-file confirmation remain release checks. No forced reload. |
| 3. Activate Google Drive | Create/configure public Web OAuth client, approved origins/audience/test users and repo `GOOGLE_CLIENT_ID` variable. | User-owned Google setup; verify real connection, upload, expired consent, offline queue and restore into a fresh test installation. No client secret in frontend. |
| 4. Resolve iCloud requirement | Automatic private iCloud backup is not implemented. Manual full-backup export through Files to iCloud Drive is the interim recovery option. | Explicit product decision needed: accept manual iCloud export for initial release, or complete a supported Apple-backed integration and its account setup before calling v1 complete. PWA installation alone is not iCloud backup. |
| 5. Accounting/recovery audit — locally completed | 66 automated checks, 3,000 randomized settlement cases, long photo-bearing audit and browser session/history/reversal/reload checks. | Six safeguard/performance fixes; `docs/QA_AUDIT.md`. Physical device/file-picker/cloud gates remain. Historical financial amounts are read-only after archiving; payment corrections remain available. |
| 6. Physical-phone sign-off | Install on iPhone Safari and Android Chrome; offline cold launch, quit/reopen, numeric keyboard, file/photo picker, backup/export/restore and app update. | Real-device results recorded in QA; use disposable test tables. Desktop emulation does not count as phone proof. |
| 7. Release | Remove remaining beta/preview copy only after release gates pass; retain backup and failure status. | Hosted smoke test, privacy copy and a tested recovery path. |

## Phase two (not a v1 blocker)

- Validated transaction-CSV import and the expanded insights engine.
- Currency selection beyond INR.
- Live multi-device synchronization/conflict merging, if desired; current cloud snapshots provide recovery only.
- Shared live viewing, if desired; current host-controlled summaries are exports, not live hosted tables.

## Immediate next work

Publish the local beta with the recovery/install UX, then perform real-phone and cloud recovery checks. Configure Google only after the production origin exists. Keep independent full backups until live cloud recovery is verified. Do not claim automatic iCloud support without resolving step 4.
