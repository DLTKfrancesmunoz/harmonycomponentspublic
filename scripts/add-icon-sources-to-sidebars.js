#!/usr/bin/env node
/**
 * Add Icon Source Information to Sidebar JSON Files
 * 
 * Reads leftsidebar.json and rightsidebar.json, detects icon sources,
 * and adds iconSource and iconPath fields to all icons in defaultSections.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectIconSource } from './detect-icon-sources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Read SVG file and extract content
 */
function readSvgContent(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      const svgContent = fs.readFileSync(fullPath, 'utf-8');
      // Extract inner content (everything between <svg> tags)
      const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
      if (match) {
        return match[1].trim();
      }
      return svgContent;
    }
  } catch (e) {
    console.warn(`Could not read SVG file: ${filePath}`);
  }
  return null;
}

/**
 * Process an icon item and add source information
 */
function processIconItem(item) {
  // If it's already a custom icon with customSrc, handle it specially
  if (item.isCustom && item.customSrc) {
    // Extract the path from customSrc (e.g., "/logos/DelaD.svg" -> "public/logos/DelaD.svg")
    const customPath = item.customSrc.startsWith('/')
      ? `public${item.customSrc}`
      : `public/${item.customSrc}`;
    
    // Read the SVG content for custom icons (MCP needs it)
    const svgContent = readSvgContent(customPath);
    
    const result = {
      ...item,
      iconSource: 'custom',
      iconPath: customPath
    };
    
    // Add SVG code if available
    if (svgContent) {
      result.iconSvg = svgContent;
    }
    
    return result;
  }

  // Regular icon with icon name
  if (item.icon) {
    const sourceInfo = detectIconSource(item.icon);
    const result = {
      ...item,
      iconSource: sourceInfo.source,
      iconPath: sourceInfo.path
    };
    
    // For custom icons, also include SVG code
    if (sourceInfo.source === 'custom' && sourceInfo.path) {
      const svgContent = readSvgContent(sourceInfo.path);
      if (svgContent) {
        result.iconSvg = svgContent;
      }
    }
    
    return result;
  }

  // No icon field, return as-is
  return item;
}

/**
 * Process all sections in defaultSections
 */
function processDefaultSections(defaultSections) {
  const processed = {};
  
  for (const [theme, sections] of Object.entries(defaultSections)) {
    processed[theme] = sections.map(section => ({
      ...section,
      items: section.items.map(item => processIconItem(item))
    }));
  }
  
  return processed;
}

/**
 * Update a sidebar JSON file
 */
function updateSidebarFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  const fullPath = path.join(rootDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const data = JSON.parse(content);

  if (data.defaultSections) {
    data.defaultSections = processDefaultSections(data.defaultSections);
    
    // Add metadata comment about icon sources
    if (!data._iconSourceMetadata) {
      data._iconSourceMetadata = {
        description: "Icon source detection follows Icon.astro component logic: Heroicons first, then custom SVGs",
        resolutionOrder: ["heroicons", "custom", "unknown"],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Write back with proper formatting
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`✓ Updated ${filePath}`);
}

// Main execution
const sidebarFiles = [
  'mcp-data/components/leftsidebar.json',
  'mcp-data/components/rightsidebar.json'
];

for (const file of sidebarFiles) {
  updateSidebarFile(file);
}

console.log('\n✓ All sidebar files updated with icon source information!');
