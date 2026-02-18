# Harmony components and layouts (quick reference)

Read from `src/components/ui/index.ts` and `src/layouts/` for authoritative list. Below is a snapshot for quick lookup.

## Layouts

- **ShellLayout** — App-shell template; composes header, footer, left/right sidebars, floating nav, page header, ShellPanel, main content. File: `src/layouts/ShellLayout.astro`.

## Shell subcomponents (used inside ShellLayout)

- ShellHeader, ShellFooter, LeftSidebar, RightSidebar, FloatingNav, ShellPageHeader, ShellPanel.

## UI components (from index.ts)

- Accordion, Alert, Avatar, Badge, NotificationBadge, Button, ButtonGroup, Card, Checkbox, CheckboxGroup, Chip, DateInput, DatePicker, DateTimePicker, Dialog, Dropdown, FloatingNav, Icon, Input, Kanban, KanbanCard, Label, LeftSidebar, Link, ListMenu, MonthPicker, NumberInput, PickerPopup, ProgressBar, RadioButton, RadioGroup, RangeInput, RightSidebar, ShellFooter, ShellHeader, ShellPageHeader, ShellPanel, Spinner, Step, Stepper, Table, TabStrip, Textarea, TimePicker, Toggle, Tooltip, WeekPicker.

Doc pages: `src/pages/components/<name>.astro` (kebab-case, e.g. buttons.astro, alerts.astro). Shell docs: `src/pages/shell/*.astro`. Previews: `src/pages/preview/*.astro`.
