# Cash Out

An installable, local-first PWA for private poker accounting: tables, buy-ins, cash-outs, history and settlement. Local beta; cloud setup is pending.

[Open / install Cash Out](https://strategamma.github.io/Cash-Out/downloads/) after the GitHub Pages deployment succeeds.

- **iPhone:** open in Safari → Share → Add to Home Screen; enable Open as Web App if offered.
- **Android:** open in Chrome → Install app / Add to Home screen.
- No Xcode, Apple membership, APK or app-store submission required.
- Offline startup is available after the initial successful online load. Confirmed changes save locally. Export full backups regularly until cloud backup is connected.

## Development and publishing

Node 22+; no third-party dependencies or package installation:

```
npm test
npm run build
python3 -m http.server 9185 --directory dist
```

`dist/` is generated and can be deleted after testing; GitHub Actions rebuilds it for publishing. Push to `main` and choose **Settings → Pages → GitHub Actions**. See [deployment setup](docs/PLATFORM_SETUP.md).

The built app starts empty with automatic local saves and a validated audit ledger. The design preview in `visualizations/wireframes/` keeps its separate sample data. Private records remain in browser storage, outside the public build. Google Drive setup follows deployment; automatic iCloud backup remains unresolved.
