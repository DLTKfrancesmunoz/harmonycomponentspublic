#!/usr/bin/env node
/**
 * Generate components.json from component-props-inventory.json
 * Uses hash-based change detection to avoid unnecessary regeneration
 * Only regenerates when component files, tokens, CSS, or inventory change
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Paths
const componentsDir = path.join(projectRoot, 'src/components/ui');
const tokensDir = path.join(projectRoot, 'src/tokens');
const stylesDir = path.join(projectRoot, 'src/styles');
const inventoryFile = path.join(projectRoot, 'component-props-inventory.json');
const componentsJsonFile = path.join(projectRoot, 'src/tokens/components.json');
const cacheFile = path.join(projectRoot, '.cache/components-regeneration-cache.json');

// Files to track
const tokenFiles = ['colors.json', 'spacing.json', 'typography.json', 'elevations.json'];
const cssFiles = ['components.css'];

/**
 * Compute hash of file content
 */
function computeFileHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

/**
 * Safely hash a file, returning null on error
 */
function safeHashFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return computeFileHash(content);
  } catch (error) {
    console.warn(`⚠️  Failed to hash ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get all component files
 */
function getComponentFiles() {
  if (!fs.existsSync(componentsDir)) {
    return [];
  }
  return fs.readdirSync(componentsDir)
    .filter(f => f.endsWith('.astro'))
    .sort();
}

/**
 * Normalize path for consistent comparison
 */
function normalizePath(filePath) {
  return path.normalize(filePath).replace(/\\/g, '/');
}

/**
 * Load cache from file
 */
function loadCache() {
  if (!fs.existsSync(cacheFile)) {
    return null;
  }
  try {
    const content = fs.readFileSync(cacheFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️  Failed to load cache, will regenerate:', error.message);
    return null;
  }
}

/**
 * Save cache to file
 */
function saveCache(cache) {
  const cacheDir = path.dirname(cacheFile);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.warn('⚠️  Failed to save cache:', error.message);
  }
}

/**
 * Check if regeneration is needed
 */
function shouldRegenerate(cache) {
  const changes = {
    componentsAdded: [],
    componentsRemoved: [],
    componentsModified: [],
    tokensChanged: false,
    tokensRemoved: [],
    cssChanged: false,
    inventoryChanged: false,
    reason: null
  };

  // Initial generation check
  if (!cache || !fs.existsSync(componentsJsonFile)) {
    return { shouldRegenerate: true, changes: { ...changes, reason: 'Initial generation' } };
  }

  // Check component files (added/removed/modified)
  const currentFiles = getComponentFiles();
  const previousFiles = cache.componentFiles || [];
  
  changes.componentsAdded = currentFiles.filter(f => !previousFiles.includes(f));
  changes.componentsRemoved = previousFiles.filter(f => !currentFiles.includes(f));
  
  // Check component modifications (mtime first, then hash if needed)
  for (const file of currentFiles) {
    const filePath = path.join(componentsDir, file);
    try {
      const stats = fs.statSync(filePath);
      const cachedMtime = cache.mtimes?.[file];
      
      // Fast check: compare mtime first
      if (stats.mtimeMs !== cachedMtime) {
        // mtime changed, check hash
        const currentHash = safeHashFile(filePath);
        if (currentHash && currentHash !== cache.hashes?.[file]) {
          changes.componentsModified.push(file);
        }
      }
    } catch (error) {
      // File might have been deleted or is unreadable, treat as changed
      changes.componentsModified.push(file);
    }
  }

  // Check token files
  const previousTokenFiles = Object.keys(cache.tokenHashes || {});
  const missingTokenFiles = previousTokenFiles.filter(f => 
    !fs.existsSync(path.join(tokensDir, f))
  );
  if (missingTokenFiles.length > 0) {
    changes.tokensRemoved = missingTokenFiles;
    changes.tokensChanged = true;
  }

  for (const tokenFile of tokenFiles) {
    const filePath = path.join(tokensDir, tokenFile);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    try {
      const stats = fs.statSync(filePath);
      const cachedMtime = cache.tokenMtimes?.[tokenFile];
      
      if (stats.mtimeMs !== cachedMtime) {
        const currentHash = safeHashFile(filePath);
        if (currentHash && currentHash !== cache.tokenHashes?.[tokenFile]) {
          changes.tokensChanged = true;
        }
      }
    } catch (error) {
      // Treat as changed if we can't read it
      changes.tokensChanged = true;
    }
  }

  // Check CSS files
  for (const cssFile of cssFiles) {
    const filePath = path.join(stylesDir, cssFile);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    try {
      const stats = fs.statSync(filePath);
      const cachedMtime = cache.cssFileMtimes?.[cssFile];
      
      if (stats.mtimeMs !== cachedMtime) {
        const currentHash = safeHashFile(filePath);
        if (currentHash && currentHash !== cache.cssFileHashes?.[cssFile]) {
          changes.cssChanged = true;
        }
      }
    } catch (error) {
      // Treat as changed if we can't read it
      changes.cssChanged = true;
    }
  }

  // Check inventory file
  if (fs.existsSync(inventoryFile)) {
    try {
      const stats = fs.statSync(inventoryFile);
      const cachedMtime = cache.inventoryMtime;
      
      if (stats.mtimeMs !== cachedMtime) {
        const currentHash = safeHashFile(inventoryFile);
        if (currentHash && currentHash !== cache.inventoryHash) {
          changes.inventoryChanged = true;
        }
      }
    } catch (error) {
      // Treat as changed if we can't read it
      changes.inventoryChanged = true;
    }
  } else {
    // Inventory file missing - this is a problem, but we'll try to proceed
    console.warn('⚠️  component-props-inventory.json not found');
    changes.inventoryChanged = true;
  }

  const hasChanges = 
    changes.componentsAdded.length > 0 ||
    changes.componentsRemoved.length > 0 ||
    changes.componentsModified.length > 0 ||
    changes.tokensChanged ||
    changes.tokensRemoved.length > 0 ||
    changes.cssChanged ||
    changes.inventoryChanged;

  return { shouldRegenerate: hasChanges, changes };
}

/**
 * Generate components.json from inventory
 */
function generateComponentsJson() {
  if (!fs.existsSync(inventoryFile)) {
    throw new Error(`component-props-inventory.json not found at ${inventoryFile}`);
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryFile, 'utf-8'));
  
  // Wrap inventory in components key
  const componentsJson = {
    components: inventory
  };

  return componentsJson;
}

/**
 * Update cache with current file states
 */
function updateCache() {
  const cache = {
    version: '1.0.0',
    componentFiles: [],
    hashes: {},
    mtimes: {},
    tokenHashes: {},
    tokenMtimes: {},
    cssFileHashes: {},
    cssFileMtimes: {},
    inventoryHash: null,
    inventoryMtime: null,
    lastGenerated: new Date().toISOString()
  };

  // Update component files
  const componentFiles = getComponentFiles();
  cache.componentFiles = componentFiles;
  
  for (const file of componentFiles) {
    const filePath = path.join(componentsDir, file);
    try {
      const stats = fs.statSync(filePath);
      cache.mtimes[file] = stats.mtimeMs;
      const hash = safeHashFile(filePath);
      if (hash) {
        cache.hashes[file] = hash;
      }
    } catch (error) {
      // Skip files we can't read
    }
  }

  // Update token files
  for (const tokenFile of tokenFiles) {
    const filePath = path.join(tokensDir, tokenFile);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        cache.tokenMtimes[tokenFile] = stats.mtimeMs;
        const hash = safeHashFile(filePath);
        if (hash) {
          cache.tokenHashes[tokenFile] = hash;
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }

  // Update CSS files
  for (const cssFile of cssFiles) {
    const filePath = path.join(stylesDir, cssFile);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        cache.cssFileMtimes[cssFile] = stats.mtimeMs;
        const hash = safeHashFile(filePath);
        if (hash) {
          cache.cssFileHashes[cssFile] = hash;
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }

  // Update inventory file
  if (fs.existsSync(inventoryFile)) {
    try {
      const stats = fs.statSync(inventoryFile);
      cache.inventoryMtime = stats.mtimeMs;
      const hash = safeHashFile(inventoryFile);
      if (hash) {
        cache.inventoryHash = hash;
      }
    } catch (error) {
      // Skip if we can't read it
    }
  }

  return cache;
}

/**
 * Write components.json atomically
 */
function writeComponentsJson(componentsJson) {
  // Write to temp file first, then rename (atomic write)
  const tempFile = componentsJsonFile + '.tmp';
  const jsonContent = JSON.stringify(componentsJson, null, 2);
  
  fs.writeFileSync(tempFile, jsonContent, 'utf-8');
  fs.renameSync(tempFile, componentsJsonFile);
}

/**
 * Main function
 */
function main() {
  try {
    // Load cache
    const cache = loadCache();
    
    // Check if regeneration is needed
    const { shouldRegenerate: needsRegeneration, changes } = shouldRegenerate(cache);
    
    if (!needsRegeneration) {
      // No changes detected, skip regeneration
      return;
    }

    // Log what changed (for debugging)
    if (changes.reason) {
      console.log(`📝 ${changes.reason}`);
    } else {
      const changeList = [];
      if (changes.componentsAdded.length > 0) {
        changeList.push(`${changes.componentsAdded.length} component(s) added`);
      }
      if (changes.componentsRemoved.length > 0) {
        changeList.push(`${changes.componentsRemoved.length} component(s) removed`);
      }
      if (changes.componentsModified.length > 0) {
        changeList.push(`${changes.componentsModified.length} component(s) modified`);
      }
      if (changes.tokensChanged) {
        changeList.push('tokens changed');
      }
      if (changes.cssChanged) {
        changeList.push('CSS changed');
      }
      if (changes.inventoryChanged) {
        changeList.push('inventory changed');
      }
      if (changeList.length > 0) {
        console.log(`📝 Changes detected: ${changeList.join(', ')}`);
      }
    }

    // Generate components.json
    const componentsJson = generateComponentsJson();
    
    // Write atomically
    writeComponentsJson(componentsJson);
    
    // Update cache
    const newCache = updateCache();
    saveCache(newCache);
    
    console.log('✅ components.json generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate components.json:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, shouldRegenerate, generateComponentsJson };
