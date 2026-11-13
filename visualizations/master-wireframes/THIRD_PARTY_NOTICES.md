# Installed UI sources and adaptations

Selected upstream component sources are vendored locally under `vendor/`. Exact upstream paths, pinned commit IDs, URLs, file sizes and SHA-256 hashes are in `vendor/manifest.json`. These are component-source installations, not npm runtime dependencies or full repository clones. The original React/TSX references are not executed; the current dependency-free PWA stack is preserved.

| Source | Pinned commit | Used in Cash Out | License file |
| --- | --- | --- | --- |
| [Transitions.dev](https://github.com/Jakubantalik/transitions.dev) | `20d70c1262bf721c0300c2946cbe1fc7605a555c` | Native early-exit dialog entrance/exit and acknowledged-success check | `vendor/transitions-dev/LICENSE` |
| [Magic UI](https://github.com/magicuidesign/magicui) | `2712647e193295d2fd85b65e58095fb2009736d7` | BlurFade heading entrance and masked radial-gradient ShineBorder and MagicCard highlight | `vendor/magicui/LICENSE.md` |
| [Spectrum UI](https://github.com/arihantcodes/spectrum-ui) | `acdc998c64829f8ae037be48e3c273ccc8d71f60` | MorphButton loading/success/error states and polite status announcements; captioned StatCards and inspectable chart | `vendor/spectrum-ui/LICENSE` |

Modification notices: `library-motion.css` and `library-motion.js` are plain CSS/DOM adaptations made for Cash Out on 13 November 2026. Original React, Motion, Tailwind, Radix and utility imports were replaced with native CSS animation, DOM attributes and Web Animations. No downloaded third-party JavaScript/tooling was executed. No paid transition or authenticated registry access was used.

- Transitions.dev: native `<dialog>` retains focus trapping and Escape behavior. Scale is 0.96, open 250ms/close 150ms. Success check uses only fade/path draw; rotation, bob and blur were removed. This product uses the selected transitions; it does not redistribute the collection as a competing library. Its component/skill license differs from its MIT tooling license; retain the included full license.
- Magic UI, copyright Magic UI: keep the original MIT license. Heading BlurFade uses 4px/2px/260ms, with money outside the blur target. ShineBorder retains the masked radial-gradient technique; uses one 4-second pass rather than an infinite animation. MagicCard uses a restrained pointer/focus gradient; no orb, tilt or spring dependencies.
- Spectrum UI: keep the original Apache-2.0 license and upstream MorphButton header in the reference file. Modified from React multi-state action to a native promise-driven action helper. Button footprint stays fixed; width morph/shake are omitted for financial controls. Buttons disable while an action is pending; success requires promise resolution, errors allow retry, edits reset the state. Original component uses timed reset; this port resets on form input. StatCards retain exact static values and contextual captions; chart inspection uses a native keyboard-accessible range. Rolling numbers are omitted.

Motion is disabled for `prefers-reduced-motion`. Decorative layers do not receive pointer input. No number rolling, confetti, flashing, countdown animation beyond exact text updates, or continuous decorative loops. Only selected source references are stored locally; no `node_modules` directory was created.

Approved profile surfaces, chart/session components and selected native motion ports are now integrated into the PWA as `profile.js` and `ui-polish.*`. App statistics use saved records and pending feedback follows the existing awaited action. Runtime licenses are retained in the app; these master wireframes remain an illustrative design set.
