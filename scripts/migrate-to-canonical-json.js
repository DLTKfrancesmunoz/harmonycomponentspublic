#!/usr/bin/env node
/**
 * One-time migration: convert component JSON to canonical format.
 * Keeps: name, type, filePath, description, props, defaults, specs, guidance.
 * Removes: visualSpecifications, buildSpecs (moved to specs), _metadata, cssClasses, themeSupport, slots, structure, imports, dependencies.
 * Replaces null and "transparent" in specs with resolved values from token map (cp-light, cp-dark, etc.).
 *
 * Usage: node scripts/migrate-to-canonical-json.js
 * Skip: card.json, rightsidebar.json (already canonical).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'mcp-data', 'components');
const COLORS_JSON = path.join(ROOT, 'src', 'tokens', 'colors.json');

const SKIP = new Set(['card.json', 'rightsidebar.json']);

// Resolved values per theme-mode for filling transparent/null (from colors.json).
const TOKEN_BY_THEME_MODE = {
  'cp-light': { background: '#F7F8FA', text: '#373F4E', border: '#BFC6D4', iconColor: '#373F4E' },
  'cp-dark': { background: '#37424D', text: '#E9ECEF', border: '#5F6871', iconColor: '#E9ECEF' },
  'vp-light': { background: '#F7F8FA', text: '#373F4E', border: '#BFC6D4', iconColor: '#373F4E' },
  'vp-dark': { background: '#1F2124', text: '#FAFAFA', border: '#2A2D32', iconColor: '#FAFAFA' },
  'ppm-light': { background: '#F7F8FA', text: '#373F4E', border: '#BFC6D4', iconColor: '#373F4E' },
  'ppm-dark': { background: '#1F2124', text: '#FAFAFA', border: '#2A2D32', iconColor: '#FAFAFA' },
  'maconomy-light': { background: '#F7F8FA', text: '#373F4E', border: '#BFC6D4', iconColor: '#373F4E' },
  'maconomy-dark': { background: '#1F2124', text: '#FAFAFA', border: '#2A2D32', iconColor: '#FAFAFA' },
};

function themeModeFromSpecKey(key) {
  const parts = key.split('-');
  if (parts.length >= 3 && ['light', 'dark'].includes(parts[parts.length - 1])) {
    const mode = parts.pop();
    const theme = parts[parts.length - 1];
    if (['cp', 'vp', 'ppm', 'maconomy'].includes(theme)) {
      return `${theme}-${mode}`;
    }
  }
  return 'cp-light';
}

function fillValue(val, themeMode, field) {
  if (val === null || val === undefined) {
    const t = TOKEN_BY_THEME_MODE[themeMode] || TOKEN_BY_THEME_MODE['cp-light'];
    if (field === 'background') return t.background;
    if (field === 'text' || field === 'iconColor') return t.text;
    if (field === 'border') return `1px solid ${t.border}`;
    return '';
  }
  if (val === 'transparent') {
    const t = TOKEN_BY_THEME_MODE[themeMode] || TOKEN_BY_THEME_MODE['cp-light'];
    if (field === 'background') return t.background;
    if (field === 'border') return `1px solid ${t.border}`;
    return val;
  }
  return val;
}

function migrateSpec(spec, specKey) {
  if (!spec || typeof spec !== 'object') return spec;
  const themeMode = themeModeFromSpecKey(specKey);
  const out = JSON.parse(JSON.stringify(spec));

  if (out.states && typeof out.states === 'object') {
    for (const stateKey of Object.keys(out.states)) {
      const state = out.states[stateKey];
      if (!state || typeof state !== 'object') continue;
      if (state.background !== undefined) state.background = fillValue(state.background, themeMode, 'background');
      if (state.text !== undefined) state.text = fillValue(state.text, themeMode, 'text');
      if (state.border !== undefined) state.border = fillValue(state.border, themeMode, 'border');
      if (state.iconColor !== undefined) state.iconColor = fillValue(state.iconColor, themeMode, 'iconColor');
    }
  }

  if (out.borders) {
    if (out.borders.width === null || out.borders.width === undefined) out.borders.width = '0';
    if (out.borders.style === null || out.borders.style === undefined) out.borders.style = 'solid';
  }
  if (out.typography && (out.typography.lineHeight === null || out.typography.lineHeight === undefined)) {
    out.typography.lineHeight = '1.5';
  }
  if (out.dimensions && (out.dimensions.height === null || out.dimensions.height === undefined)) {
    out.dimensions.height = 'auto';
  }
  if (out.icons === null) out.icons = {};

  return out;
}

function buildDefaults(data) {
  const d = { theme: 'cp', mode: 'light' };
  if (data.props?.variant?.default != null) d.variant = data.props.variant.default;
  if (data.props?.size?.default != null) d.size = data.props.size.default;
  return d;
}

function buildGuidance(data) {
  const patterns = data.usagePatterns || {};
  const guidelines = {};
  if (data.aiContext) {
    if (data.aiContext.commonUseCases) guidelines.commonUseCases = data.aiContext.commonUseCases;
    if (data.aiContext.antiPatterns) guidelines.antiPatterns = data.aiContext.antiPatterns;
    if (data.aiContext.propGuidance) guidelines.propGuidance = data.aiContext.propGuidance;
    if (data.aiContext.typicalCompositions) guidelines.typicalCompositions = data.aiContext.typicalCompositions;
  }
  return { patterns, guidelines };
}

function migrateComponent(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  const canonical = {
    name: data.name,
    type: data.type || 'component',
    filePath: data.filePath,
    description: data.description || '',
    props: data.props || {},
    defaults: buildDefaults(data),
    specs: {},
    guidance: buildGuidance(data),
  };

  if (data.buildSpecs && typeof data.buildSpecs === 'object') {
    for (const [key, spec] of Object.entries(data.buildSpecs)) {
      canonical.specs[key] = migrateSpec(spec, key);
    }
  }

  return canonical;
}

function main() {
  const files = fs.readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.json') && !SKIP.has(f));
  let count = 0;
  for (const file of files) {
    const filePath = path.join(COMPONENTS_DIR, file);
    try {
      const canonical = migrateComponent(filePath);
      fs.writeFileSync(filePath, JSON.stringify(canonical, null, 2) + '\n', 'utf-8');
      console.log(`  ${canonical.name}: ${Object.keys(canonical.specs).length} spec(s)`);
      count++;
    } catch (err) {
      console.error(`  ${file}: ${err.message}`);
    }
  }
  console.log(`\nMigrated ${count} component(s). Skipped: ${[...SKIP].join(', ')}`);
}

main();
