#!/usr/bin/env node
/**
 * Generate consolidated ai-tokens.json from AI-only JSON files
 * Consolidates components.json, layouts.json, css-tokens-registry.json, and manifest.json
 * into a single file for easier AI consumption
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsFile = path.join(__dirname, '../src/tokens/components.json');
const layoutsFile = path.join(__dirname, '../src/tokens/layouts.json');
const cssTokensFile = path.join(__dirname, '../src/tokens/css-tokens-registry.json');
const manifestFile = path.join(__dirname, '../src/tokens/manifest.json');
const outputFile = path.join(__dirname, '../src/tokens/ai-tokens.json');

// Load all AI-only JSON files
let components = {};
let layouts = {};
let cssTokens = {};
let manifest = {};

try {
  const componentsData = JSON.parse(fs.readFileSync(componentsFile, 'utf-8'));
  components = componentsData.components || componentsData;
} catch (e) {
  console.warn('⚠️  Could not read components.json:', e.message);
}

try {
  const layoutsData = JSON.parse(fs.readFileSync(layoutsFile, 'utf-8'));
  layouts = layoutsData.layouts || layoutsData;
} catch (e) {
  console.warn('⚠️  Could not read layouts.json:', e.message);
}

try {
  const cssTokensData = JSON.parse(fs.readFileSync(cssTokensFile, 'utf-8'));
  cssTokens = cssTokensData.tokens || cssTokensData;
} catch (e) {
  console.warn('⚠️  Could not read css-tokens-registry.json:', e.message);
}

try {
  manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
} catch (e) {
  console.warn('⚠️  Could not read manifest.json:', e.message);
}

// Create consolidated structure
const aiTokens = {
  "$schema": "https://harmony-ds.com/tokens/ai-tokens.schema.json",
  "name": "Harmony Design System AI Tokens",
  "version": "1.0.0",
  "description": "Consolidated AI tokens including components, layouts, CSS tokens, and manifest",
  "generatedAt": new Date().toISOString(),
  "components": components,
  "layouts": layouts,
  "cssTokens": cssTokens,
  "manifest": manifest
};

// Write consolidated file
fs.writeFileSync(outputFile, JSON.stringify(aiTokens, null, 2));
console.log(`✅ Generated ai-tokens.json`);
console.log(`   - Components: ${Object.keys(components).length}`);
console.log(`   - Layouts: ${Object.keys(layouts).length}`);
console.log(`   - CSS Tokens: ${Object.keys(cssTokens).length}`);
console.log(`📄 Consolidated file written to: ${outputFile}`);
