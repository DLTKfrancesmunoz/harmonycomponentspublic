#!/usr/bin/env node

/**
 * diff-harmony-component.js
 *
 * Shows the difference between a base Harmony component and your override.
 * Helps identify what changed in the base component since you forked it.
 *
 * Usage:
 *   npm run harmony:diff Button
 *   npm run harmony:diff ShellLayout
 *
 * What it does:
 * 1. Finds the base component in node_modules
 * 2. Finds your override in src/components/harmony/
 * 3. Shows a diff (uses git diff if available, or simple comparison)
 * 4. Highlights your customizations vs base changes
 *
 * Use Cases:
 * - Before merging Harmony updates
 * - Understanding what you customized
 * - Reviewing what changed in base since fork
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Get component name from command line
const componentName = process.argv[2];

if (!componentName) {
  error('Please provide a component name');
  console.log('\nUsage:');
  console.log('  npm run harmony:diff Button');
  console.log('  npm run harmony:diff ShellLayout');
  process.exit(1);
}

// Ensure component name ends with .astro
const componentFile = componentName.endsWith('.astro') ? componentName : `${componentName}.astro`;

// Paths
const projectRoot = path.resolve(__dirname, '..');
const harmonyPackage = path.join(projectRoot, 'node_modules', '@deltek', 'harmony-components');
const overridePath = path.join(projectRoot, 'src', 'components', 'harmony', componentFile);

log(`\n🔍 Comparing ${componentFile}...\n`, 'cyan');

// Check if override exists
if (!fs.existsSync(overridePath)) {
  error(`Override not found: ${overridePath}`);
  console.log('\nNo override exists for this component.');
  console.log('To create an override:');
  log(`  npm run harmony:copy ${componentName}`, 'cyan');
  process.exit(1);
}

// Find base component
const possibleBasePaths = [
  path.join(harmonyPackage, 'src', 'components', 'ui', componentFile),
  path.join(harmonyPackage, 'src', 'layouts', componentFile)
];

let basePath = null;
for (const possiblePath of possibleBasePaths) {
  if (fs.existsSync(possiblePath)) {
    basePath = possiblePath;
    break;
  }
}

if (!basePath) {
  error(`Base component not found in Harmony package`);
  console.log('\nSearched in:');
  possibleBasePaths.forEach(p => console.log(`  - ${p}`));
  console.log('\nMake sure @deltek/harmony-components is installed.');
  process.exit(1);
}

success(`Found base: ${path.relative(projectRoot, basePath)}`);
success(`Found override: ${path.relative(projectRoot, overridePath)}`);
console.log('');

// Check if files are identical
const baseContent = fs.readFileSync(basePath, 'utf-8');
const overrideContent = fs.readFileSync(overridePath, 'utf-8');

// Remove metadata header from override for fair comparison
const overrideWithoutMetadata = overrideContent.replace(
  /\/\*\*\s*\n\s*\*\s*STARTPOINT OVERRIDE[\s\S]*?\*\/\s*\n/,
  ''
);

if (baseContent === overrideWithoutMetadata) {
  success('No differences found!');
  console.log('\nYour override is identical to the base component (excluding metadata header).');
  console.log('Consider:');
  console.log('  - Is this override still needed?');
  console.log('  - Can you delete it and import directly from Harmony?');
  process.exit(0);
}

// Try to use git diff if available
log('='.repeat(60), 'cyan');
log('Showing Differences', 'cyan');
log('='.repeat(60) + '\n', 'cyan');

try {
  // Check if git is available
  execSync('git --version', { stdio: 'ignore' });

  // Create temp files for git diff
  const tempBase = path.join(projectRoot, '.tmp-base-component.astro');
  const tempOverride = path.join(projectRoot, '.tmp-override-component.astro');

  fs.writeFileSync(tempBase, baseContent);
  fs.writeFileSync(tempOverride, overrideContent);

  try {
    // Run git diff with color
    const diff = execSync(
      `git diff --no-index --color=always "${tempBase}" "${tempOverride}"`,
      { encoding: 'utf-8' }
    );

    console.log(diff);
  } catch (err) {
    // git diff returns non-zero when there are differences, which is expected
    if (err.stdout) {
      console.log(err.stdout);
    } else {
      throw err;
    }
  } finally {
    // Clean up temp files
    if (fs.existsSync(tempBase)) fs.unlinkSync(tempBase);
    if (fs.existsSync(tempOverride)) fs.unlinkSync(tempOverride);
  }
} catch (err) {
  // Git not available, fall back to simple comparison
  warning('Git not available, showing simple comparison');
  console.log('');

  console.log(colors.bright + 'Base Component (Harmony):' + colors.reset);
  console.log(colors.dim + basePath + colors.reset);
  console.log('');

  console.log(colors.bright + 'Your Override:' + colors.reset);
  console.log(colors.dim + overridePath + colors.reset);
  console.log('');

  // Show line count difference
  const baseLines = baseContent.split('\n').length;
  const overrideLines = overrideContent.split('\n').length;
  const lineDiff = overrideLines - baseLines;

  if (lineDiff > 0) {
    log(`Override has ${lineDiff} more lines than base`, 'yellow');
  } else if (lineDiff < 0) {
    log(`Override has ${Math.abs(lineDiff)} fewer lines than base`, 'yellow');
  } else {
    log('Both files have the same number of lines', 'cyan');
  }

  console.log('\nFor detailed diff, install git or use a diff tool:');
  log(`  diff "${basePath}" "${overridePath}"`, 'cyan');
}

// Show tracking info if available
const trackingFile = path.join(projectRoot, 'src', 'components', 'harmony', '.harmony-sync.json');
if (fs.existsSync(trackingFile)) {
  const trackingData = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
  const override = trackingData.overrides?.find(o => o.component === componentFile);

  if (override) {
    log('\n' + '='.repeat(60), 'cyan');
    log('Override Information', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');

    console.log('Base Version:', override.baseVersion);
    console.log('Forked Date:', override.forkedDate);
    console.log('Last Synced:', override.lastSynced);

    if (override.customizations && override.customizations.length > 0) {
      console.log('\nDocumented Customizations:');
      override.customizations.forEach(c => {
        console.log(`  - ${c}`);
      });
    }

    if (override.dependencies && override.dependencies.length > 0) {
      console.log('\nDependencies:');
      override.dependencies.forEach(d => {
        console.log(`  - ${d}`);
      });
    }

    if (override.dependents && override.dependents.length > 0) {
      console.log('\nDependents (components that import this):');
      override.dependents.forEach(d => {
        console.log(`  - ${d}`);
      });
    }
  }
}

// Next steps
log('\n' + '='.repeat(60), 'cyan');
log('Next Steps', 'cyan');
log('='.repeat(60) + '\n', 'cyan');

console.log('Review the differences above and decide:');
console.log('');
console.log('✅ Keep your override if:');
console.log('   - Your customizations are still needed');
console.log('   - Base changes don\'t affect your use case');
console.log('   - Override is working correctly');
console.log('');
console.log('🔄 Merge base changes if:');
console.log('   - Base has important bug fixes');
console.log('   - New features you want to use');
console.log('   - Breaking changes you need to adapt to');
console.log('');
console.log('❌ Delete your override if:');
console.log('   - Base component now has features you added');
console.log('   - Your customizations are no longer needed');
console.log('   - You can achieve the same with wrapper (Tier 2)');
console.log('');
console.log('📚 Documentation:');
console.log('   - src/components/harmony/README.md');
console.log('   - docs/customization/CONSUMER_GUIDE.md');
console.log('');
