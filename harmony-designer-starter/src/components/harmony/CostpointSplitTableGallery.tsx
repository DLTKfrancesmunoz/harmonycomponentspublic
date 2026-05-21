import React, { useState } from 'react'
import {
  TableCostpointGrid,
  CP_DATAGRID_DOCS_SCROLL_COLUMNS,
  createCpDatagridDocsDemoRows,
  type CpDatagridRow,
} from './TableCostpointGrid'

/**
 * Gallery / docs example: Costpoint split grid matching the Harmony Tables page Astro demo
 * (nine rows, scroll columns through Tax Location without Vendor Location or Template).
 */
export function CostpointSplitTableGallery(): React.ReactElement {
  const [rows, setRows] = useState<CpDatagridRow[]>(() =>
    createCpDatagridDocsDemoRows().map((r) => ({ ...r, values: { ...r.values } }))
  )
  const [selectedRowId, setSelectedRowId] = useState<string | null>('r1')
  const [activeCell, setActiveCell] = useState<{ rowId: string; columnKey: string } | null>({
    rowId: 'r1',
    columnKey: 'invoice',
  })

  return (
    <div className="ds-demo-only-theme-cp">
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Same Costpoint split grid as the Harmony <strong>Tables</strong> documentation example: nine body rows,
        scroll columns from Subperiod through Tax Location (no Vendor Location or Template column), first-row
        selection and active Invoice cell. Requires <code className="text-xs">html.theme-cp</code> and global
        styles.
      </p>
      <TableCostpointGrid
        columnsScroll={CP_DATAGRID_DOCS_SCROLL_COLUMNS}
        rows={rows}
        onRowsChange={setRows}
        selectedRowId={selectedRowId}
        onSelectedRowIdChange={setSelectedRowId}
        activeCell={activeCell}
        onActiveCellChange={setActiveCell}
      />
    </div>
  )
}
