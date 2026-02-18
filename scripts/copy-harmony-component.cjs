#!/usr/bin/env node

/**
 * copy-harmony-component.js
 *
 * Helper script to copy a Harmony component to src/components/harmony/
 * with proper metadata headers and tracking file updates.
 *
 * Usage:
 *   npm run harmony:copy Button
 *   npm run harmony:copy ShellLayout
 *
 * What it does:
 * 1. Finds the component in node_modules (handles both ui/ and layouts/)
 * 2. Copies it to src/components/harmony/
 * 3. Adds metadata header (version, date, customizations template)
 * 4. Updates .harmony-sync.json tracking file
 * 5. Shows next steps for using the override
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Get component name from command line
const componentName = process.argv[2];

if (!componentName) {
  error('Please provide a component name');
  console.log('\nUsage:');
  console.log('  npm run harmony:copy Button');
  console.log('  npm run harmony:copy ShellLayout');
  process.exit(1);
}

// Ensure component name ends with .astro
const componentFile = componentName.endsWith('.astro') ? componentName : `${componentName}.astro`;

// Paths
const projectRoot = path.resolve(__dirname, '..');
const harmonyPackage = path.join(projectRoot, 'node_modules', '@deltek', 'harmony-components');
const harmonyOverridesDir = path.join(projectRoot, 'src', 'components', 'harmony');
const trackingFile = path.join(harmonyOverridesDir, '.harmony-sync.json');

// Possible source locations
const possiblePaths = [
  path.join(harmonyPackage, 'src', 'components', 'ui', componentFile),
  path.join(harmonyPackage, 'src', 'layouts', componentFile)
];

log(`\n🔍 Looking for ${componentFile} in Harmony package...`, 'cyan');

// Find the component
let sourcePath = null;
let componentType = null;

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    sourcePath = possiblePath;
    componentType = possiblePath.includes('/layouts/') ? 'layouts' : 'ui';
    break;
  }
}

if (!sourcePath) {
  error(`Component "${componentFile}" not found in Harmony package`);
  console.log('\nSearched in:');
  possiblePaths.forEach(p => console.log(`  - ${p}`));
  console.log('\nMake sure:');
  console.log('  1. The component name is correct');
  console.log('  2. @deltek/harmony-components is installed (npm install)');
  process.exit(1);
}

success(`Found ${componentFile} in ${componentType}/`);

// Check if override already exists
const destPath = path.join(harmonyOverridesDir, componentFile);
if (fs.existsSync(destPath)) {
  warning(`Override already exists at ${destPath}`);
  console.log('\nThis will overwrite the existing override. Continue? (y/N)');

  // In a real implementation, you'd want to prompt for user input
  // For now, we'll just warn and exit
  error('Aborting to avoid overwriting existing override');
  console.log('If you want to re-copy, delete the existing file first.');
  process.exit(1);
}

// Read source file
log('\n📄 Reading source file...', 'cyan');
const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

// Get Harmony version from package.json
const harmonyPackageJson = JSON.parse(
  fs.readFileSync(path.join(harmonyPackage, 'package.json'), 'utf-8')
);
const harmonyVersion = harmonyPackageJson.version;

// Current date
const today = new Date().toISOString().split('T')[0];

// Create metadata header
const metadataHeader = `---
/**
 * STARTPOINT OVERRIDE
 *
 * Base Component: @deltek/harmony-components/src/${componentType}/${componentFile}
 * Base Version: ${harmonyVersion}
 * Forked Date: ${today}
 * Last Synced: ${today}
 *
 * CUSTOMIZATIONS:
 * - [TODO: Document what you changed and why]
 *
 * IMPORT NOTES:
 * - If importing other Harmony components, use node_modules paths if package subpaths fail
 * - Example: import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';
 *
 * DEPENDENCIES (from Harmony):
 * - [TODO: List Harmony components this imports]
 *
 * DEPENDENTS:
 * - [TODO: List components that import this override]
 */
`;

// Add metadata header to content
let modifiedContent = sourceContent;

// If file starts with ---, replace the frontmatter fence with our header
if (sourceContent.trim().startsWith('---')) {
  // Add header right after the opening ---
  modifiedContent = sourceContent.replace(/^---\n/, metadataHeader);
} else {
  // If no frontmatter, add it at the beginning
  modifiedContent = metadataHeader + '\n' + sourceContent;
}

// Ensure harmony overrides directory exists
if (!fs.existsSync(harmonyOverridesDir)) {
  fs.mkdirSync(harmonyOverridesDir, { recursive: true });
}

// Write the modified file
log('\n📝 Writing override file...', 'cyan');
fs.writeFileSync(destPath, modifiedContent, 'utf-8');
success(`Created ${componentFile} in src/components/harmony/`);

// Update tracking file
log('\n📊 Updating tracking file...', 'cyan');

let trackingData = { lastChecked: today, harmonyVersion, overrides: [] };

if (fs.existsSync(trackingFile)) {
  trackingData = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
}

trackingData.harmonyVersion = harmonyVersion;
trackingData.lastChecked = today;

// Add or update override entry
const existingIndex = trackingData.overrides.findIndex(o => o.component === componentFile);
const newOverride = {
  component: componentFile,
  baseVersion: harmonyVersion,
  forkedDate: today,
  lastSynced: today,
  customizations: ['[TODO: Document your changes]'],
  dependents: [],
  dependencies: []
};

if (existingIndex >= 0) {
  trackingData.overrides[existingIndex] = newOverride;
} else {
  trackingData.overrides.push(newOverride);
}

fs.writeFileSync(trackingFile, JSON.stringify(trackingData, null, 2), 'utf-8');
success('Updated .harmony-sync.json');

// Success message and next steps
log('\n' + '='.repeat(60), 'green');
success(`Successfully forked ${componentFile}!`);
log('='.repeat(60) + '\n', 'green');

console.log('📋 NEXT STEPS:\n');

console.log('1. Edit the component:');
log(`   ${destPath}`, 'blue');

console.log('\n2. Update the metadata header:');
log('   - Document your customizations', 'yellow');
log('   - List dependencies and dependents', 'yellow');

console.log('\n3. Fix imports if needed:');
log('   - Use node_modules paths for Harmony components if package subpaths fail', 'yellow');
log('   - Import local overrides from ./ComponentName.astro', 'yellow');

console.log('\n4. Update imports in your pages:');
log('   // BEFORE:', 'red');
log(`   import ${componentName} from '@deltek/harmony-components/${componentType}/${componentFile}';`, 'red');
log('   // AFTER:', 'green');
log(`   import ${componentName} from '../components/harmony/${componentFile}';`, 'green');

console.log('\n5. Check for cascade effects:');
log('   - Does this component import other components?', 'yellow');
log('   - Do other components import this one?', 'yellow');
log('   - You may need to fork dependents too!', 'yellow');

console.log('\n6. Test:');
log('   npm run build', 'blue');
log('   - Ensure production build succeeds', 'yellow');
log('   - Test your customizations work', 'yellow');

console.log('\n📚 Documentation:');
console.log('   - src/components/harmony/README.md');
console.log('   - docs/customization/CONSUMER_GUIDE.md\n');
