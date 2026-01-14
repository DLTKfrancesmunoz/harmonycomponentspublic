#!/usr/bin/env node
/**
 * Watch mode for automatic token generation
 * Watches component files, layout files, and CSS files for changes
 * Automatically regenerates JSON files when changes are detected
 */

import { watch } from 'chokidar';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Files and directories to watch
const watchPaths = [
  path.join(projectRoot, 'src/components/ui/**/*.astro'),
  path.join(projectRoot, 'src/layouts/**/*.astro'),
  path.join(projectRoot, 'src/styles/components.css')
];

// Debounce timer to avoid multiple regenerations
let regenerateTimer = null;
const DEBOUNCE_MS = 500; // Wait 500ms after last change before regenerating

function regenerateTokens() {
  console.log('\n🔄 Detected changes, regenerating tokens...');
  exec('npm run generate:all', { cwd: projectRoot }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error regenerating tokens:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }
    console.log('✅ Tokens regenerated successfully\n');
  });
}

function debouncedRegenerate() {
  if (regenerateTimer) {
    clearTimeout(regenerateTimer);
  }
  regenerateTimer = setTimeout(regenerateTokens, DEBOUNCE_MS);
}

// Initialize watcher
console.log('👀 Watching for changes in:');
watchPaths.forEach(path => console.log(`   - ${path.replace(projectRoot + '/', '')}`));
console.log('\n💡 Token files will regenerate automatically on changes...\n');

const watcher = watch(watchPaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true // Don't trigger on initial scan
});

watcher
  .on('change', (filePath) => {
    const relativePath = filePath.replace(projectRoot + '/', '');
    console.log(`📝 Changed: ${relativePath}`);
    debouncedRegenerate();
  })
  .on('add', (filePath) => {
    const relativePath = filePath.replace(projectRoot + '/', '');
    console.log(`➕ Added: ${relativePath}`);
    debouncedRegenerate();
  })
  .on('unlink', (filePath) => {
    const relativePath = filePath.replace(projectRoot + '/', '');
    console.log(`➖ Removed: ${relativePath}`);
    debouncedRegenerate();
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping token watcher...');
  watcher.close();
  process.exit(0);
});
