#!/usr/bin/env node
/**
 * Audit Hardcoded Styles
 * 
 * Scans for hardcoded color values, pixel values, and other style values
 * that should be replaced with design tokens.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to match
const patterns = {
  hexColor: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
  rgbColor: /rgba?\([^)]+\)/g,
  pixelValue: /\b(\d+)px\b/g,
  remValue: /\b(\d+\.?\d*)rem\b/g,
  zIndex: /z-index:\s*(\d+)/g,
};

// Files to scan
const filesToScan = [
  'src/styles/components.css',
  'src/styles/layout.css',
  'src/layouts/*.astro',
  'src/components/ui/*.astro',
];

// Results storage
const results = {
  colors: [],
  pixels: [],
  rems: [],
  zIndex: [],
  files: new Set(),
};

// Scan a file for hardcoded values
function scanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);

  // Scan for hex colors
  lines.forEach((line, index) => {
    const hexMatches = line.matchAll(patterns.hexColor);
    for (const match of hexMatches) {
      // Skip if it's in a comment or CSS variable
      if (line.trim().startsWith('//') || line.includes('--') || line.includes('var(')) {
        continue;
      }
      results.colors.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim().substring(0, 100),
      });
      results.files.add(relativePath);
    }
  });

  // Scan for rgb/rgba colors
  lines.forEach((line, index) => {
    const rgbMatches = line.matchAll(patterns.rgbColor);
    for (const match of rgbMatches) {
      // Skip if it's in a comment or CSS variable
      if (line.trim().startsWith('//') || line.includes('--') || line.includes('var(')) {
        continue;
      }
      results.colors.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim().substring(0, 100),
      });
      results.files.add(relativePath);
    }
  });

  // Scan for pixel values (excluding common justified cases)
  lines.forEach((line, index) => {
    // Skip common justified cases
    if (line.includes('viewBox') || line.includes('width=') || line.includes('height=') || 
        line.includes('data-') || line.includes('calc(') || line.includes('var(')) {
      return;
    }
    
    const pxMatches = line.matchAll(patterns.pixelValue);
    for (const match of pxMatches) {
      const value = parseInt(match[1]);
      // Skip very small values that are often layout hacks (-1px, 1px, etc.)
      if (Math.abs(value) <= 1) {
        continue;
      }
      results.pixels.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim().substring(0, 100),
      });
      results.files.add(relativePath);
    }
  });

  // Scan for hardcoded z-index
  lines.forEach((line, index) => {
    const zIndexMatches = line.matchAll(patterns.zIndex);
    for (const match of zIndexMatches) {
      // Skip if it's using a CSS variable
      if (line.includes('var(')) {
        continue;
      }
      results.zIndex.push({
        file: relativePath,
        line: index + 1,
        value: match[0],
        context: line.trim().substring(0, 100),
      });
      results.files.add(relativePath);
    }
  });
}

// Get all files matching pattern
function getFiles(pattern) {
  const files = [];
  const basePath = path.join(__dirname, '..');
  
  if (pattern.includes('*')) {
    const dir = path.dirname(pattern);
    const glob = path.basename(pattern);
    const fullDir = path.join(basePath, dir);
    
    if (fs.existsSync(fullDir)) {
      const dirFiles = fs.readdirSync(fullDir);
      const regex = new RegExp('^' + glob.replace(/\*/g, '.*') + '$');
      dirFiles.forEach(file => {
        if (regex.test(file)) {
          files.push(path.join(fullDir, file));
        }
      });
    }
  } else {
    const fullPath = path.join(basePath, pattern);
    if (fs.existsSync(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
console.log('🔍 Scanning for hardcoded styles...\n');

// Scan all files
filesToScan.forEach(pattern => {
  const files = getFiles(pattern);
  files.forEach(file => {
    scanFile(file);
  });
});

// Generate report
console.log('📊 HARDCODED STYLES AUDIT REPORT\n');
console.log('=' .repeat(80));

// Colors report
if (results.colors.length > 0) {
  console.log(`\n🎨 HARDCODED COLORS (${results.colors.length} found):\n`);
  const colorGroups = {};
  results.colors.forEach(item => {
    if (!colorGroups[item.value]) {
      colorGroups[item.value] = [];
    }
    colorGroups[item.value].push(item);
  });
  
  Object.entries(colorGroups).forEach(([color, items]) => {
    console.log(`  ${color} (${items.length} occurrence${items.length > 1 ? 's' : ''}):`);
    items.slice(0, 5).forEach(item => {
      console.log(`    - ${item.file}:${item.line}`);
      console.log(`      ${item.context}`);
    });
    if (items.length > 5) {
      console.log(`    ... and ${items.length - 5} more`);
    }
    console.log('');
  });
} else {
  console.log('\n✅ No hardcoded colors found!');
}

// Pixel values report
if (results.pixels.length > 0) {
  console.log(`\n📏 HARDCODED PIXEL VALUES (${results.pixels.length} found):\n`);
  results.pixels.slice(0, 20).forEach(item => {
    console.log(`  ${item.file}:${item.line} - ${item.value}`);
    console.log(`    ${item.context}\n`);
  });
  if (results.pixels.length > 20) {
    console.log(`  ... and ${results.pixels.length - 20} more\n`);
  }
} else {
  console.log('\n✅ No hardcoded pixel values found!');
}

// Z-index report
if (results.zIndex.length > 0) {
  console.log(`\n📚 HARDCODED Z-INDEX VALUES (${results.zIndex.length} found):\n`);
  results.zIndex.forEach(item => {
    console.log(`  ${item.file}:${item.line} - ${item.value}`);
    console.log(`    ${item.context}\n`);
  });
} else {
  console.log('\n✅ No hardcoded z-index values found!');
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('\n📈 SUMMARY:');
console.log(`  Files scanned: ${results.files.size}`);
console.log(`  Hardcoded colors: ${results.colors.length}`);
console.log(`  Hardcoded pixels: ${results.pixels.length}`);
console.log(`  Hardcoded z-index: ${results.zIndex.length}`);
console.log(`  Total issues: ${results.colors.length + results.pixels.length + results.zIndex.length}\n`);

// Exit with error code if issues found
if (results.colors.length > 0 || results.pixels.length > 0 || results.zIndex.length > 0) {
  console.log('⚠️  Some hardcoded values were found. Review the report above.');
  process.exit(1);
} else {
  console.log('✅ All styles are using design tokens!');
  process.exit(0);
}
