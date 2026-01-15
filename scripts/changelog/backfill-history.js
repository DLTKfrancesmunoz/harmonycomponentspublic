#!/usr/bin/env node
/**
 * Backfill changelog from git history
 * Processes recent commits to populate initial changelog data
 */

import { execSync } from 'child_process';
import { detectChanges } from './detect-changes.js';
import { generateChangelogEntries } from './generate-entries.js';
import { publishEntries } from './publish-changelog.js';
import crypto from 'crypto';
import path from 'path';

const COMMITS_TO_PROCESS = 10; // Process last 10 commits

async function backfillHistory() {
  console.log('🔄 Backfilling changelog from git history...\n');

  // Get list of commits that touched components or tokens
  let commitsRaw;
  try {
    commitsRaw = execSync(
      `git log -${COMMITS_TO_PROCESS} --format="%H|%s|%an|%ad" --date=iso -- src/components/ui src/tokens`,
      { encoding: 'utf-8' }
    ).trim();
  } catch (error) {
    console.log('No commits found affecting components or tokens.');
    return;
  }

  if (!commitsRaw) {
    console.log('No commits found affecting components or tokens.');
    return;
  }

  const commits = commitsRaw.split('\n').map(line => {
    const [hash, message, author, date] = line.split('|');
    return { hash, message, author, date };
  }).reverse(); // Process oldest first

  console.log(`Found ${commits.length} relevant commits to process.\n`);

  let totalEntriesAdded = 0;

  for (const commit of commits) {
    console.log(`\nProcessing: ${commit.hash.slice(0, 7)} - ${commit.message}`);

    try {
      // Get snapshot at this commit
      const currentSnapshot = await generateSnapshotAtCommit(commit.hash);

      // Get snapshot at parent commit
      let parentHash;
      try {
        parentHash = execSync(`git rev-parse ${commit.hash}^`, { encoding: 'utf-8' }).trim();
      } catch (error) {
        console.log('  Skipping: No parent commit (initial commit)');
        continue;
      }

      const previousSnapshot = await generateSnapshotAtCommit(parentHash);

      // Detect changes
      const changes = await detectChanges(currentSnapshot, previousSnapshot);

      if (changes.length === 0) {
        console.log('  No detectable changes in this commit.');
        continue;
      }

      console.log(`  Found ${changes.length} changes`);

      // Generate entries with commit metadata
      const baseEntries = await generateChangelogEntries(changes);
      const entries = baseEntries.map(entry => ({
        ...entry,
        date: new Date(commit.date).toISOString(),
        commit: {
          hash: commit.hash.slice(0, 7),
          message: commit.message,
          author: commit.author,
          date: new Date(commit.date).toISOString()
        }
      }));

      // Publish entries
      const added = publishEntries(entries);
      totalEntriesAdded += added;
      console.log(`  ✅ Added ${added} changelog entries`);

    } catch (error) {
      console.error(`  ❌ Error processing commit ${commit.hash.slice(0, 7)}:`, error.message);
    }
  }

  console.log(`\n✅ Backfill complete! Added ${totalEntriesAdded} total entries.\n`);
}

async function generateSnapshotAtCommit(commitHash) {
  // Checkout commit without modifying working directory (use git show)
  let componentsFiles;
  try {
    componentsFiles = execSync(
      `git ls-tree -r --name-only ${commitHash} -- src/components/ui`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean);
  } catch (error) {
    componentsFiles = [];
  }

  const snapshot = {
    timestamp: Date.now(),
    commit: commitHash,
    components: [],
    tokens: {}
  };

  // Parse components at this commit
  for (const filePath of componentsFiles) {
    if (!filePath.endsWith('.astro')) continue;

    try {
      const content = execSync(`git show ${commitHash}:${filePath}`, { encoding: 'utf-8' });
      const componentName = path.basename(filePath, '.astro');

      // Parse props from content
      const props = parsePropsFromContent(content);

      snapshot.components.push({
        name: componentName,
        filePath,
        props,
        hash: crypto.createHash('sha256').update(content).digest('hex')
      });
    } catch (error) {
      // File might not exist at this commit
      continue;
    }
  }

  // Parse tokens at this commit
  const tokenFiles = ['colors.json', 'spacing.json', 'typography.json', 'elevations.json'];
  for (const tokenFile of tokenFiles) {
    try {
      const content = execSync(`git show ${commitHash}:src/tokens/${tokenFile}`, { encoding: 'utf-8' });
      const tokenName = path.basename(tokenFile, '.json');
      snapshot.tokens[tokenName] = {
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        data: JSON.parse(content)
      };
    } catch (error) {
      // Token file might not exist
      snapshot.tokens[tokenName] = { hash: null, data: {} };
    }
  }

  return snapshot;
}

function parsePropsFromContent(fileContent) {
  const interfaceMatch = fileContent.match(/interface\s+Props\s*\{([^}]+)\}/s);
  if (!interfaceMatch) return {};

  const propsText = interfaceMatch[1];
  const props = {};

  // Parse each prop line
  const propLines = propsText.split('\n').filter(line => line.trim());

  for (const line of propLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      continue;
    }

    // Match: propName?: type; or propName: type;
    const propMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?/);
    if (propMatch) {
      const [, propName, optional, propType] = propMatch;
      props[propName] = {
        type: propType.trim(),
        optional: !!optional
      };
    }
  }

  return props;
}

backfillHistory().catch(error => {
  console.error('❌ Backfill failed:', error);
  process.exit(1);
});
