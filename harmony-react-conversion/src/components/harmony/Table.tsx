import type { ReactNode } from 'react'
import clsx from 'clsx'
import './Table.css'

export interface TableProps {
  headerVariant?: 'gray' | 'white' | 'none'
  striped?: boolean
  className?: string
  titleBarContent?: ReactNode
  titleBarIcons?: ReactNode
  actionBar?: ReactNode
  header?: ReactNode
  body?: ReactNode
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
}: TableProps) {
  const hasTitleBar = titleBarContent != null || titleBarIcons != null
  const hasActionBar = actionBar != null

  const tableClasses = clsx(
    'table',
    `table--header-${headerVariant}`,
    striped && 'table--striped',
    className
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
        {header ?? (
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
        )}
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
