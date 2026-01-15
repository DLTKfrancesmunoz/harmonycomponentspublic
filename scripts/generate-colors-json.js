#!/usr/bin/env node
/**
 * Generate colors.json from tokens.css
 * Makes tokens.css the single source of truth for color tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensCssFile = path.join(__dirname, '../src/styles/tokens.css');
const colorsJsonFile = path.join(__dirname, '../src/tokens/colors.json');
const outputFile = path.join(__dirname, '../src/tokens/colors.json');

const themes = ['cp', 'vp', 'ppm', 'maconomy'];
const themeNames = {
  cp: 'Costpoint',
  vp: 'Vantagepoint',
  ppm: 'PPM',
  maconomy: 'Maconomy'
};

// CSS variable to JSON key mappings for palette colors
const paletteVarMap = {
  '--page-bg': 'pageBackground',
  '--card-bg': 'cardBackground',
  '--nav-bg': 'navBackground',
  '--input-bg': 'inputBackground',
  '--input-disabled-bg': 'inputDisabled',
  '--surface-bg': 'cellBackground', // Only in dark mode for CP
  '--table-total-bg': 'tableTotal',
  '--border-color': 'border',
  '--hover-bg': 'hover',
  '--text-primary': 'titleText',
  '--text-secondary': 'secondaryText',
  '--text-muted': 'mutedText',
  '--link-color': 'link'
};

// Helper to extract hex/rgb value from CSS value
function extractColorValue(value) {
  if (!value) return null;
  const trimmed = value.trim();
  // Handle hex
  if (trimmed.startsWith('#')) {
    return trimmed.toUpperCase();
  }
  // Handle rgb/rgba - we'll keep as-is for now, or could convert to hex
  if (trimmed.startsWith('rgb')) {
    return trimmed;
  }
  // Handle var() references - skip these as they're not direct values
  if (trimmed.startsWith('var(')) {
    return null;
  }
  return trimmed;
}

// Parse CSS and extract color tokens
function parseColorsFromCSS() {
  const cssContent = fs.readFileSync(tokensCssFile, 'utf-8');
  const root = postcss.parse(cssContent);
  
  const result = {
    themes: {},
    semantic: {},
    notificationBadge: {},
    alertChip: {},
    accent: {},
    kanban: {},
    dark: {},
    light: {},
    themeButton: {},
    pageHeaderButton: {},
    cssUtilities: {}
  };
  
  // Track semantic colors (they're the same across themes, so we'll use the first theme's values)
  let semanticLight = {};
  let semanticDark = {};
  
  // Process each rule
  root.walkRules((rule) => {
    const selector = rule.selector.trim();
    let theme = null;
    let colorMode = null;
    
    // Determine theme and color mode
    if (selector.startsWith('html.theme-')) {
      const themeMatch = selector.match(/html\.theme-(\w+)/);
      if (themeMatch) {
        theme = themeMatch[1];
        if (selector.includes('.dark')) {
          colorMode = 'dark';
        } else {
          colorMode = 'light';
        }
      }
    }
    
    // Initialize theme if needed
    if (theme && !result.themes[theme]) {
      result.themes[theme] = {
        name: themeNames[theme] || theme,
        primary: {},
        primaryHover: {},
        palette: {
          light: {},
          dark: {}
        }
      };
    }
    
    // Extract CSS variables from this rule
    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith('--')) return;
      
      const varName = decl.prop;
      const value = extractColorValue(decl.value);
      if (!value) return; // Skip var() references and invalid values
      
      // Theme-specific colors
      if (theme && colorMode) {
        // Primary colors
        if (varName === '--theme-primary') {
          result.themes[theme].primary[colorMode] = value;
        } else if (varName === '--theme-primary-hover') {
          result.themes[theme].primaryHover[colorMode] = value;
        }
        
        // Palette colors
        const paletteKey = paletteVarMap[varName];
        if (paletteKey) {
          result.themes[theme].palette[colorMode][paletteKey] = value;
        }
        
        // Semantic colors (extract from first theme, they're the same)
        if (varName === '--color-success' && theme === 'cp') {
          semanticLight.success = value;
        } else if (varName === '--color-warning' && theme === 'cp') {
          semanticLight.warning = value;
        } else if (varName === '--color-error' && theme === 'cp') {
          semanticLight.error = value;
        } else if (varName === '--color-info' && theme === 'cp') {
          semanticLight.info = value;
        }
        
        // Semantic colors dark mode
        if (selector.includes('.dark')) {
          if (varName === '--color-success' && theme === 'cp') {
            semanticDark.success = value;
          } else if (varName === '--color-warning' && theme === 'cp') {
            semanticDark.warning = value;
          } else if (varName === '--color-error' && theme === 'cp') {
            semanticDark.error = value;
          } else if (varName === '--color-info' && theme === 'cp') {
            semanticDark.info = value;
          }
        }
        
        // Kanban colors (same across themes, extract from first)
        if (theme === 'cp') {
          if (varName === '--kanban-in-progress-border') {
            result.kanban.inProgress = { value };
          } else if (varName === '--kanban-done-border') {
            result.kanban.done = { value };
          }
        }
      }
      
      // Root-level colors (:root selector)
      if (selector === ':root') {
        // Alert chip colors
        if (varName === '--alert-chip-blue-bg') {
          result.alertChip.blue = { background: value };
        } else if (varName === '--alert-chip-blue-fg') {
          if (!result.alertChip.blue) result.alertChip.blue = {};
          result.alertChip.blue.foreground = value;
        } else if (varName === '--alert-chip-error-bg') {
          result.alertChip.error = { background: value };
        } else if (varName === '--alert-chip-error-fg') {
          if (!result.alertChip.error) result.alertChip.error = {};
          result.alertChip.error.foreground = value;
        } else if (varName === '--alert-chip-warning-bg') {
          result.alertChip.warning = { background: value };
        } else if (varName === '--alert-chip-warning-fg') {
          if (!result.alertChip.warning) result.alertChip.warning = {};
          result.alertChip.warning.foreground = value;
        } else if (varName === '--alert-chip-success-bg') {
          result.alertChip.success = { background: value };
        } else if (varName === '--alert-chip-success-fg') {
          if (!result.alertChip.success) result.alertChip.success = {};
          result.alertChip.success.foreground = value;
        } else if (varName === '--alert-chip-info-bg') {
          result.alertChip.info = { background: value };
        } else if (varName === '--alert-chip-info-fg') {
          if (!result.alertChip.info) result.alertChip.info = {};
          result.alertChip.info.foreground = value;
        } else if (varName === '--alert-chip-orange-bg') {
          result.alertChip.orange = { background: value };
        } else if (varName === '--alert-chip-orange-fg') {
          if (!result.alertChip.orange) result.alertChip.orange = {};
          result.alertChip.orange.foreground = value;
        } else if (varName === '--alert-chip-pink-bg') {
          result.alertChip.pink = { background: value };
        } else if (varName === '--alert-chip-pink-fg') {
          if (!result.alertChip.pink) result.alertChip.pink = {};
          result.alertChip.pink.foreground = value;
        } else if (varName === '--alert-chip-disabled-bg') {
          result.alertChip.disabled = { background: value };
        } else if (varName === '--alert-chip-disabled-fg') {
          if (!result.alertChip.disabled) result.alertChip.disabled = {};
          result.alertChip.disabled.foreground = value;
        } else if (varName === '--alert-chip-disabled-border') {
          if (!result.alertChip.disabled) result.alertChip.disabled = {};
          result.alertChip.disabled.border = value;
        }
        
        // Notification badge
        if (varName === '--notification-badge-error') {
          result.notificationBadge.error = { value };
        }
      }
    });
  });
  
  // Build semantic colors structure
  if (semanticLight.success) {
    result.semantic.success = {
      light: semanticLight.success,
      dark: semanticDark.success || semanticLight.success,
      description: 'Success states, confirmations, positive actions'
    };
  }
  if (semanticLight.warning) {
    result.semantic.warning = {
      light: semanticLight.warning,
      dark: semanticDark.warning || semanticLight.warning,
      description: 'Warning states, cautions, attention needed'
    };
  }
  if (semanticLight.error) {
    result.semantic.error = {
      light: semanticLight.error,
      dark: semanticDark.error || semanticLight.error,
      description: 'Error states, destructive actions, critical alerts'
    };
  }
  if (semanticLight.info) {
    result.semantic.info = {
      light: semanticLight.info,
      dark: semanticDark.info || semanticLight.info,
      description: 'Informational states, neutral highlights'
    };
  }
  
  // Add descriptions to alert chips and kanban
  if (result.alertChip.blue) {
    result.alertChip.blue.description = 'Alert Chip Blue colors';
  }
  if (result.alertChip.error) {
    result.alertChip.error.description = 'Alert Chip Error colors';
  }
  if (result.alertChip.warning) {
    result.alertChip.warning.description = 'Alert Chip Warning colors';
  }
  if (result.alertChip.success) {
    result.alertChip.success.description = 'Alert Chip Success colors';
  }
  if (result.alertChip.info) {
    result.alertChip.info.description = 'Alert Chip Info colors';
  }
  if (result.alertChip.orange) {
    result.alertChip.orange.description = 'Alert Chip Orange colors';
  }
  if (result.alertChip.pink) {
    result.alertChip.pink.description = 'Alert Chip Pink colors';
  }
  if (result.alertChip.disabled) {
    result.alertChip.disabled.description = 'Alert Chip Disabled colors';
  }
  
  if (result.kanban.inProgress) {
    result.kanban.inProgress.description = "Kanban 'In progress' column top border color";
  }
  if (result.kanban.done) {
    result.kanban.done.description = "Kanban 'Done' column top border color";
  }
  
  if (result.notificationBadge.error) {
    result.notificationBadge.error.description = 'Notification badge error color (red)';
  }
  result.notificationBadge.primary = {
    description: 'Notification badge primary color uses theme primary color'
  };
  
  // Load existing colors.json to preserve sections not in CSS
  let existingColors = {};
  try {
    existingColors = JSON.parse(fs.readFileSync(colorsJsonFile, 'utf-8'));
  } catch (e) {
    console.warn('⚠️  Could not read existing colors.json, creating new structure');
  }
  
  // Preserve sections that aren't extracted from CSS
  // These are static/descriptive and don't need to be in CSS
  result.accent = existingColors.accent || {
    acid: { value: '#ccff00', description: 'Highlight, special emphasis' },
    accent: { value: '#043852', description: 'Secondary accent color' }
  };
  
  result.dark = existingColors.dark || {};
  result.light = existingColors.light || {};
  result.themeButton = existingColors.themeButton || {};
  result.pageHeaderButton = existingColors.pageHeaderButton || {};
  result.cssUtilities = existingColors.cssUtilities || {};
  
  return result;
}

// Main execution
try {
  console.log('🎨 Generating colors.json from tokens.css...');
  const colors = parseColorsFromCSS();
  
  // Add metadata
  const output = {
    "$schema": "https://harmony-ds.com/tokens/colors.schema.json",
    "name": "Harmony Design System Colors",
    "version": "1.0.0",
    ...colors
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  const themeCount = Object.keys(output.themes).length;
  const paletteCount = Object.values(output.themes).reduce((sum, theme) => {
    return sum + Object.keys(theme.palette.light || {}).length + Object.keys(theme.palette.dark || {}).length;
  }, 0);
  
  console.log(`✅ Generated colors.json`);
  console.log(`   - ${themeCount} themes`);
  console.log(`   - ${paletteCount} palette colors`);
  console.log(`   - ${Object.keys(output.semantic).length} semantic colors`);
  console.log(`📄 Written to: ${outputFile}`);
} catch (error) {
  console.error('❌ Error generating colors.json:', error);
  process.exit(1);
}
