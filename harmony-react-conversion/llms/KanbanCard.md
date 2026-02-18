# KanbanCard

Card item within a Kanban column with title and description.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string |  | Unique DOM id for the root or main control (for accessibility). |
| title | string | — | Title or heading text. |
| description | string | — | String value. |
| avatar | { name?: string | — | String value. |
| badges | Array<{ label: string | [] | String value. |
| progress | number | — | Numeric value. |
| icons | Array<{ name: string | [] | String value. |
| date | string | — | String value. |
| time | string | — | String value. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { KanbanCard } from './components/harmony/KanbanCard';

<KanbanCard title="Example" />
```

## CSS Classes

- `.kanban-card`

## Dependencies

- Card
- Avatar
- Badge
- Icon
- ProgressBar
