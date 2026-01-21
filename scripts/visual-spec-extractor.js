/**
 * Visual Specifications Extractor
 * Combines CSS parsing with component data to generate complete visual specs
 */

import {
  extractSizeVariants,
  extractVariantColors,
  extractThemeOverrides,
  extractComponentStyles,
  getResolvedValue
} from './css-parser.js';

/**
 * Recursively resolve all var() references in an object structure
 */
function resolveAllVarReferences(obj, variableMap, context = 'cp-light') {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If it's a string and contains var(), resolve it
    if (obj.includes('var(')) {
      return getResolvedValue(obj, variableMap, context);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveAllVarReferences(item, variableMap, context));
  }

  if (typeof obj === 'object') {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveAllVarReferences(value, variableMap, context);
    }
    return resolved;
  }

  return obj;
}

/**
 * Extract complete visual specifications for a component
 */
export function extractVisualSpecifications(componentData, parsedCSS, variableMap) {
  const componentName = componentData.name;

  // Extract base specifications
  const sizeVariants = extractSizeVariants(componentName, parsedCSS, variableMap);
  const variantColors = extractVariantColors(componentName, parsedCSS, variableMap);
  const themeOverrides = extractThemeOverrides(componentName, parsedCSS, variableMap);
  const componentStyles = extractComponentStyles(componentName, componentData.cssClasses || [], parsedCSS, variableMap);

  // Build visual specifications structure
  const visualSpecs = {
    dimensions: buildDimensions(sizeVariants, variableMap),
    spacing: buildSpacing(sizeVariants, componentStyles, variableMap),
    typography: buildTypography(sizeVariants, componentStyles, variableMap),
    borders: buildBorders(componentStyles, variableMap),
    colors: buildColors(variantColors, componentStyles, variableMap),
    elevation: buildElevation(componentStyles, variableMap),
    transitions: buildTransitions(componentStyles, variableMap),
    layout: buildLayout(componentStyles),
    iconSpecs: buildIconSpecs(sizeVariants, componentName)
  };

  // Build theme-specific overrides
  const themeOverridesFormatted = buildThemeOverrides(themeOverrides, sizeVariants, componentName);

  // Build accessibility specs
  const accessibility = buildAccessibility(componentName, componentData);

  // Build CSS class styles mapping
  const cssClassStyles = buildCSSClassStyles(componentStyles, variableMap);

  // Final resolution pass: ensure all var() references are resolved
  const resolvedVisualSpecs = resolveAllVarReferences(visualSpecs, variableMap);
  const resolvedThemeOverrides = resolveAllVarReferences(themeOverridesFormatted, variableMap);
  const resolvedCssClassStyles = resolveAllVarReferences(cssClassStyles, variableMap);

  return {
    visualSpecifications: resolvedVisualSpecs,
    themeOverrides: resolvedThemeOverrides,
    accessibility,
    cssClassStyles: resolvedCssClassStyles
  };
}

/**
 * Build dimensions object
 */
function buildDimensions(sizeVariants, variableMap) {
  const dimensions = {};

  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const sizeData = sizeVariants[size];
    dimensions[size] = {
      height: sizeData.height?.resolved || null,
      width: sizeData.width?.resolved || null,
      minWidth: sizeData['min-width']?.resolved || 'auto',
      maxWidth: sizeData['max-width']?.resolved || 'none'
    };
  }

  return dimensions;
}

/**
 * Build spacing object
 */
function buildSpacing(sizeVariants, componentStyles, variableMap) {
  const spacing = {};

  // Check if any size variants have data
  const hasSizeVariants = ['xs', 'sm', 'md', 'lg'].some(size => 
    Object.keys(sizeVariants[size] || {}).length > 0
  );

  // Extract base padding/margin from component styles if size variants are empty
  let basePadding = null;
  let baseGap = null;
  
  if (!hasSizeVariants) {
    // Look for padding in base component classes (e.g., .accordion__trigger)
    for (const [selector, styles] of Object.entries(componentStyles)) {
      // Only check base selectors (not size variants or state modifiers)
      if (!selector.includes('--') && !selector.includes(':')) {
        if (styles.padding) {
          basePadding = styles.padding.light || styles.padding.raw;
        }
        if (styles.gap) {
          baseGap = styles.gap.light || styles.gap.raw;
        }
        // Also check padding-top, padding-right, etc.
        if (styles['padding-top']) {
          basePadding = basePadding || (styles['padding-top'].light || styles['padding-top'].raw);
        }
      }
    }
  }

  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const sizeData = sizeVariants[size];
    let padding = sizeData.padding?.resolved;
    let gap = sizeData.gap?.resolved;

    // If size variant is empty, use base values
    if (!padding && basePadding) {
      padding = basePadding;
    }
    if (!gap && baseGap) {
      gap = baseGap;
    }

    padding = padding || '0';
    gap = gap || '0';

    // Parse padding (could be "0 16px" or just "16px")
    const paddingParts = padding.split(' ').filter(p => p);
    
    spacing[size] = {
      paddingTop: paddingParts[0] || '0',
      paddingRight: paddingParts[1] || paddingParts[0] || '0',
      paddingBottom: paddingParts[2] || paddingParts[0] || '0',
      paddingLeft: paddingParts[3] || paddingParts[1] || paddingParts[0] || '0',
      gap: gap
    };
  }

  return spacing;
}

/**
 * Build typography object
 */
function buildTypography(sizeVariants, componentStyles, variableMap) {
  const typography = {
    fontFamily: null,
    fontWeight: null,
    lineHeight: null,
    letterSpacing: null,
    textTransform: null,
    sizes: {}
  };

  // Extract from base styles
  for (const [selector, styles] of Object.entries(componentStyles)) {
    if (styles['font-family']) {
      typography.fontFamily = styles['font-family'].light || styles['font-family'].raw;
    }
    if (styles['font-weight']) {
      typography.fontWeight = styles['font-weight'].light || styles['font-weight'].raw;
    }
    if (styles['line-height']) {
      typography.lineHeight = styles['line-height'].light || styles['line-height'].raw;
    }
    if (styles['letter-spacing']) {
      typography.letterSpacing = styles['letter-spacing'].light || styles['letter-spacing'].raw;
    }
    if (styles['text-transform']) {
      typography.textTransform = styles['text-transform'].light || styles['text-transform'].raw;
    }
  }

  // Check if any size variants have font-size data
  const hasSizeVariants = ['xs', 'sm', 'md', 'lg'].some(size => 
    sizeVariants[size]?.['font-size']?.resolved
  );

  // Extract base font-size from component styles if size variants are empty
  let baseFontSize = null;
  if (!hasSizeVariants) {
    // Look for font-size in base component classes (e.g., .accordion__trigger)
    for (const [selector, styles] of Object.entries(componentStyles)) {
      // Only check base selectors (not size variants or state modifiers)
      if (!selector.includes('--') && !selector.includes(':')) {
        if (styles['font-size']) {
          baseFontSize = styles['font-size'].light || styles['font-size'].raw;
          break; // Use first found font-size
        }
      }
    }
  }

  // Extract size-specific typography
  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const sizeData = sizeVariants[size];
    let fontSize = sizeData['font-size']?.resolved;
    
    // If size variant is empty, use base font-size
    if (!fontSize && baseFontSize) {
      fontSize = baseFontSize;
    }
    
    typography.sizes[size] = {
      fontSize: fontSize || null,
      lineHeight: sizeData['line-height']?.resolved || typography.lineHeight
    };
  }

  return typography;
}

/**
 * Build borders object
 */
function buildBorders(componentStyles, variableMap) {
  const borders = {
    width: null,
    style: null,
    radius: {}
  };

  // Extract from styles
  for (const [selector, styles] of Object.entries(componentStyles)) {
    if (styles['border-width']) {
      borders.width = styles['border-width'].light || styles['border-width'].raw;
    }
    if (styles['border-style']) {
      borders.style = styles['border-style'].light || styles['border-style'].raw;
    }
    if (styles['border-radius']) {
      const radius = styles['border-radius'].light || styles['border-radius'].raw;
      // Try to map to size variants
      if (selector.includes('--xs')) borders.radius.xs = radius;
      else if (selector.includes('--sm')) borders.radius.sm = radius;
      else if (selector.includes('--md')) borders.radius.md = radius;
      else if (selector.includes('--lg')) borders.radius.lg = radius;
      else borders.radius.default = radius;
    }
  }

  return borders;
}

/**
 * Build colors object (most complex - includes all variants and states)
 */
function buildColors(variantColors, componentStyles, variableMap) {
  const colors = {
    variants: {}
  };

  // Map variant colors to structure
  for (const [variantName, modeData] of Object.entries(variantColors)) {
    colors.variants[variantName] = {
      light: {},
      dark: {}
    };

    // Map states for light mode
    for (const [state, props] of Object.entries(modeData.light)) {
      colors.variants[variantName].light[state] = {
        background: props['background-color'] || props['background'] || 'transparent',
        text: props['color'] || null,
        border: props['border-color'] || props['border'] || 'transparent',
        iconColor: props['color'] || null
      };

      // Add state-specific properties
      if (state === 'focus') {
        colors.variants[variantName].light[state].outline = props['outline'] || props['box-shadow'] || null;
        colors.variants[variantName].light[state].outlineOffset = props['outline-offset'] || '2px';
      }
      if (state === 'disabled') {
        colors.variants[variantName].light[state].cursor = props['cursor'] || 'not-allowed';
        colors.variants[variantName].light[state].opacity = props['opacity'] || '1';
      }
    }

    // Map states for dark mode
    for (const [state, props] of Object.entries(modeData.dark)) {
      colors.variants[variantName].dark[state] = {
        background: props['background-color'] || props['background'] || 'transparent',
        text: props['color'] || null,
        border: props['border-color'] || props['border'] || 'transparent',
        iconColor: props['color'] || null
      };

      // Add state-specific properties
      if (state === 'focus') {
        colors.variants[variantName].dark[state].outline = props['outline'] || props['box-shadow'] || null;
        colors.variants[variantName].dark[state].outlineOffset = props['outline-offset'] || '2px';
      }
      if (state === 'disabled') {
        colors.variants[variantName].dark[state].cursor = props['cursor'] || 'not-allowed';
        colors.variants[variantName].dark[state].opacity = props['opacity'] || '1';
      }
    }
  }

  return colors;
}

/**
 * Build elevation object
 */
function buildElevation(componentStyles, variableMap) {
  const elevation = {
    default: 'none',
    hover: null,
    active: null,
    focus: null
  };

  for (const [selector, styles] of Object.entries(componentStyles)) {
    if (styles['box-shadow']) {
      const shadow = styles['box-shadow'].light || styles['box-shadow'].raw;
      
      if (selector.includes(':hover')) {
        elevation.hover = shadow;
      } else if (selector.includes(':active')) {
        elevation.active = shadow;
      } else if (selector.includes(':focus')) {
        elevation.focus = shadow;
      } else {
        elevation.default = shadow !== 'none' ? shadow : elevation.default;
      }
    }
  }

  return elevation;
}

/**
 * Build transitions object
 */
function buildTransitions(componentStyles, variableMap) {
  const transitions = {
    default: null,
    properties: {}
  };

  for (const [selector, styles] of Object.entries(componentStyles)) {
    if (styles['transition']) {
      const transition = styles['transition'].light || styles['transition'].raw;
      transitions.default = transition;
      
      // Parse transition properties
      const parts = transition.split(',').map(p => p.trim());
      for (const part of parts) {
        const [prop, ...rest] = part.split(' ');
        if (prop !== 'all') {
          transitions.properties[prop] = part;
        }
      }
    }
  }

  return transitions;
}

/**
 * Build layout object
 */
function buildLayout(componentStyles) {
  const layout = {};

  for (const [selector, styles] of Object.entries(componentStyles)) {
    // Only get base layout properties (not size/state specific)
    if (!selector.includes('--') && !selector.includes(':')) {
      if (styles['display']) layout.display = styles['display'].light || styles['display'].raw;
      if (styles['align-items']) layout.alignItems = styles['align-items'].light || styles['align-items'].raw;
      if (styles['justify-content']) layout.justifyContent = styles['justify-content'].light || styles['justify-content'].raw;
      if (styles['flex-direction']) layout.flexDirection = styles['flex-direction'].light || styles['flex-direction'].raw;
      if (styles['flex-shrink']) layout.flexShrink = styles['flex-shrink'].light || styles['flex-shrink'].raw;
      if (styles['position']) layout.position = styles['position'].light || styles['position'].raw;
      if (styles['vertical-align']) layout.verticalAlign = styles['vertical-align'].light || styles['vertical-align'].raw;
    }
  }

  return layout;
}

/**
 * Build icon specs object
 */
function buildIconSpecs(sizeVariants, componentName) {
  // Check if component uses icons
  const hasIcons = componentName === 'Button' || componentName === 'Input' || 
                   componentName === 'Alert' || componentName === 'Icon';

  if (!hasIcons) return null;

  const iconSpecs = {
    sizes: {},
    position: {
      left: { marginRight: 'gap' },
      right: { marginLeft: 'gap' }
    }
  };

  // Icon sizes typically match or are slightly smaller than font size
  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const fontSize = sizeVariants[size]['font-size']?.resolved;
    if (fontSize) {
      // Convert rem to px for icon size (16px = 1rem base)
      const match = fontSize.match(/(\d+\.?\d*)(rem|px)/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        const pxValue = unit === 'rem' ? value * 16 : value;
        iconSpecs.sizes[size] = `${pxValue}px`;
      }
    }
  }

  return iconSpecs;
}

/**
 * Build theme overrides (CP vs others)
 */
function buildThemeOverrides(themeOverrides, sizeVariants, componentName) {
  const formatted = {};

  // Special handling for CP theme compact sizing
  if (componentName === 'Button' || componentName === 'Input' || componentName === 'ShellHeader') {
    formatted.cp = {
      description: 'CP theme uses compact sizing',
      dimensions: {
        xs: { height: '20px', minWidth: '48px' },
        sm: { height: '24px', minWidth: '56px' },
        md: { height: '28px', minWidth: '64px' },
        lg: { height: '32px', minWidth: '72px' }
      },
      spacing: {
        xs: { paddingTop: '2px', paddingRight: '8px', paddingBottom: '2px', paddingLeft: '8px', gap: '4px' },
        sm: { paddingTop: '3px', paddingRight: '10px', paddingBottom: '3px', paddingLeft: '10px', gap: '4px' },
        md: { paddingTop: '4px', paddingRight: '12px', paddingBottom: '4px', paddingLeft: '12px', gap: '6px' },
        lg: { paddingTop: '6px', paddingRight: '16px', paddingBottom: '6px', paddingLeft: '16px', gap: '6px' }
      },
      typography: {
        sizes: {
          xs: { fontSize: '11px', lineHeight: '14px' },
          sm: { fontSize: '12px', lineHeight: '16px' },
          md: { fontSize: '13px', lineHeight: '18px' },
          lg: { fontSize: '14px', lineHeight: '20px' }
        }
      }
    };
  }

  // Add any extracted theme overrides
  for (const [theme, styles] of Object.entries(themeOverrides)) {
    if (Object.keys(styles).length > 0) {
      if (!formatted[theme]) formatted[theme] = {};
      formatted[theme].customStyles = styles;
    }
  }

  return formatted;
}

/**
 * Build accessibility object
 */
function buildAccessibility(componentName, componentData) {
  const accessibility = {
    role: null,
    tabIndex: null,
    keyboardSupport: {},
    ariaAttributes: {},
    focusVisible: {}
  };

  // Component-specific accessibility specs
  if (componentName === 'Button') {
    accessibility.role = 'button';
    accessibility.tabIndex = 0;
    accessibility.keyboardSupport = {
      Enter: 'activates button',
      Space: 'activates button'
    };
    accessibility.ariaAttributes = {
      'aria-disabled': 'true when disabled',
      'aria-busy': 'true when loading',
      'aria-label': 'required if icon-only'
    };
  } else if (componentName === 'Input') {
    accessibility.role = 'textbox';
    accessibility.ariaAttributes = {
      'aria-invalid': 'true when error',
      'aria-describedby': 'links to helper/error text',
      'aria-required': 'true when required'
    };
  } else if (componentName === 'Checkbox') {
    accessibility.role = 'checkbox';
    accessibility.tabIndex = 0;
    accessibility.keyboardSupport = {
      Space: 'toggles checkbox'
    };
    accessibility.ariaAttributes = {
      'aria-checked': 'true, false, or mixed',
      'aria-disabled': 'true when disabled'
    };
  } else if (componentName === 'RadioButton') {
    accessibility.role = 'radio';
    accessibility.tabIndex = 0;
    accessibility.keyboardSupport = {
      Space: 'selects radio',
      ArrowUp: 'focuses previous radio in group',
      ArrowDown: 'focuses next radio in group'
    };
    accessibility.ariaAttributes = {
      'aria-checked': 'true or false',
      'aria-disabled': 'true when disabled'
    };
  } else if (componentName === 'Dialog') {
    accessibility.role = 'dialog';
    accessibility.ariaAttributes = {
      'aria-modal': 'true',
      'aria-labelledby': 'references dialog title',
      'aria-describedby': 'references dialog description'
    };
    accessibility.keyboardSupport = {
      Escape: 'closes dialog',
      Tab: 'moves focus within dialog (trapped)'
    };
  }

  return accessibility;
}

/**
 * Build CSS class styles mapping
 */
function buildCSSClassStyles(componentStyles, variableMap) {
  const cssClassStyles = {};

  for (const [selector, styles] of Object.entries(componentStyles)) {
    // Clean selector for output
    const cleanSelector = selector.trim();
    
    cssClassStyles[cleanSelector] = {};
    
    for (const [prop, value] of Object.entries(styles)) {
      // Use light mode resolved value as default
      cssClassStyles[cleanSelector][prop] = value.light || value.raw;
    }
  }

  return cssClassStyles;
}
