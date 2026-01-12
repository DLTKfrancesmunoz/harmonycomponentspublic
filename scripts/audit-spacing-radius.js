#!/usr/bin/env node
/**
 * Audit spacing and radius token usage in components.css
 * Identifies hardcoded values that should use tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsCss = path.join(__dirname, '../src/styles/components.css');
const tokensCss = path.join(__dirname, '../src/styles/tokens.css');

const cssContent = fs.readFileSync(componentsCss, 'utf-8');
const tokensContent = fs.readFileSync(tokensCss, 'utf-8');

// Extract available tokens
const spacingTokens = [];
const radiusTokens = [];

const spaceRegex = /--space-(\w+):\s*([^;]+);/g;
let match;
while ((match = spaceRegex.exec(tokensContent)) !== null) {
  spacingTokens.push({
    name: match[1],
    var: `--space-${match[1]}`,
    value: match[2].trim()
  });
}

const radiusRegex = /--radius-(\w+):\s*([^;]+);/g;
while ((match = radiusRegex.exec(tokensContent)) !== null) {
  radiusTokens.push({
    name: match[1],
    var: `--radius-${match[1]}`,
    value: match[2].trim()
  });
}

console.log('🔍 Spacing & Radius Token Audit\n');

// Find hardcoded spacing values
const spacingPatterns = [
  /padding:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
  /padding:\s*(\d+(?:\.\d+)?)px/g,
  /margin:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
  /margin:\s*(\d+(?:\.\d+)?)px/g,
  /gap:\s*(\d+(?:\.\d+)?)px/g,
  /top:\s*(\d+(?:\.\d+)?)px/g,
  /bottom:\s*(\d+(?:\.\d+)?)px/g,
  /left:\s*(\d+(?:\.\d+)?)px/g,
  /right:\s*(\d+(?:\.\d+)?)px/g,
  /width:\s*(\d+(?:\.\d+)?)px/g,
  /height:\s*(\d+(?:\.\d+)?)px/g,
];

const hardcodedSpacing = [];
spacingPatterns.forEach(pattern => {
  let match;
  while ((match = pattern.exec(cssContent)) !== null) {
    const lineNumber = cssContent.substring(0, match.index).split('\n').length;
    const value = match[0];
    // Skip if it's already using a token
    if (!value.includes('var(--')) {
      hardcodedSpacing.push({
        line: lineNumber,
        value: value,
        property: match[0].split(':')[0].trim()
      });
    }
  }
});

// Find hardcoded radius values
const radiusPattern = /border-radius:\s*(\d+(?:\.\d+)?)px(?!\s*;)/g;
const hardcodedRadius = [];
while ((match = radiusPattern.exec(cssContent)) !== null) {
  const lineNumber = cssContent.substring(0, match.index).split('\n').length;
  const value = match[0];
  // Skip if it's already using a token
  if (!value.includes('var(--')) {
    hardcodedRadius.push({
      line: lineNumber,
      value: value
    });
  }
}

console.log('📊 Hardcoded Values Found:');
console.log(`  ⚠️  Spacing: ${hardcodedSpacing.length} instances`);
console.log(`  ⚠️  Radius: ${hardcodedRadius.length} instances\n`);

if (hardcodedSpacing.length > 0) {
  console.log('Hardcoded Spacing Values:');
  hardcodedSpacing.forEach(item => {
    console.log(`  Line ${item.line}: ${item.value}`);
  });
  console.log('');
}

if (hardcodedRadius.length > 0) {
  console.log('Hardcoded Radius Values:');
  hardcodedRadius.forEach(item => {
    console.log(`  Line ${item.line}: ${item.value}`);
  });
  console.log('');
}

console.log('💡 Recommendation:');
if (hardcodedSpacing.length === 0 && hardcodedRadius.length === 0) {
  console.log('✅ All spacing and radius values are using tokens!');
} else {
  console.log(`⚠️  Found ${hardcodedSpacing.length + hardcodedRadius.length} hardcoded values that should use tokens.`);
}
