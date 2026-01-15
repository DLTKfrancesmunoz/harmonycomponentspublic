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
 * Parse Props interface from .astro component file
 */
function parsePropsInterface(fileContent, componentName) {
  // Find the Props interface
  const interfaceRegex = /interface\s+Props\s*\{([^}]+)\}/s;
  const match = fileContent.match(interfaceRegex);

  if (!match) {
    return null;
  }

  const propsText = match[1];
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

    components.push({
      name: componentName,
      filePath: `src/components/ui/${file}`,
      fileHash: computeFileHash(fileContent),
      props: props || {},
      hasProps: props !== null
    });
  }

  console.log(`✅ Parsed ${components.length} components`);
  return components;
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
