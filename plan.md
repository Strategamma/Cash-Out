# Native downloads
- Goal: package the local-first platform as Android/iOS apps in Strategamma/Cash-Out; leave live cloud setup deferred.
- Scope: Capacitor projects, native file export/sharing and navigation, icons, repeatable GitHub builds and public development downloads. iPhone signing depends on Apple credentials/membership.
- Approach: bundle the existing validated app, preserve awaited IndexedDB saves, disable browser-only Drive authorization inside native builds, use OS share sheets for backup/CSV export. Publish honest simulator/source iOS artifacts until signing is available.
- Risks: no local Android SDK/full Xcode; WebView downloads and identity cannot be treated as browser flows; debug APK signing is for testing only; backups do not migrate automatically across origins/apps.
- Verification: existing suite, native adapter tests, asset build/sync, GitHub Android/iOS build status and artifact evidence when publishing is available. Physical-device and signed iPhone distribution remain explicit release gates.

- Status: native projects/assets generated; native sync and 57 tests pass; plist/Xcode project syntax validated. No local SDK/full Xcode or Git credentials; GitHub Desktop computer access was not approved. Native compilation and public release require a push followed by successful Actions runs. User confirmed no Apple membership/Xcode; free iPhone PWA is the distribution route.
