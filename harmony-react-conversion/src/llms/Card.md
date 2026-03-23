# Card

Content container with optional header (title/subtitle), body, and footer; supports elevated and interactive styles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| elevated | boolean | false | When true, the card has elevation shadow. |
| interactive | boolean | false | When true, the card has hover/click styling. |
| primary | boolean | false | When true, uses primary theme styling. |
| withHeader | boolean | false | When true, the card shows a header area with title/subtitle. |
| headerTitle | string | '' | Title text for the card header. |
| headerSubtitle | string | '' | Subtitle text for the header. |
| icon1 | string | — | Rightmost header icon name (e.g. `'x-mark'`). Omit to hide. |
| icon2 | string | — | Middle header icon name (e.g. `'ellipsis-vertical'`). Omit to hide. |
| icon3 | string | — | Leftmost header icon name (e.g. `'cog-6-tooth'`). Omit to hide. |
| className | string | '' | Additional CSS classes applied to the root element. |
| header | ReactNode | — | Custom header content (overrides headerTitle/headerSubtitle when set). |
| headerActions | ReactNode | — | Custom actions in the header area (overrides icon props when set). |
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

// Card with header icons (gear | ellipsis | X from left to right)
<Card withHeader headerTitle="Card title" icon1="x-mark" icon2="ellipsis-vertical" icon3="cog-6-tooth">
  Card body content.
</Card>

// Single icon (appears at far right)
<Card withHeader headerTitle="Card title" icon1="x-mark">
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
