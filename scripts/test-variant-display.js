#!/usr/bin/env node
/**
 * Test Cases for Variant Data Display
 * Validates expected behavior for different variant data completeness levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeComponent, extractChildElementStates } from './validate-variant-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MCP_DATA_DIR = path.join(rootDir, 'mcp-data/components');

/**
 * Load component data
 */
function loadComponent(componentName) {
  const filePath = path.join(MCP_DATA_DIR, `${componentName.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Get states for a variant
 */
function getVariantStates(variantData, theme = 'cp', mode = 'light') {
  if (!variantData || !variantData[theme] || !variantData[theme][mode]) {
    return [];
  }
  return Object.keys(variantData[theme][mode]);
}

/**
 * Test 1: Button (Full Data)
 * Should show all states for all variants
 */
function testButtonFullData() {
  console.log('\n🧪 Test 1: Button (Full Data)');
  const component = loadComponent('button');
  if (!component) {
    console.log('   ❌ Button component not found');
    return false;
  }

  const variants = component.visualSpecifications?.colors?.variants || {};
  const primaryVariant = variants.primary;
  
  if (!primaryVariant) {
    console.log('   ❌ Primary variant not found');
    return false;
  }

  const states = getVariantStates(primaryVariant);
  const expectedStates = ['default', 'hover', 'active', 'focus', 'disabled'];
  const hasAllStates = expectedStates.every(state => states.includes(state));

  if (hasAllStates) {
    console.log('   ✅ Primary variant has all states:', states.join(', '));
    return true;
  } else {
    console.log('   ❌ Primary variant missing states. Expected:', expectedStates.join(', '), 'Got:', states.join(', '));
    return false;
  }
}

/**
 * Test 2: Alert (Mixed Completeness)
 * Should show only default for info variant, default + hover for enhanced variant
 */
function testAlertMixedCompleteness() {
  console.log('\n🧪 Test 2: Alert (Mixed Completeness)');
  const component = loadComponent('alert');
  if (!component) {
    console.log('   ❌ Alert component not found');
    return false;
  }

  const variants = component.visualSpecifications?.colors?.variants || {};
  const infoVariant = variants.info;
  const enhancedVariant = variants.enhanced;

  if (!infoVariant || !enhancedVariant) {
    console.log('   ❌ Required variants not found');
    return false;
  }

  const infoStates = getVariantStates(infoVariant);
  const enhancedStates = getVariantStates(enhancedVariant);

  // Info should only have default
  const infoOnlyDefault = infoStates.length === 1 && infoStates.includes('default');
  
  // Enhanced should have default + hover (at minimum)
  const enhancedHasDefaultAndHover = enhancedStates.includes('default') && enhancedStates.includes('hover');

  if (infoOnlyDefault && enhancedHasDefaultAndHover) {
    console.log('   ✅ Info variant has only default:', infoStates.join(', '));
    console.log('   ✅ Enhanced variant has default + hover:', enhancedStates.join(', '));
    return true;
  } else {
    console.log('   ❌ Variant states incorrect');
    console.log('      Info states:', infoStates.join(', '), '(expected: default only)');
    console.log('      Enhanced states:', enhancedStates.join(', '), '(expected: default + hover)');
    return false;
  }
}

/**
 * Test 3: LeftSidebar (Default-Only Variants, But Child States Exist)
 * Should show only default for variant colors, but also check cssClassStyles for child states
 */
function testLeftSidebarDefaultOnlyWithChildStates() {
  console.log('\n🧪 Test 3: LeftSidebar (Default-Only Variants, But Child States Exist)');
  const component = loadComponent('leftsidebar');
  if (!component) {
    console.log('   ❌ LeftSidebar component not found');
    return false;
  }

  const variants = component.visualSpecifications?.colors?.variants || {};
  const cssClassStyles = component.cssClassStyles || {};
  
  // Check that variants only have default
  let allVariantsDefaultOnly = true;
  for (const [variantName, variantData] of Object.entries(variants)) {
    const states = getVariantStates(variantData);
    if (states.length !== 1 || !states.includes('default')) {
      allVariantsDefaultOnly = false;
      console.log(`   ❌ Variant ${variantName} has more than default:`, states.join(', '));
    }
  }

  // Check for child element states
  const childElementStates = extractChildElementStates(cssClassStyles);
  const hasChildStates = childElementStates.length > 0;
  const hasActiveState = childElementStates.some(s => s.state === 'active');
  const hasHoverState = childElementStates.some(s => s.state === 'hover');

  if (allVariantsDefaultOnly && hasChildStates) {
    console.log('   ✅ All variants have only default state');
    console.log('   ✅ Child element states found:', childElementStates.length, 'total');
    if (hasActiveState) {
      console.log('   ✅ Child element active states found');
    }
    if (hasHoverState) {
      console.log('   ✅ Child element hover states found');
    }
    return true;
  } else {
    if (!allVariantsDefaultOnly) {
      console.log('   ❌ Not all variants are default-only');
    }
    if (!hasChildStates) {
      console.log('   ❌ No child element states found');
    }
    return false;
  }
}

/**
 * Test 4: Spinner (Empty Variants)
 * Should skip variant section or show informative message
 */
function testSpinnerEmptyVariants() {
  console.log('\n🧪 Test 4: Spinner (Empty Variants)');
  const component = loadComponent('spinner');
  if (!component) {
    console.log('   ❌ Spinner component not found');
    return false;
  }

  const variants = component.visualSpecifications?.colors?.variants || {};
  const isEmpty = Object.keys(variants).length === 0;

  if (isEmpty) {
    console.log('   ✅ Variants object is empty (as expected)');
    console.log('   ✅ Tool should skip variant section or show "No variant styling data available"');
    return true;
  } else {
    console.log('   ❌ Variants object is not empty:', Object.keys(variants).join(', '));
    return false;
  }
}

/**
 * Test 5: Verify no empty state sections should be shown
 * Components with only default should not have empty hover/active/focus/disabled sections
 */
function testNoEmptyStateSections() {
  console.log('\n🧪 Test 5: No Empty State Sections');
  const component = loadComponent('alert');
  if (!component) {
    console.log('   ❌ Alert component not found');
    return false;
  }

  const variants = component.visualSpecifications?.colors?.variants || {};
  const infoVariant = variants.info;
  
  if (!infoVariant) {
    console.log('   ❌ Info variant not found');
    return false;
  }

  const states = getVariantStates(infoVariant);
  const hasOnlyDefault = states.length === 1 && states.includes('default');
  const hasEmptyStates = states.some(state => 
    ['hover', 'active', 'focus', 'disabled'].includes(state) && 
    !infoVariant.cp?.light?.[state]
  );

  if (hasOnlyDefault && !hasEmptyStates) {
    console.log('   ✅ Info variant has only default, no empty state sections');
    console.log('   ✅ Tool should NOT show hover/active/focus/disabled sections for this variant');
    return true;
  } else {
    console.log('   ❌ Test failed');
    return false;
  }
}

/**
 * Test 6: Child element states extraction
 * Verify that child element states are correctly identified
 */
function testChildElementStatesExtraction() {
  console.log('\n🧪 Test 6: Child Element States Extraction');
  const component = loadComponent('leftsidebar');
  if (!component) {
    console.log('   ❌ LeftSidebar component not found');
    return false;
  }

  const cssClassStyles = component.cssClassStyles || {};
  const childElementStates = extractChildElementStates(cssClassStyles);

  // Check for expected child element states
  const hasItemActive = childElementStates.some(s => 
    s.selector.includes('__item--active') || s.selector.includes('__item:active')
  );
  const hasItemHover = childElementStates.some(s => 
    s.selector.includes('__item:hover')
  );

  if (childElementStates.length > 0) {
    console.log('   ✅ Child element states found:', childElementStates.length);
    if (hasItemActive) {
      console.log('   ✅ Active state for items found');
    }
    if (hasItemHover) {
      console.log('   ✅ Hover state for items found');
    }
    return true;
  } else {
    console.log('   ❌ No child element states found');
    return false;
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🧪 Running Variant Display Test Cases\n');
  console.log('=' .repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const tests = [
    { name: 'Button (Full Data)', fn: testButtonFullData },
    { name: 'Alert (Mixed Completeness)', fn: testAlertMixedCompleteness },
    { name: 'LeftSidebar (Default-Only with Child States)', fn: testLeftSidebarDefaultOnlyWithChildStates },
    { name: 'Spinner (Empty Variants)', fn: testSpinnerEmptyVariants },
    { name: 'No Empty State Sections', fn: testNoEmptyStateSections },
    { name: 'Child Element States Extraction', fn: testChildElementStatesExtraction }
  ];

  for (const test of tests) {
    try {
      const passed = test.fn();
      if (passed) {
        results.passed++;
        results.tests.push({ name: test.name, status: 'passed' });
      } else {
        results.failed++;
        results.tests.push({ name: test.name, status: 'failed' });
      }
    } catch (error) {
      console.log(`   ❌ Error in ${test.name}:`, error.message);
      results.failed++;
      results.tests.push({ name: test.name, status: 'error', error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total:  ${results.passed + results.failed}`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests, testButtonFullData, testAlertMixedCompleteness, testLeftSidebarDefaultOnlyWithChildStates, testSpinnerEmptyVariants };
