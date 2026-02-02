# Variant Data Patterns

**Retired.** The canonical format uses `specs` only (no visualSpecifications). See [SPEC_CONTRACT.md](SPEC_CONTRACT.md). This doc is kept for historical reference only.

This document explains the different patterns of variant data completeness in Harmony component JSON files. Understanding these patterns helps MCP tool implementers handle variant data display gracefully.

## Overview

Component JSON files have variant data stored in `visualSpecifications.colors.variants`. However, not all components have complete variant data with all states (default, hover, active, focus, disabled). Additionally, many components have child element states stored separately in `cssClassStyles`.

## The Four Patterns

### 1. Full Variants

**Description**: All variants have all expected states (default, hover, active, focus, disabled) across all themes and modes.

**Structure**: `variants[variantName][theme][mode][state]` with all states present.

**Example**: Button component
- `primary` variant has: default, hover, active, focus, disabled
- `secondary` variant has: default, hover, active, focus, disabled
- All variants have complete state data

**JSON Structure**:
```json
{
  "colors": {
    "variants": {
      "primary": {
        "cp": {
          "light": {
            "default": { "background": "#4C92D9", ... },
            "hover": { "background": "#3D7BC4", ... },
            "active": { "background": "transparent", ... },
            "focus": { "background": "transparent", ... },
            "disabled": { "background": "#e0e4eb", ... }
          }
        }
      }
    }
  }
}
```

**Tool Behavior**: Display all states for all variants.

---

### 2. Mixed Completeness

**Description**: Different variants within the same component have different levels of state completeness. Some variants have all states, while others only have default (or a subset of states).

**Example**: Alert component
- `info`, `success`, `warning`, `error` variants: Only `default` state
- `enhanced` variant: Has `default` + `hover` (no active/focus/disabled)

**JSON Structure**:
```json
{
  "colors": {
    "variants": {
      "info": {
        "cp": {
          "light": {
            "default": { "background": "#3366FF", ... }
            // No hover, active, focus, disabled
          }
        }
      },
      "enhanced": {
        "cp": {
          "light": {
            "default": { "background": "#3366FF", ... },
            "hover": { "background": "transparent", ... }
            // No active, focus, disabled
          }
        }
      }
    }
  }
}
```

**Tool Behavior**: 
- For `info` variant: Show only default state
- For `enhanced` variant: Show default + hover states
- **Do NOT** show empty state sections (hover, active, focus, disabled) for variants that don't have them

---

### 3. Default-Only Variants

**Description**: All variants only have the `default` state. No interactive states (hover, active, focus, disabled) are defined at the variant level.

**Common Use Cases**:
- Theme/configuration selection (not visual styling variants)
- Components where variants represent different configurations rather than interactive states
- Components where child elements handle interactivity

**Examples**: 
- **LeftSidebar**: Variants (cp, vp, ppm, maconomy) are theme configurations, not visual styling
- **Card**: Variants (elevated, interactive, primary) only have default state
- **Dialog**: Variants only have default state

**JSON Structure**:
```json
{
  "colors": {
    "variants": {
      "cp": {
        "cp": {
          "light": {
            "default": { "background": "transparent", ... }
            // Only default state
          }
        }
      }
    }
  }
}
```

**Important Note**: Even though variant colors only have default state, **child elements may have states** in `cssClassStyles`:
- LeftSidebar: `.left-sidebar__item--active`, `.left-sidebar__item:hover`
- Card: `.card--interactive:hover`
- Dialog: `.dialog__close:hover`

**Tool Behavior**: 
- Show only default state for variant colors
- **Also check** `cssClassStyles` for child element states
- Display both: variant colors (default only) AND child element states (active, hover, etc.)

---

### 4. Empty Variants

**Description**: The `variants` object is empty (`{}`). The component doesn't use visual variant styling at all.

**Common Examples**: 
- Spinner
- Toggle
- Step
- Accordion
- CheckboxGroup
- RadioGroup

**JSON Structure**:
```json
{
  "colors": {
    "variants": {}
  }
}
```

**Note**: These components may still have a `variant` prop for other purposes (configuration, not styling), but no variant color data exists.

**Tool Behavior**: 
- Skip variant section entirely, OR
- Show message: "No variant styling data available"
- **Do NOT** try to iterate over empty variants object

---

## Optional state keys: item, icon, label

For composite components (e.g. sidebars, nav), the same `[theme][mode]` object may include optional state keys beyond the base five:

- **`item`** – Selected item / `[data-active="true"]` (e.g. selected nav item, Dela icon active container).
- **`icon`** – Icon-specific state when different from the container (optional).
- **`label`** – Label-specific state when different from the container (optional).

**Example**: RightSidebar and LeftSidebar include `item` under each variant/theme/mode with design tokens (`var(--theme-primary)`, `var(--text-inverse)`) so the MCP can read selected-item and active-state colors. Extractor or post-process scripts should preserve these keys when present.

---

## Important: Child Element States

Many components have nested child components that have their own states, even when variant colors only show default. These child element states are stored in `cssClassStyles`, **not** in `colors.variants`.

### How to Identify Child Element States

Look for CSS selectors in `cssClassStyles` that:
- Include `__` (BEM element separator) or `--` (BEM modifier separator)
- Include state pseudo-classes: `:hover`, `:active`, `:focus`, `:disabled`
- Include state classes: `.is-active`, `--active`, `.disabled`

### Examples by Component

#### LeftSidebar / RightSidebar
- `.left-sidebar__item--active` - Active state for navigation items
- `.left-sidebar__item:hover` - Hover state for navigation items
- `.left-sidebar__icon` - Icon styling within items

#### Card
- `.card--interactive:hover` - Hover state for interactive cards

#### Dialog
- `.dialog__close:hover` - Hover state for close button

#### ListMenu
- `.list-menu__item:hover` - Hover state for menu items
- `.list-menu__item.is-active` - Active state for menu items

#### NumberInput
- `.number-input__btn:hover` - Hover state for increment/decrement buttons
- `.number-input__btn:disabled` - Disabled state for buttons

#### FloatingNav
- `.floating-nav__btn--secondary:hover` - Hover state for secondary buttons
- `.floating-nav__btn--secondary:active` - Active state for secondary buttons

### Tool Implementation

Tools should check **both** sections for complete state information:

1. **`colors.variants`**: Component-level variant colors (may only have default)
2. **`cssClassStyles`**: Child element states (hover, active, focus, disabled for nested components)

```javascript
// Example: Check both sections
const variantColors = component.visualSpecifications?.colors?.variants || {};
const cssClassStyles = component.cssClassStyles || {};

// Display variant colors
if (Object.keys(variantColors).length > 0) {
  // Display variant data (only show states that exist)
}

// Display child element states
const childStates = extractChildElementStates(cssClassStyles);
if (childStates.length > 0) {
  // Display child element states
}
```

## Summary

| Pattern | Variant States | Child States | Example Components |
|---------|---------------|--------------|-------------------|
| **Full** | All states | May exist | Button (some variants) |
| **Mixed** | Varies per variant | May exist | Alert |
| **Default-Only** | Only default | Often exist | LeftSidebar, Card, Dialog |
| **Empty** | None | May exist | Spinner, Toggle, Step |

## Best Practices for Tool Implementers

1. **Check if variants exist**: `if (component.colors?.variants && Object.keys(component.colors.variants).length > 0)`

2. **Check states per variant**: `Object.keys(variant[theme][mode])` - Only show states that exist

3. **Don't show empty sections**: If a variant only has `default`, don't create empty hover/active/focus/disabled sections

4. **Check child element states**: Always check `cssClassStyles` for child element states, especially for components with default-only variants

5. **Handle empty variants gracefully**: Skip variant section or show informative message

6. **Display both**: When both variant colors and child element states exist, display both appropriately

## Validation

Run the validation script to see the completeness status of all components:

```bash
node scripts/validate-variant-data.js
```

This generates `variant-data-report.json` with detailed analysis of all components.
