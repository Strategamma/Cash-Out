# Post-2024 references — checked 15 November 2026

These inform composition and interaction, not copies of their branding or assets. All poker illustrations here were drawn for Cash Out as lightweight SVGs. The existing Cash Out SVG wordmark is retained. No external fonts, photography, trackers or animation libraries are loaded.

| Reference | Dated evidence | Applied principle |
| --- | --- | --- |
| [Terminal Industries](https://terminal-industries.com/) | [Awwwards, 3 September 2025](https://www.awwwards.com/sites/terminal-industries) | Bold headline scale, clear frame/grid, generous spacing around a single visual object. Clubhouse uses these principles for its home composition. |
| [Dayos](https://www.dayos.com/) | [CSS Design Awards, 23 May 2025](https://www.cssdesignawards.com/sites/dayos/47483/) | Illustrated storytelling, purposeful movement and warm surfaces. Scorebook adapts the editorial warmth with ruled edges and a serif heading system. Current live content can differ from the 2025 award version. |
| [Linear, A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) | Article dated 12 March 2026 | Predictable action placement, calmer hierarchy and consistent navigation. Applied to the shared sidebar, phone navigation and quiet transaction screens. |

The dates establish post-2024 reference versions, not the original founding/launch dates of these services. Current live websites may have evolved since the dated releases. No claim is made that a single screenshot is the exact award-era rendering.

## Direction and motion decisions

Clubhouse: charcoal/ink, lively green, rounded solid cards, oversized sans headings, one sculptural poker illustration. Casual and confident, with explicit numbers and status labels.

Scorebook: warm paper, forest-green ink, editorial serif headings, ruled edges and flatter shapes. The same features and data hierarchy; softer and more archival. Both directions offer light/dark and remain usable on narrow phones.

Modern Web Guidance queried and retrieved `directional-navigation-transitions` and `same-document-transitions`. The content pane has one unique transition name. Native route transitions use short transform/opacity motion, a backward direction for return navigation, and focus restoration to the new content container. Unsupported browsers receive immediate DOM updates with a brief CSS entrance; reduced-motion users receive immediate updates without that entrance. Direction-type selectors are feature detected separately; an API-only browser uses the callback signature without transition types. No library or polyfill is needed.

No financial digits roll or morph. Clocks update independently. Decorative illustrations appear on home, tournament and recovery screens; cash input/review keeps its number dominant. Motion never delays a confirmed amount or triggers a payment.

## Dribbble motion study — 19 November 2026

- [Ronas IT — Tab Bar Switches Interaction](https://dribbble.com/shots/14028381-Tab-Bar-Switches-Interaction): selection continuity and clear active state. Adaptation: persistent measured highlight in desktop rail / phone navigation; labels stay visible.
- [Mal / Keitoto — Karvio, Animated Bar Chart with Tab Switch](https://dribbble.com/shots/27340882-Karvio-Animated-Bar-Chart-with-Tab-Switch): direct deactivation, softer activation, restrained highlight. Adaptation: selected-bar light feedback with fixed exact heights and stationary monetary text.
- [Danijel Stamenic — Dark Mode Navigation Concept](https://dribbble.com/shots/27163775-Dark-Mode-Navigation-Concept-UI-Interaction): compact hover feedback and clear typography. Adaptation: small arrow travel and nonfinancial surface lift, with pointer/hover capability guards.

These are conceptual references, not copied assets, code or exact timings. Publication dates are not asserted. Primary descriptions were read; Karvio's visual presentation was inspected in the browser. `glass-motion.*` is original local code. Glass uses translucent fills, native backdrop filtering, a masked edge highlight and original `assets/glass-field.svg`; solid surfaces remain when filtering is unsupported. Native iOS Liquid Glass is not loaded.

Timing follows installed transitions-dev / transitions-polish guidance: sliding controls and page entrance 250ms, four-item history reveal capped at 40ms offsets (120ms total), immediate reduced-motion path. Existing View Transitions focus routing and capability checks remain; no Dribbble media ships with Cash Out.

Receipt export uses Canvas PNG generation and capability-checked Web Share with a download fallback. API reference: [MDN share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share), [MDN canShare](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare). Files are prepared before user activation; completion is not described as delivery.
