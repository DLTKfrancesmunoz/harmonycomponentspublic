/**
 * Generate Manifest
 * Builds dependency graph and manifest from component JSON files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Paths
const COMPONENTS_DIR = path.join(rootDir, 'mcp-data/components');
const LAYOUTS_DIR = path.join(rootDir, 'mcp-data/layouts');
const GUIDELINES_DIR = path.join(rootDir, 'mcp-data/guidelines');
const OUTPUT_FILE = path.join(rootDir, 'mcp-data/manifest.json');

// Component categories
const CATEGORIES = {
  form: [
    'Button',
    'Input',
    'Checkbox',
    'RadioButton',
    'RadioGroup',
    'CheckboxGroup',
    'Toggle',
    'Dropdown',
    'DatePicker',
    'TimePicker',
    'NumberInput',
    'RangeInput',
    'Textarea',
    'DateInput',
    'MonthPicker',
    'WeekPicker',
    'DateTimePicker',
  ],
  display: [
    'Card',
    'Accordion',
    'Table',
    'Badge',
    'Chip',
    'NotificationBadge',
    'Avatar',
    'ProgressBar',
    'Icon',
    'Label',
    'Link',
    'Tooltip',
    'Kanban',
    'KanbanCard',
  ],
  navigation: [
    'TabStrip',
    'FloatingNav',
    'LeftSidebar',
    'RightSidebar',
    'CPLeftSidebar',
    'CPRightSidebar',
    'ListMenu',
    'ShellHeader',
    'ShellPageHeader',
    'ShellFooter',
    'ShellPanel',
  ],
  feedback: ['Alert', 'Dialog', 'Spinner'],
  pickers: ['PickerPopup'],
  layout: ['Stepper', 'Step', 'ButtonGroup'],
};

/**
 * Read all component JSON files
 */
function readComponentFiles() {
  const components = {};

  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`❌ Components directory not found: ${COMPONENTS_DIR}`);
    return components;
  }

  const files = fs.readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(COMPONENTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      components[data.name] = data;
    } catch (error) {
      console.error(`⚠️  Error reading ${file}:`, error.message);
    }
  }

  return components;
}

/**
 * Read all layout JSON files
 */
function readLayoutFiles() {
  const layouts = {};

  if (!fs.existsSync(LAYOUTS_DIR)) {
    console.warn(`⚠️  Layouts directory not found: ${LAYOUTS_DIR}`);
    return layouts;
  }

  const files = fs.readdirSync(LAYOUTS_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(LAYOUTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      layouts[data.name] = data;
    } catch (error) {
      console.error(`⚠️  Error reading ${file}:`, error.message);
    }
  }

  return layouts;
}

/**
 * Read all guideline JSON files
 */
function readGuidelineFiles() {
  const guidelines = {};

  if (!fs.existsSync(GUIDELINES_DIR)) {
    console.warn(`⚠️  Guidelines directory not found: ${GUIDELINES_DIR}`);
    return guidelines;
  }

  const files = fs.readdirSync(GUIDELINES_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    try {
      const filePath = path.join(GUIDELINES_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const id = data.id || file.replace('.json', '');
      guidelines[id] = {
        id,
        name: data.name || id,
        type: 'guideline',
        filePath: `mcp-data/guidelines/${file}`,
        description: data.description,
        ruleCount: countRules(data),
      };
    } catch (error) {
      console.error(`⚠️  Error reading ${file}:`, error.message);
    }
  }

  return guidelines;
}

/**
 * Count total rules in a guideline file
 */
function countRules(guidelineData) {
  let count = 0;
  const traverse = (obj) => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (item && item.id && item.rule) count++;
        traverse(item);
      });
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(traverse);
    }
  };
  traverse(guidelineData);
  return count;
}

/**
 * Build dependency graph
 */
function buildDependencyGraph(components) {
  const dependencyGraph = {};

  for (const [name, data] of Object.entries(components)) {
    dependencyGraph[name] = data.dependencies || [];
  }

  return dependencyGraph;
}

/**
 * Build reverse dependency graph (who uses this component)
 */
function buildReverseDependencies(dependencyGraph) {
  const reverseDeps = {};

  // Initialize all components with empty arrays
  for (const component of Object.keys(dependencyGraph)) {
    reverseDeps[component] = [];
  }

  // Build reverse dependencies
  for (const [component, deps] of Object.entries(dependencyGraph)) {
    for (const dep of deps) {
      if (!reverseDeps[dep]) {
        reverseDeps[dep] = [];
      }
      reverseDeps[dep].push(component);
    }
  }

  // Sort each array for consistency
  for (const component of Object.keys(reverseDeps)) {
    reverseDeps[component].sort();
  }

  return reverseDeps;
}

/**
 * Categorize components
 */
function categorizeComponents(components) {
  const categorized = {};

  // Initialize categories
  for (const category of Object.keys(CATEGORIES)) {
    categorized[category] = [];
  }

  // Categorize each component
  for (const name of Object.keys(components)) {
    let categorized_flag = false;

    for (const [category, componentList] of Object.entries(CATEGORIES)) {
      if (componentList.includes(name)) {
        categorized[category].push(name);
        categorized_flag = true;
        break;
      }
    }

    // If not in predefined categories, add to "other"
    if (!categorized_flag) {
      if (!categorized.other) {
        categorized.other = [];
      }
      categorized.other.push(name);
    }
  }

  // Sort each category
  for (const category of Object.keys(categorized)) {
    categorized[category].sort();
  }

  return categorized;
}

/**
 * Get component category
 */
function getComponentCategory(componentName) {
  for (const [category, componentList] of Object.entries(CATEGORIES)) {
    if (componentList.includes(componentName)) {
      return category;
    }
  }
  return 'other';
}

/**
 * Build component index
 */
function buildComponentIndex(components, dependencyGraph) {
  const index = {};

  for (const [name, data] of Object.entries(components)) {
    index[name] = {
      name,
      category: getComponentCategory(name),
      dependencies: dependencyGraph[name] || [],
      dependencyCount: (dependencyGraph[name] || []).length,
    };
  }

  return index;
}

/**
 * Calculate statistics
 */
function calculateStats(components, dependencyGraph, reverseDeps) {
  const totalComponents = Object.keys(components).length;

  // Find most used component
  let mostUsedComponent = null;
  let maxUsage = 0;

  for (const [component, users] of Object.entries(reverseDeps)) {
    if (users.length > maxUsage) {
      maxUsage = users.length;
      mostUsedComponent = component;
    }
  }

  // Calculate average dependencies
  const totalDeps = Object.values(dependencyGraph).reduce(
    (sum, deps) => sum + deps.length,
    0
  );
  const averageDependencies =
    totalComponents > 0 ? (totalDeps / totalComponents).toFixed(2) : 0;

  // Components with no dependencies
  const componentsWithNoDeps = Object.values(dependencyGraph).filter(
    (deps) => deps.length === 0
  ).length;

  // Components not used by others
  const componentsNotUsed = Object.values(reverseDeps).filter(
    (users) => users.length === 0
  ).length;

  return {
    totalComponents,
    mostUsedComponent,
    mostUsedCount: maxUsage,
    averageDependencies: parseFloat(averageDependencies),
    componentsWithNoDependencies: componentsWithNoDeps,
    componentsNotUsedByOthers: componentsNotUsed,
  };
}

/**
 * Build layout index
 */
function buildLayoutIndex(layouts) {
  const index = {};

  for (const [name, data] of Object.entries(layouts)) {
    index[name] = {
      name,
      type: data.type || 'layout',
      filePath: data.filePath,
      description: data.description,
      themes: data.themeSupport?.themes || [],
      dependencies: data.dependencies || [],
      dependencyCount: (data.dependencies || []).length,
    };
  }

  return index;
}

/**
 * Generate manifest
 */
function generateManifest() {
  console.log('📋 Generating manifest...\n');

  // Read all component files
  const components = readComponentFiles();
  console.log(`  Found ${Object.keys(components).length} component files`);

  if (Object.keys(components).length === 0) {
    console.error('❌ No component files found. Run generate-mcp-data.js first.');
    process.exit(1);
  }

  // Read all layout files
  const layouts = readLayoutFiles();
  console.log(`  Found ${Object.keys(layouts).length} layout files`);

  // Read all guideline files
  const guidelines = readGuidelineFiles();
  console.log(`  Found ${Object.keys(guidelines).length} guideline files`);

  // Build dependency graph
  const dependencyGraph = buildDependencyGraph(components);
  console.log('  ✅ Built dependency graph');

  // Build reverse dependencies
  const reverseDeps = buildReverseDependencies(dependencyGraph);
  console.log('  ✅ Built reverse dependencies');

  // Categorize components
  const categories = categorizeComponents(components);
  console.log('  ✅ Categorized components');

  // Build component index
  const componentIndex = buildComponentIndex(components, dependencyGraph);
  console.log('  ✅ Built component index');

  // Build layout index
  const layoutIndex = buildLayoutIndex(layouts);
  console.log('  ✅ Built layout index');

  // Guidelines are already indexed
  console.log('  ✅ Indexed guidelines');

  // Calculate stats
  const stats = calculateStats(components, dependencyGraph, reverseDeps);
  console.log('  ✅ Calculated statistics');

  // Build manifest
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalComponents: stats.totalComponents,
    totalLayouts: Object.keys(layouts).length,
    totalGuidelines: Object.keys(guidelines).length,

    components: componentIndex,
    layouts: layoutIndex,
    guidelines: guidelines,
    dependencyGraph,
    reverseDependencies: reverseDeps,
    categories,
    stats,
  };

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\n✅ Manifest generated: ${OUTPUT_FILE}`);
  console.log('\n📊 Statistics:');
  console.log(`   Total components: ${stats.totalComponents}`);
  console.log(`   Total layouts: ${Object.keys(layouts).length}`);
  console.log(`   Total guidelines: ${Object.keys(guidelines).length}`);
  console.log(`   Most used: ${stats.mostUsedComponent} (${stats.mostUsedCount} times)`);
  console.log(`   Average dependencies: ${stats.averageDependencies}`);
  console.log(`   Components with no deps: ${stats.componentsWithNoDependencies}`);
  console.log(`   Components not used by others: ${stats.componentsNotUsedByOthers}`);

  return manifest;
}

// Run generation
try {
  const result = generateManifest();
  console.log('\n✨ Manifest generation complete!\n');
} catch (error) {
  console.error('\n❌ Manifest generation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
