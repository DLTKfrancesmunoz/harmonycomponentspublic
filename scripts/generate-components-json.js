#!/usr/bin/env node
/**
 * Generate complete components.json from component inventory
 * Enhanced with theme-aware token extraction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inventoryFile = path.join(__dirname, '../component-props-inventory.json');
const tokenRegistryFile = path.join(__dirname, '../src/tokens/css-tokens-registry.json');
const cssComponentMapFile = path.join(__dirname, './css-component-map.json');
const componentsCssFile = path.join(__dirname, '../src/styles/components.css');
const outputFile = path.join(__dirname, '../src/tokens/components.json');

// Load data
const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));
let tokenRegistry = {};
let cssComponentMap = {};

try {
  tokenRegistry = JSON.parse(fs.readFileSync(tokenRegistryFile, 'utf-8')).tokens || {};
} catch (e) {
  console.warn('⚠️  Token registry not found, running without token data');
}

try {
  cssComponentMap = JSON.parse(fs.readFileSync(cssComponentMapFile, 'utf-8'));
} catch (e) {
  console.warn('⚠️  CSS component map not found, running without CSS mapping');
}

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

// Extract CSS class to component mapping
function getComponentFromClass(className) {
  // Remove variant modifiers (--primary, --sm, etc.)
  const baseClass = className.split('--')[0];
  return cssComponentMap[baseClass] || null;
}

// Extract tokens from CSS
function extractTokensFromCSS() {
  const cssContent = fs.readFileSync(componentsCssFile, 'utf-8');
  const root = postcss.parse(cssContent);
  
  const componentTokens = {};
  
  root.walkRules((rule) => {
    const selector = rule.selector.trim();
    
    // Extract base class name (before -- or :)
    const classMatch = selector.match(/^\.([\w-]+)/);
    if (!classMatch) return;
    
    const className = classMatch[1];
    const componentName = getComponentFromClass(className);
    
    if (!componentName) return;
    
    if (!componentTokens[componentName]) {
      componentTokens[componentName] = new Set();
    }
    
    // Extract var(--token-name) references
    rule.walkDecls((decl) => {
      const value = decl.value;
      const varMatches = value.matchAll(/var\((--[\w-]+)\)/g);
      for (const match of varMatches) {
        componentTokens[componentName].add(match[1]);
      }
    });
  });
  
  // Convert Sets to Arrays
  const result = {};
  for (const [component, tokens] of Object.entries(componentTokens)) {
    result[component] = Array.from(tokens);
  }
  
  return result;
}

// Categorize tokens for a component
function categorizeComponentTokens(tokenNames, tokenRegistry) {
  const categorized = {
    base: {
      spacing: [],
      typography: [],
      elevations: [],
      radius: [],
      transitions: []
    },
    themeAware: {
      colors: []
    },
    themeSpecific: {}
  };
  
  for (const tokenName of tokenNames) {
    const token = tokenRegistry[tokenName];
    if (!token) {
      // Token not found in registry, skip with warning
      continue;
    }
    
    const tokenInfo = {
      cssVar: tokenName,
      mcpPath: token.mcpPath || `tokens.${token.category}.${tokenName.replace('--', '')}`,
      value: token.value,
      category: token.category
    };
    
    if (token.type === 'base') {
      // Add to appropriate base category
      if (token.category === 'spacing') {
        categorized.base.spacing.push(tokenInfo);
      } else if (token.category === 'typography') {
        categorized.base.typography.push(tokenInfo);
      } else if (token.category === 'elevations') {
        categorized.base.elevations.push(tokenInfo);
      } else if (token.category === 'radius') {
        categorized.base.radius.push(tokenInfo);
      } else if (token.category === 'transitions') {
        categorized.base.transitions.push(tokenInfo);
      }
    } else if (token.type === 'themeAware') {
      // Add theme-aware color token
      tokenInfo.tokenPath = token.tokenPath;
      tokenInfo.themes = token.themes || {};
      categorized.themeAware.colors.push(tokenInfo);
    } else if (token.type === 'themeSpecific') {
      // Add to theme-specific
      const themes = token.themes || [];
      for (const theme of themes) {
        if (!categorized.themeSpecific[theme]) {
          categorized.themeSpecific[theme] = { colors: [] };
        }
        tokenInfo.value = token.value;
        categorized.themeSpecific[theme].colors.push(tokenInfo);
      }
    }
  }
  
  // Clean up empty arrays
  if (categorized.base.spacing.length === 0) delete categorized.base.spacing;
  if (categorized.base.typography.length === 0) delete categorized.base.typography;
  if (categorized.base.elevations.length === 0) delete categorized.base.elevations;
  if (categorized.base.radius.length === 0) delete categorized.base.radius;
  if (categorized.base.transitions.length === 0) delete categorized.base.transitions;
  if (categorized.themeAware && categorized.themeAware.colors && categorized.themeAware.colors.length === 0) delete categorized.themeAware.colors;
  if (categorized.themeAware && Object.keys(categorized.themeAware).length === 0) delete categorized.themeAware;
  if (categorized.themeSpecific && Object.keys(categorized.themeSpecific).length === 0) delete categorized.themeSpecific;
  
  // Return null if no tokens
  if (Object.keys(categorized.base).length === 0 && 
      !categorized.themeAware && 
      (!categorized.themeSpecific || Object.keys(categorized.themeSpecific).length === 0)) {
    return null;
  }
  
  return categorized;
}

// Extract tokens from CSS
const cssTokens = extractTokensFromCSS();

const components = {};

// Process each component
for (const [componentName, data] of Object.entries(inventory)) {
  const componentData = {
    description: data.description || `${componentName} component`
  };
  
  // Add file path if available
  if (data.filePath) {
    componentData.filePath = data.filePath;
  }
  
  // Add dependencies if available
  if (data.dependencies && data.dependencies.length > 0) {
    componentData.dependencies = data.dependencies;
  }
  
  // Process props
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
      componentData.props = props;
    } else {
      componentData.props = {};
    }
  } else {
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
    componentData.props = props;
  }
  
  // Add tokens if available
  if (cssTokens[componentName] && Object.keys(tokenRegistry).length > 0) {
    const tokens = categorizeComponentTokens(cssTokens[componentName], tokenRegistry);
    if (tokens) {
      componentData.tokens = tokens;
    }
  }
  
  components[componentName] = componentData;
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
if (Object.keys(tokenRegistry).length > 0) {
  const componentsWithTokens = Object.values(components).filter(c => c.tokens).length;
  console.log(`   - ${componentsWithTokens} components with token metadata`);
}
