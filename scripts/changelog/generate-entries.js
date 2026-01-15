#!/usr/bin/env node
/**
 * Generate changelog entries from detected changes
 * Converts raw change objects into structured changelog entries
 */

import { generateDescription, generateTitle } from './description-templates.js';
import { generateEntryId, getLastCommitMetadata } from './utils.js';

/**
 * Generate structured changelog entries from changes
 */
export async function generateChangelogEntries(changes) {
  if (changes.length === 0) {
    return [];
  }

  console.log('📝 Generating changelog entries...\n');

  const timestamp = Date.now();
  const commitMeta = await getLastCommitMetadata();

  const entries = changes.map(change => {
    const id = generateEntryId(change, timestamp);
    const description = generateDescription(change);
    const title = generateTitle(change);

    const entry = {
      id,
      version: 'unreleased', // Will be updated during release process
      date: new Date(timestamp).toISOString(),
      category: change.category,
      type: change.type,
      target: change.target,
      title,
      description,
      breaking: change.breaking || false,
      commit: {
        hash: commitMeta.hash,
        message: commitMeta.message,
        author: commitMeta.author,
        date: commitMeta.date
      }
    };

    // Add property details for component prop changes
    if (change.propName) {
      entry.properties = [{
        name: change.propName,
        change: change.change,
        before: change.before,
        after: change.after
      }];
    }

    // Add path details for token changes
    if (change.path) {
      entry.tokenPath = change.path;
    }

    return entry;
  });

  console.log(`✅ Generated ${entries.length} changelog entries`);

  // Show sample entries
  if (entries.length > 0) {
    console.log('\nSample entries:');
    entries.slice(0, 3).forEach(e => {
      const breaking = e.breaking ? ' [BREAKING]' : '';
      console.log(`  - ${e.category}: ${e.description}${breaking}`);
    });
    if (entries.length > 3) {
      console.log(`  ... and ${entries.length - 3} more`);
    }
  }

  return entries;
}
