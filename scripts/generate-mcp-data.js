/**
 * Generate MCP Data
 * Uses astro-parser to generate component JSON files with enhanced visual specifications
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
import {
  parseCSSFiles,
  resolveCSSVariables
} from './css-parser.js';
import {
  extractVisualSpecifications
} from './visual-spec-extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Paths
const COMPONENTS_DIR = path.join(rootDir, 'src/components/ui');
const OUTPUT_DIR = path.join(rootDir, 'mcp-data/components');
const CACHE_FILE = path.join(rootDir, '.cache/components-regeneration-cache.json');
const CSS_DIR = path.join(rootDir, 'src/styles');
const TOKENS_CSS = path.join(rootDir, 'src/styles/tokens.css');
const MCP_DATA_DIR = path.join(rootDir, 'mcp-data');
const INTERACTIVITY_FILE = path.join(MCP_DATA_DIR, 'interactivity.json');
const RECIPES_INDEX = path.join(MCP_DATA_DIR, 'recipes', 'index.json');
const COMPONENT_EXAMPLES_FILE = path.join(MCP_DATA_DIR, 'component-examples.json');

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
 * Load interactivity map from mcp-data/interactivity.json (component name -> { events, state })
 */
function loadInteractivityMap() {
  try {
    if (fs.existsSync(INTERACTIVITY_FILE)) {
      return JSON.parse(fs.readFileSync(INTERACTIVITY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.warn('⚠️  Could not load interactivity map:', error.message);
  }
  return {};
}

/**
 * Build component -> examples map from recipes (each recipe's examples attributed to every component in that recipe)
 */
function buildComponentToExamples() {
  const componentToExamples = {};
  try {
    if (!fs.existsSync(RECIPES_INDEX)) return componentToExamples;
    const index = JSON.parse(fs.readFileSync(RECIPES_INDEX, 'utf-8'));
    const recipes = index.recipes || [];
    for (const recipe of recipes) {
      const filePath = path.join(rootDir, recipe.filePath);
      if (!fs.existsSync(filePath)) continue;
      const recipeData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const recipeId = recipeData.id || recipe.id;
      const examples = recipeData.examples || [];
      const componentNames = new Set((recipeData.components || []).map((c) => (typeof c === 'string' ? c : c.name)));
      for (const compName of componentNames) {
        if (!componentToExamples[compName]) componentToExamples[compName] = [];
        for (const ex of examples) {
          componentToExamples[compName].push({
            name: ex.name,
            description: ex.description || undefined,
            recipeId: recipeId,
          });
        }
      }
    }
    // Append manual overrides from component-examples.json if present
    if (fs.existsSync(COMPONENT_EXAMPLES_FILE)) {
      const overrides = JSON.parse(fs.readFileSync(COMPONENT_EXAMPLES_FILE, 'utf-8'));
      for (const [compName, extraExamples] of Object.entries(overrides)) {
        if (!Array.isArray(extraExamples)) continue;
        if (!componentToExamples[compName]) componentToExamples[compName] = [];
        for (const ex of extraExamples) {
          componentToExamples[compName].push({
            name: ex.name,
            description: ex.description || undefined,
            recipeId: ex.recipeId || undefined,
            snippet: ex.snippet || undefined,
          });
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not build component examples from recipes:', error.message);
  }
  return componentToExamples;
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
async function generateComponentData(componentPath, cssSpacingMap, parsedCSS, variableMap) {
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

      // Plan 2 fields
      slots: parsed.slots || {},
      structure: parsed.structure || null,

      // Usage patterns (Plan 3 - usage conventions)
      usagePatterns: parsed.usagePatterns || {},

      _metadata: {
        lastGenerated: new Date().toISOString(),
        generatedWith: '@astrojs/compiler@2.13.0',
      },
    };

    // Extract visual specifications (NEW - Plan 3)
    if (parsedCSS && variableMap) {
      const visualSpecs = extractVisualSpecifications(componentData, parsedCSS, variableMap);
      
      // Merge visual specs into component data
      componentData.visualSpecifications = visualSpecs.visualSpecifications;
      componentData.accessibility = visualSpecs.accessibility;
      componentData.cssClassStyles = visualSpecs.cssClassStyles;
      
      // Add variant index for easy theme+variant queries
      if (visualSpecs._variantIndex) {
        componentData._variantIndex = visualSpecs._variantIndex;
      }
      
      // Add variant metadata for MCP filtering
      if (visualSpecs._variantMetadata) {
        componentData._variantMetadata = visualSpecs._variantMetadata;
      }
      
      // Update metadata
      componentData._metadata.includesVisualSpecs = true;
      if (visualSpecs._variantMetadata?.availableVariants) {
        componentData._metadata.availableVariants = visualSpecs._variantMetadata.availableVariants;
      }
      if (visualSpecs._variantHelper?.availableVariants) {
        componentData._metadata.availableVariants = visualSpecs._variantHelper.availableVariants;
      }
    }

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
  console.log('🔧 Generating MCP component data with visual specifications...\n');

  // Load CSS spacing map
  console.log('📦 Loading CSS spacing data...');
  const cssSpacingMap = loadCssSpacing();
  const spacingCount = Object.keys(cssSpacingMap).length;
  console.log(`✅ Loaded ${spacingCount} CSS class spacing values\n`);

  // Parse CSS files and resolve variables
  console.log('🎨 Parsing CSS files and resolving variables...');
  const parsedCSS = parseCSSFiles(CSS_DIR);
  const tokensCssContent = fs.readFileSync(TOKENS_CSS, 'utf-8');
  const variableMap = resolveCSSVariables(tokensCssContent);
  const varCount = Object.keys(variableMap).length;
  console.log(`✅ Parsed ${Object.keys(parsedCSS).length} CSS files, resolved ${varCount} CSS variables\n`);

  // Load cache
  const cache = loadCache();

  // Invalidate component cache when any CSS file has changed (so CSS-only edits update JSON)
  const cssFiles = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
  const cssDirMtime = cssFiles.reduce((max, f) => {
    const m = fs.statSync(path.join(CSS_DIR, f)).mtimeMs;
    return m > max ? m : max;
  }, 0);
  if (cache.cssDirMtime != null && cssDirMtime > cache.cssDirMtime) {
    cache.componentMtimes = {};
  }
  cache.cssDirMtime = cssDirMtime;

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Load interactivity map and component->examples (from recipes + optional component-examples.json)
  const interactivityMap = loadInteractivityMap();
  const componentToExamples = buildComponentToExamples();
  const interactivityCount = Object.keys(interactivityMap).length;
  const examplesComponentCount = Object.keys(componentToExamples).length;
  console.log(`📎 Loaded interactivity for ${interactivityCount} components, examples for ${examplesComponentCount} components\n`);

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

      // Generate component data (with CSS spacing and visual specs)
      const componentData = await generateComponentData(componentPath, cssSpacingMap, parsedCSS, variableMap);

      // Merge interactivity and examples (from mcp-data/interactivity.json and recipes)
      if (interactivityMap[componentName]) {
        componentData.interactivity = interactivityMap[componentName];
      }
      componentData.examples = componentToExamples[componentName] || [];

      // Write to file
      writeComponentJSON(componentName, componentData);

      // Update cache
      cache.componentMtimes = cache.componentMtimes || {};
      cache.componentMtimes[componentName] = fs.statSync(componentPath).mtimeMs;

      // Enhanced log with slots count and visual specs
      const slotsCount = Object.keys(componentData.slots || {}).length;
      const hasVisualSpecs = componentData._metadata?.includesVisualSpecs || false;
      const visualSpecsTag = hasVisualSpecs ? '🎨' : '';
      console.log(`${progress} ✅ ${componentName} generated ${visualSpecsTag} (${Object.keys(componentData.props).length} props, ${componentData.dependencies.length} deps, ${slotsCount} slots)`);
      generated++;
    } catch (error) {
      console.error(`${progress} ❌ Failed to generate ${componentName}`);
      console.error(`    Error: ${error.message}`);
      failed++;
    }
  }

  // Post-pass: merge interactivity and examples into all component JSONs (including skipped ones)
  if (fs.existsSync(OUTPUT_DIR)) {
    const outputFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.json'));
    let merged = 0;
    for (const file of outputFiles) {
      const outputPath = path.join(OUTPUT_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        const componentName = data.name;
        if (!componentName) continue;
        let changed = false;
        if (interactivityMap[componentName]) {
          data.interactivity = interactivityMap[componentName];
          changed = true;
        }
        const examples = componentToExamples[componentName] || [];
        if (JSON.stringify(data.examples) !== JSON.stringify(examples)) {
          data.examples = examples;
          changed = true;
        }
        if (changed) {
          fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
          merged++;
        }
      } catch (err) {
        console.warn(`⚠️  Could not merge interactivity/examples into ${file}:`, err.message);
      }
    }
    if (merged > 0) {
      console.log(`\n📎 Merged interactivity/examples into ${merged} existing component JSON(s)\n`);
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
