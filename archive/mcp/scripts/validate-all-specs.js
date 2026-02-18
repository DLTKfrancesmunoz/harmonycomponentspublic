#!/usr/bin/env node
/**
 * Validate every spec in mcp-data/components-v2/ against the execution format.
 *
 * Run: node scripts/validate-all-specs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_V2_DIR = path.join(ROOT, 'mcp-data', 'components-v2');

const VAR_PATTERN = /var\s*\(\s*--[\w-]+\s*\)/g;

/**
 * Collect all var(--*) in a value (string or nested in object/array).
 * @param {unknown} value
 * @param {string[]} out
 */
function collectVarRefs(value, out = []) {
  if (typeof value === 'string') {
    let m;
    VAR_PATTERN.lastIndex = 0;
    while ((m = VAR_PATTERN.exec(value)) !== null) out.push(m[0]);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectVarRefs(v, out));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectVarRefs(v, out));
  }
}

/**
 * Validate one spec.
 * @param {string} componentName
 * @param {string} specKey
 * @param {object} spec
 * @returns {string[]} errors (with component/spec/element path)
 */
function validateSpec(componentName, specKey, spec) {
  const errors = [];
  const pathPrefix = `${componentName} > ${specKey}`;

  // Required: _meta
  if (!spec._meta || typeof spec._meta !== 'object') {
    errors.push(`${pathPrefix}: missing _meta`);
  } else {
    if (typeof spec._meta.theme !== 'string') errors.push(`${pathPrefix}._meta: theme must be a string`);
    if (typeof spec._meta.mode !== 'string') errors.push(`${pathPrefix}._meta: mode must be a string`);
    if (typeof spec._meta.locked !== 'boolean') errors.push(`${pathPrefix}._meta: locked must be a boolean`);
  }

  // Required: _buildContract
  if (!spec._buildContract || typeof spec._buildContract !== 'object') {
    errors.push(`${pathPrefix}: missing _buildContract`);
  } else {
    const bc = spec._buildContract;
    if (!bc.criticalSelectors || typeof bc.criticalSelectors !== 'object') {
      errors.push(`${pathPrefix}._buildContract: criticalSelectors must be an object`);
    }
    if (!Array.isArray(bc.forbiddenModifications)) {
      errors.push(`${pathPrefix}._buildContract: forbiddenModifications must be an array`);
    }
  }

  // Required: elements (array, length >= 1)
  if (!Array.isArray(spec.elements)) {
    errors.push(`${pathPrefix}: elements must be an array`);
  } else if (spec.elements.length < 1) {
    errors.push(`${pathPrefix}: elements must have length >= 1`);
  } else {
    const selectors = new Set();
    for (let i = 0; i < spec.elements.length; i++) {
      const el = spec.elements[i];
      const elPath = `${pathPrefix}.elements[${i}]`;

      if (!el || typeof el !== 'object') {
        errors.push(`${elPath}: must be an object`);
        continue;
      }

      // Required: selector (string starting with ".")
      if (typeof el.selector !== 'string') {
        errors.push(`${elPath}: selector must be a string`);
      } else {
        if (!el.selector.startsWith('.')) {
          errors.push(`${elPath}: selector must start with "." (got "${el.selector}")`);
        }
        selectors.add(el.selector);
      }

      // Required: tag (string)
      if (typeof el.tag !== 'string') {
        errors.push(`${elPath}: tag must be a string`);
      }

      // Required: styles (object, kebab-case keys, NO var(--*) values)
      if (!el.styles || typeof el.styles !== 'object') {
        errors.push(`${elPath}: styles must be an object`);
      } else {
        const styleVarRefs = [];
        for (const [k, v] of Object.entries(el.styles)) {
          if (typeof v !== 'string' && typeof v !== 'number') {
            errors.push(`${elPath}.styles["${k}"]: value must be string or number`);
          }
          collectVarRefs(v, styleVarRefs);
          if (!/^[a-z][a-z0-9-]*$/.test(k)) {
            errors.push(`${elPath}.styles: keys must be kebab-case (got "${k}")`);
          }
        }
        if (styleVarRefs.length > 0) {
          errors.push(`${elPath}.styles: NO var(--*) allowed (found: ${[...new Set(styleVarRefs)].join(', ')})`);
        }
      }

      // Optional: parent (valid selector)
      if (el.parent !== undefined) {
        if (typeof el.parent !== 'string') {
          errors.push(`${elPath}: parent must be a string`);
        } else if (!el.parent.startsWith('.')) {
          errors.push(`${elPath}: parent must be a valid selector starting with "."`);
        }
      }

      // Optional: children (array of valid selectors)
      if (el.children !== undefined) {
        if (!Array.isArray(el.children)) {
          errors.push(`${elPath}: children must be an array of strings`);
        }
      }

      // Optional: states, repeat - no strict validation beyond existence
    }

    // Cross-check: every parent points to an existing selector
    for (let i = 0; i < spec.elements.length; i++) {
      const el = spec.elements[i];
      if (!el) continue;
      const elPath = `${pathPrefix}.elements[${i}]`;
      if (el.parent != null && typeof el.parent === 'string' && !selectors.has(el.parent)) {
        errors.push(`${elPath}: parent "${el.parent}" does not match any element selector`);
      }
      if (Array.isArray(el.children)) {
        for (const c of el.children) {
          if (typeof c === 'string' && !selectors.has(c)) {
            errors.push(`${elPath}: children entry "${c}" does not match any element selector`);
          }
        }
      }
    }

    // Cross-check: criticalSelectors keys match element selectors
    const criticalSelectors = spec._buildContract?.criticalSelectors;
    if (criticalSelectors && typeof criticalSelectors === 'object') {
      const criticalKeys = new Set(Object.keys(criticalSelectors));
      for (const sel of selectors) {
        if (!criticalKeys.has(sel)) {
          errors.push(`${pathPrefix}._buildContract.criticalSelectors: missing key for element selector "${sel}"`);
        }
      }
      for (const key of Object.keys(criticalSelectors)) {
        if (!selectors.has(key)) {
          errors.push(`${pathPrefix}._buildContract.criticalSelectors: key "${key}" does not match any element selector`);
        }
      }
    }
  }

  return errors;
}

/**
 * Validate one component JSON file.
 * @param {string} filePath
 * @param {object} data
 * @returns {{ componentName: string, specCount: number, errors: string[] }}
 */
function validateComponentFile(filePath, data) {
  const componentName = path.basename(filePath, '.json');
  const errors = [];
  const specs = data.specs;

  if (!specs || typeof specs !== 'object') {
    return { componentName, specCount: 0, errors: [`${componentName}: missing or invalid specs object`] };
  }

  const specKeys = Object.keys(specs);
  for (const specKey of specKeys) {
    errors.push(...validateSpec(componentName, specKey, specs[specKey]));
  }

  return { componentName, specCount: specKeys.length, errors };
}

/**
 * Main: validate all component JSONs in components-v2.
 */
function main() {
  if (!fs.existsSync(COMPONENTS_V2_DIR)) {
    console.error('Directory not found:', COMPONENTS_V2_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(COMPONENTS_V2_DIR).filter((f) => f.endsWith('.json')).sort();
  let totalSpecs = 0;
  const results = [];
  const allErrors = [];

  for (const file of files) {
    const filePath = path.join(COMPONENTS_V2_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      results.push({ componentName: path.basename(file, '.json'), specCount: 0, errors: [`Parse error: ${e.message}`] });
      allErrors.push(...results[results.length - 1].errors);
      continue;
    }
    const result = validateComponentFile(filePath, data);
    totalSpecs += result.specCount;
    results.push(result);
    allErrors.push(...result.errors);
  }

  // Report
  console.log('=== Validation Report (execution format) ===\n');
  console.log('Total components checked:', results.length);
  console.log('Total specs checked:', totalSpecs);
  console.log('');

  let passCount = 0;
  let failCount = 0;
  const failedComponents = [];

  for (const r of results) {
    const pass = r.errors.length === 0;
    if (pass) passCount++;
    else {
      failCount++;
      failedComponents.push(r.componentName);
    }
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`${status}  ${r.componentName} (${r.specCount} specs)${pass ? '' : ` — ${r.errors.length} error(s)`}`);
  }

  console.log('\n--- Summary ---');
  console.log(`Pass: ${passCount}`);
  console.log(`Fail: ${failCount}`);

  if (allErrors.length > 0) {
    console.log('\n--- All validation errors (component > spec > element path) ---');
    allErrors.forEach((e) => console.log('  ' + e));
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main();
