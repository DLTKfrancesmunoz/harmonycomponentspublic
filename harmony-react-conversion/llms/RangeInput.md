# RangeInput

Slider input for a numeric range (min/max/value).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 50 | Controlled value. |
| min | number | 0 | Minimum value (number or date string). |
| max | number | 100 | Maximum value (number or date string). |
| step | number | 1 | Numeric value. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| showPercent | boolean | false | When true, enables the option. |
| prefix | string | '' | String value. |
| suffix | string | '' | String value. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onChange | (value: number) => void | — | Callback when change occurs. |

## Usage

```tsx
import { RangeInput } from './components/harmony/RangeInput';

<RangeInput label="Example" />
```

## CSS Classes

- `.range-input-form-wrapper`
- `.range-input-form-wrapper--inline`
- `.range-input-form-wrapper--stacked`

## Dependencies

- Label
