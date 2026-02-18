/**
 * DEPRECATED for canonical spec data. The canonical format uses `specs` in each
 * component JSON (authored manually or via scripts/migrate-to-canonical-json.js);
 * get_specs reads specs and guidance directly. Do not use this extractor to feed
 * exact-build data. See docs/SPEC_CONTRACT.md.
 *
 * Legacy: Visual Specifications Extractor - combines CSS parsing with component
 * data to generate visualSpecifications. Not used for canonical spec.
 */

import {
  extractSizeVariants,
  extractVariantColors,
  extractComponentStyles,
  getResolvedValue
} from './css-parser.js';

/**
 * Recursively resolve all var() references in an object structure
 * Handles nested objects, arrays, and ensures all var() references are resolved
 */
function resolveAllVarReferences(obj, variableMap, context = 'cp-light') {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // If it's a string and contains var(), resolve it
    if (obj.includes('var(')) {
      const resolved = getResolvedValue(obj, variableMap, context);
      // If still contains var(), try with different context
      if (resolved.includes('var(') && context !== 'light') {
        return getResolvedValue(resolved, variableMap, 'light');
      }
      return resolved;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveAllVarReferences(item, variableMap, context));
  }

  if (typeof obj === 'object') {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip metadata keys that shouldn't be resolved
      if (key.startsWith('_')) {
        resolved[key] = value;
      } else {
        resolved[key] = resolveAllVarReferences(value, variableMap, context);
      }
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
  const variantColors = extractVariantColors(componentName, parsedCSS, variableMap, componentData.props || {});
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
    layout: buildLayout(componentStyles, variableMap),
    iconSpecs: buildIconSpecs(sizeVariants, componentName, componentData)
  };

  // Build accessibility specs
  const accessibility = buildAccessibility(componentName, componentData);

  // Build CSS class styles mapping (tokens preserved so get_specs and build_component align)
  const cssClassStyles = buildCSSClassStyles(componentStyles, variableMap);

  // Final resolution pass: ensure all var() references are resolved in visualSpecs only
  const resolvedVisualSpecs = resolveAllVarReferences(visualSpecs, variableMap);
  // Do not resolve cssClassStyles; keep design tokens (var(--space-*), var(--radius-*), etc.) as-is

  // Extract available variants for metadata
  const availableVariants = Object.keys(resolvedVisualSpecs.colors?.variants || {});

  // Build variant index for easy theme+variant queries
  const variantIndex = buildVariantIndex(resolvedVisualSpecs.colors);

  return {
    visualSpecifications: resolvedVisualSpecs,
    accessibility,
    cssClassStyles,
    _variantIndex: variantIndex,
    _variantMetadata: {
      availableVariants,
      // Note: MCPs should use filterVisualSpecsByVariant() helper function
      // to filter visualSpecifications when a variant is requested
      // Or use _variantIndex["theme-variant"] for direct access
    }
  };
}

/**
 * Filter visual specifications to only include a specific variant
 * This helper makes it easy for MCPs to extract variant-specific data
 * 
 * Usage in MCP:
 * const filteredSpecs = filterVisualSpecsByVariant(component.visualSpecifications, 'secondary');
 * 
 * @param {Object} visualSpecs - Full visualSpecifications object
 * @param {string} variantName - Name of the variant to filter (e.g., 'secondary')
 * @returns {Object} Filtered visualSpecifications with only the requested variant
 */
export function filterVisualSpecsByVariant(visualSpecs, variantName) {
  if (!visualSpecs || !variantName) {
    return visualSpecs;
  }

  const variantData = visualSpecs.colors?.variants?.[variantName];
  if (!variantData) {
    // Variant doesn't exist, return original specs
    return visualSpecs;
  }

  // Create filtered visual specifications with only the requested variant
  return {
    ...visualSpecs,
    colors: {
      ...visualSpecs.colors,
      variants: {
        [variantName]: variantData
      }
    }
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
          // Ensure it's resolved
          if (basePadding && basePadding.includes('var(')) {
            basePadding = getResolvedValue(basePadding, variableMap, 'cp-light');
          }
        }
        if (styles.gap) {
          baseGap = styles.gap.light || styles.gap.raw;
          // Ensure it's resolved
          if (baseGap && baseGap.includes('var(')) {
            baseGap = getResolvedValue(baseGap, variableMap, 'cp-light');
          }
        }
        // Also check padding-top, padding-right, etc.
        if (styles['padding-top']) {
          let paddingTop = styles['padding-top'].light || styles['padding-top'].raw;
          if (paddingTop && paddingTop.includes('var(')) {
            paddingTop = getResolvedValue(paddingTop, variableMap, 'cp-light');
          }
          basePadding = basePadding || paddingTop;
        }
      }
    }
  }

  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const sizeData = sizeVariants[size];
    let padding = sizeData.padding?.resolved;
    let gap = sizeData.gap?.resolved;

    // Ensure values are fully resolved
    if (padding && padding.includes('var(')) {
      padding = getResolvedValue(padding, variableMap, 'cp-light');
    }
    if (gap && gap.includes('var(')) {
      gap = getResolvedValue(gap, variableMap, 'cp-light');
    }

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
      let fontFamily = styles['font-family'].light || styles['font-family'].raw;
      if (fontFamily && fontFamily.includes('var(')) {
        fontFamily = getResolvedValue(fontFamily, variableMap, 'cp-light');
      }
      typography.fontFamily = fontFamily;
    }
    if (styles['font-weight']) {
      let fontWeight = styles['font-weight'].light || styles['font-weight'].raw;
      if (fontWeight && fontWeight.includes('var(')) {
        fontWeight = getResolvedValue(fontWeight, variableMap, 'cp-light');
      }
      typography.fontWeight = fontWeight;
    }
    if (styles['line-height']) {
      let lineHeight = styles['line-height'].light || styles['line-height'].raw;
      if (lineHeight && lineHeight.includes('var(')) {
        lineHeight = getResolvedValue(lineHeight, variableMap, 'cp-light');
      }
      typography.lineHeight = lineHeight;
    }
    if (styles['letter-spacing']) {
      let letterSpacing = styles['letter-spacing'].light || styles['letter-spacing'].raw;
      if (letterSpacing && letterSpacing.includes('var(')) {
        letterSpacing = getResolvedValue(letterSpacing, variableMap, 'cp-light');
      }
      typography.letterSpacing = letterSpacing;
    }
    if (styles['text-transform']) {
      let textTransform = styles['text-transform'].light || styles['text-transform'].raw;
      if (textTransform && textTransform.includes('var(')) {
        textTransform = getResolvedValue(textTransform, variableMap, 'cp-light');
      }
      typography.textTransform = textTransform;
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
          // Ensure it's resolved
          if (baseFontSize && baseFontSize.includes('var(')) {
            baseFontSize = getResolvedValue(baseFontSize, variableMap, 'cp-light');
          }
          break; // Use first found font-size
        }
      }
    }
  }

  // Extract size-specific typography
  for (const size of ['xs', 'sm', 'md', 'lg']) {
    const sizeData = sizeVariants[size];
    let fontSize = sizeData['font-size']?.resolved;
    
    // Ensure fontSize is fully resolved
    if (fontSize && fontSize.includes('var(')) {
      fontSize = getResolvedValue(fontSize, variableMap, 'cp-light');
    }
    
    // If size variant is empty, use base font-size
    if (!fontSize && baseFontSize) {
      fontSize = baseFontSize;
    }
    
    let lineHeight = sizeData['line-height']?.resolved || typography.lineHeight;
    // Ensure lineHeight is fully resolved
    if (lineHeight && lineHeight.includes('var(')) {
      lineHeight = getResolvedValue(lineHeight, variableMap, 'cp-light');
    }
    
    typography.sizes[size] = {
      fontSize: fontSize || null,
      lineHeight: lineHeight
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
      let width = styles['border-width'].light || styles['border-width'].raw;
      if (width && width.includes('var(')) {
        width = getResolvedValue(width, variableMap, 'cp-light');
      }
      borders.width = width;
    }
    if (styles['border-style']) {
      let style = styles['border-style'].light || styles['border-style'].raw;
      if (style && style.includes('var(')) {
        style = getResolvedValue(style, variableMap, 'cp-light');
      }
      borders.style = style;
    }
    if (styles['border-radius']) {
      let radius = styles['border-radius'].light || styles['border-radius'].raw;
      // Ensure no var() references remain
      if (radius && radius.includes('var(')) {
        radius = getResolvedValue(radius, variableMap, 'cp-light');
      }
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
 * Structure: variants[variantName][theme][mode][state]
 * 
 * Enhanced to handle CSS inheritance: missing properties inherit from default state
 */
function buildColors(variantColors, componentStyles, variableMap) {
  const colors = {
    variants: {}
  };

  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  const stateOrder = ['default', 'hover', 'active', 'focus', 'disabled'];

  // Map variant colors to structure
  // variantColors structure: variants[variantName][theme][mode][state]
  for (const [variantName, themeData] of Object.entries(variantColors)) {
    colors.variants[variantName] = {};

    // Process each theme
    for (const theme of themes) {
      if (!themeData[theme]) {
        // If theme data doesn't exist, skip it
        continue;
      }

      colors.variants[variantName][theme] = {
        light: {},
        dark: {}
      };

      // Helper function to build a state (without inheritance - will be applied in second pass)
      const buildState = (state, props) => {
        const stateData = {
          background: props['background-color'] || props['background'] || 'transparent',
          text: props['color'] !== undefined ? props['color'] : null,
          border: props['border-color'] || props['border'] || 'transparent',
          iconColor: props['color'] !== undefined ? props['color'] : null
        };

        // Add state-specific properties (these should NOT inherit)
        if (state === 'focus') {
          stateData.outline = props['outline'] || props['box-shadow'] || null;
          stateData.outlineOffset = props['outline-offset'] || '2px';
        }
        if (state === 'disabled') {
          stateData.cursor = props['cursor'] || 'not-allowed';
          stateData.opacity = props['opacity'] || '1';
        }

        return stateData;
      };

      // Build light mode states with inheritance
      const lightStates = themeData[theme].light || {};
      
      // First, build the default state
      let lightDefaultState = null;
      if (lightStates['default']) {
        lightDefaultState = buildState('default', lightStates['default']);
        colors.variants[variantName][theme].light['default'] = lightDefaultState;
      }
      
      // Then build other states with inheritance
      for (const [state, props] of Object.entries(lightStates)) {
        if (state !== 'default') {
          const stateData = buildState(state, props);
          
          // Apply inheritance from default state
          if (lightDefaultState && lightDefaultState.text !== undefined && lightDefaultState.text !== null) {
            // Inherit text/iconColor if color property doesn't exist in original CSS props
            const hasColorProp = 'color' in props;
            if (!hasColorProp) {
              stateData.text = lightDefaultState.text;
              stateData.iconColor = lightDefaultState.iconColor !== undefined && lightDefaultState.iconColor !== null 
                ? lightDefaultState.iconColor 
                : lightDefaultState.text;
            }
          }
          // Inherit background if not explicitly set
          if (!('background-color' in props || 'background' in props)) {
            if (lightDefaultState && lightDefaultState.background && lightDefaultState.background !== 'transparent') {
              stateData.background = lightDefaultState.background;
            }
          }
          // Inherit border if not explicitly set
          if (!('border-color' in props || 'border' in props)) {
            if (lightDefaultState && lightDefaultState.border && lightDefaultState.border !== 'transparent') {
              stateData.border = lightDefaultState.border;
            }
          }
          
          colors.variants[variantName][theme].light[state] = stateData;
        }
      }

      // Build dark mode states with inheritance
      const darkStates = themeData[theme].dark || {};
      
      // First, build the default state
      let darkDefaultState = null;
      if (darkStates['default']) {
        darkDefaultState = buildState('default', darkStates['default']);
        colors.variants[variantName][theme].dark['default'] = darkDefaultState;
      }
      
      // Then build other states with inheritance
      for (const [state, props] of Object.entries(darkStates)) {
        if (state !== 'default') {
          const stateData = buildState(state, props);
          
          // Apply inheritance from default state
          if (darkDefaultState && darkDefaultState.text !== undefined && darkDefaultState.text !== null) {
            // Inherit text/iconColor if color property doesn't exist in original CSS props
            if (!('color' in props)) {
              stateData.text = darkDefaultState.text;
              stateData.iconColor = darkDefaultState.iconColor !== undefined && darkDefaultState.iconColor !== null 
                ? darkDefaultState.iconColor 
                : darkDefaultState.text;
            }
          }
          // Inherit background if not explicitly set
          if (!('background-color' in props || 'background' in props)) {
            if (darkDefaultState && darkDefaultState.background && darkDefaultState.background !== 'transparent') {
              stateData.background = darkDefaultState.background;
            }
          }
          // Inherit border if not explicitly set
          if (!('border-color' in props || 'border' in props)) {
            if (darkDefaultState && darkDefaultState.border && darkDefaultState.border !== 'transparent') {
              stateData.border = darkDefaultState.border;
            }
          }
          
          colors.variants[variantName][theme].dark[state] = stateData;
        }
      }
    }
  }

  return colors;
}

/**
 * Build variant index for easy theme+variant queries
 * Creates a queryable index structure: _variantIndex["theme-variant"] = { variant, theme, light, dark }
 * 
 * @param {Object} colors - The colors object with variants structure
 * @returns {Object} Variant index with theme+variant keys
 */
function buildVariantIndex(colors) {
  const variantIndex = {};
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];

  // If no variants exist, return empty index
  if (!colors?.variants || Object.keys(colors.variants).length === 0) {
    return variantIndex;
  }

  // Iterate through all variants
  for (const [variantName, variantData] of Object.entries(colors.variants)) {
    // Iterate through all themes
    for (const theme of themes) {
      // Check if this theme exists for this variant
      if (variantData[theme]) {
        // Create index key: "theme-variant" (e.g., "cp-secondary")
        const indexKey = `${theme}-${variantName}`;
        
        // Build index entry with both light and dark modes
        variantIndex[indexKey] = {
          variant: variantName,
          theme: theme,
          light: variantData[theme].light || {},
          dark: variantData[theme].dark || {}
        };
      }
    }
  }

  return variantIndex;
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
      // Use resolved light value, and ensure it's fully resolved
      let shadow = styles['box-shadow'].light || styles['box-shadow'].raw;
      // Ensure no var() references remain
      if (shadow && shadow.includes('var(')) {
        shadow = getResolvedValue(shadow, variableMap, 'cp-light');
      }
      
      if (selector.includes(':hover')) {
        elevation.hover = shadow;
      } else if (selector.includes(':active')) {
        elevation.active = shadow;
      } else if (selector.includes(':focus') || selector.includes(':focus-visible')) {
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
      let transition = styles['transition'].light || styles['transition'].raw;
      // Ensure it's fully resolved
      if (transition && transition.includes('var(')) {
        transition = getResolvedValue(transition, variableMap, 'cp-light');
      }
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
function buildLayout(componentStyles, variableMap) {
  const layout = {};

  for (const [selector, styles] of Object.entries(componentStyles)) {
    // Only get base layout properties (not size/state specific)
    if (!selector.includes('--') && !selector.includes(':')) {
      if (styles['display']) {
        let display = styles['display'].light || styles['display'].raw;
        if (display && display.includes('var(')) {
          display = getResolvedValue(display, variableMap, 'cp-light');
        }
        layout.display = display;
      }
      if (styles['align-items']) {
        let alignItems = styles['align-items'].light || styles['align-items'].raw;
        if (alignItems && alignItems.includes('var(')) {
          alignItems = getResolvedValue(alignItems, variableMap, 'cp-light');
        }
        layout.alignItems = alignItems;
      }
      if (styles['justify-content']) {
        let justifyContent = styles['justify-content'].light || styles['justify-content'].raw;
        if (justifyContent && justifyContent.includes('var(')) {
          justifyContent = getResolvedValue(justifyContent, variableMap, 'cp-light');
        }
        layout.justifyContent = justifyContent;
      }
      if (styles['flex-direction']) {
        let flexDirection = styles['flex-direction'].light || styles['flex-direction'].raw;
        if (flexDirection && flexDirection.includes('var(')) {
          flexDirection = getResolvedValue(flexDirection, variableMap, 'cp-light');
        }
        layout.flexDirection = flexDirection;
      }
      if (styles['flex-shrink']) {
        let flexShrink = styles['flex-shrink'].light || styles['flex-shrink'].raw;
        if (flexShrink && flexShrink.includes('var(')) {
          flexShrink = getResolvedValue(flexShrink, variableMap, 'cp-light');
        }
        layout.flexShrink = flexShrink;
      }
      if (styles['position']) {
        let position = styles['position'].light || styles['position'].raw;
        if (position && position.includes('var(')) {
          position = getResolvedValue(position, variableMap, 'cp-light');
        }
        layout.position = position;
      }
      if (styles['vertical-align']) {
        let verticalAlign = styles['vertical-align'].light || styles['vertical-align'].raw;
        if (verticalAlign && verticalAlign.includes('var(')) {
          verticalAlign = getResolvedValue(verticalAlign, variableMap, 'cp-light');
        }
        layout.verticalAlign = verticalAlign;
      }
    }
  }

  return layout;
}

/**
 * Build icon specs object.
 * Returns null when the component does not use the shared Icon component (no import).
 * iconSpecs (sizes + position) are only set when componentName === 'Icon' or dependencies include 'Icon'.
 */
function buildIconSpecs(sizeVariants, componentName, componentData) {
  const dependencies = componentData?.dependencies || [];
  const hasIcons = componentName === 'Icon' || dependencies.includes('Icon');

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
    const fontSize = sizeVariants[size]?.['font-size']?.resolved;
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
  } else if (componentName === 'Accordion') {
    accessibility.ariaAttributes = {
      'aria-expanded': 'true/false on trigger (button)',
      'aria-controls': 'id of panel controlled by trigger',
      'role': 'region on panel',
      'id': 'panel id linked by aria-controls'
    };
    accessibility.keyboardSupport = {
      Enter: 'activates trigger (native button)',
      Space: 'activates trigger (native button)'
    };
  } else if (componentName === 'Alert') {
    accessibility.role = 'alert';
    accessibility.ariaAttributes = {
      'aria-label': 'Dismiss on close button when dismissible'
    };
  } else if (componentName === 'Dropdown') {
    accessibility.ariaAttributes = {
      'aria-haspopup': 'listbox',
      'aria-expanded': 'true/false when open',
      'role': 'listbox on menu, option on items',
      'aria-selected': 'true/false on selected option'
    };
  } else if (componentName === 'TabStrip') {
    accessibility.role = 'tablist';
    accessibility.ariaAttributes = {
      'aria-label': 'Tabs on nav',
      'role': 'tab on each tab',
      'aria-selected': 'true/false on active tab',
      'aria-disabled': 'true when tab disabled',
      'aria-expanded': 'on overflow button',
      'aria-haspopup': 'on overflow button'
    };
    accessibility.keyboardSupport = {
      ArrowLeft: 'previous tab',
      ArrowRight: 'next tab',
      Home: 'first tab',
      End: 'last tab'
    };
  } else if (componentName === 'PickerPopup') {
    accessibility.role = 'dialog';
    accessibility.ariaAttributes = {
      'aria-modal': 'true',
      'aria-labelledby': 'references title when present',
      'aria-label': 'Close picker on close button'
    };
  } else if (componentName === 'Step') {
    accessibility.role = 'group';
    accessibility.ariaAttributes = {
      'aria-label': 'Step with step id',
      'aria-hidden': 'true on indicator and connector'
    };
  } else if (componentName === 'Stepper') {
    accessibility.role = 'group';
    accessibility.ariaAttributes = {
      'aria-label': 'Stepper',
      'aria-current': 'step when active'
    };
    accessibility.keyboardSupport = {
      Enter: 'activates step (native button)',
      Space: 'activates step (native button)'
    };
  } else if (componentName === 'Spinner') {
    accessibility.role = 'status';
    accessibility.ariaAttributes = {
      'aria-label': 'Loading'
    };
  } else if (componentName === 'ProgressBar') {
    accessibility.role = 'progressbar';
    accessibility.ariaAttributes = {
      'aria-valuenow': 'current value',
      'aria-valuemin': '0',
      'aria-valuemax': 'max value'
    };
  } else if (componentName === 'NotificationBadge') {
    accessibility.ariaAttributes = {
      'aria-label': 'Notification indicator or count'
    };
  } else if (componentName === 'Chip') {
    accessibility.ariaAttributes = {
      'aria-label': 'More options on menu trigger, Remove on remove button'
    };
  } else if (componentName === 'NumberInput') {
    accessibility.ariaAttributes = {
      'aria-label': 'Decrease/Increase on stepper buttons'
    };
  } else if (componentName === 'ButtonGroup') {
    accessibility.role = 'group';
  } else if (componentName === 'RadioGroup') {
    accessibility.ariaAttributes = {
      'aria-invalid': 'true when error',
      'aria-describedby': 'links to group error message'
    };
  } else if (componentName === 'CheckboxGroup') {
    accessibility.ariaAttributes = {
      'aria-invalid': 'true when error',
      'aria-describedby': 'links to group error message'
    };
  } else if (componentName === 'Kanban') {
    accessibility.ariaAttributes = {
      'role': 'region on board, group on columns',
      'aria-label': 'Kanban board, column titles, actions'
    };
  } else if (componentName === 'ShellPanel') {
    accessibility.ariaAttributes = {
      'aria-label': 'Toggle panel width, Pop out panel, Close panel'
    };
  } else if (componentName === 'MonthPicker') {
    accessibility.ariaAttributes = {
      'role': 'grid on grid, gridcell on cells',
      'aria-label': 'Previous/Next year, Months for year, month labels'
    };
  } else if (componentName === 'DatePicker') {
    accessibility.ariaAttributes = {
      'role': 'grid',
      'aria-label': 'Calendar for month year, weekday labels'
    };
  } else if (componentName === 'WeekPicker') {
    accessibility.ariaAttributes = {
      'role': 'listbox on list, option on items',
      'aria-label': 'Weeks for year',
      'aria-selected': 'true/false on selected week'
    };
  } else if (componentName === 'TimePicker') {
    accessibility.ariaAttributes = {
      'aria-label': 'Increment/Decrement hour and minute, AM/PM'
    };
  } else if (componentName === 'DateInput') {
    accessibility.ariaAttributes = {
      'aria-label': 'label or placeholder, Open picker on trigger'
    };
  } else if (componentName === 'FloatingNav') {
    accessibility.ariaAttributes = {
      'aria-label': 'Pin navigation on pin button'
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
      // Preserve design tokens (var(--space-*), var(--radius-*), etc.) as-is so get_specs and build_component align
      const outputValue = value.raw != null ? value.raw : (value.light || value.raw);
      cssClassStyles[cleanSelector][prop] = outputValue;
    }
  }

  return cssClassStyles;
}
