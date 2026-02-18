# Table

Data table with optional header variant, striped rows, and title bar.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| headerVariant | 'gray' \| 'white' \| 'none' | 'gray' | Header style: default or primary. |
| striped | boolean | false | When true, table rows are striped. |
| className | string | '' | Additional CSS classes applied to the root element. |
| titleBarContent | ReactNode | — | Content for the table title bar. |
| titleBarIcons | ReactNode | — | Content to render (React node). |
| actionBar | ReactNode | — | Content to render (React node). |
| header | ReactNode | — | Custom header content (overrides headerTitle/headerSubtitle when set). |
| body | ReactNode | — | Content to render (React node). |

## Usage

```tsx
import { Table } from './components/harmony/Table';

<Table />
```

## CSS Classes

- `.table`
- `.table--striped`

## Dependencies

None (standalone component).
