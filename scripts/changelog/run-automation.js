#!/usr/bin/env node
/**
 * Main orchestrator for changelog automation
 * Runs the complete pipeline: snapshot → detect → generate → publish
 */

import { generateSnapshot } from './generate-snapshot.js';
import { detectChanges } from './detect-changes.js';
import { generateChangelogEntries } from './generate-entries.js';
import { publishEntries } from './publish-changelog.js';
import { getPreviousSnapshot, saveSnapshot } from './utils.js';

async function main() {
  console.log('🔍 Running changelog automation...\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Generate current snapshot
    console.log('\n📸 Step 1: Generating snapshot of current state...');
    const currentSnapshot = await generateSnapshot();

    // Step 2: Get previous snapshot
    console.log('\n🔙 Step 2: Fetching previous snapshot...');
    const previousSnapshot = await getPreviousSnapshot();

    if (!previousSnapshot) {
      console.log('⚠️  No previous snapshot found.');
      console.log('   Creating initial snapshot for future comparisons...');
      saveSnapshot(currentSnapshot);
      console.log('\n✅ Initial snapshot created successfully!');
      console.log('   Run this script again after making changes to see them in the changelog.\n');
      return;
    }

    // Step 3: Detect changes
    console.log('\n🔎 Step 3: Detecting changes...');
    const changes = detectChanges(currentSnapshot, previousSnapshot);

    if (changes.length === 0) {
      console.log('\n✅ No changes detected. Changelog is up to date.');
      console.log('   Make some component or token changes to see them tracked!\n');
      return;
    }

    // Step 4: Generate changelog entries
    console.log('\n📝 Step 4: Generating changelog entries...');
    const entries = await generateChangelogEntries(changes);

    // Step 5: Publish entries
    console.log('\n💾 Step 5: Publishing to changelog...');
    const addedCount = publishEntries(entries);

    // Step 6: Save current snapshot for next run
    console.log('\n📸 Step 6: Saving snapshot for next comparison...');
    saveSnapshot(currentSnapshot);

    // Summary
    console.log('\n' + '='.repeat(50));
    if (addedCount > 0) {
      console.log(`\n✅ Changelog automation complete!`);
      console.log(`   Added ${addedCount} new entries to the changelog.`);
      console.log(`\n   View the changelog at: http://localhost:4321/changelog`);
    } else {
      console.log('\n✅ Changelog automation complete!');
      console.log('   No new entries added (all were duplicates).');
    }
    console.log('');

  } catch (error) {
    console.error('\n❌ Changelog automation failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
