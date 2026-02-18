# PickerPopup

Popover wrapper for a picker with trigger and title.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string |  | Unique DOM id for the root or main control (for accessibility). |
| triggerId | string | '' | ID of the element that triggers the popover. |
| className | string | '' | Additional CSS classes applied to the root element. |
| title | string | — | Title or heading text. |
| open | boolean | false | When true, the overlay or panel is visible. |
| onClose | () => void | — | Callback when the overlay/panel is closed or dismissed. |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { PickerPopup } from './components/harmony/PickerPopup';

<PickerPopup title="Example" />
```

## CSS Classes

- `.picker-popup`

## Dependencies

- Icon
