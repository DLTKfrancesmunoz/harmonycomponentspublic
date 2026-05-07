# @dltkfrancesmunoz/harmony-react

Harmony Design System — React components and agent skills for Astro-aligned product UIs (public distribution).

## Features

✅ **48 Production-Ready React Components**
- Forms: Button, Input, Checkbox, Radio, Select, Textarea, DatePicker, etc.
- Layout: Card, ShellLayout, ShellHeader, ShellFooter, ShellPanel, etc.
- Navigation: TabStrip, ListMenu, FloatingNav, etc.
- Feedback: Alert, Badge, Spinner, ProgressBar, Toast, etc.
- Overlays: Dialog, Dropdown, Tooltip, etc.

✅ **Agent Skills for Cursor/Claude Code**
- Harmony component converter
- Usage rules and best practices
- UX principles
- Layout builder
- Design patterns

✅ **TypeScript Support**
- Full type definitions
- IntelliSense support

✅ **Component Styles**
- Individual CSS imports
- Customizable with CSS variables

## Installation

```bash
# From your app (adjust the relative path to where you cloned this repo):
npm install file:../harmonycomponentspublic/harmony-react-conversion
```

Or clone the repo, run `npm ci` and `npm run build:lib` inside `harmony-react-conversion`, then `npm link` from that folder and `npm link @dltkfrancesmunoz/harmony-react` in your app.

## Usage

### Basic Components

```tsx
import { Button, Card, Alert } from '@dltkfrancesmunoz/harmony-react';
import '@dltkfrancesmunoz/harmony-react/styles/Button.css';
import '@dltkfrancesmunoz/harmony-react/styles/Card.css';
import '@dltkfrancesmunoz/harmony-react/styles/Alert.css';

function App() {
  return (
    <Card>
      <Alert variant="success">Welcome to Harmony!</Alert>
      <Button variant="primary" onClick={() => console.log('Clicked!')}>
        Click Me
      </Button>
    </Card>
  );
}
```

### Shell Layout

```tsx
import {
  ShellLayout,
  ShellHeader,
  ShellFooter,
  LeftSidebar,
  ShellPanel
} from '@dltkfrancesmunoz/harmony-react';
import '@dltkfrancesmunoz/harmony-react/styles/ShellLayout.css';

function App() {
  return (
    <ShellLayout>
      <ShellHeader>
        <h1>My App</h1>
      </ShellHeader>

      <LeftSidebar>
        {/* Navigation here */}
      </LeftSidebar>

      <ShellPanel>
        {/* Main content here */}
      </ShellPanel>

      <ShellFooter>
        © 2026 Your company
      </ShellFooter>
    </ShellLayout>
  );
}
```

### Form Components

```tsx
import {
  Input,
  Checkbox,
  DatePicker,
  Button
} from '@dltkfrancesmunoz/harmony-react';
import '@dltkfrancesmunoz/harmony-react/styles/Input.css';
import '@dltkfrancesmunoz/harmony-react/styles/Checkbox.css';
import '@dltkfrancesmunoz/harmony-react/styles/DatePicker.css';

function Form() {
  return (
    <form>
      <Input
        label="Name"
        placeholder="Enter your name"
        required
      />

      <DatePicker
        label="Start Date"
        onChange={(date) => console.log(date)}
      />

      <Checkbox
        label="I agree to the terms"
      />

      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}
```

## Available Components

### Form Components
- `Button` - Primary, secondary, tertiary, danger variants
- `Input` - Text, email, password, search inputs
- `Textarea` - Multi-line text input
- `Checkbox` - Single checkbox with label
- `CheckboxGroup` - Multiple checkboxes
- `RadioButton` - Single radio button
- `RadioGroup` - Radio button group
- `Toggle` - Switch toggle
- `DateInput` - Date text input
- `DatePicker` - Full date picker
- `TimePicker` - Time selection
- `DateTimePicker` - Date and time picker
- `MonthPicker` - Month selection
- `WeekPicker` - Week selection
- `NumberInput` - Numeric input
- `RangeInput` - Range slider

### Layout Components
- `Card` - Content container
- `ShellLayout` - Application shell
- `ShellHeader` - Top navigation bar
- `ShellFooter` - Bottom footer
- `ShellPageHeader` - Page-level header
- `ShellPanel` - Content panel
- `LeftSidebar` - Left navigation sidebar
- `RightSidebar` - Right utility sidebar
- `Accordion` - Collapsible sections

### Navigation Components
- `TabStrip` - Tab navigation
- `ListMenu` - Vertical menu
- `FloatingNav` - Floating navigation
- `Link` - Navigation link

### Feedback Components
- `Alert` - Success, info, warning, error alerts
- `Badge` - Status badges
- `Chip` - Removable tags
- `Spinner` - Loading spinner
- `ProgressBar` - Progress indicator
- `Stepper` - Multi-step progress
- `Step` - Individual step
- `NotificationBadge` - Count badge

### Overlay Components
- `Dialog` - Modal dialog
- `Dropdown` - Dropdown menu
- `Tooltip` - Hover tooltip
- `PickerPopup` - Picker overlay

### Data Display
- `Table` - Data table
- `Avatar` - User avatar
- `Icon` - Icon component
- `Label` - Text label
- `Kanban` - Kanban board
- `KanbanCard` - Kanban card

## Agent Skills

The package includes agent skills for Cursor and Claude Code:

### Using Skills in Cursor/Claude Code

Skills are available at `node_modules/@dltkfrancesmunoz/harmony-react/.cursor/skills/`:

- **harmony** - Harmony component library reference
- **harmony-converter** - Convert components to Harmony
- **harmony-usage-rules** - Component usage guidelines
- **harmony-ux-principles** - UX design principles
- **layout-builder** - Build shell layouts
- **design-patterns** - Common patterns

### Accessing Skills

Reference in your `.cursor/config.json`:
```json
{
  "skills": [
    "node_modules/@dltkfrancesmunoz/harmony-react/.cursor/skills/harmony",
    "node_modules/@dltkfrancesmunoz/harmony-react/.cursor/skills/harmony-converter"
  ]
}
```

## Styling

### Import Individual Styles

```tsx
import '@dltkfrancesmunoz/harmony-react/styles/Button.css';
import '@dltkfrancesmunoz/harmony-react/styles/Card.css';
```

### CSS Custom Properties

Components use CSS custom properties for theming:

```css
:root {
  --color-primary: #0066cc;
  --color-secondary: #6c757d;
  --spacing-base: 8px;
  --border-radius: 4px;
  /* ... more variables */
}
```

## TypeScript

Full TypeScript support with type definitions:

```tsx
import { Button, ButtonProps } from '@dltkfrancesmunoz/harmony-react';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Related Packages

- `@dltkfrancesmunoz/harmony-design-system` — Astro package (tokens, global CSS, UI primitives)

## License

MIT — see repository root for the full Harmony design system license.

## Changelog

See the repo root **[CHANGELOG.md](../CHANGELOG.md)** and the docs site **`/changelog`** (data is updated locally with `npm run changelog`, then committed—no GitHub automation).

## Support

For issues and questions:
- Repository: https://github.com/DLTKfrancesmunoz/harmonycomponentspublic
- Documentation: https://{env}/harmony/
