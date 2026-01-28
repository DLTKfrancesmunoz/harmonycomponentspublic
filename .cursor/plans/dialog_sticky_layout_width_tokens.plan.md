---
name: ""
overview: ""
todos: []
isProject: false
---

# Dialog: Sticky Header/Footer, Width, and Design Tokens Only

## Overview

Update the Dialog component so the header and footer are sticky (always visible), the dialog has a minimum width of 600px (preferred 700px), and **all styles use design tokens only—no hardcoded values** (no raw `16px`, `32px`, `200px`, `120px`, `90vw`, etc.).

---

## 1. Sticky header and footer (always visible)

**Current issue:** The dialog is not a flex column, so when body content overflows, the whole dialog grows and can clip. The body has `overflow-y: auto` but no height constraint on desktop, so the header/footer scroll away with content.

**Change:** Make the dialog a column flex container so only the body scrolls; header and footer stay fixed at top and bottom.

- **[src/styles/components.css](src/styles/components.css)** (Dialog section, ~2552–2635):
- `.dialog`: Add `display: flex; flex-direction: column;` so header, body, and footer are flex children.
- `.dialog__header`: Add `flex-shrink: 0` so it never shrinks and stays at top.
- `.dialog__body`: Add `flex: 1 1 0; min-height: 0;` so it takes remaining space, can shrink, and `overflow-y: auto` creates a scroll region. Keep existing `padding`, `overflow-y: auto`, `color`.
- `.dialog__footer`: Add `flex-shrink: 0` so it never shrinks and stays at bottom.

No hardcoded values; use only existing layout properties (flex, min-height: 0).

---

## 2. Dialog width: at least 600px, preferred 700px

**Current:** [src/styles/tokens.css](src/styles/tokens.css) defines `--dialog-max-width-default: 500px` and `--dialog-width-percentage: 90%`. Components use these; responsive block uses hardcoded `32px`, `16px`, `90vw`.

**Change:**

- **Tokens ([src/styles/tokens.css](src/styles/tokens.css))**  
In the "Dialog Component Tokens" block (~213–217):
- Set `--dialog-max-width-default: 700px` (preferred width).
- Add `--dialog-min-width: 600px` (minimum width).
- Keep or adjust `--dialog-width-percentage` as needed; ensure at least one of min/max enforces 600px–700px.
- Add tokens for any values currently hardcoded in dialog styles (see section 3).

- **Components ([src/styles/components.css](src/styles/components.css))**  
- `.dialog`: Use `min-width: var(--dialog-min-width); max-width: var(--dialog-max-width-default);` (and existing `width`/percentage if desired). Remove any hardcoded widths.
- In responsive blocks, replace every hardcoded length with a token (see section 3).

---

## 3. No hardcoded styles — use design tokens only

**Current hardcoded values in Dialog** (all must be removed):

| Location | Current | Replace with |
|----------|---------|--------------|
| `@media (max-width: var(--breakpoint-md))` .dialog | `width: calc(100vw - 32px)` | `width: calc(100vw - var(--dialog-margin-horizontal))` and define `--dialog-margin-horizontal` in tokens (e.g. `var(--space-8)` or a new token). |
| Same | `margin: 16px` | `margin: var(--dialog-margin)` — add `--dialog-margin` in tokens (e.g. `var(--space-4)`). |
| Same | `max-height: calc(100vh - 32px)` | `max-height: calc(100vh - var(--dialog-margin-vertical))` — add token (e.g. `var(--space-8)`). |
| Same .dialog__body | `max-height: calc(100vh - 200px)` | Use flex layout (section 1) so body doesn’t need this; or `max-height: calc(100vh - var(--dialog-header-footer-reserved))` and add `--dialog-header-footer-reserved` in tokens (spacing-based). |
| Same .dialog__footer .btn | `min-width: 120px` | `min-width: var(--dialog-footer-btn-min-width)` — add in tokens (e.g. a spacing-based value). |
| `@media (min-width: breakpoint-md) and (max-width: breakpoint-lg)` .dialog | `max-width: 90vw` | `max-width: var(--dialog-max-width-medium)` — add token (e.g. `90vw` as token value if we want to keep it, or a calc using tokens). |

**Token additions in [src/styles/tokens.css](src/styles/tokens.css)** (Dialog block):

- `--dialog-min-width: 600px`
- `--dialog-max-width-default: 700px`
- `--dialog-margin: var(--space-4)` (or `--space-8` for 32px)
- `--dialog-margin-horizontal: var(--space-8)`
- `--dialog-margin-vertical: var(--space-8)`
- `--dialog-header-footer-reserved` (only if keeping a fallback max-height on body; use spacing tokens, e.g. `var(--space-20) * 2.5` or a single token like `200px` in tokens file only)
- `--dialog-footer-btn-min-width` (e.g. map to existing spacing or new value in tokens)
- `--dialog-max-width-medium: 90vw` (or desired value)

**Rule:** In [src/styles/components.css](src/styles/components.css), the Dialog section and its media queries must not contain any literal pixel or vw values; use only `var(--…)` references (tokens) and existing tokens for spacing, radius, colors, typography, transitions, z-index.

---

## 4. Documentation page

- **[src/pages/components/dialogs.astro](src/pages/components/dialogs.astro)**  
- Update the page description to mention: sticky header and footer (always visible while body scrolls), min width 600px / default 700px, and that all dialog styling uses design tokens.
- In the Accessibility or a new "Layout" subsection: note that the header stays at top and footer at bottom; only the body scrolls when content overflows.
- Optionally add a "Long content / scroll" example (e.g. a dialog with many paragraphs or a form) so the sticky behavior is visible in the docs.

---

## 5. Preview page

- **[src/pages/preview/dialogs.astro](src/pages/preview/dialogs.astro)**  
- Ensure the preview still opens and closes correctly after CSS changes.
- Optionally add a second example with long body content so preview demonstrates sticky header/footer and body scroll (no markup change to Dialog.astro required).

---

## 6. Changelog and package version

- **[CHANGELOG.md](CHANGELOG.md)**  
- Add a new version entry (e.g. `[1.0.1]`) with a **Changed** section: Dialog layout (sticky header/footer, body scroll), min width 600px / max 700px, all dialog styles use design tokens (no hardcoded values).

- **[package.json](package.json)**  
- Bump `version` (e.g. `1.0.0` → `1.0.1`) so the release that includes these changes is versioned correctly.

---

## 7. MCP / component data

- **[mcp-data/components/dialog.json](mcp-data/components/dialog.json)**  
- Update `visualSpecifications.dimensions` to reflect the new sizing: e.g. set `minWidth` to the token or value (600px) and `maxWidth` to 700px (or token name) for the relevant breakpoint/size so MCP and tooling stay in sync with the component.

- **Token data**  
- If [mcp-data/design-tokens.json](mcp-data/design-tokens.json) or any script documents dialog tokens, add the new tokens (`--dialog-min-width`, `--dialog-max-width-default`, `--dialog-margin`, etc.) there so the design system data is complete.

---

## 8. Files to touch (summary)

| Area | File(s) |
|------|--------|
| Tokens | [src/styles/tokens.css](src/styles/tokens.css) |
| Component styles | [src/styles/components.css](src/styles/components.css) |
| Documentation | [src/pages/components/dialogs.astro](src/pages/components/dialogs.astro) |
| Preview | [src/pages/preview/dialogs.astro](src/pages/preview/dialogs.astro) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Package | [package.json](package.json) |
| Component data | [mcp-data/components/dialog.json](mcp-data/components/dialog.json) |
| Token data | [mcp-data/design-tokens.json](mcp-data/design-tokens.json) or scripts that list dialog tokens |

---

## 9. Summary

- **Sticky:** Dialog = flex column; header and footer = `flex-shrink: 0`; body = `flex: 1 1 0; min-height: 0; overflow-y: auto`.
- **Width:** Tokens `--dialog-min-width: 600px`, `--dialog-max-width-default: 700px`; component uses only these (and optional percentage token).
- **No hardcoded styles:** All dialog-related values in `components.css` come from [tokens.css](src/styles/tokens.css) (spacing, radius, colors, typography, and new dialog tokens). No raw `16px`, `32px`, `200px`, `120px`, `90vw` in the dialog section.
- **Everything it pertains to:** Styles (tokens + components.css), documentation page, preview page, CHANGELOG, package version, and MCP/component data are all updated so the Dialog stays consistent across the repo and any consumers (npm, docs, tooling).