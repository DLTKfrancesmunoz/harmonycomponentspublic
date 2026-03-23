# ShellPageHeader

Page-level header with title, subtitle, and optional primary/outline buttons.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string |  | Title or heading text. |
| subtitle | string | — | String value. |
| showDefaultButtons | boolean | true | When true, default page header buttons are shown. |
| primaryButton | ShellPageHeaderButtonConfig | — | Primary action button config (text, href or onClick). |
| outlineButton1 | ShellPageHeaderButtonConfig | — | See type. |
| outlineButton2 | ShellPageHeaderButtonConfig | — | See type. |
| outlineButton3 | ShellPageHeaderButtonConfig | — | See type. |
| className | string | '' | Additional CSS classes applied to the root element. |
| actions | React.ReactNode | — | Custom action configs for the floating nav. |

## Usage

```tsx
import { ShellPageHeader } from './components/harmony/ShellPageHeader';

<ShellPageHeader title="Page title" subtitle="Optional subtitle" />
```

## CSS Classes

- `.shell-page-header`

## Dependencies

- Button
