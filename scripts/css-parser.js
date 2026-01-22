/**
 * CSS Parser Module
 * Parses CSS files and resolves CSS variables to computed values
 */

import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

/**
 * Parse all CSS files in a directory
 */
export function parseCSSFiles(cssDir) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  const parsedCSS = {};

  for (const file of cssFiles) {
    const filePath = path.join(cssDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    try {
      const root = postcss.parse(content);
      parsedCSS[file] = root;
    } catch (error) {
      console.error(`Error parsing ${file}:`, error.message);
    }
  }

  return parsedCSS;
}

/**
 * Build a map of CSS variables and their resolved values
 */
export function resolveCSSVariables(tokensCssContent) {
  const variableMap = {};
  const root = postcss.parse(tokensCssContent);

  // Extract variables from :root and theme selectors
  root.walkRules((rule) => {
    // Handle :root, .theme-cp, .theme-vp, .dark, etc.
    const selector = rule.selector;
    const context = getContextFromSelector(selector);

    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        const varName = decl.prop;
        const value = decl.value;

        if (!variableMap[varName]) {
          variableMap[varName] = {};
        }

        variableMap[varName][context] = value;
      }
    });
  });

  return variableMap;
}

/**
 * Get context (theme/mode) from selector
 */
function getContextFromSelector(selector) {
  if (selector.includes('.theme-cp') && selector.includes('.dark')) {
    return 'cp-dark';
  } else if (selector.includes('.theme-cp')) {
    return 'cp-light';
  } else if (selector.includes('.theme-vp') && selector.includes('.dark')) {
    return 'vp-dark';
  } else if (selector.includes('.theme-vp')) {
    return 'vp-light';
  } else if (selector.includes('.theme-ppm') && selector.includes('.dark')) {
    return 'ppm-dark';
  } else if (selector.includes('.theme-ppm')) {
    return 'ppm-light';
  } else if (selector.includes('.theme-maconomy') && selector.includes('.dark')) {
    return 'maconomy-dark';
  } else if (selector.includes('.theme-maconomy')) {
    return 'maconomy-light';
  } else if (selector.includes('.dark')) {
    return 'dark';
  }
  
  return 'light'; // default
}

/**
 * Resolve a CSS value (converts var(--name) to actual value)
 * Handles nested variables, fallback values, and recursive resolution
 */
export function getResolvedValue(cssValue, variableMap, context = 'light') {
  if (!cssValue) return cssValue;
  if (typeof cssValue !== 'string') return cssValue;

  // Keep resolving until no more var() references remain
  let result = cssValue;
  let maxIterations = 20; // Increased for deeply nested variables
  let iteration = 0;
  const unresolvedVars = new Set();

  while (result.includes('var(') && iteration < maxIterations) {
    iteration++;
    const parsed = valueParser(result);
    let hasChanges = false;
    
    parsed.walk((node) => {
      if (node.type === 'function' && node.value === 'var') {
        const varName = node.nodes[0]?.value;
        const fallbackValue = node.nodes[1]?.value; // Handle var(--name, fallback)
        
        if (varName) {
          let resolved = null;
          
          if (variableMap[varName]) {
            // Build list of context variations to try
            const contextVariations = [];
            
            // If context is theme-specific (e.g., 'cp-light'), try it first
            if (context.includes('-')) {
              contextVariations.push(context);
            }
            
            // Try all theme variants for the mode (light or dark)
            const isDark = context.includes('dark') || context === 'dark';
            const themes = ['cp', 'vp', 'ppm', 'maconomy'];
            themes.forEach(theme => {
              const themeContext = isDark ? `${theme}-dark` : `${theme}-light`;
              if (!contextVariations.includes(themeContext)) {
                contextVariations.push(themeContext);
              }
            });
            
            // Try generic light/dark
            if (isDark) {
              contextVariations.push('dark');
            } else {
              contextVariations.push('light');
            }
            
            // Try each context variation
            for (const ctx of contextVariations) {
              if (variableMap[varName][ctx]) {
                resolved = variableMap[varName][ctx];
                break;
              }
            }
            
            // If still no match, get first available value
            if (!resolved && Object.keys(variableMap[varName]).length > 0) {
              resolved = Object.values(variableMap[varName])[0];
            }
          }
          
          // If variable not found and there's a fallback, use it
          if (!resolved && fallbackValue) {
            resolved = fallbackValue.trim();
          }
          
          if (resolved) {
            // Recursively resolve the resolved value in case it contains more var() references
            if (resolved.includes('var(')) {
              resolved = getResolvedValue(resolved, variableMap, context);
            }
            
            // Replace the var() with the resolved value
            node.type = 'word';
            node.value = resolved;
            hasChanges = true;
          } else {
            // Variable not found - track it but don't break
            unresolvedVars.add(varName);
            // Keep the var() reference but mark as changed to continue loop
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      result = parsed.toString();
    } else {
      break; // No more changes, exit loop
    }
  }

  // Final check: if still contains var(), try one more time with different context
  if (result.includes('var(')) {
    // Try with 'light' context as fallback
    if (context !== 'light') {
      const fallbackResult = getResolvedValue(result, variableMap, 'light');
      if (!fallbackResult.includes('var(')) {
        return fallbackResult;
      }
    }
    
    // Log warnings for unresolved variables
    if (unresolvedVars.size > 0) {
      console.warn(`⚠️  Could not fully resolve CSS value: ${result}`);
      console.warn(`   Unresolved variables: ${Array.from(unresolvedVars).join(', ')} (context: ${context})`);
    }
  }

  // Final validation: ensure no var() references remain
  if (result.includes('var(')) {
    // Last attempt: try to extract and resolve any remaining var() references
    const varMatches = result.match(/var\(([^)]+)\)/g);
    if (varMatches) {
      for (const varMatch of varMatches) {
        const varName = varMatch.match(/var\(([^,)]+)/)?.[1]?.trim();
        if (varName && variableMap[varName]) {
          // Try to get any available value
          const firstValue = Object.values(variableMap[varName])[0];
          if (firstValue && !firstValue.includes('var(')) {
            result = result.replace(varMatch, firstValue);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Extract variant names from a prop type string
 * Handles union types like: 'primary' | 'secondary' | 'tertiary'
 */
function extractVariantNamesFromType(typeString) {
  if (!typeString) return [];
  
  // Match union types: 'value1' | 'value2' | 'value3'
  const unionMatch = typeString.match(/^['"]([^'"]+)['"]\s*\|\s*(.+)$/);
  if (unionMatch) {
    const first = unionMatch[1];
    const rest = unionMatch[2];
    // Recursively extract from the rest
    const restVariants = extractVariantNamesFromType(rest);
    return [first, ...restVariants];
  }
  
  // Single quoted value
  const singleMatch = typeString.match(/^['"]([^'"]+)['"]$/);
  if (singleMatch) {
    return [singleMatch[1]];
  }
  
  return [];
}

/**
 * Get variant prop from component props
 */
function getVariantProp(componentProps) {
  if (!componentProps || typeof componentProps !== 'object') return null;
  
  // Check for variant prop (case-insensitive)
  for (const [propName, propData] of Object.entries(componentProps)) {
    if (propName.toLowerCase() === 'variant') {
      return propData;
    }
  }
  
  return null;
}

/**
 * Get all variant-like props from component props
 * Detects props with union types containing string literals
 * Variant-like prop names: variant, style, type, appearance, etc.
 * Excludes: size (handled separately as size variants)
 */
function getAllVariantProps(componentProps) {
  if (!componentProps || typeof componentProps !== 'object') return [];
  
  // Exclude these props - they're not visual variants
  const excludeProps = new Set(['size', 'orientation', 'iconPosition', 'buttonType']);
  const variantLikeNames = ['variant', 'style', 'type', 'appearance', 'mode'];
  const variantProps = [];
  
  for (const [propName, propData] of Object.entries(componentProps)) {
    const lowerName = propName.toLowerCase();
    
    // Skip excluded props
    if (excludeProps.has(lowerName)) continue;
    
    // Check if it's a variant-like prop name
    if (variantLikeNames.includes(lowerName) || lowerName.includes('variant') || lowerName.includes('style')) {
      // Check if the type is a union of string literals
      if (propData && propData.type) {
        const typeStr = propData.type;
        // Check if it contains string literal union (e.g., 'value1' | 'value2')
        if (typeStr.includes("'") || typeStr.includes('"')) {
          const variantNames = extractVariantNamesFromType(typeStr);
          if (variantNames.length > 0) {
            variantProps.push({
              name: propName,
              type: typeStr,
              variantNames: variantNames,
              optional: propData.optional || false,
              default: propData.default || null
            });
          }
        }
      }
    }
  }
  
  return variantProps;
}

/**
 * Extract variant names from CSS classes
 * Scans CSS for all classes matching variant patterns
 * Returns a Set of all variant names found
 */
function extractVariantsFromCSS(componentName, parsedCSS) {
  const variants = new Set();
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return variants;

  const classPrefix = getClassPrefix(componentName);
  
  // Exclude these non-variant modifiers
  const excludeList = new Set([
    'xs', 'sm', 'md', 'lg', // sizes
    'disabled', 'loading', 'vertical', 'horizontal', 'full', 'icon', // states/layout
    'page-header', 'pageHeader' // button-specific
    // Note: 'enhanced' is a valid variant for Alert, so we don't exclude it
  ]);
  
  // Patterns to match:
  // 1. Standard: .component--variant
  // 2. BEM: .component__element--variant (but only for theme-selection components)
  // 3. Combined: .component--variant1.component--variant2
  const escapedPrefix = classPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const standardPattern = new RegExp(`\\.${escapedPrefix}--([a-z0-9-]+)`);
  const bemPattern = new RegExp(`\\.${escapedPrefix}__[a-z0-9-]+--([a-z0-9-]+)`);
  
  // Check if this is a theme-selection component (LeftSidebar, RightSidebar)
  const themeSelectionOnly = ['LeftSidebar', 'RightSidebar'];
  const isThemeSelection = themeSelectionOnly.includes(componentName);
  
  componentsCss.walkRules((rule) => {
    const selector = rule.selector;
    
    // Extract from standard pattern: .component--variant
    const standardMatch = selector.match(standardPattern);
    if (standardMatch && standardMatch[1]) {
      const variantName = standardMatch[1];
      // Exclude non-variant modifiers
      if (!excludeList.has(variantName)) {
        variants.add(variantName);
      }
    }
    
    // Extract from BEM pattern: .component__element--variant
    // Only for theme-selection components (e.g., .left-sidebar__variant--cp)
    if (isThemeSelection) {
      const bemMatch = selector.match(bemPattern);
      if (bemMatch && bemMatch[1]) {
        const variantName = bemMatch[1];
        // For theme-selection components, these are theme names (cp, vp, ppm, maconomy)
        // We'll exclude them from variant colors extraction, but capture them here for completeness
        // They won't be used since theme-selection components return empty variants
        variants.add(variantName);
      }
    }
  });
  
  return variants;
}

/**
 * Extract component-specific styles by CSS class selectors
 * Uses exact class matching to prevent false matches
 */
export function extractComponentStyles(componentName, cssClasses, parsedCSS, variableMap) {
  const styles = {};

  // Get the main component CSS file
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return styles;

  // Get component prefix for precise matching
  const classPrefix = getClassPrefix(componentName);
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  
  // Build a set of valid class names for this component
  const validClasses = new Set();
  for (const cssClass of cssClasses) {
    // Clean up template literal fragments
    const cleanClass = cssClass.replace(/[${}?:]/g, '').trim();
    if (cleanClass && cleanClass.length > 0) {
      validClasses.add(cleanClass);
    }
  }

  // Helper function to check if selector matches exact class prefix (not substring)
  const matchesExactClass = (selector, prefix) => {
    // Match patterns like: .prefix, .prefix--modifier, .prefix:hover, .prefix.is-open
    // But NOT: .other-prefix, .prefix__other, .other__prefix
    const exactPattern = new RegExp(`\\.${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(--|__|:|$|\\.)`);
    return exactPattern.test(selector);
  };

  // Find all rules that match the component's classes
  componentsCss.walkRules((rule) => {
    const selector = rule.selector;
    
    // Check for theme-specific rules (e.g., .theme-cp .input, html.theme-cp.dark .input)
    let isThemeSpecific = false;
    let themeSelector = null;
    
    for (const theme of themes) {
      if (selector.includes(`.theme-${theme}`) || selector.includes(`html.theme-${theme}`)) {
        // Extract the actual class from theme selector (e.g., .theme-cp .input -> .input)
        const themeMatch = selector.match(new RegExp(`\\.theme-${theme}\\s+(\\.\\S+)`)) ||
                          selector.match(new RegExp(`html\\.theme-${theme}(?:\\.dark)?\\s+(\\.\\S+)`));
        if (themeMatch && themeMatch[1]) {
          themeSelector = themeMatch[1];
          // Check if this matches our component using exact matching
          if (themeSelector === `.${classPrefix}` || 
              (themeSelector.startsWith(`.${classPrefix}--`) && matchesExactClass(themeSelector, classPrefix)) ||
              (themeSelector.startsWith(`.${classPrefix}__`) && matchesExactClass(themeSelector, classPrefix)) ||
              Array.from(validClasses).some(cls => themeSelector === `.${cls}` || (themeSelector.startsWith(`.${cls}`) && matchesExactClass(themeSelector, cls)))) {
            isThemeSpecific = true;
            break;
          }
        }
      }
    }
    
    // Match selectors that belong to this component specifically
    // Match patterns like: .accordion, .accordion__item, .accordion__trigger, etc.
    // But exclude: .some-other-accordion, .number-input__btn (for Button component)
    const isComponentSelector = 
      // Exact match: .prefix
      selector === `.${classPrefix}` ||
      // BEM modifier: .prefix--modifier (with exact matching)
      (selector.startsWith(`.${classPrefix}--`) && matchesExactClass(selector, classPrefix)) ||
      // BEM element: .prefix__element (with exact matching)
      (selector.startsWith(`.${classPrefix}__`) && matchesExactClass(selector, classPrefix)) ||
      // Pseudo-classes: .prefix:hover, .prefix:active, etc. (with exact matching)
      (selector.startsWith(`.${classPrefix}:`) && matchesExactClass(selector, classPrefix)) ||
      // State classes: .prefix.is-open, .prefix.disabled, etc. (with exact matching)
      (selector.startsWith(`.${classPrefix}.`) && matchesExactClass(selector, classPrefix)) ||
      // Combined: .prefix__element:hover, .prefix__element.is-open, etc. (with exact matching)
      (selector.includes(`.${classPrefix}__`) && matchesExactClass(selector, classPrefix)) ||
      // Check if selector contains any of the valid classes (with exact matching)
      Array.from(validClasses).some(cls => {
        return selector === `.${cls}` || 
               (selector.startsWith(`.${cls}`) && matchesExactClass(selector, cls)) ||
               (selector.includes(`.${cls}:`) && matchesExactClass(selector, cls)) ||
               (selector.includes(`.${cls}.`) && matchesExactClass(selector, cls));
      });

    if (isComponentSelector || isThemeSpecific) {
      if (!styles[selector]) {
        styles[selector] = {};
      }

      // Extract all declarations
      rule.walkDecls((decl) => {
        const prop = decl.prop;
        const value = decl.value;
        
        // Resolve for all themes
        const resolved = {};
        for (const theme of themes) {
          resolved[`${theme}-light`] = getResolvedValue(value, variableMap, `${theme}-light`);
          resolved[`${theme}-dark`] = getResolvedValue(value, variableMap, `${theme}-dark`);
        }
        
        // Store with backward compatibility: light/dark as aliases to cp-light/cp-dark
        styles[selector][prop] = {
          raw: value,
          light: resolved['cp-light'], // Backward compatibility
          dark: resolved['cp-dark'],   // Backward compatibility
          ...resolved
        };
      });
    }
  });

  return styles;
}

/**
 * Extract size variant dimensions from CSS
 */
export function extractSizeVariants(componentName, parsedCSS, variableMap) {
  const sizes = { xs: {}, sm: {}, md: {}, lg: {} };
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return sizes;

  const classPrefix = getClassPrefix(componentName);

  componentsCss.walkRules((rule) => {
    const selector = rule.selector;

    // Match size modifiers like .btn--xs, .btn--sm, etc.
    for (const size of ['xs', 'sm', 'md', 'lg']) {
      if (selector.includes(`${classPrefix}--${size}`)) {
        rule.walkDecls((decl) => {
          const prop = decl.prop;
          const value = decl.value;

          sizes[size][prop] = {
            raw: value,
            resolved: getResolvedValue(value, variableMap, 'cp-light')
          };
        });
      }
    }
  });

  return sizes;
}

/**
 * Extract variant colors (primary, secondary, etc.)
 * Returns structure: variants[variantName][theme][mode][state]
 * 
 * Now extracts variants from BOTH component props AND CSS classes
 * Handles multiple variant props (e.g., Alert's variant and style)
 * Handles combined variants (e.g., .alert--enhanced.alert--success)
 */
export function extractVariantColors(componentName, parsedCSS, variableMap, componentProps = null) {
  const variants = {};
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return variants;

  const classPrefix = getClassPrefix(componentName);
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];
  
  // Component-specific configuration
  const themeSelectionOnly = ['LeftSidebar', 'RightSidebar'];
  if (themeSelectionOnly.includes(componentName)) {
    // These components use variant for theme selection, not visual styling
    // Return empty variants object (correct behavior)
    return variants;
  }
  
  // Extract variant names from component props
  const variantProps = componentProps ? getAllVariantProps(componentProps) : [];
  const propsVariantNames = new Set();
  
  // Collect all variant names from all variant props
  for (const variantProp of variantProps) {
    for (const variantName of variantProp.variantNames) {
      propsVariantNames.add(variantName);
    }
  }
  
  // Extract variant names from CSS classes
  const cssVariantNames = extractVariantsFromCSS(componentName, parsedCSS);
  
  // Merge variants from both sources (union)
  const allVariantNames = new Set([...propsVariantNames, ...cssVariantNames]);
  
  // Fall back to hardcoded list if no variants found
  let variantNames = Array.from(allVariantNames);
  if (variantNames.length === 0) {
    variantNames = ['primary', 'secondary', 'tertiary', 'danger', 'error', 'success', 'warning', 'info', 'outline', 'ghost', 'destructive'];
  }
  
  // Special handling for Button component to extract page header variants
  const isButton = componentName === 'Button';
  const isButtonGroup = componentName === 'ButtonGroup';
  const pageHeaderPattern = isButton ? `.${classPrefix}--page-header` : null;

  // Helper function to check if selector matches exact class prefix (not substring)
  const matchesExactClass = (selector, prefix) => {
    // Match patterns like: .prefix, .prefix--modifier, .prefix:hover, .prefix.is-open
    // But NOT: .other-prefix, .prefix__other, .other__prefix
    const exactPattern = new RegExp(`\\.${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(--|__|:|$|\\.)`);
    return exactPattern.test(selector);
  };
  
  // Helper to extract all variant names from a selector
  const extractVariantsFromSelector = (selector) => {
    const foundVariants = [];
    for (const variantName of variantNames) {
      const exactPattern = `.${classPrefix}--${variantName}`;
      // Check for standard pattern: .component--variant
      if (selector === exactPattern || 
          selector.startsWith(exactPattern + ':') ||
          selector.startsWith(exactPattern + '.') ||
          selector.includes(exactPattern + '.') ||
          selector.includes(' ' + exactPattern) ||
          selector.includes(exactPattern + ' ')) {
        foundVariants.push(variantName);
      }
    }
    return foundVariants;
  };

  componentsCss.walkRules((rule) => {
    const selector = rule.selector;
    
    // Extract all variants found in this selector
    const foundVariants = extractVariantsFromSelector(selector);
    
    // Skip if no variants found
    if (foundVariants.length === 0) return;
    
    // Handle combined variants (e.g., .alert--enhanced.alert--success)
    // For now, we'll extract each variant independently
    // In the future, we could create combined variant entries
    
    for (const variantName of foundVariants) {
      const exactPattern = `.${classPrefix}--${variantName}`;
      const moreSpecificPattern = `__${classPrefix}--${variantName}`;
      const buttonGroupPattern = `.btn-group`;
      
      // Check for page header variants (e.g., .btn--page-header.btn--primary)
      const isPageHeaderVariant = isButton && pageHeaderPattern && 
                                   selector.includes(pageHeaderPattern) && 
                                   selector.includes(exactPattern) &&
                                   !selector.includes(moreSpecificPattern) &&
                                   (isButtonGroup || !selector.includes(buttonGroupPattern));
      
      // Check for regular variants (e.g., .btn--primary or .btn-group--default)
      // Also handle combined: .alert--enhanced.alert--success
      const isRegularVariant = selector === exactPattern || 
                               selector.startsWith(exactPattern + ':') ||
                               selector.startsWith(exactPattern + '.') ||
                               selector.includes(exactPattern + '.') ||
                               (selector.includes(exactPattern) && !selector.includes(moreSpecificPattern));
      
      // Only process primary, secondary, tertiary for page header variants
      const isPageHeaderApplicable = isPageHeaderVariant && 
                                     ['primary', 'secondary', 'tertiary'].includes(variantName);
      
      // Only exclude button-group pattern when extracting Button variants, not ButtonGroup variants
      const shouldExcludeButtonGroup = !isButtonGroup && selector.includes(buttonGroupPattern);
      
      // Check for theme-specific rules (e.g., .theme-cp .btn--secondary, html.theme-cp.dark .btn--secondary)
      let matchedTheme = null;
      let matchedMode = null;
      for (const theme of themes) {
        if (selector.includes(`.theme-${theme}`) || selector.includes(`html.theme-${theme}`)) {
          if (matchesExactClass(selector, `${classPrefix}--${variantName}`)) {
            matchedTheme = theme;
            if (selector.includes('.dark') || selector.includes(`html.theme-${theme}.dark`)) {
              matchedMode = 'dark';
            } else {
              matchedMode = 'light';
            }
            break;
          }
        }
      }
      
      if ((isRegularVariant || isPageHeaderApplicable) && 
          !selector.includes(moreSpecificPattern) && 
          !shouldExcludeButtonGroup) {
        
        // Determine state (hover, active, focus, disabled)
        let state = 'default';
        if (selector.includes(':hover')) state = 'hover';
        else if (selector.includes(':active')) state = 'active';
        else if (selector.includes(':focus-visible') || selector.includes(':focus')) state = 'focus';
        else if (selector.includes(':disabled') || selector.includes('.disabled')) state = 'disabled';

        // Use different variant key for page header variants
        const variantKey = isPageHeaderVariant ? `pageHeader${variantName.charAt(0).toUpperCase() + variantName.slice(1)}` : variantName;

        // Initialize variant structure if needed
        if (!variants[variantKey]) {
          variants[variantKey] = {};
          for (const theme of themes) {
            variants[variantKey][theme] = { light: {}, dark: {} };
          }
        }

        rule.walkDecls((decl) => {
          const prop = decl.prop;
          const value = decl.value;

          if (matchedTheme) {
            // Theme-specific rule: only extract for this theme
            if (!variants[variantKey][matchedTheme][matchedMode][state]) {
              variants[variantKey][matchedTheme][matchedMode][state] = {};
            }
            const resolved = getResolvedValue(value, variableMap, `${matchedTheme}-${matchedMode}`);
            variants[variantKey][matchedTheme][matchedMode][state][prop] = resolved;
          } else {
            // Base rule: extract for all themes by resolving with each theme context
            for (const theme of themes) {
              if (!variants[variantKey][theme].light[state]) {
                variants[variantKey][theme].light[state] = {};
              }
              if (!variants[variantKey][theme].dark[state]) {
                variants[variantKey][theme].dark[state] = {};
              }
              
              const resolvedLight = getResolvedValue(value, variableMap, `${theme}-light`);
              const resolvedDark = getResolvedValue(value, variableMap, `${theme}-dark`);
              
              variants[variantKey][theme].light[state][prop] = resolvedLight;
              variants[variantKey][theme].dark[state][prop] = resolvedDark;
            }
          }
        });
      }
    }
  });
  
  // Initialize variant entries for all variants from props, even if they have no CSS rules
  // This ensures all variants defined in the component interface are included in the JSON
  for (const variantName of propsVariantNames) {
    if (!variants[variantName]) {
      // Initialize empty variant structure
      variants[variantName] = {};
      for (const theme of themes) {
        variants[variantName][theme] = { 
          light: { default: {} }, 
          dark: { default: {} } 
        };
      }
    }
  }

  return variants;
}

/**
 * Get CSS class prefix for component (e.g., Button -> .btn)
 */
function getClassPrefix(componentName) {
  const prefixMap = {
    'Button': 'btn',
    'Input': 'input',
    'Card': 'card',
    'Badge': 'badge',
    'Chip': 'chip',
    'Alert': 'alert',
    'Dialog': 'dialog',
    'Dropdown': 'dropdown',
    'Checkbox': 'checkbox',
    'RadioButton': 'radio',
    'Toggle': 'toggle',
    'Accordion': 'accordion',
    'Table': 'table',
    'TabStrip': 'tabstrip',
    'ProgressBar': 'progress',
    'Spinner': 'spinner',
    'Tooltip': 'tooltip',
    'Label': 'label',
    'Link': 'link',
    'Icon': 'icon',
    'Avatar': 'avatar',
    'NotificationBadge': 'notification-badge',
    'Stepper': 'stepper',
    'Step': 'step',
    'ShellHeader': 'header',
    'ShellFooter': 'shell-footer',
    'ShellPanel': 'shell-panel',
    'ShellPageHeader': 'shell-page-header',
    'LeftSidebar': 'left-sidebar',
    'RightSidebar': 'right-sidebar',
    'FloatingNav': 'floating-nav',
    'ListMenu': 'list-menu',
    'Kanban': 'kanban',
    'KanbanCard': 'kanban-card',
    'ButtonGroup': 'btn-group',
    'CheckboxGroup': 'checkbox-group',
    'RadioGroup': 'radio-group',
    'DatePicker': 'date-picker',
    'TimePicker': 'time-picker',
    'DateTimePicker': 'datetime-picker',
    'MonthPicker': 'month-picker',
    'WeekPicker': 'week-picker',
    'DateInput': 'date-input',
    'NumberInput': 'number-input',
    'RangeInput': 'range-input',
    'Textarea': 'textarea',
    'PickerPopup': 'picker-popup',
    'CPLeftSidebar': 'cp-left-sidebar',
    'CPRightSidebar': 'cp-right-sidebar',
  };

  return prefixMap[componentName] || componentName.toLowerCase();
}

