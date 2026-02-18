# Badge

Small label or count indicator with variant and size options.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' | 'default' | default: Neutral gray. |
| icon | string | — | Icon name from the design system. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode |  | Content rendered inside the component. |

## Usage

```tsx
import { Badge } from './components/harmony/Badge';

<Badge variant="default" >3</Badge>
```

## Variants

- **default**: Neutral gray.

## CSS Classes

- `.badge`
- `.badge--default`

## Dependencies

- Icon
