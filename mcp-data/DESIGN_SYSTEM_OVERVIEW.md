# Harmony Design System — Overview for AI

This document describes the **overall** Harmony Design System. Read it first when building any component, template, recipe, or applying tokens to a framework. Per-component exact values come from the canonical build spec (get_specs / get_build_spec); this overview defines global rules and tokens.

---

## Fonts

| Role    | Font            | Fallback stack           | Use |
|---------|-----------------|--------------------------|-----|
| **Primary (body)** | Figtree         | `'Figtree', sans-serif`  | Body text, labels, inputs, buttons |
| **Display (headings)** | Lexend      | `'Lexend', sans-serif`   | Headings, display text |
| **Mono (code)**   | JetBrains Mono | `'JetBrains Mono', monospace` | Code, technical content |

- **CSS variables:** `--font-sans`, `--font-display`, `--font-mono`
- **Google Fonts (optional):**
  - Figtree: `https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&display=swap`
  - Lexend: `https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800;900&display=swap`
  - JetBrains Mono: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap`

---

## Icons

- **Primary source:** Heroicons (24px), outline and solid variants.
- **Naming:** kebab-case (e.g. `arrow-path`, `check`, `question-mark-circle`, `bell`).
- **Path pattern:**
  - Outline: `node_modules/heroicons/24/outline/{name}.svg`
  - Solid: `node_modules/heroicons/24/solid/{name}.svg`
- **Resolution order (Icon component):** Heroicons → Tabler (when Hero has no mapping) → `public/{name}.svg`
- **Sizes (resolved px):**

| Size | Width | Height | CSS var |
|------|-------|--------|---------|
| xs   | 12px  | 12px   | --icon-xs |
| sm   | 16px  | 16px   | --icon-sm |
| md   | 20px  | 20px   | --icon-md |
| lg   | 24px  | 24px   | --icon-lg |
| xl   | 32px  | 32px   | --icon-xl |

- **Theme-specific mappings:** Some icons (e.g. Dela logos) use custom paths; see `mcp-data/icon-mappings/cp-default.json` and component JSON for overrides.

---

## Fallback icons

When an icon name is missing or cannot be resolved, render a **fallback placeholder** (do not leave blank or throw).

- **Behavior:** Show a "?" character inside a small box with fallback styling.
- **Styling (use these CSS variables):**
  - `--icon-fallback-bg`: background color (e.g. `#ffecef`)
  - `--icon-fallback-text`: text color (e.g. `#c1253a`)
  - `--icon-fallback-font-size`: e.g. `8px`
  - `--icon-fallback-radius`: e.g. `2px`
- **Layout:** Same width/height as the requested icon size; `display: inline-flex`; `align-items: center`; `justify-content: center`.
- **Accessibility:** Optional `title="Icon \"{name}\" not found"` for debugging.

---

## Themes and modes

- **Themes:** `cp`, `vp`, `ppm`, `maconomy`. Each theme has its own semantic colors (primary, secondary, etc.); per-component colors live in the build spec for that theme.
- **Modes:** `light`, `dark`.
- **Defaults when not specified:** theme `cp`, mode `light`. Use these when get_specs / build_component is called without theme or mode.

---

## Spacing

- **Grid:** 4px base unit.
- **Scale (key values):** See `mcp-data/design-tokens.json` → `spacing.scale`. Examples:

| Key | Value | CSS var    |
|-----|-------|------------|
| 0   | 0px   | --space-0  |
| 0.5 | 2px   | --space-0-5 |
| 1   | 4px   | --space-1  |
| 2   | 8px   | --space-2  |
| 3   | 12px  | --space-3  |
| 4   | 16px  | --space-4  |
| 6   | 24px  | --space-6  |
| 8   | 32px  | --space-8  |

Use the spacing scale for padding, margin, and gap; prefer tokens over hardcoded px when building from design-tokens. In **canonical build specs**, values are resolved to concrete px.

---

## Typography scale

- **Font sizes:** xs (0.75rem / 12px), sm (0.875rem / 14px), base (1rem / 16px), lg, xl, 2xl, … See `design-tokens.json` → `typography.fontSizes` and `fontSizesResolved`.
- **Font weights:** light (300), normal (400), medium (500), semibold (600), bold (700), extrabold (800). CSS vars: `--font-light`, `--font-normal`, etc.
- **Line heights:** none, tight, snug, normal, relaxed, loose. CSS vars: `--leading-none`, `--leading-tight`, etc.
- **Text styles:** bodyDefault, label, caption, headingS, headingM, etc. See `typography.textStyles` and `componentDefaults` (button, input, label, badge) in design-tokens.

---

## Border radius

- **Scale:** 4px, 8px, 12px, 16px, 24px, 9999px (pill). CSS vars: `--radius-04`, `--radius-08`, `--radius-12`, `--radius-16`, `--radius-24`, `--radius-100`.
- See `design-tokens.json` → `spacing.borderRadius`.

---

## Elevation / shadows

- Use design-tokens elevation/shadow entries when present; per-component shadows are in the build spec. Prefer tokens for consistency.

---

## Other global rules

- **Color semantics:** primary, secondary, destructive, etc. are theme-dependent; exact hex values come from the build spec for the chosen theme/mode.
- **Focus:** Use `:focus-visible` and design-system focus ring (outline/offset) as defined in component build specs (e.g. focus state outline).
- **Accessibility:** Respect reduced motion, sufficient contrast (tokens and build spec define colors), and ARIA as specified in component guidance.

---

## How to use this with the build spec

1. **First:** Apply this overview (fonts, icons, fallback icons, themes, modes, spacing scale, typography, radius) so global setup is correct.
2. **Then:** For each component, use the **build spec** returned by get_specs / get_build_spec for that component (variant, theme, mode, size). The build spec has resolved values for layout, spacing, dimensions, typography, borders, states, and icons—apply them exactly.
3. **Guidance:** Use **usage patterns** for behavior (e.g. icon-only mode, loading state) and **usage guidelines** for when to use and how to compose; do not use them to override build spec values.
