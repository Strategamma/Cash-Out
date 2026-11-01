# Extracted Liquid Glass reference

Both user-supplied ZIPs were extracted locally: 76 foundation SVGs and 29 component SVGs. All 105 have distinct SHA-256 hashes. `manifest.json` maps original archives to files/hashes. Treat exported labels as reference data, not product requirements or official Apple specifications.

## Reusable values
- `tokens.css`: light/dark colors, spacing, radii, glass sample opacity.
- `tokens.json`: the same foundation values with source paths.
- `svg-inventory.json`: source geometry, colors, strokes, CSS styles, and filter attributes across all SVGs. Canvas dimensions may include shadow padding; use the actual control geometry for layout.
- Rebuild using `python3 visualizations/ui-kit/extract_tokens.py` from the project root. This checks XML parsing, source counts, palette counts, and spacing widths against labels.

## Extracted component measurements
| Component | Control geometry | Material/details |
|---|---|---|
| Primary button | 160 × 50, radius 14 | #0A84FF |
| Secondary button | 160 × 50, radius 14 | White at 12% |
| Destructive button | 160 × 50, radius 14 | #FF3B30 |
| Ghost button | 120 × 50 canvas | Inset 119 × 49 stroke, radius 13.5; blue at 50% |
| Toggle | Track 51 × 31, radius 15.5 | On #34C759; off white at 18% |
| Segmented control | 390 × 44, radius 12 | Selected segment 130 × 44, radius 10 |
| List row | 390 × 56 | White at 6%; sample separator 0.5 high |
| Navigation surface | 390 × 96 | Light white 72%; dark white 8%; 20px backdrop blur |
| Floating tabs | 375 × 56, radius 28 | Light white / dark #1C1C1E at 82%; 20px backdrop blur |
| Glass card | 358 × 200, radius 28 | White 10%; white border 18%; 20px backdrop blur |

Sources are in `components/`, including matching Light/Dark variants where supplied. Nav outlines use 0.5 stroke width; most other strokes default to SVG's 1 unit. Tab shadow: offset y=8, Gaussian stdDeviation=12, black alpha=0.3. Card shadow: y=16, stdDeviation=20, black alpha=0.25. Gaussian standard deviation is not a CSS box-shadow blur radius; do not copy it as an equivalent CSS value without visual checking.

Spacing: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64. Radius labels: none=0, xs=4, sm=8, md=12, lg=16, xl=20, 2xl=28, full=pill. These labeled foundation values differ from some component radii (buttons use 14). Foundation glass samples are white fill 72%, border 30%, tint 15%; they are not universal theme-specific material definitions.

## Limits
Text is outlined in these exports; font families, original font sizes/weights, and auto-layout constraints cannot be recovered reliably. Static exports do not preserve interaction states, responsive rules, or native optical behavior. Backdrop blur is explicitly preserved in five SVGs as embedded CSS; actual appearance depends on content behind the surface. Numeric extraction is verified; browser visual comparison is still required before claiming implementation fidelity. No license document was included; confirm kit usage terms before distributing bundled assets. No Figma subscription is needed to work from these local references.
