# LeftSidebar

Left-hand shell sidebar with optional variant and sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'cp' \| 'vp' \| 'ppm' \| 'maconomy' | 'ppm' | cp: CP theme.; vp: VP theme.; ppm: PPM theme.; maconomy: Maconomy theme. |
| sections | LeftSidebarSection[] | — | Sidebar or nav sections to render. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { LeftSidebar } from './components/harmony/LeftSidebar';

<LeftSidebar variant="cp" />
```

## Variants

- **cp**: CP theme.
- **vp**: VP theme.
- **ppm**: PPM theme.
- **maconomy**: Maconomy theme.

## CSS Classes

- `.left-sidebar`
- `.left-sidebar__item--active`
- `.left-sidebar--cp`
- `.left-sidebar--vp`
- `.left-sidebar--ppm`
- `.left-sidebar--maconomy`

## Dependencies

- Icon

## Theme Behavior

- **variant="cp"**: Two sections. Section 1: Welcome screen, Dashboard, My menu, Recent. Section 2: Search, Command Center, Accounting, Planning, Capture & contracts, Projects, Materials, Time & expense, People, Reports, Admin.
- **variant="ppm"**, **variant="vp"**, **variant="maconomy"**: One section: Command Center, Programs, Portfolios, Projects, Risk, Reports, Calendars, Codes, Rates, Resources, Settings, Add Menu.
- The React component defaults to `sections = PPM_SECTIONS`; pass `sections` to override. Astro source has separate default sections per theme (cpSections, ppmSections, vpSections, maconomySections).

## Dark Mode

In dark mode (`html.dark`), item hover uses `--hover-bg`. Icon color uses `--text-primary`; the active item icon uses `--shell-sidebar-icon-color-on-primary`. Custom img icons (e.g. `.left-sidebar__custom-icon`) use `filter: brightness(0) invert(1)` for contrast.
