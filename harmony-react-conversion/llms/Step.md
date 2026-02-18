# Step

Single step within a stepper (completed, error, warning, etc.).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| completed | boolean | false | When true, enables the option. |
| disabled | boolean | false | When true, the control is disabled and not interactive. |
| error | boolean | false | When true, shows error styling and optional error message. |
| warning | boolean | false | When true, shows warning state or message. |
| success | boolean | false | When true, enables the option. |
| icon | string | — | Icon name from the design system. |
| className | string | '' | Additional CSS classes applied to the root element. |
| label | ReactNode | 'Step label' | Label text for the control. |
| description | ReactNode | — | Content to render (React node). |
| stepNumber | number | 1 | Numeric value. |
| isActive | boolean | false | When true, enables the option. |
| connectorActive | boolean | false | When true, enables the option. |
| onClick | () => void | — | Click handler. |
| role | string | — | String value. |
| tabIndex | number | — | Numeric value. |

## Usage

```tsx
import { Step } from './components/harmony/Step';

<Step label="Example" />
```

## CSS Classes

- `.step`
- `.step--completed`
- `.step--disabled`
- `.step--error`
- `.step--warning`
- `.step--success`

## Dependencies

- Icon
