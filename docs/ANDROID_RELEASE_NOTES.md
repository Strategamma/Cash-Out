Cash Out local beta · Android development build

- Download `Cash-Out-Android-debug.apk` on your Android phone (Android 7/API 24 or newer).
- This is a **Debug APK**, signed with a development key, not a production/Play Store release. Test with non-critical records first. Verify the accompanying SHA-256 checksum if needed.
- The beta uses application ID `com.strategamma.cashout.beta` and is separate from a future production app.
- Build-run signing keys may differ. Export a full backup before upgrading. If Android refuses an update because its signature differs, keep the old installation until its full backup is safely exported; uninstalling removes its private records.
- Automatic local saves, audit history, INR buy-ins/cash-outs, settlement and full backup import/export are included. Native exports open the system share sheet; saving or sending is your choice. Check the destination file after exporting.
- Google Drive/native OAuth and iCloud are not connected. No real money is transferred by this app. Browser/PWA data does not automatically move into the native app; explicitly export and restore a full backup.

**iPhone:** use the free web app in Safari → Share → Add to Home Screen: https://strategamma.github.io/Cash-Out/downloads/

The iOS simulator ZIP, if attached, is a developer resource for a Mac with Xcode. It is **not** an installable iPhone app. Signed iPhone distribution remains unavailable without Apple signing.

Source: https://github.com/Strategamma/Cash-Out
