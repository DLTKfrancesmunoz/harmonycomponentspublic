# Tooltip

Hover or focus tooltip with text, position, and corner variant.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string |  | Display text (e.g. button label, tooltip). |
| position | 'top' \| 'bottom' \| 'left' \| 'right' | 'top' | Position of the element (e.g. tooltip placement). |
| cornerVariant | 'top' \| 'bottom' \| 'left' \| 'right' | — | See type. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { Tooltip } from './components/harmony/Tooltip';

<Tooltip text="Example" />
```

## CSS Classes

- `.tooltip__content`
- `.tooltip__content--bottom`
- `.tooltip__content--left`
- `.tooltip__content--right`
- `.tooltip__content--corner-top`
- `.tooltip__content--corner-bottom`
- `.tooltip__content--corner-left`
- `.tooltip__content--corner-right`

## Dependencies

None (standalone component).
