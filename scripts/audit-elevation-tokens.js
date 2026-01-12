#!/usr/bin/env node
/**
 * Audit elevation token usage in components.css
 * Identifies hardcoded shadows that should use elevation tokens
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

// Extract available elevation tokens
const elevationTokens = [];
const tokenRegex = /--shadow-(\w+):\s*([^;]+);/g;
let match;
while ((match = tokenRegex.exec(tokensContent)) !== null) {
  elevationTokens.push({
    name: match[1],
    var: `--shadow-${match[1]}`,
    value: match[2].trim()
  });
}

console.log('🔍 Elevation Token Audit\n');
console.log('Available elevation tokens:');
elevationTokens.forEach(token => {
  console.log(`  - --shadow-${token.name}`);
});
console.log('');

// Find all box-shadow declarations
const boxShadowRegex = /box-shadow:\s*([^;]+);/g;
const shadows = [];
while ((match = boxShadowRegex.exec(cssContent)) !== null) {
  const shadowValue = match[1].trim();
  const lineNumber = cssContent.substring(0, match.index).split('\n').length;
  
  // Check if it's using a token
  const usesToken = shadowValue.includes('var(--shadow-');
  const isFocusRing = shadowValue.includes('0 0 0') && (shadowValue.includes('--theme-primary-light') || shadowValue.includes('--color-'));
  const isInset = shadowValue.includes('inset');
  
  shadows.push({
    line: lineNumber,
    value: shadowValue,
    usesToken,
    isFocusRing,
    isInset,
    shouldUseToken: !usesToken && !isFocusRing && !isInset
  });
}

// Categorize shadows
const usingTokens = shadows.filter(s => s.usesToken);
const focusRings = shadows.filter(s => s.isFocusRing);
const insetShadows = shadows.filter(s => s.isInset);
const hardcodedElevation = shadows.filter(s => s.shouldUseToken);

console.log('📊 Shadow Usage Summary:');
console.log(`  ✅ Using elevation tokens: ${usingTokens.length}`);
console.log(`  🎯 Focus rings (intentional): ${focusRings.length}`);
console.log(`  📦 Inset shadows (intentional): ${insetShadows.length}`);
console.log(`  ⚠️  Hardcoded elevation (should use tokens): ${hardcodedElevation.length}`);

if (hardcodedElevation.length > 0) {
  console.log('\n⚠️  Hardcoded shadows that should use elevation tokens:');
  hardcodedElevation.forEach(shadow => {
    console.log(`  Line ${shadow.line}: ${shadow.value.substring(0, 60)}...`);
  });
}

// Check which components are using tokens correctly
console.log('\n✅ Components using elevation tokens correctly:');
const componentSections = cssContent.match(/\/\* =+[\s\S]*?BUTTON|CARD|DIALOG|DROPDOWN|TOOLTIP|ALERT[\s\S]*?\*\/[\s\S]*?(?=\/\*|$)/g);
if (componentSections) {
  componentSections.forEach(section => {
    const componentName = section.match(/(?:BUTTON|CARD|DIALOG|DROPDOWN|TOOLTIP|ALERT)/)?.[0];
    if (componentName) {
      const hasToken = section.includes('var(--shadow-');
      if (hasToken) {
        console.log(`  ✓ ${componentName}`);
      }
    }
  });
}

// Check for --shadow-dropdown usage
if (cssContent.includes('--shadow-dropdown')) {
  console.log('\n✅ --shadow-dropdown token is being used');
} else {
  console.log('\n⚠️  --shadow-dropdown token is defined but not used');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Recommendation:');
if (hardcodedElevation.length === 0) {
  console.log('✅ All elevation shadows are using tokens correctly!');
} else {
  console.log(`⚠️  Found ${hardcodedElevation.length} hardcoded shadows that should use elevation tokens.`);
  console.log('   Consider replacing them with appropriate --shadow-* tokens.');
}
