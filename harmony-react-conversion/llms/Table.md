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

// Default (uses built-in header and body placeholders)
<Table />

// Custom header and body (pass thead and tbody as ReactNode)
<Table
  header={
    <thead>
      <tr>
        <th scope="col">Project ID</th>
        <th scope="col">Name</th>
        <th scope="col">Status</th>
        <th scope="col">Budget</th>
      </tr>
    </thead>
  }
  body={
    <tbody>
      <tr>
        <td>PRJ-001</td>
        <td>Website Redesign</td>
        <td>Active</td>
        <td>$25,000</td>
      </tr>
    </tbody>
  }
/>
```

## CSS Classes

- `.table`
- `.table--striped`

## Dependencies

None (standalone component).
