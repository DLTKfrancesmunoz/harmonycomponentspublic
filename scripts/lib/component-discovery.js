/**
 * Component discovery: extract props (sizes, variants) from .astro files
 * and CSS variables from components.css. Build full spec key matrix.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { selectorFromAstNode } from '../astro-parser.js';
import { COMPONENT_DIMENSIONS, DIMENSION_KEY_ORDER, getDimensionValuesForComponent } from './dimension-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

const THEMES = ['cp', 'vp', 'ppm', 'maconomy'];
const MODES = ['light', 'dark'];

/** Component name -> CSS root class (when different from slug). */
const COMPONENT_CSS_PREFIX = {
  Button: 'btn',
  ButtonGroup: 'btn-group',
  DateTimePicker: 'datetime-picker',
  ProgressBar: 'progress',
  RadioButton: 'radio',
  Stepper: 'step',
  TabStrip: 'tabstrip',
  ShellHeader: 'header',
};

/** Components with structure in .astro or layout.css only, or no __ in CSS: return multi-element fallback. */
const HARDCODED_STRUCTURE = {
  Alert: {
    elements: [
      { selector: '.alert', tag: 'div', styles: {}, children: ['.alert__icon', '.alert__content', '.alert__close', '.alert__actions', '.alert__progress'] },
      { selector: '.alert__icon', tag: 'span', styles: {}, parent: '.alert' },
      { selector: '.alert__content', tag: 'div', styles: {}, parent: '.alert', children: ['.alert__title', '.alert__message'] },
      { selector: '.alert__title', tag: 'div', styles: {}, parent: '.alert__content' },
      { selector: '.alert__message', tag: 'div', styles: {}, parent: '.alert__content' },
      { selector: '.alert__close', tag: 'button', styles: {}, parent: '.alert' },
      { selector: '.alert__actions', tag: 'div', styles: {}, parent: '.alert', children: ['.alert__buttons', '.alert__link'] },
      { selector: '.alert__buttons', tag: 'div', styles: {}, parent: '.alert__actions' },
      { selector: '.alert__link', tag: 'a', styles: {}, parent: '.alert__actions' },
      { selector: '.alert__progress', tag: 'div', styles: {}, parent: '.alert' },
    ],
    modifiers: [],
  },
  Accordion: {
    elements: [
      { selector: '.accordion', tag: 'div', styles: {}, children: ['.accordion__item'] },
      { selector: '.accordion__item', tag: 'div', styles: {}, parent: '.accordion', children: ['.accordion__trigger', '.accordion__content'] },
      { selector: '.accordion__trigger', tag: 'button', styles: {}, parent: '.accordion__item', children: ['.accordion__icon'] },
      { selector: '.accordion__icon', tag: 'span', styles: {}, parent: '.accordion__trigger' },
      { selector: '.accordion__content', tag: 'div', styles: {}, parent: '.accordion__item' },
    ],
    modifiers: [],
  },
  Badge: {
    elements: [
      { selector: '.badge', tag: 'span', styles: {} },
    ],
    modifiers: [],
  },
  ButtonGroup: {
    elements: [
      { selector: '.btn-group', tag: 'div', styles: {} },
    ],
    modifiers: [],
  },
  Dialog: {
    elements: [
      { selector: '.dialog-overlay', tag: 'div', styles: {}, children: ['.dialog'] },
      { selector: '.dialog', tag: 'div', styles: {}, parent: '.dialog-overlay', children: ['.dialog__header', '.dialog__body', '.dialog__footer'] },
      { selector: '.dialog__header', tag: 'div', styles: {}, parent: '.dialog', children: ['.dialog__title', '.dialog__close'] },
      { selector: '.dialog__title', tag: 'h2', styles: {}, parent: '.dialog__header' },
      { selector: '.dialog__close', tag: 'button', styles: {}, parent: '.dialog__header' },
      { selector: '.dialog__body', tag: 'div', styles: {}, parent: '.dialog' },
      { selector: '.dialog__footer', tag: 'div', styles: {}, parent: '.dialog' },
    ],
    modifiers: [],
  },
  Dropdown: {
    elements: [
      { selector: '.dropdown-wrapper', tag: 'div', styles: {}, children: ['.dropdown-wrapper__label', '.dropdown'] },
      { selector: '.dropdown-wrapper__label', tag: 'label', styles: {}, parent: '.dropdown-wrapper' },
      { selector: '.dropdown', tag: 'div', styles: {}, parent: '.dropdown-wrapper', children: ['.dropdown__trigger', '.dropdown__menu'] },
      { selector: '.dropdown__trigger', tag: 'button', styles: {}, parent: '.dropdown', children: ['.dropdown__value', '.dropdown__chevron'] },
      { selector: '.dropdown__value', tag: 'span', styles: {}, parent: '.dropdown__trigger' },
      { selector: '.dropdown__chevron', tag: 'span', styles: {}, parent: '.dropdown__trigger' },
      { selector: '.dropdown__menu', tag: 'div', styles: {}, parent: '.dropdown', children: ['.dropdown__item'] },
      { selector: '.dropdown__item', tag: 'div', styles: {}, parent: '.dropdown__menu' },
    ],
    modifiers: [],
  },
  Icon: {
    elements: [
      { selector: '.icon', tag: 'span', styles: {}, children: ['.icon__svg'] },
      { selector: '.icon__svg', tag: 'svg', styles: {}, parent: '.icon' },
    ],
    modifiers: [],
  },
  Input: {
    elements: [
      { selector: '.input-form-wrapper', tag: 'div', styles: {}, children: ['.input-form-wrapper__label', '.input-wrapper'] },
      { selector: '.input-form-wrapper__label', tag: 'label', styles: {}, parent: '.input-form-wrapper' },
      { selector: '.input-wrapper', tag: 'div', styles: {}, parent: '.input-form-wrapper', children: ['.input-wrapper__icon', '.input', '.input-wrapper__error'] },
      { selector: '.input-wrapper__icon', tag: 'span', styles: {}, parent: '.input-wrapper' },
      { selector: '.input', tag: 'input', styles: {}, parent: '.input-wrapper' },
      { selector: '.input-wrapper__error', tag: 'p', styles: {}, parent: '.input-wrapper' },
    ],
    modifiers: [],
  },
  Kanban: {
    elements: [
      { selector: '.kanban__container', tag: 'div', styles: {}, children: ['.kanban__title-bar', '.kanban__action-bar', '.kanban__columns-wrapper'] },
      { selector: '.kanban__title-bar', tag: 'div', styles: {}, parent: '.kanban__container', children: ['.kanban__title-bar-content', '.kanban__title-bar-actions'] },
      { selector: '.kanban__title-bar-content', tag: 'div', styles: {}, parent: '.kanban__title-bar' },
      { selector: '.kanban__title', tag: 'h1', styles: {}, parent: '.kanban__title-bar-content' },
      { selector: '.kanban__title-bar-actions', tag: 'div', styles: {}, parent: '.kanban__title-bar' },
      { selector: '.kanban__title-bar-icon', tag: 'button', styles: {}, parent: '.kanban__title-bar-actions' },
      { selector: '.kanban__action-bar', tag: 'div', styles: {}, parent: '.kanban__container', children: ['.kanban__action-items'] },
      { selector: '.kanban__action-items', tag: 'div', styles: {}, parent: '.kanban__action-bar' },
      { selector: '.kanban__action-button', tag: 'button', styles: {}, parent: '.kanban__action-items' },
      { selector: '.kanban__action-divider', tag: 'span', styles: {}, parent: '.kanban__action-items' },
      { selector: '.kanban__action-label', tag: 'span', styles: {}, parent: '.kanban__action-items' },
      { selector: '.kanban__action-text-button', tag: 'button', styles: {}, parent: '.kanban__action-items' },
      { selector: '.kanban__columns-wrapper', tag: 'section', styles: {}, parent: '.kanban__container' },
    ],
    modifiers: [],
  },
  LeftSidebar: {
    elements: [
      { selector: '.left-sidebar', tag: 'nav', styles: {}, children: ['.left-sidebar__section'] },
      { selector: '.left-sidebar__section', tag: 'div', styles: {}, parent: '.left-sidebar', children: ['.left-sidebar__item'] },
      { selector: '.left-sidebar__item', tag: 'a', styles: {}, parent: '.left-sidebar__section', children: ['.left-sidebar__icon', '.left-sidebar__label'] },
      { selector: '.left-sidebar__icon', tag: 'span', styles: {}, parent: '.left-sidebar__item' },
      { selector: '.left-sidebar__custom-icon', tag: 'img', styles: {}, parent: '.left-sidebar__item' },
      { selector: '.left-sidebar__label', tag: 'span', styles: {}, parent: '.left-sidebar__item' },
      { selector: '.left-sidebar__item-tooltip', tag: 'span', styles: {}, parent: '.left-sidebar__item' },
    ],
    modifiers: [],
  },
  Link: {
    elements: [
      { selector: '.link', tag: 'a', styles: {}, children: ['.link__text'] },
      { selector: '.link__text', tag: 'span', styles: {}, parent: '.link' },
    ],
    modifiers: [],
  },
  NotificationBadge: {
    elements: [
      { selector: '.notification-badge', tag: 'span', styles: {}, children: ['.notification-badge__content'] },
      { selector: '.notification-badge__content', tag: 'span', styles: {}, parent: '.notification-badge' },
    ],
    modifiers: [],
  },
  ShellFooter: {
    elements: [
      { selector: '.shell-footer', tag: 'div', styles: {}, children: ['.shell-footer__tabstrip'] },
      { selector: '.shell-footer__tabstrip', tag: 'div', styles: {}, parent: '.shell-footer' },
    ],
    modifiers: [],
  },
  ShellPageHeader: {
    elements: [
      { selector: '.shell-page-header', tag: 'header', styles: {}, children: ['.shell-page-header__left', '.shell-page-header__actions'] },
      { selector: '.shell-page-header__left', tag: 'div', styles: {}, parent: '.shell-page-header' },
      { selector: '.shell-page-header__title', tag: 'h1', styles: {}, parent: '.shell-page-header' },
      { selector: '.shell-page-header__subtitle', tag: 'p', styles: {}, parent: '.shell-page-header' },
      { selector: '.shell-page-header__actions', tag: 'div', styles: {}, parent: '.shell-page-header' },
    ],
    modifiers: [],
  },
  Spinner: {
    elements: [
      { selector: '.spinner', tag: 'div', styles: {}, children: ['.spinner__content'] },
      { selector: '.spinner__content', tag: 'span', styles: {}, parent: '.spinner' },
    ],
    modifiers: [],
  },
  TabStrip: {
    elements: [
      { selector: '.tabstrip', tag: 'div', styles: {}, children: ['.tabstrip__nav', '.tabstrip__container'] },
      { selector: '.tabstrip__nav', tag: 'nav', styles: {}, parent: '.tabstrip' },
      { selector: '.tabstrip__container', tag: 'div', styles: {}, parent: '.tabstrip', children: ['.tabstrip__tabs'] },
      { selector: '.tabstrip__tabs', tag: 'div', styles: {}, parent: '.tabstrip__container' },
    ],
    modifiers: [],
  },
  ListMenu: {
    elements: [
      { selector: '.list-menu', tag: 'div', styles: {}, children: ['.list-menu__item'] },
      { selector: '.list-menu__item', tag: 'button', styles: {}, parent: '.list-menu', children: ['.list-menu__item-icon', '.list-menu__custom-icon'] },
      { selector: '.list-menu__item-icon', tag: 'span', styles: {}, parent: '.list-menu__item' },
      { selector: '.list-menu__custom-icon', tag: 'img', styles: {}, parent: '.list-menu__item' },
    ],
    modifiers: [],
  },
  PickerPopup: {
    elements: [
      { selector: '.picker-popup', tag: 'div', styles: {}, children: ['.picker-popup__header', '.picker-popup__body'] },
      { selector: '.picker-popup__header', tag: 'div', styles: {}, parent: '.picker-popup', children: ['.picker-popup__title', '.picker-popup__close'] },
      { selector: '.picker-popup__title', tag: 'h3', styles: {}, parent: '.picker-popup__header' },
      { selector: '.picker-popup__close', tag: 'button', styles: {}, parent: '.picker-popup__header' },
      { selector: '.picker-popup__body', tag: 'div', styles: {}, parent: '.picker-popup' },
    ],
    modifiers: [],
  },
  ShellHeader: {
    elements: [
      { selector: '.header', tag: 'div', styles: {}, children: ['.header__brand', '.header__actions', '.header__gradient'] },
      { selector: '.header__brand', tag: 'div', styles: {}, parent: '.header', children: ['.header__brand-link'] },
      { selector: '.header__brand-link', tag: 'a', styles: {}, parent: '.header__brand', children: ['.header__logo', '.header__title'] },
      { selector: '.header__logo', tag: 'img', styles: {}, parent: '.header__brand-link' },
      { selector: '.header__title', tag: 'span', styles: {}, parent: '.header__brand-link' },
      { selector: '.header__actions', tag: 'div', styles: {}, parent: '.header' },
      { selector: '.header__gradient', tag: 'div', styles: {}, parent: '.header' },
    ],
    modifiers: [],
  },
  ShellPanel: {
    elements: [
      { selector: '.shell-panel', tag: 'div', styles: {}, children: ['.shell-panel__header', '.shell-panel__content'] },
      { selector: '.shell-panel__header', tag: 'div', styles: {}, parent: '.shell-panel', children: ['.shell-panel__header-content'] },
      { selector: '.shell-panel__header-content', tag: 'div', styles: {}, parent: '.shell-panel__header', children: ['.shell-panel__header-icon', '.shell-panel__title', '.shell-panel__actions'] },
      { selector: '.shell-panel__header-icon', tag: 'span', styles: {}, parent: '.shell-panel__header-content' },
      { selector: '.shell-panel__title', tag: 'h2', styles: {}, parent: '.shell-panel__header-content' },
      { selector: '.shell-panel__actions', tag: 'div', styles: {}, parent: '.shell-panel__header-content', children: ['.shell-panel__action'] },
      { selector: '.shell-panel__action', tag: 'button', styles: {}, parent: '.shell-panel__actions' },
      { selector: '.shell-panel__content', tag: 'div', styles: {}, parent: '.shell-panel' },
    ],
    modifiers: [],
  },
  Stepper: {
    elements: [
      { selector: '.stepper', tag: 'div', styles: {}, children: ['.step'] },
      { selector: '.step', tag: 'div', styles: {}, parent: '.stepper', children: ['.step__indicator', '.step__connector', '.step__label'] },
      { selector: '.step__indicator', tag: 'div', styles: {}, parent: '.step', children: ['.step__number', '.step__icon', '.step__check', '.step__error-icon', '.step__warning-icon', '.step__success-icon'] },
      { selector: '.step__number', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__icon', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__check', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__error-icon', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__warning-icon', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__success-icon', tag: 'span', styles: {}, parent: '.step__indicator' },
      { selector: '.step__connector', tag: 'div', styles: {}, parent: '.step' },
      { selector: '.step__label', tag: 'div', styles: {}, parent: '.step', children: ['.step__label-text', '.step__description'] },
      { selector: '.step__label-text', tag: 'span', styles: {}, parent: '.step__label' },
      { selector: '.step__description', tag: 'span', styles: {}, parent: '.step__label' },
    ],
    modifiers: [],
  },
  Table: {
    elements: [
      { selector: '.table-wrapper', tag: 'div', styles: {}, children: ['.table__title-bar', '.table__action-bar', '.table'] },
      { selector: '.table__title-bar', tag: 'div', styles: {}, parent: '.table-wrapper', children: ['.table__title-bar-content'] },
      { selector: '.table__title-bar-content', tag: 'div', styles: {}, parent: '.table__title-bar', children: ['.table__title-bar-icons'] },
      { selector: '.table__title-bar-icons', tag: 'div', styles: {}, parent: '.table__title-bar-content' },
      { selector: '.table__action-bar', tag: 'div', styles: {}, parent: '.table-wrapper' },
      { selector: '.table', tag: 'table', styles: {}, parent: '.table-wrapper' },
    ],
    modifiers: [],
  },
  Tooltip: {
    elements: [
      { selector: '.tooltip', tag: 'span', styles: {}, children: ['.tooltip__content'] },
      { selector: '.tooltip__content', tag: 'span', styles: {}, parent: '.tooltip' },
    ],
    modifiers: [],
  },
};

/**
 * Component name (PascalCase) to CSS class prefix (e.g. Avatar -> avatar).
 * @param {string} componentName
 * @returns {string}
 */
function componentNameToSlug(componentName) {
  if (!componentName) return '';
  const s = componentName.replace(/([A-Z])/g, '-$1').toLowerCase();
  return s.replace(/^-/, '');
}

/**
 * Resolve path to component .astro file.
 * @param {string} componentName - e.g. 'Avatar'
 * @returns {string} Absolute path to src/components/ui/Avatar.astro
 */
export function getComponentPath(componentName) {
  return path.join(ROOT, 'src', 'components', 'ui', `${componentName}.astro`);
}

/**
 * Extract size and variant prop values from an .astro (or .ts) component file.
 * Uses regex to find patterns like: size?: 'sm' | 'md' | 'lg' or variant?: 'primary' | 'secondary'
 * @param {string} componentPath - Absolute or relative path to .astro file
 * @returns {{ sizes: string[], variants: string[] }}
 */
export function discoverComponentProps(componentPath) {
  const filePath = path.isAbsolute(componentPath) ? componentPath : path.join(ROOT, componentPath);
  const content = fs.readFileSync(filePath, 'utf-8');

  const sizes = [];
  const variants = [];

  // size?: 'sm' | 'md' | 'lg' or size?: "xs" | "sm" | "md" | "lg"
  const sizeMatch = content.match(/size\??\s*:\s*([^;}\n]+)/);
  if (sizeMatch) {
    const quoted = sizeMatch[1].match(/['"](\w+)['"]/g);
    if (quoted) sizes.push(...quoted.map((q) => q.slice(1, -1)));
  }

  // variant?: 'primary' | 'secondary' | ...
  const variantMatch = content.match(/variant\??\s*:\s*([^;}\n]+)/);
  if (variantMatch) {
    const quoted = variantMatch[1].match(/['"](\w+)['"]/g);
    if (quoted) variants.push(...quoted.map((q) => q.slice(1, -1)));
  }

  return {
    sizes: [...new Set(sizes)],
    variants: [...new Set(variants)],
  };
}

/**
 * Find CSS rules for this component (e.g. .avatar, .avatar--sm, .avatar__icon)
 * and extract all var(--*) variable names (without the -- prefix).
 * @param {string} componentName - e.g. 'Avatar'
 * @param {string} cssPath - Path to components.css (relative to project root or absolute)
 * @returns {{ variables: string[] }}
 */
export function discoverComponentVariables(componentName, cssPath = 'src/styles/components.css') {
  const slug = componentNameToSlug(componentName);
  if (!slug) return { variables: [] };

  const filePath = path.isAbsolute(cssPath) ? cssPath : path.join(ROOT, cssPath);
  const content = fs.readFileSync(filePath, 'utf-8');

  const variables = new Set();

  // Find rule blocks: .avatar, .avatar--sm, .avatar__icon
  const escapedSlug = slug.replace(/-/g, '[-]');
  const selectorPattern = new RegExp(
    `\\.${escapedSlug}(?:--[\\w-]*|__[\\w-]*)?\\s*\\{`,
    'g'
  );

  let match;
  while ((match = selectorPattern.exec(content)) !== null) {
    const blockStart = match.index + match[0].length;
    let depth = 1;
    let pos = blockStart;
    while (pos < content.length && depth > 0) {
      const ch = content[pos];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      pos++;
    }
    const block = content.slice(blockStart, pos - 1);
    const varMatches = block.matchAll(/var\s*\(\s*--([\w-]+)\s*\)/g);
    for (const vm of varMatches) variables.add(vm[1]);
  }

  return { variables: [...variables].sort() };
}

/**
 * Parse CSS content into list of { selector, block } (only top-level rules; skips @media body).
 * @param {string} content - Full CSS file content
 * @returns {{ selector: string, block: string }[]}
 */
function parseCssRules(content) {
  const rules = [];
  let pos = 0;
  while (pos < content.length) {
    const open = content.indexOf('{', pos);
    if (open === -1) break;
    const selectorStr = content.slice(pos, open).trim();
    let depth = 1;
    let close = open + 1;
    while (close < content.length && depth > 0) {
      const ch = content[close];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      close++;
    }
    const block = content.slice(open + 1, close - 1);
    if (!selectorStr.startsWith('@')) rules.push({ selector: selectorStr, block });
    pos = close;
  }
  return rules;
}

/**
 * Extract style declarations from a CSS block (property: value;).
 * @param {string} block - Content inside { }
 * @returns {Record<string, string>}
 */
function parseDeclarations(block) {
  const styles = {};
  const regex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = regex.exec(block)) !== null) {
    const prop = m[1].trim();
    const value = m[2].trim();
    if (prop && value) styles[prop] = value;
  }
  return styles;
}

/**
 * Normalize a full selector to the component-relevant class (first class that matches prefix).
 * E.g. ".btn--primary:hover" -> ".btn--primary", ".dialog-overlay.is-open" -> ".dialog-overlay"
 * @param {string} fullSelector - e.g. ".btn, .btn--primary"
 * @param {string} prefix - e.g. "btn"
 * @returns {string[]} Unique normalized selectors (e.g. [".btn", ".btn--primary"])
 */
function normalizedSelectorsForRule(fullSelector, prefix) {
  const out = new Set();
  const parts = fullSelector.split(',').map((s) => s.trim());
  const escaped = prefix.replace(/-/g, '[-]');
  const anyPrefixRe = new RegExp(`\\.${escaped}(?:[-_]?[\\w-]*)*`, 'g');
  for (const part of parts) {
    const firstClassMatch = part.match(anyPrefixRe);
    if (!firstClassMatch) continue;
    const firstClass = firstClassMatch[0];
    if (!firstClass.startsWith('.' + prefix) && !firstClass.startsWith('.' + prefix + '-')) continue;
    out.add(firstClass);
  }
  return [...out];
}

/** Pseudo-classes we treat as states. */
const STATE_PSEUDOS = ['hover', 'focus', 'active', 'disabled', 'focus-visible', 'focus-within'];

/**
 * Normalize state name to camelCase for use in state keys (e.g. focus-visible -> focusVisible).
 * @param {string} state - e.g. 'hover', 'focus-visible'
 * @returns {string}
 */
function stateToKeySegment(state) {
  if (!state.includes('-')) return state.charAt(0).toUpperCase() + state.slice(1);
  return state
    .split('-')
    .map((seg, i) => (i === 0 ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg.charAt(0).toUpperCase() + seg.slice(1)))
    .join('');
}

/**
 * Parse a compound selector of the form "ancestor:pseudo descendant" (exactly two segments).
 * Used to capture descendant states: styles applied to a descendant when an ancestor has a pseudo state.
 * @param {string} part - e.g. ".right-sidebar:hover .right-sidebar__label"
 * @param {string} prefix - e.g. "right-sidebar"
 * @returns {{ ancestor: string, state: string, descendant: string } | null}
 */
function parseDescendantState(part, prefix) {
  const segments = part.trim().split(/\s+/).filter(Boolean);
  if (segments.length !== 2) return null;
  let ancestorSegment = null;
  let state = null;
  for (const seg of segments) {
    for (const p of STATE_PSEUDOS) {
      const pseudo = ':' + p;
      if (seg.includes(pseudo)) {
        if (ancestorSegment != null) return null;
        ancestorSegment = seg;
        state = p;
        break;
      }
    }
  }
  if (ancestorSegment == null || state == null) return null;
  const descendantSegment = segments.find((s) => s !== ancestorSegment);
  if (!descendantSegment) return null;
  const ancestor = ancestorSegment.replace(/:[a-z-]+(?:\([^)]*\))?/gi, '').trim();
  return { ancestor, state, descendant: descendantSegment };
}

/**
 * Split selector into base (no pseudo) and state name.
 * For compound selectors (e.g. ".alert--info .alert__close:hover"), returns the element that has the pseudo.
 * @param {string} selector - e.g. ".alert__close:hover" or ".alert--info .alert__close:hover"
 * @param {string} prefix - e.g. "alert"
 * @returns {{ base: string, state: string } | null}
 */
function parseSelectorState(selector, prefix) {
  const trimmed = selector.trim();
  for (const state of STATE_PSEUDOS) {
    const pseudo = ':' + state;
    const idx = trimmed.indexOf(pseudo);
    if (idx === -1) continue;
    const beforePseudo = trimmed.slice(0, idx).trim();
    const parts = beforePseudo.split(/\s+/).filter(Boolean);
    const escaped = prefix.replace(/-/g, '[-]');
    const classRe = new RegExp(`\\.${escaped}(?:__[\\w-]+|--[\\w-]+)?`);
    const lastPart = parts[parts.length - 1] || beforePseudo;
    const base = lastPart.match(classRe) ? lastPart : beforePseudo;
    return { base, state };
  }
  return null;
}

/**
 * Parse compound selector that is parent + descendant with no modifier and no pseudo (e.g. ".alert .alert__icon").
 * Used to attribute base styles to descendants that are only targeted via a descendant selector.
 * @param {string} ruleSelector - single part (no comma)
 * @param {string} prefix - e.g. "alert"
 * @param {(sel: string) => boolean} selectorBelongsToComponent
 * @returns {string | null} Descendant selector or null
 */
function parseDescendantBase(ruleSelector, prefix, selectorBelongsToComponent) {
  const parts = ruleSelector.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  const segments = parts.map((p) => p.replace(/:[\w-]+(?:\([^)]*\))?/gi, '').trim());
  if (segments.some((s) => s.includes('--'))) return null;
  const descendant = segments[segments.length - 1];
  return selectorBelongsToComponent(descendant) ? descendant : null;
}

/**
 * From a compound selector (e.g. ".alert--info .alert__icon"), extract modifier class and target element selector.
 * @param {string} ruleSelector - single part (no comma)
 * @param {string} prefix - e.g. "alert"
 * @returns {{ modifier: string, element: string } | null}
 */
function parseCompoundModifierElement(ruleSelector, prefix) {
  const parts = ruleSelector.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  let modifier = null;
  let element = null;
  const escaped = prefix.replace(/-/g, '[-]');
  const classRe = new RegExp(`\\.${escaped}(?:__[\\w-]+|--[\\w-]+)?`);
  for (const part of parts) {
    const clean = part.replace(/:[\w-]+(?:\([^)]*\))?/g, '').trim();
    if (!classRe.test(clean)) continue;
    if (clean.includes('--')) modifier = clean;
    else if (clean === '.' + prefix || clean.startsWith('.' + prefix + '__')) element = clean;
  }
  if (modifier && element) return { modifier, element };
  if (modifier && parts.some((p) => p.startsWith('.' + prefix + '__')))
    element = parts.find((p) => p.startsWith('.' + prefix + '__')).replace(/:[\w-]+(?:\([^)]*\))?/g, '').trim();
  if (modifier && !element) element = '.' + prefix;
  return modifier && element ? { modifier, element } : null;
}

/**
 * Build structure object and selector→parent map from AST structure (extractDetailedStructure output).
 * @param {Object} astStructure - { root: { element, class, children }, children }
 * @param {string} componentSlug - e.g. 'alert', 'dialog'
 * @returns {{ structure: { root: string, children: Array }, selectorToParent: Record<string, string> }}
 */
export function buildStructureFromAst(astStructure, componentSlug) {
  const selectorToParent = {};
  if (!astStructure?.root) {
    return { structure: { root: '', children: [] }, selectorToParent };
  }

  function nodeToStructureNode(node, parentSelector) {
    const sel = selectorFromAstNode(node);
    if (!sel) return null;
    if (parentSelector) selectorToParent[sel] = parentSelector;
    const out = { class: sel };
    const kids = node.children || [];
    if (kids.length) {
      out.children = kids
        .map((c) => nodeToStructureNode(c, sel))
        .filter(Boolean);
    }
    return out;
  }

  let rootSel = selectorFromAstNode(astStructure.root);
  const fallbackRoot = '.' + componentSlug.replace(/-/g, '-');
  const useFallbackRoot = !rootSel || rootSel === '.classes';
  if (useFallbackRoot) rootSel = fallbackRoot;
  if (!rootSel) {
    return { structure: { root: '', children: [] }, selectorToParent };
  }

  const rootChildren = (astStructure.root.children || [])
    .map((c) => nodeToStructureNode(c, rootSel))
    .filter(Boolean);

  const structure = {
    root: rootSel,
    children: rootChildren,
  };

  return { structure, selectorToParent };
}

/**
 * Discover component structure from components.css: selectors (root, __children, --modifiers) and their styles.
 * When options.astStructure is provided (from extractDetailedStructure), element parents and a structure tree are derived from the AST.
 * @param {string} componentName - e.g. 'Button', 'Alert', 'Dialog'
 * @param {string} cssPath - Path to components.css (relative to project root or absolute)
 * @param {{ astStructure?: Object }} options - Optional. astStructure from parseComponent(...).structure
 * @returns {{ elements: Array, modifiers: string[], structure?: Object, ... }}
 */
const EMPTY_DISCOVERY_EXTRA = {
  modifierRootStyles: {},
  modifierElementStyles: {},
  stateStyles: {},
  descendantStateStyles: {},
};

export function discoverComponentStructure(componentName, cssPath = 'src/styles/components.css', options = {}) {
  if (HARDCODED_STRUCTURE[componentName]) {
    const fromCss = discoverComponentStructureFromCss(componentName, cssPath);
    if (fromCss.elements.length <= 1) {
      const hardcoded = HARDCODED_STRUCTURE[componentName];
      const descendantBaseStyles = fromCss.descendantBaseStyles || {};
      const result = {
        ...hardcoded,
        modifierRootStyles: fromCss.modifierRootStyles || {},
        modifierElementStyles: fromCss.modifierElementStyles || {},
        stateStyles: fromCss.stateStyles || {},
        descendantStateStyles: fromCss.descendantStateStyles || {},
        descendantBaseStyles,
      };
      result.elements = (hardcoded.elements || []).map((el) => {
        const descBase = descendantBaseStyles[el.selector] || {};
        return { ...el, styles: { ...(el.styles || {}), ...descBase } };
      });
      if (options.astStructure) {
        const slug = componentNameToSlug(componentName);
        const { structure, selectorToParent } = buildStructureFromAst(options.astStructure, slug);
        if (structure.root) {
          result.structure = structure;
          result.elements = (result.elements || []).map((el) => ({
            ...el,
            parent: selectorToParent[el.selector] ?? el.parent,
          }));
        }
      }
      return result;
    }
  }

  const fromCss = discoverComponentStructureFromCss(componentName, cssPath);
  if (!options.astStructure) return fromCss;

  const slug = componentNameToSlug(componentName);
  const { structure, selectorToParent } = buildStructureFromAst(options.astStructure, slug);
  const result = {
    ...fromCss,
    elements: fromCss.elements.map((el) => ({
      ...el,
      parent: selectorToParent[el.selector] ?? el.parent,
    })),
  };
  if (structure.root) result.structure = structure;
  return result;
}

function discoverComponentStructureFromCss(componentName, cssPath) {
  const prefix = COMPONENT_CSS_PREFIX[componentName] ?? componentNameToSlug(componentName);
  if (!prefix) return { elements: [], modifiers: [] };

  const filePath = path.isAbsolute(cssPath) ? cssPath : path.join(ROOT, cssPath);
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

  if (prefix === 'header') {
    const layoutPath = path.join(ROOT, 'src/styles/layout.css');
    if (fs.existsSync(layoutPath)) content += '\n' + fs.readFileSync(layoutPath, 'utf-8');
  }

  if (!content.trim()) {
    if (HARDCODED_STRUCTURE[componentName]) return HARDCODED_STRUCTURE[componentName];
    return { elements: [], modifiers: [] };
  }

  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = parseCssRules(content);

  const escaped = prefix.replace(/-/g, '[-]');
  const selectorBelongsToComponent = (sel) => {
    const s = sel.trim();
    if (prefix === 'btn') {
      return s === '.btn' || s.startsWith('.btn__') || s.startsWith('.btn--');
    }
    if (prefix === 'header') {
      return s === '.header' || s.startsWith('.header__') || s.startsWith('.header--');
    }
    if (prefix === 'btn-group') {
      return s === '.btn-group' || s.startsWith('.btn-group__') || s.startsWith('.btn-group--');
    }
    return (
      s === '.' + prefix ||
      s.startsWith('.' + prefix + '__') ||
      s.startsWith('.' + prefix + '--') ||
      s.startsWith('.' + prefix + '-')
    );
  };

  const selectorToBase = (sel) => {
    const s = sel.trim();
    if (s.startsWith('.' + prefix + '__')) return s;
    if (s.startsWith('.' + prefix + '--')) return s;
    if (s.startsWith('.' + prefix + '-') && s.indexOf('__') === -1 && s.indexOf('--') === -1)
      return s;
    return '.' + prefix;
  };

  const bySelector = new Map();
  const modifiers = new Set();
  /** Modifier root: modifier selector -> styles applied to root element (e.g. .alert--info -> styles for .alert). */
  const modifierRootStyles = {};
  /** Modifier + element: modifier -> element selector -> styles (e.g. .alert--info -> .alert__icon -> styles). */
  const modifierElementStyles = {};
  /** State: element selector -> state name -> styles (e.g. .alert__close -> hover -> styles). */
  const stateStyles = {};
  /** Descendant state: descendant selector -> stateKey (e.g. rootHover) -> styles. When root has pseudo, descendant gets these styles. */
  const descendantStateStyles = {};
  /** Descendant base: descendant selector -> styles from rules like .parent .element (no modifier, no pseudo). */
  const descendantBaseStyles = {};
  const rootKey = '.' + prefix;

  for (const { selector: ruleSelector, block } of rules) {
    const decl = parseDeclarations(block);
    const parts = ruleSelector.split(',').map((s) => s.trim());

    for (const part of parts) {
      const hasSpace = part.includes(' ');
      const hasPseudo = STATE_PSEUDOS.some((p) => part.includes(':' + p));

      if (hasPseudo && hasSpace) {
        const descendantParsed = parseDescendantState(part, prefix);
        if (
          descendantParsed &&
          selectorBelongsToComponent(descendantParsed.ancestor) &&
          selectorBelongsToComponent(descendantParsed.descendant) &&
          descendantParsed.ancestor === rootKey
        ) {
          const stateKey = 'root' + stateToKeySegment(descendantParsed.state);
          if (!descendantStateStyles[descendantParsed.descendant]) descendantStateStyles[descendantParsed.descendant] = {};
          if (!descendantStateStyles[descendantParsed.descendant][stateKey]) descendantStateStyles[descendantParsed.descendant][stateKey] = {};
          Object.assign(descendantStateStyles[descendantParsed.descendant][stateKey], decl);
          continue;
        }
      }

      if (hasPseudo) {
        const parsed = parseSelectorState(part, prefix);
        if (parsed) {
          const { base, state } = parsed;
          if (selectorBelongsToComponent(base)) {
            if (!stateStyles[base]) stateStyles[base] = {};
            if (!stateStyles[base][state]) stateStyles[base][state] = {};
            Object.assign(stateStyles[base][state], decl);
          }
          continue;
        }
      }

      if (hasSpace) {
        const compound = parseCompoundModifierElement(part, prefix);
        if (compound && selectorBelongsToComponent(compound.modifier)) {
          const { modifier, element } = compound;
          modifiers.add(modifier);
          if (selectorBelongsToComponent(element)) {
            if (!modifierElementStyles[modifier]) modifierElementStyles[modifier] = {};
            if (!modifierElementStyles[modifier][element]) modifierElementStyles[modifier][element] = {};
            Object.assign(modifierElementStyles[modifier][element], decl);
          }
          continue;
        }
        const descendant = parseDescendantBase(part, prefix, selectorBelongsToComponent);
        if (descendant) {
          if (!descendantBaseStyles[descendant]) descendantBaseStyles[descendant] = {};
          Object.assign(descendantBaseStyles[descendant], decl);
          continue;
        }
        continue;
      }

      const normalizedList = normalizedSelectorsForRule(part, prefix);
      const isBaseRule =
        !part.includes(':') &&
        !part.includes('.is-') &&
        !part.includes(' ') &&
        normalizedList.some((n) => {
          const base = n.trim();
          return (
            base === rootKey ||
            base.startsWith('.' + prefix + '__') ||
            (base.startsWith('.' + prefix + '-') && base !== rootKey && !base.includes('--'))
          );
        });

      for (const norm of normalizedList) {
        const base = norm.trim();
        if (!selectorBelongsToComponent(base)) continue;
        if (base.includes('--')) {
          const prefixWithDot = '.' + prefix + '__';
          const isElementModifier =
            base.startsWith(prefixWithDot) && base.indexOf('--') !== -1;
          if (isElementModifier) {
            const element = base.slice(0, base.indexOf('--'));
            modifiers.add(base);
            if (!modifierElementStyles[base]) modifierElementStyles[base] = {};
            if (!modifierElementStyles[base][element]) modifierElementStyles[base][element] = {};
            Object.assign(modifierElementStyles[base][element], decl);
          } else {
            modifiers.add(base);
            modifierRootStyles[base] = { ...(modifierRootStyles[base] || {}), ...decl };
          }
          continue;
        }
        const key = base.startsWith('.' + prefix + '__')
          ? base
          : base.startsWith('.' + prefix + '-') && !base.startsWith('.' + prefix + '--')
            ? base
            : rootKey;
        if (!bySelector.has(key)) bySelector.set(key, {});
        if (isBaseRule) Object.assign(bySelector.get(key), decl);
      }
    }
  }

  const rootSelectors = [];
  const elementSelectors = [];
  for (const sel of bySelector.keys()) {
    if (sel === '.' + prefix) rootSelectors.push(sel);
    else if (sel.startsWith('.' + prefix + '__')) elementSelectors.push(sel);
    else if (sel.startsWith('.' + prefix + '-') && !sel.startsWith('.' + prefix + '--'))
      rootSelectors.push(sel);
  }
  rootSelectors.sort((a, b) => b.length - a.length);
  elementSelectors.sort();

  const defaultRootTag =
    componentName === 'Button'
      ? 'button'
      : componentName === 'Input'
        ? 'input'
        : componentName === 'Label'
          ? 'label'
          : 'div';

  const innermostRoot =
    rootSelectors.length > 1 ? rootSelectors[rootSelectors.length - 1] : rootKey;

  const elements = [];
  for (const rootSel of rootSelectors) {
    const isInnermost = rootSel === innermostRoot;
    const children = isInnermost
      ? [...elementSelectors]
      : [rootSelectors[rootSelectors.indexOf(rootSel) + 1]].filter(Boolean);
    const baseStyles = bySelector.get(rootSel) || {};
    const descBase = descendantBaseStyles[rootSel] || {};
    const el = {
      selector: rootSel,
      tag: rootSel === rootKey ? defaultRootTag : 'div',
      styles: { ...baseStyles, ...descBase },
    };
    if (children.length) el.children = children;
    if (rootSel !== rootKey) el.parent = rootSelectors[rootSelectors.indexOf(rootSel) - 1] || null;
    elements.push(el);
  }
  for (const sel of elementSelectors) {
    const baseStyles = bySelector.get(sel) || {};
    const descBase = descendantBaseStyles[sel] || {};
    elements.push({
      selector: sel,
      tag: 'span',
      styles: { ...baseStyles, ...descBase },
      parent: innermostRoot,
    });
  }

  if (elements.length <= 1 && HARDCODED_STRUCTURE[componentName]) {
    return {
      ...HARDCODED_STRUCTURE[componentName],
      modifierRootStyles,
      modifierElementStyles,
      stateStyles,
      descendantStateStyles,
      descendantBaseStyles,
    };
  }

  return {
    elements,
    modifiers: [...modifiers].sort(),
    modifierRootStyles,
    modifierElementStyles,
    stateStyles,
    descendantStateStyles,
    descendantBaseStyles,
  };
}

/**
 * Cartesian product of arrays: [ [a1,b1], [a2,b2] ] -> [ [a1,a2], [a1,b2], [b1,a2], [b1,b2] ].
 * @param {any[][]} arrays
 * @returns {any[][]}
 */
function cartesian(arrays) {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesian(rest);
  const out = [];
  for (const v of first) {
    for (const row of restProduct) {
      out.push([v, ...row]);
    }
  }
  return out;
}

/**
 * Build full spec key matrix for a component: one key per combination of dimensions (variant, style, theme, mode, size, buttonType, headerVariant, ...).
 * When dimensionValues is provided (from getDimensionValuesForComponent(componentName, parsed.props)), uses dimension config and full product.
 * When dimensionValues is null, falls back to legacy discoverComponentProps (sizes, variants) + theme/mode.
 * @param {string} componentName - e.g. 'Avatar', 'Alert', 'Button'
 * @param {Record<string, string[]>} [dimensionValues] - e.g. { variant: ['primary','secondary'], size: ['sm','md'] }; theme and mode are always added.
 * @returns {string[]} Spec keys (e.g. ['info-cp-light-default', 'primary-cp-light-md-theme', ...])
 */
export function buildSpecMatrix(componentName, dimensionValues = null) {
  const componentPath = getComponentPath(componentName);
  if (!fs.existsSync(componentPath)) {
    return [];
  }

  const useDimensionConfig =
    dimensionValues &&
    COMPONENT_DIMENSIONS[componentName] &&
    Object.keys(dimensionValues).length > 0;

  if (useDimensionConfig) {
    const orderedDimNames = DIMENSION_KEY_ORDER.filter(
      (d) => d === 'theme' || d === 'mode' || dimensionValues[d]
    );
    const valueArrays = orderedDimNames.map((dim) =>
      dim === 'theme' ? THEMES : dim === 'mode' ? MODES : dimensionValues[dim]
    );
    const product = cartesian(valueArrays);
    return product.map((row) => row.join('-'));
  }

  const { sizes, variants } = discoverComponentProps(componentPath);
  const keys = [];
  const themeModePairs = THEMES.flatMap((theme) => MODES.map((mode) => ({ theme, mode })));
  const variantsAreThemes = variants.length > 0 && variants.every((v) => THEMES.includes(v));

  if (variants.length > 0 && sizes.length > 0) {
    for (const v of variants) {
      for (const { theme, mode } of themeModePairs) {
        for (const size of sizes) {
          keys.push(`${v}-${theme}-${mode}-${size}`);
        }
      }
    }
  } else if (variantsAreThemes && sizes.length === 0) {
    for (const theme of variants) {
      for (const mode of MODES) {
        keys.push(`${theme}-${mode}`);
      }
    }
  } else if (variants.length > 0) {
    for (const v of variants) {
      for (const { theme, mode } of themeModePairs) {
        keys.push(`${v}-${theme}-${mode}`);
      }
    }
  } else if (sizes.length > 0) {
    for (const { theme, mode } of themeModePairs) {
      for (const size of sizes) {
        keys.push(`${theme}-${mode}-${size}`);
      }
    }
  } else {
    for (const { theme, mode } of themeModePairs) {
      keys.push(`${theme}-${mode}`);
    }
  }

  return keys;
}

// --- Run test when executed directly ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const testStructure = process.argv[2] === '--structure';
  if (testStructure) {
    for (const name of ['Button', 'Alert', 'Dialog']) {
      console.log(`\n=== ${name} discovered structure ===`);
      const out = discoverComponentStructure(name);
      console.log(JSON.stringify(out, null, 2));
    }
    process.exit(0);
  }

  const componentName = 'Avatar';
  const componentPath = getComponentPath(componentName);

  console.log('=== Discovered props (Avatar.astro) ===');
  const props = discoverComponentProps(componentPath);
  console.log('  sizes:', props.sizes);
  console.log('  variants:', props.variants);

  console.log('\n=== Discovered CSS variables (Avatar) ===');
  const vars = discoverComponentVariables(componentName);
  console.log('  variables:', vars.variables);

  console.log('\n=== Full spec matrix (Avatar) ===');
  const matrix = buildSpecMatrix(componentName);
  console.log('  count:', matrix.length);
  console.log('  keys:', matrix);
}
