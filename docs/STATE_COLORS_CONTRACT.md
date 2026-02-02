# State Colors Contract for MCP

**Retired.** The canonical format and states contract are defined in [SPEC_CONTRACT.md](SPEC_CONTRACT.md). State data lives in `specs[key].states`; get_specs returns one spec from that. This doc is kept for historical reference only.

This document defines how variant state colors (default, hover, active, focus, disabled, and optional item/icon/label) are stored in component JSON and how MCP tools (e.g. get_specs, build_component) should read and expose them.

## Where state colors live

Resolved variant colors live at:

```
visualSpecifications.colors.variants[variant][theme][mode]
```

- **variant**: e.g. `primary`, `secondary`, `default`, `active`
- **theme**: `cp`, `vp`, `ppm`, `maconomy`
- **mode**: `light`, `dark`

That object’s keys are **state keys**. Each state key maps to a color spec (e.g. `background`, `text`, `border`, `iconColor`).

## State keys

### Base state keys (always present)

After Phase 1, every variant/theme/mode object has at least these five keys (values may be `{}` if no CSS rule exists):

| Key       | CSS / DOM meaning                          |
|----------|---------------------------------------------|
| `default` | Base appearance                             |
| `hover`   | `:hover` pseudo-class                       |
| `active`  | `:active` pseudo-class                      |
| `focus`   | `:focus` / `:focus-visible`                 |
| `disabled`| `:disabled` or `.disabled`                 |

### Optional state keys (composite components)

Some components (e.g. sidebars, nav) add extra keys under the same variant/theme/mode object:

| Key   | Meaning                                      |
|-------|-----------------------------------------------|
| `item` | Selected item / `[data-active="true"]` (e.g. selected nav item, Dela icon active container) |
| `icon` | Icon-specific state when different from container |
| `label`| Label-specific state when different from container |

MCP should treat these as additional states and emit or describe the corresponding CSS (e.g. `.baseClass__item[data-active="true"]` for `item`).

## How MCP should use this

1. **Resolve variant and theme/mode**  
   Use `filterVisualSpecsByVariant(visualSpecs, variantName)` then pick `theme` and `mode` (e.g. from request or defaults).

2. **Get the state object**  
   Read `filteredSpecs.colors.variants[variantName][theme][mode]`. This is “the states for this variant/theme/mode.”

3. **Iterate over state keys**  
   Do not hardcode only `default` and `hover`. Iterate over all keys in that object (or use `getStateKeysForVariantThemeMode(modeObj)` from `scripts/variant-helper.js` for a stable order).

4. **Emit or describe CSS per state**  
   - `default` → base class (e.g. `.right-sidebar`)
   - `hover` → `.baseClass:hover`
   - `active` → `.baseClass:active`
   - `focus` → `.baseClass:focus` or `:focus-visible`
   - `disabled` → `.baseClass:disabled` or `.baseClass.disabled`
   - `item` → `.baseClass__item[data-active="true"]` (or equivalent for selected item)
   - `icon` / `label` → component-specific selectors

## Helper

In this repo, `scripts/variant-helper.js` exports:

- **`getStateKeysForVariantThemeMode(modeObj)`**  
  Returns an array of state keys for the given variant/theme/mode object (base keys first, then optional `item`, `icon`, `label`, then any others). Use this so MCP exposes every state in a consistent order.

## Summary

- **Location**: `variants[variant][theme][mode]`
- **State keys**: `default`, `hover`, `active`, `focus`, `disabled`, and optionally `item`, `icon`, `label`
- **MCP**: Resolve variant/theme/mode, then iterate that object’s keys (or use the helper) and emit/describe CSS for each state.
