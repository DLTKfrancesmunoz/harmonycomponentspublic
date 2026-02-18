#!/usr/bin/env node
/**
 * One-off: Replace every "transparent" in component v2 spec payloads with "rgba(0,0,0,0)".
 * SPEC_CONTRACT: no null, no transparent, no var() in specs. Run this then validate with validate-spec-completeness.js.
 *
 * Usage: node scripts/fix-transparent-in-specs.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const V2_DIR = path.join(ROOT, 'mcp-data', 'components-v2');

const RESOLVED_TRANSPARENT = 'rgba(0,0,0,0)';

/** Mutate obj in place: replace any string value "transparent" with RESOLVED_TRANSPARENT. Only walk inside specs. */
function replaceTransparentInSpecs(data) {
  const specs = data.specs || {};
  let count = 0;
  function walk(obj) {
    if (obj === null || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (obj[k] === 'transparent') {
        obj[k] = RESOLVED_TRANSPARENT;
        count++;
      } else if (typeof obj[k] === 'object') {
        walk(obj[k]);
      }
    }
  }
  for (const spec of Object.values(specs)) {
    if (spec._buildContract) walk(spec._buildContract);
    if (Array.isArray(spec.elements)) {
      for (const el of spec.elements) {
        if (el?.styles) walk(el.styles);
        if (el?.states) walk(el.states);
      }
    }
  }
  return count;
}

function main() {
  const files = fs.readdirSync(V2_DIR).filter((f) => f.endsWith('.json'));
  let totalReplaced = 0;
  for (const file of files) {
    const filePath = path.join(V2_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const n = replaceTransparentInSpecs(data);
    if (n > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      console.log(`${file}: replaced ${n} "transparent" with ${RESOLVED_TRANSPARENT}`);
      totalReplaced += n;
    }
  }
  console.log(`Done. Total replacements: ${totalReplaced}`);
}

main();
