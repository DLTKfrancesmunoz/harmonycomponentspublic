#!/usr/bin/env node

/**
 * check-harmony-updates.js
 *
 * Checks if Harmony components package has been updated and which
 * overrides may need to be reviewed/synced.
 *
 * Usage:
 *   npm run harmony:check-updates
 *
 * What it does:
 * 1. Compares installed Harmony version with tracked version
 * 2. Lists all current overrides
 * 3. Shows which overrides haven't been synced recently
 * 4. Provides recommendations for next steps
 *
 * Use Cases:
 * - After running npm update/install
 * - Before creating a release
 * - Periodic maintenance check (monthly)
 * - In CI/CD pipeline (optional - can be noisy)
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
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

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Paths
const projectRoot = path.resolve(__dirname, '..');
const harmonyPackage = path.join(projectRoot, 'node_modules', '@deltek', 'harmony-components');
const trackingFile = path.join(projectRoot, 'src', 'components', 'harmony', '.harmony-sync.json');

log('\n🔍 Checking Harmony Component Updates...\n', 'cyan');

// Check if Harmony package is installed
if (!fs.existsSync(harmonyPackage)) {
  error('Harmony components package not found');
  console.log('\nRun: npm install');
  process.exit(1);
}

// Get installed Harmony version
const harmonyPackageJson = JSON.parse(
  fs.readFileSync(path.join(harmonyPackage, 'package.json'), 'utf-8')
);
const installedVersion = harmonyPackageJson.version;

console.log('📦 Installed Harmony Version:', colors.bright + installedVersion + colors.reset);

// Check if tracking file exists
if (!fs.existsSync(trackingFile)) {
  warning('No tracking file found (.harmony-sync.json)');
  console.log('\nThis means either:');
  console.log('  1. No components have been forked yet (good!)');
  console.log('  2. Tracking file was accidentally deleted (bad!)');
  console.log('\nIf you have overrides in src/components/harmony/, create tracking file:');
  console.log('  npm run harmony:copy ComponentName');
  console.log('\nOr manually create .harmony-sync.json');
  process.exit(0);
}

// Read tracking data
const trackingData = JSON.parse(fs.readFileSync(trackingFile, 'utf-8'));
const trackedVersion = trackingData.harmonyVersion;
const lastChecked = trackingData.lastChecked;

console.log('📊 Tracked Harmony Version:', colors.bright + trackedVersion + colors.reset);
console.log('🗓️  Last Checked:', lastChecked);
console.log('');

// Compare versions
const isOutdated = installedVersion !== trackedVersion;

if (isOutdated) {
  warning(`Harmony package has been updated: ${trackedVersion} → ${installedVersion}`);
  console.log('\n⚠️  Your overrides may be out of sync with the base components!');
} else {
  success('Harmony version matches tracked version');
}

// Show override summary
const overrides = trackingData.overrides || [];

if (overrides.length === 0) {
  success('No component overrides found - nothing to check!');
  process.exit(0);
}

log('\n' + '='.repeat(60), 'cyan');
log(`📋 Component Overrides (${overrides.length} total)`, 'cyan');
log('='.repeat(60) + '\n', 'cyan');

// Table header
console.log(
  colors.bright +
  'Component'.padEnd(30) +
  'Base Ver'.padEnd(12) +
  'Last Synced'.padEnd(15) +
  'Status' +
  colors.reset
);
console.log('-'.repeat(75));

overrides.forEach(override => {
  const name = override.component.padEnd(30);
  const version = override.baseVersion.padEnd(12);
  const synced = override.lastSynced.padEnd(15);

  let status = '';
  let statusColor = 'green';

  if (override.baseVersion !== installedVersion) {
    status = '⚠️  Needs Review';
    statusColor = 'yellow';
  } else {
    status = '✅ Up to date';
    statusColor = 'green';
  }

  console.log(
    name +
    version +
    synced +
    colors[statusColor] + status + colors.reset
  );
});

console.log('');

// Show overrides that need attention
const needsReview = overrides.filter(o => o.baseVersion !== installedVersion);

if (needsReview.length > 0 && isOutdated) {
  log('='.repeat(60), 'yellow');
  warning(`${needsReview.length} override(s) need review`);
  log('='.repeat(60) + '\n', 'yellow');

  needsReview.forEach(override => {
    warning(`${override.component}`);
    console.log(`  Base version: ${override.baseVersion} → ${installedVersion}`);
    console.log(`  Last synced: ${override.lastSynced}`);

    if (override.customizations && override.customizations.length > 0) {
      console.log('  Customizations:');
      override.customizations.forEach(c => {
        console.log(`    - ${c}`);
      });
    }

    console.log('  Check diff:');
    log(`    npm run harmony:diff ${override.component.replace('.astro', '')}`, 'blue');
    console.log('');
  });
}

// Recommendations
log('='.repeat(60), 'cyan');
log('📚 Next Steps', 'cyan');
log('='.repeat(60) + '\n', 'cyan');

if (!isOutdated && needsReview.length === 0) {
  success('All overrides are up to date!');
  console.log('\nNo action needed. Great job maintaining your overrides! 🎉\n');
  process.exit(0);
}

if (isOutdated) {
  console.log('1. Review Harmony Changelog:');
  console.log('   - Check what changed in the new version');
  console.log('   - Look for breaking changes, bug fixes, new features');
  console.log('   - Changelog: node_modules/@deltek/harmony-components/CHANGELOG.md\n');
}

if (needsReview.length > 0) {
  console.log('2. Check diffs for each override:');
  needsReview.forEach(override => {
    const componentName = override.component.replace('.astro', '');
    log(`   npm run harmony:diff ${componentName}`, 'blue');
  });
  console.log('');

  console.log('3. Decide: Merge or Keep');
  console.log('   - Bug fixes: Merge immediately');
  console.log('   - New features: Evaluate if you need them');
  console.log('   - Breaking changes: Test thoroughly\n');

  console.log('4. Update overrides if needed:');
  console.log('   - Re-copy base component');
  console.log('   - Re-apply your customizations');
  console.log('   - Update metadata header');
  console.log('   - Test in dev and production\n');

  console.log('5. Update tracking file:');
  console.log('   - Update baseVersion and lastSynced');
  console.log('   - Add review notes\n');
}

console.log('📖 Documentation:');
console.log('   - src/components/harmony/README.md');
console.log('   - docs/customization/CONSUMER_GUIDE.md');
console.log('');

// Exit with warning code if updates needed (useful for CI)
if (needsReview.length > 0 && isOutdated) {
  log('⚠️  Overrides need review - consider running this in CI as optional', 'yellow');
  process.exit(0); // Don't fail CI, just warn
} else {
  process.exit(0);
}
