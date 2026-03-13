# RadioButton

Single radio option within a group.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string |  | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| checked | boolean | — | Checked state for checkbox, radio, or toggle. |
| defaultChecked | boolean | false | When true, enables the option. |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| label | string | — | Label text for the control. |
| value | string |  | Controlled value. |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Size of the radio button. |
| warning | boolean | false | When true, shows warning state or message. |
| error | boolean | false | When true, shows error styling and optional error message. |
| warningMessage | string | — | String value. |
| errorMessage | string | — | Error message shown when error is true. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { RadioButton } from './components/harmony/RadioButton';

<RadioButton name="choice" value="a" label="Option A" />
<RadioButton name="choice" value="b" label="Option B" size="large" />
```

## CSS Classes

- `.radio`
- `.radio--sm` (small size)
- `.radio--lg` (large size)
- `.radio--disabled`
- `.radio--warning`
- `.radio--error`
- `.radio__circle--selected`
- `.radio__circle--unselected`

## Dependencies

- Icon
- RadioGroup
