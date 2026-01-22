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
 * Extract component-specific styles by CSS class selectors
 */
export function extractComponentStyles(componentName, cssClasses, parsedCSS, variableMap) {
  const styles = {};

  // Get the main component CSS file
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return styles;

  // Get component prefix for precise matching
  const classPrefix = getClassPrefix(componentName);
  
  // Build a set of valid class names for this component
  const validClasses = new Set();
  for (const cssClass of cssClasses) {
    // Clean up template literal fragments
    const cleanClass = cssClass.replace(/[${}?:]/g, '').trim();
    if (cleanClass && cleanClass.length > 0) {
      validClasses.add(cleanClass);
    }
  }

  // Find all rules that match the component's classes
  componentsCss.walkRules((rule) => {
    const selector = rule.selector;
    
    // Match selectors that belong to this component specifically
    // Match patterns like: .accordion, .accordion__item, .accordion__trigger, etc.
    // But exclude: .some-other-accordion, .btn (which contains "on" but isn't accordion)
    const isComponentSelector = 
      // Exact match: .prefix
      selector === `.${classPrefix}` ||
      // BEM modifier: .prefix--modifier
      selector.startsWith(`.${classPrefix}--`) ||
      // BEM element: .prefix__element
      selector.startsWith(`.${classPrefix}__`) ||
      // Pseudo-classes: .prefix:hover, .prefix:active, etc.
      selector.startsWith(`.${classPrefix}:`) ||
      // State classes: .prefix.is-open, .prefix.disabled, etc.
      selector.startsWith(`.${classPrefix}.`) ||
      // Combined: .prefix__element:hover, .prefix__element.is-open, etc.
      selector.includes(`.${classPrefix}__`) ||
      // Check if selector contains any of the valid classes
      Array.from(validClasses).some(cls => {
        // Match exact class or class with modifiers (e.g., .accordion__item, .accordion__item.is-open)
        return selector === `.${cls}` || 
               selector.startsWith(`.${cls}`) ||
               selector.includes(`.${cls}:`) ||
               selector.includes(`.${cls}.`);
      });

    if (isComponentSelector) {
      if (!styles[selector]) {
        styles[selector] = {};
      }

      // Extract all declarations
      rule.walkDecls((decl) => {
        const prop = decl.prop;
        const value = decl.value;
        
        // Resolve CSS variables for CP theme light and dark modes
        const resolvedLight = getResolvedValue(value, variableMap, 'cp-light');
        const resolvedDark = getResolvedValue(value, variableMap, 'cp-dark');

        styles[selector][prop] = {
          raw: value,
          light: resolvedLight,
          dark: resolvedDark
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
 */
export function extractVariantColors(componentName, parsedCSS, variableMap) {
  const variants = {};
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return variants;

  const classPrefix = getClassPrefix(componentName);
  const variantNames = ['primary', 'secondary', 'tertiary', 'danger', 'success', 'warning', 'info', 'outline', 'ghost', 'destructive'];

  componentsCss.walkRules((rule) => {
    const selector = rule.selector;

    for (const variantName of variantNames) {
      // Match selectors that contain the exact class pattern (e.g., .btn--primary)
      // but exclude:
      // 1. More specific classes (e.g., .floating-nav__btn--primary)
      // 2. Compound selectors in button groups (e.g., .btn-group .btn--primary)
      // We want to match: .btn--primary, .btn--primary:hover, etc.
      const exactPattern = `.${classPrefix}--${variantName}`;
      const moreSpecificPattern = `__${classPrefix}--${variantName}`;
      const buttonGroupPattern = `.btn-group`;
      
      // Only match if it's the base class or a state modifier (hover, active, etc.)
      // and not part of a button group or more specific component
      const isBaseClass = selector === exactPattern || 
                         selector.startsWith(exactPattern + ':') ||
                         selector.startsWith(exactPattern + '.');
      
      if (isBaseClass && !selector.includes(moreSpecificPattern) && !selector.includes(buttonGroupPattern)) {
        // Determine state (hover, active, focus, disabled)
        let state = 'default';
        if (selector.includes(':hover')) state = 'hover';
        else if (selector.includes(':active')) state = 'active';
        else if (selector.includes(':focus-visible')) state = 'focus';
        else if (selector.includes(':disabled') || selector.includes('.disabled')) state = 'disabled';

        if (!variants[variantName]) {
          variants[variantName] = { light: {}, dark: {} };
        }

        if (!variants[variantName].light[state]) {
          variants[variantName].light[state] = {};
        }
        if (!variants[variantName].dark[state]) {
          variants[variantName].dark[state] = {};
        }

        rule.walkDecls((decl) => {
          const prop = decl.prop;
          const value = decl.value;

          // Resolve for light and dark modes using CP theme as default
          // (CP is the primary theme, and specs should reflect actual theme values)
          const resolvedLight = getResolvedValue(value, variableMap, 'cp-light');
          const resolvedDark = getResolvedValue(value, variableMap, 'cp-dark');

          variants[variantName].light[state][prop] = resolvedLight;
          variants[variantName].dark[state][prop] = resolvedDark;
        });
      }
    }
  });

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
    'ButtonGroup': 'button-group',
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

/**
 * Extract theme-specific overrides (CP vs others)
 */
export function extractThemeOverrides(componentName, parsedCSS, variableMap) {
  const overrides = { cp: {}, vp: {}, ppm: {}, maconomy: {} };
  const componentsCss = parsedCSS['components.css'];
  if (!componentsCss) return overrides;

  const classPrefix = getClassPrefix(componentName);

  componentsCss.walkRules((rule) => {
    const selector = rule.selector;

    // Check for theme-specific rules
    for (const theme of ['cp', 'vp', 'ppm', 'maconomy']) {
      if (selector.includes(`.theme-${theme}`) && selector.includes(classPrefix)) {
        rule.walkDecls((decl) => {
          const prop = decl.prop;
          const value = decl.value;

          overrides[theme][prop] = {
            raw: value,
            light: getResolvedValue(value, variableMap, `${theme}-light`),
            dark: getResolvedValue(value, variableMap, `${theme}-dark`)
          };
        });
      }
    }
  });

  return overrides;
}
