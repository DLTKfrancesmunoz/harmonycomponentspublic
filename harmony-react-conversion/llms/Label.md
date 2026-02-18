# Label

Form label with optional required indicator and helper text.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| htmlFor | string | — | ID of the associated form control. |
| required | boolean | false | When true, the field is required for form validation. |
| helper | string | — | Helper text below the label. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode |  | Content rendered inside the component. |

## Usage

```tsx
import { Label } from './components/harmony/Label';

<Label />
```

## CSS Classes

- `.label`
- `.label--required`

## Dependencies

None (standalone component).
