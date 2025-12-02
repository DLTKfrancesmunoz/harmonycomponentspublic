export interface NavItem {
  title: string;
  href: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: 'Foundation',
    items: [
      { title: 'Colors', href: '/foundation/colors', icon: 'ti-palette' },
      { title: 'Typography', href: '/foundation/typography', icon: 'ti-typography' },
      { title: 'Spacing', href: '/foundation/spacing', icon: 'ti-dimensions' },
      { title: 'Elevations', href: '/foundation/elevations', icon: 'ti-stack' },
    ],
  },
  {
    title: 'Shell Layout',
    items: [
      { title: 'Shell Layout', href: '/shell/layout', icon: 'ti-layout-2' },
      { title: 'Shell Header', href: '/shell/header', icon: 'ti-layout-navbar' },
      { title: 'Shell Footer', href: '/shell/footer', icon: 'ti-layout-bottombar' },
      { title: 'Page Content', href: '/shell/page-content', icon: 'ti-file-text' },
      { title: 'Left Sidebar', href: '/shell/left-sidebar', icon: 'ti-layout-sidebar' },
      { title: 'Right Sidebar', href: '/shell/right-sidebar', icon: 'ti-layout-sidebar-right' },
    ],
  },
  {
    title: 'Components',
    items: [
      { title: 'Accordion', href: '/components/accordion', icon: 'ti-chevron-down' },
      { title: 'Alerts', href: '/components/alerts', icon: 'ti-alert-circle' },
      { title: 'Badges', href: '/components/badges', icon: 'ti-badge' },
      { title: 'Buttons', href: '/components/buttons', icon: 'ti-hand-click' },
      { title: 'Button Groups', href: '/components/button-groups', icon: 'ti-layout-distribute-horizontal' },
      { title: 'Cards', href: '/components/cards', icon: 'ti-layout-cards' },
      { title: 'Checkboxes', href: '/components/checkboxes', icon: 'ti-checkbox' },
      { title: 'Checkbox Groups', href: '/components/checkbox-groups', icon: 'ti-list-check' },
      { title: 'Chips', href: '/components/chips', icon: 'ti-tag' },
      { title: 'Dialogs', href: '/components/dialogs', icon: 'ti-layout' },
      { title: 'Dropdowns', href: '/components/dropdowns', icon: 'ti-select' },
      { title: 'Date Picker', href: '/components/date-picker', icon: 'ti-calendar' },
      { title: 'Inputs', href: '/components/inputs', icon: 'ti-forms' },
      { title: 'Labels', href: '/components/labels', icon: 'ti-text' },
      { title: 'Links', href: '/components/links', icon: 'ti-link' },
      { title: 'List Menu', href: '/components/list-menu', icon: 'ti-list' },
      { title: 'Progress Bar', href: '/components/progress-bar', icon: 'ti-progress' },
      { title: 'Radio Buttons', href: '/components/radio-buttons', icon: 'ti-circle-dot' },
      { title: 'Radio Groups', href: '/components/radio-groups', icon: 'ti-layout-list' },
      { title: 'Scrollbar', href: '/components/scrollbar', icon: 'ti-arrows-vertical' },
      { title: 'Specialty Inputs', href: '/components/specialty-inputs', icon: 'ti-hash' },
      { title: 'Spinner', href: '/components/spinner', icon: 'ti-loader' },
      { title: 'Tab Strip', href: '/components/tab-strip', icon: 'ti-layout-navbar' },
      { title: 'Toggle Switches', href: '/components/toggle-switches', icon: 'ti-toggle-left' },
      { title: 'Tooltips', href: '/components/tooltips', icon: 'ti-message-circle' },
    ],
  },
];

export const componentCount = navigation.reduce((acc, section) => acc + section.items.length, 0);

