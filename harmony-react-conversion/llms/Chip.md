# Chip

Compact tag or status pill with variant, size, and optional overflow count.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | sm: Small.; md: Medium.; lg: Large. |
| variant | 'fill' \| 'outline' | 'fill' | fill: Filled background.; outline: Outlined border only. |
| state | 'enabled' | 'enabled' | Chip state (e.g. default, success). |
| type | 'chip' \| 'horiz-dots' \| 'vert-dots' \| 'overflow' | 'chip' | Display type: chip, horiz-dots, vert-dots, or overflow. |
| overflowCount | number | — | Max count before showing overflow (e.g. 99+). |
| selected | boolean | false | When true, enables the option. |
| removable | boolean | false | When true, enables the option. |
| onRemove | () => void | — | Callback when remove occurs. |
| icon | string | — | Icon name from the design system. |
| label | string | 'Chip' | Label text for the control. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { Chip } from './components/harmony/Chip';

<Chip variant="fill" label="Design" />
```

## Variants

- **fill**: Filled background.
- **outline**: Outlined border only.
- **sm**: Small.
- **md**: Medium.
- **lg**: Large.

## CSS Classes

- `.chip`
- `.chip--selected`
- `.chip--sm`
- `.chip--md`
- `.chip--lg`
- `.chip--fill`
- `.chip--outline`
- `.chip--enabled`
- `.chip--chip`
- `.chip--horiz-dots`
- `.chip--vert-dots`
- `.chip--overflow`

## Dependencies

- Icon
