#!/usr/bin/env node
/**
 * Validation script to compare component Props interfaces with documentation
 * and components.json to prevent future drift
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsDir = path.join(__dirname, '../src/components/ui');
const docsDir = path.join(__dirname, '../src/pages/components');
const componentsJsonFile = path.join(__dirname, '../mcp-data/components.json');
const inventoryFile = path.join(__dirname, '../component-props-inventory.json');

// Load data
const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));
const componentsJson = JSON.parse(fs.readFileSync(componentsJsonFile, 'utf-8'));

// Component to doc file mapping
const componentToDocMap = {
  'Button': 'buttons',
  'Badge': 'badges',
  'Card': 'cards',
  'Input': 'inputs',
  'Textarea': 'inputs',
  'Checkbox': 'checkboxes',
  'CheckboxGroup': 'checkbox-groups',
  'RadioButton': 'radio-buttons',
  'RadioGroup': 'radio-groups',
  'Dropdown': 'dropdowns',
  'Alert': 'alerts',
  'Dialog': 'dialogs',
  'Tooltip': 'tooltips',
  'Spinner': 'spinner',
  'ProgressBar': 'progress-bar',
  'Toggle': 'toggle-switches',
  'Chip': 'chips',
  'Link': 'links',
  'Label': 'labels',
  'Accordion': 'accordion',
  'TabStrip': 'tab-strip',
  'ButtonGroup': 'button-groups',
  'NotificationBadge': 'notification-badges',
  'Icon': 'icons',
  'ListMenu': 'list-menu',
  'DatePicker': 'date-picker',
  'DateInput': 'specialty-inputs',
};

let errors = [];
let warnings = [];

// Extract props from doc file
function extractPropsFromDoc(docContent) {
  const props = [];
  const propsMatch = docContent.match(/const\s+props\s*=\s*\[([^\]]+)\]/s);
  if (!propsMatch) return props;
  
  const propsContent = propsMatch[1];
  const propRegex = /\{\s*name:\s*['"]([^'"]+)['"],\s*type:\s*['"]([^'"]+)['"],\s*default:\s*['"]?([^'",}]+)['"]?,\s*description:\s*['"]([^'"]*)['"]\s*\}/g;
  let match;
  while ((match = propRegex.exec(propsContent)) !== null) {
    props.push({
      name: match[1],
      type: match[2],
      default: match[3],
      description: match[4]
    });
  }
  return props;
}

// Compare component props with documentation
for (const [componentName, docFileName] of Object.entries(componentToDocMap)) {
  if (!inventory[componentName] || !inventory[componentName].hasProps) {
    continue;
  }
  
  const componentProps = inventory[componentName].props || {};
  const componentPropNames = new Set(Object.keys(componentProps).filter(k => 
    k !== 'class' && !k.startsWith('[')
  ));
  
  // Check components.json
  if (componentsJson.components[componentName]) {
    const jsonProps = componentsJson.components[componentName].props || {};
    const jsonPropNames = new Set(Object.keys(jsonProps));
    
    const missingInJson = Array.from(componentPropNames).filter(name => !jsonPropNames.has(name));
    const extraInJson = Array.from(jsonPropNames).filter(name => !componentPropNames.has(name));
    
    if (missingInJson.length > 0) {
      warnings.push(`${componentName}: Missing in components.json: ${missingInJson.join(', ')}`);
    }
    if (extraInJson.length > 0) {
      warnings.push(`${componentName}: Extra in components.json: ${extraInJson.join(', ')}`);
    }
  } else {
    warnings.push(`${componentName}: Not found in components.json`);
  }
  
  // Check documentation
  const docFile = path.join(docsDir, `${docFileName}.astro`);
  if (fs.existsSync(docFile)) {
    const docContent = fs.readFileSync(docFile, 'utf-8');
    const docProps = extractPropsFromDoc(docContent);
    const docPropNames = new Set(docProps.map(p => p.name));
    
    const missingInDocs = Array.from(componentPropNames).filter(name => !docPropNames.has(name));
    const extraInDocs = Array.from(docPropNames).filter(name => !componentPropNames.has(name));
    
    if (missingInDocs.length > 0) {
      errors.push(`${componentName}: Missing in docs: ${missingInDocs.join(', ')}`);
    }
    if (extraInDocs.length > 0) {
      warnings.push(`${componentName}: Extra in docs (may be intentional): ${extraInDocs.join(', ')}`);
    }
  } else {
    warnings.push(`${componentName}: Documentation file not found: ${docFileName}.astro`);
  }
}

// Report results
console.log('🔍 Component Validation Report\n');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All components are in sync!\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n❌ Errors (${errors.length}):`);
  errors.forEach(err => console.log(`  - ${err}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Tip: Run this script regularly to catch drift early.');
console.log('   Consider adding it to your pre-commit hook.\n');

process.exit(errors.length > 0 ? 1 : 0);
