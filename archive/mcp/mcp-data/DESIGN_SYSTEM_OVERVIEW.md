# Harmony Design System – Overview (Global Rules)

This document is the **design system overview** for MCP and builders. Use it together with component specs (`mcp-data/components-v2/*.json`) and the **spec contract** for exact builds. Apply global rules first, then per-component build specs.

## Themes and modes

- **Themes:** `cp` (Costpoint), `vp` (Vantagepoint), `ppm`, `maconomy`
- **Modes:** `light`, `dark`
- **Defaults when omitted:** theme `cp`, mode `light`

Component specs are keyed by dimension (variant, theme, mode, size, etc.). Resolve the spec key from request params, then `dimensionDefaults`, then `defaults`; look up `specs[key]` in the component JSON.

## Design tokens (provenance for resolved values)

All spec values are **resolved** (no `var()`, no `null`, no `transparent`). Token sources:

| Token type   | Path                         | Notes |
|-------------|------------------------------|--------|
| **Colors**  | `src/tokens/colors.json`     | Per theme/mode: `themes.<theme>.palette.<mode>` (e.g. `cardBackground`, `titleText`, `border`, `link`). Also `themes.<theme>.primary.light` / `.dark`. |
| **Spacing** | `src/tokens/spacing.json`   | Scale (e.g. `--space-2` → 8px) and `borderRadius` (e.g. `--radius-08` → 8px). Resolve to px. |
| **Typography** | `src/tokens/typography.json` | Font families (sans, display, mono), sizes (xs–xl), weights, line heights. Resolve to px/rem and font stack. |
| **Elevations** | `src/tokens/elevations.json` | Shadows when needed. |

Component styles in `src/styles/components.css` (and `layout.css` where noted) are mapped to spec fields and filled with resolved values from these tokens.

## Fonts

- **Sans (body):** Figtree  
- **Display (headings):** Lexend  
- **Mono (code):** JetBrains Mono  

Font URLs are in `src/tokens/typography.json` (`fontFamilies.*.googleFonts`). Component JSON may include a root-level `fonts` map (font name → URL) collected from specs.

## Icons

- **Theme-scoped manifest:** `mcp-data/icon-mappings/icon-manifest.json`  
- Keys: `cp`, `vp`, `ppm`, `maconomy`. Each entry: `source` (`hero` | `tabler` | `custom`), `path` (and for custom, optional `svg`).  
- Icon **sizes** come from the component template/spec (Icon `size` prop per usage), not from the manifest.

## Component data

- **Specs:** One JSON per component in `mcp-data/components-v2/` (e.g. `button.json`, `alert.json`). Each file has `name`, `type`, `filePath`, `description`, `props`, `defaults`, `specs`, `guidance`, `specKeyOrder`, `dimensionDefaults`, and when applicable `structure`, `fonts`, `defaultContent`, `contentOrder`.
- **Default content:** Data-driven components (e.g. sidebars) use `defaultContent` (from `mcp-data/default-content/` merged at generation) or template inside the spec. Use it exactly; do not invent.
- **Layouts/recipes:** `mcp-data/layouts/`, `mcp-data/recipes/` for composition.

## Spec contract and MCP behavior

- **Canonical spec format, states, and defaults:** [docs/SPEC_CONTRACT.md](../docs/SPEC_CONTRACT.md)  
- **get_specs / build_component behavior:** [docs/EXACT_BUILD_MCP.md](../docs/EXACT_BUILD_MCP.md)  

Summary:

- Build spec = exact values from `specs[key]` (layout, spacing, typography, borders, states, icons, structure). Apply verbatim.
- Guidance = `patterns` (behavior) + `guidelines` (when to use, composition). Do not use them to override build spec values.
- If the resolved spec key is missing in `specs`, return a clear error (no fallback).
- No inference: structure, styles, and default content come only from the spec and root-level fields.

## Summary

| Concern        | Source |
|----------------|--------|
| Themes / modes | `cp`, `vp`, `ppm`, `maconomy` × `light`, `dark`; default `cp`, `light` |
| Colors         | `src/tokens/colors.json` |
| Spacing/radius | `src/tokens/spacing.json` |
| Typography     | `src/tokens/typography.json` |
| Component specs| `mcp-data/components-v2/*.json` |
| Icons          | `mcp-data/icon-mappings/icon-manifest.json` (theme-scoped) |
| Contract       | `docs/SPEC_CONTRACT.md`, `docs/EXACT_BUILD_MCP.md` |

Apply global rules (fonts, themes, modes, spacing, typography) first; then apply the per-component build spec from get_specs for the requested dimensions.
