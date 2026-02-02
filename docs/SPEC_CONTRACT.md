# Canonical Spec Contract for Exact Builds

This document defines the **canonical JSON format** for Harmony component specs, the **states contract**, **usage patterns and guidelines**, and how MCP tools use them for exact builds (component, template, recipe, apply tokens to framework). It is the single reference for the spec format; read [DESIGN_SYSTEM_OVERVIEW](mcp-data/DESIGN_SYSTEM_OVERVIEW.md) first for global rules.

---

## 1. Canonical JSON format (one schema, no layered blobs)

**Per-component file structure:** Each component has one JSON file (e.g. `mcp-data/components/card.json`, `rightsidebar.json`) with: **Identity** (`name`, `type`, `filePath`, `description`), **props**, **defaults** (`{ variant?, size?, theme?, mode? }`), **specs** (one complete spec object per build context), **guidance** (`patterns`, `guidelines`). **Dropped:** `visualSpecifications`, old `buildSpecs`, and any unresolved/inferred spec fields. **Rule:** Every value in `specs` is resolved (hardcoded). No `null`, no `transparent`, no `var()`.

### 1.1 Specs keying

- **Key:** `"[variant]-[theme]-[mode]-[size]"` (e.g. `base-cp-light`, `elevated-cp-light`, `cp-light`, `cp-dark`, `vp-light`).
- **Value:** One complete spec object so the AI builds the same component every time (exact replica).

### 1.2 Single spec object shape (all values hardcoded)

| Section     | Fields | Description |
|------------|--------|-------------|
| **props**  | For each prop: `name`, `type`, `default`, `optional` (or `required`) | Component API; ensures correct interface (variant, size, disabled, icon, etc.). |
| **layout** | `display`, `flexDirection`, `alignItems`, `justifyContent`, `gap` | All resolved (e.g. `"8px"` for gap). |
| **spacing** | `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | Resolved px. |
| **dimensions** | `height`, `minWidth`, `maxWidth` (for the size) | Resolved. |
| **typography** | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` (for the size) | Resolved. |
| **borders** | `width`, `style`, `radius` | All resolved; full border expression when CSS uses it (e.g. `1px solid #hex`). |
| **states** | Per states contract below | `default`, `hover`, `active`, `focus`, `disabled` (and `item`, `icon`, `label` where applicable); each state: `background`, `text`, `border`, `iconColor` (and focus `outline`/`outlineOffset`). |
| **icons** | Where applicable: `iconSizePx`, `gapBetweenIconAndText` | Resolved (e.g. `"16px"`, `"8px"`). Omit or `{}` when N/A. |
| **template** | When component has default content | Exact default content for that theme/variant (e.g. `sections` with `items`, `label`, `icon` or `isCustom`/`customSrc`/`customSrcActive`) so section count and icons are never inferred. |
| **structure** | When component has fixed DOM shape | Explicit DOM hierarchy and BEM classes so markup and classes are identical every time. |

### 1.3 Provenance (where values come from)

- **Colors (per theme/mode):** `src/tokens/colors.json` (e.g. `themes.cp.palette.light.cardBackground` → `"#F7F8FA"`, `border` → `"#BFC6D4"`). Dark from `palette.dark`. Same for vp, ppm, maconomy.
- **Spacing / radius / typography:** `src/tokens/spacing.json`, `src/tokens/typography.json`; resolve to px or rem.
- **Component visuals:** `src/styles/components.css` — map each component’s CSS rules (e.g. `.card`, `.card__header`) to spec fields; fill with resolved values from tokens.
- **Canonical JSON:** Authored manually (copy resolved values from tokens + components.css into `specs["..."]`) or produced by one auditable script that reads tokens + CSS and emits canonical JSON. No css-parser, visual-spec-extractor, or generate-build-specs in their current role for this data. The JSON file is the source of truth for exact builds.

- **Where state data lives:** In the canonical format, state data lives in `specs["<key>"].states`. get_specs returns that single spec; no merging of multiple blobs.

---

## 2. States contract

Every interactive component (or interactive part of a template/recipe) must have **all** of these states in the canonical JSON with **explicit values**. No “inherit from default” in the output—resolve at generation time.

### Base state keys (always present)

| State      | CSS / DOM meaning |
|-----------|--------------------|
| **default** | Base appearance (required). |
| **hover**   | `:hover` |
| **active**  | `:active` |
| **focus**   | `:focus` / `:focus-visible` |
| **disabled** | `:disabled` or `.disabled` |

### Optional state keys (composite components)

| State  | Meaning |
|--------|---------|
| **item** | Selected item / `[data-active="true"]` (e.g. selected nav item). |
| **icon** | Icon-specific state when different from container. |
| **label** | Label-specific state when different from container. |

### Rule

If a variant has no distinct hover/focus/etc., the generator still emits that key with the same values as `default` (or an explicit “no change”). The AI never infers or invents a state; every state key is present with a concrete value.

### Where state data lives (canonical format)

- MCP: get_specs returns the single spec for the requested (component, variant, theme, mode, size) from `specs[key]`; build_component applies it to the letter. No merging of multiple blobs; no inference.

---

## 3. Usage patterns and guidelines

Both are first-class and returned with the build spec so the AI has exact values **and** behavior/composition guidance.

### Usage patterns

- **What:** Technical behavior—*how* the component works (e.g. icon-only detection, loading state, href→anchor, icon-size mapping).
- **Where:** In the canonical output, a **guidance** block with **patterns** (id + description). Sourced from existing `usagePatterns` in component JSON.
- **AI use:** Implement the described behavior (correct class names, element type, loading/disabled handling). Do **not** use patterns to infer or override visual values (gap, color); those come only from the build spec.

### Usage guidelines

- **What:** When to use, composition, anti-patterns, prop guidance, typical compositions.
- **Where:** In the **guidance** block as **guidelines**. Sourced from aiContext, usageGuidance, component-rules, etc.
- **AI use:** Use for when to use the component and how to compose it. Do **not** use guidelines to override build spec values.

### MCP response shape

get_specs / get_build_spec returns **both** the build spec and the guidance in one response:

```json
{
  "buildSpec": { /* canonical spec for variant/theme/mode/size */ },
  "defaultsUsed": { "variant": "primary", "theme": "cp", "mode": "light", "size": "md" },
  "guidance": {
    "patterns": { "icon-only-detection": "...", "loading-state-behavior": "..." },
    "guidelines": { /* when to use, composition, anti-patterns */ }
  }
}
```

---

## 4. Defaults (variant, size, theme, mode)

- **Default variant:** From `props.variant.default` (e.g. Button `'primary'`). When the user does not pass variant, use this.
- **Default size:** From `props.size.default` (e.g. `'md'`). When size is omitted, return the build spec for this size.
- **Default theme and mode:** theme `cp`, mode `light`.
- **Build spec key:** When pre-generating, use keys like `primary-cp-light-md`; document that get_specs returns the spec for `variant || props.variant.default`, `theme || 'cp'`, `mode || 'light'`, `size || props.size.default`.

---

## 5. How MCP uses this (four build targets)

1. **Component to spec** — get_specs(componentName, variant?, theme?, mode?, size?) returns one build spec + guidance. build_component uses the build spec for all visual/layout values and guidance for behavior and composition.
2. **Template to spec** — Same format; template is a composition of components; spec lists components + layout/spacing. MCP returns build specs for each component in the template + template composition.
3. **Recipe to spec** — Same format; recipe is a multi-component pattern; spec lists each component’s spec + composition (order, slots). MCP returns build specs + guidance per component and recipe-level guidance.
4. **Apply tokens to framework (e.g. shadcn)** — Export the same resolved values as a framework-specific bundle (CSS variables or config). Run `npm run export:framework` (or `node scripts/export-for-framework.js`) to write `mcp-data/exports/harmony-variables.css` and optionally `harmony-export.json` from the design system overview and component build specs.

**MCP instructions for build_component (and template/recipe tools):**

- Use the **build spec** for all visual and layout values (theme, mode, colors, spacing, typography, icons, padding, radius, strokes, layout including gaps). No deviations.
- Use **guidance.patterns** for behavior (icon-only, loading, href, etc.) and **guidance.guidelines** for when to use and how to compose. Do not use patterns or guidelines to override build spec values.
- Expose or return the **design system overview** (see [DESIGN_SYSTEM_OVERVIEW](mcp-data/DESIGN_SYSTEM_OVERVIEW.md)) so the AI has it when building.

---

## 6. Variant filtering (for MCP implementation)

- **Lookup:** Given (variant, theme, mode, size), compute the spec key (e.g. `primary-cp-light-md`, `cp-light`) and read `specs[key]` from the canonical component JSON. Return that single spec plus `guidance`. No merging of visualSpec + buildSpec; no fill-nulls.
- **Defaults:** When variant/theme/mode/size are omitted, use component `defaults` (e.g. theme `cp`, mode `light`, size `md`) to form the key.

---

## Summary

- **Canonical format:** One schema per component: identity, props, defaults, **specs** (keyed by variant–theme–mode–size), guidance. Each spec object: props, layout, spacing, dimensions, typography, borders, states, icons, and when applicable **template** (exact default content) and **structure** (DOM + BEM classes). All values resolved (no null, no transparent, no var()).
- **States:** default, hover, active, focus, disabled (and item, icon, label where applicable); all keys always present with explicit values.
- **Guidance:** patterns (behavior) + guidelines (when to use, composition); returned with build spec; AI must not use them to override build spec.
- **MCP:** get_specs reads **only** `specs` and `guidance` from canonical component JSON; returns one spec + guidance. build_component applies that spec to the letter (same structure, template, layout, states, spacing). Design system overview exposed for global rules.

---

## Appendix: Retired docs

The following docs are **retired** for the purpose of exact builds and canonical spec. The single reference is this contract (SPEC_CONTRACT.md).

- **STATE_COLORS_CONTRACT.md** — State keys and where state data lives are now defined in § 2 and § 1.2; state data lives in `specs[key].states`.
- **VARIANT_FILTERING.md** — Variant/key lookup is now § 6; use `specs[key]` and `defaults`.
- **VARIANT_DATA_PATTERNS.md** — Superseded by canonical format; no visualSpecifications.
- **MCP_VARIANT_FILTERING_GUIDE.md** — get_specs behavior is defined in this contract and in EXACT_BUILD_MCP.md.
