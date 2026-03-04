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

// With filter bar (dropdowns, Clear, chips on single row)
<Table
  filterBar={
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <Dropdown options={periodOptions} value={period} onChange={setPeriod} />
      <Dropdown options={statusOptions} value={status} onChange={setStatus} />
      <Button variant="ghost" size="sm" onClick={handleClear}>Clear</Button>
      {period !== 'all' && <Chip label={periodLabel} removable onRemove={() => setPeriod('all')} />}
      {status !== 'all' && <Chip label={statusLabel} removable onRemove={() => setStatus('all')} />}
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

## Filter Bar

The filter bar displays dropdowns, Clear button, and filter chips on a single row. Use "All periods" and "All Statuses" (or equivalent) as default options (`value="all"`); chips appear only when filters are applied. Clearing a chip or clicking Clear resets the corresponding dropdown to "all".

## Row Selection (Interactive Table)

For tables with row selection, add a checkbox with `name="select-all"` in the header and row checkboxes in each body cell. Use controlled state: track selected row IDs in a `Set<string>`, wire each checkbox with `checked` and `onChange`. When the header checkbox is checked, select all rows; when unchecked, deselect all. Selected rows are highlighted in blue via `.table-row--selected` or CSS `:has(.checkbox__input:checked)`.

## CSS Classes

- `.table`
- `.table--striped`
- `.table__filter-bar`

## Dependencies

None (standalone component).
