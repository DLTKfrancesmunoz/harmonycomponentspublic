# DatePicker

Calendar-style date picker with min/max and value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Controlled value. |
| min | string | — | Minimum value (number or date string). |
| max | string | — | Maximum value (number or date string). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| locale | string | 'en-US' | Locale for date/time formatting. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| className | string | '' | Additional CSS classes applied to the root element. |
| onDateSelect | (date: string) => void | — | Callback when a date is selected. |

## Usage

```tsx
import { DatePicker } from './components/harmony/DatePicker';

<DatePicker value="2024-01-15" onDateSelect={(date) => setValue(date)} />
```

## CSS Classes

- `.date-picker`
- `.date-picker__day--other-month`
- `.date-picker__day--today`
- `.date-picker__day--selected`
- `.date-picker__day--disabled`

## Dependencies

- Icon
