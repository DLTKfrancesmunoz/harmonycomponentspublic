# Toggle

On/off switch with size and optional label, or a segmented control with two labeled options inside the track.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the input (for accessibility). |
| checked | boolean | — | Controlled checked state. |
| defaultChecked | boolean | — | Initial checked state when uncontrolled. |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| label | string | — | Label text beside the track (default variant only; ignored when `variant` is `segmented`). |
| variant | 'default' \| 'segmented' | 'default' | Segmented shows two in-track labels and a sliding pill thumb. |
| optionLabelLeft | string | 'Item 1' | Left option label (segmented only). |
| optionLabelRight | string | 'Item 2' | Right option label (segmented only). |
| size | 'sm' \| 'md' | 'md' | sm: Small.; md: Medium. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onChange | (e: React.ChangeEvent<HTMLInputElement>) => void | — | Callback when change occurs. |

## Usage

```tsx
import { Toggle } from './components/harmony/Toggle';

<Toggle label="Example" />

<Toggle variant="segmented" defaultChecked />
```

## Segmented state

`checked === false` selects the left option; `checked === true` selects the right option. The underlying control remains a single checkbox.

## Variants

- **default**: Circular thumb on a pill track; optional external label.
- **segmented**: Two labels inside the track; sliding white thumb with bold text on the active side.
- **sm** / **md**: Size for both variants.

## CSS Classes

- `.toggle`
- `.toggle--segmented`
- `.toggle--sm`
- `.toggle--disabled`
- `.toggle__track--segmented`, `.toggle__thumb--segmented`, `.toggle__segment`, `.toggle__segment--left`, `.toggle__segment--right`

## Dependencies

None (standalone component).
