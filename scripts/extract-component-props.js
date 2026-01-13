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
  const relativeFilePath = `src/components/ui/${file}`;
  const content = fs.readFileSync(filePath, 'utf-8');
  const componentName = path.basename(file, '.astro');
  
  // Extract description from JSDoc or comments
  let description = null;
  const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\s*\n|$)/s);
  if (jsdocMatch) {
    description = jsdocMatch[1].trim();
  } else {
    // Try first comment block
    const commentMatch = content.match(/\/\*\s*(.+?)\s*\*\//s);
    if (commentMatch) {
      description = commentMatch[1].trim().split('\n')[0].replace(/^\*\s*/, '').trim();
    } else {
      // Try first line comment
      const lineCommentMatch = content.match(/\/\/\s*(.+)/);
      if (lineCommentMatch) {
        description = lineCommentMatch[1].trim();
      }
    }
  }
  
  // Extract dependencies (imports)
  const dependencies = [];
  const imports = [];
  const importRegex = /import\s+(\w+)\s+from\s+['"](.+?)['"]/g;
  let importMatch;
  while ((importMatch = importRegex.exec(content)) !== null) {
    const [, importName, importPath] = importMatch;
    // Only track component imports, not utilities
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const importedComponent = importPath.replace(/^\.\//, '').replace(/\.astro$/, '');
      dependencies.push(importedComponent);
      imports.push(importPath);
    }
  }
  
  // Extract CSS classes used in component
  const cssClasses = new Set();
  // Look for class attributes and template strings
  const classMatches = content.matchAll(/(?:class|className)\s*=\s*["'`]([^"'`]+)["'`]/g);
  for (const match of classMatches) {
    const classes = match[1].split(/\s+/).filter(c => c);
    classes.forEach(c => cssClasses.add(c));
  }
  // Also look for template literals with class construction
  const classTemplateMatches = content.matchAll(/['"`]([\w-]+(?:--[\w-]+)?)['"`]/g);
  for (const match of classTemplateMatches) {
    const className = match[1];
    if (className.includes('--') || className.match(/^(btn|alert|accordion|badge|card|checkbox|chip|dialog|dropdown|input|label|link|table|tab|textarea|toggle|tooltip|spinner|progress|notification|floating|shell|sidebar)/)) {
      cssClasses.add(className);
    }
  }
  
  // Extract Props interface
  const propsMatch = content.match(/export\s+interface\s+Props\s*\{([^}]+)\}/s);
  
  if (!propsMatch) {
    // Some components might use interface Props without export
    const altMatch = content.match(/interface\s+Props\s*\{([^}]+)\}/s);
    if (altMatch) {
      components[componentName] = {
        hasProps: true,
        filePath: relativeFilePath,
        description: description || `${componentName} component`,
        dependencies: dependencies,
        imports: imports,
        cssClasses: Array.from(cssClasses),
        propsInterface: altMatch[1].trim(),
        raw: altMatch[0]
      };
    } else {
      components[componentName] = {
        hasProps: false,
        filePath: relativeFilePath,
        description: description || `${componentName} component`,
        dependencies: dependencies,
        imports: imports,
        cssClasses: Array.from(cssClasses),
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
    filePath: relativeFilePath,
    description: description || `${componentName} component`,
    dependencies: dependencies,
    imports: imports,
    cssClasses: Array.from(cssClasses),
    props: props,
    defaults: defaults,
    rawInterface: propsContent
  };
}

// Write inventory
fs.writeFileSync(outputFile, JSON.stringify(components, null, 2));
console.log(`✅ Extracted props from ${files.length} components`);
console.log(`📄 Inventory written to: ${outputFile}`);
