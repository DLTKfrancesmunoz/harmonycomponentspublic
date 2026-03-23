# TimePicker

Time-only picker with value and min/max.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Controlled value. |
| min | string | — | Minimum value (number or date string). |
| max | string | — | Maximum value (number or date string). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| format | '12' \| '24' | '24' | See type. |
| step | number | 1 | Numeric value. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| className | string | '' | Additional CSS classes applied to the root element. |
| onTimeSelect | (time: string) => void | — | Callback when timeSelect occurs. |

## Usage

```tsx
import { TimePicker } from './components/harmony/TimePicker';

<TimePicker value="2024-01-15" onDateSelect={(date) => setValue(date)} />
```

## CSS Classes

- `.time-picker`
- `.time-picker__period-btn--active`

## Dependencies

- Icon
