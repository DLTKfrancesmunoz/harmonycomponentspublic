# Toggle

On/off switch with size and optional label.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| checked | boolean | — | Checked state for checkbox, radio, or toggle. |
| defaultChecked | boolean | — | When true, enables the option. |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| label | string | — | Label text for the control. |
| size | 'sm' \| 'md' | 'md' | sm: Small.; md: Medium. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onChange | (e: React.ChangeEvent<HTMLInputElement>) => void | — | Callback when change occurs. |

## Usage

```tsx
import { Toggle } from './components/harmony/Toggle';

<Toggle label="Example" />
```

## Variants

- **sm**: Small.
- **md**: Medium.

## CSS Classes

- `.toggle`
- `.toggle--sm`
- `.toggle--disabled`

## Dependencies

None (standalone component).
