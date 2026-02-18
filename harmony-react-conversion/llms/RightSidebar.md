# RightSidebar

Right-hand shell sidebar with optional variant and sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'cp' \| 'vp' \| 'ppm' \| 'maconomy' | 'ppm' | cp: CP theme.; vp: VP theme.; ppm: PPM theme.; maconomy: Maconomy theme. |
| sections | RightSidebarSection[] | — | Sidebar or nav sections to render. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { RightSidebar } from './components/harmony/RightSidebar';

<RightSidebar variant="cp" />
```

## Variants

- **cp**: CP theme.
- **vp**: VP theme.
- **ppm**: PPM theme.
- **maconomy**: Maconomy theme.

## CSS Classes

- `.right-sidebar`
- `.right-sidebar--cp`
- `.right-sidebar--vp`
- `.right-sidebar--ppm`
- `.right-sidebar--maconomy`

## Dependencies

- Icon

## Theme Behavior

- **variant="cp"**: Three sections. Section 1: Dela AI (custom logo), Notifications, Files. Section 2: Print, Layout Options. Section 3: Microphone, Offline, Keyboard Shortcuts, Help.
- **variant="ppm"**, **variant="vp"**, **variant="maconomy"**: Three sections. Section 1: Dela AI (custom logo), Edit, Search, Actions, Related, Templates, Upload, Download. Section 2: Notifications, Help, Share. Section 3: Accessibility, Language, Dark Mode.
- The React component defaults to `sections = PPM_SECTIONS`; pass `sections` to override for other themes.

## Dark Mode

In dark mode (`html.dark`), img-based icons (e.g. custom Dela logo) use `filter: brightness(0) invert(1)` so they remain visible; the active Dela logo (`.right-sidebar__dela-logo--active`) is excluded. Icon and label colors use `--text-primary`; the active item uses `--shell-sidebar-icon-color-on-primary` (e.g. white).
