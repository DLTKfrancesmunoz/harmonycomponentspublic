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

## Selected state

Set `active: true` on an item to mark it selected. The selected row uses the theme primary color as the background (`--theme-primary`) with white text and icons (`.list-menu__item.is-active`). Hover on the selected row uses `--theme-primary-hover` for the background.

## Usage

```tsx
import { ListMenu } from './components/harmony/ListMenu';

<ListMenu variant="default" items={...} />
```

### Text-only items

Icons are optional on each `MenuItem`—omit `icon` for label-only rows.

```tsx
<ListMenu
  variant="default"
  items={[
    { label: 'Overview', active: true },
    { label: 'Details' },
    { label: 'History' },
  ]}
/>
```

## Variants

- **default**: With borders between items.
- **no-borders**: No dividers between items.

## CSS Classes

- `.list-menu`
- `.list-menu--no-borders`
- `.list-menu__item.is-active` — selected row (primary background, white foreground)

## Dependencies

- Icon (optional per item)
