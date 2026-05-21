# TableCostpointGrid (Costpoint split data grid)

Costpoint-only (`html.theme-cp`) high-density ERP-style **split grid**: four **frozen** columns (row-handle cell, Voucher, Fiscal year, Period), a resizable **split bar**, and **horizontally scrollable** detail columns. Styles live under `html.theme-cp .cp-datagrid` in Harmony **`components.css`** and CP tokens in **`tokens.css`** (vendored as `harmony-styles/` in Harmony Designer Starter).

**Parity:** Astro — `src/components/ui/TableCostpointGrid.astro` in the main design system repo. React — `harmony-react-conversion/src/components/harmony/TableCostpointGrid.tsx`. Designer Starter — mirror under `harmony-designer-starter/src/components/harmony/`. **React gallery:** entries **`TableCostpointGrid`** (full 13-row default dataset) and **`CostpointSplitTable`** (nine-row sample aligned with the Tables docs page). **Docs:** `src/pages/components/tables.astro` (Costpoint section + Astro props table).

## Behavior highlights

- **Frozen width:** Measured with `tbody` hidden so column widths follow headers; `<colgroup>` with percentage widths when the pane is sized; sized frozen table uses `min-width: 0` so the split width is not inflated by content.
- **Row selection:** React — `onPointerDownCapture` and `onClick` on each body `<tr>` in frozen and scroll tables. Astro — delegated click on `.cp-datagrid__panes` syncs `aria-selected` and `cp-datagrid__row--selected` on matching row indices in both tbodies.
- **Terms column (`<select class="cp-datagrid__select">`):** `appearance: none` (no triangle); native list still opens on click/keyboard.
- **Read-only / non-editable detail cells:** diagonal hatch via `cp-datagrid__cell--hatch` when the column is not interactively editable.

## React (`TableCostpointGrid`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| maxHeight | string | — | Optional max height on the vertical scroller. |
| scrollChrome | boolean | `false` | Horizontal arrow row under the panes and vertical arrows on the right when true. |
| className | string | `''` | Root class on `.cp-datagrid`. |
| columnsScroll | `CpDatagridColumn[]` | `CP_DATAGRID_DEFAULT_SCROLL_COLUMNS` | Scrollable column definitions (`key`, `label`, `align`, `type`, `editable`, `selectOptions`, …). |
| rows | `CpDatagridRow[]` | built-in default | Each row: `id`, `values` (must include `voucher`, `fiscalYear`, `period` for frozen cells). |
| onRowsChange | fn | — | Controlled row updates. |
| selectedRowId | string \| null | — | With `onSelectedRowIdChange`, controlled selection. |
| onSelectedRowIdChange | fn | — | |
| activeCell | `{ rowId, columnKey } \| null` | — | With `onActiveCellChange`, controlled active cell. |
| onActiveCellChange | fn | — | |
| resizableSplit | boolean | `true` | Draggable split (pointer + Arrow Left/Right on separator). |
| frozenPaneWidth | number | — | Controlled frozen pane width (px). |
| defaultFrozenPaneWidth | number | — | Initial width when uncontrolled; otherwise measured. |
| onFrozenPaneWidthChange | `(widthPx: number) => void` | — | Fired when controlled split width changes. |

### Package exports (`@deltek/harmony-react`)

- `TableCostpointGrid`, types `CpDatagridColumn`, `CpDatagridRow`, `TableCostpointGridProps`, `CpDatagridColumnType`.
- `CP_DATAGRID_DEFAULT_SCROLL_COLUMNS`, `CP_DATAGRID_DEFAULT_ROWS`.
- `CP_DATAGRID_DOCS_SCROLL_COLUMNS`, `createCpDatagridDocsDemoRows()` — docs-aligned scroll columns (no Vendor Location / Template) and nine-row factory.
- `CostpointSplitTableGallery` — gallery-ready wrapper wired to docs columns + controlled rows/selection/active cell.

## Astro (`TableCostpointGrid.astro`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| maxHeight | string | — | Caps vertical scroller height. |
| scrollChrome | boolean | `false` | Scroll arrow chrome. |
| resizableSplit | boolean | `true` | Enables split resize + measurement script. |
| class | string | `''` | Extra classes on root. |
| instanceId | string | auto-generated | **Required when multiple grids** on one page so ids stay unique. |

**Slots:** `frozen-thead`, `frozen-tbody`, `scroll-thead`, `scroll-tbody` — keep **identical row counts** in frozen and scroll body tables.

The component ships an **inline `is:inline` script** that binds split resize, frozen `<colgroup>`, horizontal rail width, scroll-button targets, and row selection.

## Accessibility

- Each `<table>` has a distinct `aria-label` (Fixed columns / Scrollable columns).
- Resizable split: `role="separator"`, `aria-orientation="vertical"`, value min/max/now when active.
- Row-handle cells use `aria-label`; React supports Enter/Space on the gutter `td` for selection.
