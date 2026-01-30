#!/usr/bin/env node
/**
 * Generate snapshot of current component Props and design tokens
 * This creates a timestamped snapshot for change detection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeFileHash } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract Props interface body with brace-balanced logic so types containing '}'
 * (e.g. primaryButton?: { text: string }) do not truncate the rest of the interface.
 */
function extractPropsBlock(content) {
  const interfaceMatch = content.match(/\binterface\s+Props\s*\{/s);
  if (!interfaceMatch) return null;

  const openBraceIndex = content.indexOf('{', interfaceMatch.index);
  if (openBraceIndex === -1) return null;

  let depth = 1;
  let i = openBraceIndex + 1;
  while (i < content.length && depth > 0) {
    const c = content[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;

  return content.slice(openBraceIndex + 1, i - 1);
}

/**
 * Parse Props interface from .astro component file
 */
function parsePropsInterface(fileContent, componentName) {
  const propsText = extractPropsBlock(fileContent);
  if (!propsText) {
    return null;
  }

  const props = {};

  // Parse each prop line
  const propLines = propsText.split('\n').filter(line => line.trim());

  for (const line of propLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      continue;
    }

    // Match: propName?: type; or propName: type;
    const propMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?/);
    if (propMatch) {
      const [, propName, optional, propType] = propMatch;
      props[propName] = {
        type: propType.trim(),
        optional: !!optional,
        default: null // We'll extract defaults from destructuring if needed
      };
    }
  }

  // Try to extract default values from destructuring
  const destructureRegex = /const\s*\{([^}]+)\}\s*=\s*Astro\.props/s;
  const destructureMatch = fileContent.match(destructureRegex);

  if (destructureMatch) {
    const destructureText = destructureMatch[1];
    const assignments = destructureText.split(',');

    for (const assignment of assignments) {
      const defaultMatch = assignment.match(/(\w+)\s*=\s*([^,]+)/);
      if (defaultMatch) {
        const [, propName, defaultValue] = defaultMatch;
        const trimmedPropName = propName.trim();
        const trimmedDefault = defaultValue.trim();

        if (props[trimmedPropName]) {
          props[trimmedPropName].default = trimmedDefault;
        }
      }
    }
  }

  return props;
}

/** Union-like prop names we snapshot as value lists for variant_added/variant_removed detection */
const UNION_PROPS = ['variant', 'size', 'style'];

/**
 * Parse a type string that is a union of quoted strings (e.g. "'a' | 'b' | 'c'") into an array of values.
 * Returns null if the type does not look like a union of quoted literals.
 */
function parseUnionValuesFromType(typeStr) {
  if (!typeStr || typeof typeStr !== 'string') return null;
  const trimmed = typeStr.trim();
  if (!trimmed.includes('|')) return null;
  const parts = trimmed.split('|').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
  const allQuoted = parts.every(p => p.length >= 0 && !p.includes(' '));
  if (!allQuoted || parts.some(p => p.includes('{'))) return null;
  return parts;
}

/**
 * From parsed props, extract variantValues, sizeValues, styleValues for union-style props.
 */
function extractUnionValues(props) {
  const result = {};
  for (const propName of UNION_PROPS) {
    const typeStr = props?.[propName]?.type;
    const values = parseUnionValuesFromType(typeStr);
    if (values && values.length > 0) {
      result[`${propName}Values`] = values;
    }
  }
  return result;
}

/**
 * Generate snapshot of all components
 */
export function generateComponentsSnapshot() {
  const componentsDir = path.join(__dirname, '../../src/components/ui');
  const components = [];

  if (!fs.existsSync(componentsDir)) {
    console.warn('Components directory not found');
    return [];
  }

  const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.astro'));

  for (const file of files) {
    const componentName = file.replace('.astro', '');
    const filePath = path.join(componentsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const props = parsePropsInterface(fileContent, componentName);
    const unionValues = extractUnionValues(props || {});

    components.push({
      name: componentName,
      filePath: `src/components/ui/${file}`,
      fileHash: computeFileHash(fileContent),
      props: props || {},
      hasProps: props !== null,
      ...unionValues
    });
  }

  console.log(`✅ Parsed ${components.length} components`);
  return components;
}

/**
 * Generate snapshot of design system style files (CSS)
 */
export function generateStylesSnapshot() {
  const stylesDir = path.join(__dirname, '../../src/styles');
  const styleFiles = ['components.css', 'global.css', 'layout.css', 'reset.css', 'tokens.css', 'utilities.css'];
  const styles = {};

  if (!fs.existsSync(stylesDir)) {
    console.warn('Styles directory not found');
    return styles;
  }

  for (const file of styleFiles) {
    const filePath = path.join(stylesDir, file);
    if (!fs.existsSync(filePath)) continue;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    styles[file] = {
      filePath: `src/styles/${file}`,
      hash: computeFileHash(fileContent)
    };
  }

  if (Object.keys(styles).length > 0) {
    console.log(`✅ Parsed ${Object.keys(styles).length} style files`);
  }
  return styles;
}

/**
 * Generate snapshot of design tokens
 */
export function generateTokensSnapshot() {
  const tokensDir = path.join(__dirname, '../../src/tokens');
  const tokenFiles = ['colors.json', 'spacing.json', 'typography.json', 'elevations.json'];
  const tokens = {};

  for (const tokenFile of tokenFiles) {
    const filePath = path.join(tokensDir, tokenFile);

    if (!fs.existsSync(filePath)) {
      console.warn(`Token file not found: ${tokenFile}`);
      tokens[tokenFile.replace('.json', '')] = {
        hash: null,
        data: {}
      };
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    tokens[tokenFile.replace('.json', '')] = {
      hash: computeFileHash(fileContent),
      data
    };
  }

  console.log(`✅ Parsed ${Object.keys(tokens).length} token files`);
  return tokens;
}

/**
 * Main function to generate complete snapshot
 */
export async function generateSnapshot() {
  console.log('📸 Generating snapshot...\n');

  const snapshot = {
    components: generateComponentsSnapshot(),
    tokens: generateTokensSnapshot(),
    styles: generateStylesSnapshot(),
    timestamp: Date.now(),
    date: new Date().toISOString()
  };

  return snapshot;
}

// Run directly if executed as script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSnapshot()
    .then(snapshot => {
      console.log('\n✅ Snapshot generated successfully');
      console.log(`   Components: ${snapshot.components.length}`);
      console.log(`   Tokens: ${Object.keys(snapshot.tokens).length}`);
    })
    .catch(error => {
      console.error('❌ Failed to generate snapshot:', error);
      process.exit(1);
    });
}
