# Component JSON v2 Overview

Each component in the Harmony Design System has **one JSON file** in `mcp-data/components-v2/` (e.g. `Alert.json`, `Button.json`). These files are the source of truth for **get_specs** and **build_component**: they describe identity, props, defaults, and one complete spec per dimension combination (variant, theme, mode, size, etc.).

## Related docs

- **[SPEC_CONTRACT.md](SPEC_CONTRACT.md)** — Canonical spec format, null/key-order rules, states contract, usage patterns and guidelines.
- **[MCP-SETUP.md](../MCP-SETUP.md)** — How MCP discovers and uses this data; regeneration and CI.

## Minimal shape (per file)

| Section | Purpose |
|--------|--------|
| **Identity** | `name`, `type`, `filePath`, `description` |
| **props** | Prop schema: `name`, `type`, `optional`, `default` (optional props with no default use `default: null`) |
| **defaults** | Default dimension values: `theme`, `mode`, `variant`, `size` (as used by the generator) |
| **specs** | One spec object per key (e.g. `info-default-cp-light`). Each spec includes `_meta`, `_buildContract` (layout, spacing, states, **elements**, **criticalSelectors**), and when applicable template/structure. No `null` inside specs. |
| **guidance** | `patterns` (behavior), `guidelines` (when to use, composition, anti-patterns) |
| **specKeyOrder** | Order of dimensions for building spec keys (required when specs exist) |
| **dimensionDefaults** | Default values per dimension (required when specs exist) |

Multi-part components (Alert, Dialog, Input, Accordion, Dropdown, ShellPanel, Table, etc.) have **multiple elements** per spec (`elements` array and `criticalSelectors`) so tools can build the full DOM and apply styles per region.

## Regeneration and validation

- **Regenerate all component JSONs:**  
  `npm run generate:specs`

- **Validate:**  
  - `node scripts/validate-all-specs.js` — parent/children consistency, no invalid refs  
  - `npm run validate:specs` — no null in spec payloads; multi-element components have multiple elements; `specKeyOrder` and `dimensionDefaults` present when specs exist  
  - `npm run validate:specs:css` — every element selector in the JSON exists in the component’s CSS (catches typos). If you add component styles in a new CSS file, add it to the config in `scripts/validate-spec-selectors-in-css.js` (`DEFAULT_CSS_PATHS` or `EXTRA_CSS_BY_COMPONENT`) so the check stays accurate.

CI runs these validators after regeneration so the format and selector correctness stay enforced.
