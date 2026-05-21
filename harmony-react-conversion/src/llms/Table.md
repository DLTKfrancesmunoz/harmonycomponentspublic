# Table

Data table with optional header variant, striped rows, title bar, and filter bar.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| headerVariant | 'gray' \| 'white' \| 'none' | 'gray' | Header style (not used for command center table cells; use `sortColumns` for that variant). |
| variant | 'default' \| 'commandCenter' | 'default' | Command Center: full grid (`--table-command-center-border`), sort + filter header affordances, tinted row selection; body uses same font size and padding as default tables. Default zebra on unless `striped={false}`. |
| striped | boolean | false | When true, table rows are striped. |
| grouped | boolean | false | Enable grouped rows with expand/collapse. Rows with data-has-children show an arrow; child rows use data-parent-id and data-depth (max 4 levels). |
| className | string | '' | Additional CSS classes applied to the root element. |
| filterBar | ReactNode | — | Content for the filter bar above the table (dropdowns, chips, clear button). |
| titleBarContent | ReactNode | — | Content for the table title bar. |
| titleBarIcons | ReactNode | — | Content to render (React node). |
| actionBar | ReactNode | — | Content to render (React node). |
| header | ReactNode | — | Custom header content (overrides headerTitle/headerSubtitle when set). |
| body | ReactNode | — | Content to render (React node). |
| sortColumns | `SortColumn[]` | — | When set, renders built-in sortable header. Each column can include `sortable` and `filterable` (default true) for `variant="commandCenter"`. |
| sortColumn | `string` \| `null` | null | Current sort key (controlled). |
| sortDirection | 'asc' \| 'desc' \| null | null | Current sort direction. |
| onSort | `(key, direction) => void` | — | Sort handler. |
| onFilterClick | `(columnKey) => void` | — | Filter icon click (v1: affordance only; host implements UI). |
| commandCenterToolbar | ReactNode | — | Row above the table (e.g. “As of” date or status) when `variant="commandCenter"`. |
| selectedRowId | `string` \| `null` | null | For command center, rows should set `data-row-id`; selection shows `.table-row--command-center-selected`. |
| onRowSelect | `(rowId: string \| null) => void` | — | Row click handler (ignores interactive elements in the row). |

## Command Center layout and panel

Use a flex row so the main column shrinks when a docked right panel is shown. Import `CommandCenterPanel` from the same package.

- Layout: `command-center-layout` &gt; `command-center-layout__main` (table) and a sibling `CommandCenterPanel`.
- Table: `variant="commandCenter"`, `sortColumns` (with optional `filterable: false` per column), `selectedRowId`, `onRowSelect`, body rows with `data-row-id`.
- Panel: `CommandCenterPanel` with `title` (design-system demo uses Purchase Requisitions), `open`, `onClose`, optional `visual` (identity row + overdue banner), and `children` (e.g. `CommandCenterPanelSection` blocks for Summary and Late Items).

**CSS (grid / panel):** `--table-command-center-border` (e.g. `#E0E4EB` in light), `.table--command-center`, `.table-row--command-center-selected`, `.command-center-layout*`, `.command-center-panel*`.

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

## Grouped Rows

Expandable rows (those with child rows) display a small arrow icon on the far left. Click the arrow to expand or collapse child rows. Child rows are indented based on their depth.

When `grouped` is true, add an expand column as the first header column (`<th className="table__expand-column" scope="col" aria-label="Expand" />`). Parent rows need `data-row-id` (unique ID) and `data-has-children={true}`. Child rows need `data-parent-id` (parent's row ID) and `data-depth={1}` (1–4 for nesting level). Child rows must appear immediately after their parent in DOM order. Rows start collapsed.

```tsx
<Table
  grouped
  header={
    <thead>
      <tr>
        <th className="table__expand-column" scope="col" aria-label="Expand" />
        <th scope="col">Project ID</th>
        <th scope="col">Name</th>
        <th scope="col">Status</th>
        <th scope="col">Budget</th>
      </tr>
    </thead>
  }
  body={
    <tbody>
      <tr data-row-id="r1" data-has-children={true}>
        <td>PRJ-001</td><td>Website Redesign</td><td>Active</td><td className="text-right">$25,000</td>
      </tr>
      <tr data-parent-id="r1" data-depth={1}>
        <td>PRJ-001-A</td><td>Frontend Development</td><td>In Progress</td><td className="text-right">$12,000</td>
      </tr>
    </tbody>
  }
/>
```

## CSS Classes

- `.table`
- `.table--command-center` — Command Center table grid
- `.table--striped`
- `.table--grouped`
- `.table__cc-header` — per-column label + sort/filter controls
- `.table__cc-header-btn`
- `.table-row--command-center-selected` — tinted row selection (`var(--table-command-center-selection-bg, #0073e626)`)
- `.table__command-center-toolbar` — slot wrapper above the table
- `.command-center-layout` / `command-center-layout__main` — main + panel row
- `.command-center-panel` — docked detail panel
- `.table__expand-column`
- `.table__expand-cell`
- `.table__filter-bar`

## Dependencies

**CommandCenterPanel** — optional companion for the docked right panel (same package).
