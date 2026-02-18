# TabStrip

Tabs with optional add-tab and compact style.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | TabStripTab[] | [] | Tab definitions (id, label, active, etc.). |
| showAddTab | boolean | false | When true, an “add tab” control is shown. |
| addTabLabel | string | 'Add Tab' | Accessible label for the add-tab button. |
| overflowMode | 'auto' \| 'manual' \| 'none' | 'auto' | See type. |
| overflowTabs | TabStripTab[] | [] | Array of items. |
| variant | 'default' \| 'compact' | 'default' | default: Default tab strip.; compact: Compact tabs. |
| iconPosition | 'left' \| 'right' \| 'top' | — | See type. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { TabStrip } from './components/harmony/TabStrip';

<TabStrip tabs={[{ id: "t1", label: "Tab 1", active: true }, { id: "t2", label: "Tab 2" }]} />
```

## Variants

- **default**: Default tab strip.
- **compact**: Compact tabs.

## CSS Classes

- `.tabstrip`
- `.tabstrip--compact`
- `.tab--icon-top`
- `.tab--icon-right`
- `.tab--icon-left`
- `.tab--disabled`

## Dependencies

- Icon
