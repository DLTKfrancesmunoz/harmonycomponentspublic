# ShellFooter

Bottom shell area with tabs and optional “more” control.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | ShellFooterTab[] | [] | Tab definitions (id, label, active, etc.). |
| showMore | boolean | false | When true, enables the option. |
| moreCount | number | — | Numeric value. |
| overflowTabs | ShellFooterTab[] | [] | Array of items. |
| showAddTab | boolean | true | When true, an “add tab” control is shown. |
| variant | 'default' \| 'compact' | 'default' | default: Default footer style.; compact: Compact footer. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { ShellFooter } from './components/harmony/ShellFooter';

<ShellFooter variant="default" />
```

## Variants

- **default**: Default footer style.
- **compact**: Compact footer.

## CSS Classes

- `.shell-footer`
- `.shell-footer--compact`

## Dependencies

- TabStrip

## Theme Behavior

- **variant="default"**: Full-height footer with tabs. **variant="compact"**: Reduced height (`--shell-footer-height-compact`).
- Tab labels and active state use theme tokens (`--shell-footer-tab-label-color`, `--shell-footer-tab-icon-color-active`). Active tab shows pin icon and primary underline.

## Dark Mode

In dark mode (`html.dark`), tab labels use `--shell-footer-tab-label-color` (e.g. inverse/white). Only the active tab pin icon and bottom border use `--shell-footer-tab-icon-color-active` and `--theme-primary`. Inactive tabs use the same label color variable for consistency.
