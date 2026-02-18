# Textarea

Multi-line text input with placeholder and value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | string | — | Placeholder text when empty. |
| value | string | — | Controlled value. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| rows | number | 4 | Numeric value. |
| required | boolean | false | When true, the field is required for form validation. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { Textarea } from './components/harmony/Textarea';

<Textarea label="Example" />
```

## CSS Classes

- `.textarea-form-wrapper`
- `.textarea-form-wrapper--inline`
- `.textarea-form-wrapper--stacked`

## Dependencies

- Label
