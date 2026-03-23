# Stepper

Horizontal or vertical stepper with steps and optional click navigation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| activeStep | number | 0 | Index of the currently active step. |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout direction (e.g. horizontal, vertical). |
| nonLinear | boolean | false | When true, steps can be clicked in any order. |
| className | string | '' | Additional CSS classes applied to the root element. |
| children | ReactNode | — | Content rendered inside the component. |
| steps | Array<{ label: ReactNode | — | Step definitions for the stepper. |
| onStepClick | (stepIndex: number) => void | — | Callback when a stepper step is clicked. |

## Usage

```tsx
import { Stepper } from './components/harmony/Stepper';

<Stepper activeStep={0} steps={[{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }]} />
```

## CSS Classes

- `.stepper`
- `.stepper--non-linear`
- `.stepper--horizontal`
- `.stepper--vertical`

## Dependencies

- Step
