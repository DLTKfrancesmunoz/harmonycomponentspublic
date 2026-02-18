# Dialog

Modal overlay with title, body content, and optional footer actions.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string |  | Unique DOM id for the root or main control (for accessibility). |
| title | string |  | Title or heading text. |
| open | boolean | false | When true, the overlay or panel is visible. |
| onClose | () => void | — | Callback when the overlay/panel is closed or dismissed. |
| className | string | '' | Additional CSS classes applied to the root element. |
| buttonAlignment | 'left' \| 'right' | 'left' | Alignment of footer buttons (left or right). |
| headerVariant | 'default' \| 'primary' | 'default' | Header style: default or primary. |
| children | ReactNode | — | Content rendered inside the component. |
| footer | ReactNode | — | Footer content or actions. |

## Usage

```tsx
import { Dialog } from './components/harmony/Dialog';

<Dialog id="my-dialog" title="Dialog title" open={isOpen} onClose={() => setIsOpen(false)}>
  Dialog body content.
</Dialog>
```

## CSS Classes

- `.dialog-overlay`

## Dependencies

- Icon
- Button
