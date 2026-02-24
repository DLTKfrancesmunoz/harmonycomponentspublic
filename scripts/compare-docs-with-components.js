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
  'DateInput': 'date-picker', // Same page as DatePicker; uses dateInputProps
  'TimePicker': 'specialty-inputs',
  'MonthPicker': 'specialty-inputs',
  'WeekPicker': 'specialty-inputs',
  'DateTimePicker': 'specialty-inputs',
  'RangeInput': 'specialty-inputs',
  'NumberInput': 'specialty-inputs',
  'PickerPopup': null, // Internal component
};

// When a doc file has multiple components, map component name to the variable holding its props (default: 'props')
const componentToPropsVar = {
  'Textarea': 'textareaProps',
  'DatePicker': 'datePickerProps',
  'DateInput': 'dateInputProps',
  'NumberInput': 'numberInputProps',
  'RangeInput': 'rangeInputProps',
  'TimePicker': 'timePickerProps',
  'MonthPicker': 'monthPickerProps',
  'WeekPicker': 'weekPickerProps',
  'DateTimePicker': 'dateTimePickerProps',
};

/**
 * Extract prop names from a doc file's props array. Uses variable name to find the right array
 * and only matches name: '...' so union types and complex strings don't break extraction.
 */
function extractPropsFromDoc(docContent, propsVariableName = 'props') {
  const names = [];
  // Match const variableName = [ ... ]; (array may contain nested brackets)
  const re = new RegExp(
    `const\\s+${propsVariableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*\\[`,
    's'
  );
  const startMatch = docContent.match(re);
  if (!startMatch) return names;

  const startIndex = startMatch.index + startMatch[0].length;
  let depth = 1;
  let i = startIndex;
  while (i < docContent.length && depth > 0) {
    const c = docContent[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    i++;
  }
  const arrayBody = docContent.slice(startIndex, i - 1);

  // Extract every name: 'propName' or name: "propName"
  const nameRe = /name:\s*['"]([^'"]+)['"]/g;
  let nameMatch;
  while ((nameMatch = nameRe.exec(arrayBody)) !== null) {
    names.push(nameMatch[1]);
  }
  return names;
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
  const propsVarName = componentToPropsVar[componentName] ?? 'props';
  const docPropNames = new Set(extractPropsFromDoc(docContent, propsVarName));
  const componentProps = inventory[componentName].props || {};
  const componentPropNames = new Set(Object.keys(componentProps).filter(k => k !== 'class' && k !== '[key: string]'));
  
  const missingInDocs = Array.from(componentPropNames).filter(name => !docPropNames.has(name));
  const extraInDocs = Array.from(docPropNames).filter(name => !componentPropNames.has(name));
  
  if (missingInDocs.length > 0 || extraInDocs.length > 0) {
    mismatches[componentName] = {
      missingInDocs,
      extraInDocs,
      docProps: Array.from(docPropNames),
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
