# Extension Points Audit

Design-system components are audited for **optional extension points** (slots or props) so products can customize from the outside without editing shared source. Criteria:

- **Has / OK** – Optional slots and/or optional config props with a default when omitted; or props-only leaf component where that is sufficient.
- **Partial** – Some extension points but clear gaps (e.g. missing slot for a key area, or missing prop for config-driven override).
- **Missing** – No way to override the relevant behavior from outside.

## Audit Table

| Component | Status | Notes |
|-----------|--------|--------|
| Accordion | Partial | `items` prop (title, content strings). No slot for custom item body or custom trigger/icon. |
| Alert | Has | Default slot for message; props for title, icon, primary/secondary buttons, link. |
| Avatar | OK | Props-only leaf; sufficient for customization. |
| Badge | Has | Default `<slot />`. |
| Button | Has | Default slot; `Astro.slots.has('default')` for content vs icon-only. |
| ButtonGroup | Has | Default `<slot />`. |
| Card | Has | Slots: header (fallback to headerTitle/headerSubtitle), header-actions, default body, footer. |
| Checkbox | OK | Props-only. |
| CheckboxGroup | Has | Default `<slot />` for children. |
| Chip | Has | Default `<slot />`. |
| DateInput, DatePicker, DateTimePicker, MonthPicker, WeekPicker, TimePicker | OK | Form primitives; props-driven. |
| Dialog | Has | Default slot + `footer` slot. |
| Dropdown | Partial | `options` prop; no slot for custom option rendering or custom trigger. |
| FloatingNav | Missing → Has | After fix: optional `actions` slot. |
| Icon | OK | Props-only leaf. |
| Input, NumberInput, RangeInput, Textarea | OK | Form primitives; props-driven. |
| Kanban | Partial | After fix: optional `title-bar-actions` and `action-bar` slots. |
| KanbanCard | Has | Default `<slot />`. |
| Label | Has | Default `<slot />`. |
| LeftSidebar | Partial → Has | After fix: NavItem supports `icon?`, `isCustom?`, `customSrc?` like RightSidebar. |
| Link | Has | Default `<slot />`. |
| ListMenu | Partial | After fix: MenuItem supports `isCustom?`, `customSrc?`. |
| NotificationBadge | OK | Props-only. |
| PickerPopup | Has | Default `<slot />`. |
| ProgressBar | OK | Props-only. |
| RadioButton | OK | Props-only. |
| RadioGroup | Has | Default `<slot />` for children. |
| RightSidebar | Has | `sections` prop; NavItem has `isCustom`/`customSrc` for custom icons. |
| ShellFooter | Has | Fully props-driven: `tabs`, `showMore`, `overflowTabs`, `showAddTab`, `variant`. |
| ShellHeader | Partial → Has | After fix: optional `actions` slot and `companies` prop. |
| ShellLayout | Missing → Has | After fix: `leftSidebarSections`/`rightSidebarSections` passed to sidebars. |
| ShellPageHeader | Partial → Has | After fix: optional `actions` slot. |
| ShellPanel | Partial → Has | After fix: optional `header` slot. |
| Spinner | OK | Props-only. |
| Step | Has | Default slot + `description` slot. |
| Stepper | Has | Default `<slot />` for Step children. |
| Table | Has | Slots: title-bar-content, title-bar-icons, action-bar, header, body. |
| TabStrip | Has | `tabs` prop; fully config-driven. |
| Tooltip | Has | Default `<slot />`. |
| Toggle | OK | Props-only. |

## Summary

- **Has / OK:** Alert, Avatar, Badge, Button, ButtonGroup, Card, Checkbox, CheckboxGroup, Chip, Dialog, form primitives, Icon, KanbanCard, Label, Link, PickerPopup, ProgressBar, RadioGroup, RightSidebar, ShellFooter, Spinner, Step, Stepper, Table, TabStrip, Tooltip, Toggle.
- **Partial (before fixes):** Accordion, Dropdown, Kanban, LeftSidebar, ListMenu, ShellHeader, ShellPageHeader, ShellPanel.
- **Missing (before fixes):** FloatingNav, ShellLayout.

All Missing and Partial items are addressed by the implementation in the extension-points plan.
