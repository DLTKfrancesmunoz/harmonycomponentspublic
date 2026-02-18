# MonthPicker

Month-only picker with value and min/max.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Controlled value. |
| min | string | — | Minimum value (number or date string). |
| max | string | — | Maximum value (number or date string). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| locale | string | — | Locale for date/time formatting. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| className | string | '' | Additional CSS classes applied to the root element. |
| onMonthSelect | (value: string) => void | — | Callback when monthSelect occurs. |

## Usage

```tsx
import { MonthPicker } from './components/harmony/MonthPicker';

<MonthPicker value="2024-01-15" onDateSelect={(date) => setValue(date)} />
```

## CSS Classes

- `.month-picker`
- `.month-picker__month--selected`
- `.month-picker__month--disabled`

## Dependencies

- Icon
