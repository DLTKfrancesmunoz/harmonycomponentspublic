#!/usr/bin/env node
/**
 * Parse CSS tokens from tokens.css and colors.json
 * Extracts all CSS variables with theme/color mode awareness
 * Generates token registry with MCP-compatible paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensCssFile = path.join(__dirname, '../src/styles/tokens.css');
const colorsJsonFile = path.join(__dirname, '../src/tokens/colors.json');
const outputFile = path.join(__dirname, '../src/tokens/css-tokens-registry.json');

const themes = ['cp', 'vp', 'ppm', 'maconomy'];
const colorModes = ['light', 'dark'];

// Helper to convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper to generate MCP path from CSS variable name
function generateMCPPath(cssVar, category, type, theme = null) {
  const varName = cssVar.replace('--', '');
  
  if (type === 'base') {
    // Base tokens: tokens.{category}.{name}
    const parts = varName.split('-');
    if (category === 'spacing') {
      // --space-2 -> tokens.spacing.2
      return `tokens.${category}.${parts[1] || parts[0]}`;
    } else if (category === 'typography') {
      // --font-sans -> tokens.typography.fontFamily.sans
      // --text-base -> tokens.typography.fontSize.base
      if (parts[0] === 'font') {
        return `tokens.typography.fontFamily.${parts[1]}`;
      } else if (parts[0] === 'text') {
        return `tokens.typography.fontSize.${parts.slice(1).join('')}`;
      } else if (parts[0] === 'heading' || parts[0] === 'display' || parts[0] === 'body' || parts[0] === 'caption' || parts[0] === 'label' || parts[0] === 'overline') {
        return `tokens.typography.fontSize.${parts.join('')}`;
      }
      return `tokens.typography.${kebabToCamel(varName)}`;
    } else if (category === 'elevations') {
      // --shadow-sm -> tokens.shadows.sm
      return `tokens.shadows.${parts[1] || parts[0]}`;
    } else if (category === 'radius') {
      // --radius-lg -> tokens.borderRadius.lg
      return `tokens.borderRadius.${parts[1] || parts[0]}`;
    } else if (category === 'transitions') {
      // --transition-fast -> tokens.transitions.fast
      return `tokens.transitions.${parts[1] || parts[0]}`;
    }
    // Generic: tokens.{category}.{name}
    const name = parts.slice(1).join('') || parts[0];
    return `tokens.${category}.${name}`;
  } else if (type === 'themeAware') {
    // Theme-aware: tokens.colors.theme.{name}
    const name = varName.replace(/^theme-/, '').replace(/^color-/, '');
    return `tokens.colors.theme.${kebabToCamel(name)}`;
  } else if (type === 'themeSpecific' && theme) {
    // Theme-specific: tokens.colors.{theme}.{name}
    const name = varName.replace(/^floating-nav-/, '').replace(/^cp-sidebar-/, '');
    return `tokens.colors.${theme}.${kebabToCamel(name)}`;
  }
  
  // Fallback
  return `tokens.${category}.${kebabToCamel(varName)}`;
}

// Helper to determine token category
function getTokenCategory(varName) {
  if (varName.startsWith('--space-') || varName.includes('spacing') || varName.includes('padding') || varName.includes('gap') || varName.includes('height') || varName.includes('width') || varName.includes('size')) {
    return 'spacing';
  }
  if (varName.startsWith('--font-') || varName.startsWith('--text-') || varName.startsWith('--heading-') || varName.startsWith('--display-') || varName.startsWith('--body-') || varName.startsWith('--caption-') || varName.startsWith('--label-') || varName.startsWith('--overline-') || varName.startsWith('--leading-')) {
    return 'typography';
  }
  if (varName.startsWith('--shadow-') || varName.includes('shadow')) {
    return 'elevations';
  }
  if (varName.startsWith('--radius-') || varName.includes('radius')) {
    return 'radius';
  }
  if (varName.startsWith('--transition-')) {
    return 'transitions';
  }
  if (varName.startsWith('--theme-') || varName.startsWith('--color-') || varName.startsWith('--') && (varName.includes('bg') || varName.includes('fg') || varName.includes('text') || varName.includes('border') || varName.includes('link'))) {
    return 'colors';
  }
  return 'other';
}

// Parse CSS file and extract tokens
function parseCSSTokens() {
  const cssContent = fs.readFileSync(tokensCssFile, 'utf-8');
  const root = postcss.parse(cssContent);
  
  const tokenRegistry = {};
  
  // Track which selectors we've seen
  const selectorContexts = {
    root: [],
    themeLight: {},
    themeDark: {},
    globalDark: []
  };
  
  root.walkRules((rule) => {
    const selector = rule.selector.trim();
    let context = null;
    let theme = null;
    let colorMode = null;
    
    // Determine context
    if (selector === ':root') {
      context = 'root';
    } else if (selector === 'html.dark') {
      context = 'globalDark';
    } else if (selector.startsWith('html.theme-')) {
      // Extract theme and color mode
      const themeMatch = selector.match(/html\.theme-(\w+)/);
      if (themeMatch) {
        theme = themeMatch[1];
        if (selector.includes('.dark')) {
          context = 'themeDark';
          colorMode = 'dark';
        } else {
          context = 'themeLight';
          colorMode = 'light';
        }
      }
    }
    
    // Extract CSS variables from this rule
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        const varName = decl.prop;
        const value = decl.value.trim();
        
        // Initialize token if not exists
        if (!tokenRegistry[varName]) {
          tokenRegistry[varName] = {
            type: 'base',
            category: getTokenCategory(varName),
            definedIn: [],
            values: {}
          };
        }
        
        // Track where it's defined
        if (context === 'root') {
          tokenRegistry[varName].definedIn.push(':root');
          tokenRegistry[varName].values.root = value;
        } else if (context === 'globalDark') {
          tokenRegistry[varName].definedIn.push('html.dark');
          tokenRegistry[varName].values.globalDark = value;
        } else if (context === 'themeLight' && theme) {
          const key = `html.theme-${theme}`;
          if (!tokenRegistry[varName].definedIn.includes(key)) {
            tokenRegistry[varName].definedIn.push(key);
          }
          if (!tokenRegistry[varName].values[theme]) {
            tokenRegistry[varName].values[theme] = {};
          }
          tokenRegistry[varName].values[theme].light = value;
        } else if (context === 'themeDark' && theme) {
          const key = `html.theme-${theme}.dark`;
          if (!tokenRegistry[varName].definedIn.includes(key)) {
            tokenRegistry[varName].definedIn.push(key);
          }
          if (!tokenRegistry[varName].values[theme]) {
            tokenRegistry[varName].values[theme] = {};
          }
          tokenRegistry[varName].values[theme].dark = value;
        }
      }
    });
  });
  
  return tokenRegistry;
}

// Load colors.json and merge with CSS tokens
function mergeJSONTokens(cssTokens) {
  const colorsData = JSON.parse(fs.readFileSync(colorsJsonFile, 'utf-8'));
  
  // Map JSON structure to CSS variables
  // For example: themes.cp.primary.light -> --theme-primary
  for (const [theme, themeData] of Object.entries(colorsData.themes || {})) {
    // Primary colors
    if (themeData.primary) {
      const cssVar = '--theme-primary';
      if (!cssTokens[cssVar]) {
        cssTokens[cssVar] = {
          type: 'themeAware',
          category: 'colors',
          definedIn: [],
          values: {}
        };
      }
      if (themeData.primary.light) {
        cssTokens[cssVar].values[theme] = cssTokens[cssVar].values[theme] || {};
        cssTokens[cssVar].values[theme].light = themeData.primary.light;
      }
      if (themeData.primary.dark) {
        cssTokens[cssVar].values[theme] = cssTokens[cssVar].values[theme] || {};
        cssTokens[cssVar].values[theme].dark = themeData.primary.dark;
      }
    }
    
    // Primary hover
    if (themeData.primaryHover) {
      const cssVar = '--theme-primary-hover';
      if (!cssTokens[cssVar]) {
        cssTokens[cssVar] = {
          type: 'themeAware',
          category: 'colors',
          definedIn: [],
          values: {}
        };
      }
      if (themeData.primaryHover.light) {
        cssTokens[cssVar].values[theme] = cssTokens[cssVar].values[theme] || {};
        cssTokens[cssVar].values[theme].light = themeData.primaryHover.light;
      }
      if (themeData.primaryHover.dark) {
        cssTokens[cssVar].values[theme] = cssTokens[cssVar].values[theme] || {};
        cssTokens[cssVar].values[theme].dark = themeData.primaryHover.dark;
      }
    }
    
    // Palette colors
    if (themeData.palette) {
      for (const [colorMode, palette] of Object.entries(themeData.palette)) {
        for (const [key, value] of Object.entries(palette)) {
          // Map palette keys to CSS variables
          const cssVarMap = {
            'pageBackground': '--page-bg',
            'cardBackground': '--card-bg',
            'navBackground': '--nav-bg',
            'inputBackground': '--input-bg',
            'inputDisabled': '--input-disabled-bg',
            'border': '--border-color',
            'hover': '--hover-bg',
            'titleText': '--text-primary',
            'secondaryText': '--text-secondary',
            'mutedText': '--text-muted',
            'link': '--link-color'
          };
          
          const cssVar = cssVarMap[key];
          if (cssVar) {
            if (!cssTokens[cssVar]) {
              cssTokens[cssVar] = {
                type: 'themeAware',
                category: 'colors',
                definedIn: [],
                values: {}
              };
            }
            cssTokens[cssVar].values[theme] = cssTokens[cssVar].values[theme] || {};
            cssTokens[cssVar].values[theme][colorMode] = value;
          }
        }
      }
    }
  }
  
  return cssTokens;
}

// Categorize tokens and generate MCP paths
function categorizeTokens(tokens) {
  const categorized = {};
  
  for (const [varName, token] of Object.entries(tokens)) {
    const categorizedToken = { ...token };
    
    // Determine token type
    const definedInRoot = token.definedIn.includes(':root');
    const themeSelectors = token.definedIn.filter(s => s.startsWith('html.theme-'));
    const themeCount = new Set(themeSelectors.map(s => s.match(/theme-(\w+)/)?.[1]).filter(Boolean)).size;
    
    if (definedInRoot && themeSelectors.length === 0) {
      // Base token - only in :root
      categorizedToken.type = 'base';
      categorizedToken.value = token.values.root || Object.values(token.values)[0];
    } else if (themeCount >= 2) {
      // Theme-aware - defined in multiple themes
      categorizedToken.type = 'themeAware';
      categorizedToken.themes = {};
      for (const theme of themes) {
        if (token.values[theme]) {
          categorizedToken.themes[theme] = token.values[theme];
        }
      }
    } else if (themeCount === 1) {
      // Theme-specific - only in one theme
      const theme = themeSelectors[0].match(/theme-(\w+)/)?.[1];
      categorizedToken.type = 'themeSpecific';
      categorizedToken.themes = [theme];
      if (token.values[theme]) {
        categorizedToken.value = token.values[theme];
      }
    } else {
      // Keep as base if uncertain
      categorizedToken.type = 'base';
      categorizedToken.value = token.values.root || Object.values(token.values)[0];
    }
    
    // Generate MCP path
    categorizedToken.mcpPath = generateMCPPath(
      varName,
      token.category,
      categorizedToken.type,
      categorizedToken.themes?.[0] || null
    );
    
    // Add tokenPath for theme-aware tokens that map to JSON
    if (categorizedToken.type === 'themeAware' && varName === '--theme-primary') {
      categorizedToken.tokenPath = 'themes.{theme}.primary';
    }
    
    categorized[varName] = categorizedToken;
  }
  
  return categorized;
}

// Main execution
try {
  console.log('🔍 Parsing CSS tokens...');
  let tokens = parseCSSTokens();
  
  console.log('🔄 Merging with JSON tokens...');
  tokens = mergeJSONTokens(tokens);
  
  console.log('📊 Categorizing tokens...');
  const categorized = categorizeTokens(tokens);
  
  // Create output structure
  const output = {
    "$schema": "https://harmony-ds.com/tokens/css-tokens-registry.schema.json",
    "name": "Harmony CSS Tokens Registry",
    "version": "1.0.0",
    "generatedAt": new Date().toISOString(),
    "tokens": categorized
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  const tokenCount = Object.keys(categorized).length;
  const baseCount = Object.values(categorized).filter(t => t.type === 'base').length;
  const themeAwareCount = Object.values(categorized).filter(t => t.type === 'themeAware').length;
  const themeSpecificCount = Object.values(categorized).filter(t => t.type === 'themeSpecific').length;
  
  console.log(`✅ Generated token registry with ${tokenCount} tokens`);
  console.log(`   - Base: ${baseCount}`);
  console.log(`   - Theme-aware: ${themeAwareCount}`);
  console.log(`   - Theme-specific: ${themeSpecificCount}`);
  console.log(`📄 Registry written to: ${outputFile}`);
} catch (error) {
  console.error('❌ Error parsing CSS tokens:', error);
  process.exit(1);
}
