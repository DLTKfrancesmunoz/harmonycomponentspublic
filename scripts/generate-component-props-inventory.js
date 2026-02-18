#!/usr/bin/env node
/**
 * Generate component-props-inventory.json from Astro component source files.
 * Used by compare-docs-with-components.js to detect doc drift.
 * Run: node scripts/generate-component-props-inventory.js [--write]
 * --write: write to component-props-inventory.json; otherwise stdout.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseComponent,
  extractDescription,
  getComponentName,
} from './astro-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UI_DIR = path.join(ROOT, 'src/components/ui');

function getAstroFiles(dir) {
  const names = fs.readdirSync(dir);
  return names
    .filter((n) => n.endsWith('.astro'))
    .map((n) => path.join(dir, n))
    .sort();
}

function buildPropsShape(parsedProps) {
  const props = {};
  for (const [name, p] of Object.entries(parsedProps)) {
    let type = p.type || '';
    if (type && !type.endsWith(';')) type += ';';
    props[name] = {
      optional: !!p.optional,
      type,
      default: p.default ?? null,
      description: null,
    };
  }
  return props;
}

function buildDefaults(parsedProps) {
  const defaults = {};
  for (const [name, p] of Object.entries(parsedProps)) {
    if (p.default != null && p.default !== '') {
      defaults[name] = String(p.default);
    }
  }
  if (Object.keys(parsedProps).length > 0 && !('class' in parsedProps)) {
    defaults.className = "''";
  }
  return defaults;
}

function buildRawInterface(parsedProps) {
  return Object.entries(parsedProps)
    .map(([name, p]) => {
      const opt = p.optional ? '?' : '';
      return `${name}${opt}: ${p.type || 'unknown'}`;
    })
    .join('\n  ');
}

async function main() {
  const write = process.argv.includes('--write');
  const inventory = {};
  const files = getAstroFiles(UI_DIR);

  for (const filePath of files) {
    const componentName = getComponentName(filePath);
    const relativePath = path.relative(ROOT, filePath);
    let parsed;
    try {
      parsed = await parseComponent(filePath);
    } catch (err) {
      console.error(`Failed to parse ${relativePath}:`, err.message);
      continue;
    }

    const { props: parsedProps, imports: importsMap, cssClasses } = parsed;
    const hasProps = Object.keys(parsedProps).length > 0;
    // Dependencies: component names (PascalCase) from relative/ui imports
    const dependencies = [
      ...new Set(
        Object.entries(importsMap || {})
          .filter(([name, source]) => /^[A-Z]/.test(name) && (source.startsWith('.') || source.includes('/ui/')))
          .map(([name]) => name)
      ),
    ];
    const description = extractDescription(filePath) || `${componentName} Component`;
    const imports = [...new Set(Object.values(importsMap || {}))];

    inventory[componentName] = {
      hasProps,
      filePath: relativePath.replace(/\\/g, '/'),
      description,
      dependencies,
      imports,
      cssClasses: cssClasses || [],
      props: buildPropsShape(parsedProps),
      defaults: buildDefaults(parsedProps),
      rawInterface: buildRawInterface(parsedProps),
    };
  }

  const json = JSON.stringify(inventory, null, 2);
  if (write) {
    const outPath = path.join(ROOT, 'component-props-inventory.json');
    fs.writeFileSync(outPath, json, 'utf-8');
    console.log(`Wrote ${outPath} (${Object.keys(inventory).length} components).`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
