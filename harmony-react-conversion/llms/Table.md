# Table

Data table with optional header variant, striped rows, title bar, and filter bar.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| headerVariant | 'gray' \| 'white' \| 'none' | 'gray' | Header style: default or primary. |
| striped | boolean | false | When true, table rows are striped. |
| className | string | '' | Additional CSS classes applied to the root element. |
| filterBar | ReactNode | — | Content for the filter bar above the table (dropdowns, chips, clear button). |
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

// With filter bar (dropdowns, chips, clear button)
<Table
  filterBar={
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <Dropdown options={periodOptions} value={period} onChange={setPeriod} />
      <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
      <Chip label="Q1 2025" removable onRemove={() => {}} />
    </div>
  }
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
- `.table__filter-bar`

## Dependencies

None (standalone component).
