# Accordion

Expandable sections that reveal content when a header is clicked; supports single or multiple open panels.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | AccordionItem[] |  | Array of items to render (e.g. accordion sections, menu items). |
| allowMultiple | boolean | false | When true, multiple sections/items can be open at once. |
| className | string | '' | Additional CSS classes applied to the root element. |
| itemSlots | (ReactNode \| null)[] | — | Optional custom React content per item (overrides default content). |

## Usage

```tsx
import { Accordion } from './components/harmony/Accordion';

<Accordion items={[{ title: "Section 1", content: "Content here" }, { title: "Section 2", content: "More content" }]} />
```

## CSS Classes

- `.accordion`

## Dependencies

- Icon
