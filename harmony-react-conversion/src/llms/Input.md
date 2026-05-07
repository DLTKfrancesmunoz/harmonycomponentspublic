# Input

Text input with optional label, leading icon, trailing icon or custom trailing content, error state, and validation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'text' \| 'email' \| 'password' \| 'number' \| 'url' \| 'search' \| 'tel' | 'text' | Input or control type (e.g. text, email, date). |
| placeholder | string | — | Placeholder text when empty. |
| value | string | — | Controlled value. |
| name | string | — | Form field name for submission. |
| id | string | — | Unique DOM id for the root or main control (for accessibility). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| error | boolean | false | When true, shows error styling and optional error message. |
| errorMessage | string | — | Error message shown when error is true. |
| icon | string | — | Leading Heroicon name (left). |
| trailingIcon | string | — | Trailing Heroicon name (right); ignored when `trailing` is set. |
| trailing | ReactNode | — | Custom right-side content (e.g. password toggle button); takes precedence over `trailingIcon`. |
| required | boolean | false | When true, the field is required for form validation. |
| label | string | — | Label text for the control. |
| labelVariant | 'inline' \| 'stacked' | — | Label layout: inline or stacked. |
| labelFor | string | — | String value. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { Input } from './components/harmony/Input';
import { Icon } from './components/harmony/Icon';

<Input label="Name" placeholder="Enter your name" />

<Input icon="magnifying-glass" trailingIcon="x-mark" placeholder="Search" />

<Input
  type="password"
  trailing={
    <button type="button" aria-label="Show password">
      <Icon name="eye" size="sm" />
    </button>
  }
/>
```

## CSS Classes

- `.input`
- `.input--with-icon`
- `.input--with-trailing`
- `.input--error`
- `.input-wrapper__trailing`

## Dependencies

- Icon
- Label
