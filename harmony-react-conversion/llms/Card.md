# Card

Content container with optional header (title/subtitle), body, and footer; supports elevated and interactive styles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| elevated | boolean | false | When true, the card has elevation shadow. |
| interactive | boolean | false | When true, the card has hover/click styling. |
| primary | boolean | false | When true, uses primary theme styling. |
| withHeader | boolean | false | When true, the card shows a header area. |
| headerTitle | string | '' | Title text for the card or dialog header. |
| headerSubtitle | string | '' | Subtitle text for the header. |
| className | string | '' | Additional CSS classes applied to the root element. |
| header | ReactNode | — | Custom header content (overrides headerTitle/headerSubtitle when set). |
| headerActions | ReactNode | — | Actions or buttons in the header area. |
| children | ReactNode | — | Content rendered inside the component. |
| footer | ReactNode | — | Footer content or actions. |

## Usage

```tsx
import { Card } from './components/harmony/Card';

// Basic card (no header)
<Card>Card body content.</Card>

// Card with header
<Card withHeader headerTitle="Card title" headerSubtitle="Optional subtitle">
  Card body content.
</Card>
```

## CSS Classes

- `.card`
- `.card--elevated`
- `.card--interactive`
- `.card--primary`
- `.card--with-header`

## Dependencies

None (standalone component).
