---
version: alpha
name: Harmony Dark
description: >
  Harmony Design System — dark mode for Vantagepoint (VP), PPM, and Maconomy
  themes. These three products share a byte-for-byte identical dark palette
  built on near-black neutrals, distinct from the blue-gray tones of
  Costpoint dark. Map the color tokens below directly to --dela-* CSS
  variables in the widget host stylesheet.

colors:
  # --dela-* widget surface tokens
  bg:           "#1F2124"
  border:       "#2A2D32"
  primary:      "#59ACFF"
  primary-fg:   "#15171A"
  surface:      "#15171A"
  surface-fg:   "#FAFAFA"
  input-border: "#2A2D32"
  muted:        "#B5B5BC"
  # extended palette
  primary-hover:   "#7BB8FF"
  nav-background:  "#1A1C1F"
  input-bg:        "#1F2124"
  input-disabled:  "#2A2D32"
  cell-bg:         "#1A1C1F"
  hover:           "#2A2D32"
  secondary-text:  "#B5B5BC"
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
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor:       "{colors.primary}"
    rounded:         "{rounded.sm}"
    padding:         8px 16px
  button-tertiary-hover:
    backgroundColor: "{colors.hover}"
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
    backgroundColor: "#0F2540"
    textColor:       "#ADD0FF"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.primary-fg}"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-success:
    backgroundColor: "#0A2B1A"
    textColor:       "#00E78E"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-warning:
    backgroundColor: "#2A1E00"
    textColor:       "#F9AF00"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-error:
    backgroundColor: "#2A0D18"
    textColor:       "#F46286"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-info:
    backgroundColor: "#0A1A2A"
    textColor:       "#00ADFD"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-orange:
    backgroundColor: "#2A1400"
    textColor:       "#FFB347"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-pink:
    backgroundColor: "#2A0A1E"
    textColor:       "#FF80CC"
    rounded:         "{rounded.full}"
    padding:         2px 8px
  badge-disabled:
    backgroundColor: "#1A1C1F"
    textColor:       "#2A2D32"
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
    backgroundColor: "#1F2124"
    textColor:       "{colors.surface-fg}"
  table-header-none:
    backgroundColor: "transparent"
    textColor:       "{colors.surface-fg}"
  table-striped:
    backgroundColor: "#1D1F22"
    textColor:       "{colors.surface-fg}"
  table-row-hover:
    backgroundColor: "{colors.hover}"
    textColor:       "{colors.surface-fg}"
  table-total:
    backgroundColor: "rgba(89, 172, 255, 0.15)"
    textColor:       "{colors.surface-fg}"

  # ── Alert ────────────────────────────────────────────────
  alert-success:
    backgroundColor: "#0A2B1A"
    textColor:       "#00E78E"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-warning:
    backgroundColor: "#2A1E00"
    textColor:       "#F9AF00"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-error:
    backgroundColor: "#2A0D18"
    textColor:       "#F46286"
    rounded:         "{rounded.md}"
    padding:         16px
  alert-info:
    backgroundColor: "#0A1A2A"
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
    textColor:       "#15171A"
  chart-series-3:
    backgroundColor: "{colors.warning}"
    textColor:       "#15171A"
  chart-series-4:
    backgroundColor: "{colors.error}"
    textColor:       "#15171A"
  chart-series-5:
    backgroundColor: "{colors.info}"
    textColor:       "#15171A"
  chart-series-6:
    backgroundColor: "#CCFF00"
    textColor:       "#15171A"
  chart-grid:
    backgroundColor: "{colors.border}"
    textColor:       "{colors.muted}"
---

## Overview

This file represents **dark mode for Vantagepoint (VP), PPM, and Maconomy**. These three product themes share a byte-for-byte identical dark palette built on near-black neutral backgrounds — significantly darker and more neutral than Costpoint's blue-gray dark palette. Activate with both the product theme class and `dark` on the `<html>` element (e.g. `class="theme-vp dark"`).

### --dela-* variable contract

```css
my-widget {
  --dela-bg:           #1F2124;   /* {colors.bg} */
  --dela-border:       #2A2D32;   /* {colors.border} */
  --dela-primary:      #59ACFF;   /* {colors.primary} */
  --dela-primary-fg:   #15171A;   /* {colors.primary-fg} */
  --dela-surface:      #15171A;   /* {colors.surface} */
  --dela-surface-fg:   #FAFAFA;   /* {colors.surface-fg} */
  --dela-input-border: #2A2D32;   /* {colors.input-border} */
  --dela-muted:        #B5B5BC;   /* {colors.muted} */
  --dela-font:         'Figtree', sans-serif;
  --dela-font-size-base: 1rem;
  --dela-radius:       8px;       /* {rounded.md} */
  --dela-radius-sm:    4px;       /* {rounded.sm} */
  --dela-min-tap:      44px;
}
```

For light mode (all themes), see `DESIGN-light.md`. For Costpoint dark, see `DESIGN-cp-dark.md`.

## Colors

The VP / PPM / Maconomy dark palette uses near-black backgrounds with tight tonal steps. The contrast between surface layers is subtle — the visual hierarchy is established through border lines and shadow rather than large tonal jumps.

- **bg (#1F2124):** Card and widget background — the primary content surface. Maps to `--dela-bg`.
- **border (#2A2D32):** All outlines, table grid, input borders, dividers. Maps to `--dela-border` and `--dela-input-border`. Also used as the hover background.
- **primary (#59ACFF):** Bright sky-blue interactive color. Shared with CP dark but displayed against a darker backdrop, giving it higher perceived contrast. Maps to `--dela-primary`.
- **primary-fg (#15171A):** Near-black text on the light-blue primary. Maps to `--dela-primary-fg`.
- **surface (#15171A):** The deepest background layer — page background, assistant message bubbles, attach buttons. Maps to `--dela-surface`.
- **surface-fg (#FAFAFA):** Near-white body text. Higher lightness than CP dark for maximum contrast on the near-black surfaces. Maps to `--dela-surface-fg`.
- **muted (#B5B5BC):** Secondary text, placeholder text, animated thinking dots. Maps to `--dela-muted`.
- **success (#00E78E):** Bright green, unchanged from light — works on dark surfaces.
- **warning (#F9AF00):** Amber, unchanged.
- **error (#F46286):** Soft red-pink for legibility on dark backgrounds.
- **info (#00ADFD):** Bright cyan, unchanged.
- **hover (#2A2D32):** Hover state background — same as border; creates a subtle but functional hover effect on the near-black surface.
- **nav-background (#1A1C1F):** Shell sidebar and nav rail. One tonal step darker than card bg.
- **cell-bg (#1A1C1F):** Table cell background — same as nav, slightly darker than card.

## Typography

Identical font families and sizes to light mode. Typography tokens are mode-agnostic across all themes.

| Family | Role | CSS var |
|---|---|---|
| Figtree | Body text, labels, captions | `--font-sans` |
| Lexend | Headings, display text, component labels | `--font-display` |
| JetBrains Mono | Code content | `--font-mono` |

The `--dela-font` variable maps to `'Figtree', sans-serif`. Base font size `--dela-font-size-base: 1rem`.

## Layout

Layout structure is identical to light mode. The 4px grid and shell zones do not change between modes.

Key visual notes for VP/PPM/Maconomy dark:
- `ShellHeader` background: `#1A1C1F` (nav-background)
- `LeftSidebar` background: `#1A1C1F`
- Main content page background: `#15171A` (surface)
- Card/panel backgrounds: `#1F2124` (bg)

Note: the tonal difference between `surface` (#15171A) and `bg` (#1F2124) is only 5 points of lightness. Borders (`#2A2D32`) are the primary separator.

## Elevation & Depth

Shadows are identical to CP dark — opaque black alphas on all levels:

| Level | Token | Dark value |
|---|---|---|
| 1 | sm | `0 1px 2px 0 rgba(0, 0, 0, 0.3)` |
| 2 | md | `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)` |
| 3 | lg | `0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)` |
| 4 | xl | `0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)` |
| 5 | 2xl | `0 30px 35px -8px rgba(0, 0, 0, 0.5), 0 12px 15px -7px rgba(0, 0, 0, 0.4)` |

Dropdown shadow: `0 4px 12px rgba(0, 0, 0, 0.4)`.

On the near-black palette, `shadow-sm` (level 1) is nearly invisible. Prefer `shadow-md` or higher for elements that need to visually float above the surface.

## Shapes

Radius scale is identical across all modes:

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
| `primary` | `{colors.primary}` #59ACFF | `{colors.primary-fg}` #15171A |
| `secondary` | transparent | #3D6BA8 (border + text) |
| `secondary` hover | `{colors.hover}` #2A2D32 | `{colors.surface-fg}` #FAFAFA |
| `tertiary` | transparent | `{colors.primary}` #59ACFF |
| `ghost` | transparent | `{colors.surface-fg}` #FAFAFA |
| `destructive` | `{colors.error}` #F46286 | `{colors.primary-fg}` #15171A |

### Badge / Chip

Near-black badge backgrounds with bright foregrounds. All use `rounded.full`:

| Variant | Background | Text |
|---|---|---|
| default | #0F2540 | #ADD0FF |
| primary | #59ACFF | #15171A |
| success | #0A2B1A | #00E78E |
| warning | #2A1E00 | #F9AF00 |
| error | #2A0D18 | #F46286 |
| info | #0A1A2A | #00ADFD |
| orange | #2A1400 | #FFB347 |
| pink | #2A0A1E | #FF80CC |
| disabled | #1A1C1F | #2A2D32 |

### Card

In VP / PPM / Maconomy dark the visual separation between cards and page is minimal — use borders and shadows deliberately:
- Default: `{colors.bg}` #1F2124 background, `{colors.border}` #2A2D32 border, `shadow-sm`
- Elevated: `shadow-lg` to ensure the card lifts above the near-black page
- Interactive hover: `{colors.hover}` #2A2D32 — same as border, creates a barely-there but functional hover state
- Primary variant: 4px top border in `{colors.primary}` #59ACFF

### Table

| Variant | Header background |
|---|---|
| `header-gray` | `{colors.surface}` #15171A |
| `header-white` | `{colors.bg}` #1F2124 (darkened equivalent) |
| `header-none` | transparent |

- Cell background: `{colors.cell-bg}` #1A1C1F
- Row hover: `{colors.hover}` #2A2D32
- Total row: `rgba(89, 172, 255, 0.15)` blue-tinted
- Striped: alternates `#1D1F22` / `{colors.cell-bg}` — very subtle on near-black

### Alert

| Variant | Background | Text |
|---|---|---|
| success | #0A2B1A | #00E78E |
| warning | #2A1E00 | #F9AF00 |
| error | #2A0D18 | #F46286 |
| info | #0A1A2A | #00ADFD |

### Input

- Default: `{colors.input-bg}` #1F2124 background, `{colors.input-border}` #2A2D32 border
- Focus: `{colors.primary}` #59ACFF border and focus ring
- Error: `{colors.error}` #F46286 border
- Disabled: `{colors.input-disabled}` #2A2D32 background, `{colors.muted}` #B5B5BC text

### Chart (external library)

| Role | Token | Hex |
|---|---|---|
| Series 1 | `{colors.primary}` | #59ACFF |
| Series 2 | `{colors.success}` | #00E78E |
| Series 3 | `{colors.warning}` | #F9AF00 |
| Series 4 | `{colors.error}` | #F46286 |
| Series 5 | `{colors.info}` | #00ADFD |
| Series 6 | acid | #CCFF00 |
| Grid lines | `{colors.border}` | #2A2D32 |
| Axis labels | `{colors.muted}` | #B5B5BC |
| Chart background | `{colors.bg}` | #1F2124 |
| Tooltip background | `{colors.cell-bg}` | #1A1C1F |
| Tooltip border | `{colors.border}` | #2A2D32 |
| Tooltip text | `{colors.surface-fg}` | #FAFAFA |

## Do's and Don'ts

**Do:**
- Reference tokens using `{colors.*}` — never hardcode hex values in component logic
- Apply the `--dela-*` variables from the `colors` block above to the `my-widget` root
- Use `shadow-md` or higher for cards and elevated elements — `shadow-sm` is nearly invisible on near-black backgrounds
- Use `{colors.primary}` #59ACFF for all interactive affordances — it has strong contrast against both `{colors.bg}` #1F2124 and `{colors.surface}` #15171A
- Use `{colors.border}` #2A2D32 as both border color and hover background — the intentional dual use creates subtle hover states without needing a separate token
- Keep chart series in the defined order for cross-chart consistency

**Don't:**
- Don't reuse CP dark hex values — `{colors.bg}` is `#1F2124` here, not `#37424D`
- Don't use `{colors.surface}` #15171A as a card background — it is the page background; cards live at `{colors.bg}` #1F2124
- Don't expect strong visual separation from shadows alone on this palette — borders are the primary structural element
- Don't suppress focus rings — ensure `{colors.primary}` #59ACFF focus rings are visible on both `{colors.bg}` and `{colors.surface}`
- Don't use light-mode badge or alert backgrounds — use the dark pairs defined in the `components` block above
- Don't apply the `pageHeader` button variants outside of the ShellPageHeader zone
