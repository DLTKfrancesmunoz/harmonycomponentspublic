# Chip: Add `label` prop with default so Chip always shows text

## Goal

- Chip should **always** show a label by default so designers (and anyone) don’t see an empty blue shape and think something is wrong.
- Support optional `label` prop; when no slot content is provided, show `label`, defaulting to `"Chip"`.

## Behavior after change

| Usage | Result |
|-------|--------|
| `<Chip />` | Shows **"Chip"** (default label). |
| `<Chip label="Tag" />` | Shows "Tag". |
| `<Chip>Custom</Chip>` | Shows "Custom" (slot overrides). |
| `<Chip label="Fallback">Custom</Chip>` | Shows "Custom" (slot overrides label). |
| `type="overflow"` / dots | Unchanged (no label in main content). |

## Implementation

### 1. [src/components/ui/Chip.astro](src/components/ui/Chip.astro)

- **Props**: Add `label?: string` to the `Props` interface.
- **Destructuring**: Add `label = 'Chip'` so the default is `"Chip"` when not provided.
- **Render** (for `type === 'chip'`): Use slot with fallback so that when there’s no slot content, `label` is shown:
  - Replace the current `<slot />` with `<slot>{label}</slot>` in the branch where we render the main chip content (not overflow, not dots).
- **Docs**: Update the component comment to state that `label` is optional and defaults to `"Chip"` when no slot content is provided.

### 2. [src/pages/components/chips.astro](src/pages/components/chips.astro)

- Add `label` to the props table: type `string`, default `'Chip'`, description e.g. "Text shown when no slot content; default 'Chip' so the chip always shows visible text."

### 3. Regenerated docs/inventory (if applicable)

- If `component-props-inventory.json` or `mcp-data/components-v2/chip.json` are generated from source, re-run the generator so `label` is included; otherwise add `label` to the Chip entry manually.

## Summary

- **Default chip shows a label:** `<Chip />` displays "Chip".
- **Optional custom label:** `<Chip label="Tag" />` displays "Tag".
- **Slot still overrides:** Any content between `<Chip>...</Chip>` takes precedence over `label`.
- Fixes the external demo that passes `label: 'Chip'` and eliminates the “empty blue rectangle” confusion for designers.
