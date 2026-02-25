# FloatingNav

Floating navigation with optional execute/save and custom actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showExecute | boolean | true | When true, the execute action is shown in floating nav. |
| saveDisabled | boolean | false | When true, the save action is disabled. |
| variant | 'full' \| 'compact' | 'full' | full: Full layout with labels.; compact: Compact icon-only layout. |
| actions | ReactNode | — | Custom action configs for the floating nav. |

## Usage

```tsx
import { FloatingNav } from './components/harmony/FloatingNav';

<FloatingNav variant="full" />
```

## Variants

- **full**: Full layout with labels.
- **compact**: Compact icon-only layout.

## CSS Classes

- `.floating-nav__btn`
- `.floating-nav__btn--dropdown`
- `.floating-nav__btn--disabled`
- `.floating-nav__btn--primary`

## Dependencies

- Icon

## Dark Mode

In dark mode (`html.theme-cp.dark`), the floating nav background, border, secondary button color/border, primary/disabled button colors, divider, and pin icon use dedicated dark tokens (e.g. `--floating-nav-bg-dark`, `--floating-nav-btn-secondary-dark`).

## Positioning (CP Theme)

In the CP theme, the `.shell-layout__floating-nav-wrap` wrapper is anchored to `top: 0` (the very top of the screen) with `z-index` matching the header. The floating nav appears centered horizontally above the header. A `border-top` is applied via `html.theme-cp .floating-nav` to give the component a full visible border at the screen edge. This is a CP-only behavior; other themes position the floating nav below the header at `top: var(--shell-header-height)`.
