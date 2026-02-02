# Variant Filtering Helper

**Retired.** Canonical lookup is defined in [SPEC_CONTRACT.md](SPEC_CONTRACT.md) § 6: compute spec key from (variant, theme, mode, size) and read `specs[key]`; use `defaults` when params omitted. This doc is kept for historical reference only.

## Overview

All component JSON files now include variant metadata and helper functions to make it easy for MCPs to filter component data by variant. This solves the issue where `structuredContent.component` contains all variants instead of just the requested one.

## Data Structure

Each component JSON file now includes:

1. **`_variantMetadata`** - Lists all available variants for the component
2. **`_metadata.availableVariants`** - Same list in metadata (for convenience)
3. **`_variantIndex`** - Queryable index for theme+variant combinations (NEW)

Example from `button.json`:
```json
{
  "_metadata": {
    "availableVariants": ["primary", "secondary", "tertiary", "outline", "ghost", "destructive", ...]
  },
  "_variantMetadata": {
    "availableVariants": ["primary", "secondary", "tertiary", "outline", "ghost", "destructive", ...]
  },
  "_variantIndex": {
    "cp-secondary": {
      "variant": "secondary",
      "theme": "cp",
      "light": {
        "default": { "background": "#F7F8FA", "text": "#4C92D9", ... },
        "hover": { ... },
        "active": { ... },
        "focus": { ... },
        "disabled": { ... }
      },
      "dark": { ... }
    },
    "vp-secondary": { ... },
    "cp-primary": { ... },
    // ... all theme+variant combinations
  },
  "visualSpecifications": {
    "colors": {
      "variants": {
        "primary": { ... },
        "secondary": { ... },
        "tertiary": { ... },
        ...
      }
    }
  }
}
```

### Direct Access with `_variantIndex`

The `_variantIndex` provides direct access to theme+variant combinations without deep navigation:

```javascript
// Direct access to cp secondary button
const cpSecondary = componentData._variantIndex["cp-secondary"];
// Returns: { variant: "secondary", theme: "cp", light: {...}, dark: {...} }

// Get light mode only
const cpSecondaryLight = componentData._variantIndex["cp-secondary"].light;
// Returns: { default: {...}, hover: {...}, active: {...}, ... }
```

## Helper Functions

A helper utility is available at `scripts/variant-helper.js` with the following functions:

### `filterVisualSpecsByVariant(visualSpecs, variantName)`

Filters `visualSpecifications` to only include the requested variant.

**Parameters:**
- `visualSpecs` - Full `visualSpecifications` object from component JSON
- `variantName` - Name of the variant (e.g., `'secondary'`)

**Returns:**
- Filtered `visualSpecifications` object with only the requested variant in `colors.variants`

**Example:**
```javascript
import { filterVisualSpecsByVariant } from './scripts/variant-helper.js';

// When variant="secondary" is requested:
const filteredSpecs = filterVisualSpecsByVariant(
  component.visualSpecifications, 
  'secondary'
);

// filteredSpecs.colors.variants now only contains:
// {
//   "secondary": { ... }
// }
```

### `getAvailableVariants(componentData)`

Gets the list of available variants for a component.

**Parameters:**
- `componentData` - Full component JSON data

**Returns:**
- Array of variant names (e.g., `['primary', 'secondary', 'tertiary']`)

### `hasVariant(componentData, variantName)`

Checks if a variant exists for a component.

**Parameters:**
- `componentData` - Full component JSON data
- `variantName` - Name of the variant to check

**Returns:**
- `true` if variant exists, `false` otherwise

### `filterComponentByVariant(componentData, variantName)`

Filters entire component data to only include the requested variant in `visualSpecifications`.

**Parameters:**
- `componentData` - Full component JSON data
- `variantName` - Name of the variant to filter

**Returns:**
- Component data with filtered `visualSpecifications`

### `filterVisualSpecsByVariantAndTheme(visualSpecs, variantName, theme, mode?)` (NEW)

Filters `visualSpecifications` by variant, theme, and optionally mode. This is the recommended way to extract specific theme+variant combinations.

**Parameters:**
- `visualSpecs` - Full `visualSpecifications` object from component JSON
- `variantName` - Name of the variant (e.g., `'secondary'`, `'primary'`)
- `theme` - Theme name (e.g., `'cp'`, `'vp'`, `'ppm'`, `'maconomy'`)
- `mode` - Optional mode (`'light'` or `'dark'`). If not provided, includes both.

**Returns:**
- Filtered `visualSpecifications` with only the requested variant+theme combination

**Example:**
```javascript
import { filterVisualSpecsByVariantAndTheme } from './scripts/variant-helper.js';

// Get cp secondary variant (both light and dark):
const filtered = filterVisualSpecsByVariantAndTheme(
  component.visualSpecifications,
  'secondary',
  'cp'
);

// Get cp secondary variant (light mode only):
const filteredLight = filterVisualSpecsByVariantAndTheme(
  component.visualSpecifications,
  'secondary',
  'cp',
  'light'
);
```

### `getVariantByTheme(componentData, variantName, theme, mode?)` (NEW)

Get a specific theme+variant combination using the variant index. This is the easiest and fastest way to get theme+variant data.

**Parameters:**
- `componentData` - Full component JSON data
- `variantName` - Name of the variant (e.g., `'secondary'`, `'primary'`)
- `theme` - Theme name (e.g., `'cp'`, `'vp'`, `'ppm'`, `'maconomy'`)
- `mode` - Optional mode (`'light'` or `'dark'`). If not provided, returns object with both.

**Returns:**
- Variant data for the requested theme+variant combination, or `null` if not found

**Example:**
```javascript
import { getVariantByTheme } from './scripts/variant-helper.js';

// Get cp secondary variant (both light and dark):
const cpSecondary = getVariantByTheme(componentData, 'secondary', 'cp');
// Returns: { variant: 'secondary', theme: 'cp', light: {...}, dark: {...} }

// Get cp secondary variant (light mode only):
const cpSecondaryLight = getVariantByTheme(componentData, 'secondary', 'cp', 'light');
// Returns: { default: {...}, hover: {...}, active: {...}, ... }
```

### `getVariantIndex(componentData)` (NEW)

Get the variant index for easy theme+variant queries.

**Parameters:**
- `componentData` - Full component JSON data

**Returns:**
- Variant index object with keys like `"cp-secondary"`, `"vp-primary"`, etc.

**Example:**
```javascript
import { getVariantIndex } from './scripts/variant-helper.js';

const index = getVariantIndex(componentData);
const cpSecondary = index["cp-secondary"];
// Returns: { variant: 'secondary', theme: 'cp', light: {...}, dark: {...} }
```

## MCP Implementation

### Basic Variant Filtering

When implementing `get_component_basic` with a `variant` parameter:

```javascript
// 1. Load component data
const componentData = loadComponentData(componentName);

// 2. Check if variant is requested
if (variant) {
  // 3. Verify variant exists
  if (!hasVariant(componentData, variant)) {
    throw new Error(`Variant "${variant}" not found for ${componentName}`);
  }
  
  // 4. Filter visualSpecifications
  const filteredSpecs = filterVisualSpecsByVariant(
    componentData.visualSpecifications,
    variant
  );
  
  // 5. Use filtered specs in structuredContent
  structuredContent.component = {
    ...componentData,
    visualSpecifications: filteredSpecs
  };
} else {
  // No variant requested, return full component data
  structuredContent.component = componentData;
}
```

### Theme+Variant Filtering (NEW)

When users request a specific theme+variant combination like "cp secondary button":

```javascript
import { getVariantByTheme, hasVariant } from './scripts/variant-helper.js';

// Parse request: "cp secondary button"
const [theme, variant] = parseRequest(request); // e.g., theme="cp", variant="secondary"

// 1. Load component data
const componentData = loadComponentData(componentName);

// 2. Verify variant exists
if (!hasVariant(componentData, variant)) {
  throw new Error(`Variant "${variant}" not found for ${componentName}`);
}

// 3. Get specific theme+variant combination (easiest method)
const themeVariantData = getVariantByTheme(componentData, variant, theme);

if (!themeVariantData) {
  throw new Error(`Theme "${theme}" not found for variant "${variant}" in ${componentName}`);
}

// 4. Filter visualSpecifications to only include this theme+variant
const filteredSpecs = filterVisualSpecsByVariantAndTheme(
  componentData.visualSpecifications,
  variant,
  theme
);

// 5. Use filtered specs in structuredContent
structuredContent.component = {
  ...componentData,
  visualSpecifications: filteredSpecs,
  // Optionally include the direct variant data for easy access
  _requestedVariant: themeVariantData
};
```

### Alternative: Direct Index Access

For even faster access, use the variant index directly:

```javascript
// Direct access without helper function
const indexKey = `${theme}-${variant}`; // e.g., "cp-secondary"
const themeVariantData = componentData._variantIndex?.[indexKey];

if (!themeVariantData) {
  throw new Error(`Theme+variant combination "${indexKey}" not found`);
}

// Use the data directly
const lightModeStates = themeVariantData.light;
const darkModeStates = themeVariantData.dark;
```

## Benefits

1. **Consistent API** - All components support variant filtering the same way
2. **Easy Implementation** - Simple helper functions handle the filtering logic
3. **Type Safety** - Helper functions validate variant existence
4. **Backward Compatible** - Components without variants still work (empty index)
5. **Universal** - Works for all 49+ components automatically
6. **Theme+Variant Queries** - Direct access to specific theme+variant combinations (NEW)
7. **Fast Lookup** - `_variantIndex` provides O(1) access to theme+variant data (NEW)
8. **Mode Filtering** - Optional light/dark mode filtering for precise queries (NEW)

## Testing

### Test Variant Filtering

```javascript
const buttonData = require('./mcp-data/components/button.json');
const { filterVisualSpecsByVariant } = require('./scripts/variant-helper.js');

// Filter for secondary variant
const filtered = filterVisualSpecsByVariant(
  buttonData.visualSpecifications,
  'secondary'
);

// Verify only secondary variant exists
console.log(Object.keys(filtered.colors.variants));
// Should output: ['secondary']
```

### Test Theme+Variant Queries (NEW)

```javascript
const buttonData = require('./mcp-data/components/button.json');
const { getVariantByTheme } = require('./scripts/variant-helper.js');

// Get cp secondary variant
const cpSecondary = getVariantByTheme(buttonData, 'secondary', 'cp');

// Verify structure
console.log(cpSecondary.variant); // 'secondary'
console.log(cpSecondary.theme);   // 'cp'
console.log(Object.keys(cpSecondary.light)); // ['default', 'hover', 'active', 'focus', 'disabled']
console.log(Object.keys(cpSecondary.dark));   // ['default', 'hover', 'active', 'focus', 'disabled']

// Get light mode only
const cpSecondaryLight = getVariantByTheme(buttonData, 'secondary', 'cp', 'light');
console.log(cpSecondaryLight.default.background); // '#F7F8FA'
console.log(cpSecondaryLight.default.text);       // '#4C92D9'
```

### Test Direct Index Access

```javascript
const buttonData = require('./mcp-data/components/button.json');

// Direct access to cp-secondary
const cpSecondary = buttonData._variantIndex["cp-secondary"];

// Verify it exists and has correct structure
if (cpSecondary) {
  console.log(cpSecondary.variant); // 'secondary'
  console.log(cpSecondary.theme);   // 'cp'
  console.log(cpSecondary.light.default.background); // '#F7F8FA'
}
```
