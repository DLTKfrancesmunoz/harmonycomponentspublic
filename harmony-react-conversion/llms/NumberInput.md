# NumberInput

Numeric input with optional min, max, and step.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 0 | Controlled value. |
| min | number | — | Minimum value (number or date string). |
| max | number | — | Maximum value (number or date string). |
| step | number | 1 | Numeric value. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onChange | (value: number) => void | — | Callback when change occurs. |

## Usage

```tsx
import { NumberInput } from './components/harmony/NumberInput';

<NumberInput label="Example" />
```

## CSS Classes

- `.number-input-form-wrapper`
- `.number-input-form-wrapper--inline`
- `.number-input-form-wrapper--stacked`

## Dependencies

- Icon
- Label
