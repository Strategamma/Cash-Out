# Cash Out

Private, local-first poker accounting for tables, buy-ins, cash-outs and settlement. Local beta; cloud setup is pending.

- [Android downloads / development releases](https://github.com/Strategamma/Cash-Out/releases)
- [Install on iPhone or open the web app](https://strategamma.github.io/Cash-Out/downloads/)
- [Native build and installation guide](docs/MOBILE.md)
- [GitHub Pages setup](docs/PLATFORM_SETUP.md)

Downloads appear after the corresponding GitHub Actions builds succeed. Android is a development-signed Debug APK. iPhone currently uses Safari → Share → Add to Home Screen, free and without Xcode. An iOS simulator ZIP is not an iPhone installer.

## Development

Node 22+:

```
npm ci
npm test
npm run build
```

`dist/` contains only allowlisted public app assets; private records stay in device storage. The built app starts empty with automatic local saves and an audit ledger. The design preview in `visualizations/wireframes/` retains its separate sample data.

For native builds: `npm run native:sync`, then Android SDK/JDK 21 or Xcode 26+ as described in the mobile guide. Export backups regularly until cloud backup is connected. Do not uninstall an app holding your only copy of important records.
