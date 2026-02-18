# ButtonGroup

Group of buttons with shared variant, size, and orientation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'outline' | 'default' | default: Default button group style.; outline: Outlined style. |
| size | 'sm' \| 'md' \| 'lg' | 'md' | sm: Small.; md: Medium.; lg: Large. |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout direction (e.g. horizontal, vertical). |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode |  | Content rendered inside the component. |

## Usage

```tsx
import { ButtonGroup } from './components/harmony/ButtonGroup';

<ButtonGroup variant="default" size="sm">Save</ButtonGroup>
```

## Variants

- **default**: Default button group style.
- **outline**: Outlined style.
- **sm**: Small.
- **md**: Medium.
- **lg**: Large.

## CSS Classes

- `.btn-group`
- `.btn-group--default`
- `.btn-group--outline`
- `.btn-group--sm`
- `.btn-group--md`
- `.btn-group--lg`
- `.btn-group--horizontal`
- `.btn-group--vertical`

## Dependencies

None (standalone component).
