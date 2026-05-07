---
version: alpha
name: Harmony Light
description: >
  Harmony Design System — light mode. Applies to all four product themes
  (Costpoint, Vantagepoint, PPM, Maconomy). Map the color tokens below
  directly to --dela-* CSS variables in the widget host stylesheet.

colors:
  # --dela-* widget surface tokens
  bg:           "#F7F8FA"
  border:       "#BFC6D4"
  primary:      "#4C92D9"
  primary-fg:   "#FFFFFF"
  surface:      "#E2E4E9"
  surface-fg:   "#373F4E"
  input-border: "#BFC6D4"
  muted:        "#6B7280"
  # extended palette
  primary-hover:   "#3D7BC4"
  nav-background:  "#FCFDFF"
  input-bg:        "#FFFFFF"
  input-disabled:  "#EAEAEA"
  cell-bg:         "#FFFFFF"
  hover:           "#E5E7EB"
  secondary-text:  "#525969"
  link:            "#005BB3"
  success:         "#17A871"
  warning:         "#F9AF00"
  error:           "#D83148"
  info:            "#00ADFD"
  accent:          "#043852"
  acid:            "#CCFF00"
  table-total:     "rgba(0, 115, 230, 0.15)"

typography:
  body-default:
    fontFamily: Figtree, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-emphasized:
    fontFamily: Figtree, sans-serif
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.5
  heading-xl:
    fontFamily: Lexend, sans-serif
    fontSize: 1.875rem
    fontWeight: 600
    lineHeight: 1.375
  heading-l:
    fontFamily: Lexend, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.375
  heading-m:
    fontFamily: Lexend, sans-serif
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.375
  heading-s:
    fontFamily: Lexend, sans-serif
    fontSize: 1.125rem
    fontWeight: 500
    lineHeight: 1.375
  label:
    fontFamily: Lexend, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Figtree, sans-serif
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5
  overline:
    fontFamily: Figtree, sans-serif
    fontSize: 0.625rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.1em
  code:
    fontFamily: JetBrains Mono, monospace
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5

rounded:
  sm:   4px
  md:   8px
  lg:   12px
  xl:   16px
  2xl:  24px
  full: 9999px

spacing:
  0:    0px
  xs:   4px
  sm:   8px
  md:   16px
  lg:   24px
  xl:   32px
  2xl:  48px
  3xl:  64px
  4xl:  96px

components:
  # ── Dela widget surface ─────────────────────────────────
  dela-widget:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.md}"
    padding:         16px

  # ── Button ───────────────────────────────────────────────
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.primary-fg}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor:       "{colors.primary-fg}"
  button-secondary:
    backgroundColor: "transparent"
    textColor:       "#1D4A7A"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-secondary-hover:
    backgroundColor: "#eaeff5"
    textColor:       "#1D4A7A"
  button-tertiary:
    backgroundColor: "transparent"
    textColor:       "#0073E6"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-tertiary-hover:
    backgroundColor: "#eaeff5"
    textColor:       "#0073E6"
  button-ghost:
    backgroundColor: "transparent"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-ghost-hover:
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  button-outline:
    backgroundColor: "transparent"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor:       "#FFFFFF"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-destructive-hover:
    backgroundColor: "#B8263B"
    textColor:       "#FFFFFF"

  # ── Badge ────────────────────────────────────────────────
  badge-default:
    backgroundColor: "#C7F2FF"
    textColor:       "#205A9E"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.primary-fg}"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-success:
    backgroundColor: "#DBF9A8"
    textColor:       "#316D15"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-warning:
    backgroundColor: "#FFF1BE"
    textColor:       "#AD5400"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-error:
    backgroundColor: "#FFECEF"
    textColor:       "#C1253A"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-info:
    backgroundColor: "#D0DFFF"
    textColor:       "#454BD4"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-orange:
    backgroundColor: "#FFE2C0"
    textColor:       "#6C1F07"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-pink:
    backgroundColor: "#FFDDF3"
    textColor:       "#B82890"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-disabled:
    backgroundColor: "#E0E4EB"
    textColor:       "#94A3B8"
    rounded:         "{rounded.full}"
    padding:         2px 8px

  # ── Card ─────────────────────────────────────────────────
  card:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.xl}"
    padding:         24px
  card-elevated:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.xl}"
    padding:         24px
  card-interactive:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.xl}"
    padding:         24px
  card-interactive-hover:
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  card-primary:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.xl}"
    padding:         24px

  # ── Table ────────────────────────────────────────────────
  table:
    backgroundColor: "{colors.cell-bg}"
    textColor:       "{colors.surface-fg}"
  table-header-gray:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.surface-fg}"
  table-header-white:
    backgroundColor: "#FFFFFF"
    textColor:       "{colors.surface-fg}"
  table-header-none:
    backgroundColor: "transparent"
    textColor:       "{colors.surface-fg}"
  table-striped:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.surface-fg}"
  table-row-hover:
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  table-total:
    backgroundColor: "rgba(0, 115, 230, 0.15)"
    textColor:       "{colors.surface-fg}"

  # ── Alert ────────────────────────────────────────────────
  alert-success:
    backgroundColor: "#DBF9A8"
    textColor:       "#316D15"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-warning:
    backgroundColor: "#FFF1BE"
    textColor:       "#AD5400"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-error:
    backgroundColor: "#FFECEF"
    textColor:       "#C1253A"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-info:
    backgroundColor: "#D0DFFF"
    textColor:       "#454BD4"
    rounded:         "{rounded.md}"
    padding:         16px

  # ── Input ────────────────────────────────────────────────
  input:
    backgroundColor: "{colors.input-bg}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  input-disabled:
    backgroundColor: "{colors.input-disabled}"
    textColor:       "{colors.muted}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px

  # ── Chip ─────────────────────────────────────────────────
  chip:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.surface-fg}"
    rounded:         "{rounded.full}"
    padding:         4px 12px

  # ── Chart (external library color mapping) ───────────────
  chart:
    backgroundColor: "{colors.bg}"
    textColor:       "{colors.muted}"
  chart-series-1:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.primary-fg}"
  chart-series-2:
    backgroundColor: "{colors.success}"
    textColor:       "#FFFFFF"
  chart-series-3:
    backgroundColor: "{colors.warning}"
    textColor:       "#373F4E"
  chart-series-4:
    backgroundColor: "{colors.error}"
    textColor:       "#FFFFFF"
  chart-series-5:
    backgroundColor: "{colors.info}"
    textColor:       "#FFFFFF"
  chart-series-6:
    backgroundColor: "{colors.accent}"
    textColor:       "#FFFFFF"
  chart-grid:
    backgroundColor: "{colors.border}"
    textColor:       "{colors.muted}"
---

## Overview

Harmony is an enterprise design system for Astro-based applications. It ships 50+ production-ready UI components, comprehensive theming, and zero-runtime-JS pure CSS architecture. This file represents **light mode**, which is identical across all four product themes: Costpoint (CP), Vantagepoint (VP), PPM, and Maconomy.

### --dela-* variable contract

When rendering in an MCP widget host, apply the color tokens above to the following CSS custom properties on the `my-widget` element:

```css
my-widget {
  --dela-bg:           #F7F8FA;   /* {colors.bg} */
  --dela-border:       #BFC6D4;   /* {colors.border} */
  --dela-primary:      #4C92D9;   /* {colors.primary} */
  --dela-primary-fg:   #FFFFFF;   /* {colors.primary-fg} */
  --dela-surface:      #E2E4E9;   /* {colors.surface} */
  --dela-surface-fg:   #373F4E;   /* {colors.surface-fg} */
  --dela-input-border: #BFC6D4;   /* {colors.input-border} */
  --dela-muted:        #6B7280;   /* {colors.muted} */
  --dela-font:         'Figtree', sans-serif;
  --dela-font-size-base: 1rem;
  --dela-radius:       8px;       /* {rounded.md} */
  --dela-radius-sm:    4px;       /* {rounded.sm} */
  --dela-min-tap:      44px;
}
```

For dark mode, see `DESIGN-cp-dark.md` (Costpoint) or `DESIGN-dark.md` (VP / PPM / Maconomy).

## Colors

The palette is built on a neutral blue-gray foundation with a single interactive primary.

- **bg (#F7F8FA):** Card and widget background. Maps to `--dela-bg`. Slightly elevated above the page background to provide visual separation.
- **border (#BFC6D4):** Widget outline, table grid lines, input borders, and dividers. Maps to `--dela-border` and `--dela-input-border`.
- **primary (#4C92D9):** The sole interactive color. Send buttons, user message bubbles, selected states, focus rings. Maps to `--dela-primary`.
- **primary-fg (#FFFFFF):** Text and icons rendered on top of the primary color. Maps to `--dela-primary-fg`.
- **surface (#E2E4E9):** Page background. Used for assistant message bubbles, attach button backgrounds, table row backgrounds. Maps to `--dela-surface`.
- **surface-fg (#373F4E):** Primary body text. Maps to `--dela-surface-fg`.
- **muted (#6B7280):** Secondary labels, placeholder text, animated thinking dots. Maps to `--dela-muted`.
- **success (#17A871):** Positive confirmations, completed states.
- **warning (#F9AF00):** Attention, cautions, degraded states.
- **error (#D83148):** Destructive actions, validation failures, critical alerts.
- **info (#00ADFD):** Informational highlights, neutral callouts.
- **accent (#043852):** Deep navy secondary accent for page header actions and special emphasis.
- **acid (#CCFF00):** Electric lime used only for Dela-branded gradient highlights.

## Typography

Three font families serve distinct roles. Load them from Google Fonts before rendering:

| Family | Role | CSS var |
|---|---|---|
| Figtree | Body text, labels, captions, UI copy | `--font-sans` |
| Lexend | Headings, display text, component labels | `--font-display` |
| JetBrains Mono | Code blocks, technical content | `--font-mono` |

**Scale:**

| Style | Size | Weight | Usage |
|---|---|---|---|
| display-xl | 3.75rem | bold | Hero headings |
| display-l | 3rem | bold | Page titles |
| heading-xl | 1.875rem | semibold | Section headings |
| heading-l | 1.5rem | semibold | Card titles |
| heading-m | 1.25rem | semibold | Panel headers |
| heading-s | 1.125rem | medium | Subsection labels |
| body-default | 1rem | normal | All running text |
| body-emphasized | 1rem | semibold | Key information |
| label | 0.875rem | normal | Form field labels |
| caption | 0.75rem | normal | Metadata, timestamps |
| overline | 0.625rem | semibold / uppercase / 0.1em tracking | Category markers |

The `--dela-font` variable maps to `'Figtree', sans-serif`. Use `--dela-font-size-base: 1rem` as the root font size for the widget.

## Layout

Harmony uses a **4px base grid**. All spacing values are multiples of 4px. The standard patterns:

- **Tight (4px / 8px):** Icon + text pairs, compact inline elements
- **Default (12px / 16px):** Form elements, card body padding, button groups
- **Relaxed (24px / 32px):** Between sections within a page
- **Loose (48px / 64px):** Between major page sections, hero areas

Shell layout uses three zones: `ShellHeader` (top bar, 48px tall), `LeftSidebar` (collapsible, 240px default), and a scrollable main content area. Page-level padding is 24px on all sides.

## Elevation & Depth

Shadows are applied in layers. Match shadow to the z-level of the element:

| Level | Token | Value | Usage |
|---|---|---|---|
| 0 | none | none | Page background, flush cards |
| 1 | sm | `0 1px 2px 0 rgb(15 23 42 / 0.05)` | Buttons, inputs, small cards |
| 2 | md | `0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)` | Dropdowns, popovers |
| 3 | lg | `0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)` | Modals, dialogs, notifications |
| 4 | xl | `0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.1)` | Full-screen overlays |
| 5 | 2xl | `0 30px 35px -8px rgb(15 23 42 / 0.15), 0 12px 15px -7px rgb(15 23 42 / 0.12)` | Featured hero content |

Dropdown menus use a dedicated shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`.

Focus rings use `0 0 0 3px var(--theme-primary-light)` — always visible, never suppressed.

## Shapes

Corner radius follows a named scale. Use the token reference in component definitions, never hardcode:

| Token | Value | Usage |
|---|---|---|
| rounded.sm | 4px | Buttons, textarea, small inputs (`--dela-radius-sm`) |
| rounded.md | 8px | Widget container, message bubbles (`--dela-radius`) |
| rounded.lg | 12px | Cards, table containers |
| rounded.xl | 16px | Modals, panels |
| rounded.2xl | 24px | Large featured cards |
| rounded.full | 9999px | Badges, chips, avatar circles, pill buttons |

## Components

### Button

**Props:** `variant`, `size`, `buttonType`, `icon`, `iconPosition`, `loading`, `loadingText`, `href`, `fullWidth`, `orientation`

| Variant | Background | Text | Use when |
|---|---|---|---|
| `primary` | `{colors.primary}` #4C92D9 | `{colors.primary-fg}` #FFFFFF | Primary CTA, send actions |
| `secondary` | transparent | #1D4A7A | Secondary actions alongside primary |
| `tertiary` | transparent | #0073E6 | Inline text-like actions |
| `ghost` | transparent | `{colors.surface-fg}` | Toolbar icon buttons |
| `outline` | transparent | `{colors.surface-fg}` | Bordered neutral actions |
| `destructive` | `{colors.error}` #D83148 | #FFFFFF | Delete, remove, irreversible actions |
| `dela` | gradient (acid + accent) | #FFFFFF | Dela AI branded actions only |

**Sizes:** `xs` (12px/6px), `sm` (12px/6px), `md` (16px/8px), `lg` (24px/12px). Default: `md`.

**buttonType `pageHeader`:** Uses the deep navy (`#043852`) primary instead of the theme blue — for actions in the ShellPageHeader bar only.

### Badge / Chip

**Props:** `variant`, `size`, `icon`

All variants use `rounded.full` (pill shape). Background / foreground pairs:

| Variant | Background | Text |
|---|---|---|
| default | #C7F2FF | #205A9E |
| primary | `{colors.primary}` | #FFFFFF |
| success | #DBF9A8 | #316D15 |
| warning | #FFF1BE | #AD5400 |
| error | #FFECEF | #C1253A |
| info | #D0DFFF | #454BD4 |
| orange | #FFE2C0 | #6C1F07 |
| pink | #FFDDF3 | #B82890 |
| disabled | #E0E4EB | #94A3B8 |

**Sizes:** `small` (8px/2px padding), `medium` (10px/4px), `large` (12px/6px).

### Card

**Props:** `elevated`, `interactive`, `primary`, `withHeader`, `headerTitle`, `headerSubtitle`, `icon1/2/3`

**Slots:** `header`, default body, `footer`, `header-actions`

| Variant | Visual difference |
|---|---|
| default | 1px border, `shadow-sm`, `rounded.xl` |
| `elevated` | `shadow-lg` replaces border |
| `interactive` | Cursor pointer, hover background shifts to `{colors.hover}` |
| `primary` | 4px top border in `{colors.primary}` |
| `withHeader` | Renders a structured header zone with title, subtitle, and up to 3 icon action buttons |

Background is always `{colors.bg}` (#F7F8FA). Inner content padding defaults to 24px.

### Table

**Props:** `headerVariant`, `striped`, `reorderable`, `grouped`, `sortColumns`, `sortColumn`, `sortDirection`

**Slots:** `filter-bar`, `title-bar-content`, `title-bar-icons`, `action-bar`, `header`, `body`

| Variant | Header background |
|---|---|
| `header-gray` (default) | `{colors.surface}` #E2E4E9 |
| `header-white` | #FFFFFF |
| `header-none` | transparent |

- **striped:** Alternating rows use `{colors.bg}` / `{colors.cell-bg}` (#F7F8FA / #FFFFFF)
- **grouped:** Adds a left-border group indicator in `{colors.border}`
- **reorderable:** Drag handle icon appears on row hover
- Sort indicators: ascending/descending chevron icons in `{colors.muted}`, active column header text in `{colors.primary}`
- Total/summary rows: `rgba(0, 115, 230, 0.15)` tinted background

### Alert

**Props:** `variant` (`success` | `warning` | `error` | `info`), `title`, `dismissible`, `icon`

Background / text pairs match Badge colors. Padding 16px, `rounded.md`. Icon is always the semantic variant icon (check, warning-triangle, x-circle, info-circle).

### Input / Textarea

**Props:** `type`, `placeholder`, `disabled`, `error`, `label`, `helperText`, `icon`

- Default: `{colors.input-bg}` background, `{colors.border}` border, `rounded.sm`
- Focus: border shifts to `{colors.primary}`, focus ring `0 0 0 3px var(--theme-primary-light)`
- Error: border shifts to `{colors.error}`
- Disabled: `{colors.input-disabled}` background (#EAEAEA), `{colors.muted}` text

The `--dela-input-border` variable maps to the default border state.

### Chart (external library)

Harmony does not ship a native Chart component. When rendering charts inside a Harmony-styled surface, use the following color assignments for library-agnostic theming (Chart.js, D3, Recharts, etc.):

| Role | Token | Hex |
|---|---|---|
| Series 1 | `{colors.primary}` | #4C92D9 |
| Series 2 | `{colors.success}` | #17A871 |
| Series 3 | `{colors.warning}` | #F9AF00 |
| Series 4 | `{colors.error}` | #D83148 |
| Series 5 | `{colors.info}` | #00ADFD |
| Series 6 | `{colors.accent}` | #043852 |
| Grid lines | `{colors.border}` | #BFC6D4 |
| Axis labels | `{colors.muted}` | #6B7280 |
| Chart background | `{colors.bg}` | #F7F8FA |
| Tooltip background | `{colors.cell-bg}` | #FFFFFF |
| Tooltip border | `{colors.border}` | #BFC6D4 |
| Tooltip text | `{colors.surface-fg}` | #373F4E |

Mount charts inside a `Card` component. Use `shadow-none` on the chart canvas itself.

## Do's and Don'ts

**Do:**
- Reference tokens using `{colors.*}`, `{rounded.*}`, `{spacing.*}` — never hardcode hex values in component logic
- Apply `--dela-*` CSS variables at the `my-widget` root using the exact hex values from the `colors` block above
- Use `{colors.primary}` for all interactive affordances: buttons, links, focus rings, selected states
- Use `{colors.error}` for destructive button variants and validation error states
- Map all chart series to the semantic palette in the order listed (primary → success → warning → error → info → accent)
- Use `rounded.full` (9999px) for badges, chips, avatars, and pill-style buttons
- Use `rounded.md` (8px) for the widget container (`--dela-radius`) and message bubbles
- Use `rounded.sm` (4px) for form controls and buttons (`--dela-radius-sm`)
- Set `--dela-min-tap: 44px` on mobile viewports for all interactive targets

**Don't:**
- Don't mix theme files — all tokens in this file apply to light mode only across all four product themes
- Don't use `{colors.accent}` (#043852) or `{colors.acid}` (#CCFF00) for general UI; reserve them for Dela-branded gradients and page header actions
- Don't use semantic badge colors (success/warning/error/info) for structural backgrounds — they are chip/badge/alert specific
- Don't suppress focus rings (`:focus { outline: none }`) — Harmony's accessibility model requires visible focus indicators
- Don't apply `shadow-lg` or higher to inline card content; reserve heavy shadows for modals and overlays
- Don't use the `pageHeader` buttonType outside of the `ShellPageHeader` slot
