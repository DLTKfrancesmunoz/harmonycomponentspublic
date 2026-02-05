#!/usr/bin/env node
/**
 * Validate component v2 JSON: no null in spec payloads; multi-element components have multiple elements.
 * Exit code 1 if any check fails (for CI).
 *
 * Usage: node scripts/validate-spec-completeness.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const V2_DIR = path.join(ROOT, 'mcp-data', 'components-v2');

/** Components that must have at least one spec with multiple elements (from GENERATED_SPECS_ELEMENTS_SUMMARY). */
const MULTI_ELEMENT_COMPONENTS = new Set([
  'Alert',
  'Dialog',
  'Input',
  'Card',
  'RightSidebar',
  'LeftSidebar',
  'ShellPanel',
  'ShellHeader',
  'Accordion',
  'Table',
  'PickerPopup',
  'Kanban',
  'Stepper',
  'Dropdown',
  'Tooltip',
  'ListMenu',
]);

/** Returns true if obj contains null anywhere (used only for spec payload, not props). */
function containsNull(obj) {
  if (obj === null) return true;
  if (typeof obj !== 'object') return false;
  for (const value of Object.values(obj)) {
    if (value === null) return true;
    if (typeof value === 'object' && containsNull(value)) return true;
  }
  return false;
}

/** Check that no null appears in spec payload (_buildContract or elements[].styles). */
function checkNoNullInSpecPayload(data) {
  const bad = [];
  for (const [specKey, spec] of Object.entries(data.specs || {})) {
    if (spec._buildContract && containsNull(spec._buildContract)) {
      bad.push(`specs.${specKey}._buildContract`);
    }
    if (Array.isArray(spec.elements)) {
      for (let i = 0; i < spec.elements.length; i++) {
        const el = spec.elements[i];
        if (el && el.styles && containsNull(el.styles)) {
          bad.push(`specs.${specKey}.elements[${i}].styles`);
        }
      }
    }
  }
  return bad;
}

/** Check that multi-element components have at least one spec with elements.length > 1. */
function checkMultiElement(componentName, data) {
  if (!MULTI_ELEMENT_COMPONENTS.has(componentName)) return null;
  const hasMulti = Object.values(data.specs || {}).some(
    (spec) => Array.isArray(spec.elements) && spec.elements.length > 1
  );
  return hasMulti ? null : `expected at least one spec with elements.length > 1`;
}

/** When specs exist, require root-level specKeyOrder and dimensionDefaults (SPEC_CONTRACT). */
function checkSpecContractKeys(data) {
  const specs = data.specs || {};
  if (Object.keys(specs).length === 0) return [];
  const missing = [];
  if (!data.specKeyOrder || !Array.isArray(data.specKeyOrder)) {
    missing.push('specKeyOrder');
  }
  if (!data.dimensionDefaults || typeof data.dimensionDefaults !== 'object') {
    missing.push('dimensionDefaults');
  }
  return missing;
}

function main() {
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

    const nullViolations = checkNoNullInSpecPayload(data);
    if (nullViolations.length) {
      console.error(`${displayName}: null not allowed in spec payload: ${nullViolations.join(', ')}`);
      failed++;
    }

    const componentName = data.name || displayName;
    const multiErr = checkMultiElement(componentName, data);
    if (multiErr) {
      console.error(`${displayName}: ${multiErr}`);
      failed++;
    }

    const contractMissing = checkSpecContractKeys(data);
    if (contractMissing.length) {
      console.error(`${displayName}: when specs exist, required keys missing: ${contractMissing.join(', ')}`);
      failed++;
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log('validate-spec-completeness: all checks passed.');
}

main();
