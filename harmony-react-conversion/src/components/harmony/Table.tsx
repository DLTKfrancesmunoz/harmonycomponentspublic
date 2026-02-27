import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Icon } from './Icon'
import './Table.css'

export interface SortColumn {
  key: string
  label: string
  align?: 'left' | 'right'
}

export interface TableProps {
  headerVariant?: 'gray' | 'white' | 'none'
  striped?: boolean
  className?: string
  titleBarContent?: ReactNode
  titleBarIcons?: ReactNode
  actionBar?: ReactNode
  header?: ReactNode
  body?: ReactNode
  sortColumns?: SortColumn[]
  sortColumn?: string | null
  sortDirection?: 'asc' | 'desc' | null
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void
}

export function Table({
  headerVariant = 'gray',
  striped = false,
  className = '',
  titleBarContent,
  titleBarIcons,
  actionBar,
  header,
  body,
  sortColumns,
  sortColumn = null,
  sortDirection = null,
  onSort,
}: TableProps) {
  const hasTitleBar = titleBarContent != null || titleBarIcons != null
  const hasActionBar = actionBar != null
  const useSortHeader = sortColumns != null && sortColumns.length > 0

  const tableClasses = clsx(
    'table',
    `table--header-${headerVariant}`,
    striped && 'table--striped',
    className
  )

  function getSortIcon(key: string) {
    if (sortColumn !== key) return 'chevron-up-down'
    return sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'
  }

  function getAriaSort(key: string): 'ascending' | 'descending' | undefined {
    if (sortColumn !== key) return undefined
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  function getSortButtonLabel(key: string, label: string) {
    if (sortColumn !== key) return `Sort by ${label}`
    return `Sort by ${label} ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
  }

  function handleSortClick(columnKey: string) {
    if (!onSort) return
    const nextDirection: 'asc' | 'desc' =
      sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnKey, nextDirection)
  }

  const tableHeader =
    useSortHeader ? (
      <thead>
        <tr>
          {sortColumns!.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={col.align === 'right' ? 'text-right' : 'text-left'}
              aria-sort={getAriaSort(col.key)}
            >
              <button
                type="button"
                className="table__sort-header"
                aria-label={getSortButtonLabel(col.key, col.label)}
                onClick={() => handleSortClick(col.key)}
              >
                {col.label}
                <Icon name={getSortIcon(col.key)} size="sm" />
              </button>
            </th>
          ))}
        </tr>
      </thead>
    ) : header != null ? (
      header
    ) : (
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Status</th>
          <th scope="col">Date</th>
        </tr>
      </thead>
    )

  return (
    <div className="table-wrapper">
      {hasTitleBar && (
        <div className="table__title-bar">
          <div className="table__title-bar-content">
            {titleBarContent}
            {titleBarIcons != null && <div className="table__title-bar-icons">{titleBarIcons}</div>}
          </div>
        </div>
      )}
      {hasActionBar && <div className="table__action-bar">{actionBar}</div>}
      <table className={tableClasses}>
        {tableHeader}
        {body ?? (
          <tbody>
            <tr>
              <td>Project A</td>
              <td>Active</td>
              <td>Feb 10, 2025</td>
            </tr>
            <tr>
              <td>Project B</td>
              <td>Completed</td>
              <td>Feb 8, 2025</td>
            </tr>
            <tr>
              <td>Project C</td>
              <td>Draft</td>
              <td>Feb 12, 2025</td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  )
}
