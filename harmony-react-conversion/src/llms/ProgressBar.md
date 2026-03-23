# ProgressBar

Progress indicator with variant, size, value, max, and optional label.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number |  | Controlled value. |
| max | number | 100 | Maximum value (number or date string). |
| size | 'sm' \| 'md' \| 'lg' | 'md' | sm: Small.; md: Medium.; lg: Large. |
| variant | 'default' \| 'success' \| 'warning' \| 'error' \| 'info' | 'default' | default: Default/neutral.; success: Success green.; warning: Warning amber.; error: Error red.; info: Info blue. |
| showLabel | boolean | false | When true, a label is rendered. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { ProgressBar } from './components/harmony/ProgressBar';

<ProgressBar variant="default" size="sm" value={...} />
```

## Variants

- **default**: Default/neutral.
- **success**: Success green.
- **warning**: Warning amber.
- **error**: Error red.
- **info**: Info blue.
- **sm**: Small.
- **md**: Medium.
- **lg**: Large.

## CSS Classes

- `.progress`
- `.progress--default`
- `.progress--success`
- `.progress--warning`
- `.progress--error`
- `.progress--info`
- `.progress--sm`
- `.progress--md`
- `.progress--lg`

## Dependencies

None (standalone component).
