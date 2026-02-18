#!/usr/bin/env node
/**
 * Inline Icon Manifest
 *
 * Reads src/data/icon-manifest.json and adds an "svg" field to each icon entry
 * with the full SVG markup from the file at "path". Makes the manifest
 * portable so converters/skills can use it without node_modules or public/.
 *
 * Run from repo root after npm install (so heroicons and tabler paths exist).
 * Usage: node scripts/inline-icon-manifest.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'src/data/icon-manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

function readSvgContent(filePath) {
  const fullPath = path.join(root, filePath);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
  return match ? match[0].trim() : null;
}

let added = 0;
let skipped = 0;

for (const theme of Object.keys(manifest)) {
  for (const iconName of Object.keys(manifest[theme])) {
    const entry = manifest[theme][iconName];
    const filePath = entry.path;
    const svg = readSvgContent(filePath);
    if (svg) {
      entry.svg = svg;
      added++;
    } else {
      skipped++;
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
console.log(`Inline icon manifest: ${added} SVGs added, ${skipped} skipped (file not found).`);
console.log(`Updated: ${manifestPath}`);
