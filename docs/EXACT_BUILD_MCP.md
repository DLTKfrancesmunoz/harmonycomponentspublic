# Exact build: MCP tool behavior

This doc describes how **get_specs** and **build_component** should behave so the AI can build components exactly to spec. See [SPEC_CONTRACT.md](SPEC_CONTRACT.md) for the full contract and global rules.

**Single source of truth:** The JSON is the only authority. Structure (DOM order), styles, and default content must be taken **only** from the spec—no inference, no additions, no "fixes." When **defaultContent** is present, use it exactly; when it is missing or empty, do not invent labels, icons, or copy. The spec’s `_buildContract.forbiddenModifications` lists explicit rules (e.g. do not add CSS properties outside the spec; follow contentOrder and children order exactly).

## get_specs / get_build_spec

- **Inputs:** componentName (required); variant, theme, mode, size, buttonType, **style**, **headerVariant**, **width** (all optional). When omitted, use component `defaults` or `dimensionDefaults` (see below).
- **Spec key resolution (JSON-driven):** Component JSON always has **specKeyOrder** and **dimensionDefaults**. Resolve each dimension from request params, then `component.dimensionDefaults`. Build the spec key by joining those values in **specKeyOrder** order (e.g. `specKeyOrder.map(d => resolved[d]).join('-')`). One path only. If the key is missing in `specs`, return a clear error.
- **Implementation:** Load component JSON from `mcp-data/components/{componentName}.json` (or components-v2). Resolve dimensions as above; look up `component.specs[key]`. Get guidance from `component.guidance`. Read **specs**, **guidance**, and from the component root also **contentOrder**, **structure**, **defaultContent**, **fonts** (and any other build-critical root fields). Do not use `visualSpecifications` or legacy `buildSpecs`. Use **props** from the JSON (top-level or base.props when present) for the component prop list.
- **Response shape:** Return **one** build payload and **guidance** in one response so the AI has a single authoritative blob (DOM order, content, and styles). Include root-level build-critical fields, not only `specs[key]`:
  - `buildSpec` – The canonical spec object from `specs[key]` (props, layout, spacing, dimensions, typography, borders, states, icons, and when applicable **template**, **structure**). All values are resolved (no null, no transparent, no var()). Template items that use a named icon should include **iconPath** (and optionally **iconSource**) resolved from the theme-scoped icon manifest (`mcp-data/icon-mappings/icon-manifest.json`) for the requested theme so the consumer can render the icon without a separate lookup. Icon **sizes** come from the component template (Icon `size` prop per usage), not from the manifest. Apply these values exactly; no deviations.
  - **Root-level fields (merge into the response or into buildSpec so the consumer sees them):** `contentOrder`, `structure`, `defaultContent`, `fonts`, **icons**. When present on the component JSON, include them in the response so the AI can follow DOM order, default content, and icon assets exactly without inferring. (In components-v2 these live at component root, not inside each `specs[key]`.)
  - `defaultsUsed` (optional) – `{ variant, theme, mode, size, style?, ... }` when any were omitted.
  - `guidance` – `{ patterns: { ... }, guidelines: { ... } }`. Use for behavior (patterns) and when to use / how to compose (guidelines); do **not** use to override build spec values.

## build_component

- **Behavior:** Call get_specs (or get_build_spec) first to obtain the build spec and guidance for the requested component and dimensions (variant, style, theme, mode, size, buttonType, headerVariant, width as applicable). Use the **build spec** for all visual and layout values (theme, mode, colors, spacing, typography, icons, padding, radius, strokes, layout including gaps). **No deviations.** Use **guidance.patterns** for behavior (e.g. icon-only mode, loading state, href→anchor) and **guidance.guidelines** for when to use and how to compose; do not use patterns or guidelines to override build spec values.
- **Element states (rootHover, rootFocus, etc.):** Element states in the spec may include keys like **rootHover**, **rootFocus**, **rootFocusVisible**. These mean: apply these styles to this element when the component root is in that state (e.g. when the root has `:hover`). The builder must emit the equivalent CSS from the spec (e.g. `.root:hover .child { ... }`) or equivalent behavior so that no extra CSS is added outside the spec.
- **Icons:** Icon resolution is theme-scoped: use `mcp-data/icon-mappings/icon-manifest.json` for the requested theme; each entry has `source` and `path` (and for custom, optional `svg`). For any icon referenced by name (e.g. in defaultContent or template), the builder must use the SVG from **payload.icons[name]** or the path from the manifest when present. Include **iconPath** (and optionally **iconSource**) in template items so the build spec is self-contained. Do not redraw or substitute a different SVG; use the exact markup or asset from the spec. Icon sizes are taken from the component template, not from the manifest.
- **Global rules:** Global rules (fonts, icons, fallback icons, themes, modes, spacing, typography) are defined in [SPEC_CONTRACT.md](SPEC_CONTRACT.md); expose or return them when building so the AI applies them before per-component specs.

## Summary

- **Build spec** = rules (exact values). Apply verbatim. The JSON is the single source of truth; build exactly what it specifies.
- **defaultContent** = when present, use exactly (sections, items, labels, icon paths). When missing, do not invent content.
- **_buildContract.forbiddenModifications** = do not add CSS outside the spec; follow contentOrder and children order exactly.
- **Guidance** = patterns (behavior) + guidelines (when to use, composition). Do not override build spec.
- **Global rules** (SPEC_CONTRACT) = fonts, icons, themes, spacing, typography. Apply first, then apply per-component build spec.

## Default slot content (prepopulated components)

The following components have **built-in default slot content** in the Astro source (body, footer, or main slot). When defaultContent or template is missing for a slot in the component JSON, the consumer may use the component’s built-in default; the **Astro source** is the reference for that content: Dialog (body, footer), Card (body), Table (header, body), ShellPanel (content), Step (label), KanbanCard (body), PickerPopup (body), Alert (message). ShellLayout default main slot is a placeholder Card; see `mcp-data/layouts/shelllayout.json` → `prepopulatedDefaults`.
