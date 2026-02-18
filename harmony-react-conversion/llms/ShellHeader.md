# ShellHeader

Top shell bar with logo, product name, and optional company picker.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| productName | string | 'Harmony' | Product or app name shown in the shell. |
| logoSrc | string | '/logos/PPMLogo.svg' | URL of the logo image. |
| companyName | string | 'Company name' | Current company name in the shell. |
| showCompanyPicker | boolean | true | When true, the company picker is shown. |
| companyColor | string | — | Color used for the company picker. |
| companies | CompanyOption[] | PPM_COMPANIES | List of companies for the company picker. |
| className | string | '' | Additional CSS classes applied to the root element. |

## Usage

```tsx
import { ShellHeader } from './components/harmony/ShellHeader';

<ShellHeader />
```

## CSS Classes

- `.header`
- `.company-picker__menu--open`
- `.company-picker__option--selected`

## Dependencies

- Icon
- Avatar

## Theme Behavior

- **Default logo**: Astro uses theme-specific defaults (e.g. `/logos/CPVPLogo.svg` for CP, `/logos/PPMLogo.svg` for PPM). React defaults to `logoSrc = '/logos/PPMLogo.svg'`; set `logoSrc` per theme if needed.
- **Default companies**: Astro CP uses Acme Corporation, Ocean Industries, Violet Systems, Azure Dynamics, Sunset Corporation (with theme colors). React defaults to PPM-style list (Project Alpha, Project Beta); pass `companies` and `companyColor` to match theme.

## Dark Mode

The header includes a gradient bar (`.header__gradient`) at the bottom whose color is driven by `companyColor` (or the selected company's color). In dark mode, theme tokens (e.g. `--theme-primary`) are redefined so the gradient and picker indicators follow the dark palette.

## Not Yet Implemented

The following Astro props or slots are not yet available in the React conversion:

- **actions (slot)**: Astro supports a named slot `actions` that replaces the default company picker and avatar. React does not expose an actions slot; use children or a custom header if needed.
