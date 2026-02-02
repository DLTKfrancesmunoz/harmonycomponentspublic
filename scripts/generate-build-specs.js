#!/usr/bin/env node
/**
 * DEPRECATED for canonical spec data. The canonical format uses `specs` (not buildSpecs)
 * in each component JSON; get_specs reads specs and guidance directly. Do not run this
 * script to feed exact-build data. See docs/SPEC_CONTRACT.md and MCP-SETUP.md.
 *
 * Legacy: Generate build specs from component JSON (visualSpecifications + tokens).
 * For each component × variant × theme × mode × size, produces one flattened buildSpec.
 * Usage: node scripts/generate-build-specs.js
 * Output: Adds buildSpecs and guidance to each mcp-data/components/*.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveCSSVariables, getResolvedValue } from './css-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'mcp-data', 'components');
const TOKENS_CSS = path.join(ROOT, 'src', 'styles', 'tokens.css');
const DESIGN_SYSTEM_OVERVIEW_JSON = path.join(ROOT, 'mcp-data', 'design-system-overview.json');
const THEMES = ['cp', 'vp', 'ppm', 'maconomy'];
const MODES = ['light', 'dark'];
const BASE_STATE_KEYS = ['default', 'hover', 'active', 'focus', 'disabled'];
const OPTIONAL_STATE_KEYS = ['item', 'icon', 'label'];
const DEFAULT_SIZES = ['xs', 'sm', 'md', 'lg'];

// Component-specific icon size map (button size -> icon px). Override when present in component.
const COMPONENT_ICON_SIZE_MAP = {
  Button: { xs: '12px', sm: '16px', md: '16px', lg: '20px' },
  Chip: { sm: '12px', md: '16px', lg: '20px' },
};

/** Defaults used when filling nulls in buildSpec (borders, typography, dimensions). */
const BUILD_SPEC_DEFAULTS = {
  borders: { width: '0', style: 'solid' },
  typography: { lineHeight: '1.5' },
  dimensions: { height: 'auto' },
};

/**
 * Recursively resolve all var() references in an object.
 * Uses theme-mode context (e.g. cp-light) for variable resolution.
 */
function resolveSpecValues(obj, variableMap, context = 'cp-light') {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.includes('var(')) {
      const resolved = getResolvedValue(obj, variableMap, context);
      if (resolved.includes('var(') && context !== 'light') {
        return getResolvedValue(resolved, variableMap, 'light');
      }
      return resolved;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveSpecValues(item, variableMap, context));
  }
  if (typeof obj === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) {
        out[key] = value;
      } else {
        out[key] = resolveSpecValues(value, variableMap, context);
      }
    }
    return out;
  }
  return obj;
}

/**
 * Fill null values in buildSpec from default state or design defaults.
 * Ensures borders, typography lineHeight, dimensions height, and state text/iconColor/border have values when possible.
 */
function fillNullsInSpec(spec, designDefaults = BUILD_SPEC_DEFAULTS) {
  const defs = designDefaults || BUILD_SPEC_DEFAULTS;
  if (spec.borders) {
    if (spec.borders.width == null) spec.borders.width = defs.borders?.width ?? '0';
    if (spec.borders.style == null) spec.borders.style = defs.borders?.style ?? 'solid';
    if (spec.borders.radius == null && defs.borders?.radius) spec.borders.radius = defs.borders.radius;
  }
  if (spec.typography && spec.typography.lineHeight == null) {
    spec.typography.lineHeight = defs.typography?.lineHeight ?? '1.5';
  }
  if (spec.dimensions && spec.dimensions.height == null) {
    spec.dimensions.height = defs.dimensions?.height ?? 'auto';
  }
  if (spec.states && typeof spec.states === 'object') {
    const defaultState = spec.states.default || {};
    for (const stateKey of BASE_STATE_KEYS) {
      const state = spec.states[stateKey];
      if (!state || typeof state !== 'object') continue;
      if (state.text == null && defaultState.text != null) state.text = defaultState.text;
      if (state.iconColor == null && defaultState.iconColor != null) state.iconColor = defaultState.iconColor;
      if (state.border == null && defaultState.border != null) state.border = defaultState.border;
      if (state.background == null && defaultState.background != null) state.background = defaultState.background;
    }
  }
  return spec;
}

/** Resolve a token and return a concrete value (no var() left); fallback if unresolved. */
function resolvedOrFallback(cssVar, variableMap, context, fallback) {
  const v = getResolvedValue(cssVar, variableMap, context);
  return v && !String(v).includes('var(') ? v : fallback;
}

/**
 * Fill any remaining nulls in states with resolved theme tokens so MCP/build_component
 * never receives null — it needs concrete values to build from.
 * Text and icon color are known (--text-primary); border from --border-color.
 */
function fillStateNullsWithTokens(spec, variableMap, context) {
  if (!spec.states || typeof spec.states !== 'object' || !variableMap || typeof variableMap !== 'object') return spec;
  const textVal = resolvedOrFallback('var(--text-primary)', variableMap, context, '#373F4E');
  const borderVal = resolvedOrFallback('var(--border-color)', variableMap, context, 'transparent');
  for (const stateKey of BASE_STATE_KEYS) {
    const state = spec.states[stateKey];
    if (!state || typeof state !== 'object') continue;
    if (state.text == null) state.text = textVal;
    if (state.iconColor == null) state.iconColor = textVal;
    if (state.border == null) state.border = borderVal;
    if (state.background == null) state.background = 'transparent';
  }
  return spec;
}

/**
 * Fill null text/iconColor/border/background in visualSpecifications.colors.variants
 * with resolved theme tokens so we never persist null for known values (--text-primary, etc.).
 */
function fillVisualSpecStateNulls(componentData, variableMap) {
  if (!variableMap || typeof variableMap !== 'object') return;
  const variants = componentData.visualSpecifications?.colors?.variants;
  if (!variants || typeof variants !== 'object') return;
  for (const variantName of Object.keys(variants)) {
    const themeData = variants[variantName];
    if (!themeData || typeof themeData !== 'object') continue;
    for (const theme of THEMES) {
      if (!themeData[theme]) continue;
      for (const mode of MODES) {
        if (!themeData[theme][mode]) continue;
        const context = `${theme}-${mode}`;
        const textVal = resolvedOrFallback('var(--text-primary)', variableMap, context, '#373F4E');
        const borderVal = resolvedOrFallback('var(--border-color)', variableMap, context, 'transparent');
        const modeObj = themeData[theme][mode];
        for (const stateKey of BASE_STATE_KEYS) {
          const state = modeObj[stateKey];
          if (!state || typeof state !== 'object') continue;
          if (state.text == null) state.text = textVal;
          if (state.iconColor == null) state.iconColor = textVal;
          if (state.border == null) state.border = borderVal;
          if (state.background == null) state.background = 'transparent';
        }
      }
    }
  }
  // Same for _variantIndex (theme-keyed copy of variant state data)
  const index = componentData._variantIndex;
  if (!index || typeof index !== 'object') return;
  for (const key of Object.keys(index)) {
    const entry = index[key];
    if (!entry || !entry.theme) continue;
    const theme = entry.theme;
    for (const mode of MODES) {
      const modeObj = entry[mode];
      if (!modeObj || typeof modeObj !== 'object') continue;
      const context = `${theme}-${mode}`;
      const textVal = resolvedOrFallback('var(--text-primary)', variableMap, context, '#373F4E');
      const borderVal = resolvedOrFallback('var(--border-color)', variableMap, context, 'transparent');
      for (const stateKey of BASE_STATE_KEYS) {
        const state = modeObj[stateKey];
        if (!state || typeof state !== 'object') continue;
        if (state.text == null) state.text = textVal;
        if (state.iconColor == null) state.iconColor = textVal;
        if (state.border == null) state.border = borderVal;
        if (state.background == null) state.background = 'transparent';
      }
    }
  }
}

function ensureAllStatesPresent(modeObj) {
  if (!modeObj || typeof modeObj !== 'object') return modeObj;
  const defaultState = modeObj.default || {};
  const result = { ...modeObj };
  for (const k of BASE_STATE_KEYS) {
    if (!(k in result) || (typeof result[k] === 'object' && Object.keys(result[k] || {}).length === 0)) {
      result[k] = k === 'default' ? defaultState : { ...defaultState, ...(result[k] || {}) };
    }
  }
  return result;
}

function buildOneSpec(componentData, variant, theme, mode, size, variableMap, designDefaults) {
  const vs = componentData.visualSpecifications || {};
  const name = componentData.name;

  const variantData = vs.colors?.variants?.[variant];
  if (!variantData?.[theme]?.[mode]) return null;

  const modeStates = ensureAllStatesPresent({ ...variantData[theme][mode] });

  const spacingBySize = vs.spacing?.[size] || vs.spacing?.md || {};
  const dimensionsBySize = vs.dimensions?.[size] || vs.dimensions?.md || {};
  const typographySizes = vs.typography?.sizes || {};
  const typographySize = typographySizes[size] || typographySizes.md || {};

  const layout = {
    display: vs.layout?.display ?? 'inline-flex',
    flexDirection: vs.layout?.flexDirection ?? 'row',
    alignItems: vs.layout?.alignItems ?? 'center',
    justifyContent: vs.layout?.justifyContent ?? 'center',
    gap: spacingBySize.gap ?? '8px',
  };

  const iconSizeMap = COMPONENT_ICON_SIZE_MAP[name] || vs.iconSpecs?.sizes;
  const iconSizePx = iconSizeMap?.[size] || vs.iconSpecs?.sizes?.[size] || '16px';

  let buildSpec = {
    props: componentData.props || {},
    layout,
    spacing: {
      paddingTop: spacingBySize.paddingTop ?? '0',
      paddingRight: spacingBySize.paddingRight ?? '0',
      paddingBottom: spacingBySize.paddingBottom ?? '0',
      paddingLeft: spacingBySize.paddingLeft ?? '0',
    },
    dimensions: {
      height: dimensionsBySize.height ?? null,
      minWidth: dimensionsBySize.minWidth ?? 'auto',
      maxWidth: dimensionsBySize.maxWidth ?? 'none',
    },
    typography: {
      fontFamily: vs.typography?.fontFamily ?? "'Figtree', sans-serif",
      fontSize: typographySize.fontSize ?? '1rem',
      fontWeight: vs.typography?.fontWeight ?? '500',
      lineHeight: typographySize.lineHeight ?? null,
    },
    borders: {
      width: vs.borders?.width ?? null,
      style: vs.borders?.style ?? null,
      radius: vs.borders?.radius?.default ?? vs.borders?.radius?.[size] ?? null,
    },
    states: modeStates,
    icons: componentData.dependencies?.includes('Icon')
      ? { iconSizePx, gapBetweenIconAndText: spacingBySize.gap ?? '8px' }
      : null,
  };

  const context = `${theme}-${mode}`;
  buildSpec = resolveSpecValues(buildSpec, variableMap || {}, context);
  buildSpec = fillNullsInSpec(buildSpec, designDefaults);
  buildSpec = fillStateNullsWithTokens(buildSpec, variableMap || {}, context);
  return buildSpec;
}

function getVariantsWithColors(componentData) {
  const vs = componentData.visualSpecifications?.colors?.variants;
  if (!vs) return [];
  return Object.keys(vs);
}

function getSizesForComponent(componentData) {
  const dims = componentData.visualSpecifications?.dimensions;
  if (!dims) return DEFAULT_SIZES;
  const sizes = Object.keys(dims).filter((s) => dims[s]?.height != null || dims[s]?.width != null);
  return sizes.length ? sizes : DEFAULT_SIZES;
}

function generateBuildSpecs(componentData, variableMap, designDefaults) {
  const buildSpecs = {};
  const variants = getVariantsWithColors(componentData);
  const sizes = getSizesForComponent(componentData);

  for (const variant of variants) {
    for (const theme of THEMES) {
      const variantData = componentData.visualSpecifications?.colors?.variants?.[variant]?.[theme];
      if (!variantData) continue;
      for (const mode of MODES) {
        if (!variantData[mode]) continue;
        for (const size of sizes) {
          const spec = buildOneSpec(componentData, variant, theme, mode, size, variableMap, designDefaults);
          if (spec) {
            const key = `${variant}-${theme}-${mode}-${size}`;
            buildSpecs[key] = spec;
          }
        }
      }
    }
  }

  return buildSpecs;
}

function buildGuidance(componentData) {
  const patterns = componentData.usagePatterns || {};
  const guidelines = {};
  if (componentData.aiContext) {
    if (componentData.aiContext.commonUseCases) guidelines.commonUseCases = componentData.aiContext.commonUseCases;
    if (componentData.aiContext.antiPatterns) guidelines.antiPatterns = componentData.aiContext.antiPatterns;
    if (componentData.aiContext.propGuidance) guidelines.propGuidance = componentData.aiContext.propGuidance;
    if (componentData.aiContext.typicalCompositions) guidelines.typicalCompositions = componentData.aiContext.typicalCompositions;
  }
  return { patterns, guidelines };
}

function processComponentFile(filePath, variableMap, designDefaults) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  // Fill known text/iconColor/border in source so we never persist null
  fillVisualSpecStateNulls(data, variableMap);

  const buildSpecs = generateBuildSpecs(data, variableMap, designDefaults);
  const guidance = buildGuidance(data);

  data.buildSpecs = buildSpecs;
  data.guidance = guidance;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  return { name: data.name, buildSpecCount: Object.keys(buildSpecs).length };
}

function loadDesignDefaults() {
  let defaults = { ...BUILD_SPEC_DEFAULTS };
  try {
    if (fs.existsSync(DESIGN_SYSTEM_OVERVIEW_JSON)) {
      const overview = JSON.parse(fs.readFileSync(DESIGN_SYSTEM_OVERVIEW_JSON, 'utf-8'));
      if (overview.typography?.fontSizes?.base) {
        defaults.typography = defaults.typography || {};
        defaults.typography.lineHeight = defaults.typography.lineHeight ?? '1.5';
      }
      if (overview.borderRadius?.scale?.[0]) {
        defaults.borders = defaults.borders || {};
        defaults.borders.radius = defaults.borders.radius ?? overview.borderRadius.scale[0];
      }
    }
  } catch (_) {
    // use BUILD_SPEC_DEFAULTS only
  }
  return defaults;
}

function main() {
  let variableMap = {};
  if (fs.existsSync(TOKENS_CSS)) {
    const tokensCssContent = fs.readFileSync(TOKENS_CSS, 'utf-8');
    variableMap = resolveCSSVariables(tokensCssContent);
    console.log(`Resolved ${Object.keys(variableMap).length} CSS variables from tokens.css\n`);
  } else {
    console.warn('tokens.css not found; buildSpecs will not resolve var() references.\n');
  }

  const designDefaults = loadDesignDefaults();

  const files = fs.readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.json'));
  let processed = 0;
  for (const file of files) {
    const filePath = path.join(COMPONENTS_DIR, file);
    try {
      const result = processComponentFile(filePath, variableMap, designDefaults);
      console.log(`  ${result.name}: ${result.buildSpecCount} build spec(s)`);
      processed++;
    } catch (err) {
      console.error(`  ${file}: ${err.message}`);
    }
  }
  console.log(`\nDone. Processed ${processed} component(s).`);
}

main();
