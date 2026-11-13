# Animation source

The small, plain-CSS animation subset in `motion.css` adapts the enter keyframe and fade/zoom/slide utility conventions from [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css). This is the animation package named in [shadcn/ui's installation instructions](https://ui.shadcn.com/docs/installation/manual). The fade/95%-zoom/200ms dialog pattern follows the [official shadcn dialog source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/dialog.tsx). This project does not install React, Tailwind, Radix, or the full shadcn component framework.

## tw-animate-css — MIT License

Copyright (c) 2025 Wombosvideo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Approved UI component ports

`profile.js`, `ui-polish.js` and `ui-polish.css` adapt the installed sources described in the pinned source versions below. No React, Motion, Tailwind or Radix runtime is installed.

- Magic UI, copyright Magic UI, commit `2712647e193295d2fd85b65e58095fb2009736d7`: MagicCard pointer/focus gradient and BlurFade heading entrance. Plain DOM/CSS port; no tilt, orb or continuous loops. [MIT license](licenses/magicui-LICENSE.md).
- Spectrum UI, commit `acdc998c64829f8ae037be48e3c273ccc8d71f60`: StatCards captions and MorphButton pending feedback. Values stay static; loading follows the real awaited action, never a timed success. [Apache-2.0 license](licenses/spectrum-ui-LICENSE).
- Transitions.dev, commit `20d70c1262bf721c0300c2946cbe1fc7605a555c`: modal entrance timing adapted to the existing native dialog; dirty-draft guards retained. [Full component license](licenses/transitions-dev-LICENSE).

Ports modified for Cash Out on 13 November 2026. Saved-record statistics remain in paise and use completed, reconciled sessions. Reduced motion removes entrances, spinner rotation, pointer tracking and indicator travel.
