#!/usr/bin/env node
/**
 * Audit color contrast ratios for all color combinations in the design system
 * Tests against WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const colorsPath = path.join(__dirname, '../src/tokens/colors.json');
const outputPath = path.join(__dirname, '../public/color-contrast-audit-report.html');
const srcPath = path.join(__dirname, '../src');

// Color key to CSS variable mapping
const colorToCSSVar = {
  link: '--link-color',
  pageBackground: '--page-bg',
  cellBackground: '--surface-bg',
  cardBackground: '--card-bg',
  navBackground: '--nav-bg',
  inputBackground: '--input-bg',
  inputDisabled: '--input-disabled-bg',
  tableTotal: '--table-total-bg',
  border: '--border-color',
  hover: '--hover-bg',
  titleText: '--text-primary',
  secondaryText: '--text-secondary',
  mutedText: '--text-muted'
};

// WCAG 2.1 contrast requirements
const WCAG_AA_NORMAL = 4.5; // Normal text (under 18pt regular or 14pt bold)
const WCAG_AA_LARGE = 3.0;  // Large text (18pt+ regular or 14pt+ bold)
const WCAG_AA_UI = 3.0;     // UI components and graphical objects

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Normalize RGB values to 0-1
  const normalize = (val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get all color values from nested object structure
 */
function extractColorValues(obj, path = '', result = []) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string' && value.startsWith('#')) {
      result.push({
        path: currentPath,
        value: value.toUpperCase(),
        description: obj.description || ''
      });
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      extractColorValues(value, currentPath, result);
    }
  }
  return result;
}

/**
 * Get all colors from the colors.json structure
 */
function getAllColors(colors) {
  const allColors = new Map();
  
  // Extract all color values
  const colorValues = extractColorValues(colors);
  
  colorValues.forEach(({ path, value, description }) => {
    allColors.set(path, { value, description });
  });
  
  return allColors;
}

/**
 * Find where color combinations are used in the codebase
 */
function findColorUsage(foregroundKey, backgroundKey) {
  const fgVar = colorToCSSVar[foregroundKey];
  const bgVar = colorToCSSVar[backgroundKey];
  
  if (!fgVar || !bgVar) return [];
  
  const usage = [];
  
  try {
    // Search in src directory
    const files = getAllFiles(srcPath);
    
    files.forEach(file => {
      if (!file.endsWith('.astro') && !file.endsWith('.css') && !file.endsWith('.ts') && !file.endsWith('.js')) {
        return;
      }
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const hasFg = content.includes(fgVar) || content.includes(fgVar.replace('--', ''));
        const hasBg = content.includes(bgVar) || content.includes(bgVar.replace('--', ''));
        
        // Check if both variables are used in the same file (likely used together)
        if (hasFg && hasBg) {
          const relativePath = path.relative(path.join(__dirname, '..'), file);
          usage.push(relativePath);
        } else if (hasFg) {
          // Also include files that use the foreground color (text might be on default background)
          const relativePath = path.relative(path.join(__dirname, '..'), file);
          if (!usage.includes(relativePath)) {
            usage.push(relativePath);
          }
        }
      } catch (e) {
        // Skip files that can't be read
      }
    });
  } catch (e) {
    // If search fails, return empty array
  }
  
  return usage.slice(0, 5); // Limit to 5 files to avoid clutter
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

/**
 * Test text colors on backgrounds for each theme
 */
function testTextOnBackgrounds(colors) {
  const results = [];
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  const modes = ['light', 'dark'];
  const textColors = ['titleText', 'secondaryText', 'mutedText'];
  const backgroundColors = ['pageBackground', 'cardBackground', 'navBackground', 'inputBackground', 'inputDisabled', 'tableTotal', 'hover'];

  themes.forEach(theme => {
    modes.forEach(mode => {
      const palette = colors.themes[theme]?.palette?.[mode];
      if (!palette) return;

      textColors.forEach(textKey => {
        const textColor = palette[textKey];
        if (!textColor) return;

        backgroundColors.forEach(bgKey => {
          const bgColor = palette[bgKey];
          if (!bgColor) return;

          const ratio = getContrastRatio(textColor, bgColor);
          const passesNormal = ratio >= WCAG_AA_NORMAL;
          const passesLarge = ratio >= WCAG_AA_LARGE;
          
          // Find where this combination is used
          const usage = findColorUsage(textKey, bgKey);

          results.push({
            category: 'text-on-background',
            theme,
            mode,
            foreground: textColor,
            background: bgColor,
            contrastRatio: ratio,
            requiredRatio: WCAG_AA_NORMAL,
            passes: passesNormal,
            passesLarge,
            context: `${textKey} on ${bgKey}`,
            severity: 'critical',
            usage: usage,
            cssVars: {
              foreground: colorToCSSVar[textKey] || 'N/A',
              background: colorToCSSVar[bgKey] || 'N/A'
            }
          });
        });
      });
    });
  });

  return results;
}

/**
 * Test link colors on backgrounds
 */
function testLinksOnBackgrounds(colors) {
  const results = [];
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  const modes = ['light', 'dark'];
  const backgroundColors = ['pageBackground', 'cardBackground', 'navBackground', 'inputBackground'];

  themes.forEach(theme => {
    modes.forEach(mode => {
      const palette = colors.themes[theme]?.palette?.[mode];
      if (!palette) return;

      const linkColor = palette.link;
      if (!linkColor) return;

      backgroundColors.forEach(bgKey => {
        const bgColor = palette[bgKey];
        if (!bgColor) return;

        const ratio = getContrastRatio(linkColor, bgColor);
        const passesNormal = ratio >= WCAG_AA_NORMAL;
        
        // Find where this combination is used
        const usage = findColorUsage('link', bgKey);

        results.push({
          category: 'link-on-background',
          theme,
          mode,
          foreground: linkColor,
          background: bgColor,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: passesNormal,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `link on ${bgKey}`,
          severity: 'critical',
          usage: usage,
          cssVars: {
            foreground: colorToCSSVar.link || 'N/A',
            background: colorToCSSVar[bgKey] || 'N/A'
          }
        });
      });
    });
  });

  return results;
}

/**
 * Test button color combinations
 */
function testButtonCombinations(colors) {
  const results = [];
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  const modes = ['light', 'dark'];

  // Theme buttons
  themes.forEach(theme => {
    modes.forEach(mode => {
      // Primary button - foreground on background
      const primaryDefault = colors.themeButton?.primary?.default?.[mode];
      if (primaryDefault) {
        // Test on white background (typical button background)
        const whiteBg = colors.light.white.value;
        const ratio = getContrastRatio(primaryDefault, whiteBg);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: primaryDefault,
          background: whiteBg,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `themeButton.primary.default on white`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--theme-btn-primary',
            background: '--card-bg or white'
          }
        });
      }

      // Primary disabled
      const primaryDisabled = colors.themeButton?.primary?.disabled;
      if (primaryDisabled?.foreground && primaryDisabled?.background) {
        const ratio = getContrastRatio(primaryDisabled.foreground, primaryDisabled.background);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: primaryDisabled.foreground,
          background: primaryDisabled.background,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `themeButton.primary.disabled`,
          severity: 'warning',
          usage: [],
          cssVars: {
            foreground: '--theme-btn-primary-disabled-fg',
            background: '--theme-btn-primary-disabled-bg'
          }
        });
      }

      // Secondary hover
      const secondaryHover = colors.themeButton?.secondary?.hover;
      if (secondaryHover?.foreground && secondaryHover?.background) {
        const fgColor = secondaryHover.foreground[mode] || secondaryHover.foreground;
        const bgColor = secondaryHover.background;
        const ratio = getContrastRatio(fgColor, bgColor);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: fgColor,
          background: bgColor,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `themeButton.secondary.hover`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--theme-btn-secondary-hover-fg',
            background: '--theme-btn-secondary-hover-bg'
          }
        });
      }

      // Tertiary default
      const tertiaryDefault = colors.themeButton?.tertiary?.default?.foreground?.[mode];
      if (tertiaryDefault) {
        const whiteBg = colors.light.white.value;
        const ratio = getContrastRatio(tertiaryDefault, whiteBg);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: tertiaryDefault,
          background: whiteBg,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `themeButton.tertiary.default on white`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--theme-btn-tertiary-fg',
            background: '--card-bg or white'
          }
        });
      }
    });
  });

  // Page header buttons
  themes.forEach(theme => {
    modes.forEach(mode => {
      // Primary default
      const primaryDefault = colors.pageHeaderButton?.primary?.default?.[mode];
      if (primaryDefault) {
        const whiteBg = colors.light.white.value;
        const ratio = getContrastRatio(primaryDefault, whiteBg);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: primaryDefault,
          background: whiteBg,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `pageHeaderButton.primary.default on white`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--page-header-btn-primary',
            background: '--card-bg or white'
          }
        });
      }

      // Primary disabled
      const primaryDisabled = colors.pageHeaderButton?.primary?.disabled;
      if (primaryDisabled?.foreground && primaryDisabled?.background) {
        const ratio = getContrastRatio(primaryDisabled.foreground, primaryDisabled.background);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: primaryDisabled.foreground,
          background: primaryDisabled.background,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `pageHeaderButton.primary.disabled`,
          severity: 'warning',
          usage: [],
          cssVars: {
            foreground: '--page-header-btn-primary-disabled-fg',
            background: '--page-header-btn-primary-disabled-bg'
          }
        });
      }

      // Secondary default
      const secondaryDefault = colors.pageHeaderButton?.secondary?.default;
      if (secondaryDefault?.foreground) {
        const fgColor = secondaryDefault.foreground[mode] || secondaryDefault.foreground;
        const whiteBg = colors.light.white.value;
        const ratio = getContrastRatio(fgColor, whiteBg);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: fgColor,
          background: whiteBg,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `pageHeaderButton.secondary.default on white`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--page-header-btn-secondary-stroke',
            background: '--card-bg or white'
          }
        });
      }

      // Secondary hover
      const secondaryHover = colors.pageHeaderButton?.secondary?.hover;
      if (secondaryHover?.foreground && secondaryHover?.background) {
        const ratio = getContrastRatio(secondaryHover.foreground, secondaryHover.background);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: secondaryHover.foreground,
          background: secondaryHover.background,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `pageHeaderButton.secondary.hover`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--page-header-btn-secondary-hover-fg',
            background: '--page-header-btn-secondary-hover-bg'
          }
        });
      }

      // Tertiary default
      const tertiaryDefault = colors.pageHeaderButton?.tertiary?.default?.foreground?.[mode];
      if (tertiaryDefault) {
        const whiteBg = colors.light.white.value;
        const ratio = getContrastRatio(tertiaryDefault, whiteBg);
        results.push({
          category: 'button',
          theme,
          mode,
          foreground: tertiaryDefault,
          background: whiteBg,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_NORMAL,
          passes: ratio >= WCAG_AA_NORMAL,
          passesLarge: ratio >= WCAG_AA_LARGE,
          context: `pageHeaderButton.tertiary.default on white`,
          severity: 'critical',
          usage: [],
          cssVars: {
            foreground: '--page-header-btn-tertiary-fg',
            background: '--card-bg or white'
          }
        });
      }
    });
  });

  return results;
}

/**
 * Test alert chip color combinations
 */
function testAlertChips(colors) {
  const results = [];
  const chipTypes = Object.keys(colors.alertChip || {});

  chipTypes.forEach(chipType => {
    const chip = colors.alertChip[chipType];
    if (chip.foreground && chip.background) {
      const ratio = getContrastRatio(chip.foreground, chip.background);
      results.push({
        category: 'alert-chip',
        theme: 'all',
        mode: 'all',
        foreground: chip.foreground,
        background: chip.background,
        contrastRatio: ratio,
        requiredRatio: WCAG_AA_NORMAL,
        passes: ratio >= WCAG_AA_NORMAL,
        passesLarge: ratio >= WCAG_AA_LARGE,
        context: `alertChip.${chipType}`,
        severity: 'critical',
        usage: [],
        cssVars: {
          foreground: `alertChip.${chipType}.foreground`,
          background: `alertChip.${chipType}.background`
        }
      });
    }
  });

  return results;
}

/**
 * Test semantic colors on common backgrounds
 */
function testSemanticColors(colors) {
  const results = [];
  const semanticColors = ['success', 'warning', 'error', 'info'];
  const modes = ['light', 'dark'];
  const commonBackgrounds = [
    { name: 'white', value: colors.light.white.value },
    { name: 'pageBackground', value: colors.light.pageBackground.value },
    { name: 'cardBackground', value: colors.themes.cp.palette.light.cardBackground }
  ];

  semanticColors.forEach(semantic => {
    modes.forEach(mode => {
      const semanticColor = colors.semantic[semantic]?.[mode];
      if (!semanticColor) return;

      commonBackgrounds.forEach(bg => {
        const ratio = getContrastRatio(semanticColor, bg.value);
        results.push({
          category: 'semantic-color',
          theme: 'all',
          mode,
          foreground: semanticColor,
          background: bg.value,
          contrastRatio: ratio,
          requiredRatio: WCAG_AA_UI,
          passes: ratio >= WCAG_AA_UI,
          passesLarge: ratio >= WCAG_AA_UI,
          context: `semantic.${semantic} (${mode}) on ${bg.name}`,
          severity: 'warning',
          usage: [],
          cssVars: {
            foreground: `--color-${semantic}`,
            background: bg.name === 'white' ? 'white' : `--${bg.name === 'pageBackground' ? 'page' : 'card'}-bg`
          }
        });
      });
    });
  });

  return results;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(allResults) {
  const total = allResults.length;
  const passed = allResults.filter(r => r.passes).length;
  const failed = total - passed;
  const criticalFailures = allResults.filter(r => !r.passes && r.severity === 'critical').length;

  // Group by category
  const byCategory = {};
  allResults.forEach(result => {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  });

  // Group by pass/fail
  const failures = allResults.filter(r => !r.passes);
  const passes = allResults.filter(r => r.passes);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Color Contrast Audit Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 2rem;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #0073E6;
    }
    
    .stat-card.failed {
      border-left-color: #D14343;
    }
    
    .stat-card.passed {
      border-left-color: #52BD94;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .filters {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .filter-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    label {
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    select, input[type="text"] {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .results {
      display: grid;
      gap: 1rem;
    }
    
    .category-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .category-title {
      font-size: 1.5rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .category-count {
      background: #e5e7eb;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .result-item {
      display: grid;
      grid-template-columns: 200px 1fr auto auto;
      gap: 1rem;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 0.75rem;
      align-items: start;
      border: 1px solid #e5e7eb;
      transition: all 0.2s;
    }
    
    .result-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .result-item.failed {
      background: #fff5f5;
      border-color: #fecaca;
    }
    
    .result-item.passed {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    
    .color-swatch {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .swatch {
      width: 60px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid #ddd;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .swatch-foreground {
      background-color: var(--fg);
    }
    
    .swatch-background {
      background-color: var(--bg);
    }
    
    .context {
      font-size: 0.9rem;
      color: #666;
    }
    
    .contrast-ratio {
      font-size: 1.1rem;
      font-weight: 600;
      text-align: center;
      min-width: 80px;
    }
    
    .contrast-ratio.failed {
      color: #D14343;
    }
    
    .contrast-ratio.passed {
      color: #52BD94;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
      text-align: center;
      min-width: 60px;
    }
    
    .status-badge.pass {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-badge.fail {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .severity-badge.critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .severity-badge.warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .hidden {
      display: none;
    }
    
    .no-results {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .result-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .color-swatch {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎨 Color Contrast Audit Report</h1>
      <p>WCAG 2.1 AA Compliance Check - Generated ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <div class="stat-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total Combinations</div>
        </div>
        <div class="stat-card passed">
          <div class="stat-value">${passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-value">${failed}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-value">${criticalFailures}</div>
          <div class="stat-label">Critical Failures</div>
        </div>
      </div>
    </header>
    
    <div class="filters">
      <div class="filter-group">
        <label for="filter-status">Status:</label>
        <select id="filter-status">
          <option value="all">All</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-category">Category:</label>
        <select id="filter-category">
          <option value="all">All Categories</option>
          ${Object.keys(byCategory).map(cat => `<option value="${cat}">${cat.replace(/-/g, ' ')}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-theme">Theme:</label>
        <select id="filter-theme">
          <option value="all">All Themes</option>
          <option value="cp">CP</option>
          <option value="vp">VP</option>
          <option value="ppm">PPM</option>
          <option value="maconomy">Maconomy</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-mode">Mode:</label>
        <select id="filter-mode">
          <option value="all">All Modes</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
    
    <div class="results">
      ${Object.entries(byCategory).map(([category, results]) => `
        <div class="category-section" data-category="${category}">
          <div class="category-header">
            <h2 class="category-title">${category.replace(/-/g, ' ')}</h2>
            <span class="category-count">${results.length} combinations</span>
          </div>
          <div class="category-results">
            ${results.map(result => {
              const statusClass = result.passes ? 'passed' : 'failed';
              const statusText = result.passes ? 'PASS' : 'FAIL';
              const ratioClass = result.passes ? 'passed' : 'failed';
              
              return `
                <div class="result-item ${statusClass}" 
                     data-status="${result.passes ? 'pass' : 'fail'}"
                     data-category="${category}"
                     data-theme="${result.theme}"
                     data-mode="${result.mode}">
                  <div class="color-swatch">
                    <div class="swatch swatch-background" style="background-color: ${result.background};">
                      <span style="color: ${result.foreground}">Aa</span>
                    </div>
                  </div>
                  <div class="context">
                    <div><strong>${result.context}</strong></div>
                    <div style="margin-top: 0.25rem; font-size: 0.85rem;">
                      FG: ${result.foreground} | BG: ${result.background}
                    </div>
                    ${result.cssVars ? `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">
                      <div><code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.8rem;">${result.cssVars.foreground}</code> on <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 0.8rem;">${result.cssVars.background}</code></div>
                    </div>` : ''}
                    ${result.usage && result.usage.length > 0 ? `<div style="margin-top: 0.5rem; font-size: 0.85rem;">
                      <div style="color: #666; margin-bottom: 0.25rem;"><strong>Used in:</strong></div>
                      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        ${result.usage.map(file => `<div style="font-family: monospace; font-size: 0.75rem; color: #0073E6; word-break: break-all;">${file}</div>`).join('')}
                      </div>
                    </div>` : result.cssVars ? `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #999; font-style: italic;">No specific usage found - check CSS variables in tokens.css</div>` : ''}
                    ${result.theme !== 'all' ? `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #999;">Theme: ${result.theme.toUpperCase()} | Mode: ${result.mode}</div>` : ''}
                  </div>
                  <div class="contrast-ratio ${ratioClass}">
                    ${result.contrastRatio.toFixed(2)}:1
                    <div style="font-size: 0.75rem; font-weight: normal; color: #666; margin-top: 0.25rem;">
                      (req: ${result.requiredRatio}:1)
                    </div>
                  </div>
                  <div>
                    <div class="status-badge ${result.passes ? 'pass' : 'fail'}">${statusText}</div>
                    <div class="severity-badge ${result.severity}" style="margin-top: 0.5rem;">${result.severity}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <script>
    const filterStatus = document.getElementById('filter-status');
    const filterCategory = document.getElementById('filter-category');
    const filterTheme = document.getElementById('filter-theme');
    const filterMode = document.getElementById('filter-mode');
    
    function applyFilters() {
      const status = filterStatus.value;
      const category = filterCategory.value;
      const theme = filterTheme.value;
      const mode = filterMode.value;
      
      document.querySelectorAll('.result-item').forEach(item => {
        const itemStatus = item.dataset.status;
        const itemCategory = item.dataset.category;
        const itemTheme = item.dataset.theme;
        const itemMode = item.dataset.mode;
        
        let show = true;
        
        if (status !== 'all' && itemStatus !== status) show = false;
        if (category !== 'all' && itemCategory !== category) show = false;
        if (theme !== 'all' && itemTheme !== theme) show = false;
        if (mode !== 'all' && itemMode !== mode) show = false;
        
        item.classList.toggle('hidden', !show);
      });
      
      // Hide empty category sections
      document.querySelectorAll('.category-section').forEach(section => {
        const visibleItems = section.querySelectorAll('.result-item:not(.hidden)').length;
        section.style.display = visibleItems === 0 ? 'none' : 'block';
      });
    }
    
    filterStatus.addEventListener('change', applyFilters);
    filterCategory.addEventListener('change', applyFilters);
    filterTheme.addEventListener('change', applyFilters);
    filterMode.addEventListener('change', applyFilters);
  </script>
</body>
</html>`;

  return html;
}

// Main execution
console.log('🔍 Starting Color Contrast Audit...\n');

try {
  const colorsData = fs.readFileSync(colorsPath, 'utf-8');
  const colors = JSON.parse(colorsData);

  console.log('📊 Testing color combinations...\n');

  // Run all tests
  const textResults = testTextOnBackgrounds(colors);
  const linkResults = testLinksOnBackgrounds(colors);
  const buttonResults = testButtonCombinations(colors);
  const chipResults = testAlertChips(colors);
  const semanticResults = testSemanticColors(colors);

  const allResults = [
    ...textResults,
    ...linkResults,
    ...buttonResults,
    ...chipResults,
    ...semanticResults
  ];

  console.log(`✅ Tested ${allResults.length} color combinations`);
  console.log(`   Passed: ${allResults.filter(r => r.passes).length}`);
  console.log(`   Failed: ${allResults.filter(r => !r.passes).length}`);
  console.log(`   Critical failures: ${allResults.filter(r => !r.passes && r.severity === 'critical').length}\n`);

  // Generate HTML report
  console.log('📄 Generating HTML report...');
  const htmlReport = generateHTMLReport(allResults);
  fs.writeFileSync(outputPath, htmlReport, 'utf-8');

  console.log(`✅ Report generated: ${outputPath}\n`);
  console.log('💡 Open the HTML file in your browser to view the detailed results.');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
