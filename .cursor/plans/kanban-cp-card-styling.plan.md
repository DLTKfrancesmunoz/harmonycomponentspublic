# Kanban Costpoint card label/value styling (revised)

## Goals

- Labels: **font-weight 700** (`var(--font-bold)`).
- **Keep** `.kanban-card-cp__spacer` in the DOM and CSS.
- **Even spacing between every pair of field groups**: spacers must appear **between each consecutive rendered field**, not only when a disabled slot sits between two enabled fields (that asymmetry caused “extra space between two groups and not the other”).

## Why spacing was uneven before

[`buildCostpointFieldRows`](src/utils/kanban-cp-card.ts) only inserted `{ kind: 'spacer' }` when a **disabled** configuration slot appeared **between** two **enabled** fields. Adjacent enabled fields (e.g. positions 1 and 2 both on) got **no** spacer row—only `.kanban-card-cp__fields { gap: var(--space-1) }`. Mixed cases got **gap + spacer height**, so vertical rhythm differed by configuration.

## Row builder change (3× `kanban-cp-card.ts`)

**Keep** `CostpointFieldRow` including `| { kind: 'spacer' }`.

**Replace** `pendingSpacer` / disabled-gapped spacer logic with **deterministic interleaving**:

- When appending each **enabled** field after the first, push `{ kind: 'spacer' }` **before** that field.
- Resulting order: `field`, `spacer`, `field`, `spacer`, …, `field` (no spacer after the last field).

Disabled slots are still skipped; only **enabled** fields are rendered, each pair separated by exactly one spacer. No trailing spacer push at end of loop except via this rule.

Implement in **`src/utils/kanban-cp-card.ts`**, [`harmony-react-conversion/src/utils/kanban-cp-card.ts`](harmony-react-conversion/src/utils/kanban-cp-card.ts), and [`harmony-designer-starter/src/utils/kanban-cp-card.ts`](harmony-designer-starter/src/utils/kanban-cp-card.ts) so Astro, React gallery, and designer starter stay aligned.

## CSS (three bundles — keep in sync)

1. [`src/styles/components.css`](src/styles/components.css) (Astro design system site)
2. [`harmony-react-conversion/src/components/harmony/KanbanCostpoint.css`](harmony-react-conversion/src/components/harmony/KanbanCostpoint.css)
3. [`harmony-designer-starter/src/components/harmony/KanbanCostpoint.css`](harmony-designer-starter/src/components/harmony/KanbanCostpoint.css)

Rules:

1. **`.kanban-card-cp__field-label`**: `font-weight: var(--font-bold);`
2. **`.kanban-card-cp__fields`**: `gap: 0` — flex gap must not stack with spacer height, or spacing between groups will overshoot or stay inconsistent.
3. **`.kanban-card-cp__spacer`**: keep the rule; height should define inter-group spacing (e.g. `var(--space-2)` = **8px**). That is the single source of vertical space between groups; **do not** also add `margin-bottom` on `.kanban-card-cp__field` for that purpose (avoids doubling).
4. **`.kanban-card-cp__field`**: keep internal column layout; optional: keep `gap: var(--space-0-5)` for label/value tight grouping (2px). No `margin-bottom` on fields for group separation when spacers handle it.

## Astro (design system site)

- [`src/components/ui/KanbanCardCostpoint.astro`](src/components/ui/KanbanCardCostpoint.astro): keep the `row.kind === 'spacer'` branch; picks up new row order from shared [`kanban-cp-card.ts`](src/utils/kanban-cp-card.ts).
- [`src/pages/cp/kanban.astro`](src/pages/cp/kanban.astro): update copy that references **field/spacer rules** (e.g. integration section ~“field/spacer rules”) to describe **uniform spacer elements between each rendered field group**, bold labels, and that inter-group spacing is **spacer height** with **`kanban-card-cp__fields` gap cleared** — so implementers are not misled by the old conditional behavior.

## React components + galleries (both packages)

Components (swap duplicates in each tree):

- [`harmony-react-conversion/src/components/harmony/KanbanCardCostpoint.tsx`](harmony-react-conversion/src/components/harmony/KanbanCardCostpoint.tsx)
- [`harmony-designer-starter/src/components/harmony/KanbanCardCostpoint.tsx`](harmony-designer-starter/src/components/harmony/KanbanCardCostpoint.tsx)

Keep the spacer render branch; same `buildCostpointFieldRows` import path per package.

**Galleries** — [`harmony-react-conversion/src/componentRegistry.tsx`](harmony-react-conversion/src/componentRegistry.tsx) and [`harmony-designer-starter/src/componentRegistry.tsx`](harmony-designer-starter/src/componentRegistry.tsx):

- Existing `KanbanCardCostpoint` **demoProps** already enable slots 1, 2, 4, 5 with slot 3 disabled (good regression for “even gaps between every shown group”). **Re-validate visually** after CSS/util changes; adjust demo `fieldsConfig` only if something no longer exercises multi-field spacing.

## Documentation (required, not optional)

Update **both** LLM doc copies in `harmony-react-conversion` (paths mirror each other):

- [`harmony-react-conversion/src/llms/KanbanCardCostpoint.md`](harmony-react-conversion/src/llms/KanbanCardCostpoint.md)
- [`harmony-react-conversion/llms/KanbanCardCostpoint.md`](harmony-react-conversion/llms/KanbanCardCostpoint.md)

Edits:

- Replace vague “spacer rules” with the actual contract: **`{ kind: 'spacer' }` rows are emitted between each consecutive **enabled** field**; DOM class `.kanban-card-cp__spacer`; **`kanban-card-cp__fields` uses `gap: 0`**; label styling **bold (700)** via **`kanban-card-cp__field-label`**.

If [`harmony-react-conversion/src/llms/Kanban.md`](harmony-react-conversion/src/llms/Kanban.md) / [`harmony-react-conversion/llms/Kanban.md`](harmony-react-conversion/llms/Kanban.md) mention Costpoint card spacing, align those sentences with the same behavior.

## Verification

- **Astro**: [`/cp/kanban`](src/pages/cp/kanban.astro) — live examples and updated integration text.
- **React gallery**: Component gallery in **both** `harmony-react-conversion` and `harmony-designer-starter` — **KanbanCardCostpoint** demo: even vertical rhythm between Code / Owner / Due / Notes; labels bold.
- Cards with **all five fields enabled**: consistent steps between groups.
- Cards with **gaps in field positions** (some disabled): one spacer between each **shown** group only.
- Last field sits flush above footer (no spacer after final group).
