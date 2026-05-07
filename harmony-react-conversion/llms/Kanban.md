# Kanban

Kanban board with columns. Supports a **default** layout (legacy task board) and a **costpoint** variant aligned to the Deltek Costpoint Kanban MVP (use with `html.theme-cp`).

## Props

### Shared

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | KanbanColumn[] \| KanbanCostpointColumn[] | — | Column definitions; shape depends on `variant`. |
| variant | `'default'` \| `'costpoint'` | `'default'` | Costpoint: CP toolbar, board header, five-field cards. |
| className | string | `''` | Root class name. |

### Default variant

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | `'Kanban Board'` | Title bar heading. |
| actionButtons | ActionButton[] | `[]` | Action bar buttons. |
| actionDropdowns | ActionDropdown[] | — | Reserved / filters. |
| showAddButton | boolean | true | Per-column Add card. |
| titleBarActions | ReactNode | — | Replace title bar icons. |
| actionBar | ReactNode | — | Replace action bar. |

### Costpoint variant

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cardFieldsConfig | KanbanViewCardField[] | `[]` | Five field slots (JSON `kanbanView.cardFields.fields`). |
| cpRecordCount | number | — | Header count; defaults to total cards. |
| cpSortLabel | string | `'Sort'` | Sort line in board header. |
| cpActiveView | `'table'` \| `'form'` \| `'kanban'` | `'kanban'` | View switcher `aria-current`. |
| cpSearchPlaceholder | string | — | Quick search placeholder. |
| cpScrollColumnIndex | number | `0` | Active dot / nav state for demos. |
| showLoadMore | boolean | true | Load more button per column. |
| cpToolbar | ReactNode | — | Replace entire toolbar row. |
| cpBoardHeader | ReactNode | — | Replace board header row. |

## Usage

```tsx
import { Kanban } from './components/harmony/Kanban';

<Kanban title="Example" columns={columns} />
```

### Costpoint

```tsx
<Kanban
  variant="costpoint"
  cardFieldsConfig={cardFields}
  columns={costpointColumns}
  cpSortLabel="Sort: Due Date"
/>
```

Import `KanbanCostpoint.css` is included from `Kanban.tsx`. Ensure design tokens (`--kanban-cp-*`) are available on `html.theme-cp`. With `html.theme-cp.dark`, Kanban chrome and field-card surfaces follow the CP semi-dark palette (see `tokens.css`).

`KanbanCardCostpoint` uses `buildCostpointFieldRows`: bold field labels (`kanban-card-cp__field-label`), `kanban-card-cp__fields` with `gap: 0`, and a `.kanban-card-cp__spacer` row between each consecutive enabled field (see `KanbanCardCostpoint.md`).

## JSON types

See `src/types/kanban-view-config.ts` (`KanbanViewConfig`, `EXAMPLE_KANBAN_VIEW_JSON`).

## CSS Classes

**Default:** `.kanban__container`, `.kanban__column-card--in-progress`, `.kanban__column-card--done`

**Costpoint (under `html.theme-cp`):** `.kanban-cp`, `.kanban-cp__toolbar`, `.kanban-cp__board-header`, `.kanban-cp__columns`, `.kanban-card-cp`, etc.

## Dependencies

- Button, Icon, Card, Input, KanbanCard, KanbanCardCostpoint (costpoint)
