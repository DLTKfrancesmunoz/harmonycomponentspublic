/**
 * Generate MCP Data
 * Uses astro-parser to generate component JSON files with Plan 1 fields
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseComponent,
  extractDependencies,
  extractDescription,
  getComponentName,
  loadCssSpacing,
} from './astro-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Paths
const COMPONENTS_DIR = path.join(rootDir, 'src/components/ui');
const OUTPUT_DIR = path.join(rootDir, 'mcp-data/components');
const CACHE_FILE = path.join(rootDir, '.cache/components-regeneration-cache.json');

// Theme configuration
const THEME_SUPPORT = {
  themes: ['cp', 'vp', 'ppm', 'maconomy'],
  darkMode: true,
};

/**
 * Load cache file
 */
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.warn('⚠️  Cache file could not be loaded:', error.message);
  }
  return { componentMtimes: {} };
}

/**
 * Save cache file
 */
function saveCache(cache) {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Check if component needs regeneration
 */
function shouldRegenerateComponent(componentPath, componentName, cache) {
  const outputFile = path.join(OUTPUT_DIR, `${componentName.toLowerCase()}.json`);

  // Check if output exists
  if (!fs.existsSync(outputFile)) {
    return true;
  }

  // Check component file mtime
  const componentMtime = fs.statSync(componentPath).mtimeMs;
  const cachedMtime = cache.componentMtimes?.[componentName];

  if (componentMtime !== cachedMtime) {
    return true;
  }

  return false;
}

/**
 * Generate component JSON data
 */
async function generateComponentData(componentPath, cssSpacingMap) {
  const componentName = getComponentName(componentPath);

  try {
    // Parse component with astro-parser (with CSS spacing)
    const parsed = await parseComponent(componentPath, cssSpacingMap);

    // Extract description from file
    const description = extractDescription(componentPath) || `${componentName} component`;

    // Build component data (Plan 1 + Plan 2 fields)
    const componentData = {
      name: componentName,
      type: 'component',
      filePath: path.relative(rootDir, componentPath).replace(/\\/g, '/'),
      description,

      // Plan 1 fields
      props: parsed.props || {},
      imports: parsed.imports || {},
      dependencies: extractDependencies(parsed.frontmatter ? { children: [{ type: 'frontmatter', value: parsed.frontmatter }] } : {}),
      cssClasses: parsed.cssClasses || [],

      themeSupport: THEME_SUPPORT,

      // Plan 2 fields (NEW)
      slots: parsed.slots || {},
      structure: parsed.structure || null,

      _metadata: {
        lastGenerated: new Date().toISOString(),
        generatedWith: '@astrojs/compiler@2.13.0',
      },
    };

    return componentData;
  } catch (error) {
    console.error(`  ❌ Error parsing ${componentName}:`, error.message);
    throw error;
  }
}

/**
 * Write component JSON to file
 */
function writeComponentJSON(componentName, data) {
  const outputFile = path.join(OUTPUT_DIR, `${componentName.toLowerCase()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Generate MCP data for all components
 */
async function generateMCPData() {
  console.log('🔧 Generating MCP component data...\n');

  // Load CSS spacing map
  console.log('📦 Loading CSS spacing data...');
  const cssSpacingMap = loadCssSpacing();
  const spacingCount = Object.keys(cssSpacingMap).length;
  console.log(`✅ Loaded ${spacingCount} CSS class spacing values\n`);

  // Load cache
  const cache = loadCache();

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Get all .astro component files
  const componentFiles = fs
    .readdirSync(COMPONENTS_DIR)
    .filter((file) => file.endsWith('.astro'))
    .map((file) => path.join(COMPONENTS_DIR, file));

  console.log(`Found ${componentFiles.length} components\n`);

  // Process each component
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < componentFiles.length; i++) {
    const componentPath = componentFiles[i];
    const componentName = getComponentName(componentPath);
    const progress = `[${i + 1}/${componentFiles.length}]`;

    // Check if regeneration is needed
    if (!shouldRegenerateComponent(componentPath, componentName, cache)) {
      console.log(`${progress} ⏭️  Skipped ${componentName} (unchanged)`);
      skipped++;
      continue;
    }

    try {
      console.log(`${progress} 🔨 Generating ${componentName}...`);

      // Generate component data (with CSS spacing)
      const componentData = await generateComponentData(componentPath, cssSpacingMap);

      // Write to file
      writeComponentJSON(componentName, componentData);

      // Update cache
      cache.componentMtimes = cache.componentMtimes || {};
      cache.componentMtimes[componentName] = fs.statSync(componentPath).mtimeMs;

      // Enhanced log with slots count
      const slotsCount = Object.keys(componentData.slots || {}).length;
      console.log(`${progress} ✅ ${componentName} generated (${Object.keys(componentData.props).length} props, ${componentData.dependencies.length} deps, ${slotsCount} slots)`);
      generated++;
    } catch (error) {
      console.error(`${progress} ❌ Failed to generate ${componentName}`);
      failed++;
    }
  }

  // Save cache
  saveCache(cache);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Generation Summary:');
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped: ${skipped} (unchanged)`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${componentFiles.length}`);
  console.log('='.repeat(50));

  return { generated, skipped, failed, total: componentFiles.length };
}

// Run generation
try {
  const result = await generateMCPData();
  console.log('\n✨ Component data generation complete!\n');

  if (result.failed > 0) {
    console.warn(`⚠️  ${result.failed} component(s) failed to generate`);
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Component data generation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
