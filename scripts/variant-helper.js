/**
 * Variant Helper Utility
 * 
 * Helper functions for MCPs to filter component data by variant.
 * This makes it easy to extract variant-specific visual specifications.
 * 
 * Usage in MCP:
 * ```javascript
 * import { filterVisualSpecsByVariant } from './variant-helper.js';
 * 
 * // When variant="secondary" is requested:
 * const filteredSpecs = filterVisualSpecsByVariant(
 *   component.visualSpecifications, 
 *   'secondary'
 * );
 * 
 * // Use filteredSpecs in structuredContent
 * structuredContent.component.visualSpecifications = filteredSpecs;
 * ```
 */

/**
 * Filter visual specifications to only include a specific variant
 * 
 * @param {Object} visualSpecs - Full visualSpecifications object from component JSON
 * @param {string} variantName - Name of the variant to filter (e.g., 'secondary', 'primary')
 * @returns {Object} Filtered visualSpecifications with only the requested variant in colors.variants
 * 
 * @example
 * // Input: visualSpecs with all variants (primary, secondary, tertiary, etc.)
 * // Output: visualSpecs with only the requested variant
 * const filtered = filterVisualSpecsByVariant(component.visualSpecifications, 'secondary');
 */
export function filterVisualSpecsByVariant(visualSpecs, variantName) {
  if (!visualSpecs || !variantName) {
    return visualSpecs;
  }

  const variantData = visualSpecs.colors?.variants?.[variantName];
  if (!variantData) {
    // Variant doesn't exist, return original specs (or null if strict mode)
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
 * Get available variants for a component
 * 
 * @param {Object} componentData - Full component JSON data
 * @returns {string[]} Array of available variant names
 */
export function getAvailableVariants(componentData) {
  // Check _variantMetadata first (if available)
  if (componentData._variantMetadata?.availableVariants) {
    return componentData._variantMetadata.availableVariants;
  }
  
  // Fallback: extract from visualSpecifications
  if (componentData.visualSpecifications?.colors?.variants) {
    return Object.keys(componentData.visualSpecifications.colors.variants);
  }
  
  // Fallback: check metadata
  if (componentData._metadata?.availableVariants) {
    return componentData._metadata.availableVariants;
  }
  
  return [];
}

/**
 * Check if a variant exists for a component
 * 
 * @param {Object} componentData - Full component JSON data
 * @param {string} variantName - Name of the variant to check
 * @returns {boolean} True if variant exists
 */
export function hasVariant(componentData, variantName) {
  const availableVariants = getAvailableVariants(componentData);
  return availableVariants.includes(variantName);
}

/**
 * Filter entire component data to only include a specific variant in visualSpecifications
 * Useful for MCPs that need to return variant-filtered component data
 * 
 * @param {Object} componentData - Full component JSON data
 * @param {string} variantName - Name of the variant to filter
 * @returns {Object} Component data with filtered visualSpecifications
 */
export function filterComponentByVariant(componentData, variantName) {
  if (!componentData || !variantName) {
    return componentData;
  }

  const filtered = {
    ...componentData,
    visualSpecifications: filterVisualSpecsByVariant(
      componentData.visualSpecifications,
      variantName
    )
  };

  return filtered;
}

/**
 * Filter visual specifications by variant, theme, and optionally mode
 * 
 * @param {Object} visualSpecs - Full visualSpecifications object from component JSON
 * @param {string} variantName - Name of the variant (e.g., 'secondary', 'primary')
 * @param {string} theme - Theme name (e.g., 'cp', 'vp', 'ppm', 'maconomy')
 * @param {string} mode - Optional mode ('light' or 'dark'). If not provided, includes both.
 * @returns {Object} Filtered visualSpecifications with only the requested variant+theme combination
 * 
 * @example
 * // Get cp secondary variant (both light and dark):
 * const filtered = filterVisualSpecsByVariantAndTheme(visualSpecs, 'secondary', 'cp');
 * 
 * // Get cp secondary variant (light mode only):
 * const filtered = filterVisualSpecsByVariantAndTheme(visualSpecs, 'secondary', 'cp', 'light');
 */
export function filterVisualSpecsByVariantAndTheme(visualSpecs, variantName, theme, mode = null) {
  if (!visualSpecs || !variantName || !theme) {
    return visualSpecs;
  }

  const variantData = visualSpecs.colors?.variants?.[variantName];
  if (!variantData || !variantData[theme]) {
    // Variant or theme doesn't exist, return original specs
    return visualSpecs;
  }

  // Build filtered variant data with only the requested theme
  const filteredVariantData = {
    [theme]: {}
  };

  // If mode is specified, only include that mode; otherwise include both
  if (mode === 'light' || mode === 'dark') {
    if (variantData[theme][mode]) {
      filteredVariantData[theme][mode] = variantData[theme][mode];
    }
  } else {
    // Include both light and dark modes
    if (variantData[theme].light) {
      filteredVariantData[theme].light = variantData[theme].light;
    }
    if (variantData[theme].dark) {
      filteredVariantData[theme].dark = variantData[theme].dark;
    }
  }

  // Create filtered visual specifications
  return {
    ...visualSpecs,
    colors: {
      ...visualSpecs.colors,
      variants: {
        [variantName]: filteredVariantData
      }
    }
  };
}

/**
 * Get a specific theme+variant combination using the variant index
 * This is the easiest way to get theme+variant data for MCP tools
 * 
 * @param {Object} componentData - Full component JSON data
 * @param {string} variantName - Name of the variant (e.g., 'secondary', 'primary')
 * @param {string} theme - Theme name (e.g., 'cp', 'vp', 'ppm', 'maconomy')
 * @param {string} mode - Optional mode ('light' or 'dark'). If not provided, returns object with both.
 * @returns {Object|null} Variant data for the requested theme+variant combination, or null if not found
 * 
 * @example
 * // Get cp secondary variant (both light and dark):
 * const cpSecondary = getVariantByTheme(componentData, 'secondary', 'cp');
 * // Returns: { variant: 'secondary', theme: 'cp', light: {...}, dark: {...} }
 * 
 * // Get cp secondary variant (light mode only):
 * const cpSecondaryLight = getVariantByTheme(componentData, 'secondary', 'cp', 'light');
 * // Returns: { default: {...}, hover: {...}, ... }
 */
export function getVariantByTheme(componentData, variantName, theme, mode = null) {
  if (!componentData || !variantName || !theme) {
    return null;
  }

  // Try to use variant index first (fastest path)
  const indexKey = `${theme}-${variantName}`;
  if (componentData._variantIndex?.[indexKey]) {
    const variantData = componentData._variantIndex[indexKey];
    
    // If mode is specified, return only that mode's states
    if (mode === 'light' || mode === 'dark') {
      return variantData[mode] || null;
    }
    
    // Otherwise return full object with both modes
    return variantData;
  }

  // Fallback: navigate the variants structure
  const variantData = componentData.visualSpecifications?.colors?.variants?.[variantName];
  if (!variantData || !variantData[theme]) {
    return null;
  }

  // Build result object
  const result = {
    variant: variantName,
    theme: theme
  };

  // If mode is specified, only include that mode
  if (mode === 'light' || mode === 'dark') {
    if (variantData[theme][mode]) {
      return variantData[theme][mode];
    }
    return null;
  }

  // Include both modes
  if (variantData[theme].light) {
    result.light = variantData[theme].light;
  }
  if (variantData[theme].dark) {
    result.dark = variantData[theme].dark;
  }

  return result;
}

/**
 * Get the variant index for easy theme+variant queries
 * 
 * @param {Object} componentData - Full component JSON data
 * @returns {Object} Variant index object with keys like "cp-secondary", "vp-primary", etc.
 * 
 * @example
 * const index = getVariantIndex(componentData);
 * const cpSecondary = index["cp-secondary"];
 * // Returns: { variant: 'secondary', theme: 'cp', light: {...}, dark: {...} }
 */
export function getVariantIndex(componentData) {
  if (!componentData) {
    return {};
  }

  // Return the variant index if it exists
  if (componentData._variantIndex) {
    return componentData._variantIndex;
  }

  // Fallback: build index from variants structure
  const index = {};
  const variants = componentData.visualSpecifications?.colors?.variants || {};
  const themes = ['cp', 'vp', 'ppm', 'maconomy'];

  for (const [variantName, variantData] of Object.entries(variants)) {
    for (const theme of themes) {
      if (variantData[theme]) {
        const indexKey = `${theme}-${variantName}`;
        index[indexKey] = {
          variant: variantName,
          theme: theme,
          light: variantData[theme].light || {},
          dark: variantData[theme].dark || {}
        };
      }
    }
  }

  return index;
}

/** Base state keys always present (Phase 1). Optional keys (item, icon, label) may exist for composite components. */
const BASE_STATE_KEYS = ['default', 'hover', 'active', 'focus', 'disabled'];
const OPTIONAL_STATE_KEYS = ['item', 'icon', 'label'];

/**
 * List state keys for a variant/theme/mode object so MCP can iterate and expose all states.
 * Resolved variant colors live at variants[variant][theme][mode]; this returns that object's keys
 * in a stable order (base states first, then optional item/icon/label).
 *
 * @param {Object} modeObj - The object at variants[variant][theme][mode] (state key -> color spec)
 * @returns {string[]} State keys to use (e.g. ['default', 'hover', 'active', 'focus', 'disabled', 'item'])
 * @example
 * const states = getStateKeysForVariantThemeMode(filteredSpecs.colors.variants.primary.cp.light);
 * // Use each key to emit .baseClass:hover, .baseClass:active, .baseClass__item[data-active="true"], etc.
 */
export function getStateKeysForVariantThemeMode(modeObj) {
  if (!modeObj || typeof modeObj !== 'object') {
    return [];
  }
  const keys = Object.keys(modeObj);
  const ordered = [];
  for (const k of BASE_STATE_KEYS) {
    if (keys.includes(k)) ordered.push(k);
  }
  for (const k of OPTIONAL_STATE_KEYS) {
    if (keys.includes(k)) ordered.push(k);
  }
  // Any other keys (future extension) in alphabetical order
  for (const k of keys.sort()) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}
