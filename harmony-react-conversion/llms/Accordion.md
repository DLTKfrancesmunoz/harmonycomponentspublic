# Accordion

Expandable sections that reveal content when a header is clicked; supports single or multiple open panels.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | AccordionItem[] |  | Array of items to render (e.g. accordion sections, menu items). |
| allowMultiple | boolean | false | When true, multiple sections/items can be open at once. |
| className | string | '' | Additional CSS classes applied to the root wrapper (`.accordion-field`). |
| label | string | — | Optional label above the accordion; sets `role="group"` and `aria-labelledby` on the control. |
| itemSlots | (ReactNode \| null)[] | — | Optional custom React content per item (overrides default content). |

### AccordionItem

| Field | Type | Description |
|-------|------|-------------|
| title | string | Section header text. |
| content | string | Default body text when no slot override. |
| defaultOpen | boolean | Open on first render (ignored when `disabled` is true). |
| disabled | boolean | When true, the section cannot be expanded and the header is styled as disabled. |

## Usage

```tsx
import { Accordion } from './components/harmony/Accordion';

<Accordion
  label="Settings"
  items={[
    { title: 'Section 1', content: 'Content here' },
    { title: 'Section 2', content: 'More content', disabled: true },
  ]}
/>
```

## CSS Classes

- `.accordion-field`
- `.accordion-field__label`
- `.accordion-field__surface`
- `.accordion`
- `.accordion__item--disabled`

## Dependencies

- Icon
