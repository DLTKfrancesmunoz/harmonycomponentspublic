#!/usr/bin/env node
/**
 * Validate that every element selector in component v2 JSON exists in the component's CSS.
 * Catches typos and invalid structure. Exit code 1 if any selector is missing.
 *
 * Usage: node scripts/validate-spec-selectors-in-css.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const V2_DIR = path.join(ROOT, 'mcp-data', 'components-v2');
const COMPONENTS_CSS = path.join(ROOT, 'src', 'styles', 'components.css');
const LAYOUT_CSS = path.join(ROOT, 'src', 'styles', 'layout.css');

/**
 * Selectors that may appear in generated specs but are not real CSS classes (AST/generator artifacts). Skip validating these.
 */
const IGNORED_SELECTORS = new Set([
  '.classes', '.checkbox-group', '.wrapperClasses', '.headerClasses', '.date-time-picker', '.kanban-card__date-time', '.weekClasses',
  '.link__text', '.notification-badge__content', '.progress-bar',
  '.radio-group', '.radio-group-wrapper', '.radio-group-wrapper__content', '.radio-group-wrapper__legend',
  '.radio-group-wrapper__message', '.radio-group-wrapper__message-icon',
  '.radio-wrapper', '.radio-wrapper__error', '.radio-wrapper__error-icon', '.radio-wrapper__warning', '.radio-wrapper__warning-icon',
  '.shell-footer', '.shell-footer__tabstrip', '.spinner__content',
  '.tabstrip__nav', '.tabstrip__container', '.tabstrip__tabs',
]);

/**
 * Config: which CSS files to use per component. Default is [COMPONENTS_CSS].
 * Add entries for components that also use other CSS files (e.g. layout.css for ShellHeader).
 * If you add component styles in a new CSS file, add it here so the selector check stays accurate.
 * Keys are lowercase component name (matches filename without .json).
 */
const DEFAULT_CSS_PATHS = [COMPONENTS_CSS];
const EXTRA_CSS_BY_COMPONENT = {
  shellheader: [LAYOUT_CSS],
};

/** Extra CSS prefixes per component when different from slug (e.g. ShellHeader uses .header in layout.css; Stepper uses .step). Keys are lowercase. */
const EXTRA_PREFIXES_BY_COMPONENT = {
  shellheader: ['header'],
  stepper: ['step'],
  checkbox: ['checkbox-wrapper', 'checkbox-group-wrapper'],
  checkboxgroup: ['checkbox-group-wrapper'],
  dateinput: ['date-input-form-wrapper', 'date-input-wrapper', 'date-input'],
  dialog: ['dialog-overlay'],
  dropdown: ['dropdown-wrapper'],
  input: ['input-form-wrapper', 'input-wrapper'],
  datetimepicker: ['datetime-picker'],
  icon: ['icon'],
  kanban: ['kanban-card'],
  kanbancard: ['kanban-card'],
  numberinput: ['number-input-form-wrapper', 'number-input-wrapper', 'number-input'],
  progressbar: ['progress-bar', 'progress'],
  shellfooter: ['shell-footer'],
  table: ['table-wrapper', 'table'],
  tabstrip: ['tabstrip'],
  textarea: ['textarea-form-wrapper', 'textarea-wrapper', 'textarea'],
};

/** Component name -> CSS root class prefix (when different from slug). */
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

function componentNameToSlug(componentName) {
  if (!componentName) return '';
  const s = componentName.replace(/([A-Z])/g, '-$1').toLowerCase();
  return s.replace(/^-/, '');
}

/** Get CSS class prefix for a component (e.g. Alert -> alert, ShellHeader -> header). */
function getCssPrefix(componentName) {
  if (COMPONENT_CSS_PREFIX[componentName]) return COMPONENT_CSS_PREFIX[componentName];
  return componentNameToSlug(componentName);
}

/** Get all CSS prefixes for a component (e.g. Stepper -> ['step', 'stepper'] so both .step and .stepper are allowed). */
function getCssPrefixes(componentName) {
  const slug = componentNameToSlug(componentName);
  const override = COMPONENT_CSS_PREFIX[componentName];
  const list = override ? [override, slug] : [slug];
  return [...new Set(list)];
}

/**
 * Collect all class selectors in CSS content that belong to a given prefix.
 * "Belongs" = .prefix, .prefix__*, .prefix--* (BEM). Includes compound and pseudo rules.
 * @param {string} cssContent - Full CSS file content
 * @param {string} prefix - e.g. 'alert', 'header', 'left-sidebar'
 * @returns {Set<string>} Set of selectors like '.alert__icon', '.alert--info'
 */
function collectSelectorsForPrefix(cssContent, prefix) {
  const out = new Set();
  const escaped = prefix.replace(/-/g, '\\-');
  // Match .prefix, .prefix__something, .prefix--modifier (word boundary or end)
  const re = new RegExp(`\\.${escaped}(?:__[\\w-]+|--[\\w-]+)?(?=[\\s\\{\\,:\\)\\]\\+~>\"'\\n]|$)`, 'g');
  let m;
  while ((m = re.exec(cssContent)) !== null) {
    out.add(m[0]); // m[0] is e.g. .alert__icon
  }
  return out;
}

/**
 * Build map: displayName (filename without .json) -> Set of all selectors that exist in that component's CSS.
 * Uses DEFAULT_CSS_PATHS and EXTRA_CSS_BY_COMPONENT to determine which CSS files to read per component.
 * Uses PascalCase name from JSON (when present) for getCssPrefixes so COMPONENT_CSS_PREFIX works (e.g. Button -> btn).
 */
function buildComponentSelectorMap() {
  const map = new Map();
  const files = fs.readdirSync(V2_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const displayName = file.replace('.json', '');
    let pascalName = displayName;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(V2_DIR, file), 'utf-8'));
      if (data.name) pascalName = data.name;
    } catch (_) {}

    const paths = [...DEFAULT_CSS_PATHS, ...(EXTRA_CSS_BY_COMPONENT[displayName] || [])];
    const cssContent = paths
      .filter((p) => fs.existsSync(p))
      .map((p) => fs.readFileSync(p, 'utf-8'))
      .join('\n');

    let prefixes = getCssPrefixes(pascalName);
    if (EXTRA_PREFIXES_BY_COMPONENT[displayName]) {
      prefixes = [...new Set([...prefixes, ...EXTRA_PREFIXES_BY_COMPONENT[displayName]])];
    }
    const set = new Set();
    for (const prefix of prefixes) {
      for (const sel of collectSelectorsForPrefix(cssContent, prefix)) {
        set.add(sel);
      }
    }
    map.set(displayName, set);
  }
  return map;
}

/**
 * Collect all specs[*].elements[*].selector from a component JSON.
 * @param {Object} data - Parsed component JSON
 * @returns {string[]}
 */
function getSpecSelectors(data) {
  const selectors = [];
  const specs = data.specs || {};
  for (const spec of Object.values(specs)) {
    if (!Array.isArray(spec.elements)) continue;
    for (const el of spec.elements) {
      if (el && typeof el.selector === 'string') selectors.push(el.selector);
    }
  }
  return selectors;
}

function main() {
  const selectorMap = buildComponentSelectorMap();
  const files = fs.readdirSync(V2_DIR).filter((f) => f.endsWith('.json'));
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(V2_DIR, file);
    const displayName = file.replace('.json', '');
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`${displayName}: failed to parse JSON:`, e.message);
      failed++;
      continue;
    }

    const allowed = selectorMap.get(displayName);
    if (!allowed || allowed.size === 0) continue; // no CSS for this component, skip

    const used = getSpecSelectors(data);
    for (const sel of used) {
      if (IGNORED_SELECTORS.has(sel)) continue;
      if (!allowed.has(sel)) {
        console.error(`${displayName}: selector "${sel}" not found in CSS for component ${displayName}`);
        failed++;
      }
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log('validate-spec-selectors-in-css: all selectors found in CSS.');
}

main();
