# NotificationBadge

Badge showing a count or status (e.g. errors) with variant and size.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'dot' \| 'number' \| 'overflow' | 'number' | Input or control type (e.g. text, email, date). |
| size | 'sm' \| 'md' \| 'lg' | 'md' | sm: Small.; md: Medium.; lg: Large. |
| variant | 'error' \| 'primary' | 'primary' | error: Error/critical count.; primary: Theme primary count. |
| value | string \| number | 1 | Controlled value. |
| border | boolean | false | When true, the badge has a border. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { NotificationBadge } from './components/harmony/NotificationBadge';

<NotificationBadge variant="error" size="sm" />
```

## Variants

- **error**: Error/critical count.
- **primary**: Theme primary count.
- **sm**: Small.
- **md**: Medium.
- **lg**: Large.

## CSS Classes

- `.notification-badge`
- `.notification-badge--border`
- `.notification-badge--dot`
- `.notification-badge--number`
- `.notification-badge--overflow`
- `.notification-badge--sm`
- `.notification-badge--md`
- `.notification-badge--lg`
- `.notification-badge--error`
- `.notification-badge--primary`

## Dependencies

None (standalone component).
