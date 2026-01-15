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
    title: 'Changelog',
    items: [
      { title: 'Changelog', href: '/changelog', icon: 'clock' },
    ],
  },
  {
    title: 'Foundation',
    items: [
      { title: 'Colors', href: '/foundation/colors', icon: 'swatch' },
      { title: 'Typography', href: '/foundation/typography', icon: 'document-text' },
      { title: 'Spacing', href: '/foundation/spacing', icon: 'arrows-pointing-out' },
      { title: 'Elevations', href: '/foundation/elevations', icon: 'squares-2x2' },
    ],
  },
  {
    title: 'Shell Layout',
    items: [
      { title: 'Shell Layout', href: '/shell/layout', icon: 'view-columns' },
      { title: 'Shell Header', href: '/shell/header', icon: 'bars-3' },
      { title: 'Shell Footer', href: '/shell/footer', icon: 'bars-3-bottom-left' },
      { title: 'Page Header', href: '/shell/page-header', icon: 'document-text' },
      { title: 'Page Content', href: '/shell/page-content', icon: 'document-text' },
      { title: 'Left Sidebar', href: '/shell/left-sidebar', icon: 'bars-3-bottom-left' },
      { title: 'Right Sidebar', href: '/shell/right-sidebar', icon: 'bars-3-bottom-right' },
      { title: 'Shell Panel', href: '/shell/panel', icon: 'window' },
    ],
  },
  {
    title: 'Components',
    items: [
      { title: 'Accordion', href: '/components/accordion', icon: 'chevron-down' },
      { title: 'Alerts', href: '/components/alerts', icon: 'exclamation-circle' },
      { title: 'Badges', href: '/components/badges', icon: 'star' },
      { title: 'Button Groups', href: '/components/button-groups', icon: 'queue-list' },
      { title: 'Buttons', href: '/components/buttons', icon: 'cursor-arrow-ripple' },
      { title: 'Cards', href: '/components/cards', icon: 'squares-2x2' },
      { title: 'Checkbox Groups', href: '/components/checkbox-groups', icon: 'clipboard-document-check' },
      { title: 'Checkboxes', href: '/components/checkboxes', icon: 'check-circle' },
      { title: 'Chips', href: '/components/chips', icon: 'tag' },
      { title: 'Date Picker', href: '/components/date-picker', icon: 'calendar' },
      { title: 'Dialogs', href: '/components/dialogs', icon: 'window' },
      { title: 'Dropdowns', href: '/components/dropdowns', icon: 'chevron-up-down' },
      { title: 'Icons', href: '/components/icons', icon: 'sparkles' },
      { title: 'Inputs', href: '/components/inputs', icon: 'pencil-square' },
      { title: 'Kanban', href: '/components/kanban', icon: 'view-columns' },
      { title: 'Labels', href: '/components/labels', icon: 'tag' },
      { title: 'Links', href: '/components/links', icon: 'link' },
      { title: 'List Menu', href: '/components/list-menu', icon: 'list-bullet' },
      { title: 'Notification Badges', href: '/components/notification-badges', icon: 'bell' },
      { title: 'Progress Bar', href: '/components/progress-bar', icon: 'chart-bar' },
      { title: 'Radio Buttons', href: '/components/radio-buttons', icon: 'stop' },
      { title: 'Radio Groups', href: '/components/radio-groups', icon: 'list-bullet' },
      { title: 'Scrollbar', href: '/components/scrollbar', icon: 'arrows-up-down' },
      { title: 'Specialty Inputs', href: '/components/specialty-inputs', icon: 'hashtag' },
      { title: 'Spinner', href: '/components/spinner', icon: 'arrow-path' },
      { title: 'Stepper', href: '/components/stepper', icon: 'list-bullet' },
      { title: 'Tab Strip', href: '/components/tab-strip', icon: 'rectangle-group' },
      { title: 'Tables', href: '/components/tables', icon: 'table-cells' },
      { title: 'Toggle Switches', href: '/components/toggle-switches', icon: 'arrow-path' },
      { title: 'Tooltips', href: '/components/tooltips', icon: 'chat-bubble-left' },
    ],
  },
];

export const componentCount = navigation.reduce((acc, section) => acc + section.items.length, 0);

