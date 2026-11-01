# Platform foundation and GitHub Pages

This build packages the reviewed sample-data prototype for offline/installation testing. It is not yet the production accounting platform. The immutable transaction ledger, automatic local saving by default, iCloud provider and device release testing are still required. Google snapshots are recovery backups, not live multi-device sync.

## Local build

Node 22 or later; no dependencies or npm install required:

```
npm test
npm run build
python3 -m http.server 9185 --directory dist
```

Open http://localhost:9185. Enable device autosave in Settings. Offline files become available after the first successful online service-worker installation; local records are separate IndexedDB data. Google sign-in/uploads require internet. Updates wait until the old app closes; no automatic reload during an active table. Browser/OS storage deletion can remove caches and local records. SVG installation-icon compatibility and iPhone standalone behavior still require device testing.

## Publish yourself

1. Put **this folder's contents** at the root of your Cash Out GitHub repository, including `.github/workflows/pages.yml`. Do not upload the parent Codex workspace. Never commit player exports, downloaded backups or OAuth secrets.
2. Use a `main` branch, or change the workflow branch to your actual default branch.
3. In GitHub **Settings → Pages**, select **GitHub Actions** as the source. Push to main, or manually run **Publish Cash Out test app**. The workflow tests, builds and publishes only allowlisted `dist` files.
4. The URL will normally be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Relative paths support repository subdirectories and custom domains. Hosted deployment has not been tested by Codex.
5. Create the Web OAuth client described in `GOOGLE_DRIVE_SETUP.md`. Register `https://YOUR-USERNAME.github.io` as an authorized JavaScript origin, **without the repository path** (or your exact custom-domain origin).
6. In GitHub **Settings → Secrets and variables → Actions → Variables**, add `GOOGLE_CLIENT_ID` containing the **public** client ID. Re-run the workflow. No client secret, API key or service account is used. Users select their Google account and consent to app-data backups. Test-user restrictions and OAuth publishing requirements still apply.
7. Test connect → confirmed local edit → cloud success → restore on another test device before trusting real records. Also test permission expiry, offline edits, storage/quota failure and declined consent.

Localhost, 127.0.0.1 and the deployed origin have separate storage. Deployment does not transfer records: export a full backup first and explicitly restore on the new origin. Repositories sharing a GitHub Pages origin share browser storage; use a dedicated custom domain before hosting unrelated apps with the same storage names.

## Next implementation milestones

1. Durable versioned ledger: stable IDs, atomic saves before success feedback, correction records, idempotent submissions, closed-table retention and prototype migration. Start an empty real workspace; keep samples separate.
2. Connect that ledger to the existing Drive backup controller; default local autosave, cloud onboarding and restore validation. Verify with real OAuth and iPhone.
3. Add the required private iCloud provider and account/container setup. GitHub Pages hosts the app; it does not provide iCloud authorization or background execution while iOS suspends it.
4. Complete installation icons, recovery, privacy copy and device release checks. CSV-based advanced insights remain phase two.
