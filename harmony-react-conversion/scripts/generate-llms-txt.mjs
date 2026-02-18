#!/usr/bin/env node
/**
 * Generate llms.txt, llms/*.md, and llms-full.txt for Harmony React components.
 * Usage: node scripts/generate-llms-txt.mjs [--component-dir=path] [--out-dir=path]
 * Defaults: component-dir=src/components/harmony, out-dir=.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const componentDir = path.resolve(rootDir, args.find(a => a.startsWith('--component-dir='))?.split('=')[1] || 'src/components/harmony')
const outDir = path.resolve(rootDir, args.find(a => a.startsWith('--out-dir='))?.split('=')[1] || '.')
const dryRun = args.includes('--dry-run')

const SHELL_COMPONENTS = new Set(['ShellLayout', 'ShellHeader', 'ShellFooter', 'LeftSidebar', 'RightSidebar', 'ShellPageHeader', 'ShellPanel'])
const FORM_CONTROLS = new Set(['Input', 'Textarea', 'NumberInput', 'Checkbox', 'RadioButton', 'Toggle', 'DateInput', 'Label'])
const PICKERS = new Set(['DatePicker', 'DateTimePicker', 'MonthPicker', 'WeekPicker', 'TimePicker', 'PickerPopup'])

const COMPONENT_DESCRIPTIONS = {
  Accordion: 'Expandable sections that reveal content when a header is clicked; supports single or multiple open panels.',
  Alert: 'Dismissible feedback message with optional title, icon, primary/secondary actions, and progress bar.',
  Avatar: 'User or entity thumbnail image with optional fallback and size presets.',
  Badge: 'Small label or count indicator with variant and size options.',
  Button: 'Primary action control with variant and size; can render as button or link.',
  ButtonGroup: 'Group of buttons with shared variant, size, and orientation.',
  Card: 'Content container with optional header (title/subtitle), body, and footer; supports elevated and interactive styles.',
  Checkbox: 'Single checkbox control bound to a boolean value.',
  CheckboxGroup: 'Group of checkboxes with a legend and optional error/warning message.',
  Chip: 'Compact tag or status pill with variant, size, and optional overflow count.',
  DateInput: 'Native date/time input with type (date, time, datetime-local, month, week).',
  DatePicker: 'Calendar-style date picker with min/max and value.',
  DateTimePicker: 'Combined date and time picker.',
  Dialog: 'Modal overlay with title, body content, and optional footer actions.',
  Dropdown: 'Select-style dropdown with options and placeholder.',
  FloatingNav: 'Floating navigation with optional execute/save and custom actions.',
  Icon: 'Icon from design system with name, variant, and size.',
  Input: 'Text input with optional label, icon, error state, and validation.',
  Kanban: 'Kanban board with columns and optional title/action buttons.',
  KanbanCard: 'Card item within a Kanban column with title and description.',
  Label: 'Form label with optional required indicator and helper text.',
  Link: 'Text or inline link with optional external and muted styling.',
  ListMenu: 'List of menu items with optional borders and click handler.',
  MonthPicker: 'Month-only picker with value and min/max.',
  NotificationBadge: 'Badge showing a count or status (e.g. errors) with variant and size.',
  NumberInput: 'Numeric input with optional min, max, and step.',
  PickerPopup: 'Popover wrapper for a picker with trigger and title.',
  ProgressBar: 'Progress indicator with variant, size, value, max, and optional label.',
  RadioButton: 'Single radio option within a group.',
  RadioGroup: 'Group of radio buttons with name, legend, and optional error.',
  RangeInput: 'Slider input for a numeric range (min/max/value).',
  RightSidebar: 'Right-hand shell sidebar with optional variant and sections.',
  ShellFooter: 'Bottom shell area with tabs and optional “more” control.',
  ShellHeader: 'Top shell bar with logo, product name, and optional company picker.',
  ShellLayout: 'App shell that composes header, footer, sidebars, page header, and main content.',
  ShellPageHeader: 'Page-level header with title, subtitle, and optional primary/outline buttons.',
  ShellPanel: 'Slide-out panel from left or right with title and optional variant.',
  LeftSidebar: 'Left-hand shell sidebar with optional variant and sections.',
  Spinner: 'Loading spinner with size.',
  Step: 'Single step within a stepper (completed, error, warning, etc.).',
  Stepper: 'Horizontal or vertical stepper with steps and optional click navigation.',
  TabStrip: 'Tabs with optional add-tab and compact style.',
  Table: 'Data table with optional header variant, striped rows, and title bar.',
  Textarea: 'Multi-line text input with placeholder and value.',
  TimePicker: 'Time-only picker with value and min/max.',
  Toggle: 'On/off switch with size and optional label.',
  Tooltip: 'Hover or focus tooltip with text, position, and corner variant.',
  WeekPicker: 'Week picker with value and min/max.',
}

const VARIANT_DESCRIPTIONS = {
  Button: { primary: 'Filled with theme primary color.', secondary: 'Outlined with theme color.', tertiary: 'Text-only, no background or border.', outline: 'Neutral outlined.', ghost: 'Transparent, background on hover.', destructive: 'Destructive/danger action.', dela: 'Dela-themed button.', 'dela-pill': 'Dela-themed pill button.' },
  Alert: { info: 'Informational message (default).', success: 'Success or confirmation.', warning: 'Warning or caution.', error: 'Error or destructive.' },
  Badge: { default: 'Neutral gray.', primary: 'Theme primary color.', success: 'Success green.', warning: 'Warning amber.', error: 'Error red.', info: 'Info blue.', orange: 'Orange accent.', pink: 'Pink accent.', disabled: 'Muted disabled.' },
  Chip: { fill: 'Filled background.', outline: 'Outlined border only.' },
  Icon: { outline: 'Outline stroke style.', solid: 'Filled style.' },
  ButtonGroup: { default: 'Default button group style.', outline: 'Outlined style.' },
  ProgressBar: { default: 'Default/neutral.', success: 'Success green.', warning: 'Warning amber.', error: 'Error red.', info: 'Info blue.' },
  ListMenu: { default: 'With borders between items.', 'no-borders': 'No dividers between items.' },
  FloatingNav: { full: 'Full layout with labels.', compact: 'Compact icon-only layout.' },
  ShellFooter: { default: 'Default footer style.', compact: 'Compact footer.' },
  TabStrip: { default: 'Default tab strip.', compact: 'Compact tabs.' },
  ShellPanel: { default: 'Standard panel.', dela: 'Dela/AI-themed panel.' },
  RightSidebar: { cp: 'CP theme.', vp: 'VP theme.', ppm: 'PPM theme.', maconomy: 'Maconomy theme.' },
  LeftSidebar: { cp: 'CP theme.', vp: 'VP theme.', ppm: 'PPM theme.', maconomy: 'Maconomy theme.' },
  NotificationBadge: { error: 'Error/critical count.', primary: 'Theme primary count.' },
}
const SIZE_DESCRIPTIONS = {
  Button: { xs: 'Extra small.', sm: 'Small.', md: 'Medium (default).', lg: 'Large.' },
  Avatar: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
  Chip: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
  Icon: { xs: 'Extra small.', sm: 'Small.', md: 'Medium.', lg: 'Large.', xl: 'Extra large.' },
  ButtonGroup: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
  ProgressBar: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
  Spinner: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
  Toggle: { sm: 'Small.', md: 'Medium.' },
  NotificationBadge: { sm: 'Small.', md: 'Medium.', lg: 'Large.' },
}

const THEME_BEHAVIOR = {
  LeftSidebar: `- **variant=\"cp\"**: Two sections. Section 1: Welcome screen, Dashboard, My menu, Recent. Section 2: Search, Command Center, Accounting, Planning, Capture & contracts, Projects, Materials, Time & expense, People, Reports, Admin.
- **variant=\"ppm\"**, **variant=\"vp\"**, **variant=\"maconomy\"**: One section: Command Center, Programs, Portfolios, Projects, Risk, Reports, Calendars, Codes, Rates, Resources, Settings, Add Menu.
- The React component defaults to \`sections = PPM_SECTIONS\`; pass \`sections\` to override. Astro source has separate default sections per theme (cpSections, ppmSections, vpSections, maconomySections).`,
  RightSidebar: `- **variant=\"cp\"**: Three sections. Section 1: Dela AI (custom logo), Notifications, Files. Section 2: Print, Layout Options. Section 3: Microphone, Offline, Keyboard Shortcuts, Help.
- **variant=\"ppm\"**, **variant=\"vp\"**, **variant=\"maconomy\"**: Three sections. Section 1: Dela AI (custom logo), Edit, Search, Actions, Related, Templates, Upload, Download. Section 2: Notifications, Help, Share. Section 3: Accessibility, Language, Dark Mode.
- The React component defaults to \`sections = PPM_SECTIONS\`; pass \`sections\` to override for other themes.`,
  ShellHeader: `- **Default logo**: Astro uses theme-specific defaults (e.g. \`/logos/CPVPLogo.svg\` for CP, \`/logos/PPMLogo.svg\` for PPM). React defaults to \`logoSrc = '/logos/PPMLogo.svg'\`; set \`logoSrc\` per theme if needed.
- **Default companies**: Astro CP uses Acme Corporation, Ocean Industries, Violet Systems, Azure Dynamics, Sunset Corporation (with theme colors). React defaults to PPM-style list (Project Alpha, Project Beta); pass \`companies\` and \`companyColor\` to match theme.`,
  ShellLayout: `- ShellLayout composes header, footer, sidebars, and page header. Theme-specific behavior is driven by child props: \`logoSrc\` and \`companies\` on ShellHeader; \`variant\` and \`sections\` on LeftSidebar and RightSidebar; \`variant\` on ShellFooter.
- CP theme typically uses FloatingNav instead of ShellFooter; React does not implement \`showFloatingNav\` / \`floatingNavVariant\` at layout level.`,
  ShellFooter: `- **variant=\"default\"**: Full-height footer with tabs. **variant=\"compact\"**: Reduced height (\`--shell-footer-height-compact\`).
- Tab labels and active state use theme tokens (\`--shell-footer-tab-label-color\`, \`--shell-footer-tab-icon-color-active\`). Active tab shows pin icon and primary underline.`,
  Icon: `- Icons resolve from theme-scoped manifest in Astro (hero | tabler | custom per theme). React uses a single resolution path; icon names are shared across themes but the underlying SVG source can differ by product (CP, VP, PPM, Maconomy).`,
}

const DARK_MODE_NOTES = {
  ShellFooter: `In dark mode (\`html.dark\`), tab labels use \`--shell-footer-tab-label-color\` (e.g. inverse/white). Only the active tab pin icon and bottom border use \`--shell-footer-tab-icon-color-active\` and \`--theme-primary\`. Inactive tabs use the same label color variable for consistency.`,
  ShellHeader: `The header includes a gradient bar (\`.header__gradient\`) at the bottom whose color is driven by \`companyColor\` (or the selected company's color). In dark mode, theme tokens (e.g. \`--theme-primary\`) are redefined so the gradient and picker indicators follow the dark palette.`,
  RightSidebar: `In dark mode (\`html.dark\`), img-based icons (e.g. custom Dela logo) use \`filter: brightness(0) invert(1)\` so they remain visible; the active Dela logo (\`.right-sidebar__dela-logo--active\`) is excluded. Icon and label colors use \`--text-primary\`; the active item uses \`--shell-sidebar-icon-color-on-primary\` (e.g. white).`,
  LeftSidebar: `In dark mode (\`html.dark\`), item hover uses \`--hover-bg\`. Icon color uses \`--text-primary\`; the active item icon uses \`--shell-sidebar-icon-color-on-primary\`. Custom img icons (e.g. \`.left-sidebar__custom-icon\`) use \`filter: brightness(0) invert(1)\` for contrast.`,
  FloatingNav: `In dark mode (\`html.theme-cp.dark\`), the floating nav background, border, secondary button color/border, primary/disabled button colors, divider, and pin icon use dedicated dark tokens (e.g. \`--floating-nav-bg-dark\`, \`--floating-nav-btn-secondary-dark\`).`,
}

const NOT_IMPLEMENTED_PROPS = {
  ShellLayout: `- **showFloatingNav**, **floatingNavVariant**, **showExecute**, **saveDisabled**: CP uses FloatingNav instead of footer; not wired at layout level in React.
- **showMoreTabs**, **moreCount**, **overflowTabs**, **showAddTab**, **footerVariant**: Footer-level tab overflow and variant are passed to ShellFooter in Astro; React ShellLayout passes \`tabs\` and \`showFooter\` but not overflow or variant.
- **leftSidebarVariant**, **leftSidebarSections**, **rightSidebarVariant**, **rightSidebarSections**: Astro passes these to LeftSidebar/RightSidebar; React ShellLayout does not accept or forward them (sidebars use their own defaults).
- **leftPanel**, **rightPanel**: Astro layout accepts panel config (side, open, title, etc.); React does not compose panels from layout props—use ShellPanel separately.`,
  ShellHeader: `- **actions (slot)**: Astro supports a named slot \`actions\` that replaces the default company picker and avatar. React does not expose an actions slot; use children or a custom header if needed.`,
}

const PROP_DESCRIPTIONS = {
  variant: null,
  size: null,
  buttonType: 'Button style context: theme (in-page) or pageHeader.',
  style: 'Display style (e.g. default vs enhanced).',
  className: 'Additional CSS classes applied to the root element.',
  children: 'Content rendered inside the component.',
  disabled: 'When true, the control is disabled and not interactive.',
  required: 'When true, the field is required for form validation.',
  id: 'Unique DOM id for the root or main control (for accessibility).',
  name: 'Form field name for submission.',
  value: 'Controlled value.',
  placeholder: 'Placeholder text when empty.',
  title: 'Title or heading text.',
  label: 'Label text for the control.',
  icon: 'Icon name from the design system.',
  href: 'When set, the component renders as a link to this URL.',
  onClick: 'Click handler.',
  open: 'When true, the overlay or panel is visible.',
  onClose: 'Callback when the overlay/panel is closed or dismissed.',
  onDismiss: 'Callback when the alert is dismissed.',
  error: 'When true, shows error styling and optional error message.',
  errorMessage: 'Error message shown when error is true.',
  dismissible: 'When true, the user can dismiss the alert.',
  items: 'Array of items to render (e.g. accordion sections, menu items).',
  options: 'Array of options for select/dropdown.',
  tabs: 'Tab definitions (id, label, active, etc.).',
  steps: 'Step definitions for the stepper.',
  columns: 'Kanban column definitions.',
  headerTitle: 'Title text for the card or dialog header.',
  headerSubtitle: 'Subtitle text for the header.',
  header: 'Custom header content (overrides headerTitle/headerSubtitle when set).',
  headerActions: 'Actions or buttons in the header area.',
  footer: 'Footer content or actions.',
  primaryButton: 'Primary action button config (text, href or onClick).',
  secondaryButton: 'Secondary action button config.',
  allowMultiple: 'When true, multiple sections/items can be open at once.',
  orientation: 'Layout direction (e.g. horizontal, vertical).',
  nonLinear: 'When true, steps can be clicked in any order.',
  activeStep: 'Index of the currently active step.',
  productName: 'Product or app name shown in the shell.',
  logoSrc: 'URL of the logo image.',
  companyName: 'Current company name in the shell.',
  showCompanyPicker: 'When true, the company picker is shown.',
  showFooter: 'When true, the shell footer is visible.',
  showRightSidebar: 'When true, the right sidebar is visible.',
  pageHeaderTitle: 'Title in the shell page header.',
  pageHeaderSubtitle: 'Subtitle in the page header.',
  itemSlots: 'Optional custom React content per item (overrides default content).',
  type: 'Input or control type (e.g. text, email, date).',
  labelVariant: 'Label layout: inline or stacked.',
  showLabel: 'When true, a label is rendered.',
  checked: 'Checked state for checkbox, radio, or toggle.',
  min: 'Minimum value (number or date string).',
  max: 'Maximum value (number or date string).',
  progressValue: 'Current progress value (e.g. for progress bar or alert).',
  text: 'Display text (e.g. button label, tooltip).',
  position: 'Position of the element (e.g. tooltip placement).',
  sections: 'Sidebar or nav sections to render.',
  side: 'Which side the panel opens from (left or right).',
  headerVariant: 'Header style: default or primary.',
  buttonAlignment: 'Alignment of footer buttons (left or right).',
  showAddTab: 'When true, an “add tab” control is shown.',
  addTabLabel: 'Accessible label for the add-tab button.',
  legend: 'Legend text for a fieldset (e.g. radio group).',
  warning: 'When true, shows warning state or message.',
  helper: 'Helper text below the label.',
  htmlFor: 'ID of the associated form control.',
  external: 'When true, link opens in a new tab with rel.',
  muted: 'When true, link uses muted styling.',
  striped: 'When true, table rows are striped.',
  titleBarContent: 'Content for the table title bar.',
  as: 'Element or component to render as (e.g. div, nav).',
  onItemClick: 'Callback when a menu item is clicked.',
  onStepClick: 'Callback when a stepper step is clicked.',
  onDateSelect: 'Callback when a date is selected.',
  triggerId: 'ID of the element that triggers the popover.',
  border: 'When true, the badge has a border.',
  locale: 'Locale for date/time formatting.',
  showDefaultButtons: 'When true, default page header buttons are shown.',
  pageHeaderPrimaryButton: 'Primary button config for the shell page header.',
  pageHeaderOutlineButton1: 'First outline button config for the page header.',
  pageHeaderOutlineButton2: 'Second outline button config for the page header.',
  pageHeaderOutlineButton3: 'Third outline button config for the page header.',
  companyColor: 'Color used for the company picker.',
  companies: 'List of companies for the company picker.',
  showExecute: 'When true, the execute action is shown in floating nav.',
  saveDisabled: 'When true, the save action is disabled.',
  actions: 'Custom action configs for the floating nav.',
  interactive: 'When true, the card has hover/click styling.',
  elevated: 'When true, the card has elevation shadow.',
  primary: 'When true, uses primary theme styling.',
  withHeader: 'When true, the card shows a header area.',
  linkText: 'Text for an optional link in the alert.',
  linkHref: 'URL for the optional link in the alert.',
  overflowCount: 'Max count before showing overflow (e.g. 99+).',
  state: 'Chip state (e.g. default, success).',
  titleBarContent: 'Content for the table title bar.',
}

function extractTypeAliases(content) {
  const aliases = new Map()
  const withSemicolon = /export\s+type\s+(\w+)\s*=\s*([^;]+);/g
  let m
  while ((m = withSemicolon.exec(content)) !== null) {
    let rhs = m[2].trim().replace(/\s+/g, ' ').replace(/\s*;\s*$/, '').replace(/^\s*\|\s*/, '').trim()
    if (rhs) aliases.set(m[1], rhs)
  }
  const singleLineNoSemicolon = /export\s+type\s+(\w+)\s*=\s*(.+?)\s*$/gm
  while ((m = singleLineNoSemicolon.exec(content)) !== null) {
    const name = m[1]
    if (aliases.has(name)) continue
    let rhs = m[2].trim().replace(/\s+/g, ' ').replace(/^\s*\|\s*/, '').trim()
    if (rhs && (rhs.includes("'") || rhs.includes('|')) && !rhs.includes('Record<') && !rhs.includes('const ')) aliases.set(name, rhs)
  }
  const multilineRe = /export\s+type\s+(\w+)\s*=\s*([\s\S]*?)(?=\n\s*export\s+|\n\s*$)/g
  while ((m = multilineRe.exec(content)) !== null) {
    const name = m[1]
    if (aliases.has(name)) continue
    let rhs = m[2].trim().replace(/\s+/g, ' ').replace(/\s*;\s*$/, '').replace(/^\s*\|\s*/, '').trim()
    if (rhs && (rhs.includes("'") || rhs.includes('|')) && !rhs.includes('Record<') && !rhs.includes('const ')) aliases.set(name, rhs)
  }
  return aliases
}

function expandType(typeStr, typeAliases) {
  const t = typeStr.trim()
  const single = /^(\w+)(\s*\|.*)?$/
  const m = t.match(single)
  if (m) {
    const base = m[1]
    const rest = m[2] ? m[2].trim() : ''
    if (typeAliases.has(base)) {
      const expanded = typeAliases.get(base)
      return rest ? `(${expanded}) ${rest}` : expanded
    }
  }
  return t
}

function getVariantOrSizeDescription(propName, propType, componentName, typeAliases) {
  const expanded = expandType(propType, typeAliases || new Map())
  const valueSet = new Set()
  const re = /'([^']+)'|"([^"]+)"/g
  let m
  while ((m = re.exec(expanded)) !== null) valueSet.add(m[1] || m[2])
  const values = [...valueSet]
  const map = propName === 'variant' ? VARIANT_DESCRIPTIONS[componentName] : SIZE_DESCRIPTIONS[componentName]
  if (!map || !values.length) return null
  const parts = values.map(v => map[v] ? `${v}: ${map[v]}` : v).filter(Boolean)
  return parts.length ? parts.join('; ') : null
}

function getPropDescription(propName, propType, componentName, typeAliases) {
  if (componentName === 'Chip' && propName === 'type') return 'Display type: chip, horiz-dots, vert-dots, or overflow.'
  if (propName === 'variant' || propName === 'size') {
    const specific = getVariantOrSizeDescription(propName, propType, componentName, typeAliases)
    if (specific) return specific
  }
  const key = propName in PROP_DESCRIPTIONS ? propName : null
  if (key && PROP_DESCRIPTIONS[key] != null) return PROP_DESCRIPTIONS[key]
  if (propName.endsWith('Button') || propName.endsWith('Buttons')) return 'Button configuration (text, href or onClick).'
  if (propName.endsWith('Config')) return 'Configuration object for this option.'
  if (propName.startsWith('on')) return `Callback when ${propName.replace(/^on([A-Z])/, (_, c) => c.toLowerCase())} occurs.`
  if (propType.includes('ReactNode') || propType.includes('React.ReactNode')) return 'Content to render (React node).'
  if (propType.includes('[]')) return 'Array of items.'
  if (propType.includes('boolean')) return 'When true, enables the option.'
  if (propType.includes('string')) return 'String value.'
  if (propType.includes('number')) return 'Numeric value.'
  if (propName === 'variant') return 'Visual style variant.'
  if (propName === 'size') return 'Size preset.'
  return 'See type.'
}

function extractPropsInterface(content, componentName) {
  const propsName = `${componentName}Props`
  const startRe = new RegExp(`export\\s+(?:interface|type)\\s+${propsName}\\s*(?:extends[^{]+)?\\{\\s*`)
  const startMatch = content.match(startRe)
  if (!startMatch) return []
  const startIdx = content.indexOf(startMatch[0]) + startMatch[0].length
  let depth = 1
  let endIdx = startIdx
  for (let i = startIdx; i < content.length && depth > 0; i++) {
    if (content[i] === '{') depth++
    else if (content[i] === '}') { depth--; if (depth === 0) endIdx = i; }
  }
  const body = content.slice(startIdx, endIdx)
  const lines = body.split('\n')
  const props = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('/**') || trimmed.startsWith('*') || trimmed.startsWith('//')) continue
    const propMatch = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)(?:\s*;|\s*$)/)
    if (propMatch) {
      const [, name, optional, type] = propMatch
      let typeStr = type.trim()
      if (typeStr.endsWith(';')) typeStr = typeStr.slice(0, -1)
      const descMatch = line.match(/\/\*\*\s*@param\s+\{\s*\w+\s\}\s+(\w+)\s+([^*]+)\*\//) || line.match(/\/\*\*\s*([^*]+)\*\//)
      props.push({
        name,
        type: typeStr,
        optional: optional === '?',
        description: descMatch ? (descMatch[2] || descMatch[1])?.trim() : ''
      })
    }
  }
  return props
}

function extractDefaults(content, componentName) {
  const re = new RegExp(`export\\s+function\\s+${componentName}\\s*\\(\\s*\\{([^]*?)\\}\\s*:\\s*\\w+Props\\s*\\)`, 'm')
  const match = content.match(re)
  if (!match) return {}
  const destructure = match[1]
  const defaults = {}
  const propRe = /(\w+)\s*=\s*([^,}\n]+)/g
  let m
  while ((m = propRe.exec(destructure)) !== null) {
    defaults[m[1].trim()] = m[2].trim().replace(/\s+/g, ' ')
  }
  return defaults
}

function extractLocalImports(content) {
  const imports = []
  const re = /from\s+['"]\.\/([^'"]+)['"]/g
  let m
  while ((m = re.exec(content)) !== null) {
    const name = path.basename(m[1], path.extname(m[1]))
    if (name !== 'index' && !imports.includes(name)) imports.push(name)
  }
  return imports
}

function extractBemClasses(content) {
  const classes = []
  const clsxMatch = content.match(/clsx\s*\(\s*['"]([^'"]+)['"]/)
  if (clsxMatch) classes.push(clsxMatch[1])
  const modifierRe = /['"]([\w-]+--[\w-]+)['"]/g
  let m
  while ((m = modifierRe.exec(content)) !== null) {
    if (!classes.includes(m[1])) classes.push(m[1])
  }
  return classes
}

function getBemModifierClasses(content, componentName, props, typeAliases) {
  const baseMatch = content.match(/clsx\s*\(\s*['"]([^'"]+)['"]/)
  const base = baseMatch ? baseMatch[1] : ''
  if (!base) return []
  const modifierClasses = []
  const templateRe = /`([a-z][a-z0-9-]*)--\$\{(\w+)\}`/g
  const propNames = new Set(props.map(p => p.name))
  let m
  while ((m = templateRe.exec(content)) !== null) {
    const blockBase = m[1]
    const propName = m[2]
    if (blockBase !== base || !propNames.has(propName)) continue
    const prop = props.find(p => p.name === propName)
    if (!prop) continue
    const expanded = expandType(prop.type, typeAliases || new Map())
    const valueRe = /'([^']+)'|"([^"]+)"/g
    let vm
    while ((vm = valueRe.exec(expanded)) !== null) {
      const val = vm[1] || vm[2]
      modifierClasses.push(`${blockBase}--${val}`)
    }
  }
  const conditionalRe = new RegExp(`(\\w+)\\s*===\\s*['"]([^'"]+)['"]\\s*&&\\s*['"\`](${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}--[^'"\`]+)['"\`]`, 'g')
  while ((m = conditionalRe.exec(content)) !== null) {
    const val = m[2]
    const cls = m[3].startsWith(base + '--') ? m[3] : base + '--' + val
    if (!modifierClasses.includes(cls)) modifierClasses.push(cls)
  }
  return [...new Set(modifierClasses)]
}

function inferDescription(componentName, props, dependencies) {
  const slots = props.filter(p => p.type.includes('ReactNode') || p.name === 'children').map(p => p.name)
  const variantProp = props.find(p => p.name === 'variant')
  const sizeProp = props.find(p => p.name === 'size')
  const variantStr = variantProp?.type ? ` Variants: ${variantProp.type}.` : ''
  const sizeStr = sizeProp?.type ? ` Sizes: ${sizeProp.type}.` : ''
  const slotStr = slots.length ? ` Accepts: ${slots.join(', ')}.` : ''
  return `${componentName} component from Harmony design system.${variantStr}${sizeStr}${slotStr}`.trim()
}

function oneLineDescription(componentName, props) {
  const desc = COMPONENT_DESCRIPTIONS[componentName]
  if (desc) return desc
  const variantProp = props.find(p => p.name === 'variant')
  const sizeProp = props.find(p => p.name === 'size')
  const parts = []
  if (variantProp?.type) parts.push(`variants ${variantProp.type.replace(/\s*\|\s*/g, ', ')}`)
  if (sizeProp?.type) parts.push(`sizes ${sizeProp.type.replace(/\s*\|\s*/g, ', ')}`)
  const rest = props.filter(p => !['variant', 'size', 'className', 'children'].includes(p.name)).slice(0, 3).map(p => p.name)
  if (rest.length) parts.push(rest.join(', '))
  return parts.join('; ') || 'UI component.'
}

function firstUnionValue(typeStr, typeAliases) {
  const expanded = expandType(typeStr, typeAliases)
  const match = expanded.match(/'([^']+)'|"([^"]+)"/)
  return match ? (match[1] || match[2]) : null
}

function buildUsageExample(meta, importPath) {
  const { componentName, props, defaults, typeAliases } = meta
  const variantProp = props.find(p => p.name === 'variant')
  const sizeProp = props.find(p => p.name === 'size')
  const hasChildren = props.some(p => p.name === 'children')
  const firstVariant = variantProp ? firstUnionValue(variantProp.type, typeAliases) : null
  const firstSize = sizeProp ? firstUnionValue(sizeProp.type, typeAliases) : null
  const lines = []
  lines.push(`import { ${componentName} } from '${importPath}';`)
  lines.push('')
  const attrs = []
  if (componentName === 'Accordion') {
    attrs.push('items={[{ title: "Section 1", content: "Content here" }, { title: "Section 2", content: "More content" }]}')
    lines.push('<Accordion ' + attrs.join(' ') + ' />')
  } else if (componentName === 'Alert') {
    if (firstVariant) attrs.push(`variant="${firstVariant}"`)
    attrs.push('title="Note"')
    lines.push('<Alert ' + attrs.join(' ') + '>Message text</Alert>')
  } else if (componentName === 'Chip') {
    attrs.push('variant="fill"', 'label="Design"')
    lines.push('<Chip ' + attrs.join(' ') + ' />')
  } else if (componentName === 'Badge') {
    if (firstVariant) attrs.push(`variant="${firstVariant}"`)
    lines.push('<Badge ' + (attrs.length ? attrs.join(' ') + ' ' : '') + '>3</Badge>')
  } else if (componentName === 'Button' || (hasChildren && (variantProp || sizeProp))) {
    if (firstVariant) attrs.push(`variant="${firstVariant}"`)
    if (firstSize) attrs.push(`size="${firstSize}"`)
    const attrStr = attrs.length ? ' ' + attrs.join(' ') : ''
    lines.push(`<${componentName}${attrStr}>Save</${componentName}>`)
  } else if (componentName === 'Card') {
    attrs.push('headerTitle="Card title"', 'headerSubtitle="Optional subtitle"')
    lines.push(`<Card ${attrs.join(' ')}>`)
    lines.push('  Card body content.')
    lines.push('</Card>')
  } else if (componentName === 'Dialog') {
    attrs.push('id="my-dialog"', 'title="Dialog title"', 'open={isOpen}', 'onClose={() => setIsOpen(false)}')
    lines.push(`<Dialog ${attrs.join(' ')}>`)
    lines.push('  Dialog body content.')
    lines.push('</Dialog>')
  } else if (componentName === 'Input') {
    attrs.push('label="Name"', 'placeholder="Enter your name"')
    lines.push(`<Input ${attrs.join(' ')} />`)
  } else if (componentName === 'ShellLayout') {
    attrs.push('pageHeaderTitle="Page title"', 'pageHeaderSubtitle="Optional subtitle"')
    lines.push(`<ShellLayout ${attrs.join(' ')}>`)
    lines.push('  Main content here.')
    lines.push('</ShellLayout>')
  } else if (componentName === 'ShellPageHeader') {
    attrs.push('title="Page title"', 'subtitle="Optional subtitle"')
    lines.push(`<ShellPageHeader ${attrs.join(' ')} />`)
  } else if (componentName === 'Stepper') {
    attrs.push('activeStep={0}', 'steps={[{ label: "Step 1" }, { label: "Step 2" }, { label: "Step 3" }]}')
    lines.push(`<Stepper ${attrs.join(' ')} />`)
  } else if (componentName === 'TabStrip') {
    attrs.push('tabs={[{ id: "t1", label: "Tab 1", active: true }, { id: "t2", label: "Tab 2" }]}')
    lines.push(`<TabStrip ${attrs.join(' ')} />`)
  } else if (componentName === 'Dropdown') {
    attrs.push('options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]}', 'placeholder="Select..."')
    lines.push(`<Dropdown ${attrs.join(' ')} />`)
  } else if (componentName === 'DatePicker' || componentName === 'MonthPicker' || componentName === 'WeekPicker' || componentName === 'TimePicker' || componentName === 'DateTimePicker') {
    attrs.push('value="2024-01-15"', 'onDateSelect={(date) => setValue(date)}')
    lines.push(`<${componentName} ${attrs.join(' ')} />`)
  } else if (props.some(p => ['title', 'label', 'text'].includes(p.name))) {
    const p = props.find(r => ['title', 'label', 'text'].includes(r.name))
    const val = firstVariant ? `variant="${firstVariant}" ${p.name}="Example"` : `${p.name}="Example"`
    lines.push(`<${componentName} ${val} />`)
  } else if (firstVariant || firstSize) {
    if (firstVariant) attrs.push(`variant="${firstVariant}"`)
    if (firstSize) attrs.push(`size="${firstSize}"`)
    const req = props.filter(r => !r.optional && r.name !== 'children')
    req.slice(0, 2).forEach(r => { attrs.push(`${r.name}={...}`) })
    lines.push(`<${componentName} ${attrs.join(' ')} />`)
  } else {
    const req = props.filter(r => !r.optional && r.name !== 'children')
    if (req.length) req.slice(0, 3).forEach(r => { attrs.push(`${r.name}={...}`) })
    lines.push(attrs.length ? `<${componentName} ${attrs.join(' ')} />` : `<${componentName} />`)
  }
  return lines
}

function formatTypeForTable(type) {
  return type.replace(/\|/g, ' \\| ').replace(/\s+/g, ' ')
}

function scanComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const componentName = path.basename(filePath, '.tsx')
  const props = extractPropsInterface(content, componentName)
  const defaults = extractDefaults(content, componentName)
  const dependencies = extractLocalImports(content)
  const bemClasses = extractBemClasses(content)
  const typeAliases = extractTypeAliases(content)
  const bemModifierClasses = getBemModifierClasses(content, componentName, props, typeAliases)
  const description = COMPONENT_DESCRIPTIONS[componentName] || inferDescription(componentName, props, dependencies)
  const oneLiner = oneLineDescription(componentName, props)
  return {
    componentName,
    props,
    defaults,
    dependencies,
    bemClasses,
    bemModifierClasses,
    typeAliases,
    description,
    oneLiner
  }
}

function generateComponentMarkdown(meta, importPath) {
  const { componentName, props, defaults, dependencies, bemClasses, bemModifierClasses = [], description, typeAliases } = meta
  const variantProp = props.find(p => p.name === 'variant')
  const sizeProp = props.find(p => p.name === 'size')
  const lines = []
  lines.push(`# ${componentName}`)
  lines.push('')
  lines.push(description)
  lines.push('')
  lines.push('## Props')
  lines.push('')
  lines.push('| Prop | Type | Default | Description |')
  lines.push('|------|------|---------|-------------|')
  for (const p of props) {
    const def = defaults[p.name] ?? (p.optional ? '—' : '')
    const displayType = expandType(p.type, typeAliases || new Map())
    const desc = p.description || getPropDescription(p.name, p.type, componentName, typeAliases)
    lines.push(`| ${p.name} | ${formatTypeForTable(displayType)} | ${def} | ${desc} |`)
  }
  lines.push('')
  lines.push('## Usage')
  lines.push('')
  lines.push('```tsx')
  buildUsageExample(meta, importPath).forEach(l => lines.push(l))
  lines.push('```')
  lines.push('')
  if (variantProp || sizeProp) {
    lines.push('## Variants')
    lines.push('')
    const expV = variantProp ? expandType(variantProp.type, typeAliases || new Map()) : ''
    const expS = sizeProp ? expandType(sizeProp.type, typeAliases || new Map()) : ''
    const variantMap = VARIANT_DESCRIPTIONS[componentName]
    const sizeMap = SIZE_DESCRIPTIONS[componentName]
    const seenV = new Set()
    if (variantProp && variantMap) {
      const re = /'([^']+)'|"([^"]+)"/g
      let vm
      while ((vm = re.exec(expV)) !== null) {
        const v = vm[1] || vm[2]
        if (variantMap[v] && !seenV.has(v)) { seenV.add(v); lines.push(`- **${v}**: ${variantMap[v]}`) }
      }
    } else if (variantProp) lines.push(`- **variant**: ${expV}`)
    const seenS = new Set()
    if (sizeProp && sizeMap) {
      const re2 = /'([^']+)'|"([^"]+)"/g
      let sm
      while ((sm = re2.exec(expS)) !== null) {
        const s = sm[1] || sm[2]
        if (sizeMap[s] && !seenS.has(s)) { seenS.add(s); lines.push(`- **${s}**: ${sizeMap[s]}`) }
      }
    } else if (sizeProp) lines.push(`- **size**: ${expS}`)
    lines.push('')
  }
  lines.push('## CSS Classes')
  lines.push('')
  if (bemClasses.length || bemModifierClasses.length) {
    bemClasses.forEach(c => { lines.push(`- \`.${c}\``) })
    bemModifierClasses.forEach(c => { if (!bemClasses.includes(c)) lines.push(`- \`.${c}\``) })
  } else {
    lines.push('- BEM classes from Harmony components.css')
  }
  lines.push('')
  lines.push('## Dependencies')
  lines.push('')
  lines.push(dependencies.length ? dependencies.map(d => `- ${d}`).join('\n') : 'None (standalone component).')
  lines.push('')
  if (THEME_BEHAVIOR[componentName]) {
    lines.push('## Theme Behavior')
    lines.push('')
    lines.push(THEME_BEHAVIOR[componentName])
    lines.push('')
  }
  if (DARK_MODE_NOTES[componentName]) {
    lines.push('## Dark Mode')
    lines.push('')
    lines.push(DARK_MODE_NOTES[componentName])
    lines.push('')
  }
  if (NOT_IMPLEMENTED_PROPS[componentName]) {
    lines.push('## Not Yet Implemented')
    lines.push('')
    lines.push('The following Astro props or slots are not yet available in the React conversion:')
    lines.push('')
    lines.push(NOT_IMPLEMENTED_PROPS[componentName])
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(componentDir)) {
    console.error('Component directory not found:', componentDir)
    process.exit(1)
  }
  const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.tsx')).sort()
  if (files.length === 0) {
    console.error('No converted components found. Run /convert-all React first.')
    process.exit(1)
  }

  const components = files.map(f => scanComponent(path.join(componentDir, f)))
  const importPath = componentDir === path.resolve(rootDir, 'src/components/harmony')
    ? './components/harmony/ComponentName'
    : './components/harmony-react/ComponentName'

  if (dryRun) {
    console.log('Would document', components.length, 'components:', components.map(c => c.componentName).join(', '))
    return
  }

  const llmsDir = path.join(outDir, 'llms')
  if (!fs.existsSync(llmsDir)) fs.mkdirSync(llmsDir, { recursive: true })

  const componentList = components.filter(c => !SHELL_COMPONENTS.has(c.componentName))
  const shellList = components.filter(c => SHELL_COMPONENTS.has(c.componentName))

  const indexLines = []
  indexLines.push('# Harmony React Components')
  indexLines.push('')
  indexLines.push('> Harmony is Deltek\'s design system. This file documents the React component library converted from the Harmony Astro design system. Use these components with Harmony CSS tokens and themes (theme-cp, theme-vp, theme-ppm, theme-maconomy) with light and dark modes.')
  indexLines.push('')
  indexLines.push('Important notes:')
  indexLines.push('- All components use Harmony CSS custom properties (tokens). Do not resolve to hardcoded values.')
  indexLines.push('- All components use BEM class naming. Do not rename classes.')
  indexLines.push('- Themes are applied via HTML class (e.g. `html.theme-cp`). Dark mode via `html.theme-cp dark`.')
  indexLines.push('- CSS import order: reset.css → tokens.css → global.css → components.css.')
  indexLines.push('')
  indexLines.push('## Components')
  indexLines.push('')
  for (const c of componentList) {
    const imp = importPath.replace('ComponentName', c.componentName)
    indexLines.push(`- [${c.componentName}](./llms/${c.componentName}.md): ${c.oneLiner}`)
  }
  indexLines.push('')
  indexLines.push('## Shell Components')
  indexLines.push('')
  for (const c of shellList) {
    indexLines.push(`- [${c.componentName}](./llms/${c.componentName}.md): ${c.oneLiner}`)
  }
  indexLines.push('')
  indexLines.push('## Tokens and Theming')
  indexLines.push('')
  indexLines.push('- [Tokens](./llms/tokens.md): CSS custom properties for spacing, colors, typography, elevation.')
  indexLines.push('- [Themes](./llms/themes.md): Four themes (CP, VP, PPM, Maconomy) with light and dark modes.')
  indexLines.push('')
  indexLines.push('## Optional')
  indexLines.push('')
  indexLines.push('- [Form Controls](./llms/form-controls.md): Input, Textarea, NumberInput, Checkbox, RadioButton, Toggle, DateInput, Label.')
  indexLines.push('- [Pickers](./llms/pickers.md): DatePicker, DateTimePicker, MonthPicker, WeekPicker, TimePicker, PickerPopup.')
  indexLines.push('')

  fs.writeFileSync(path.join(outDir, 'llms.txt'), indexLines.join('\n'), 'utf8')

  for (const meta of components) {
    const ip = importPath.replace('ComponentName', meta.componentName)
    const md = generateComponentMarkdown(meta, ip)
    fs.writeFileSync(path.join(llmsDir, `${meta.componentName}.md`), md, 'utf8')
  }

  const tokensMd = `# Tokens

Harmony uses CSS custom properties (design tokens) for spacing, colors, typography, and elevation. Token definitions live in the \`@deltek/harmony-components\` package under \`src/tokens/\` (e.g. \`colors.json\`, \`spacing.json\`, \`typography.json\`, \`elevations.json\`).

Do not resolve tokens to hardcoded values in component code; use the custom properties so themes and dark mode apply correctly.
`
  const themesMd = `# Themes

Four product themes: **CP** (theme-cp), **VP** (theme-vp), **PPM** (theme-ppm), **Maconomy** (theme-maconomy). Each supports light and dark mode.

Apply the theme on the root element, e.g. \`<html class="theme-cp">\` for light or \`<html class="theme-cp dark">\` for dark. Components consume tokens that resolve per theme and mode.
`
  fs.writeFileSync(path.join(llmsDir, 'tokens.md'), tokensMd, 'utf8')
  fs.writeFileSync(path.join(llmsDir, 'themes.md'), themesMd, 'utf8')

  const formControlsMd = `# Form Controls

Form-related Harmony React components: Input, Textarea, NumberInput, Checkbox, RadioButton, Toggle, DateInput, Label. See individual component docs in this folder.
`
  const pickersMd = `# Pickers

Date/time picker components: DatePicker, DateTimePicker, MonthPicker, WeekPicker, TimePicker, PickerPopup. See individual component docs in this folder.
`
  fs.writeFileSync(path.join(llmsDir, 'form-controls.md'), formControlsMd, 'utf8')
  fs.writeFileSync(path.join(llmsDir, 'pickers.md'), pickersMd, 'utf8')

  const fullLines = []
  fullLines.push('# Harmony React Components — Full Documentation')
  fullLines.push('')
  fullLines.push('> Complete API reference for all Harmony React components.')
  fullLines.push('')
  for (const meta of components) {
    const ip = importPath.replace('ComponentName', meta.componentName)
    fullLines.push(`<component name="${meta.componentName}">`)
    fullLines.push(generateComponentMarkdown(meta, ip))
    fullLines.push('</component>')
    fullLines.push('')
  }
  fullLines.push('<component name="tokens">')
  fullLines.push(tokensMd)
  fullLines.push('</component>')
  fullLines.push('')
  fullLines.push('<component name="themes">')
  fullLines.push(themesMd)
  fullLines.push('</component>')
  fs.writeFileSync(path.join(outDir, 'llms-full.txt'), fullLines.join('\n'), 'utf8')

  console.log('Generated:')
  console.log('  llms.txt')
  console.log('  llms-full.txt')
  console.log('  llms/' + components.length + ' component files + tokens.md, themes.md, form-controls.md, pickers.md')
  console.log('Total components documented:', components.length)
  console.log('Components with Astro doc enrichment: none — Astro docs not available.')
  console.log('Review the generated files. Re-run with node scripts/generate-llms-txt.mjs after converting new components or updating existing ones.')
}

main()
