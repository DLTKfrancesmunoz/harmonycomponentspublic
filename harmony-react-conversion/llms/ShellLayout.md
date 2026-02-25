# ShellLayout

App shell that composes header, footer, sidebars, page header, and main content.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| productName | string | — | Product or app name shown in the shell. |
| logoSrc | string | — | URL of the logo image. |
| companyName | string | — | Current company name in the shell. |
| showCompanyPicker | boolean | true | When true, the company picker is shown. |
| companyColor | string | — | Color used for the company picker. |
| showFloatingNav | boolean | — | CP only. When true, renders FloatingNav anchored to the top of the screen and enables CP layout mode. |
| floatingNavVariant | 'full' \| 'compact' | — | CP only. Passed to FloatingNav; 'full' shows all buttons, 'compact' hides Execute. |
| showExecute | boolean | — | CP only. Passed to FloatingNav; shows/hides the Execute button. |
| saveDisabled | boolean | — | CP only. Passed to FloatingNav; disables the Save button. |
| leftSidebarVariant | 'cp' \| 'vp' \| 'ppm' \| 'maconomy' | 'ppm' | Sidebar variant for LeftSidebar. |
| tabs | ShellFooterTab[] | DEFAULT_TABS | Tab definitions (id, label, active, etc.). |
| showFooter | boolean | true | When true, the shell footer is visible. |
| showRightSidebar | boolean | true | When true, the right sidebar is visible. |
| pageHeaderTitle | string | 'Page title' | Title in the shell page header. |
| pageHeaderSubtitle | string | — | Subtitle in the page header. |
| pageHeaderPrimaryButton | ShellPageHeaderButtonConfig | — | Primary button config for the shell page header. |
| pageHeaderOutlineButton1 | ShellPageHeaderButtonConfig | — | First outline button config for the page header. |
| pageHeaderOutlineButton2 | ShellPageHeaderButtonConfig | — | Second outline button config for the page header. |
| pageHeaderOutlineButton3 | ShellPageHeaderButtonConfig | — | Third outline button config for the page header. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | React.ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { ShellLayout } from './components/harmony/ShellLayout';

<ShellLayout pageHeaderTitle="Page title" pageHeaderSubtitle="Optional subtitle">
  Main content here.
</ShellLayout>
```

## CSS Classes

- `.shell-layout`

## Dependencies

- ShellHeader
- ShellFooter
- LeftSidebar
- RightSidebar
- ShellPageHeader
- Card

## Theme Behavior

- ShellLayout composes header, footer, sidebars, and page header. Theme-specific behavior is driven by child props: `logoSrc` and `companies` on ShellHeader; `variant` and `sections` on LeftSidebar and RightSidebar; `variant` on ShellFooter.
- CP theme uses FloatingNav instead of ShellFooter; in CP theme, the FloatingNav is anchored to `top: 0` (very top of screen) with z-index matching the header. Pass `showFloatingNav={true}` to enable CP layout mode in React.

## Not Yet Implemented

The following Astro props or slots are not yet available in the React conversion:

- **showMoreTabs**, **moreCount**, **overflowTabs**, **showAddTab**, **footerVariant**: Footer-level tab overflow and variant are passed to ShellFooter in Astro; React ShellLayout passes `tabs` and `showFooter` but not overflow or variant.
- **leftSidebarSections**, **rightSidebarVariant**, **rightSidebarSections**: Astro passes these to LeftSidebar/RightSidebar; React ShellLayout accepts `leftSidebarVariant` but not sections or right sidebar variant.
- **leftPanel**, **rightPanel**: Astro layout accepts panel config (side, open, title, etc.); React does not compose panels from layout props—use ShellPanel separately.
