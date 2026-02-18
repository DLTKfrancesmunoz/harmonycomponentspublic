# ShellPanel

Slide-out panel from left or right with title and optional variant.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| side | 'left' \| 'right' |  | Which side the panel opens from (left or right). |
| open | boolean |  | When true, the overlay or panel is visible. |
| title | string |  | Title or heading text. |
| titleIcon | string | — | String value. |
| headerVariant | 'theme' \| 'default' | 'theme' | Header style: default or primary. |
| width | 'narrow' \| 'full' | — | See type. |
| showClose | boolean | true | When true, enables the option. |
| showPopout | boolean | true | When true, enables the option. |
| variant | 'default' \| 'dela' | 'default' | default: Standard panel.; dela: Dela/AI-themed panel. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| className | string | '' | Additional CSS classes applied to the root element. |
| onClose | () => void | — | Callback when the overlay/panel is closed or dismissed. |
| onWidthToggle | (width: 'narrow' \| 'full') => void | — | Callback when widthToggle occurs. |
| header | ReactNode | — | Custom header content (overrides headerTitle/headerSubtitle when set). |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { ShellPanel } from './components/harmony/ShellPanel';

<ShellPanel variant="default">Save</ShellPanel>
```

## Variants

- **default**: Standard panel.
- **dela**: Dela/AI-themed panel.

## CSS Classes

- `.shell-panel`
- `.shell-panel--open`
- `.shell-panel--left`
- `.shell-panel--right`
- `.shell-panel--narrow`
- `.shell-panel--full`

## Dependencies

- Icon
