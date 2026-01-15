#!/usr/bin/env node
/**
 * Utility functions for changelog automation
 * Handles git operations, ID generation, and other shared utilities
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import simpleGit from 'simple-git';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const git = simpleGit();

/**
 * Get current git commit hash
 */
export async function getCurrentCommitHash() {
  try {
    const log = await git.log({ maxCount: 1 });
    return log.latest?.hash || null;
  } catch (error) {
    console.warn('Unable to get current commit hash:', error.message);
    return null;
  }
}

/**
 * Get last commit metadata (hash, message, author, date)
 */
export async function getLastCommitMetadata() {
  try {
    const log = await git.log({ maxCount: 1 });
    const commit = log.latest;

    if (!commit) {
      return {
        hash: 'unknown',
        message: 'No commit message',
        author: 'Unknown',
        date: new Date().toISOString()
      };
    }

    return {
      hash: commit.hash.substring(0, 7),
      message: commit.message,
      author: commit.author_name,
      date: commit.date
    };
  } catch (error) {
    console.warn('Unable to get commit metadata:', error.message);
    return {
      hash: 'unknown',
      message: 'No commit message',
      author: 'Unknown',
      date: new Date().toISOString()
    };
  }
}

/**
 * Get previous snapshot from git history or filesystem
 */
export async function getPreviousSnapshot() {
  const snapshotsDir = path.join(__dirname, '../../changelog-data/snapshots');

  // Get all snapshot files
  if (!fs.existsSync(snapshotsDir)) {
    return null;
  }

  const files = fs.readdirSync(snapshotsDir)
    .filter(f => f.startsWith('components-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  // Load the most recent snapshot
  const snapshotFile = path.join(snapshotsDir, files[0]);
  const tokenFile = snapshotFile.replace('components-', 'tokens-');

  if (!fs.existsSync(tokenFile)) {
    return null;
  }

  return {
    components: JSON.parse(fs.readFileSync(snapshotFile, 'utf-8')),
    tokens: JSON.parse(fs.readFileSync(tokenFile, 'utf-8'))
  };
}

/**
 * Save current snapshot
 */
export function saveSnapshot(snapshot) {
  const snapshotsDir = path.join(__dirname, '../../changelog-data/snapshots');
  const timestamp = Date.now();

  fs.writeFileSync(
    path.join(snapshotsDir, `components-${timestamp}.json`),
    JSON.stringify(snapshot.components, null, 2)
  );

  fs.writeFileSync(
    path.join(snapshotsDir, `tokens-${timestamp}.json`),
    JSON.stringify(snapshot.tokens, null, 2)
  );

  console.log(`📸 Snapshot saved: ${timestamp}`);
}

/**
 * Generate deterministic entry ID to prevent duplicates
 */
export function generateEntryId(change, timestamp) {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      type: change.type,
      category: change.category,
      target: change.target,
      change: change.change,
      propName: change.propName || null
    }))
    .digest('hex')
    .slice(0, 8);

  const date = new Date(timestamp).toISOString().split('T')[0];
  return `${date}-${change.type}-${change.target}-${hash}`;
}

/**
 * Check if entry ID already exists in changelog
 */
export function isDuplicate(entryId, existingEntries) {
  return existingEntries.some(e => e.id === entryId);
}

/**
 * Compute hash of file content for change detection
 */
export function computeFileHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

/**
 * Deep diff helper for detecting object changes
 */
export function deepDiff(oldObj, newObj, path = []) {
  const changes = [];

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  for (const key of allKeys) {
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];
    const currentPath = [...path, key];

    if (oldValue === undefined && newValue !== undefined) {
      // Key added
      changes.push({
        type: 'added',
        path: currentPath,
        oldValue: undefined,
        newValue
      });
    } else if (oldValue !== undefined && newValue === undefined) {
      // Key removed
      changes.push({
        type: 'removed',
        path: currentPath,
        oldValue,
        newValue: undefined
      });
    } else if (typeof oldValue === 'object' && typeof newValue === 'object') {
      // Recursively diff nested objects
      if (oldValue !== null && newValue !== null) {
        changes.push(...deepDiff(oldValue, newValue, currentPath));
      }
    } else if (oldValue !== newValue) {
      // Value changed
      changes.push({
        type: 'changed',
        path: currentPath,
        oldValue,
        newValue
      });
    }
  }

  return changes;
}
