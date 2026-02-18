import clsx from 'clsx'
import { ShellHeader } from './ShellHeader'
import { ShellFooter } from './ShellFooter'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { ShellPageHeader } from './ShellPageHeader'
import { Card } from './Card'
import type { ShellFooterTab } from './ShellFooter'
import type { ShellPageHeaderButtonConfig } from './ShellPageHeader'
import './ShellLayout.css'

export interface ShellLayoutProps {
  productName?: string
  logoSrc?: string
  companyName?: string
  showCompanyPicker?: boolean
  companyColor?: string
  tabs?: ShellFooterTab[]
  showFooter?: boolean
  showRightSidebar?: boolean
  pageHeaderTitle?: string
  pageHeaderSubtitle?: string
  pageHeaderPrimaryButton?: ShellPageHeaderButtonConfig
  pageHeaderOutlineButton1?: ShellPageHeaderButtonConfig
  pageHeaderOutlineButton2?: ShellPageHeaderButtonConfig
  pageHeaderOutlineButton3?: ShellPageHeaderButtonConfig
  className?: string
  children?: React.ReactNode
}

const DEFAULT_TABS: ShellFooterTab[] = [
  { id: 'tab-1', label: 'Home', active: true },
  { id: 'tab-2', label: 'Projects' },
  { id: 'tab-3', label: 'Reports' },
]

export function ShellLayout({
  productName,
  logoSrc,
  companyName,
  showCompanyPicker = true,
  companyColor,
  tabs = DEFAULT_TABS,
  showFooter = true,
  showRightSidebar = true,
  pageHeaderTitle = 'Page title',
  pageHeaderSubtitle,
  pageHeaderPrimaryButton,
  pageHeaderOutlineButton1,
  pageHeaderOutlineButton2,
  pageHeaderOutlineButton3,
  className = '',
  children,
}: ShellLayoutProps) {
  const isCPVariant = false
  const effectiveHasFooter = showFooter
  const effectiveShowFloatingNav = false

  return (
    <div
      className={clsx('shell-layout', className)}
      data-cp-variant={isCPVariant}
      data-use-theme-detection="false"
    >
      <div
        className="shell-layout__container"
        data-has-footer={String(effectiveHasFooter)}
        data-has-floating-nav={String(effectiveShowFloatingNav)}
        data-has-right-sidebar={String(showRightSidebar)}
        data-footer-variant="default"
      >
        <ShellHeader
          productName={productName}
          logoSrc={logoSrc}
          companyName={companyName}
          showCompanyPicker={showCompanyPicker}
          companyColor={companyColor}
          className="shell-layout__header"
        />

        <LeftSidebar variant="ppm" className="shell-layout__left-sidebar" />

        {showRightSidebar && (
          <RightSidebar
            variant="ppm"
            className="shell-layout__right-sidebar"
          />
        )}

        <main className="shell-layout__main">
          {pageHeaderTitle != null && pageHeaderTitle !== '' && (
            <ShellPageHeader
              title={pageHeaderTitle}
              subtitle={pageHeaderSubtitle}
              primaryButton={pageHeaderPrimaryButton}
              outlineButton1={pageHeaderOutlineButton1}
              outlineButton2={pageHeaderOutlineButton2}
              outlineButton3={pageHeaderOutlineButton3}
            />
          )}
          {children ?? (
            <Card primary elevated>
              <div className="card__body">
                <h2 className="text-xl font-semibold mb-2">
                  Page Content Area
                </h2>
                <p className="text-secondary">
                  This is where your application content lives. The shell
                  provides the structure, and you provide the content.
                </p>
              </div>
            </Card>
          )}
        </main>

        {effectiveHasFooter && (
          <ShellFooter
            tabs={tabs}
            showAddTab={true}
            variant="default"
            className="shell-layout__footer"
          />
        )}
      </div>
    </div>
  )
}
