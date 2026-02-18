# Kanban

Kanban board with columns and optional title/action buttons.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | KanbanColumn[] |  | Kanban column definitions. |
| title | string | 'Kanban Board' | Title or heading text. |
| actionButtons | ActionButton[] | [] | Button configuration (text, href or onClick). |
| actionDropdowns | ActionDropdown[] | — | Array of items. |
| className | string | '' | Additional CSS classes applied to the root element. |
| showAddButton | boolean | true | Button configuration (text, href or onClick). |
| titleBarActions | ReactNode | — | Content to render (React node). |
| actionBar | ReactNode | — | Content to render (React node). |

## Usage

```tsx
import { Kanban } from './components/harmony/Kanban';

<Kanban title="Example" />
```

## CSS Classes

- `.kanban__container`
- `.kanban__column-card--in-progress`
- `.kanban__column-card--done`

## Dependencies

- Button
- Icon
- Card
- KanbanCard
