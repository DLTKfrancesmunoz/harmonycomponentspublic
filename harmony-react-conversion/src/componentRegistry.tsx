import { useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Accordion } from './components/harmony/Accordion'
import { Alert } from './components/harmony/Alert'
import { Avatar } from './components/harmony/Avatar'
import { Badge } from './components/harmony/Badge'
import { Button } from './components/harmony/Button'
import { ButtonGroup } from './components/harmony/ButtonGroup'
import { Card } from './components/harmony/Card'
import { Checkbox } from './components/harmony/Checkbox'
import { CheckboxGroup } from './components/harmony/CheckboxGroup'
import { Chip } from './components/harmony/Chip'
import { DateInput } from './components/harmony/DateInput'
import { DatePicker } from './components/harmony/DatePicker'
import { DateTimePicker } from './components/harmony/DateTimePicker'
import { Dialog } from './components/harmony/Dialog'
import { Dropdown } from './components/harmony/Dropdown'
import { FloatingNav } from './components/harmony/FloatingNav'
import { Icon } from './components/harmony/Icon'
import { Input } from './components/harmony/Input'
import { Kanban } from './components/harmony/Kanban'
import { KanbanCard } from './components/harmony/KanbanCard'
import { Label } from './components/harmony/Label'
import { LeftSidebar } from './components/harmony/LeftSidebar'
import { Link } from './components/harmony/Link'
import { ListMenu } from './components/harmony/ListMenu'
import { MonthPicker } from './components/harmony/MonthPicker'
import { NotificationBadge } from './components/harmony/NotificationBadge'
import { NumberInput } from './components/harmony/NumberInput'
import { PickerPopup } from './components/harmony/PickerPopup'
import { ProgressBar } from './components/harmony/ProgressBar'
import { RadioButton } from './components/harmony/RadioButton'
import { RadioGroup } from './components/harmony/RadioGroup'
import { RangeInput } from './components/harmony/RangeInput'
import { RightSidebar } from './components/harmony/RightSidebar'
import { ShellFooter } from './components/harmony/ShellFooter'
import { ShellHeader } from './components/harmony/ShellHeader'
import { ShellLayout } from './components/harmony/ShellLayout'
import { ShellPageHeader } from './components/harmony/ShellPageHeader'
import { ShellPanel } from './components/harmony/ShellPanel'
import { Spinner } from './components/harmony/Spinner'
import { Step } from './components/harmony/Step'
import { Stepper } from './components/harmony/Stepper'
import { Table } from './components/harmony/Table'
import { TabStrip } from './components/harmony/TabStrip'
import { Textarea } from './components/harmony/Textarea'
import { TimePicker } from './components/harmony/TimePicker'
import { Toggle } from './components/harmony/Toggle'
import { Tooltip } from './components/harmony/Tooltip'
import { WeekPicker } from './components/harmony/WeekPicker'

export interface ComponentRegistryEntry {
  name: string
  Component: ComponentType<Record<string, unknown>>
  demoProps?: Record<string, ReactNode | unknown>
  fullPage?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>

/** Demo wrapper to show Button variants: theme (primary, secondary, etc.) vs page header */
function ButtonDemo() {
  const row = (label: string, buttons: React.ReactNode) => (
    <div key={label} style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>{buttons}</div>
    </div>
  )
  return (
    <>
      {row('Theme', <>
        <Button buttonType="theme" variant="primary">Primary</Button>
        <Button buttonType="theme" variant="secondary">Secondary</Button>
        <Button buttonType="theme" variant="tertiary">Tertiary</Button>
        <Button buttonType="theme" variant="outline">Outline</Button>
      </>)}
      {row('Page header', <>
        <Button buttonType="pageHeader" variant="primary">Primary</Button>
        <Button buttonType="pageHeader" variant="secondary">Secondary</Button>
      </>)}
    </>
  )
}

/** Demo wrapper to show Checkbox checked and unchecked states (both toggleable) */
function CheckboxDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
    </div>
  )
}

/** Demo wrapper so Dialog open/close is controlled by state; close button and onClose actually close it */
function DialogDemo() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button buttonType="theme" variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        id="demo-dialog"
        title="Dialog"
        open={open}
        onClose={() => setOpen(false)}
      >
        Dialog body content.
      </Dialog>
    </>
  )
}

/** Demo wrapper so PickerPopup is in a positioned container and shows a DatePicker inside (correct usage) */
function PickerPopupDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div id="demo-picker-trigger" style={{ position: 'relative', minHeight: '60px' }} className="date-input-wrapper">
      <Button
        buttonType="theme"
        variant="primary"
        onClick={() => setOpen(true)}
      >
        Open picker
      </Button>
      <PickerPopup
        id="demo-picker-popup"
        triggerId="demo-picker-trigger"
        open={open}
        onClose={() => setOpen(false)}
        title="Choose date"
      >
        <DatePicker
          id="demo-popup-date-picker"
          onDateSelect={() => setOpen(false)}
        />
      </PickerPopup>
    </div>
  )
}

/** Wraps a single Step in the stepper container so it matches how steps look inside Stepper (layout is driven by .stepper--horizontal .step). */
function StepDemo() {
  return (
    <div className="stepper stepper--horizontal" data-stepper role="group" aria-label="Stepper">
      <Step
        label="Step 1"
        stepNumber={1}
        description="Step one"
        isActive
      />
    </div>
  )
}

export const componentRegistry: ComponentRegistryEntry[] = [
  { name: 'Accordion', Component: Accordion as AnyComponent, demoProps: { items: [{ title: 'Section 1', content: 'Content for section 1' }, { title: 'Section 2', content: 'Content for section 2', defaultOpen: true }] } },
  { name: 'Alert', Component: Alert as AnyComponent, demoProps: { variant: 'info', children: 'This is an info alert.' } },
  { name: 'Avatar', Component: Avatar as AnyComponent },
  { name: 'Badge', Component: Badge as AnyComponent, demoProps: { variant: 'default', children: 'Badge' } },
  { name: 'Button', Component: ButtonDemo as AnyComponent },
  { name: 'ButtonGroup', Component: ButtonGroup as AnyComponent, demoProps: { children: [<Button key="1" buttonType="theme" variant="primary">Primary</Button>, <Button key="2" buttonType="theme" variant="secondary">Secondary</Button>, <Button key="3" buttonType="theme" variant="tertiary">Tertiary</Button>] } },
  { name: 'Card', Component: Card as AnyComponent, demoProps: { withHeader: true, headerTitle: 'Card title', headerSubtitle: 'Optional subtitle', children: 'Body copy. Override by passing children or default slot content.' } },
  { name: 'Checkbox', Component: CheckboxDemo as AnyComponent },
  { name: 'CheckboxGroup', Component: CheckboxGroup as AnyComponent, demoProps: { legend: 'Options', children: <><Checkbox label="Option A" /><Checkbox label="Option B" /></> } },
  { name: 'Chip', Component: Chip as AnyComponent, demoProps: { label: 'Chip' } },
  { name: 'DateInput', Component: DateInput as AnyComponent, demoProps: { id: 'demo-date', label: 'Date' } },
  { name: 'DatePicker', Component: DatePicker as AnyComponent },
  { name: 'DateTimePicker', Component: DateTimePicker as AnyComponent },
  { name: 'Dialog', Component: DialogDemo as AnyComponent },
  { name: 'Dropdown', Component: Dropdown as AnyComponent, demoProps: { options: [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }], placeholder: 'Select' } },
  { name: 'FloatingNav', Component: FloatingNav as AnyComponent },
  { name: 'Icon', Component: Icon as AnyComponent, demoProps: { name: 'check' } },
  { name: 'Input', Component: Input as AnyComponent, demoProps: { id: 'demo-input', label: 'Label', placeholder: 'Placeholder' } },
  { name: 'Kanban', Component: Kanban as AnyComponent, demoProps: { columns: [{ id: 'col-1', title: 'To Do', cards: [{ id: 'card-1', title: 'Task 1' }] }, { id: 'col-2', title: 'Done', cards: [] }] } },
  { name: 'KanbanCard', Component: KanbanCard as AnyComponent, demoProps: { id: 'demo-card', title: 'Card title' } },
  { name: 'Label', Component: Label as AnyComponent, demoProps: { htmlFor: 'demo', children: 'Label' } },
  { name: 'LeftSidebar', Component: LeftSidebar as AnyComponent },
  { name: 'Link', Component: Link as AnyComponent, demoProps: { href: '#', children: 'Link' } },
  { name: 'ListMenu', Component: ListMenu as AnyComponent, demoProps: { items: [{ label: 'Item 1', active: true }, { label: 'Item 2' }] } },
  { name: 'MonthPicker', Component: MonthPicker as AnyComponent },
  { name: 'NotificationBadge', Component: NotificationBadge as AnyComponent, demoProps: { count: 3, children: <span>Inbox</span> } },
  { name: 'NumberInput', Component: NumberInput as AnyComponent, demoProps: { id: 'demo-num', label: 'Number' } },
  { name: 'PickerPopup', Component: PickerPopupDemo as AnyComponent },
  { name: 'ProgressBar', Component: ProgressBar as AnyComponent, demoProps: { value: 60, max: 100 } },
  { name: 'RadioButton', Component: RadioButton as AnyComponent, demoProps: { name: 'demo', value: 'opt', label: 'Option' } },
  { name: 'RadioGroup', Component: RadioGroup as AnyComponent, demoProps: { name: 'demo', legend: 'Choose', children: <><RadioButton name="demo" value="a" label="Option A" defaultChecked /><RadioButton name="demo" value="b" label="Option B" /></> } },
  { name: 'RangeInput', Component: RangeInput as AnyComponent, demoProps: { id: 'demo-range', min: 0, max: 100, defaultValue: 50 } },
  { name: 'RightSidebar', Component: RightSidebar as AnyComponent },
  { name: 'ShellFooter', Component: ShellFooter as AnyComponent, demoProps: { tabs: [{ id: 't1', label: 'Home', active: true }, { id: 't2', label: 'Projects' }] } },
  { name: 'ShellHeader', Component: ShellHeader as AnyComponent },
  { name: 'ShellLayout', Component: ShellLayout as AnyComponent, fullPage: true },
  { name: 'ShellPageHeader', Component: ShellPageHeader as AnyComponent, demoProps: { title: 'Page Title' } },
  { name: 'ShellPanel', Component: ShellPanel as AnyComponent, demoProps: { side: 'left', open: true, title: 'Panel', onClose: () => {}, children: 'Panel content' } },
  { name: 'Spinner', Component: Spinner as AnyComponent },
  { name: 'Step', Component: StepDemo as AnyComponent },
  { name: 'Stepper', Component: Stepper as AnyComponent, demoProps: { steps: [{ label: 'First', description: 'Step one' }, { label: 'Second', description: 'Step two', completed: true }, { label: 'Third', description: 'Step three' }], activeStep: 1 } },
  { name: 'Table', Component: Table as AnyComponent },
  { name: 'TabStrip', Component: TabStrip as AnyComponent, demoProps: { tabs: [{ id: 'tab-1', label: 'Tab 1', active: true }, { id: 'tab-2', label: 'Tab 2' }] } },
  { name: 'Textarea', Component: Textarea as AnyComponent, demoProps: { id: 'demo-ta', label: 'Description', placeholder: 'Enter text' } },
  { name: 'TimePicker', Component: TimePicker as AnyComponent },
  { name: 'Toggle', Component: Toggle as AnyComponent, demoProps: { id: 'demo-toggle', label: 'Toggle' } },
  { name: 'Tooltip', Component: Tooltip as AnyComponent, demoProps: { text: 'Tooltip text', children: <span>Hover me</span> } },
  { name: 'WeekPicker', Component: WeekPicker as AnyComponent },
]

export function getComponentByName(name: string): ComponentRegistryEntry | undefined {
  return componentRegistry.find((entry) => entry.name === name)
}
