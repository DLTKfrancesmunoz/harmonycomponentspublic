#!/usr/bin/env node
/**
 * Variant Data Validation Script
 * Analyzes variant data completeness per-variant and identifies child element states
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MCP_DATA_DIR = path.join(rootDir, 'mcp-data/components');
const OUTPUT_FILE = path.join(rootDir, 'variant-data-report.json');

const EXPECTED_STATES = ['default', 'hover', 'active', 'focus', 'disabled'];
const THEMES = ['cp', 'vp', 'ppm', 'maconomy'];
const MODES = ['light', 'dark'];

/**
 * Extract states from variant data for a specific theme and mode
 */
function getVariantStates(variantData, theme, mode) {
  if (!variantData || !variantData[theme] || !variantData[theme][mode]) {
    return [];
  }
  return Object.keys(variantData[theme][mode]);
}

/**
 * Check if variant has all expected states
 */
function hasAllStates(variantData) {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      const states = getVariantStates(variantData, theme, mode);
      const hasAll = EXPECTED_STATES.every(state => states.includes(state));
      if (!hasAll) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get all states present across all themes and modes for a variant
 */
function getAllVariantStates(variantData) {
  const allStates = new Set();
  for (const theme of THEMES) {
    for (const mode of MODES) {
      const states = getVariantStates(variantData, theme, mode);
      states.forEach(state => allStates.add(state));
    }
  }
  return Array.from(allStates).sort();
}

/**
 * Extract child element states from cssClassStyles
 */
function extractChildElementStates(cssClassStyles) {
  if (!cssClassStyles || typeof cssClassStyles !== 'object') {
    return [];
  }

  const childStates = [];
  const statePatterns = {
    hover: /:hover/,
    active: /:active|\.is-active|--active/,
    focus: /:focus|:focus-visible/,
    disabled: /:disabled|\.disabled/
  };

  for (const [selector, styles] of Object.entries(cssClassStyles)) {
    // Skip root component selectors, only look for child elements
    if (selector.includes('__') || selector.includes('--')) {
      for (const [stateName, pattern] of Object.entries(statePatterns)) {
        if (pattern.test(selector)) {
          childStates.push({
            selector,
            state: stateName,
            element: selector.split(/[:\.]/)[0] // Extract element class name
          });
        }
      }
    }
  }

  return childStates;
}

/**
 * Categorize component variant completeness
 */
function categorizeComponent(variants, childElementStates) {
  if (!variants || Object.keys(variants).length === 0) {
    return {
      category: 'empty',
      hasChildStates: childElementStates.length > 0
    };
  }

  const variantCategories = [];
  let hasFull = false;
  let hasPartial = false;
  let hasDefaultOnly = true;

  for (const [variantName, variantData] of Object.entries(variants)) {
    const states = getAllVariantStates(variantData);
    const hasAll = hasAllStates(variantData);

    if (hasAll) {
      hasFull = true;
      hasDefaultOnly = false;
      variantCategories.push({
        variant: variantName,
        category: 'full',
        states
      });
    } else if (states.length > 1) {
      hasPartial = true;
      hasDefaultOnly = false;
      variantCategories.push({
        variant: variantName,
        category: 'partial',
        states
      });
    } else {
      variantCategories.push({
        variant: variantName,
        category: 'default-only',
        states
      });
    }
  }

  // Determine overall category
  let category;
  if (hasFull && !hasPartial && !hasDefaultOnly) {
    category = 'full';
  } else if (hasPartial || (hasFull && hasDefaultOnly)) {
    category = 'partial';
  } else {
    category = 'default-only';
  }

  return {
    category,
    hasChildStates: childElementStates.length > 0,
    variantCategories
  };
}

/**
 * Analyze a single component
 */
function analyzeComponent(componentName, componentData) {
  const variants = componentData?.visualSpecifications?.colors?.variants || {};
  const cssClassStyles = componentData?.cssClassStyles || {};

  const childElementStates = extractChildElementStates(cssClassStyles);
  const categorization = categorizeComponent(variants, childElementStates);

  const variantDetails = {};
  if (variants && Object.keys(variants).length > 0) {
    for (const [variantName, variantData] of Object.entries(variants)) {
      const states = getAllVariantStates(variantData);
      variantDetails[variantName] = {
        states,
        statesByTheme: {}
      };

      // Get states per theme/mode for detailed analysis
      for (const theme of THEMES) {
        variantDetails[variantName].statesByTheme[theme] = {};
        for (const mode of MODES) {
          variantDetails[variantName].statesByTheme[theme][mode] = getVariantStates(variantData, theme, mode);
        }
      }
    }
  }

  return {
    component: componentName,
    hasVariants: Object.keys(variants).length > 0,
    variantCount: Object.keys(variants).length,
    categorization,
    variantDetails,
    childElementStates: childElementStates.length > 0 ? childElementStates : [],
    childElementStateCount: childElementStates.length
  };
}

/**
 * Main validation function
 */
function validateVariantData() {
  console.log('🔍 Starting Variant Data Validation...\n');

  const componentFiles = fs.readdirSync(MCP_DATA_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();

  const results = {
    summary: {
      totalComponents: componentFiles.length,
      byCategory: {
        full: 0,
        partial: 0,
        'default-only': 0,
        empty: 0
      },
      withChildStates: 0,
      totalVariants: 0,
      totalChildElementStates: 0
    },
    components: []
  };

  for (const file of componentFiles) {
    const componentName = path.basename(file, '.json');
    const filePath = path.join(MCP_DATA_DIR, file);

    try {
      const componentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const analysis = analyzeComponent(componentName, componentData);

      results.components.push(analysis);
      results.summary.byCategory[analysis.categorization.category]++;
      results.summary.totalVariants += analysis.variantCount;
      results.summary.totalChildElementStates += analysis.childElementStateCount;

      if (analysis.categorization.hasChildStates) {
        results.summary.withChildStates++;
      }

      // Log progress
      const status = analysis.categorization.category === 'full' ? '✅' :
                     analysis.categorization.category === 'partial' ? '⚠️' :
                     analysis.categorization.category === 'default-only' ? '📋' : '⚪';
      console.log(`${status} ${componentName.padEnd(25)} ${analysis.categorization.category.padEnd(15)} ${analysis.variantCount} variants, ${analysis.childElementStateCount} child states`);

    } catch (error) {
      console.error(`❌ Error processing ${componentName}:`, error.message);
    }
  }

  // Write report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  console.log('\n📊 Summary:');
  console.log(`   Total Components: ${results.summary.totalComponents}`);
  console.log(`   Full: ${results.summary.byCategory.full}`);
  console.log(`   Partial: ${results.summary.byCategory.partial}`);
  console.log(`   Default-Only: ${results.summary.byCategory['default-only']}`);
  console.log(`   Empty: ${results.summary.byCategory.empty}`);
  console.log(`   With Child States: ${results.summary.withChildStates}`);
  console.log(`   Total Variants: ${results.summary.totalVariants}`);
  console.log(`   Total Child Element States: ${results.summary.totalChildElementStates}`);
  console.log(`\n✅ Report written to: ${OUTPUT_FILE}`);

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateVariantData();
}

export { validateVariantData, analyzeComponent, extractChildElementStates };
