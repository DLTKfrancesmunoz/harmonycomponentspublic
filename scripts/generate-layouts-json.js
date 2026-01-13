#!/usr/bin/env node
/**
 * Generate layouts.json from layout files
 * Extracts layout metadata with theme awareness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const layoutsDir = path.join(__dirname, '../src/layouts');
const outputFile = path.join(__dirname, '../src/tokens/layouts.json');

const layouts = {};

// Get all .astro files in layouts directory
const files = fs.readdirSync(layoutsDir)
  .filter(file => file.endsWith('.astro'))
  .sort();

for (const file of files) {
  const filePath = path.join(layoutsDir, file);
  const relativeFilePath = `src/layouts/${file}`;
  const content = fs.readFileSync(filePath, 'utf-8');
  const layoutName = path.basename(file, '.astro');
  
  // Extract description from JSDoc or comments
  let description = null;
  const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\s*\n|$)/s);
  if (jsdocMatch) {
    description = jsdocMatch[1].trim();
  } else {
    const commentMatch = content.match(/\/\*\s*(.+?)\s*\*\//s);
    if (commentMatch) {
      description = commentMatch[1].trim().split('\n')[0].replace(/^\*\s*/, '').trim();
    }
  }
  
  // Extract component dependencies (imports)
  const components = [];
  const importRegex = /import\s+(\w+)\s+from\s+['"].*components\/ui\/(\w+)\.astro['"]/g;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    const [, importName, componentName] = importMatch;
    if (!components.includes(componentName)) {
      components.push(componentName);
    }
  }
  
  // Extract Props interface
  const props = {};
  const propsMatch = content.match(/interface\s+Props\s*\{([^}]+)\}/s);
  
  if (propsMatch) {
    const propsContent = propsMatch[1].trim();
    const propLines = propsContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && l);
    
    for (const line of propLines) {
      if (line === '}') continue;
      
      // Match prop definitions like: productName?: string;
      const propMatch = line.match(/(\w+)(\??):\s*(.+?)(?:\s*\/\/\s*(.+))?$/);
      if (propMatch) {
        const [, name, optional, type, comment] = propMatch;
        props[name] = {
          type: type.trim().replace(/;$/, ''),
          optional: optional === '?',
          description: comment ? comment.trim() : null
        };
      }
    }
  }
  
  layouts[layoutName] = {
    filePath: relativeFilePath,
    description: description || `${layoutName} layout`,
    components: components,
    props: props
  };
}

// Create final structure
const output = {
  "$schema": "https://harmony-ds.com/tokens/layouts.schema.json",
  "name": "Harmony Design System Layouts",
  "version": "1.0.0",
  "description": "Layout definitions with component dependencies and props",
  "layouts": layouts
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`✅ Generated layouts.json with ${Object.keys(layouts).length} layouts`);
