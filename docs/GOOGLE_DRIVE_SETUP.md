# Google Drive backup setup

This implementation backs up directly to each user's Drive using only `https://www.googleapis.com/auth/drive.appdata`. It needs no application backend or client secret. It is integrated into the review prototype as an opt-in backup foundation; it is not a production release of the financial ledger or PWA.

## Configure Google

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Drive API** for that project.
3. Configure **Google Auth Platform** branding, audience and data access. Add only `https://www.googleapis.com/auth/drive.appdata` (non-sensitive). Add test-user emails while the OAuth app is in testing. Follow Google's production publishing/domain/branding requirements before public use.
4. Create an OAuth client with application type **Web application**. Register each exact JavaScript origin used by the app, including its port. For local testing use `http://localhost:9184`; register the actual HTTPS production origin before deployment. Use an origin accepted by Google's console; do not register a wildcard.
5. Copy the public client ID ending in `.apps.googleusercontent.com`. Put it into `src/backup/config.js`, or enter it in **Settings → Google connection setup**. No client secret, service-account key or unrestricted Drive scope belongs in frontend code.
6. Open the prototype at the registered origin. Choose **Enable device autosave**, then **Connect Google Drive**. Select the intended Google account and approve the app-data permission. Review the upload/retention confirmation before enabling automatic backup.

Changing between `localhost`, `127.0.0.1`, ports or production domains changes browser storage origins. Export existing device data before moving origins. OAuth and local persistence require real-browser/iPhone verification on the final origin.

## What works in code

- IndexedDB snapshots include the current demo table, saved players/photos, table history, payments and corrections. Confirmed changes are captured; unconfirmed amount drafts are not. Enabling device autosave opts into persistence across reloads.
- Automatic cloud uploads coalesce changes for 30 seconds, with a manual Back up now action. The last success time changes only after Google confirms the file and the local marker is saved.
- Immutable versioned JSON snapshots are created in `appDataFolder`; other Drive documents are neither listed nor modified. Account identity is read with the same narrow scope, not an added profile/email scope.
- Resumable upload transport supports snapshots up to 50 MB. Network/rate-limit retries are bounded; daily-quota, full-storage, permission and expired-token failures pause retries with visible status. An uncertain upload is looked up by write ID before retrying.
- Tokens remain in memory. Reload/expiry requires a user-driven reconnect. Disconnect aborts requests. A different Google account cannot automatically receive records bound to the previous account; restoring that account's backup requires explicit replacement confirmation.
- Restore lists snapshots and validates schema/accounting before replacement. A failed restore keeps the existing device copy. Cloud restoration starts a new collection so restoring an older revision does not overwrite cloud history.
- Retention confirmation defaults to the most recent **10 snapshots per collection**, permanently removing older snapshots only after a newer one succeeds. Unchecking retains all. Previous/restored collections are not automatically removed. Backups include photos and consume storage; export a separate copy for long-term independent recovery.
- Manual JSON export/import remains available. Removing Cash Out's app data in Google Drive removes its cloud recovery copies; do not treat Drive as the only independent copy.

## Cost and limitations

Google's current documentation says standard Drive API usage has no additional cost, but describes usage thresholds and planned above-quota charges later in 2026. Check the actual project's quotas and Google's current billing terms before public launch. This code does not create/enable billing services or buy storage. The user may choose to pay Google for more account storage; a full Drive pauses cloud backup rather than purchasing an upgrade.

Google authorization does not guarantee forever-silent sign-in. Browser access tokens expire and reacquisition requires a user gesture. No PWA can promise these uploads while offline or suspended by iOS. Confirmed device saves continue without cloud access. Device storage can still be cleared/evicted; cloud success must be monitored.

Not implemented: iCloud/CloudKit integration, a full production immutable event ledger, service-worker install/offline asset caching, cross-device live editing/conflict merging, encryption/key recovery, automatic provider migration. Cloud backups are recovery snapshots, not multi-device synchronization.

## Verification

Run `node --test src/backup/backup.test.cjs visualizations/wireframes/core.test.cjs visualizations/wireframes/history.test.cjs`.

Use `?backupTest=1` only for isolated browser QA; it uses a separate IndexedDB database. Live Google sign-in/upload/restore must be tested with a real configured OAuth client and account. No real cloud connection or payment was made during implementation.

Official references:
- [App-data scope and folder](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Google browser token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
- [Drive API pricing and limits](https://developers.google.com/workspace/drive/api/guides/limits)
