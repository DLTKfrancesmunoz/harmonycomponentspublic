# CheckboxGroup

Group of checkboxes with a legend and optional error/warning message.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| legend | string | — | Legend text for a fieldset (e.g. radio group). |
| error | boolean | false | When true, shows error styling and optional error message. |
| warning | boolean | false | When true, shows warning state or message. |
| errorMessage | string | — | Error message shown when error is true. |
| warningMessage | string | — | String value. |
| orientation | 'vertical' \| 'horizontal' | 'vertical' | Layout direction (e.g. horizontal, vertical). |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode |  | Content rendered inside the component. |

## Usage

```tsx
import { CheckboxGroup } from './components/harmony/CheckboxGroup';

<CheckboxGroup />
```

## CSS Classes

- `.checkbox-group-wrapper`
- `.checkbox-group-wrapper--error`
- `.checkbox-group-wrapper--warning`
- `.checkbox-group-wrapper--horizontal`
- `.checkbox-group-wrapper__legend--error`
- `.checkbox-group-wrapper__legend--warning`

## Dependencies

- Icon
