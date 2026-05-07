# KanbanCardCostpoint

Costpoint-themed Kanban card: title, up to five configurable fields, Move card dropdown, and Open record action. Styled under `html.theme-cp` (see `KanbanCostpoint.css`).

## Props

| Prop | Type | Description |
|------|------|-------------|
| id | string | Record identifier |
| title | string | Card title (ellipsis + tooltip) |
| fieldsConfig | KanbanViewCardField[] | Five slots from JSON config |
| valuesByFieldName | Record<string, string \| undefined> | Values keyed by fieldName |
| moveOptions | Option[] | Columns for Move menu; current column disabled |
| selected | boolean | Selection outline |
| graphicalClass | string | Optional top strip for conditional color |
| className | string | Extra root classes (React) / class (Astro) |
| openRecordLabel | string | Footer control (default: Open record) |

## Row model / spacers

`buildCostpointFieldRows` emits rows in position order (1–5). **Enabled** fields become `{ kind: 'field', ... }`. Between each pair of consecutive enabled fields, a `{ kind: 'spacer' }` row is inserted so vertical rhythm is even regardless of which slots are disabled. The Astro/React markup renders spacers as `<div class="kanban-card-cp__spacer" aria-hidden />` (height `var(--space-2)`, 8px).

## CSS

Classes prefixed with `kanban-card-cp__`.

- **Field labels:** `kanban-card-cp__field-label` — uppercase, **bold** (`font-weight` 700 / `var(--font-bold)`), muted color.
- **Field list:** `kanban-card-cp__fields` is a column flex container with **`gap: 0`** so inter-group spacing does not stack with spacer height; spacing between groups comes only from `.kanban-card-cp__spacer`.
- **Values:** `kanban-card-cp__field-text--*` from `styleId`; invalid `styleId` maps to `--fallback`.

## Dependencies

Card, Dropdown, Icon, Tooltip
