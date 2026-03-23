# Link

Text or inline link with optional external and muted styling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | string |  | When set, the component renders as a link to this URL. |
| external | boolean | false | When true, link opens in a new tab with rel. |
| muted | boolean | false | When true, link uses muted styling. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode | — | Content rendered inside the component. |

## Usage

```tsx
import { Link } from './components/harmony/Link';

<Link href={...} />
```

## CSS Classes

- `.link`
- `.link--muted`

## Dependencies

- Icon
