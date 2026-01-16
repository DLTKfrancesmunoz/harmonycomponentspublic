/**
 * Extract Design Tokens
 * Consolidates all design token files into a single mcp-data/design-tokens.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * Extract and consolidate all design tokens
 */
function extractDesignTokens() {
  console.log('🎨 Extracting design tokens...\n');

  // Read all token files
  const tokens = {};

  for (const [name, filePath] of Object.entries(TOKEN_FILES)) {
    console.log(`  Reading ${name}.json...`);
    const tokenData = readTokenFile(filePath);

    if (tokenData) {
      tokens[name] = tokenData;
      console.log(`  ✅ ${name} tokens loaded`);
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
