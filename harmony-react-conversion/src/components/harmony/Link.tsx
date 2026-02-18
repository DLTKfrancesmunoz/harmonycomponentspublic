import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Icon } from './Icon'
import './Link.css'

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  external?: boolean
  muted?: boolean
  className?: string
  children?: ReactNode
}

export function Link({
  href,
  external = false,
  muted = false,
  className = '',
  children,
  ...rest
}: LinkProps) {
  const classes = clsx('link', muted && 'link--muted', className)

  return (
    <a
      href={href}
      className={classes}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
      {external && (
        <Icon name="arrow-top-right-on-square" className="link__external-icon" size="xs" />
      )}
    </a>
  )
}
