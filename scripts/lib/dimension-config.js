/**
 * Dimension config: which props are "dimensions" (affect look via modifiers) and how they map to CSS.
 * Used for no-inference specs: one spec per combination of dimension values.
 */

/**
 * Parse a type string that is a union of quoted strings (e.g. "'a' | 'b' | 'c'") into an array of values.
 * Also handles a single quoted value. Returns null if the type does not look like string literal(s).
 */
function parseUnionValuesFromType(typeStr) {
  if (!typeStr || typeof typeStr !== 'string') return null;
  const trimmed = typeStr.trim();
  const parts = trimmed.split('|').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
  if (parts.some((p) => p.includes('{') || p.includes('}'))) return null;
  if (parts.length === 1 && parts[0].length >= 0) return parts;
  const allQuoted = parts.every((p) => p.length >= 0 && !p.includes(' '));
  if (!allQuoted) return null;
  return parts;
}

/**
 * Dimension descriptor: how a prop maps to CSS.
 * @typedef {Object} DimensionDescriptor
 * @property {string} prop - Prop name (e.g. 'variant', 'size', 'style')
 * @property {'class'|'classWhen'|'elementClass'} modifierType
 * @property {string} [pattern] - For 'class': e.g. '{prefix}--{value}' or 'tabstrip--{value}'. For 'elementClass': e.g. '.dialog__header--variant-{value}'
 * @property {string} [element] - For 'elementClass': target element selector (e.g. '.dialog__header')
 * @property {Record<string,string>} [valueClass] - For 'classWhen': value -> class (e.g. { pageHeader: 'btn--page-header' })
 */

/**
 * COMPONENT_DIMENSIONS[componentName] = array of dimension descriptors in key order.
 * Key order: variant, style, theme, mode, size, buttonType, headerVariant, width, ...
 * theme and mode are not in this config (they are fixed THEMES × MODES).
 */
export const COMPONENT_DIMENSIONS = {
  Alert: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'style', modifierType: 'class' },
  ],
  Button: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
    { prop: 'buttonType', modifierType: 'classWhen', valueClass: { pageHeader: 'btn--page-header' } },
  ],
  ButtonGroup: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  Dialog: [
    { prop: 'headerVariant', modifierType: 'elementClass', element: '.dialog__header', pattern: '.dialog__header--variant-{value}' },
  ],
  TabStrip: [
    { prop: 'variant', modifierType: 'class', pattern: 'tabstrip--{value}' },
  ],
  ShellFooter: [
    { prop: 'variant', modifierType: 'class', pattern: 'shell-footer--{value}' },
  ],
  ListMenu: [
    { prop: 'variant', modifierType: 'class', pattern: 'list-menu--{value}' },
  ],
  Table: [
    { prop: 'headerVariant', modifierType: 'class', pattern: 'table--header-{value}' },
  ],
  ShellPanel: [
    { prop: 'headerVariant', modifierType: 'elementClass', element: '.shell-panel__header', pattern: '.shell-panel__header--{value}' },
    { prop: 'variant', modifierType: 'class', pattern: 'shell-panel--{value}' },
    { prop: 'width', modifierType: 'class', pattern: 'shell-panel--{value}' },
  ],
  FloatingNav: [
    { prop: 'variant', modifierType: 'class', pattern: 'floating-nav--{value}' },
  ],
  Icon: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  Avatar: [
    { prop: 'size', modifierType: 'class' },
  ],
  Badge: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  Card: [
    { prop: 'variant', modifierType: 'class' },
  ],
  Chip: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  Input: [
    { prop: 'size', modifierType: 'class' },
  ],
  Label: [
    { prop: 'variant', modifierType: 'class' },
  ],
  Link: [
    { prop: 'variant', modifierType: 'class' },
  ],
  ProgressBar: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  RadioButton: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  Spinner: [
    { prop: 'size', modifierType: 'class' },
  ],
  Toggle: [
    { prop: 'variant', modifierType: 'class' },
    { prop: 'size', modifierType: 'class' },
  ],
  LeftSidebar: [
    { prop: 'variant', modifierType: 'class', pattern: 'left-sidebar--{value}' },
  ],
  RightSidebar: [
    { prop: 'variant', modifierType: 'class', pattern: 'right-sidebar--{value}' },
  ],
};

/** Canonical order of dimension names for spec key (theme and mode are inserted at fixed positions). */
export const DIMENSION_KEY_ORDER = [
  'variant',
  'style',
  'theme',
  'mode',
  'size',
  'buttonType',
  'headerVariant',
  'width',
];

/**
 * Get dimension values for a component from parsed Props.
 * Returns { [propName]: string[] } for each dimension in config that has a union-of-string type in parsedProps.
 */
export function getDimensionValuesForComponent(componentName, parsedProps) {
  const descriptors = COMPONENT_DIMENSIONS[componentName];
  if (!descriptors || !parsedProps) return {};

  const out = {};
  for (const d of descriptors) {
    const typeStr = parsedProps[d.prop]?.type;
    const values = parseUnionValuesFromType(typeStr);
    if (values && values.length > 0) {
      out[d.prop] = values;
    }
  }
  return out;
}
