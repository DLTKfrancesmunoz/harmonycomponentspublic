#!/usr/bin/env node
/**
 * Generate manifest.json with design system metadata
 * Lightweight index with theme information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, '../src/tokens/manifest.json');

// Load component and layout counts
let componentCount = 0;
let layoutCount = 0;

try {
  const componentsFile = path.join(__dirname, '../src/tokens/components.json');
  const componentsData = JSON.parse(fs.readFileSync(componentsFile, 'utf-8'));
  componentCount = Object.keys(componentsData.components || {}).length;
} catch (e) {
  console.warn('⚠️  Could not read components.json');
}

try {
  const layoutsFile = path.join(__dirname, '../src/tokens/layouts.json');
  const layoutsData = JSON.parse(fs.readFileSync(layoutsFile, 'utf-8'));
  layoutCount = Object.keys(layoutsData.layouts || {}).length;
} catch (e) {
  console.warn('⚠️  Could not read layouts.json');
}

// Create manifest
const manifest = {
  "$schema": "https://harmony-ds.com/tokens/manifest.schema.json",
  "name": "Harmony Design System Manifest",
  "version": "1.0.0",
  "themes": ["cp", "vp", "ppm", "maconomy"],
  "colorModes": ["light", "dark"],
  "tokenFiles": {
    "colors": "./colors.json",
    "typography": "./typography.json",
    "spacing": "./spacing.json",
    "elevations": "./elevations.json"
  },
  "componentFile": "./components.json",
  "layoutFile": "./layouts.json",
  "componentCount": componentCount,
  "layoutCount": layoutCount,
  "generatedAt": new Date().toISOString()
};

fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated manifest.json`);
console.log(`   - ${componentCount} components`);
console.log(`   - ${layoutCount} layouts`);
