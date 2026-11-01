# PWA-only cleanup
- Goal: prioritize the installable PWA and reduce project storage.
- Scope: remove native projects, mobile CI, tooling/dependencies, redundant generated builds/archives; preserve app source, cloud adapter, ledger, icons, tests, design references and browser records.
- Approach: restore a dependency-free Node build; keep GitHub Pages and refresh phone installation guidance. Preserve Git history rather than rewrite it for small savings.
- Risks: dangling native imports, deleted required assets and stale deployment instructions.
- Verification: accounting/backup/ledger/offline suite, build asset references, syntax checks, storage totals and install-page browser check. Cloud/device testing remains pending.

- Status: native projects, tooling, mobile workflow, source ZIP and generated build removed. 52 PWA/accounting/backup checks and dependency-free build passed; browser verified iPhone/Android PWA installation guidance. Saved browser records and design references were preserved.
