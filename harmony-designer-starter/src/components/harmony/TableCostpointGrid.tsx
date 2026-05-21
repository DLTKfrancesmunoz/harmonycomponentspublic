import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Checkbox } from './Checkbox'
import { Icon } from './Icon'

export type CpDatagridColumnType = 'text' | 'number' | 'year' | 'date' | 'select' | 'checkbox' | 'readonly'

export interface CpDatagridColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  type?: CpDatagridColumnType
  editable?: boolean
  required?: boolean
  selectOptions?: { label: string; value: string }[]
  minWidth?: number
}

export interface CpDatagridRow {
  id: string
  values: Record<string, string | boolean>
}

export const CP_DATAGRID_DEFAULT_SCROLL_COLUMNS: CpDatagridColumn[] = [
  { key: 'subperiod', label: 'Subperiod *', align: 'right', type: 'number', editable: true, required: true },
  { key: 'originalVoucher', label: 'Original Voucher', align: 'left', type: 'readonly' },
  { key: 'vendor', label: 'Vendor *', align: 'left', type: 'readonly', required: true },
  { key: 'vendorName', label: 'Vendor Name', align: 'left', type: 'readonly' },
  { key: 'vendorLocation', label: 'Vendor Location', align: 'left', type: 'readonly' },
  {
    key: 'terms',
    label: 'Terms',
    align: 'left',
    type: 'select',
    editable: true,
    selectOptions: [
      { label: 'NET 30', value: 'NET 30' },
      { label: '90 Days', value: '90 Days' },
    ],
  },
  { key: 'approved', label: 'Approved', align: 'center', type: 'checkbox', editable: true },
  { key: 'template', label: 'Template', align: 'center', type: 'checkbox', editable: true },
  { key: 'invoice', label: 'Invoice', align: 'left', type: 'text', editable: true },
  { key: 'invoiceDate', label: 'Invoice Date', align: 'left', type: 'date', editable: true },
  {
    key: 'invoiceAmount',
    label: 'Invoice Amount *',
    align: 'left',
    type: 'number',
    editable: true,
    required: true,
  },
  { key: 'discountPercent', label: 'Discount Percent', align: 'right', type: 'number', editable: true },
  { key: 'discountDate', label: 'Discount Date', align: 'left', type: 'date', editable: true },
  { key: 'discountAmount', label: 'Discount Amount', align: 'right', type: 'number', editable: true },
  { key: 'apAccount', label: 'A/P Account Description', align: 'left', type: 'text', editable: true },
  { key: 'cashAccount', label: 'Cash Account Description', align: 'left', type: 'text', editable: true },
  { key: 'dueDate', label: 'Due Date', align: 'left', type: 'date', editable: true },
  { key: 'dueAmount', label: 'Due Amount', align: 'right', type: 'number', editable: true },
  { key: 'voucherType', label: 'Voucher Type', align: 'left', type: 'text', editable: true },
  {
    key: 'voucherLineDist',
    label: 'Voucher Line Distribution Recalculation Method',
    align: 'left',
    type: 'text',
    editable: true,
  },
  {
    key: 'salesTaxCharged',
    label: 'When Calculated Sales Tax is Charged',
    align: 'left',
    type: 'text',
    editable: true,
  },
  { key: 'inputFileVoucherNo', label: 'Input File Voucher No', align: 'left', type: 'text', editable: true },
  { key: 'totalTaxAmt', label: 'Total Tax Amt', align: 'right', type: 'number', editable: true },
  { key: 'remainingBalance', label: 'Remaining Balance', align: 'right', type: 'number', editable: true },
  { key: 'taxId', label: 'Tax ID', align: 'left', type: 'text', editable: true },
  { key: 'taxingDate', label: 'Taxing Date', align: 'left', type: 'date', editable: true },
  { key: 'taxLocation', label: 'Tax Location', align: 'left', type: 'text', editable: true },
]

/** Matches Harmony docs Tables page: scroll columns without Vendor Location or Template. */
const CP_DATAGRID_DOCS_SCROLL_OMIT_KEYS = new Set<string>(['vendorLocation', 'template'])
export const CP_DATAGRID_DOCS_SCROLL_COLUMNS: CpDatagridColumn[] = CP_DATAGRID_DEFAULT_SCROLL_COLUMNS.filter(
  (c) => !CP_DATAGRID_DOCS_SCROLL_OMIT_KEYS.has(c.key)
)

/** Nine-row sample aligned with `TableCostpointGrid.astro` on the Tables documentation page. */
export function createCpDatagridDocsDemoRows(): CpDatagridRow[] {
  const names = ['ACME Supplies', 'Contoso LLC', 'Fabrikam Parts', 'Northwind', 'Tailspin'] as const
  return Array.from({ length: 9 }, (_, i) => ({
    id: `r${i + 1}`,
    values: {
      voucher: String(10042 + i),
      fiscalYear: '2020',
      period: String((i % 4) + 1),
      subperiod: String((i % 2) + 1),
      originalVoucher: i === 7 ? '10040' : '',
      vendor: `V${100004 + i}`,
      vendorName: names[i % names.length],
      terms: i % 2 === 0 ? 'NET 30' : '90 Days',
      approved: i % 2 === 0,
      invoice: `INV-${9921 + i}`,
      invoiceDate: `03/${String(15 + (i % 10)).padStart(2, '0')}/2020`,
      invoiceAmount: `${((i + 1) * 1000).toLocaleString('en-US')}.00`,
      discountPercent: i === 1 ? '2.00' : '0.00',
      discountDate: i === 1 ? '03/25/2020' : `03/${String(10 + (i % 15)).padStart(2, '0')}/2020`,
      discountAmount: i === 1 ? '84.01' : '0.00',
      apAccount: '2000 — Accounts Payable',
      cashAccount: '1000 — Operating Cash',
      dueDate: `04/${String(10 + (i % 14)).padStart(2, '0')}/2020`,
      dueAmount: `${((i + 1) * 1000 - (i === 1 ? 84 : 0)).toLocaleString('en-US')}.00`,
      voucherType: i % 8 === 7 ? 'Credit' : 'Standard',
      voucherLineDist: i % 3 === 0 ? 'Prorate' : i % 3 === 1 ? 'None' : 'Prorate',
      salesTaxCharged: i % 2 === 0 ? 'On receipt' : 'Never',
      inputFileVoucherNo: i === 5 ? 'IF-001' : '',
      totalTaxAmt: i % 4 === 0 ? '12.50' : '0.00',
      remainingBalance: `${((i + 1) * 1000).toLocaleString('en-US')}.00`,
      taxId: i === 2 ? 'T-88' : '',
      taxingDate: i === 2 ? '03/20/2020' : `05/${String(1 + (i % 27)).padStart(2, '0')}/2020`,
      taxLocation: ['MA', 'WA', 'IL', 'TX', 'FL'][i % 5],
    },
  }))
}

export const CP_DATAGRID_DEFAULT_ROWS: CpDatagridRow[] = [
  {
    id: 'r1',
    values: {
      voucher: '10042',
      fiscalYear: '2020',
      period: '1',
      subperiod: '1',
      originalVoucher: '',
      vendor: 'V100004',
      vendorName: 'ACME Supplies',
      vendorLocation: 'Boston',
      terms: 'NET 30',
      approved: true,
      template: false,
      invoice: 'INV-9921',
      invoiceDate: '03/15/2020',
      invoiceAmount: '155000.00',
      discountPercent: '0.00',
      discountDate: '03/10/2020',
      discountAmount: '0.00',
      apAccount: '2000 — Accounts Payable',
      cashAccount: '1000 — Operating Cash',
      dueDate: '04/14/2020',
      dueAmount: '155000.00',
      voucherType: 'Standard',
      voucherLineDist: 'Prorate',
      salesTaxCharged: 'On receipt',
      inputFileVoucherNo: '',
      totalTaxAmt: '0.00',
      remainingBalance: '155000.00',
      taxId: '',
      taxingDate: '04/02/2020',
      taxLocation: 'MA',
    },
  },
  {
    id: 'r2',
    values: {
      voucher: '10043',
      fiscalYear: '2020',
      period: '2',
      subperiod: '1',
      originalVoucher: '',
      vendor: 'V100005',
      vendorName: 'Contoso LLC',
      vendorLocation: 'Seattle',
      terms: '90 Days',
      approved: false,
      template: false,
      invoice: 'INV-9922',
      invoiceDate: '03/20/2020',
      invoiceAmount: '4200.50',
      discountPercent: '2.00',
      discountDate: '03/25/2020',
      discountAmount: '84.01',
      apAccount: '2000 — Accounts Payable',
      cashAccount: '1000 — Operating Cash',
      dueDate: '06/18/2020',
      dueAmount: '4116.49',
      voucherType: 'Standard',
      voucherLineDist: 'None',
      salesTaxCharged: 'Never',
      inputFileVoucherNo: 'IF-001',
      totalTaxAmt: '12.50',
      remainingBalance: '4104.00',
      taxId: 'T-88',
      taxingDate: '03/20/2020',
      taxLocation: 'WA',
    },
  },
  {
    id: 'r3',
    values: {
      voucher: '10044',
      fiscalYear: '2020',
      period: '2',
      subperiod: '2',
      originalVoucher: '10040',
      vendor: 'V100006',
      vendorName: 'Fabrikam Parts',
      vendorLocation: 'Chicago',
      terms: 'NET 30',
      approved: true,
      template: true,
      invoice: 'INV-9923',
      invoiceDate: '04/01/2020',
      invoiceAmount: '890.00',
      discountPercent: '0.00',
      discountDate: '03/18/2020',
      discountAmount: '0.00',
      apAccount: '2000 — Accounts Payable',
      cashAccount: '1000 — Operating Cash',
      dueDate: '05/01/2020',
      dueAmount: '890.00',
      voucherType: 'Credit',
      voucherLineDist: 'Prorate',
      salesTaxCharged: 'On receipt',
      inputFileVoucherNo: '',
      totalTaxAmt: '0.00',
      remainingBalance: '890.00',
      taxId: '',
      taxingDate: '04/08/2020',
      taxLocation: 'IL',
    },
  },
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 4
    const locs = ['Boston', 'Seattle', 'Chicago', 'Austin', 'Denver', 'Miami', 'Portland', 'Dallas', 'Phoenix', 'Atlanta'] as const
    const names = [
      'ACME Supplies',
      'Contoso LLC',
      'Fabrikam Parts',
      'Northwind',
      'Tailspin',
      'Alpine Co',
      'Summit Inc',
      'Harbor LLC',
      'Peak Co',
      'Ridge Ltd',
    ] as const
    return {
      id: `r${n}`,
      values: {
        voucher: String(10040 + n),
        fiscalYear: '2020',
        period: String((n % 12) + 1),
        subperiod: String((n % 3) + 1),
        originalVoucher: n === 8 ? '10040' : '',
        vendor: `V${100006 + n}`,
        vendorName: names[i % names.length],
        vendorLocation: locs[i % locs.length],
        terms: i % 2 ? '90 Days' : 'NET 30',
        approved: n % 2 === 0,
        template: n % 5 === 0,
        invoice: `INV-${9920 + n}`,
        invoiceDate: `0${(n % 9) + 1}/15/2020`,
        invoiceAmount: `${(n * 250).toFixed(2)}`,
        discountPercent: '0.00',
        discountDate: `05/${String(1 + (n % 22)).padStart(2, '0')}/2020`,
        discountAmount: '0.00',
        apAccount: '2000 — Accounts Payable',
        cashAccount: '1000 — Operating Cash',
        dueDate: `0${(n % 9) + 1}/30/2020`,
        dueAmount: `${(n * 250).toFixed(2)}`,
        voucherType: 'Standard',
        voucherLineDist: 'Prorate',
        salesTaxCharged: 'On receipt',
        inputFileVoucherNo: '',
        totalTaxAmt: '0.00',
        remainingBalance: `${(n * 250).toFixed(2)}`,
        taxId: '',
        taxingDate: `06/${String(1 + (n % 24)).padStart(2, '0')}/2020`,
        taxLocation: 'US',
      },
    }
  }),
]

export interface TableCostpointGridProps {
  maxHeight?: string
  scrollChrome?: boolean
  className?: string
  columnsScroll?: CpDatagridColumn[]
  rows?: CpDatagridRow[]
  onRowsChange?: (rows: CpDatagridRow[]) => void
  selectedRowId?: string | null
  onSelectedRowIdChange?: (id: string | null) => void
  /** Cell in edit/focus highlight (e.g. first row Invoice). */
  activeCell?: { rowId: string; columnKey: string } | null
  onActiveCellChange?: (cell: { rowId: string; columnKey: string } | null) => void
  /** When true (default), the split bar can be dragged to resize the frozen vs scroll panes. */
  resizableSplit?: boolean
  /** Controlled frozen pane width in CSS pixels. */
  frozenPaneWidth?: number
  /** Initial frozen pane width when uncontrolled (defaults to measured intrinsic width so frozen headers are not clipped). */
  defaultFrozenPaneWidth?: number
  onFrozenPaneWidthChange?: (widthPx: number) => void
}

function cellClass(align?: 'left' | 'right' | 'center') {
  if (align === 'right') return 'cp-datagrid__cell--right'
  if (align === 'center') return 'cp-datagrid__cell--center'
  return 'cp-datagrid__cell--left'
}

/** Diagonal hatch for any cell that is not interactively editable (matches renderScrollCell). */
function tdNeedsHatch(col: CpDatagridColumn): boolean {
  const type = col.type ?? 'text'
  if (type === 'checkbox' && col.editable) return false
  if (type === 'select' && col.editable && col.selectOptions?.length) return false
  if (type === 'date' && col.editable) return false
  return type === 'readonly' || !col.editable
}

function getStr(row: CpDatagridRow, key: string): string {
  const v = row.values[key]
  if (typeof v === 'boolean') return v ? 'true' : ''
  return v == null ? '' : String(v)
}

function setRowValue(rows: CpDatagridRow[], rowId: string, key: string, value: string | boolean): CpDatagridRow[] {
  return rows.map((r) =>
    r.id === rowId ? { ...r, values: { ...r.values, [key]: value } } : r
  )
}

const CP_DG_MIN_FROZEN_PX = 220
const CP_DG_MIN_SCROLL_PX = 120

type FrozenColPlan = { total: number; colPcts: number[] }

/**
 * Measure frozen table min width and per-column % plan for <colgroup>.
 * Body rows are hidden during measure so column widths follow header text, not wide inputs.
 * With table-layout:fixed + width:100%, colPcts keep narrow title columns tight when the pane is dragged.
 */
function measureFrozenColumnPlanPx(frozenEl: HTMLElement, absMin: number): FrozenColPlan {
  const hadSized = frozenEl.classList.contains('cp-datagrid__frozen--sized')
  const prevFlex = frozenEl.style.flex
  const prevWidth = frozenEl.style.width
  frozenEl.classList.remove('cp-datagrid__frozen--sized')
  frozenEl.style.flex = '0 0 auto'
  frozenEl.style.width = 'max-content'
  frozenEl.offsetWidth

  const table = frozenEl.querySelector('table')
  const tbody = table?.querySelector(':scope > tbody')
  const prevTbodyDisplay = tbody instanceof HTMLElement ? tbody.style.display : ''
  if (tbody instanceof HTMLElement) {
    tbody.style.display = 'none'
  }
  frozenEl.offsetWidth

  const theadRow = table?.querySelector(':scope > thead > tr')
  const cells = theadRow?.querySelectorAll('th')
  const ws: number[] = []
  if (cells?.length) {
    for (let i = 0; i < cells.length; i++) {
      const el = cells[i] as HTMLElement
      ws.push(Math.ceil(Math.max(el.scrollWidth, el.getBoundingClientRect().width)))
    }
  }

  const fromHeaders = ws.reduce((a, b) => a + b, 0)
  const tableW = table instanceof HTMLElement ? Math.ceil(table.scrollWidth) : 0
  const boxW = Math.ceil(frozenEl.getBoundingClientRect().width)
  const measured =
    fromHeaders >= absMin ? fromHeaders : tableW > 0 ? tableW : boxW
  const total = Math.max(absMin, measured > 0 ? measured : absMin)

  if (tbody instanceof HTMLElement) {
    tbody.style.display = prevTbodyDisplay
  }
  frozenEl.style.width = prevWidth
  frozenEl.style.flex = prevFlex
  if (hadSized) frozenEl.classList.add('cp-datagrid__frozen--sized')

  if (!ws.length || fromHeaders <= 0) {
    return { total, colPcts: [] }
  }
  const rawPcts = ws.map((w) => (100 * w) / fromHeaders)
  const colPcts = [...rawPcts]
  const pSum = colPcts.reduce((a, b) => a + b, 0)
  colPcts[colPcts.length - 1] += 100 - pSum
  return { total, colPcts }
}

/** Clamp frozen pane width to a movable [floor, maxW] range (see clampFrozenPaneWidthPx). */
function frozenDragFloorPx(idealContentMinPx: number, maxWPx: number): number {
  const floor =
    idealContentMinPx <= maxWPx
      ? Math.max(CP_DG_MIN_FROZEN_PX, idealContentMinPx)
      : CP_DG_MIN_FROZEN_PX
  return Math.min(maxWPx, floor)
}

function clampFrozenPaneWidthPx(desiredPx: number, idealContentMinPx: number, maxWPx: number): number {
  const dragFloor = frozenDragFloorPx(idealContentMinPx, maxWPx)
  return Math.min(maxWPx, Math.max(dragFloor, desiredPx))
}

export function TableCostpointGrid({
  maxHeight,
  scrollChrome = false,
  className = '',
  columnsScroll = CP_DATAGRID_DEFAULT_SCROLL_COLUMNS,
  rows: rowsProp,
  onRowsChange,
  selectedRowId: selectedRowIdProp,
  onSelectedRowIdChange,
  activeCell: activeCellProp,
  onActiveCellChange,
  resizableSplit = true,
  frozenPaneWidth: frozenPaneWidthProp,
  defaultFrozenPaneWidth,
  onFrozenPaneWidthChange,
}: TableCostpointGridProps) {
  const uid = useId().replace(/:/g, '')
  const yId = `${uid}-y`
  const xId = `${uid}-x`
  const hRailId = `${uid}-hrail`
  const rootRef = useRef<HTMLDivElement>(null)
  const panesRef = useRef<HTMLDivElement>(null)
  const frozenRef = useRef<HTMLDivElement>(null)
  const splitRef = useRef<HTMLDivElement>(null)
  const yScroller = useRef<HTMLDivElement>(null)
  const xScroller = useRef<HTMLDivElement>(null)
  const xInnerRef = useRef<HTMLDivElement>(null)
  const hRailRef = useRef<HTMLDivElement>(null)
  const hGhostRef = useRef<HTMLDivElement>(null)
  const dragActive = useRef(false)
  const dragStart = useRef({ clientX: 0, width: 0 })

  const isFrozenControlled = frozenPaneWidthProp !== undefined
  const [internalFrozenW, setInternalFrozenW] = useState<number | null>(() =>
    isFrozenControlled ? null : defaultFrozenPaneWidth ?? null
  )
  const [frozenContentMinPx, setFrozenContentMinPx] = useState(CP_DG_MIN_FROZEN_PX)
  const [frozenColPcts, setFrozenColPcts] = useState<number[] | null>(null)
  const resolvedFrozenW = frozenPaneWidthProp ?? internalFrozenW ?? frozenContentMinPx
  const frozenSized = resizableSplit && (isFrozenControlled || internalFrozenW !== null)
  const frozenWidthPx = frozenPaneWidthProp ?? internalFrozenW

  const [rowsUncontrolled, setRowsUncontrolled] = useState(CP_DATAGRID_DEFAULT_ROWS)
  const rows = rowsProp ?? rowsUncontrolled
  const setRows = onRowsChange ?? ((next: CpDatagridRow[]) => setRowsUncontrolled(next))

  const [selectedRowIdUncontrolled, setSelectedRowIdUncontrolled] = useState<string | null>('r1')
  const selectedRowId = selectedRowIdProp !== undefined ? selectedRowIdProp : selectedRowIdUncontrolled
  const setSelectedRowId = onSelectedRowIdChange ?? setSelectedRowIdUncontrolled

  const [activeCellUncontrolled, setActiveCellUncontrolled] = useState<{
    rowId: string
    columnKey: string
  } | null>({ rowId: 'r1', columnKey: 'invoice' })
  const activeCell = activeCellProp !== undefined ? activeCellProp : activeCellUncontrolled
  const setActiveCell = onActiveCellChange ?? setActiveCellUncontrolled

  const [frozenLeadW, setFrozenLeadW] = useState(0)

  const getMaxFrozenPx = useCallback(() => {
    const panes = panesRef.current
    if (!panes) return 640
    const pw = panes.getBoundingClientRect().width
    const sw = splitRef.current?.getBoundingClientRect().width ?? 3
    return Math.max(CP_DG_MIN_FROZEN_PX, pw - sw - CP_DG_MIN_SCROLL_PX)
  }, [])

  const commitFrozenWidth = useCallback(
    (w: number) => {
      const maxW = getMaxFrozenPx()
      const clamped = clampFrozenPaneWidthPx(w, frozenContentMinPx, maxW)
      if (isFrozenControlled) onFrozenPaneWidthChange?.(clamped)
      else setInternalFrozenW(clamped)
    },
    [isFrozenControlled, getMaxFrozenPx, onFrozenPaneWidthChange, frozenContentMinPx]
  )

  useLayoutEffect(() => {
    if (!resizableSplit) return
    const el = frozenRef.current
    if (!el) return
    const plan = measureFrozenColumnPlanPx(el, CP_DG_MIN_FROZEN_PX)
    const maxW = getMaxFrozenPx()
    setFrozenContentMinPx(plan.total)
    setFrozenColPcts(plan.colPcts.length ? plan.colPcts : null)
    if (!isFrozenControlled) {
      setInternalFrozenW((prev) => clampFrozenPaneWidthPx(prev ?? plan.total, plan.total, maxW))
    }
  }, [resizableSplit, isFrozenControlled, rows, columnsScroll, defaultFrozenPaneWidth, getMaxFrozenPx])

  useLayoutEffect(() => {
    const el = frozenRef.current
    if (!el) return
    const sync = () => setFrozenLeadW(Math.ceil(el.getBoundingClientRect().width))
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
    return () => ro.disconnect()
  }, [resolvedFrozenW, frozenWidthPx, frozenSized])

  useLayoutEffect(() => {
    const inner = xInnerRef.current
    const ghost = hGhostRef.current
    const rail = hRailRef.current
    if (!inner || !ghost) return
    const sync = () => {
      ghost.style.width = `${inner.scrollWidth}px`
      if (rail) {
        const max = Math.max(0, inner.scrollWidth - rail.clientWidth)
        if (rail.scrollLeft > max) rail.scrollLeft = max
        const xInner = xInnerRef.current
        if (xInner) xInner.style.transform = `translateX(${-rail.scrollLeft}px)`
      }
    }
    const ro = new ResizeObserver(sync)
    ro.observe(inner)
    sync()
    return () => ro.disconnect()
  }, [columnsScroll, rows])

  useEffect(() => {
    if (!resizableSplit) return
    if (!isFrozenControlled && internalFrozenW === null) return
    const panes = panesRef.current
    if (!panes) return
    const ro = new ResizeObserver(() => {
      const maxW = getMaxFrozenPx()
      const cur = frozenPaneWidthProp ?? internalFrozenW ?? frozenContentMinPx
      const floor = frozenDragFloorPx(frozenContentMinPx, maxW)
      if (cur < floor) commitFrozenWidth(frozenContentMinPx)
      else if (cur > maxW) commitFrozenWidth(maxW)
      splitRef.current?.setAttribute('aria-valuemax', String(Math.round(maxW)))
    })
    ro.observe(panes)
    return () => ro.disconnect()
  }, [
    resizableSplit,
    isFrozenControlled,
    internalFrozenW,
    commitFrozenWidth,
    getMaxFrozenPx,
    frozenPaneWidthProp,
    frozenContentMinPx,
  ])

  const onSplitPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizableSplit) return
      if (e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragActive.current = true
      dragStart.current = {
        clientX: e.clientX,
        width: frozenRef.current?.getBoundingClientRect().width ?? resolvedFrozenW,
      }
      rootRef.current?.classList.add('cp-datagrid--resizing-split')
    },
    [resizableSplit, resolvedFrozenW]
  )

  const onSplitPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragActive.current) return
      const maxW = getMaxFrozenPx()
      const next = clampFrozenPaneWidthPx(
        dragStart.current.width + (e.clientX - dragStart.current.clientX),
        frozenContentMinPx,
        maxW
      )
      if (isFrozenControlled) onFrozenPaneWidthChange?.(next)
      else setInternalFrozenW(next)
    },
    [isFrozenControlled, getMaxFrozenPx, onFrozenPaneWidthChange, frozenContentMinPx]
  )

  const endSplitDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActive.current) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    dragActive.current = false
    rootRef.current?.classList.remove('cp-datagrid--resizing-split')
  }, [])

  const onSplitKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!resizableSplit) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const step = e.shiftKey ? 24 : 8
      const delta = e.key === 'ArrowRight' ? step : -step
      commitFrozenWidth(resolvedFrozenW + delta)
    },
    [resizableSplit, commitFrozenWidth, resolvedFrozenW]
  )

  const patchRow = useCallback(
    (rowId: string, key: string, value: string | boolean) => {
      setRows(setRowValue(rows, rowId, key, value))
    },
    [rows, setRows]
  )

  const scrollY = useCallback(
    (dy: number) => {
      yScroller.current?.scrollBy({ top: dy, behavior: 'smooth' })
    },
    []
  )
  const scrollX = useCallback((dx: number) => {
    hRailRef.current?.scrollBy({ left: dx, behavior: 'smooth' })
  }, [])

  const onHRailScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const left = e.currentTarget.scrollLeft
    const inner = xInnerRef.current
    if (inner) inner.style.transform = `translateX(${-left}px)`
  }, [])

  const onScrollXWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const rail = hRailRef.current
    if (!rail) return
    const dx = e.deltaX !== 0 ? e.deltaX : e.shiftKey ? e.deltaY : 0
    if (!dx) return
    e.preventDefault()
    rail.scrollLeft += dx
    const inner = xInnerRef.current
    if (inner) inner.style.transform = `translateX(${-rail.scrollLeft}px)`
  }, [])

  const renderScrollCell = (row: CpDatagridRow, col: CpDatagridColumn) => {
    const v = row.values[col.key]
    const str = typeof v === 'boolean' ? '' : String(v ?? '')
    const isActive = activeCell?.rowId === row.id && activeCell?.columnKey === col.key
    const type = col.type ?? 'text'

    if (type === 'checkbox' && col.editable) {
      return (
        <div className="cp-datagrid__cell-inner">
          <Checkbox
            checked={!!v}
            onChange={(e) => patchRow(row.id, col.key, e.target.checked)}
            aria-label={col.label}
          />
        </div>
      )
    }

    if (type === 'select' && col.editable && col.selectOptions) {
      return (
        <select
          className="cp-datagrid__select"
          value={str}
          onChange={(e) => patchRow(row.id, col.key, e.target.value)}
          onFocus={() => setActiveCell({ rowId: row.id, columnKey: col.key })}
          aria-label={col.label}
        >
          {col.selectOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    }

    if (type === 'date' && col.editable) {
      return (
        <div className="cp-datagrid__date-wrap">
          <input
            type="text"
            className={clsx(
              'cp-datagrid__input',
              col.editable && 'cp-datagrid__input--edit',
              isActive && 'cp-datagrid__input--active'
            )}
            value={str}
            readOnly={false}
            onChange={(e) => patchRow(row.id, col.key, e.target.value)}
            onFocus={() => setActiveCell({ rowId: row.id, columnKey: col.key })}
            aria-label={col.label}
          />
          <button
            type="button"
            className="cp-datagrid__scroll-btn"
            style={{ width: 24, height: 24, flexShrink: 0 }}
            aria-label={`Calendar ${col.label}`}
            onClick={() => setActiveCell({ rowId: row.id, columnKey: col.key })}
          >
            <Icon name="calendar" size="sm" aria-hidden />
          </button>
        </div>
      )
    }

    const readOnly = type === 'readonly' || !col.editable
    const inputType = type === 'number' || type === 'year' ? 'text' : 'text'

    return (
      <input
        type={inputType}
        inputMode={type === 'number' ? 'decimal' : undefined}
        className={clsx(
          'cp-datagrid__input',
          col.editable && 'cp-datagrid__input--edit',
          isActive && 'cp-datagrid__input--active'
        )}
        value={str}
        readOnly={readOnly}
        onChange={(e) => !readOnly && patchRow(row.id, col.key, e.target.value)}
        onFocus={() => !readOnly && setActiveCell({ rowId: row.id, columnKey: col.key })}
        aria-label={col.label}
        aria-readonly={readOnly ? true : undefined}
      />
    )
  }

  const theadScroll = useMemo(
    () => (
      <tr>
        {columnsScroll.map((col) => (
          <th
            key={col.key}
            className={cellClass(col.align)}
          >
            {col.required ? (
              <>
                {col.label.replace(/\s*\*$/, '')}
                <span aria-hidden="true"> *</span>
              </>
            ) : (
              col.label
            )}
          </th>
        ))}
      </tr>
    ),
    [columnsScroll]
  )

  return (
    <div ref={rootRef} className={clsx('cp-datagrid', className)}>
      <div className="cp-datagrid__primary">
        <div
          ref={yScroller}
          className="cp-datagrid__y-scroller"
          id={yId}
          tabIndex={-1}
          style={maxHeight ? { maxHeight } : undefined}
        >
          <div ref={panesRef} className="cp-datagrid__panes">
          <div
            ref={frozenRef}
            className={clsx('cp-datagrid__frozen', frozenSized && 'cp-datagrid__frozen--sized')}
            style={
              frozenSized && frozenWidthPx != null
                ? { flex: `0 0 ${frozenWidthPx}px`, width: frozenWidthPx }
                : undefined
            }
          >
            <table className="cp-datagrid__table" aria-label="Fixed columns">
              {frozenSized && frozenColPcts && frozenColPcts.length > 0 ? (
                <colgroup>
                  {frozenColPcts.map((p, i) => (
                    <col key={`fcol-${i}`} style={{ width: `${p}%` }} />
                  ))}
                </colgroup>
              ) : null}
              <thead>
                <tr>
                  <th
                    className="cp-datagrid__cell--center cp-datagrid__cell--gutter"
                    aria-label="Row"
                  />
                  <th>Voucher</th>
                  <th>Fiscal year *</th>
                  <th>Period *</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    aria-selected={selectedRowId === row.id}
                    className={clsx(selectedRowId === row.id && 'cp-datagrid__row--selected')}
                    onPointerDownCapture={() => setSelectedRowId(row.id)}
                    onClick={() => setSelectedRowId(row.id)}
                  >
                    <td
                      className="cp-datagrid__cell--center cp-datagrid__cell--gutter"
                      aria-label={`Select row ${row.id}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedRowId(row.id)
                        }
                      }}
                    />
                    <td className="cp-datagrid__cell--right">
                      <input
                        className={clsx(
                          'cp-datagrid__input',
                          'cp-datagrid__input--edit',
                          activeCell?.rowId === row.id &&
                            activeCell?.columnKey === 'voucher' &&
                            'cp-datagrid__input--active'
                        )}
                        value={getStr(row, 'voucher')}
                        onChange={(e) => patchRow(row.id, 'voucher', e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, columnKey: 'voucher' })}
                        aria-label="Voucher"
                      />
                    </td>
                    <td className="cp-datagrid__cell--left">
                      <input
                        className={clsx(
                          'cp-datagrid__input',
                          'cp-datagrid__input--edit',
                          activeCell?.rowId === row.id &&
                            activeCell?.columnKey === 'fiscalYear' &&
                            'cp-datagrid__input--active'
                        )}
                        value={getStr(row, 'fiscalYear')}
                        onChange={(e) => patchRow(row.id, 'fiscalYear', e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, columnKey: 'fiscalYear' })}
                        aria-label="Fiscal year"
                      />
                    </td>
                    <td className="cp-datagrid__cell--right">
                      <input
                        className={clsx(
                          'cp-datagrid__input',
                          'cp-datagrid__input--edit',
                          activeCell?.rowId === row.id &&
                            activeCell?.columnKey === 'period' &&
                            'cp-datagrid__input--active'
                        )}
                        value={getStr(row, 'period')}
                        onChange={(e) => patchRow(row.id, 'period', e.target.value)}
                        onFocus={() => setActiveCell({ rowId: row.id, columnKey: 'period' })}
                        aria-label="Period"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resizableSplit ? (
            <div
              ref={splitRef}
              className="cp-datagrid__split"
              data-cp-dg-split=""
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize frozen and scroll columns"
              aria-valuemin={Math.round(frozenDragFloorPx(frozenContentMinPx, getMaxFrozenPx()))}
              aria-valuemax={Math.round(getMaxFrozenPx())}
              aria-valuenow={
                frozenSized && frozenWidthPx != null ? Math.round(frozenWidthPx) : undefined
              }
              tabIndex={0}
              onPointerDown={onSplitPointerDown}
              onPointerMove={onSplitPointerMove}
              onPointerUp={endSplitDrag}
              onPointerCancel={endSplitDrag}
              onKeyDown={onSplitKeyDown}
            />
          ) : (
            <div className="cp-datagrid__split" aria-hidden />
          )}
          <div className="cp-datagrid__scroll-stack">
            <div
              ref={xScroller}
              className="cp-datagrid__scroll-x"
              id={xId}
              tabIndex={-1}
              onWheel={onScrollXWheel}
            >
              <div ref={xInnerRef} className="cp-datagrid__scroll-x-inner">
                <table className="cp-datagrid__table" aria-label="Scrollable columns">
                  <thead>{theadScroll}</thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        aria-selected={selectedRowId === row.id}
                        className={clsx(selectedRowId === row.id && 'cp-datagrid__row--selected')}
                        onPointerDownCapture={() => setSelectedRowId(row.id)}
                        onClick={() => setSelectedRowId(row.id)}
                      >
                        {columnsScroll.map((col) => (
                          <td
                            key={col.key}
                            className={clsx(cellClass(col.align), tdNeedsHatch(col) && 'cp-datagrid__cell--hatch')}
                          >
                            {renderScrollCell(row, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {scrollChrome && (
              <div className="cp-datagrid__scroll-chrome-h">
                <button
                  type="button"
                  className="cp-datagrid__scroll-btn"
                  aria-label="Scroll left"
                  onClick={() => scrollX(-120)}
                >
                  <Icon name="chevron-left" size="sm" aria-hidden />
                </button>
                <button
                  type="button"
                  className="cp-datagrid__scroll-btn"
                  aria-label="Scroll right"
                  onClick={() => scrollX(120)}
                >
                  <Icon name="chevron-right" size="sm" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        <div className="cp-datagrid__hscroll-row">
          <div className="cp-datagrid__hscroll-mirror" style={{ width: frozenLeadW }} aria-hidden />
          <div className="cp-datagrid__hscroll-split-mirror" aria-hidden />
          <div
            ref={hRailRef}
            id={hRailId}
            className="cp-datagrid__hscroll-rail"
            tabIndex={0}
            aria-label="Scroll horizontally"
            onScroll={onHRailScroll}
          >
            <div ref={hGhostRef} className="cp-datagrid__hscroll-rail__ghost" aria-hidden />
          </div>
        </div>
      </div>
      {scrollChrome && (
        <div className="cp-datagrid__v-chrome" aria-label="Vertical scroll controls">
          <button
            type="button"
            className="cp-datagrid__scroll-btn cp-datagrid__scroll-btn--stack"
            aria-label="Scroll up"
            onClick={() => scrollY(-34)}
          >
            <Icon name="chevron-up" size="sm" aria-hidden />
          </button>
          <button
            type="button"
            className="cp-datagrid__scroll-btn cp-datagrid__scroll-btn--stack"
            aria-label="Scroll down"
            onClick={() => scrollY(34)}
          >
            <Icon name="chevron-down" size="sm" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
