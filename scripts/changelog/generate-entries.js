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

  const commitMeta = await getLastCommitMetadata();
  
  // Parse commit date and convert to timestamp for ID generation and ISO string for entry date
  // commit.date from git can be a Date object or a string in various formats
  const commitDate = commitMeta.date instanceof Date 
    ? commitMeta.date 
    : new Date(commitMeta.date);
  const commitTimestamp = commitDate.getTime();
  const commitDateISO = commitDate.toISOString();

  const entries = changes.map(change => {
    const id = generateEntryId(change, commitTimestamp);
    const description = generateDescription(change);
    const title = generateTitle(change);

    const entry = {
      id,
      version: 'recent', // Recent changes on main branch
      date: commitDateISO,
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

    // Add property details for component prop / variant changes
    if (change.propName) {
      const propEntry = {
        name: change.propName,
        change: change.change,
        before: change.before,
        after: change.after
      };
      if (change.variantName != null) {
        propEntry.variantName = change.variantName;
      }
      entry.properties = [propEntry];
    }

    // Add path details for token changes
    if (change.path) {
      entry.tokenPath = change.path;
    }

    // Add file path for file_modified changes
    if (change.filePath) {
      entry.filePath = change.filePath;
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
