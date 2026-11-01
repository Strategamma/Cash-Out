# Android and iPhone downloads

## User installation

- **Android:** download the Debug APK from https://github.com/Strategamma/Cash-Out/releases after the mobile workflow succeeds. See `ANDROID_RELEASE_NOTES.md` for signing/update limitations. This is a development beta, not Play Store ready.
- **iPhone, without Xcode or Apple membership:** open https://strategamma.github.io/Cash-Out/downloads/ in Safari; open the app and choose Share → Add to Home Screen. Enable Open as Web App if offered. This needs the Pages workflow to complete first. Visit online once before expecting offline startup.
- A simulator `.app` ZIP cannot be installed on an iPhone. No signed IPA or TestFlight distribution is configured. Native iPhone distribution requires Apple signing; cloud integration remains deferred.

## Reproducible builds

Use Node 22+ and `npm ci`. `npm run native:sync` builds the validated platform assets and copies them into the committed Capacitor Android/iOS projects. No hosted web URL is embedded: native builds bundle the app and open offline. `npm run native:icons` reproduces native/PWA icons from the approved chip/spade SVG.

### Android

App ID: `com.strategamma.cashout` (development Debug build adds `.beta`). Capacitor 8, Android SDK 36, minimum API 24, JDK 21, Gradle wrapper included. With Android SDK installed, `npm run android:build` creates `android/app/build/outputs/apk/debug/app-debug.apk`. It is development-signed; a stable private production keystore is required before durable public distribution. Never commit keystores/passwords.

### iOS

Bundle ID: `com.strategamma.cashout`; minimum iOS 15; Capacitor 8 requires Xcode 26+. `npm run ios:open` opens the native project when Xcode is installed. The GitHub workflow uses a hosted Mac to compile a signing-free simulator bundle, so a local Xcode installation is not needed to generate the developer artifact. It does not produce an iPhone installer. Signing/TestFlight/App Store work is deliberately not configured without an Apple account.

## GitHub workflow

Push this repository to `main`, including `.github/workflows/mobile.yml`, native source folders, lockfile and the local ledger changes. **Build mobile downloads** also supports Run workflow. Android and iOS compile independently. Successful Android builds publish a prerelease containing the APK/checksum; successful iOS simulator builds attach developer files to that release. Android publication does not wait for iOS compilation. Workflow logs provide the authoritative build/publish result.

GitHub authentication was unavailable in the coding environment. Source/project generation and local web checks do not prove a native build succeeded. Until the workflow runs successfully, there is no newly verified APK or iOS compiled artifact to download.

## Native behavior and remaining QA

- Records stay in the native app's private IndexedDB origin. Browser, home-screen and native installations have separate storage; moving needs full backup export/import. Android automatic OS backup is disabled; explicit exports remain available. Uninstalling can erase local records.
- Backup/CSV/summary export writes a private cache file then opens the OS share sheet. The user chooses Save to Files, Drive or a recipient; this is manual export, not automatic cloud backup. Cached export files can be removed by the OS. Closing the sheet does not prove a destination saved the file.
- Browser service workers are skipped in native builds. Google browser token authorization is disabled there pending a proper native/system-browser identity flow. Google configuration can still be used by the hosted PWA after deployment.
- Android back closes/guards unsaved dialogs before leaving a view and ignores navigation during a save. This and native file picker/exports require physical-device validation.
- iOS has the Filesystem privacy manifest reason C617.1; no automatic photo/contact access is requested. No Apple account, paid membership or SDK license was accepted during setup.
- Remaining release gates: real APK install/relaunch/update, iPhone PWA install/relaunch, native import/export on devices, large-history profiling, privacy/store review, stable production signing and cloud/iCloud connections.

Dependency check: runtime dependencies report zero known vulnerabilities (`npm audit --omit=dev`). The current Capacitor CLI development dependency has four moderate transitive audit findings with no upstream fix reported; it is build tooling and is not bundled into the app.
