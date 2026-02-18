# DateInput

Native date/time input with type (date, time, datetime-local, month, week).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'date' \| 'time' \| 'datetime-local' \| 'month' \| 'week' | 'date' | Input or control type (e.g. text, email, date). |
| value | string | — | Controlled value. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| min | string | — | Minimum value (number or date string). |
| max | string | — | Maximum value (number or date string). |
| required | boolean | false | When true, the field is required for form validation. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| timeFormat | '12' \| '24' | '24' | See type. |
| locale | string | 'en-US' | Locale for date/time formatting. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onChange | (value: string) => void | — | Callback when change occurs. |

## Usage

```tsx
import { DateInput } from './components/harmony/DateInput';

<DateInput label="Example" />
```

## CSS Classes

- `.date-input-form-wrapper`
- `.date-input-form-wrapper--inline`
- `.date-input-form-wrapper--stacked`

## Dependencies

- Icon
- Label
- PickerPopup
- DatePicker
- TimePicker
- DateTimePicker
- MonthPicker
- WeekPicker
