#!/usr/bin/env node
/**
 * Generate complete components.json from component inventory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inventoryFile = path.join(__dirname, '../component-props-inventory.json');
const outputFile = path.join(__dirname, '../src/tokens/components.json');

const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));

const components = {};

// Helper to extract options from type string
function extractOptions(typeStr) {
  if (!typeStr) return null;
  const match = typeStr.match(/\['([^']+)'(\s*\|\s*'[^']+')*\]/);
  if (match) {
    return typeStr.match(/'([^']+)'/g).map(m => m.replace(/'/g, ''));
  }
  return null;
}

// Helper to clean type string
function cleanType(typeStr) {
  if (!typeStr) return 'any';
  return typeStr.replace(/;$/, '').trim();
}

// Process each component
for (const [componentName, data] of Object.entries(inventory)) {
  if (!data.hasProps || !data.props) {
    // Skip components without props or with incomplete data
    if (componentName === 'Avatar' && data.propsInterface) {
      // Handle Avatar specially
      const props = {};
      const lines = data.propsInterface.split('\n');
      for (const line of lines) {
        const match = line.match(/(\w+)(\??):\s*(.+?);/);
        if (match) {
          const [, name, optional, type] = match;
          props[name] = {
            type: cleanType(type),
            optional: optional === '?',
            description: null
          };
          const options = extractOptions(type);
          if (options) {
            props[name].options = options;
          }
        }
      }
      components[componentName] = {
        description: `${componentName} component`,
        props: props
      };
    }
    continue;
  }

  const props = {};
  for (const [propName, propData] of Object.entries(data.props)) {
    // Skip [key: string] index signature
    if (propName.startsWith('[')) continue;
    
    const prop = {
      type: cleanType(propData.type),
      description: propData.description || null
    };
    
    if (propData.optional) {
      prop.optional = true;
    }
    
    if (data.defaults && data.defaults[propName]) {
      prop.default = data.defaults[propName].replace(/^['"]|['"]$/g, '');
    }
    
    const options = extractOptions(propData.type);
    if (options) {
      prop.options = options;
    }
    
    props[propName] = prop;
  }

  components[componentName] = {
    description: `${componentName} component`,
    props: props
  };
}

// Create final structure
const output = {
  "$schema": "https://harmony-ds.com/tokens/components.schema.json",
  "name": "Harmony Design System Components",
  "version": "1.0.0",
  "description": "Component definitions with props, variants, and CSS class mappings",
  "components": components
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`✅ Generated components.json with ${Object.keys(components).length} components`);
