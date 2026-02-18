# DateTimePicker

Combined date and time picker.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Controlled value. |
| min | string | — | Minimum value (number or date string). |
| max | string | — | Maximum value (number or date string). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| timeFormat | '12' \| '24' | '24' | See type. |
| locale | string | 'en-US' | Locale for date/time formatting. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| className | string | '' | Additional CSS classes applied to the root element. |
| onDateTimeSelect | (datetime: string) => void | — | Callback when dateTimeSelect occurs. |

## Usage

```tsx
import { DateTimePicker } from './components/harmony/DateTimePicker';

<DateTimePicker value="2024-01-15" onDateSelect={(date) => setValue(date)} />
```

## CSS Classes

- `.datetime-picker`

## Dependencies

- DatePicker
- TimePicker
