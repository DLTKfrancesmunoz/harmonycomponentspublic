#!/usr/bin/env node
/**
 * Compare documentation pages with actual component Props interfaces
 * Identifies missing, extra, or mismatched props
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsDir = path.join(__dirname, '../src/components/ui');
const docsDir = path.join(__dirname, '../src/pages/components');
const inventoryFile = path.join(__dirname, '../component-props-inventory.json');

const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));
const mismatches = {};

// Map of component names to doc file names
const componentToDocMap = {
  'Button': 'buttons',
  'Badge': 'badges',
  'Card': 'cards',
  'Input': 'inputs',
  'Textarea': 'inputs', // Same page
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
  'Avatar': null, // No doc page found
  'Icon': 'icons',
  'ListMenu': 'list-menu',
  'DatePicker': 'date-picker',
  'DateInput': 'specialty-inputs',
  'TimePicker': 'specialty-inputs',
  'MonthPicker': 'specialty-inputs',
  'WeekPicker': 'specialty-inputs',
  'DateTimePicker': 'specialty-inputs',
  'RangeInput': 'specialty-inputs',
  'NumberInput': 'specialty-inputs',
  'PickerPopup': null, // Internal component
};

function extractPropsFromDoc(docContent) {
  const props = [];
  // Match props array like: const props = [ ... ];
  const propsMatch = docContent.match(/const\s+props\s*=\s*\[([^\]]+)\]/s);
  if (!propsMatch) return props;
  
  const propsContent = propsMatch[1];
  // Match individual prop objects
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

// Compare each component
for (const [componentName, docFileName] of Object.entries(componentToDocMap)) {
  if (!docFileName || !inventory[componentName] || !inventory[componentName].hasProps) {
    continue;
  }
  
  const docFile = path.join(docsDir, `${docFileName}.astro`);
  if (!fs.existsSync(docFile)) {
    mismatches[componentName] = {
      error: `Documentation file not found: ${docFileName}.astro`
    };
    continue;
  }
  
  const docContent = fs.readFileSync(docFile, 'utf-8');
  const docProps = extractPropsFromDoc(docContent);
  const componentProps = inventory[componentName].props || {};
  
  const docPropNames = new Set(docProps.map(p => p.name));
  const componentPropNames = new Set(Object.keys(componentProps).filter(k => k !== 'class' && k !== '[key: string]'));
  
  const missingInDocs = Array.from(componentPropNames).filter(name => !docPropNames.has(name));
  const extraInDocs = Array.from(docPropNames).filter(name => !componentPropNames.has(name));
  
  if (missingInDocs.length > 0 || extraInDocs.length > 0) {
    mismatches[componentName] = {
      missingInDocs,
      extraInDocs,
      docProps: docProps.map(p => p.name),
      componentProps: Array.from(componentPropNames)
    };
  }
}

// Write report
const reportFile = path.join(__dirname, '../docs-mismatch-report.json');
fs.writeFileSync(reportFile, JSON.stringify(mismatches, null, 2));

console.log('📊 Documentation Mismatch Report');
console.log('================================\n');
for (const [component, issues] of Object.entries(mismatches)) {
  console.log(`\n${component}:`);
  if (issues.error) {
    console.log(`  ❌ ${issues.error}`);
  } else {
    if (issues.missingInDocs?.length > 0) {
      console.log(`  ⚠️  Missing in docs: ${issues.missingInDocs.join(', ')}`);
    }
    if (issues.extraInDocs?.length > 0) {
      console.log(`  ⚠️  Extra in docs: ${issues.extraInDocs.join(', ')}`);
    }
  }
}

console.log(`\n📄 Full report written to: ${reportFile}`);

if (Object.keys(mismatches).length > 0) {
  process.exit(1);
}
