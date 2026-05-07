# Badge

Small label or status indicator with variant and size options.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'orange' \| 'pink' \| 'disabled'` | `'default'` | Alert Chip color variant. |
| size | `'small' \| 'medium' \| 'large'` | `'large'` | Height uses `--badge-height-sm` (16px, `--space-4`), `--badge-height-md` (20px, `--space-5`), `--badge-height-lg` (24px, `--space-6`). Shared with notification badges. |
| icon | `string` | — | Optional leading icon name from the design system. |
| className | `string` | `''` | Additional CSS classes on the root element. |
| children | `ReactNode` | — | Label content. |

## Usage

```tsx
import { Badge } from './components/harmony/Badge';

<Badge variant="default" size="medium">Label</Badge>
```

## Design tokens

Heights are driven by `:root` tokens in `tokens.css`:

- `--badge-height-sm` → `var(--space-4)` (16px)
- `--badge-height-md` → `var(--space-5)` (20px)
- `--badge-height-lg` → `var(--space-6)` (24px)

## CSS classes

- `.badge`, `.badge--small|medium|large`, `.badge--default`, `.badge--primary`, …

## Dependencies

- Icon (when `icon` is set)
