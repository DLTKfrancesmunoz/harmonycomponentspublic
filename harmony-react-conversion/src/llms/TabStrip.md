# TabStrip

Tabs with optional add-tab, overflow (“More”) with ResizeObserver when `overflowMode="auto"`, and optional per-tab actions (open in new window, close, ⋮ menu).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | TabStripTab[] | [] | Tab definitions: `id`, `label`, optional `icon`, `iconPosition`, `active`, `disabled`, `href`, and optional per-tab `showOpenInNewWindow`, `showClose`, `showMenu` (override defaults below). |
| showAddTab | boolean | false | When true, an “add tab” control is shown. |
| addTabLabel | string | 'Add Tab' | Accessible label for the add-tab button. |
| overflowMode | 'auto' \| 'manual' \| 'none' | 'auto' | **auto**: ResizeObserver moves tabs into More; **manual**: More lists `overflowTabs`; **none**: no More. |
| overflowTabs | TabStripTab[] | [] | Used when `overflowMode="manual"`. |
| variant | 'default' \| 'compact' | 'default' | default / compact tab sizing. |
| iconPosition | 'left' \| 'right' \| 'top' | — | Enforces icon position for all tabs. |
| showTabOpenInNew | boolean | false | Default: show per-tab open-in-new control. |
| showTabClose | boolean | false | Default: show per-tab close control. |
| showTabOverflowMenu | boolean | false | Default: show per-tab ⋮ menu (items omit actions already shown inline). |
| className | string | '' | Root class names. |
| onTabSelected | (tabId: string) => void | — | Tab activation (main tab control). |
| onAddTab | () => void | — | Add tab clicked. |
| onCloseTab | (tabId: string) => void | — | Close from toolbar, ⋮ menu, or More row. |
| onOpenNewWindow | (tabId: string) => void | — | Open in new window from toolbar, ⋮ menu, or More row. |
| onSetDefault | (tabId: string) => void | — | “Set as default” from ⋮ menu. |

## Usage

```tsx
import { TabStrip } from './components/harmony/TabStrip';

<TabStrip
  tabs={[{ id: 't1', label: 'Tab 1', active: true }, { id: 't2', label: 'Tab 2' }]}
  showTabOpenInNew
  showTabClose
  showTabOverflowMenu
  onCloseTab={(id) => {}}
  onOpenNewWindow={(id) => {}}
  onSetDefault={(id) => {}}
/>
```

## Variants

- **default**: Default tab strip (underline selected tab).
- **compact**: Compact tabs.
- **pill**: Adds `.tabstrip--pill`; filled pill selected state is styled only under `html.theme-vp` / `html.theme-vp.dark`.

## CSS Classes

- `.tabstrip`, `.tabstrip--compact`
- `.tabstrip__tab-cell`, `.tabstrip__tab-toolbar`, `.tabstrip__tab-action-btn`, `.tabstrip__tab-menu-wrapper`
- `.tabstrip__dropdown`, `.tabstrip__dropdown--per-tab`, `.tabstrip__dropdown-menu-item`
- `.tab--icon-top`, `.tab--icon-right`, `.tab--icon-left`, `.tab--disabled`

## Dependencies

- Icon
