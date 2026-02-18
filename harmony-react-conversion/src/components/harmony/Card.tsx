import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface CardProps {
  elevated?: boolean
  interactive?: boolean
  primary?: boolean
  withHeader?: boolean
  headerTitle?: string
  headerSubtitle?: string
  className?: string
  header?: ReactNode
  headerActions?: ReactNode
  children?: ReactNode
  footer?: ReactNode
}

export function Card({
  elevated = false,
  interactive = false,
  primary = false,
  withHeader = false,
  headerTitle = '',
  headerSubtitle = '',
  className = '',
  header,
  headerActions,
  children,
  footer,
}: CardProps) {
  const classes = clsx(
    'card',
    elevated && 'card--elevated',
    interactive && 'card--interactive',
    primary && 'card--primary',
    (withHeader || header != null) && 'card--with-header',
    className
  )

  const hasHeader = withHeader || header != null
  const hasFooter = footer != null

  return (
    <div className={classes}>
      {hasHeader && (
        <div className="card__header">
          {header != null ? (
            header
          ) : (
            <div className="card__header-content">
              {headerTitle && (
                <h2 className="card__header-title">{headerTitle}</h2>
              )}
              {headerSubtitle && (
                <p className="card__header-subtitle">{headerSubtitle}</p>
              )}
            </div>
          )}
          {headerActions != null && (
            <div className="card__header-actions">{headerActions}</div>
          )}
        </div>
      )}
      <div className="card__body">
        {children ?? (
          <p className="card__body-default">
            Card body content. Override by passing default slot content.
          </p>
        )}
      </div>
      {hasFooter && <div className="card__footer">{footer}</div>}
    </div>
  )
}
