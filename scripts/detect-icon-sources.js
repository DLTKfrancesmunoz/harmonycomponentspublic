#!/usr/bin/env node
/**
 * Icon Source Detection Utility
 * 
 * Detects whether an icon is from Heroicons, custom SVG, or unknown.
 * Matches the logic in Icon.astro component:
 * 1. First checks Heroicons (node_modules/heroicons/24/outline/{name}.svg)
 * 2. Then checks custom SVGs (public/{name}.svg)
 * 
 * Usage: node scripts/detect-icon-sources.js <icon-name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detect icon source and return metadata
 * @param {string} iconName - The icon name (e.g., "home", "Risk Shield")
 * @returns {Object} { source: "heroicons"|"custom"|"unknown", path: string }
 */
function detectIconSource(iconName) {
  if (!iconName) {
    return { source: 'unknown', path: null };
  }

  // Check Heroicons first (matches Icon.astro logic)
  const heroiconsPath = path.join(
    process.cwd(),
    'node_modules',
    'heroicons',
    '24',
    'outline',
    `${iconName}.svg`
  );

  if (fs.existsSync(heroiconsPath)) {
    return {
      source: 'heroicons',
      path: `node_modules/heroicons/24/outline/${iconName}.svg`
    };
  }

  // Check custom SVG in public folder
  // Handle icons with spaces (e.g., "Risk Shield" -> "Risk Shield.svg")
  const customPath = path.join(process.cwd(), 'public', `${iconName}.svg`);

  if (fs.existsSync(customPath)) {
    return {
      source: 'custom',
      path: `public/${iconName}.svg`
    };
  }

  // Also check if it's in a subdirectory (like logos/)
  // This handles cases like D_64x64.svg in /D_64x64.svg
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir, { recursive: true, withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name === `${iconName}.svg`) {
        const relativePath = path.relative(process.cwd(), path.join(file.path || publicDir, file.name));
        return {
          source: 'custom',
          path: relativePath
        };
      }
    }
  }

  return { source: 'unknown', path: null };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const iconName = process.argv[2];
  if (!iconName) {
    console.error('Usage: node scripts/detect-icon-sources.js <icon-name>');
    process.exit(1);
  }

  const result = detectIconSource(iconName);
  console.log(JSON.stringify(result, null, 2));
}

export { detectIconSource };
