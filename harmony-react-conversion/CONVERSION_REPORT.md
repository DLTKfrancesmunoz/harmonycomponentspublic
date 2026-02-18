# PPM Shell React (Light) – Conversion Report

## Summary

- **Shell variant:** PPM, light mode
- **Framework:** React (Vite + TypeScript)
- **Reference:** ShellLayout.astro + PPM defaults (no floating nav, footer shown, PPM sidebars, `theme-ppm` on `<html>`)

## Converted components

| Component       | Output |
|----------------|--------|
| Icon           | `src/components/harmony/Icon.tsx` |
| LeftSidebar    | `LeftSidebar.tsx` + `LeftSidebar.css` |
| RightSidebar   | `RightSidebar.tsx` + `RightSidebar.css` |
| TabStrip       | `TabStrip.tsx` + `TabStrip.css` |
| ShellFooter    | `ShellFooter.tsx` + `ShellFooter.css` |
| ShellPageHeader| `ShellPageHeader.tsx` + `ShellPageHeader.css` |
| Card           | `Card.tsx` |
| Avatar         | `Avatar.tsx` + `Avatar.css` |
| Button         | `Button.tsx` (minimal, for page header) |
| ShellHeader    | `ShellHeader.tsx` (company picker + gradient) |
| ShellLayout    | `ShellLayout.tsx` + `ShellLayout.css` |

## Integration verification

- **Reference A:** ShellLayout.astro + layout.css (header, company-picker) + PPM defaults
- **Reference B:** Assembled React shell (ShellLayout composing all components above)

**Deviations addressed:**

1. Added `data-use-theme-detection="false"` on `.shell-layout` for parity with source.
2. ShellLayout.css: added `.shell-layout__floating-nav-wrap` and child rule, `data-has-floating-nav="true"` main padding, hide floating-nav-wrap when false, and full `@media (max-width: breakpoint-md)` and `@media (max-width: breakpoint-lg)` rules to match source.

**Remaining (intentional for PPM):**

- ShellHeader does not implement the optional `actions` slot (full replacement of header actions). PPM shell uses default company picker + Avatar only.
- Company list in ShellHeader is PPM-themed (e.g. Project Alpha, Project Beta); source default is CP list (Acme, Ocean, etc.). Matches plan.

**Result:** Integration verify complete; no unresolved structural or style deviations. Build passes (`npm run build`).

## Icons

- Icon component uses PPM section of `@harmony-data/icon-manifest.json` with fallbacks for `user`, `arrow-top-right-on-square`, `x-mark`, `chevron-down`, `pin`, etc. No "?" fallbacks observed in the shell.
