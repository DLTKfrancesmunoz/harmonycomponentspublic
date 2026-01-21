/**
 * Generate Layout MCP Data
 * Extracts ShellLayout structure, theme composition, and spacing tokens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Paths
const LAYOUT_FILE = path.join(rootDir, 'src/layouts/ShellLayout.astro');
const TOKENS_FILE = path.join(rootDir, 'src/styles/tokens.css');
const OUTPUT_DIR = path.join(rootDir, 'mcp-data/layouts');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'shelllayout.json');

// Theme configuration
const THEME_SUPPORT = {
  themes: ['cp', 'vp', 'ppm', 'maconomy'],
  darkMode: true,
};

/**
 * Extract spacing tokens from tokens.css
 */
function extractSpacingTokens() {
  const tokensContent = fs.readFileSync(TOKENS_FILE, 'utf-8');
  const spacingTokens = {};

  // Extract shell-specific spacing tokens
  const shellTokenPattern = /--shell-([a-z-]+):\s*([^;]+);/g;
  let match;

  while ((match = shellTokenPattern.exec(tokensContent)) !== null) {
    const tokenName = match[1];
    const tokenValue = match[2].trim();
    const camelCaseName = tokenName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
    spacingTokens[camelCaseName] = {
      token: `--shell-${tokenName}`,
      value: tokenValue,
    };
  }

  // Extract other layout-relevant tokens
  const otherTokens = {
    sidebarWidth: { token: '--sidebar-width', value: '52px' },
    panelWidthNarrow: { token: '--panel-width-narrow', value: '596px' },
    panelWidthFull: { token: '--panel-width-full', value: '1300px' },
  };

  return { ...spacingTokens, ...otherTokens };
}

/**
 * Extract props from ShellLayout.astro
 */
function extractProps() {
  const layoutContent = fs.readFileSync(LAYOUT_FILE, 'utf-8');

  // Extract the Props interface
  const propsMatch = layoutContent.match(/interface Props \{([\s\S]*?)\n\}/);
  if (!propsMatch) {
    console.warn('⚠️  Could not extract Props interface');
    return {};
  }

  const propsContent = propsMatch[1];
  const props = {};

  // Parse each prop
  const propPattern = /\/\/ (.*?)\n\s*(\w+)\??: (.+?);/g;
  let match;

  while ((match = propPattern.exec(propsContent)) !== null) {
    const comment = match[1];
    const propName = match[2];
    const propType = match[3];

    props[propName] = {
      type: propType,
      optional: true,
      description: comment,
      default: extractDefaultValue(layoutContent, propName),
    };
  }

  return props;
}

/**
 * Extract default value for a prop
 */
function extractDefaultValue(content, propName) {
  const defaultPattern = new RegExp(`${propName}\\s*=\\s*([^,\\n}]+)`);
  const match = content.match(defaultPattern);
  
  if (match) {
    let value = match[1].trim();
    // Remove trailing comma if present
    value = value.replace(/,$/, '');
    return value;
  }
  
  return null;
}

/**
 * Build theme composition data
 */
function buildThemeComposition() {
  return {
    cp: {
      productName: 'Costpoint',
      logo: '/logos/CPVPLogo.svg',
      components: [
        { name: 'ShellHeader', required: true, conditional: null },
        { name: 'FloatingNav', required: false, conditional: 'CP theme only' },
        { name: 'LeftSidebar', required: true, conditional: null },
        { name: 'RightSidebar', required: true, conditional: null },
        { name: 'ShellPageHeader', required: false, conditional: 'When pageHeaderTitle is provided' },
        { name: 'ShellPanel', required: false, conditional: 'When leftPanel or rightPanel is provided' },
        { name: 'main', required: true, conditional: null },
      ],
      hasFooter: false,
      hasFloatingNav: true,
      gridRows: 'var(--shell-header-height) 1fr',
      gridColumns: '1fr',
      mainPadding: {
        top: 'var(--shell-layout-padding-top)',
        right: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
      },
      description: 'CP theme uses FloatingNav below header, no footer, 88px top padding',
    },
    vp: {
      productName: 'Vantagepoint',
      logo: '/logos/CPVPLogo.svg',
      components: [
        { name: 'ShellHeader', required: true, conditional: null },
        { name: 'LeftSidebar', required: true, conditional: null },
        { name: 'RightSidebar', required: true, conditional: null },
        { name: 'ShellPageHeader', required: false, conditional: 'When pageHeaderTitle is provided' },
        { name: 'ShellPanel', required: false, conditional: 'When leftPanel or rightPanel is provided' },
        { name: 'main', required: true, conditional: null },
        { name: 'ShellFooter', required: true, conditional: 'VP/PPM/Maconomy themes' },
      ],
      hasFooter: true,
      hasFloatingNav: false,
      gridRows: 'var(--shell-header-height) 1fr var(--shell-footer-height-default)',
      gridColumns: '1fr',
      mainPadding: {
        top: 'var(--space-5)',
        right: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
      },
      description: 'VP theme uses footer for navigation, no FloatingNav, 20px top padding',
    },
    ppm: {
      productName: 'Project Performance Management',
      logo: '/logos/PPMLogo.svg',
      components: [
        { name: 'ShellHeader', required: true, conditional: null },
        { name: 'LeftSidebar', required: true, conditional: null },
        { name: 'RightSidebar', required: true, conditional: null },
        { name: 'ShellPageHeader', required: false, conditional: 'When pageHeaderTitle is provided' },
        { name: 'ShellPanel', required: false, conditional: 'When leftPanel or rightPanel is provided' },
        { name: 'main', required: true, conditional: null },
        { name: 'ShellFooter', required: true, conditional: 'VP/PPM/Maconomy themes' },
      ],
      hasFooter: true,
      hasFloatingNav: false,
      gridRows: 'var(--shell-header-height) 1fr var(--shell-footer-height-default)',
      gridColumns: '1fr',
      mainPadding: {
        top: 'var(--space-5)',
        right: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
      },
      description: 'PPM theme uses footer for navigation, no FloatingNav, 20px top padding',
    },
    maconomy: {
      productName: 'Maconomy',
      logo: '/logos/MacLogo.svg',
      components: [
        { name: 'ShellHeader', required: true, conditional: null },
        { name: 'LeftSidebar', required: true, conditional: null },
        { name: 'RightSidebar', required: true, conditional: null },
        { name: 'ShellPageHeader', required: false, conditional: 'When pageHeaderTitle is provided' },
        { name: 'ShellPanel', required: false, conditional: 'When leftPanel or rightPanel is provided' },
        { name: 'main', required: true, conditional: null },
        { name: 'ShellFooter', required: true, conditional: 'VP/PPM/Maconomy themes' },
      ],
      hasFooter: true,
      hasFloatingNav: false,
      gridRows: 'var(--shell-header-height) 1fr var(--shell-footer-height-default)',
      gridColumns: '1fr',
      mainPadding: {
        top: 'var(--space-5)',
        right: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-default) + var(--space-5))',
      },
      description: 'Maconomy theme uses footer for navigation, no FloatingNav, 20px top padding',
    },
  };
}

/**
 * Build grid structure data
 */
function buildGridStructure() {
  return {
    withFooter: {
      rows: 'var(--shell-header-height) 1fr var(--shell-footer-height-default)',
      columns: '1fr',
      description: 'Used by VP, PPM, Maconomy themes',
    },
    withoutFooter: {
      rows: 'var(--shell-header-height) 1fr',
      columns: '1fr',
      description: 'Used by CP theme',
    },
  };
}

/**
 * Build positioning data
 */
function buildPositioning() {
  return {
    header: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: 'var(--z-50)',
      gridRow: '1',
      gridColumn: '1',
    },
    floatingNav: {
      position: 'fixed',
      top: 'var(--shell-header-height)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'var(--z-40)',
      conditional: 'CP theme only',
    },
    leftSidebar: {
      position: 'fixed',
      left: '0',
      zIndex: 'var(--z-45)',
    },
    rightSidebar: {
      position: 'fixed',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 'var(--z-45)',
    },
    main: {
      position: 'relative',
      gridRow: '2',
      gridColumn: '1',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      position: 'relative',
      gridRow: '3',
      gridColumn: '1',
      zIndex: 'var(--z-40)',
      conditional: 'VP/PPM/Maconomy themes only',
    },
    panels: {
      position: 'fixed',
      zIndex: 'var(--z-30)',
      conditional: 'Optional, when leftPanel or rightPanel props are provided',
    },
  };
}

/**
 * Build responsive behavior data
 */
function buildResponsive() {
  return {
    mobile: {
      breakpoint: 'var(--breakpoint-md)',
      maxWidth: '768px',
      changes: [
        'Hide left and right sidebars',
        'Adjust main padding to var(--shell-layout-padding-side-mobile) (16px)',
        'Maintain FloatingNav on CP theme',
        'Maintain footer on VP/PPM/Maconomy themes',
      ],
      mainPaddingWithFloatingNav: {
        top: 'var(--shell-layout-padding-top)',
        right: 'var(--shell-layout-padding-side-mobile)',
        bottom: 'var(--space-6)',
        left: 'var(--shell-layout-padding-side-mobile)',
      },
      mainPaddingWithoutFloatingNav: {
        top: 'var(--space-5)',
        right: 'var(--shell-layout-padding-side-mobile)',
        bottom: 'var(--space-6)',
        left: 'var(--shell-layout-padding-side-mobile)',
      },
    },
    tablet: {
      breakpoint: 'var(--breakpoint-lg)',
      maxWidth: '1024px',
      changes: [
        'Reduce side padding to var(--shell-layout-padding-side-tablet) (32px)',
        'Keep sidebars visible',
      ],
      mainPaddingWithFloatingNav: {
        top: 'var(--shell-layout-padding-top)',
        right: 'calc(var(--shell-layout-padding-side-tablet) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-tablet) + var(--space-5))',
      },
      mainPaddingWithoutFloatingNav: {
        top: 'var(--space-5)',
        right: 'calc(var(--shell-layout-padding-side-tablet) + var(--space-5))',
        bottom: 'var(--space-6)',
        left: 'calc(var(--shell-layout-padding-side-tablet) + var(--space-5))',
      },
    },
  };
}

/**
 * Build component dependencies
 */
function buildDependencies() {
  return [
    'ShellHeader',
    'ShellFooter',
    'LeftSidebar',
    'RightSidebar',
    'FloatingNav',
    'ShellPageHeader',
    'ShellPanel',
  ];
}

/**
 * Build slots data
 */
function buildSlots() {
  return {
    default: {
      name: 'default',
      location: 'main.shell-layout__main',
      description: 'Main page content area',
      required: true,
    },
  };
}

/**
 * Generate layout data
 */
function generateLayoutData() {
  console.log('🏗️  Generating layout MCP data...\n');

  // Extract data from source files
  console.log('📦 Extracting spacing tokens...');
  const spacingTokens = extractSpacingTokens();
  console.log(`✅ Extracted ${Object.keys(spacingTokens).length} spacing tokens\n`);

  console.log('📦 Extracting props...');
  const props = extractProps();
  console.log(`✅ Extracted ${Object.keys(props).length} props\n`);

  console.log('📦 Building theme composition...');
  const themeComposition = buildThemeComposition();
  console.log('✅ Built theme composition for 4 themes\n');

  // Build layout data structure
  const layoutData = {
    name: 'ShellLayout',
    type: 'layout',
    filePath: 'src/layouts/ShellLayout.astro',
    description: 'Complete application shell layout with theme-specific composition',

    props,
    dependencies: buildDependencies(),
    themeSupport: THEME_SUPPORT,

    themeComposition,
    spacingTokens,
    gridStructure: buildGridStructure(),
    positioning: buildPositioning(),
    responsive: buildResponsive(),
    slots: buildSlots(),

    usage: {
      importPath: './src/layouts/ShellLayout.astro',
      description: 'Use ShellLayout as the root layout for application pages',
      themeDetection: 'Layout automatically adapts based on theme-cp, theme-vp, theme-ppm, or theme-maconomy class on <html>',
      example: {
        cp: 'Apply class="theme-cp" to <html> for CP layout with FloatingNav',
        vp: 'Apply class="theme-vp" to <html> for VP layout with footer',
        ppm: 'Apply class="theme-ppm" to <html> for PPM layout with footer',
        maconomy: 'Apply class="theme-maconomy" to <html> for Maconomy layout with footer',
      },
    },

    _metadata: {
      lastGenerated: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Write layout data to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(layoutData, null, 2), 'utf-8');
  console.log(`✅ Layout data written to: ${OUTPUT_FILE}\n`);

  return layoutData;
}

// Run generation
try {
  const result = generateLayoutData();
  console.log('='.repeat(50));
  console.log('📊 Generation Summary:');
  console.log(`   Layout: ${result.name}`);
  console.log(`   Themes: ${result.themeSupport.themes.join(', ')}`);
  console.log(`   Props: ${Object.keys(result.props).length}`);
  console.log(`   Dependencies: ${result.dependencies.length}`);
  console.log(`   Spacing Tokens: ${Object.keys(result.spacingTokens).length}`);
  console.log('='.repeat(50));
  console.log('\n✨ Layout data generation complete!\n');
} catch (error) {
  console.error('\n❌ Layout data generation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
