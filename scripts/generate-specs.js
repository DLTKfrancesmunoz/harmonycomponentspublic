#!/usr/bin/env node
/**
 * Generate execution-format specs from sources (tokens + component discovery).
 * Phase 3: Avatar and other simple components.
 *
 * Usage:
 *   node scripts/generate-specs.js [componentName]   # default: Avatar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadColors, loadTokensCSS, CSS_VAR_TO_COLORS_PATH } from './lib/token-resolver.js';
import {
  discoverComponentVariables,
  buildSpecMatrix,
  getComponentPath,
  discoverComponentProps,
  discoverComponentStructure,
} from './lib/component-discovery.js';
import { getDimensionValuesForComponent, COMPONENT_DIMENSIONS, DIMENSION_KEY_ORDER } from './lib/dimension-config.js';
import { parseComponent, getContentOrderFromStructure } from './astro-parser.js';
import { resolveIconsToMap } from './lib/icon-resolver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UI_COMPONENTS_DIR = path.join(ROOT, 'src', 'components', 'ui');
const V2_COMPONENTS_DIR = path.join(ROOT, 'mcp-data', 'components-v2');
const DEFAULT_CONTENT_DIR = path.join(ROOT, 'mcp-data', 'default-content');
const TYPOGRAPHY_PATH = path.join(ROOT, 'src', 'tokens', 'typography.json');

/** Canonical root key order for component JSON (SPEC_CONTRACT). Identity, props/defaults/specs, then guidance/specKeyOrder/dimensionDefaults/structure/fonts/defaultContent, then optional. */
const COMPONENT_JSON_KEY_ORDER = [
  'name', 'type', 'filePath', 'description', 'props', 'defaults', 'specs',
  'contentOrder', 'layoutRules', 'icons',
  'guidance', 'specKeyOrder', 'dimensionDefaults', 'structure', 'fonts', 'defaultContent',
  'interactivity', 'examples',
];

function orderComponentJSONKeys(obj) {
  const ordered = {};
  const keySet = new Set(Object.keys(obj));
  for (const k of COMPONENT_JSON_KEY_ORDER) {
    if (keySet.has(k)) {
      ordered[k] = obj[k];
      keySet.delete(k);
    }
  }
  const rest = [...keySet].sort();
  for (const k of rest) ordered[k] = obj[k];
  return ordered;
}

/** Font name -> URL map from typography.json (lazy-loaded). */
let fontUrlMap = null;

function getFontUrlMap() {
  if (fontUrlMap) return fontUrlMap;
  if (!fs.existsSync(TYPOGRAPHY_PATH)) return {};
  const data = JSON.parse(fs.readFileSync(TYPOGRAPHY_PATH, 'utf-8'));
  fontUrlMap = {};
  for (const entry of Object.values(data.fontFamilies || {})) {
    const name = Array.isArray(entry.value) ? entry.value[0] : entry.value;
    if (name && entry.googleFonts) fontUrlMap[name] = entry.googleFonts;
  }
  return fontUrlMap;
}

/**
 * Collect font-family values from all specs and map each font name to its URL.
 * Merges with full design-system font map so all documented fonts (Figtree, Lexend, JetBrains Mono) are always included.
 * @param {Object} specs - Specs keyed by spec key
 * @returns {Record<string, string>} fonts: { "Lexend": "https://...", "Figtree": "...", ... }
 */
function collectFontsFromSpecs(specs) {
  const fontNames = new Set();
  const firstQuotedRe = /['"]([^'"]+)['"]/;
  function collectFromStyles(styles) {
    if (!styles || typeof styles !== 'object') return;
    const v = styles['font-family'];
    if (typeof v !== 'string') return;
    const match = v.match(firstQuotedRe);
    if (match) fontNames.add(match[1]);
  }
  for (const spec of Object.values(specs || {})) {
    if (!spec.elements) continue;
    for (const el of spec.elements) {
      collectFromStyles(el.styles);
      if (el.states) for (const s of Object.values(el.states)) collectFromStyles(s);
    }
  }
  const urlMap = getFontUrlMap();
  const out = { ...urlMap };
  for (const name of fontNames) {
    if (urlMap[name]) out[name] = urlMap[name];
  }
  return out;
}

/** Component slug (e.g. Alert -> alert). */
function componentNameToSlug(componentName) {
  if (!componentName) return '';
  return componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Override contentOrder for multi-layout components (e.g. Alert default vs enhanced).
 * Use default style as canonical.
 */
const CONTENT_ORDER_OVERRIDES = {
  Alert: {
    contentOrder: ['.alert__icon', '.alert__content', '.alert__close'],
    'contentOrder.alert__content': ['.alert__title', '.alert__message'],
  },
  Dialog: {
    contentOrder: ['.dialog__header', '.dialog__body', '.dialog__footer'],
    'contentOrder.dialog__header': ['.dialog__title', '.dialog__close'],
  },
  ShellHeader: {
    contentOrder: ['.header__brand', '.header__actions', '.header__gradient'],
    'contentOrder.header__actions': ['.company-picker', '.divider', '.avatar'],
  },
  ShellPanel: {
    contentOrder: ['.shell-panel__header', '.shell-panel__content'],
    'contentOrder.shell-panel__header': ['.shell-panel__header-content'],
    'contentOrder.shell-panel__header-content': ['.shell-panel__header-icon', '.shell-panel__title', '.shell-panel__actions'],
  },
  Accordion: {
    contentOrder: ['.accordion__item'],
    'contentOrder.accordion__item': ['.accordion__trigger', '.accordion__content'],
    'contentOrder.accordion__trigger': ['.accordion__icon'],
  },
  Dropdown: {
    contentOrder: ['.dropdown-wrapper__label', '.dropdown'],
    'contentOrder.dropdown': ['.dropdown__trigger', '.dropdown__menu'],
    'contentOrder.dropdown__trigger': ['.dropdown__value', '.dropdown__chevron'],
  },
  LeftSidebar: {
    contentOrder: ['.left-sidebar__section'],
    'contentOrder.left-sidebar__section': ['.left-sidebar__item'],
    'contentOrder.left-sidebar__item': ['.left-sidebar__icon', '.left-sidebar__label', '.left-sidebar__custom-icon', '.left-sidebar__item-tooltip'],
  },
  ListMenu: {
    contentOrder: ['.list-menu__item'],
    'contentOrder.list-menu__item': ['.list-menu__item-icon', '.list-menu__custom-icon'],
  },
  PickerPopup: {
    contentOrder: ['.picker-popup__header', '.picker-popup__body'],
    'contentOrder.picker-popup__header': ['.picker-popup__title', '.picker-popup__close'],
  },
  Table: {
    contentOrder: ['.table__title-bar', '.table__action-bar', '.table'],
    'contentOrder.table__title-bar': ['.table__title-bar-content'],
    'contentOrder.table__title-bar-content': ['.table__title-bar-icons'],
  },
  Kanban: {
    contentOrder: ['.kanban__title-bar', '.kanban__action-bar', '.kanban__columns-wrapper'],
    'contentOrder.kanban__title-bar': ['.kanban__title-bar-content', '.kanban__title-bar-actions'],
    'contentOrder.kanban__title-bar-content': ['.kanban__title'],
    'contentOrder.kanban__title-bar-actions': ['.kanban__title-bar-icon'],
    'contentOrder.kanban__action-bar': ['.kanban__action-items'],
    'contentOrder.kanban__action-items': ['.kanban__action-button', '.kanban__action-divider', '.kanban__action-label', '.kanban__action-text-button'],
  },
  Tooltip: {
    contentOrder: ['.tooltip__content'],
  },
};

/**
 * Predefined element structure for Alert when style === 'enhanced' (different DOM: border, content > inner, etc.).
 * Used so the spec for enhanced has the correct elements and criticalSelectors without inference.
 */
const ALERT_ENHANCED_STRUCTURE = {
  elements: [
    { selector: '.alert', tag: 'div', styles: {}, children: ['.alert__border', '.alert__content'] },
    { selector: '.alert__border', tag: 'div', styles: {}, parent: '.alert' },
    { selector: '.alert__content', tag: 'div', styles: {}, parent: '.alert', children: ['.alert__inner', '.alert__actions', '.alert__progress'] },
    { selector: '.alert__inner', tag: 'div', styles: {}, parent: '.alert__content', children: ['.alert__icon', '.alert__text', '.alert__close'] },
    { selector: '.alert__icon', tag: 'span', styles: {}, parent: '.alert__inner' },
    { selector: '.alert__text', tag: 'div', styles: {}, parent: '.alert__inner', children: ['.alert__title', '.alert__message'] },
    { selector: '.alert__title', tag: 'div', styles: {}, parent: '.alert__text' },
    { selector: '.alert__message', tag: 'div', styles: {}, parent: '.alert__text' },
    { selector: '.alert__close', tag: 'button', styles: {}, parent: '.alert__inner' },
    { selector: '.alert__actions', tag: 'div', styles: {}, parent: '.alert__content', children: ['.alert__buttons', '.alert__link'] },
    { selector: '.alert__buttons', tag: 'div', styles: {}, parent: '.alert__actions' },
    { selector: '.alert__link', tag: 'a', styles: {}, parent: '.alert__actions' },
    { selector: '.alert__progress', tag: 'div', styles: {}, parent: '.alert__content' },
  ],
};

/**
 * Get contentOrder (and contentOrder.<selector>) for a component.
 * Uses override if present, else derives from parsed .astro structure.
 * @param {string} componentName
 * @param {Object} structure - From parseComponent(...).structure
 * @returns {Object}
 */
function getContentOrder(componentName, structure) {
  if (CONTENT_ORDER_OVERRIDES[componentName]) {
    return { ...CONTENT_ORDER_OVERRIDES[componentName] };
  }
  const slug = componentNameToSlug(componentName);
  return getContentOrderFromStructure(structure || {}, slug);
}

/**
 * Extract defaultContent from .astro source: Icon name= class=, variant icon map, placeholders.
 * @param {string} componentName
 * @returns {Object} defaultContent keyed by selector
 */
function getDefaultContent(componentName) {
  const out = {};
  const componentPath = getComponentPath(componentName);
  if (!fs.existsSync(componentPath)) return out;
  const source = fs.readFileSync(componentPath, 'utf-8');

  const slug = componentNameToSlug(componentName);

  const iconRegex = /<Icon\s+name=\{(?:[\w.]+\s*\|\|\s*)?([^}]+)\}\s+class="([^"]+)"\s*\/?>/g;
  const iconStaticRegex = /<Icon\s+name="([^"]+)"\s+(?:class="([^"]+)"|[\s\S]*?)\s*\/?>/g;
  let m;
  while ((m = iconRegex.exec(source)) !== null) {
    const classVal = m[2];
    const sel = '.' + classVal.split(/\s+/)[0];
    if (!out[sel]) out[sel] = { type: 'icon', library: 'heroicons', style: 'outline' };
    if (m[1].includes('defaultIcons') || m[1].includes('alertIcon')) {
      out[sel].variantFromProp = 'variant';
      out[sel].variantIcons = DEFAULT_VARIANT_ICONS.Alert;
    } else {
      out[sel].icon = m[1].trim();
    }
  }
  while ((m = iconStaticRegex.exec(source)) !== null) {
    const sel = m[2] ? '.' + m[2].split(/\s+/)[0] : null;
    if (sel && !out[sel]) {
      out[sel] = { type: 'icon', icon: m[1], library: 'heroicons', style: 'outline' };
    }
  }

  const defaultIconsRegex = /(?:defaultIcons|defaultIcons:\s*Record[^=]*)=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s;
  const defaultIconsMatch = source.match(defaultIconsRegex);
  if (defaultIconsMatch && componentName === 'Alert') {
    const block = defaultIconsMatch[1];
    const pairs = block.match(/(\w+):\s*['"]([^'"]+)['"]/g) || [];
    const variantIcons = {};
    for (const p of pairs) {
      const kv = p.match(/(\w+):\s*['"]([^'"]+)['"]/);
      if (kv) variantIcons[kv[1]] = kv[2];
    }
    if (Object.keys(variantIcons).length) {
      if (!out['.alert__icon']) out['.alert__icon'] = { type: 'icon', library: 'heroicons', style: 'solid' };
      out['.alert__icon'].variantIcons = variantIcons;
      out['.alert__icon'].variantFromProp = 'variant';
      out['.alert__icon'].icon = variantIcons.info || 'information-circle';
      out['.alert__icon'].style = 'solid';
    }
  }

  for (const [selector, placeholder] of Object.entries(DEFAULT_CONTENT_PLACEHOLDERS[componentName] || {})) {
    if (!out[selector]) out[selector] = { type: 'text', placeholder };
  }

  const overrides = DEFAULT_CONTENT_OVERRIDES[componentName];
  if (overrides) for (const [selector, obj] of Object.entries(overrides)) out[selector] = { ...out[selector], ...obj };

  const fileContent = loadDefaultContentFromFile(componentName);
  if (fileContent && typeof fileContent === 'object' && Object.keys(fileContent).length > 0) {
    for (const [key, value] of Object.entries(fileContent)) {
      out[key] = value;
    }
  }

  return out;
}

/**
 * Load default content from mcp-data/default-content/<slug>.json for template-heavy components.
 * Used for sections/items (RightSidebar, LeftSidebar), tabs (ShellFooter), etc.
 * @param {string} componentName - e.g. 'RightSidebar'
 * @returns {Object|null} Parsed JSON or null if file missing/invalid
 */
function loadDefaultContentFromFile(componentName) {
  const slug = componentNameToSlug(componentName);
  const filePath = path.join(DEFAULT_CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

/** Static defaultContent for elements where Icon has no class (e.g. close button wraps Icon). */
const DEFAULT_CONTENT_OVERRIDES = {
  Alert: {
    '.alert__close': { type: 'icon', icon: 'x-mark', library: 'heroicons', style: 'outline' },
  },
  Dialog: {
    '.dialog__close': { type: 'icon', icon: 'x-mark', library: 'heroicons', style: 'outline' },
    '.dialog__title': { type: 'text', placeholder: 'Dialog title' },
  },
};

/** When a component has no default content defined, emit this so every component has explicit defaultContent and the contract applies. */
const NO_DEFAULT_CONTENT_RULE = {
  _rule: 'No default content defined; do not invent labels, icons, or copy. Use only what is in the spec or leave slots empty.',
};

/** Placeholder text for title/message elements by component. */
const DEFAULT_CONTENT_PLACEHOLDERS = {
  Alert: {
    '.alert__title': 'Alert title',
    '.alert__message': 'Alert message',
  },
};

/** Variant -> default icon for components that use variant icons (e.g. Alert). */
const DEFAULT_VARIANT_ICONS = {
  Alert: {
    info: 'information-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'exclamation-circle',
  },
};

/**
 * Collect all icon descriptors (name, style, library) for a component from defaultContent, template sections, and overrides.
 * Includes selector-based defaultContent (type: 'icon'), defaultContent.sections[].items[].icon (RightSidebar, LeftSidebar, etc.), and overrides.
 * @param {string} componentName
 * @returns {{ name: string, style?: string, library?: string }[]}
 */
function collectIconDescriptors(componentName) {
  const descriptors = [];
  const defaultContent = getDefaultContent(componentName);
  for (const entry of Object.values(defaultContent || {})) {
    if (entry?.type !== 'icon') continue;
    const name = entry.icon;
    if (name) {
      descriptors.push({
        name,
        style: entry.style || 'outline',
        library: entry.library || 'heroicons',
      });
    }
    const variantIcons = entry.variantIcons;
    if (variantIcons && typeof variantIcons === 'object') {
      for (const n of Object.values(variantIcons)) {
        if (n) {
          descriptors.push({
            name: n,
            style: entry.style || 'outline',
            library: entry.library || 'heroicons',
          });
        }
      }
    }
  }
  // Template/sections shape: defaultContent.sections[].items[].icon (RightSidebar, LeftSidebar, FloatingNav, etc.)
  const sections = defaultContent?.sections;
  if (Array.isArray(sections)) {
    for (const sec of sections) {
      if (!sec.items) continue;
      for (const item of sec.items) {
        if (item.isCustom && item.customSrc) continue;
        if (item.icon && typeof item.icon === 'string') {
          descriptors.push({
            name: item.icon,
            style: 'outline',
            library: 'heroicons',
          });
        }
      }
    }
  }
  const overrides = DEFAULT_CONTENT_OVERRIDES[componentName];
  if (overrides) {
    for (const entry of Object.values(overrides)) {
      if (entry?.type === 'icon' && entry.icon) {
        descriptors.push({
          name: entry.icon,
          style: entry.style || 'outline',
          library: entry.library || 'heroicons',
        });
      }
    }
  }
  return descriptors;
}

/**
 * Layout rules for components with documented footer/button order.
 * @param {string} componentName
 * @returns {Object|null}
 */
function getLayoutRules(componentName) {
  return LAYOUT_RULES[componentName] ?? null;
}

const LAYOUT_RULES = {
  Dialog: {
    '.dialog__footer': {
      buttonAlignment: 'left',
      buttonOrder: ['primary', 'secondary'],
      /** When buttonAlignment='right', use this order instead. */
      buttonOrderByAlignment: {
        left: ['primary', 'secondary'],
        right: ['secondary', 'primary'],
      },
    },
  },
  Alert: {
    '.alert__actions': { buttonOrder: ['primary', 'secondary'] },
    '.alert__buttons': { buttonOrder: ['primary', 'secondary'] },
  },
  Card: {
    /** Slot order: header (optional), body, footer (optional). Footer has no default content; do not invent. */
    '.card__footer': { defaultEmpty: true },
  },
  ShellPageHeader: {
    '.shell-page-header__actions': { buttonOrder: ['outline', 'primary'], description: 'Outline/secondary buttons first (left), primary button last (right).' },
  },
  ShellFooter: {
    '.tabstrip__container': {
      contentOrder: ['.tabstrip__tabs', '.tabstrip__add', '.tabstrip__more-wrapper'],
      description: 'Visible tabs first, then Add Tab button (when showAddTab), then More dropdown (when showMore and overflowTabs.length > 0). Do not reorder.',
    },
  },
  ShellHeader: {
    '.header__actions': {
      description: 'When actions slot is not used: company picker, then divider (if showCompanyPicker), then Avatar. Do not reorder.',
    },
  },
};

const FORBIDDEN_MODIFICATIONS = [
  'Do not use Tailwind arbitrary values',
  'Do not change hex colors to named colors',
  'Do not simplify box-shadow values',
  'Do not add CSS properties that are not in criticalSelectors or in elements[].styles (or element states)',
  'Do not reorder children: follow contentOrder and elements[].children order exactly',
  'Build exactly what is in the spec: structure, styles, and defaultContent from the JSON only; no inference, no additions, no "fixes"',
];

const THEMES = ['cp', 'vp', 'ppm', 'maconomy'];

/**
 * Resolve a single CSS variable to a concrete value for (theme, mode, size).
 * Uses getThemeToken for theme/mode-specific vars (e.g. color-info-light from tokens.css).
 * @param {string} varName - e.g. 'theme-primary', 'color-info-light', 'avatar-size-sm'
 * @param {object} ctx - { getColor, getToken, getThemeToken, theme, mode, size, componentName }
 * @returns {string|undefined}
 */
function resolveVariable(varName, ctx) {
  const { getColor, getToken, getThemeToken, theme, mode, size, componentName } = ctx;

  if (CSS_VAR_TO_COLORS_PATH[varName] != null) {
    const v = getColor(theme, mode, CSS_VAR_TO_COLORS_PATH[varName]);
    if (v != null) return v;
  }

  if (getThemeToken && theme && mode) {
    let themeVal = getThemeToken(theme, mode, varName);
    if (themeVal != null) return themeVal;
    if (varName.endsWith('-dark')) {
      themeVal = getThemeToken(theme, 'dark', varName);
      if (themeVal != null) return themeVal;
      themeVal = getThemeToken('cp', 'dark', varName);
      if (themeVal != null) return themeVal;
    }
  }

  const slug = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const sizeTokenMatch = varName.match(new RegExp(`^${slug.replace(/-/g, '[-]')}-size-(\\w+)$`));
  if (sizeTokenMatch && size) {
    const tokenName = `${slug}-size-${size}`;
    return getToken(tokenName);
  }

  if (varName === 'btn-spinner-size') {
    const s = size || 'md';
    const v = getToken(`spinner-size-${s}`);
    if (v && !v.includes('var(')) return v;
    const fallback = { xs: '12px', sm: '14px', md: '16px', lg: '18px' };
    return fallback[s] || '16px';
  }
  if (varName === 'btn-spinner-stroke-width') {
    const s = size || 'md';
    const v = getToken(`spinner-stroke-width-${s}`);
    if (v && !v.includes('var(')) return v;
    const fallback = { xs: '2', sm: '2.5', md: '3', lg: '3.5' };
    return fallback[s] || '3';
  }

  return getToken(varName);
}

/**
 * Resolve var(--name) in style values using ctx (getColor, getToken, theme, mode, size, componentName).
 * @param {Record<string, string>} styles
 * @param {object} ctx
 * @returns {Record<string, string>}
 */
function resolveStyles(styles, ctx) {
  if (!styles || typeof styles !== 'object') return {};
  const out = {};
  const varRe = /var\s*\(\s*--([\w-]+)\s*\)/g;
  function resolveValue(str) {
    let prev;
    let s = str;
    do {
      prev = s;
      s = s.replace(varRe, (_, name) => {
        const resolved = resolveVariable(name, ctx);
        return resolved != null ? resolveValue(resolved) : `var(--${name})`;
      });
    } while (s !== prev);
    return s;
  }
  for (const [k, v] of Object.entries(styles)) {
    if (typeof v !== 'string') {
      out[k] = v;
      continue;
    }
    out[k] = resolveValue(v);
  }
  return out;
}

/**
 * Ensure text elements have an explicit font-family so the spec is deterministic.
 * Design system: body/copy uses --font-sans. If an element has typography (font-size, line-height, etc.) but no font-family, add the default body font.
 * @param {Record<string, string>} styles - Resolved styles (mutated in place)
 * @param {object} ctx - getToken
 */
function ensureFontFamily(styles, ctx) {
  if (!styles || styles['font-family']) return;
  const hasTypography =
    styles['font-size'] || styles['line-height'] || styles['font-weight'] || styles['letter-spacing'];
  if (!hasTypography) return;
  const fontSans = ctx.getToken?.('font-sans');
  if (fontSans) styles['font-family'] = fontSans;
}

/**
 * Complete border shorthand if missing color (e.g. "1px solid" -> "1px solid #hex").
 * @param {Record<string, string>} styles - Resolved styles (may include border-color)
 * @param {object} ctx - getColor, getToken, getThemeToken, theme, mode
 * @returns {void} Mutates styles in place
 */
function completeBorder(styles, ctx) {
  const border = styles.border;
  if (!border || typeof border !== 'string') return;
  const trimmed = border.trim();
  if (!/^[\d.]+\s*px\s+solid\s*$/i.test(trimmed)) return;
  const color = styles['border-color'] ?? ctx.getColor?.(ctx.theme, ctx.mode, 'palette.border') ?? ctx.getThemeToken?.(ctx.theme, ctx.mode, 'border-color');
  if (color) {
    const width = trimmed.replace(/\s*solid\s*$/i, '').trim() || '1px';
    styles.border = `${width} solid ${color}`;
  }
}

/**
 * Build CSS property name from declaration (e.g. background-color -> background for spec).
 * We use background for color for consistency with execution format.
 */
function cssPropName(decl) {
  if (decl === 'background-color') return 'background';
  return decl;
}

/**
 * Map from component to root selector and tag (for execution format).
 */
const COMPONENT_ROOT = {
  Avatar: { selector: '.avatar', tag: 'div' },
};

const CAMEL_TO_KEBAB = {
  flexDirection: 'flex-direction',
  alignItems: 'align-items',
  justifyContent: 'justify-content',
  paddingTop: 'padding-top',
  paddingRight: 'padding-right',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  minWidth: 'min-width',
  maxWidth: 'max-width',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  borderRight: 'border-right',
  borderLeft: 'border-left',
  borderBottom: 'border-bottom',
  borderTop: 'border-top',
  borderRadius: 'border-radius',
  boxShadow: 'box-shadow',
  zIndex: 'z-index',
};

function camelToKebab(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = CAMEL_TO_KEBAB[k] ?? k.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    out[key] = v;
  }
  return out;
}

function bordersToStyles(borders) {
  if (!borders || typeof borders !== 'object') return {};
  const out = {};
  if (borders.border != null) out.border = borders.border;
  if (borders.width != null) out['border-width'] = borders.width;
  if (borders.style != null) out['border-style'] = borders.style;
  if (borders.radius != null) out['border-radius'] = borders.radius;
  return out;
}

function stateToStyles(state) {
  if (!state || typeof state !== 'object') return {};
  const out = { ...camelToKebab(state) };
  if (out.text !== undefined) {
    out.color = out.text;
    delete out.text;
  }
  return out;
}

/**
 * @param {string} classStr - e.g. "right-sidebar__dela-logo right-sidebar__dela-logo--default"
 * @param {boolean} useFull - if true, return .c1.c2.c3 for unique selector; else first class only
 */
function selectorFromClass(classStr, useFull = false) {
  if (typeof classStr !== 'string') return '';
  const parts = classStr.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (useFull) return parts.map((c) => '.' + c).join('');
  return '.' + parts[0];
}

function collectIconsFromTemplate(template) {
  const icons = [];
  if (!template?.sections) return icons;
  for (const sec of template.sections) {
    if (!sec.items) continue;
    for (const item of sec.items) {
      if (item.isCustom && item.customSrc) {
        icons.push({
          name: item.label?.replace(/\s+/g, '-').toLowerCase() || 'custom',
          library: 'custom',
          icon: path.basename(item.customSrc, '.svg'),
          style: 'outline',
        });
        continue;
      }
      const iconPath = item.iconPath || item.icon;
      const name = item.icon || item.label?.replace(/\s+/g, '-').toLowerCase() || 'icon';
      const pathMatch = iconPath && typeof iconPath === 'string' && iconPath.match(/heroicons\/24\/(outline|solid)\/([^/]+)\.svg$/);
      if (pathMatch) {
        const style = pathMatch[1];
        const base = pathMatch[2].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const icon = base.charAt(0).toUpperCase() + base.slice(1) + 'Icon';
        icons.push({ name, library: 'heroicons', icon, style });
      } else {
        icons.push({ name, library: 'custom', icon: name, style: 'outline' });
      }
    }
  }
  return icons;
}

/**
 * Convert old-format spec (structure, layout, spacing, etc.) to execution format (elements, _buildContract).
 * Resolves all styles from tokens for theme/mode/size. Output: _meta, _buildContract, elements, icons only.
 */
function convertOldSpecToExecutionFormat(oldSpec, componentName, theme, mode, size) {
  const colors = loadColors();
  const tokens = loadTokensCSS();
  const getColor = colors.getColor.bind(colors);
  const getToken = tokens.getToken.bind(tokens);

  const cardBg = getColor(theme, mode, 'palette.cardBackground');
  const navBg = getColor(theme, mode, 'palette.navBackground');
  const titleText = getColor(theme, mode, 'palette.titleText');
  const borderColor = getColor(theme, mode, 'palette.border');
  const primary = getColor(theme, mode, 'primary');
  const hoverBg = getColor(theme, mode, 'palette.hover');

  const resolvedStates = {
    default: { background: cardBg, color: titleText, border: borderColor != null ? `1px solid ${borderColor}` : undefined },
    hover: { background: hoverBg ?? cardBg, color: titleText, border: borderColor != null ? `1px solid ${borderColor}` : undefined },
    active: { background: hoverBg ?? cardBg, color: titleText, border: borderColor != null ? `1px solid ${borderColor}` : undefined },
    focus: { background: cardBg, color: titleText, border: borderColor != null ? `1px solid ${borderColor}` : undefined },
    disabled: { background: cardBg, color: titleText, border: borderColor != null ? `1px solid ${borderColor}` : undefined },
    item: { background: primary, color: '#FFFFFF', border: 'none' },
  };

  const spec = oldSpec;
  const hasStructure = spec.structure && typeof spec.structure === 'object';
  const hasSection = spec.section && typeof spec.section === 'object';
  const elements = [];
  const criticalSelectors = {};

  const mergeStyles = (...sources) => {
    const acc = {};
    for (const src of sources) {
      if (!src || typeof src !== 'object') continue;
      Object.assign(acc, camelToKebab(src));
    }
    return acc;
  };

  if (!hasStructure) {
    return null;
  }

  const rootNode = spec.structure.root;
  const rootTag = rootNode?.element || 'div';
  const rootClass = rootNode?.class || 'root';
  const rootSelector = selectorFromClass(rootClass) || '.root';

  let rootStyles = mergeStyles(spec.layout, spec.spacing, spec.positioning, spec.dimensions, spec.typography);
  Object.assign(rootStyles, bordersToStyles(spec.borders));
  Object.assign(rootStyles, stateToStyles(spec.states?.default));
  rootStyles.background = resolvedStates.default.background ?? rootStyles.background;
  rootStyles.color = resolvedStates.default.color ?? rootStyles.color;
  rootStyles.border = resolvedStates.default.border ?? rootStyles.border;
  if (borderColor != null && !rootStyles.border) rootStyles.border = `1px solid ${borderColor}`;
  if (rootStyles['padding-top'] != null && rootStyles['padding-right'] != null) {
    rootStyles.padding = `${rootStyles['padding-top']} ${rootStyles['padding-right']} ${rootStyles['padding-bottom']} ${rootStyles['padding-left']}`;
    delete rootStyles['padding-top'];
    delete rootStyles['padding-right'];
    delete rootStyles['padding-bottom'];
    delete rootStyles['padding-left'];
  }

  const rootElement = {
    selector: rootSelector,
    tag: rootTag,
    styles: rootStyles,
  };
  if (rootTag === 'nav') rootElement.role = 'complementary';
  const rootStates = {};
  if (spec.states) {
    for (const [stateKey, stateVal] of Object.entries(spec.states)) {
      if (stateKey === 'default' || stateKey === 'item') continue;
      rootStates[stateKey] = stateToStyles(stateVal);
      if (resolvedStates[stateKey]) {
        rootStates[stateKey].background = resolvedStates[stateKey].background ?? rootStates[stateKey].background;
        rootStates[stateKey].color = resolvedStates[stateKey].color ?? rootStates[stateKey].color;
        rootStates[stateKey].border = resolvedStates[stateKey].border ?? rootStates[stateKey].border;
      }
    }
  }
  if (Object.keys(rootStates).length) rootElement.states = rootStates;
  elements.push(rootElement);
  criticalSelectors[rootSelector] = { ...rootStyles };

  const structureKeys = Object.keys(spec.structure).filter((k) => k !== 'root');
  const rootChildren = [];
  let sectionSelector = null;
  let itemSelector = null;
  const sectionChildren = [];
  const itemChildren = [];

  for (const key of structureKeys) {
    const node = spec.structure[key];
    const tag = node?.element || 'div';
    const classStr = node?.class || '';
    let sel = selectorFromClass(classStr);
    if (!sel) continue;
    if (criticalSelectors[sel] != null) sel = selectorFromClass(classStr, true);
    if (!sel) continue;

    const isSection = key === 'section' || key === 'header' || key === 'body' || key === 'footer';
    const isItem = key === 'item';
    const isChildOfItem = ['icon', 'label', 'delaLogo', 'delaLogoActive'].includes(key);
    if (isSection) sectionSelector = sel;
    if (isItem) itemSelector = sel;

    let styles = {};
    if (isSection && hasSection) {
      styles = mergeStyles(spec.section, node);
      styles.background = resolvedStates.default.background ?? styles.background ?? navBg ?? spec.states?.default?.background;
      styles.color = styles.color ?? resolvedStates.default.color ?? spec.states?.default?.text;
      if (spec.states?.default?.iconColor) styles['icon-color'] = spec.states.default.iconColor;
      styles.border = resolvedStates.default.border ?? styles.border;
      if (styles.gap != null && styles.display == null) {
        styles.display = 'flex';
        styles['flex-direction'] = 'column';
      }
    } else if (isChildOfItem && spec.typography) {
      styles = mergeStyles(spec.typography, camelToKebab(node));
    } else {
      styles = camelToKebab(node);
    }
    delete styles.element;
    delete styles.class;

    if (spec.states?.default && (isSection || isItem)) {
      styles.background = styles.background ?? resolvedStates.default.background ?? spec.states.default.background;
      styles.color = styles.color ?? resolvedStates.default.color ?? spec.states.default.text;
      styles.border = styles.border ?? resolvedStates.default.border;
      if (spec.states.default.iconColor) styles['icon-color'] = spec.states.default.iconColor;
    }
    if (spec.states?.item && isItem) {
      styles.background = resolvedStates.item.background ?? spec.states.item.background;
      styles.color = resolvedStates.item.color ?? spec.states.item.text;
      styles.border = resolvedStates.item.border ?? spec.states.item.border;
      if (spec.states.item.iconColor) styles['icon-color'] = spec.states.item.iconColor;
    }
    if (spec.icons) {
      if (key === 'icon') {
        const sz = spec.icons.iconSizePx || '24';
        styles.width = `${sz}px`;
        styles.height = `${sz}px`;
      } else if (key === 'delaLogo' || key === 'delaLogoActive') {
        const sz = spec.icons.delaLogoSizePx || '36';
        styles.width = `${sz}px`;
        styles.height = `${sz}px`;
      }
    }
    if (isItem && !styles.display) {
      styles.display = 'flex';
      styles['align-items'] = 'center';
      styles['justify-content'] = 'center';
    }

    let parentSel;
    if (isChildOfItem && itemSelector) parentSel = itemSelector;
    else if (isItem && sectionSelector) parentSel = sectionSelector;
    else if (isSection) parentSel = rootSelector;
    else parentSel = undefined;

    const el = {
      selector: sel,
      tag,
      parent: parentSel,
      styles,
    };
    if (isSection && spec.structure.item) {
      const itemSel = selectorFromClass(spec.structure.item.class);
      if (itemSel) el.children = [itemSel];
    }
    if (isItem && spec.template?.sections?.length) el.repeat = 'icons';
    if (spec.states?.hover && isItem) {
      el.states = {
        hover: stateToStyles(spec.states.hover),
        active: spec.states.active ? stateToStyles(spec.states.active) : undefined,
      };
      if (el.states.active && Object.keys(el.states.active).length === 0) delete el.states.active;
    }
    elements.push(el);
    if (isSection) rootChildren.push(sel);
    if (isItem && sectionSelector) sectionChildren.push(sel);
    if (isChildOfItem) itemChildren.push(sel);
    criticalSelectors[sel] = { ...styles };
  }

  if (rootChildren.length) rootElement.children = rootChildren;
  const sectionEl = elements.find((e) => e.selector === sectionSelector);
  if (sectionEl && sectionChildren.length) sectionEl.children = sectionChildren;
  const itemEl = elements.find((e) => e.selector === itemSelector);
  if (itemEl && itemChildren.length) itemEl.children = [...new Set(itemChildren)];

  // Ensure every parent and children selector exists as an element (validator requirement)
  const selectorSet = new Set(elements.map((e) => e.selector));
  const missing = [];
  for (const e of elements) {
    if (e.parent && !selectorSet.has(e.parent)) {
      missing.push(e.parent);
      selectorSet.add(e.parent);
    }
    if (e.children) {
      for (const c of e.children) {
        if (!selectorSet.has(c)) {
          missing.push(c);
          selectorSet.add(c);
        }
      }
    }
  }
  for (const sel of missing) {
    elements.push({ selector: sel, tag: 'div', styles: {} });
    criticalSelectors[sel] = criticalSelectors[sel] || {};
  }

  const icons = spec.template?.sections ? collectIconsFromTemplate(spec.template) : [];

  const out = {
    _meta: { theme, mode, locked: true },
    _buildContract: {
      criticalSelectors,
      forbiddenModifications: FORBIDDEN_MODIFICATIONS,
    },
    elements,
  };
  if (icons.length) out.icons = icons;
  if (spec.props) out.props = spec.props;
  if (spec.panelOpen) out.panelOpen = spec.panelOpen;
  return out;
}

const COMPONENT_CSS_PREFIX = {
  Button: 'btn',
  ButtonGroup: 'btn-group',
  DateTimePicker: 'datetime-picker',
  ProgressBar: 'progress',
  RadioButton: 'radio',
  Stepper: 'step',
  TabStrip: 'tab-panel',
  ShellHeader: 'header',
};

function getComponentCssPrefix(componentName) {
  return COMPONENT_CSS_PREFIX[componentName] ?? componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Resolve modifier selector for a dimension descriptor and value.
 * Returns { rootSelectors: string[], elementModifiers: { element: string, modifier: string }[] }.
 */
function getModifierSelectorsForDimension(componentName, descriptor, value, rootKey) {
  const rootSelectors = [];
  const elementModifiers = [];
  if (!value) return { rootSelectors, elementModifiers };

  const prefix = getComponentCssPrefix(componentName);

  if (descriptor.modifierType === 'class') {
    const sel = descriptor.pattern
      ? descriptor.pattern.replace('{prefix}', prefix).replace('{value}', value)
      : `${rootKey}--${value}`;
    rootSelectors.push(sel.startsWith('.') ? sel : '.' + sel);
  } else if (descriptor.modifierType === 'classWhen' && descriptor.valueClass?.[value]) {
    const cls = descriptor.valueClass[value];
    rootSelectors.push(cls.startsWith('.') ? cls : '.' + cls);
  } else if (descriptor.modifierType === 'elementClass' && descriptor.element) {
    const modifierSel = descriptor.pattern
      ? descriptor.pattern.replace('{value}', value)
      : `${descriptor.element}--${value}`;
    elementModifiers.push({ element: descriptor.element, modifier: modifierSel.startsWith('.') ? modifierSel : '.' + modifierSel });
  }
  return { rootSelectors, elementModifiers };
}

/**
 * Generate one spec for (componentName, dimensions).
 * dimensions: { theme, mode, variant, size, style, buttonType, headerVariant, ... }
 * Merges all dimension modifiers (root class, classWhen, elementClass) into elements.
 * Structure comes only from discoverComponentStructure (and ALERT_ENHANCED_STRUCTURE when applicable). No v1.
 */
const KEBAB_KEY = /^[a-z][a-z0-9-]*$/;

function toKebabStyles(styles) {
  if (!styles || typeof styles !== 'object') return styles;
  const out = {};
  for (const [k, v] of Object.entries(styles)) {
    if (KEBAB_KEY.test(k) && (typeof v === 'string' || typeof v === 'number')) out[k] = v;
  }
  return out;
}

export function generateSpec(componentName, dimensions, existingSpec = null, discovered = null) {
  const theme = typeof dimensions?.theme === 'string' ? dimensions.theme : 'cp';
  const mode = typeof dimensions?.mode === 'string' ? dimensions.mode : 'light';
  const size = dimensions?.size;

  const colors = loadColors();
  const tokens = loadTokensCSS();
  const getColor = colors.getColor.bind(colors);
  const getToken = tokens.getToken.bind(tokens);
  const getThemeToken = tokens.getThemeToken?.bind(tokens);
  const ctx = { getColor, getToken, getThemeToken, theme, mode, size, componentName };

  const discovery = discovered ?? discoverComponentStructure(componentName);
  const modifierRootStyles = discovery.modifierRootStyles || {};
  const modifierElementStyles = discovery.modifierElementStyles || {};
  const stateStyles = discovery.stateStyles || {};
  const descendantStateStyles = discovery.descendantStateStyles || {};
  const rootKey = '.' + getComponentCssPrefix(componentName);

  const allRootModifiers = [];
  const allElementModifiers = [];
  const descriptors = COMPONENT_DIMENSIONS[componentName] || [];
  for (const d of descriptors) {
    const value = dimensions?.[d.prop];
    const { rootSelectors, elementModifiers } = getModifierSelectorsForDimension(componentName, d, value, rootKey);
    allRootModifiers.push(...rootSelectors);
    allElementModifiers.push(...elementModifiers);
  }
  if (descriptors.length === 0 && dimensions?.variant) {
    allRootModifiers.push(`${rootKey}--${dimensions.variant}`);
  }

  const useEnhancedStructure =
    componentName === 'Alert' && dimensions?.style === 'enhanced' && ALERT_ENHANCED_STRUCTURE?.elements?.length;
  const elementList = useEnhancedStructure ? ALERT_ENHANCED_STRUCTURE.elements : discovery.elements;
  const bySelector = new Map();
  for (const el of discovery.elements || []) {
    bySelector.set(el.selector, el);
  }

  if (elementList?.length > 0) {
    const criticalSelectors = {};
    const elements = elementList.map((el) => {
      const baseEl = bySelector.get(el.selector);
      let merged = { ...(baseEl?.styles || el.styles || {}) };
      for (const modifierSelector of allRootModifiers) {
        if (el.selector === rootKey && modifierRootStyles[modifierSelector]) {
          Object.assign(merged, modifierRootStyles[modifierSelector]);
        }
        if (modifierElementStyles[modifierSelector]?.[el.selector]) {
          Object.assign(merged, modifierElementStyles[modifierSelector][el.selector]);
        }
      }
      for (const { element, modifier } of allElementModifiers) {
        if (el.selector === element && modifierElementStyles[modifier]?.[element]) {
          Object.assign(merged, modifierElementStyles[modifier][element]);
        }
      }
      const resolvedStyles = resolveStyles(merged, ctx);
      completeBorder(resolvedStyles, ctx);
      ensureFontFamily(resolvedStyles, ctx);
      const out = {
        selector: el.selector,
        tag: el.tag || 'div',
        styles: toKebabStyles(resolvedStyles),
      };
      if (el.children?.length) out.children = el.children;
      if (el.parent) out.parent = el.parent;
      let elStates = stateStyles[el.selector] || {};
      for (const modifierSelector of allRootModifiers) {
        if (stateStyles[modifierSelector] && el.selector === rootKey) {
          elStates = { ...elStates, ...stateStyles[modifierSelector] };
        }
      }
      if (descendantStateStyles[el.selector]) {
        elStates = { ...elStates, ...descendantStateStyles[el.selector] };
      }
      if (elStates && Object.keys(elStates).length > 0) {
        out.states = {};
        for (const [stateName, stateDecl] of Object.entries(elStates)) {
          out.states[stateName] = resolveStyles(stateDecl, ctx);
        }
      }
      criticalSelectors[el.selector] = { ...toKebabStyles(resolvedStyles) };
      return out;
    });
    // Ensure every parent and children selector exists as an element (validator requirement)
    const selectorSet = new Set(elements.map((e) => e.selector));
    const missing = [];
    for (const e of elements) {
      if (e.parent && !selectorSet.has(e.parent)) {
        missing.push(e.parent);
        selectorSet.add(e.parent);
      }
      if (e.children) {
        for (const c of e.children) {
          if (!selectorSet.has(c)) {
            missing.push(c);
            selectorSet.add(c);
          }
        }
      }
    }
    for (const sel of missing) {
      elements.push({ selector: sel, tag: 'div', styles: {} });
      criticalSelectors[sel] = criticalSelectors[sel] || {};
    }
    return {
      _meta: { theme, mode, locked: true },
      _buildContract: {
        criticalSelectors,
        forbiddenModifications: FORBIDDEN_MODIFICATIONS,
      },
      elements,
    };
  }

  const { variables } = discoverComponentVariables(componentName);
  const resolved = {};
  for (const varName of variables) {
    const value = resolveVariable(varName, ctx);
    if (value != null) resolved[varName] = value;
  }

  const root = COMPONENT_ROOT[componentName] ?? {
    selector: `.${componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`,
    tag: 'div',
  };

  const slug = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const sizeToken = size ? getToken(`${slug}-size-${size}`) : null;
  const primaryColor = getColor(theme, mode, 'primary');
  const radius = getToken('radius-08');

  const styles = {
    display: 'inline-flex',
    'align-items': 'center',
    'justify-content': 'center',
    'flex-shrink': '0',
    'border-radius': radius ?? '8px',
    background: primaryColor ?? resolved['theme-primary'],
  };

  if (sizeToken) {
    styles.width = sizeToken;
    styles.height = sizeToken;
    styles['min-width'] = sizeToken;
    styles['max-width'] = sizeToken;
  }

  return {
    _meta: { theme, mode, locked: true },
    _buildContract: {
      criticalSelectors: {
        [root.selector]: { ...styles },
      },
      forbiddenModifications: FORBIDDEN_MODIFICATIONS,
    },
    elements: [
      {
        selector: root.selector,
        tag: root.tag,
        styles,
      },
    ],
  };
}

const MODES = ['light', 'dark'];

/**
 * Parse spec key into full dimensions object { theme, mode, variant, size, style, buttonType, headerVariant, ... }.
 * When dimensionValues is provided, key was built from DIMENSION_KEY_ORDER (filtered by dimensionValues); split by '-' and map to dimension names.
 * When dimensionValues is null, fall back to legacy parse (theme, mode, variant, size only).
 */
function parseSpecKey(componentName, key, dimensionValues) {
  const parts = key.split('-');
  const out = { theme: undefined, mode: undefined, variant: undefined, size: undefined, style: undefined, buttonType: undefined, headerVariant: undefined, width: undefined };

  if (dimensionValues && COMPONENT_DIMENSIONS[componentName]) {
    const orderedDimNames = DIMENSION_KEY_ORDER.filter(
      (d) => d === 'theme' || d === 'mode' || dimensionValues[d]
    );
    if (parts.length === orderedDimNames.length) {
      for (let i = 0; i < orderedDimNames.length; i++) {
        out[orderedDimNames[i]] = parts[i];
      }
      return out;
    }
  }

  let variant, theme, mode, size;
  if (parts.length >= 4 && THEMES.includes(parts[1]) && MODES.includes(parts[2])) {
    variant = parts[0];
    theme = parts[1];
    mode = parts[2];
    size = parts[3] !== 'light' && parts[3] !== 'dark' ? parts[3] : undefined;
  } else if (parts.length >= 3 && THEMES.includes(parts[1]) && MODES.includes(parts[2])) {
    variant = parts[0];
    theme = parts[1];
    mode = parts[2];
    size = undefined;
  } else if (parts.length >= 3 && MODES.includes(parts[parts.length - 2])) {
    mode = parts[parts.length - 2];
    theme = parts[parts.length - 3];
    size = parts[parts.length - 1] !== 'light' && parts[parts.length - 1] !== 'dark' ? parts[parts.length - 1] : undefined;
  } else if (parts.length >= 2 && MODES.includes(parts[parts.length - 1])) {
    mode = parts[parts.length - 1];
    theme = parts[parts.length - 2];
    size = undefined;
  }
  out.variant = variant;
  out.theme = theme;
  out.mode = mode;
  out.size = size;
  return out;
}

/**
 * Generate full specs object for a component.
 * Keys come only from buildSpecMatrix (dimension config + parsed .astro props + THEMES × MODES). No v1 dependency.
 * When discovered is provided (e.g. from discoverComponentStructure with astStructure), uses it for all specs.
 * When dimensionValues is provided (from getDimensionValuesForComponent(componentName, parsed.props)), matrix uses full dimension product.
 */
export function generateComponentSpecs(componentName, existingSpecs = null, discovered = null, dimensionValues = null) {
  const keys = buildSpecMatrix(componentName, dimensionValues);
  const specs = {};
  for (const key of keys) {
    const dimensions = parseSpecKey(componentName, key, dimensionValues);
    specs[key] = generateSpec(componentName, dimensions, null, discovered);
  }
  return specs;
}

/**
 * Build complete component JSON: metadata from existing v2 file when present (option B), else from .astro + defaults.
 * Specs, specKeyOrder, dimensionDefaults, fonts, structure, contentOrder, defaultContent, layoutRules, icons are always regenerated.
 * No v1 dependency.
 */
export async function generateComponentJSON(componentName) {
  const v2Path = path.join(V2_COMPONENTS_DIR, `${componentName.toLowerCase()}.json`);
  let existing = {};
  if (fs.existsSync(v2Path)) {
    try {
      existing = JSON.parse(fs.readFileSync(v2Path, 'utf-8'));
    } catch (_) {}
  }

  const { name, type, filePath, description, props, defaults, guidance, interactivity, examples } = existing;

  const componentPath = getComponentPath(componentName);
  let discovered = null;
  let parsed = null;
  if (fs.existsSync(componentPath)) {
    try {
      parsed = await parseComponent(componentPath);
      discovered = discoverComponentStructure(componentName, undefined, { astStructure: parsed.structure });
    } catch (_) {}
  }

  const dimensionValues = parsed ? getDimensionValuesForComponent(componentName, parsed.props) : null;
  const base = {
    name: name ?? componentName,
    type: type ?? 'component',
    filePath: filePath ?? `src/components/ui/${componentName}.astro`,
    description: description ?? `${componentName} Component`,
    props: parsed?.props ?? props ?? {},
    defaults: defaults ?? { theme: 'cp', mode: 'light' },
    specs: generateComponentSpecs(componentName, null, discovered, dimensionValues),
    guidance: guidance ?? { patterns: {}, guidelines: {} },
  };
  if (interactivity) base.interactivity = interactivity;
  if (examples) base.examples = examples;

  if (Object.keys(base.specs || {}).length > 0) {
    let specKeyOrder;
    let dimensionDefaults;
    if (dimensionValues && Object.keys(dimensionValues).length > 0) {
      specKeyOrder = DIMENSION_KEY_ORDER.filter(
        (d) => d === 'theme' || d === 'mode' || dimensionValues[d]
      );
      const mergedDefaults = { theme: 'cp', mode: 'light', ...(defaults ?? {}) };
      dimensionDefaults = {};
      for (const d of specKeyOrder) {
        let val = mergedDefaults[d];
        if (val == null && parsed?.props?.[d]?.default != null) {
          val = parsed.props[d].default;
          if (typeof val === 'string' && (val.startsWith("'") || val.startsWith('"'))) {
            val = val.slice(1, -1);
          }
        }
        if (val == null && d === 'theme') val = 'cp';
        if (val == null && d === 'mode') val = 'light';
        if (val == null && dimensionValues[d]?.length) val = dimensionValues[d][0];
        if (val != null) {
          let s = String(val).trim();
          if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) s = s.slice(1, -1);
          dimensionDefaults[d] = s;
        }
      }
    } else {
      specKeyOrder = ['theme', 'mode'];
      const merged = { theme: 'cp', mode: 'light', ...(defaults ?? {}) };
      const norm = (v) => {
        if (v == null) return '';
        let s = String(v).trim();
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) s = s.slice(1, -1);
        return s;
      };
      dimensionDefaults = {
        theme: norm(merged.theme) || 'cp',
        mode: norm(merged.mode) || 'light',
      };
    }
    base.specKeyOrder = specKeyOrder;
    base.dimensionDefaults = dimensionDefaults;
  }

  if (parsed) {
    const contentOrder = getContentOrder(componentName, parsed.structure);
    if (contentOrder && Object.keys(contentOrder).length > 0) {
      for (const [k, v] of Object.entries(contentOrder)) base[k] = v;
    }
  } else {
    const contentOrderOverride = CONTENT_ORDER_OVERRIDES[componentName];
    if (contentOrderOverride) for (const [k, v] of Object.entries(contentOrderOverride)) base[k] = v;
  }

  if (discovered?.structure) base.structure = discovered.structure;

  const fonts = collectFontsFromSpecs(base.specs);
  if (Object.keys(fonts).length > 0) base.fonts = fonts;

  const defaultContent = getDefaultContent(componentName);
  if (defaultContent && Object.keys(defaultContent).length > 0) {
    base.defaultContent = defaultContent;
  } else {
    base.defaultContent = NO_DEFAULT_CONTENT_RULE;
  }

  const layoutRules = getLayoutRules(componentName);
  if (layoutRules && Object.keys(layoutRules).length > 0) base.layoutRules = layoutRules;

  const iconDescriptors = collectIconDescriptors(componentName);
  if (iconDescriptors.length > 0) {
    const icons = resolveIconsToMap(iconDescriptors, ROOT);
    if (Object.keys(icons).length > 0) base.icons = icons;
  }

  return base;
}

/**
 * Write generated component JSON to outputDir/<componentName>.json (lowercase filename).
 * @param {string} componentName - e.g. 'Avatar'
 * @param {string} outputDir - Path relative to project root (default: mcp-data/components-v2)
 * @returns {Promise<string>} Path to written file
 */
export async function writeComponentJSON(componentName, outputDir = 'mcp-data/components-v2') {
  const json = await generateComponentJSON(componentName);
  const ordered = orderComponentJSONKeys(json);
  const outPath = path.join(ROOT, outputDir, `${componentName.toLowerCase()}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n', 'utf-8');
  return outPath;
}

const VAR_RE = /var\s*\(\s*--[\w-]+\s*\)/g;

function collectVarRefs(obj, out = []) {
  if (obj == null) return out;
  if (typeof obj === 'string') {
    const matches = obj.matchAll(VAR_RE);
    for (const m of matches) out.push(m[0]);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) collectVarRefs(item, out);
    return out;
  }
  if (typeof obj === 'object') {
    for (const v of Object.values(obj)) collectVarRefs(v, out);
    return out;
  }
  return out;
}

/**
 * Validate specs: execution-format specs must have elements (array), _meta, _buildContract;
 * each element must have selector, tag, styles. No var(--*) may remain in styles or states.
 * @param {object} specs - specs object keyed by spec key
 * @returns {{ valid: boolean, errors: string[], unresolvedVars: { key: string, refs: string[] }[] }}
 */
export function validateComponentSpecs(specs) {
  const errors = [];
  const unresolvedVars = [];
  for (const [key, spec] of Object.entries(specs || {})) {
    if (Array.isArray(spec.elements)) {
      if (!spec._meta) errors.push(`${key}: missing _meta`);
      if (!spec._buildContract) errors.push(`${key}: missing _buildContract`);
      for (let i = 0; i < spec.elements.length; i++) {
        const el = spec.elements[i];
        if (!el.selector) errors.push(`${key}: elements[${i}] missing selector`);
        if (!el.tag) errors.push(`${key}: elements[${i}] missing tag`);
        if (!el.styles || typeof el.styles !== 'object') errors.push(`${key}: elements[${i}] missing styles object`);
      }
    }
    const refs = collectVarRefs(spec);
    if (refs.length > 0) {
      unresolvedVars.push({ key, refs: [...new Set(refs)] });
      errors.push(`${key}: unresolved var(--*) in spec: ${refs.slice(0, 3).join(', ')}${refs.length > 3 ? '...' : ''}`);
    }
  }
  return { valid: errors.length === 0, errors, unresolvedVars };
}

/**
 * Get all component names from src/components/ui/*.astro (single source of truth). No v1 dependency.
 * @returns {string[]} PascalCase component names
 */
export function getAllComponentNames() {
  if (!fs.existsSync(UI_COMPONENTS_DIR)) return [];
  const names = [];
  for (const f of fs.readdirSync(UI_COMPONENTS_DIR).sort()) {
    if (!f.endsWith('.astro')) continue;
    const base = path.basename(f, '.astro');
    names.push(base);
  }
  return [...new Set(names)].sort();
}

/**
 * List info for all components: name, expected spec count, has structure from discovery. No v1 dependency.
 * @returns {{ name: string, expectedSpecCount: number, hasStructure: boolean }[]}
 */
export function listComponentsWithInfo() {
  const componentNames = getAllComponentNames();
  const rows = [];
  for (const name of componentNames) {
    const componentPath = getComponentPath(name);
    const expectedSpecCount = buildSpecMatrix(name).length;
    let hasStructure = false;
    if (fs.existsSync(componentPath)) {
      try {
        const discovery = discoverComponentStructure(name);
        hasStructure = Array.isArray(discovery?.elements) && discovery.elements.length > 0;
      } catch (_) {}
    }
    rows.push({ name, expectedSpecCount, hasStructure });
  }
  return rows;
}

// --- CLI / test ---
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const list = args.includes('--list');
  const all = args.includes('--all');
  const componentName = args.find((a) => !a.startsWith('--')) ?? (all ? null : 'Avatar');

  if (list) {
    const rows = listComponentsWithInfo();
    console.log('Name\tExpected spec count\tHas structure (discovery)');
    console.log('-'.repeat(60));
    for (const r of rows) {
      console.log(`${r.name}\t${r.expectedSpecCount}\t${r.hasStructure ? 'yes' : 'no'}`);
    }
    console.log('-'.repeat(60));
    console.log(`Total: ${rows.length} components`);
  } else if (all && write) {
    const componentNames = getAllComponentNames();
    const results = [];
    let totalSpecs = 0;
    for (const name of componentNames) {
      const result = { name, specs: 0, valid: true, errors: [] };
      try {
        const json = await generateComponentJSON(name);
        result.specs = Object.keys(json.specs || {}).length;
        totalSpecs += result.specs;
        const validation = validateComponentSpecs(json.specs);
        result.valid = validation.valid;
        result.errors = validation.errors;
        const ordered = orderComponentJSONKeys(json);
        const outPath = path.join(ROOT, 'mcp-data', 'components-v2', `${name.toLowerCase()}.json`);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n', 'utf-8');
      } catch (err) {
        result.valid = false;
        result.errors = [err.message || String(err)];
      }
      results.push(result);
    }
    console.log('=== Summary ===');
    console.log(`Total components processed: ${results.length}`);
    console.log(`Total specs generated: ${totalSpecs}`);
    console.log('\nValidation per component:');
    const failed = [];
    for (const r of results) {
      const status = r.valid ? 'pass' : 'fail';
      console.log(`  ${r.name}: ${status} (${r.specs} specs)`);
      if (!r.valid) {
        failed.push(r);
        for (const e of r.errors) console.log(`    - ${e}`);
      }
    }
    if (failed.length > 0) {
      console.log('\n--- Failed components ---');
      for (const r of failed) {
        console.log(`${r.name}:`);
        for (const e of r.errors) console.log(`  ${e}`);
      }
    }
  } else if (all) {
    console.log('Use --all --write to generate and write all components to mcp-data/components-v2/');
  } else if (write) {
    const outPath = await writeComponentJSON(componentName);
    console.log(`Wrote ${componentName} to ${outPath}`);
    const json = await generateComponentJSON(componentName);
    const result = validateComponentSpecs(json.specs);
    if (result.valid) {
      console.log('Validation: OK (all specs have elements, _meta, _buildContract; each element has selector, tag, styles)');
    } else {
      console.log('Validation errors:', result.errors);
    }
    const stat = fs.statSync(outPath);
    const lines = fs.readFileSync(outPath, 'utf-8').split('\n').length;
    console.log(`File: ${stat.size} bytes, ${lines} lines`);
  } else {
    const json = await generateComponentJSON(componentName);
    console.log(`=== Generated ${Object.keys(json.specs).length} specs for ${componentName} ===\n`);
    console.log('--- cp-light-sm ---');
    console.log(JSON.stringify(json.specs['cp-light-sm'], null, 2));
    console.log('\n--- vp-dark-lg ---');
    console.log(JSON.stringify(json.specs['vp-dark-lg'], null, 2));
  }
  })();
}
