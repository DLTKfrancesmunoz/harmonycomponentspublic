# MCP Variant Filtering Implementation Guide

**Retired.** get_specs and build_component behavior are defined in [SPEC_CONTRACT.md](SPEC_CONTRACT.md) and [EXACT_BUILD_MCP.md](EXACT_BUILD_MCP.md). This doc is kept for historical reference only.

## Problem Solved

Previously, when `get_component_basic` was called with `variant="secondary"`:
- ✅ The markdown text output correctly showed secondary variant colors
- ❌ But `structuredContent.component.visualSpecifications` contained ALL variants (primary, secondary, tertiary, etc.)
- ❌ The extracted secondary variant colors were not available in the structured JSON response

## Solution Implemented

### 1. Variant Metadata Added to All Components

Every component JSON file now includes:

```json
{
  "_metadata": {
    "availableVariants": ["primary", "secondary", "tertiary", ...]
  },
  "_variantMetadata": {
    "availableVariants": ["primary", "secondary", "tertiary", ...]
  }
}
```

This makes it easy to:
- Check which variants exist for a component
- Validate variant requests
- Iterate over available variants

### 2. Helper Functions Created

A helper utility is available at `scripts/variant-helper.js` with these functions:

#### `filterVisualSpecsByVariant(visualSpecs, variantName)`
Filters `visualSpecifications` to only include the requested variant.

#### `getAvailableVariants(componentData)`
Returns array of available variant names.

#### `hasVariant(componentData, variantName)`
Checks if a variant exists.

#### `filterComponentByVariant(componentData, variantName)`
Filters entire component data by variant.

#### `getStateKeysForVariantThemeMode(modeObj)`
Returns state keys (default, hover, active, focus, disabled, and optionally item, icon, label) for a variant/theme/mode object so MCP can iterate and expose all states. See [STATE_COLORS_CONTRACT.md](STATE_COLORS_CONTRACT.md).

## MCP Implementation

### Step-by-Step Implementation

```javascript
import { 
  filterVisualSpecsByVariant, 
  getAvailableVariants, 
  hasVariant 
} from './scripts/variant-helper.js';

// In your get_component_basic handler:
function getComponentBasic(componentName, variant = null) {
  // 1. Load component data
  const componentData = loadComponentJSON(componentName);
  
  // 2. If variant is requested, filter the data
  if (variant) {
    // 3. Validate variant exists
    if (!hasVariant(componentData, variant)) {
      throw new Error(
        `Variant "${variant}" not found for ${componentName}. ` +
        `Available variants: ${getAvailableVariants(componentData).join(', ')}`
      );
    }
    
    // 4. Filter visualSpecifications
    const filteredSpecs = filterVisualSpecsByVariant(
      componentData.visualSpecifications,
      variant
    );
    
    // 5. Create filtered component data for structuredContent
    const filteredComponent = {
      ...componentData,
      visualSpecifications: filteredSpecs
    };
    
    // 6. Return in structuredContent
    return {
      text: generateMarkdown(componentData, variant), // Markdown with variant info
      structuredContent: {
        component: filteredComponent // Only requested variant in visualSpecifications
      }
    };
  }
  
  // No variant requested - return full component data
  return {
    text: generateMarkdown(componentData),
    structuredContent: {
      component: componentData
    }
  };
}
```

### Key Points

1. **Always validate** - Use `hasVariant()` before filtering
2. **Filter visualSpecifications** - Use `filterVisualSpecsByVariant()` to get variant-specific data
3. **Preserve other data** - Only filter `visualSpecifications.colors.variants`, keep everything else
4. **Works for all components** - This solution works universally for all 49 components

## Example: Button with variant="secondary"

### Before (Incorrect):
```json
{
  "structuredContent": {
    "component": {
      "visualSpecifications": {
        "colors": {
          "variants": {
            "primary": { ... },
            "secondary": { ... },  // ← Requested
            "tertiary": { ... },
            "outline": { ... },
            // ... all variants
          }
        }
      }
    }
  }
}
```

### After (Correct):
```json
{
  "structuredContent": {
    "component": {
      "visualSpecifications": {
        "colors": {
          "variants": {
            "secondary": { ... }  // ← Only requested variant
          }
        }
      }
    }
  }
}
```

## Testing

Test the implementation:

```javascript
const buttonData = require('./mcp-data/components/button.json');
const { filterVisualSpecsByVariant, hasVariant } = require('./scripts/variant-helper.js');

// Test variant filtering
const filtered = filterVisualSpecsByVariant(
  buttonData.visualSpecifications,
  'secondary'
);

// Verify only secondary exists
console.log(Object.keys(filtered.colors.variants));
// Output: ['secondary']

// Verify secondary data is present
console.log(!!filtered.colors.variants.secondary);
// Output: true

// Verify other variants are removed
console.log(!!filtered.colors.variants.primary);
// Output: false
```

## Universal Application

This solution works for **all 49 components** automatically:
- Components with variants (Button, Alert, Badge, etc.) → Variant metadata included
- Components without variants → Empty array in `availableVariants`
- All components → Helper functions work the same way

## Files Modified

1. **`scripts/visual-spec-extractor.js`**
   - Added `_variantMetadata` to visual specs output
   - Exported `filterVisualSpecsByVariant()` helper function

2. **`scripts/generate-mcp-data.js`**
   - Added variant metadata to component data
   - Added `availableVariants` to `_metadata`

3. **`scripts/variant-helper.js`** (NEW)
   - Helper functions for variant filtering
   - Utility functions for variant validation

4. **All `mcp-data/components/*.json` files**
   - Regenerated with variant metadata
   - Now include `_variantMetadata` and `_metadata.availableVariants`

## Next Steps for MCP

1. Import the helper functions from `scripts/variant-helper.js`
2. Update `get_component_basic` to filter by variant when requested
3. Test with multiple components and variants
4. Ensure backward compatibility (components without variants still work)

## See also

- [STATE_COLORS_CONTRACT.md](STATE_COLORS_CONTRACT.md) – How state colors (default, hover, active, focus, disabled, item, icon, label) are stored and how MCP should read and expose them.
