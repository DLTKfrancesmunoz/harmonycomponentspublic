#!/usr/bin/env node
/**
 * Extract Props interfaces from all Astro components
 * Creates a JSON inventory of all component props
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentsDir = path.join(__dirname, '../src/components/ui');
const outputFile = path.join(__dirname, '../component-props-inventory.json');

const components = {};

// Get all .astro files
const files = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.astro'))
  .sort();

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const componentName = path.basename(file, '.astro');
  
  // Extract Props interface
  const propsMatch = content.match(/export\s+interface\s+Props\s*\{([^}]+)\}/s);
  
  if (!propsMatch) {
    // Some components might use interface Props without export
    const altMatch = content.match(/interface\s+Props\s*\{([^}]+)\}/s);
    if (altMatch) {
      components[componentName] = {
        hasProps: true,
        propsInterface: altMatch[1].trim(),
        raw: altMatch[0]
      };
    } else {
      components[componentName] = {
        hasProps: false,
        note: 'No Props interface found'
      };
    }
    continue;
  }
  
  const propsContent = propsMatch[1].trim();
  
  // Extract default values from destructuring
  const defaultsMatch = content.match(/const\s*\{([^}]+)\}\s*=\s*Astro\.props;/s);
  const defaults = {};
  
  if (defaultsMatch) {
    const defaultsContent = defaultsMatch[1];
    // Parse defaults like: variant = 'primary', size = 'md', etc.
    const defaultLines = defaultsContent.split(',').map(l => l.trim());
    for (const line of defaultLines) {
      const match = line.match(/(\w+)\s*=\s*(.+)/);
      if (match) {
        const [, key, value] = match;
        defaults[key.trim()] = value.trim();
      }
    }
  }
  
  // Parse props
  const props = {};
  const propLines = propsContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  
  for (const line of propLines) {
    // Skip closing brace
    if (line === '}') continue;
    
    // Match prop definitions like: variant?: 'primary' | 'secondary';
    const propMatch = line.match(/(\w+)(\??):\s*(.+?)(?:\s*\/\/\s*(.+))?$/);
    if (propMatch) {
      const [, name, optional, type, comment] = propMatch;
      props[name] = {
        optional: optional === '?',
        type: type.trim(),
        default: defaults[name] || null,
        description: comment ? comment.trim() : null
      };
    }
  }
  
  components[componentName] = {
    hasProps: true,
    props: props,
    defaults: defaults,
    rawInterface: propsContent
  };
}

// Write inventory
fs.writeFileSync(outputFile, JSON.stringify(components, null, 2));
console.log(`✅ Extracted props from ${files.length} components`);
console.log(`📄 Inventory written to: ${outputFile}`);
