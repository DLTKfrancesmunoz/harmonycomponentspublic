# Alert

Dismissible feedback message with optional title, icon, primary/secondary actions, and progress bar.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'info' \| 'success' \| 'warning' \| 'error' | 'info' | info: Informational message (default).; success: Success or confirmation.; warning: Warning or caution.; error: Error or destructive. |
| style | 'default' \| 'enhanced' | 'default' | Display style (e.g. default vs enhanced). |
| title | string | — | Title or heading text. |
| dismissible | boolean | false | When true, the user can dismiss the alert. |
| onDismiss | () => void | — | Callback when the alert is dismissed. |
| icon | string | — | Icon name from the design system. |
| primaryButton | AlertButtonConfig | — | Primary action button config (text, href or onClick). |
| secondaryButton | AlertButtonConfig | — | Secondary action button config. |
| linkText | string | — | Text for an optional link in the alert. |
| linkHref | string | — | URL for the optional link in the alert. |
| progressValue | number | — | Current progress value (e.g. for progress bar or alert). |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode |  | Content rendered inside the component. |

## Usage

```tsx
import { Alert } from './components/harmony/Alert';

<Alert variant="info" title="Note">Message text</Alert>
```

## Variants

- **info**: Informational message (default).
- **success**: Success or confirmation.
- **warning**: Warning or caution.
- **error**: Error or destructive.

## CSS Classes

- `.alert`
- `.alert--enhanced`
- `.alert--info`
- `.alert--success`
- `.alert--warning`
- `.alert--error`

## Dependencies

- Icon
- Button
- ProgressBar
