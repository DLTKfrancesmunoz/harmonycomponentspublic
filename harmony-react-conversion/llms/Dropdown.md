# Dropdown

Select-style dropdown with options and placeholder.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| options | Option[] |  | Array of options for select/dropdown. |
| value | string | — | Controlled value. |
| placeholder | string | 'Select an option' | Placeholder text when empty. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| className | string | '' | Additional CSS classes applied to the root element. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| trigger | ReactNode | — | Content to render (React node). |
| optionSlots | (ReactNode \| null)[] | — | Content to render (React node). |
| onChange | (value: string) => void | — | Callback when change occurs. |

## Usage

```tsx
import { Dropdown } from './components/harmony/Dropdown';

<Dropdown options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]} placeholder="Select..." />
```

## CSS Classes

- `.dropdown-wrapper`
- `.dropdown__item--disabled`

## Dependencies

- Icon
- Label
