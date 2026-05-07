---
version: alpha
name: Harmony CP Dark
description: >
  Harmony Design System — Costpoint (CP) dark mode. The CP dark palette uses
  a warm blue-gray family distinct from the near-black palette used by VP,
  PPM, and Maconomy in dark mode. Map the color tokens below directly to
  --dela-* CSS variables in the widget host stylesheet.

colors:
  # --dela-* widget surface tokens
  bg:           "#37424D"
  border:       "#5F6871"
  primary:      "#59ACFF"
  primary-fg:   "#1F252E"
  surface:      "#1F252E"
  surface-fg:   "#E9ECEF"
  input-border: "#5F6871"
  muted:        "#BBBBC6"
  # extended palette
  primary-hover:   "#7BB8FF"
  nav-background:  "#333D47"
  input-bg:        "#1F252E"
  input-disabled:  "#333D47"
  cell-bg:         "#212935"
  hover:           "#3D4A5C"
  secondary-text:  "#B6B6C4"
  link:            "#ADD0FF"
  success:         "#00E78E"
  warning:         "#F9AF00"
  error:           "#F46286"
  info:            "#00ADFD"
  accent:          "#043852"
  acid:            "#CCFF00"
  table-total:     "rgba(89, 172, 255, 0.15)"

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
    textColor:       "#3D6BA8"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-secondary-hover:
    backgroundColor: "#3D4A5C"
    textColor:       "#E9ECEF"
  button-tertiary:
    backgroundColor: "transparent"
    textColor:       "{colors.primary}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-tertiary-hover:
    backgroundColor: "#3D4A5C"
    textColor:       "{colors.primary}"
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
    textColor:       "{colors.primary-fg}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-destructive-hover:
    backgroundColor: "#D94070"
    textColor:       "{colors.primary-fg}"

  # ── Badge ────────────────────────────────────────────────
  badge-default:
    backgroundColor: "#1C3A5C"
    textColor:       "#ADD0FF"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.primary-fg}"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-success:
    backgroundColor: "#1A3D2B"
    textColor:       "#00E78E"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-warning:
    backgroundColor: "#3D2E00"
    textColor:       "#F9AF00"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-error:
    backgroundColor: "#3D1A24"
    textColor:       "#F46286"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-info:
    backgroundColor: "#1A2A3D"
    textColor:       "#00ADFD"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-orange:
    backgroundColor: "#3D2200"
    textColor:       "#FFB347"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-pink:
    backgroundColor: "#3D1A30"
    textColor:       "#FF80CC"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-disabled:
    backgroundColor: "#2A3340"
    textColor:       "#5F6871"
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
    backgroundColor: "#2A3340"
    textColor:       "{colors.surface-fg}"
  table-header-none:
    backgroundColor: "transparent"
    textColor:       "{colors.surface-fg}"
  table-striped:
    backgroundColor: "#2C3640"
    textColor:       "{colors.surface-fg}"
  table-row-hover:
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  table-total:
    backgroundColor: "rgba(89, 172, 255, 0.15)"
    textColor:       "{colors.surface-fg}"

  # ── Alert ────────────────────────────────────────────────
  alert-success:
    backgroundColor: "#1A3D2B"
    textColor:       "#00E78E"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-warning:
    backgroundColor: "#3D2E00"
    textColor:       "#F9AF00"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-error:
    backgroundColor: "#3D1A24"
    textColor:       "#F46286"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-info:
    backgroundColor: "#1A2A3D"
    textColor:       "#00ADFD"
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
    textColor:       "#1F252E"
  chart-series-3:
    backgroundColor: "{colors.warning}"
    textColor:       "#1F252E"
  chart-series-4:
    backgroundColor: "{colors.error}"
    textColor:       "#1F252E"
  chart-series-5:
    backgroundColor: "{colors.info}"
    textColor:       "#1F252E"
  chart-series-6:
    backgroundColor: "#CCFF00"
    textColor:       "#1F252E"
  chart-grid:
    backgroundColor: "{colors.border}"
    textColor:       "{colors.muted}"
---

## Overview

This file represents **Costpoint (CP) dark mode**. The CP dark palette uses warm blue-gray tones — shifted toward slate-blue — which differ from the near-black neutral dark palette used by VP, PPM, and Maconomy. Activate dark mode in Harmony by adding both `theme-cp` and `dark` classes to the `<html>` element.

### --dela-* variable contract

```css
my-widget {
  --dela-bg:           #37424D;   /* {colors.bg} */
  --dela-border:       #5F6871;   /* {colors.border} */
  --dela-primary:      #59ACFF;   /* {colors.primary} */
  --dela-primary-fg:   #1F252E;   /* {colors.primary-fg} */
  --dela-surface:      #1F252E;   /* {colors.surface} */
  --dela-surface-fg:   #E9ECEF;   /* {colors.surface-fg} */
  --dela-input-border: #5F6871;   /* {colors.input-border} */
  --dela-muted:        #BBBBC6;   /* {colors.muted} */
  --dela-font:         'Figtree', sans-serif;
  --dela-font-size-base: 1rem;
  --dela-radius:       8px;       /* {rounded.md} */
  --dela-radius-sm:    4px;       /* {rounded.sm} */
  --dela-min-tap:      44px;
}
```

For light mode (all themes), see `DESIGN-light.md`. For VP / PPM / Maconomy dark, see `DESIGN-dark.md`.

## Colors

The CP dark palette uses the blue-gray family characteristic of Costpoint's navy brand identity. Backgrounds are elevated rather than near-black, giving a warmer feel compared to VP dark.

- **bg (#37424D):** Card and widget background. Visually elevated above the page surface. Maps to `--dela-bg`.
- **border (#5F6871):** Widget outline, dividers, table grid. Maps to `--dela-border` and `--dela-input-border`.
- **primary (#59ACFF):** Bright sky-blue interactive color for dark backgrounds. Send buttons, user bubbles, focus rings. Maps to `--dela-primary`.
- **primary-fg (#1F252E):** Dark text rendered on the light-blue primary. Maps to `--dela-primary-fg`.
- **surface (#1F252E):** Page background — the deepest layer. Used for assistant message bubbles and attach button backgrounds. Maps to `--dela-surface`.
- **surface-fg (#E9ECEF):** Off-white body text for comfortable dark-mode reading. Maps to `--dela-surface-fg`.
- **muted (#BBBBC6):** Secondary text, placeholders, animated thinking dots. Maps to `--dela-muted`.
- **success (#00E78E):** Bright green for confirmations on dark backgrounds.
- **warning (#F9AF00):** Amber unchanged — works on dark.
- **error (#F46286):** Soft red-pink for error states — higher lightness for dark-mode legibility.
- **info (#00ADFD):** Bright cyan information highlight.
- **hover (#3D4A5C):** Row hover, button secondary/tertiary hover backgrounds.
- **nav-background (#333D47):** Shell left sidebar and nav rail background.

## Typography

Font families and sizes are identical to light mode. No adjustments needed for dark mode — Harmony's typography tokens are mode-agnostic.

| Family | Role | CSS var |
|---|---|---|
| Figtree | Body text, labels, captions | `--font-sans` |
| Lexend | Headings, display text, component labels | `--font-display` |
| JetBrains Mono | Code content | `--font-mono` |

The `--dela-font` variable maps to `'Figtree', sans-serif`. The `--dela-font-size-base: 1rem` is the widget root font size.

## Layout

Layout structure is identical to light mode. The 4px spacing grid, shell zones, and page padding values do not change between modes.

Key dark-mode layout visual notes:
- `ShellHeader` background: `#333D47` (nav-background)
- `LeftSidebar` background: `#333D47`
- Main content page background: `#1F252E` (surface)
- Card/panel backgrounds: `#37424D` (bg)

## Elevation & Depth

Dark shadows use opaque black alphas instead of slate-based values:

| Level | Token | Dark value |
|---|---|---|
| 1 | sm | `0 1px 2px 0 rgba(0, 0, 0, 0.3)` |
| 2 | md | `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)` |
| 3 | lg | `0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)` |
| 4 | xl | `0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)` |
| 5 | 2xl | `0 30px 35px -8px rgba(0, 0, 0, 0.5), 0 12px 15px -7px rgba(0, 0, 0, 0.4)` |

Dropdown shadow: `0 4px 12px rgba(0, 0, 0, 0.4)`.

Focus rings remain using `var(--theme-primary-light)` — ensure contrast against dark backgrounds.

## Shapes

Radius scale is identical to light mode:

| Token | Value | Usage |
|---|---|---|
| rounded.sm | 4px | Buttons, inputs (`--dela-radius-sm`) |
| rounded.md | 8px | Widget container, bubbles (`--dela-radius`) |
| rounded.lg | 12px | Cards, table containers |
| rounded.xl | 16px | Modals, panels |
| rounded.2xl | 24px | Large featured cards |
| rounded.full | 9999px | Badges, chips, avatars, pill buttons |

## Components

### Button

| Variant | Background | Text |
|---|---|---|
| `primary` | `{colors.primary}` #59ACFF | `{colors.primary-fg}` #1F252E |
| `secondary` | transparent | #3D6BA8 (border + text) |
| `secondary` hover | #3D4A5C | #E9ECEF |
| `tertiary` | transparent | `{colors.primary}` #59ACFF |
| `ghost` | transparent | `{colors.surface-fg}` #E9ECEF |
| `destructive` | `{colors.error}` #F46286 | `{colors.primary-fg}` #1F252E |

**pageHeader buttonType dark:** Primary bg `#495057`, hover `#03273A`, text `#FFFFFF`.

### Badge / Chip

Dark mode badges invert to dark backgrounds with bright foregrounds. All still use `rounded.full`:

| Variant | Background | Text |
|---|---|---|
| default | #1C3A5C | #ADD0FF |
| primary | #59ACFF | #1F252E |
| success | #1A3D2B | #00E78E |
| warning | #3D2E00 | #F9AF00 |
| error | #3D1A24 | #F46286 |
| info | #1A2A3D | #00ADFD |
| orange | #3D2200 | #FFB347 |
| pink | #3D1A30 | #FF80CC |
| disabled | #2A3340 | #5F6871 |

### Card

Visual differences in CP dark:
- Default card: `{colors.bg}` #37424D background, `{colors.border}` #5F6871 border
- Elevated: `shadow-lg` with dark shadow values
- Interactive hover: `{colors.hover}` #3D4A5C
- Primary variant: top border in `{colors.primary}` #59ACFF

### Table

| Variant | Header background |
|---|---|
| `header-gray` | `{colors.surface}` #1F252E |
| `header-white` | #2A3340 (darkened equivalent) |
| `header-none` | transparent |

- Cell background: `{colors.cell-bg}` #212935
- Row hover: `{colors.hover}` #3D4A5C
- Total row: `rgba(89, 172, 255, 0.15)` blue-tinted

### Alert

Background and text shift to dark-mode appropriate pairs:

| Variant | Background | Text |
|---|---|---|
| success | #1A3D2B | #00E78E |
| warning | #3D2E00 | #F9AF00 |
| error | #3D1A24 | #F46286 |
| info | #1A2A3D | #00ADFD |

### Input

- Default: `{colors.input-bg}` #1F252E background, `{colors.input-border}` #5F6871 border
- Focus ring: `{colors.primary}` #59ACFF
- Error: `{colors.error}` #F46286 border
- Disabled: `{colors.input-disabled}` #333D47 background

### Chart (external library)

| Role | Token | Hex |
|---|---|---|
| Series 1 | `{colors.primary}` | #59ACFF |
| Series 2 | `{colors.success}` | #00E78E |
| Series 3 | `{colors.warning}` | #F9AF00 |
| Series 4 | `{colors.error}` | #F46286 |
| Series 5 | `{colors.info}` | #00ADFD |
| Series 6 | acid | #CCFF00 |
| Grid lines | `{colors.border}` | #5F6871 |
| Axis labels | `{colors.muted}` | #BBBBC6 |
| Chart background | `{colors.bg}` | #37424D |
| Tooltip background | `{colors.cell-bg}` | #212935 |
| Tooltip border | `{colors.border}` | #5F6871 |
| Tooltip text | `{colors.surface-fg}` | #E9ECEF |

## Do's and Don'ts

**Do:**
- Reference tokens using `{colors.*}` — never hardcode hex values in component logic
- Apply the `--dela-*` variables from the `colors` block above to the `my-widget` root
- Use `{colors.primary}` #59ACFF for all interactive affordances — it has sufficient contrast against both `{colors.bg}` and `{colors.surface}`
- Use `{colors.error}` #F46286 (not the light-mode `#D83148`) for error states in CP dark — it is calibrated for dark-background legibility
- Use `{colors.hover}` #3D4A5C for all hover state backgrounds in CP dark
- Keep chart series in the defined order for cross-chart consistency

**Don't:**
- Don't reuse light-mode hex values in this dark context — the entire surface stack has shifted
- Don't use `{colors.surface}` #1F252E as a card background — that is the page background; cards live at `{colors.bg}` #37424D
- Don't suppress focus rings — ensure `{colors.primary}` #59ACFF focus rings are visible against `{colors.bg}` and `{colors.surface}`
- Don't apply the `pageHeader` button dark primary (#495057) outside of the ShellPageHeader zone
- Don't use light-mode badge backgrounds (e.g. `#DBF9A8`) in CP dark — use the dark badge pairs defined in the `components` block
