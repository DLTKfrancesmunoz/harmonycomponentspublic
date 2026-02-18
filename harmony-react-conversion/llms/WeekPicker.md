# WeekPicker

Week picker with value and min/max.

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
| onWeekSelect | (value: string) => void | — | Callback when weekSelect occurs. |

## Usage

```tsx
import { WeekPicker } from './components/harmony/WeekPicker';

<WeekPicker value="2024-01-15" onDateSelect={(date) => setValue(date)} />
```

## CSS Classes

- `.week-picker`
- `.week-picker__week--selected`
- `.week-picker__week--disabled`

## Dependencies

- Icon
