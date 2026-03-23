# ListMenu

List of menu items with optional borders and click handler.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | MenuItem[] |  | Array of items to render (e.g. accordion sections, menu items). |
| as | 'button' \| 'link' | 'button' | Element or component to render as (e.g. div, nav). |
| variant | 'default' \| 'no-borders' | 'default' | default: With borders between items.; no-borders: No dividers between items. |
| className | string | '' | Additional CSS classes applied to the root element. |
| onItemClick | (item: MenuItem, index: number) => void | — | Callback when a menu item is clicked. |

## Usage

```tsx
import { ListMenu } from './components/harmony/ListMenu';

<ListMenu variant="default" items={...} />
```

## Variants

- **default**: With borders between items.
- **no-borders**: No dividers between items.

## CSS Classes

- `.list-menu`
- `.list-menu--no-borders`

## Dependencies

- Icon
