# ShellFooter

Bottom shell area with tabs (via TabStrip), optional “More” overflow, and optional per-tab toolbar actions. Used with VP / PPM / Maconomy-style shells (not CP, which uses Floating Nav).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | ShellFooterTab[] | [] | Tab definitions; optional per-tab `showOpenInNewWindow`, `showClose`, `showMenu`. |
| showMore | boolean | false | With `overflowTabs`, enables manual More menu. |
| moreCount | number | — | Legacy; overflow count comes from `overflowTabs` length in manual mode. |
| overflowTabs | ShellFooterTab[] | [] | Tabs listed in the More dropdown when `showMore` is true. |
| showAddTab | boolean | true | Add tab control. |
| variant | 'default' \| 'compact' | 'default' | Footer height variant. |
| showTabOpenInNew | boolean | false | Passed to TabStrip as default for per-tab open-in-new. |
| showTabClose | boolean | false | Passed to TabStrip as default for per-tab close. |
| showTabOverflowMenu | boolean | false | Passed to TabStrip as default for per-tab ⋮ menu. |
| className | string | '' | Root class names. |
| onTabSelected | (tabId: string) => void | — | Forwarded to TabStrip. |
| onAddTab | () => void | — | Forwarded to TabStrip. |
| onCloseTab | (tabId: string) => void | — | Forwarded to TabStrip. |
| onOpenNewWindow | (tabId: string) => void | — | Forwarded to TabStrip. |
| onSetDefault | (tabId: string) => void | — | Forwarded to TabStrip. |

## Usage

```tsx
import { ShellFooter } from './components/harmony/ShellFooter';

<ShellFooter
  variant="default"
  showTabOpenInNew
  showTabClose
  showTabOverflowMenu
  onCloseTab={(id) => {}}
/>
```

## Variants

- **default**: Default footer style.
- **compact**: Compact footer (`--shell-footer-height-compact`).

## CSS Classes

- `.shell-footer`
- `.shell-footer--compact`

## Dependencies

- TabStrip

## Theme Behavior

- **variant="default"**: Full-height footer with tabs. **variant="compact"**: Reduced height (`--shell-footer-height-compact`).
- Tab labels and active state use theme tokens (`--shell-footer-tab-label-color`, `--shell-footer-tab-icon-color-active`). Active tab shows pin icon and primary underline.
- Per-tab toolbar icons use footer-scoped colors in `ShellFooter.css` (`:has(.tab.is-active)` for active tab).

## Dark Mode

In dark mode (`html.dark`), tab labels use `--shell-footer-tab-label-color`. Active tab pin icon and bottom border use `--shell-footer-tab-icon-color-active` and `--theme-primary`.
