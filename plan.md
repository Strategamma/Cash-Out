# Platform foundation
- Goal: package the reviewed app for GitHub Pages and offline testing.
- Scope: allowlisted static build, manifest/service worker, deployment workflow and guide. Production ledger and iCloud remain subsequent milestones.
- Approach: preserve the reviewed UI and direct Drive backup code; cache public app files only, with no automatic update reload.
- Risks: subpaths, stale caches, publishing private records; hosted OAuth requires registered origin and public client ID.
- Verification: existing tests, build asset graph, offline/service-worker privacy checks; hosted OAuth and iPhone checks remain manual.
- Status: 41 tests pass; built app loaded and reloaded with its local server stopped. Build/deployment foundation complete. Production ledger is the next milestone; no deployment performed.

## Previous milestone
- Goal: build direct app-data-only Drive backup, with honest cost/status and recoverable local saves.
- Scope: reusable Drive adapter, IndexedDB snapshot store, opt-in prototype autosave, connect/reconnect/disconnect, versioned snapshot listing and preview-before-restore, configuration/setup guide. iCloud remains required but separate.
- Approach: exact drive.appdata scope; Google Identity Services; memory-only tokens; owner binding; local revision checks; coalesced uploads and bounded retries. Keep demo JSON distinct from a production ledger contract.
- Risks: OAuth client ID/project needed for real authorization; quota/Drive storage fees may change; no upload while suspended/offline; concurrent edits must not silently overwrite; snapshot history uses Drive storage.
- Verification: existing accounting tests plus adapter/store/controller failure tests, browser unconfigured/local-save/reload/status/restore flows; live Google/iPhone checks reported separately.
- Status: reusable backup code and prototype integration complete; 36 tests pass, real IndexedDB reload/concurrent-tab behavior verified. Google OAuth client setup and live provider testing remain pending; iCloud separate.
