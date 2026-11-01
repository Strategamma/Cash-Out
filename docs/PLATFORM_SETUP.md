# Platform foundation and GitHub Pages

This local beta starts with an empty workspace, automatic device saving and an append-only transaction ledger. The original source design preview remains separate with its sample records. Live cloud setup is deferred until deployment; iCloud and device release testing remain outstanding. Google snapshots are recovery backups, not live multi-device sync.

## Local build

Node 22 or later; no third-party dependencies or package installation:

```
npm test
npm run build
python3 -m http.server 9185 --directory dist
```

Open http://localhost:9185. Device autosave is enabled automatically in the built app. The design preview still requires opt-in. Offline files become available after the first successful online service-worker installation; local records are separate IndexedDB data. Google sign-in/uploads require internet. Updates wait until the old app closes; no automatic reload during an active table. Browser/OS storage deletion can remove caches and local records. PNG installation icons are included; iPhone standalone behavior still requires device testing.

## Publish yourself

1. Put **this folder's contents** at the root of your Cash Out GitHub repository, including `.github/workflows/pages.yml`. Do not upload the parent Codex workspace. Never commit player exports, downloaded backups or OAuth secrets.
2. Use a `main` branch, or change the workflow branch to your actual default branch.
3. In GitHub **Settings → Pages**, select **GitHub Actions** as the source. Push to main, or manually run **Publish Cash Out test app**. The workflow tests, builds and publishes only allowlisted `dist` files.
4. The URL will normally be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Relative paths support repository subdirectories and custom domains. Hosted deployment has not been tested by Codex.
5. Create the Web OAuth client described in `GOOGLE_DRIVE_SETUP.md`. Register `https://YOUR-USERNAME.github.io` as an authorized JavaScript origin, **without the repository path** (or your exact custom-domain origin).
6. In GitHub **Settings → Secrets and variables → Actions → Variables**, add `GOOGLE_CLIENT_ID` containing the **public** client ID. Re-run the workflow. No client secret, API key or service account is used. Users select their Google account and consent to app-data backups. Test-user restrictions and OAuth publishing requirements still apply.
7. Test connect → confirmed local edit → cloud success → restore on another test device before trusting real records. Also test permission expiry, offline edits, storage/quota failure and declined consent.

Localhost, 127.0.0.1 and the deployed origin have separate storage. Deployment does not transfer records: export a full backup first and explicitly restore on the new origin. Repositories sharing a GitHub Pages origin share browser storage; use a dedicated custom domain before hosting unrelated apps with the same storage names.

## Local records and recovery

The built app uses `cash-out-platform-v1` IndexedDB, separate from the prototype database. Every confirmed mutation atomically saves the current state and its ledger before the app reports success. Stale tabs and failed saves cannot silently overwrite a newer revision. One current table is supported: close and balance it before starting another; completed tables and unpaid settlements remain in history. Stable numeric player IDs persist across tables; table/workspace/operation IDs are UUIDs. Amounts are integer paise, displayed as INR.

Full backup schema: `format: cash-out-ledger`, `version: 2`, with current table, contacts/photos, payments, retained tables and ledger. Restore validates both accounting and complete replay before replacing records. Explicit version 1 imports establish a labeled legacy baseline; missing earlier transactions cannot be reconstructed. No automatic import of sample/prototype storage occurs. Downloaded backups are unencrypted private files; keep them securely.

Transaction CSV includes a baseline row and transaction rows, stable identities, timestamps, table settings, correction references and exact JSON changes in paise. It includes private record data and is intended for later phase-two analysis. Use the separate names-and-amounts summary when sharing. CSV import/insights remain deferred.

Audit history guards against accidental inconsistency, not deliberate rewriting of the whole backup. Cloud transport currently supports snapshots up to 50 MB; history/photo growth needs monitoring. Export independent backups until cloud is connected.

## Remaining release work

1. Deploy, configure Google OAuth and verify real upload/restore with the v2 ledger. Local/Drive adapters share the validated payload; provider failures must remain visible.
2. Implement the required private iCloud provider and account/container setup. GitHub Pages hosts app files; it does not provide iCloud authorization or background execution while iOS suspends the app.
3. Complete privacy copy, persistent-storage/recovery UX, large-history profiling and real iPhone release checks. Multi-device conflict merging is not implemented.

## Verification

52 automated checks pass, including replay, operation deduplication, linked corrections, backup consistency, failure/stale writes, offline asset allowlisting and existing accounting tests. Browser checks used isolated `?backupTest=1` records: create table/contact, exact ₹1,250.50 buy-in, reload, cash-out, close, retain history on next table, historical payment/reversal, rename contact, reject stale-tab overwrite and export/validate/restore the full 9-entry ledger. Cloud and physical-device testing are not included.

PWA-only distribution: native projects, mobile build workflows and dependencies have been removed. The phone installation page is `/downloads/`; iPhone uses Safari → Share → Add to Home Screen, Android uses Chrome → Install app / Add to Home screen. No Xcode or Apple membership is needed. Generated `dist/` may be removed after verification; GitHub Pages rebuilds it.
