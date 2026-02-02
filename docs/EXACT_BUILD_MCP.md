# Exact build: MCP tool behavior

This doc describes how **get_specs** and **build_component** should behave so the AI can build components exactly to spec. See [SPEC_CONTRACT.md](SPEC_CONTRACT.md) and [mcp-data/DESIGN_SYSTEM_OVERVIEW.md](../mcp-data/DESIGN_SYSTEM_OVERVIEW.md) for the full contract.

## get_specs / get_build_spec

- **Inputs:** componentName (required), variant, theme, mode, size (all optional). When omitted: variant from `props.variant.default`, theme `cp`, mode `light`, size from `props.size.default`.
- **Implementation:** Load component JSON from `mcp-data/components/{componentName}.json`. Resolve variant/theme/mode/size from params or component `defaults`. Look up the canonical spec: `component.specs["{variant}-{theme}-{mode}-{size}"]` (e.g. `primary-cp-light-md`, `cp-light`, `base-cp-light`). Get guidance from `component.guidance` (patterns + guidelines). **Read only `specs` and `guidance`**; do not use `visualSpecifications` or legacy `buildSpecs`.
- **Response shape:** Return **one** spec and **guidance** in one response:
  - `buildSpec` – The canonical spec object from `specs[key]` (props, layout, spacing, dimensions, typography, borders, states, icons, and when applicable **template**, **structure**). All values are resolved (no null, no transparent, no var()). Apply these values exactly; no deviations.
  - `defaultsUsed` (optional) – `{ variant, theme, mode, size }` when any were omitted.
  - `guidance` – `{ patterns: { ... }, guidelines: { ... } }`. Use for behavior (patterns) and when to use / how to compose (guidelines); do **not** use to override build spec values.

## build_component

- **Behavior:** Call get_specs (or get_build_spec) first to obtain the build spec and guidance for the requested component, variant, theme, mode, size. Use the **build spec** for all visual and layout values (theme, mode, colors, spacing, typography, icons, padding, radius, strokes, layout including gaps). **No deviations.** Use **guidance.patterns** for behavior (e.g. icon-only mode, loading state, href→anchor) and **guidance.guidelines** for when to use and how to compose; do not use patterns or guidelines to override build spec values.
- **Design system overview:** Expose or return the design system overview (`mcp-data/DESIGN_SYSTEM_OVERVIEW.md` or `mcp-data/design-system-overview.json`) so the AI has global rules (fonts, icons, fallback icons, themes, modes, spacing, typography) when building.

## Summary

- **Build spec** = rules (exact values). Apply verbatim.
- **Guidance** = patterns (behavior) + guidelines (when to use, composition). Do not override build spec.
- **Design system overview** = global rules. Apply first, then apply per-component build spec.
