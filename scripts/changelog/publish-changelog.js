#!/usr/bin/env node
/**
 * Publish changelog entries to changelog.json
 * Handles duplicate prevention and file writing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDuplicate } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const changelogFile = path.join(__dirname, '../../changelog-data/changelog.json');
const metadataFile = path.join(__dirname, '../../changelog-data/metadata.json');

/**
 * Load existing changelog
 */
function loadChangelog() {
  if (!fs.existsSync(changelogFile)) {
    return { entries: [] };
  }

  try {
    const content = fs.readFileSync(changelogFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load changelog, starting fresh:', error.message);
    return { entries: [] };
  }
}

/**
 * Save changelog to file
 */
function saveChangelog(changelog) {
  fs.writeFileSync(changelogFile, JSON.stringify(changelog, null, 2));
}

/**
 * Update metadata
 */
function updateMetadata(addedCount) {
  let metadata = {
    currentVersion: '1.0.0',
    lastProcessedCommit: null,
    lastUpdated: null
  };

  if (fs.existsSync(metadataFile)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    } catch (error) {
      console.warn('Failed to load metadata:', error.message);
    }
  }

  metadata.lastUpdated = new Date().toISOString();
  metadata.totalEntries = (metadata.totalEntries || 0) + addedCount;

  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

/**
 * Publish changelog entries
 */
export function publishEntries(newEntries) {
  if (!newEntries || newEntries.length === 0) {
    console.log('⚠️  No new changelog entries to add.');
    return 0;
  }

  console.log('\n💾 Publishing changelog...');

  // Load existing changelog
  const changelog = loadChangelog();

  // Filter out duplicates
  const uniqueEntries = newEntries.filter(
    entry => !isDuplicate(entry.id, changelog.entries)
  );

  if (uniqueEntries.length === 0) {
    console.log('⚠️  All entries already exist. No duplicates added.');
    return 0;
  }

  // Add new entries to the beginning (most recent first)
  changelog.entries = [...uniqueEntries, ...changelog.entries];

  // Save changelog
  saveChangelog(changelog);

  // Update metadata
  updateMetadata(uniqueEntries.length);

  console.log(`✅ Added ${uniqueEntries.length} new changelog entries`);

  if (uniqueEntries.length !== newEntries.length) {
    const skipped = newEntries.length - uniqueEntries.length;
    console.log(`   (Skipped ${skipped} duplicate${skipped > 1 ? 's' : ''})`);
  }

  return uniqueEntries.length;
}
