# Checkbox

Single checkbox control bound to a boolean value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| checked | boolean | — | Checked state for checkbox, radio, or toggle. |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| label | string | — | Label text for the control. |
| value | string | — | Controlled value. |
| warning | boolean | false | When true, shows warning state or message. |
| error | boolean | false | When true, shows error styling and optional error message. |
| warningMessage | string | — | String value. |
| errorMessage | string | — | Error message shown when error is true. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { Checkbox } from './components/harmony/Checkbox';

<Checkbox label="Example" />
```

## CSS Classes

- `.checkbox`
- `.checkbox--disabled`
- `.checkbox--warning`
- `.checkbox--error`

## Dependencies

- Icon
