# Button

Primary action control with variant and size; can render as button or link.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'destructive' \| 'dela' \| 'dela-pill' | 'primary' | primary: Filled with theme primary color.; secondary: Outlined with theme color.; tertiary: Text-only, no background or border.; outline: Neutral outlined.; ghost: Transparent, background on hover.; destructive: Destructive/danger action.; dela: Dela-themed button.; dela-pill: Dela-themed pill button. |
| buttonType | 'theme' \| 'pageHeader' | 'theme' | Button style context: theme (in-page) or pageHeader. |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | xs: Extra small.; sm: Small.; md: Medium (default).; lg: Large. |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout direction (e.g. horizontal, vertical). |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| loading | boolean | false | When true, enables the option. |
| loadingText | string | — | String value. |
| icon | string | — | Icon name from the design system. |
| iconPosition | 'left' \| 'right' | 'left' | See type. |
| type | 'button' \| 'submit' \| 'reset' | 'button' | Input or control type (e.g. text, email, date). |
| fullWidth | boolean | false | When true, enables the option. |
| href | string | — | When set, the component renders as a link to this URL. |
| onClick | () => void | — | Click handler. |
| children | ReactNode | — | Content rendered inside the component. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { Button } from './components/harmony/Button';

<Button variant="primary" size="xs">Save</Button>
```

## Variants

- **primary**: Filled with theme primary color.
- **secondary**: Outlined with theme color.
- **tertiary**: Text-only, no background or border.
- **outline**: Neutral outlined.
- **ghost**: Transparent, background on hover.
- **destructive**: Destructive/danger action.
- **dela**: Dela-themed button.
- **dela-pill**: Dela-themed pill button.
- **xs**: Extra small.
- **sm**: Small.
- **md**: Medium (default).
- **lg**: Large.

## CSS Classes

- `.btn`
- `.btn--page-header`
- `.btn--vertical`
- `.btn--disabled`
- `.btn--loading`
- `.btn--full`
- `.btn--primary`
- `.btn--secondary`
- `.btn--tertiary`
- `.btn--outline`
- `.btn--ghost`
- `.btn--destructive`
- `.btn--dela`
- `.btn--dela-pill`
- `.btn--xs`
- `.btn--sm`
- `.btn--md`
- `.btn--lg`

## Dependencies

- Icon
