# Icon

Icon from design system with name, variant, and size.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string |  | Form field name for submission. |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | xs: Extra small.; sm: Small.; md: Medium.; lg: Large.; xl: Extra large. |
| className | string | '' | Additional CSS classes applied to the root element. |
| variant | 'outline' \| 'solid' | 'outline' | outline: Outline stroke style.; solid: Filled style. |

## Usage

```tsx
import { Icon } from './components/harmony/Icon';

<Icon variant="outline" size="xs" name={...} />
```

## Variants

- **outline**: Outline stroke style.
- **solid**: Filled style.
- **xs**: Extra small.
- **sm**: Small.
- **md**: Medium.
- **lg**: Large.
- **xl**: Extra large.

## CSS Classes

- BEM classes from Harmony components.css

## Dependencies

None (standalone component).

## Theme Behavior

- Icons resolve from theme-scoped manifest in Astro (hero | tabler | custom per theme). React uses a single resolution path; icon names are shared across themes but the underlying SVG source can differ by product (CP, VP, PPM, Maconomy).
