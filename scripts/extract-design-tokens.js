/**
 * Extract Design Tokens
 * Consolidates all design token files with resolved CSS values
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveCSSVariables, getResolvedValue } from './css-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Token file paths
const TOKEN_FILES = {
  spacing: path.join(rootDir, 'src/tokens/spacing.json'),
  colors: path.join(rootDir, 'src/tokens/colors.json'),
  typography: path.join(rootDir, 'src/tokens/typography.json'),
  elevations: path.join(rootDir, 'src/tokens/elevations.json'),
};

// Output path
const OUTPUT_DIR = path.join(rootDir, 'mcp-data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'design-tokens.json');

// CSS tokens file
const TOKENS_CSS = path.join(rootDir, 'src/styles/tokens.css');

/**
 * Read and parse a token JSON file
 */
function readTokenFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Enhance tokens with resolved CSS values
 */
function enhanceTokens(tokenData, variableMap) {
  const enhanced = { ...tokenData };

  // Add resolved values for spacing tokens
  if (tokenData.scale) {
    enhanced.scaleResolved = {};
    for (const [key, token] of Object.entries(tokenData.scale)) {
      const cssVar = token.cssVar;
      if (cssVar && variableMap[cssVar]) {
        enhanced.scaleResolved[key] = {
          ...token,
          resolved: getResolvedValue(variableMap[cssVar].light, variableMap, 'light')
        };
      }
    }
  }

  // Add resolved values for border radius
  if (tokenData.borderRadius) {
    enhanced.borderRadiusResolved = {};
    for (const [key, token] of Object.entries(tokenData.borderRadius)) {
      const cssVar = token.cssVar;
      if (cssVar && variableMap[cssVar]) {
        enhanced.borderRadiusResolved[key] = {
          ...token,
          resolved: getResolvedValue(variableMap[cssVar].light, variableMap, 'light')
        };
      }
    }
  }

  // Add resolved values for colors (theme-specific + light/dark)
  if (tokenData.themes) {
    enhanced.themesResolved = {};
    for (const [themeName, themeData] of Object.entries(tokenData.themes)) {
      enhanced.themesResolved[themeName] = {};
      
      // Handle primary color
      if (themeData.primary) {
        enhanced.themesResolved[themeName].primary = {
          light: themeData.primary.light,
          dark: themeData.primary.dark
        };
      }

      // Handle palette
      if (themeData.palette) {
        enhanced.themesResolved[themeName].palette = {
          light: resolveColorValues(themeData.palette.light, variableMap, `${themeName}-light`),
          dark: resolveColorValues(themeData.palette.dark, variableMap, `${themeName}-dark`)
        };
      }
    }

    // Handle semantic colors
    if (tokenData.themes.semantic) {
      enhanced.themesResolved.semantic = resolveColorValues(tokenData.themes.semantic, variableMap, 'light');
    }
  }

  // Add resolved values for typography
  if (tokenData.fontFamilies) {
    enhanced.fontFamiliesResolved = {};
    for (const [key, token] of Object.entries(tokenData.fontFamilies)) {
      const cssVar = token.cssVar;
      if (cssVar && variableMap[cssVar]) {
        enhanced.fontFamiliesResolved[key] = {
          ...token,
          resolved: getResolvedValue(variableMap[cssVar].light, variableMap, 'light')
        };
      }
    }
  }

  if (tokenData.fontSizes) {
    enhanced.fontSizesResolved = {};
    for (const [key, token] of Object.entries(tokenData.fontSizes)) {
      const cssVar = token.cssVar;
      if (cssVar && variableMap[cssVar]) {
        enhanced.fontSizesResolved[key] = {
          ...token,
          resolved: getResolvedValue(variableMap[cssVar].light, variableMap, 'light')
        };
      }
    }
  }

  // Add resolved values for elevations
  if (tokenData.shadows) {
    enhanced.shadowsResolved = {};
    for (const [key, token] of Object.entries(tokenData.shadows)) {
      const cssVar = token.cssVar;
      if (cssVar && variableMap[cssVar]) {
        enhanced.shadowsResolved[key] = {
          ...token,
          light: getResolvedValue(variableMap[cssVar].light, variableMap, 'light'),
          dark: getResolvedValue(variableMap[cssVar].dark, variableMap, 'dark')
        };
      }
    }
  }

  return enhanced;
}

/**
 * Resolve color values recursively
 */
function resolveColorValues(colorObj, variableMap, context) {
  const resolved = {};
  
  for (const [key, value] of Object.entries(colorObj)) {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (like { light: ..., dark: ... })
      if (value.light && value.dark) {
        resolved[key] = {
          light: value.light,
          dark: value.dark
        };
      } else {
        resolved[key] = resolveColorValues(value, variableMap, context);
      }
    } else if (typeof value === 'string') {
      // Resolve CSS variable if it's a var() reference
      resolved[key] = getResolvedValue(value, variableMap, context);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

/**
 * Extract and consolidate all design tokens
 */
function extractDesignTokens() {
  console.log('🎨 Extracting design tokens with resolved values...\n');

  // Read and resolve CSS variables
  console.log('  Parsing tokens.css...');
  const tokensCssContent = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const variableMap = resolveCSSVariables(tokensCssContent);
  const varCount = Object.keys(variableMap).length;
  console.log(`  ✅ Resolved ${varCount} CSS variables\n`);

  // Read all token files
  const tokens = {};

  for (const [name, filePath] of Object.entries(TOKEN_FILES)) {
    console.log(`  Reading ${name}.json...`);
    const tokenData = readTokenFile(filePath);

    if (tokenData) {
      // Enhance token data with resolved values
      tokens[name] = enhanceTokens(tokenData, variableMap);
      console.log(`  ✅ ${name} tokens loaded and enhanced`);
    } else {
      console.log(`  ⚠️  ${name} tokens not found or invalid`);
    }
  }

  console.log();

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
  }

  // Write consolidated tokens
  const output = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Consolidated design tokens for Harmony Design System',
    ...tokens,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✅ Design tokens extracted to: ${OUTPUT_FILE}`);
  console.log(`   Total token categories: ${Object.keys(tokens).length}`);

  return output;
}

// Run extraction
try {
  const result = extractDesignTokens();
  console.log('\n✨ Design token extraction complete!\n');
} catch (error) {
  console.error('\n❌ Design token extraction failed:', error.message);
  process.exit(1);
}
