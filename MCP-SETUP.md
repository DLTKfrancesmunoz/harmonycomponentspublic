# Harmony MCP Data Setup Guide

## Overview

The Harmony Design System includes pre-generated MCP data for fast component queries. This data is committed to Git and automatically discovered by DSManager.

## How It Works

### For Designers (Remote Access)

When designers configure DSManager to use the Harmony repo from GitHub:

```json
// Claude Desktop config
{
  "mcpServers": {
    "design-system-manager": {
      "command": "node",
      "args": ["/path/to/DSManager/build/index.js"],
      "env": {
        "DESIGN_SYSTEMS_PATH": "https://github.com/DLTKfrancesmunoz/harmonycomponents.git",
        "GITHUB_CLONE_CACHE": "/tmp/dsmanager-cache"
      }
    }
  }
}
```

**What happens:**
1. DSManager clones the repo to `/tmp/dsmanager-cache/harmonycomponents/`
2. The `mcp-data/` folder is included in the clone (committed to Git)
3. HarmonyDataAdapter auto-discovers: `/tmp/dsmanager-cache/harmonycomponents/mcp-data/`
4. All 5 Harmony tools become available instantly ✅

### For Developers (Local Development)

When you're developing locally with both projects on your machine:

```
/Users/francesmunoz/Desktop/
├── DSManager/
└── harmonycomponents/
    └── mcp-data/  ← Auto-discovered as sibling directory
```

**What happens:**
1. DSManager looks for `mcp-data/` in sibling directories first
2. Finds: `/Users/francesmunoz/Desktop/harmonycomponents/mcp-data/`
3. All 5 Harmony tools work with your local data ✅

## Data Discovery Priority

HarmonyDataAdapter searches in this order:

1. **Environment Variable** (highest priority)
   - `HARMONY_MCP_DATA_PATH=/custom/path/mcp-data`
   - Use this to override the auto-discovery

2. **Git Clone Cache** (for remote users)
   - `$GITHUB_CLONE_CACHE/harmonycomponents/mcp-data/`
   - Default: `/tmp/dsmanager-cache/harmonycomponents/mcp-data/`

3. **Sibling Directory** (for local dev)
   - `../harmonycomponents/mcp-data/`

4. **Parent Directory** (alternative local dev setup)
   - `../../harmonycomponents/mcp-data/`

## Available Harmony Tools

When Harmony data is successfully loaded, these 5 tools become available:

1. **get_component_basic** - Component metadata and props
2. **get_dependencies** - Component dependency graph
3. **get_design_tokens** - Design tokens (spacing, colors, typography, elevations)
4. **get_component_structure** - DOM structure and slots ✨ NEW
5. **get_layout_data** - Layout composition data ✨ NEW

## Exact builds and canonical spec

For **exact builds** (component, template, recipe, or apply tokens to a framework), use the canonical build spec and design system overview so the AI applies values verbatim with no deviations.

### Design system overview (read first)

- **Location:** `mcp-data/DESIGN_SYSTEM_OVERVIEW.md` and `mcp-data/design-system-overview.json`
- **Contents:** Fonts (Figtree, Lexend, JetBrains Mono), icons (Heroicons, paths, sizes), fallback icons (behavior and CSS vars), themes (cp, vp, ppm, maconomy), modes (light, dark), spacing scale, typography scale, radius/elevation.
- **Use:** Expose this as an MCP resource or return it when the AI builds; the AI should apply these global rules before applying per-component specs.

### Canonical spec and guidance (per component)

- **Location:** Each component JSON in `mcp-data/components/*.json` uses the **canonical format** (see [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md)):
  - **specs** – Keyed by `[variant]-[theme]-[mode]-[size]` (e.g. `primary-cp-light-md`, `cp-light`, `base-cp-light`). Each value is one complete spec object: props, layout (with gap), spacing, dimensions, typography, borders, states (default, hover, active, focus, disabled, item/icon/label where applicable), icons; and when applicable **template** (exact default content, e.g. sections/items/icons) and **structure** (DOM + BEM classes). All values are resolved (no null, no transparent, no `var()`).
  - **guidance** – `patterns` (behavior: icon-only, loading, href) and `guidelines` (when to use, composition, anti-patterns).
- **get_specs / get_build_spec (intended behavior):** Read **only** `specs` and `guidance` from the component JSON. Return **one** spec for the requested (componentName, variant, theme, mode, size) from `specs[key]`, plus **guidance**, in one response, e.g. `{ buildSpec: { ... }, defaultsUsed?: { variant, theme, mode, size }, guidance: { patterns: { ... }, guidelines: { ... } } }`. Use component `defaults` when variant/theme/mode/size are omitted.
- **build_component (intended behavior):** Apply the spec from get_specs **to the letter**: same structure (DOM + classes), same template (sections/items/icons when present), same layout/spacing/gaps, same states. Use **guidance** for behavior and composition only; no deviations from the spec.

### Spec contract

- **Location:** [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md)
- **Contents:** Canonical JSON schema, states contract (all states always documented), usage patterns and guidelines, defaults, and how MCP uses this for the four build targets (component, template, recipe, apply tokens to framework).

### Canonical spec data (no script regeneration)

The canonical format uses **specs** (not legacy `buildSpecs`) with hardcoded, resolved values. Component JSON files (e.g. `card.json`, `rightsidebar.json`) are the source of truth. They are authored manually from tokens + component CSS (see [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md) § 1.3 Provenance), or by one auditable script. **Do not** run `generate-build-specs` or other spec-extraction scripts for this data; get_specs reads `specs` and `guidance` directly from the component JSON.

## Regenerating MCP Data

**Automated:** When you push to `main` (e.g. after changing components, styles, or tokens), CI runs one workflow that regenerates both MCP and changelog data and pushes a single commit. You do not need to run any scripts or commit `mcp-data/` or `changelog-data/` yourself—doing that can cause branch divergence.

**After you push:** In Cursor (or your Git app), use **Pull** or **Sync** once so your computer has CI’s latest commit. That keeps you in sync and avoids “diverged” messages.

## Guidelines Structure

The `mcp-data/guidelines/` directory contains structured rules and best practices for the Harmony Design System. These guidelines help AI and developers understand Harmony's conventions and create consistent components.

### Available Guidelines

#### 1. **category-rules.json** ✨ NEW
Category-specific patterns and rules for different component types:

- **Forms**: Field composition patterns, validation strategies, form layouts
- **Display**: Content hierarchy, status indicators, interactive display components
- **Layout**: Spacing responsibility, composition patterns, when to create layout components
- **Navigation**: Navigation hierarchy, shell composition
- **Feedback**: Feedback types (alerts, dialogs, loading indicators)
- **Atomic Design Mapping**: How Harmony components map to atomic levels (atoms, molecules, organisms, templates)
- **Category Classification**: Criteria for assigning components to categories

**Key Features:**
- Form field composition pattern (Label + Input + Helper + Error)
- Layout spacing ownership rules (layouts control gaps, components have no margins)
- Forms vs Layouts decision matrix (CheckboxGroup = form, ButtonGroup = layout)
- Atomic design hierarchy for all 49 components
- Slots vs props guidance (content = slots, configuration = props)

#### 2. **component-rules.json**
General component creation rules:

- **Atomic Design Hierarchy** ✨ NEW: Component complexity levels and dependency rules
- **Variants**: Maximum variants (6-9), semantic naming, consistency
- **Icons**: Icon component usage, positioning, default icons
- **Sizing**: Standard size scale (xs, sm, md, lg)
- **Props**: Required props (class, disabled, error, required)
- **Composition** ✨ EXPANDED: Slots vs props, slot naming, compound components, wrapper patterns
- **States**: Loading, boolean modifiers, ARIA attributes
- **Accessibility**: Semantic HTML, ARIA labels, keyboard support, focus indicators
- **Styling**: BEM naming, class composition, CSS variables

#### 3. **token-rules.json**
Design token usage rules:

- **Spacing**: 4px grid system, no arbitrary values, spacing patterns
- **Border Radius**: Numbered convention (radius-04, radius-08, etc.)
- **Colors**: Semantic tokens, categories (theme, surface, text, border)
- **Typography**: Font families (Lexend, Figtree, JetBrains Mono), text styles
- **Elevations**: Shadow hierarchy, component defaults

#### 4. **theme-rules.json**
Theme-specific composition rules:

- **CP Theme**: FloatingNav + no footer + 88px top padding
- **VP/PPM/Maconomy Themes**: Footer + no FloatingNav + 20px top padding
- **Grid Structure**: 2-row (CP) vs 3-row (VP/PPM/Maconomy)
- **Responsive Behavior**: Breakpoints, sidebar visibility
- **Common Patterns**: Shared spacing tokens, positioning

#### 5. **decisions.json**
Design decision log with rationale:

- **New Decisions** ✨:
  - Why functional categories (form, display, navigation) over Atomic Design terminology
  - Forms vs Layouts categorization criteria
  - Slots vs props philosophy
- **Existing Decisions**:
  - 4px spacing base (vs 8px)
  - Maximum 6 button variants
  - Icon component abstraction
  - Numbered radius convention
  - Semantic color tokens
  - CP FloatingNav pattern
  - Vanilla CSS architecture
  - MCP data structure

### How AI Uses Guidelines

When generating components, AI should:

1. **Check Category Classification** (`category-rules.json`)
   - Determine if component is form, display, layout, navigation, or feedback
   - Follow category-specific patterns

2. **Apply Component Rules** (`component-rules.json`)
   - Respect atomic design hierarchy (atoms → molecules → organisms)
   - Use correct prop patterns (class, disabled, error)
   - Choose slots for content, props for configuration

3. **Use Token Rules** (`token-rules.json`)
   - Apply 4px spacing grid (var(--space-4), var(--space-6))
   - Use semantic colors (var(--theme-primary), var(--text-title))
   - Follow typography hierarchy

4. **Respect Theme Rules** (`theme-rules.json`)
   - Include FloatingNav for CP theme
   - Include Footer for VP/PPM/Maconomy themes
   - Apply correct top padding per theme

5. **Reference Decisions** (`decisions.json`)
   - Understand the "why" behind rules
   - Follow established patterns with documented rationale

### Example: Creating a Form Component

Using the guidelines to create a new form input component:

1. **Category Classification** (category-rules.json):
   - Component accepts user input → `form` category
   - Follow form field composition pattern

2. **Atomic Level** (component-rules.json):
   - Composes Label + Icon + input → `molecule` level
   - Can depend on Icon (atom) and Label (atom)

3. **Props** (component-rules.json):
   - Required: `class` (for styling), `disabled`, `error`, `errorMessage`
   - Optional: `label`, `icon`, `required`, `placeholder`

4. **Composition** (category-rules.json):
   - Structure: Label (optional) → Input wrapper (Icon + input + error message)
   - Error message replaces helper text when present

5. **Tokens** (token-rules.json):
   - Padding: `var(--space-2)` vertical, `var(--space-4)` horizontal
   - Border radius: `var(--radius-08)`
   - Colors: `var(--input-background)`, `var(--text-title)`

6. **Result**: Consistent with existing Input component pattern

### Guidelines Discovery

DSManager tools can expose these guidelines:

```javascript
// Hypothetical DSManager tools
get_harmony_guidelines({ category: "form" })
search_harmony_guidelines({ query: "form validation patterns" })
get_category_classification({ componentName: "CheckboxGroup" })
```

## Data Structure

```
mcp-data/
├── design-tokens.json          # All design tokens (31.5 KB)
├── manifest.json               # Component & layout index, stats
├── components.json             # Legacy: all components in one file
├── components/                 # Individual component files
│   ├── button.json
│   ├── card.json
│   ├── dialog.json
│   └── ... (49 total)
├── layouts/                    # Layout composition data
│   └── shelllayout.json        # ShellLayout theme-specific data
├── guidelines/                 # Design system rules & best practices
│   ├── component-rules.json    # Component creation rules (variants, props, composition)
│   ├── token-rules.json        # Design token usage rules (spacing, colors, typography)
│   ├── theme-rules.json        # Theme-specific composition rules
│   ├── category-rules.json     # Category-specific patterns (forms, layouts, etc.) ✨ NEW
│   └── decisions.json          # Design decision log with rationale
└── icon-mappings/              # Theme-specific icon name → path (e.g. cp-default.json)
```

### Icon Handling in MCP Data

Component JSON (e.g. sidebar `defaultSections` items) can include:

- **iconPath** – Repo-relative path to the SVG file (e.g. `node_modules/heroicons/24/outline/bell.svg`, `public/RS_DelaDefault.svg`). For reference only when `iconSvg` is missing.
- **iconSvg** – Inner SVG content (everything between `<svg>` tags) embedded at generation time so MCP data is self-contained.

**MCP consumers should prefer `iconSvg` over `iconPath` when present.** Use `iconSvg` to output or render icon SVG without resolving files at runtime. Use `iconPath` only when `iconSvg` is absent (e.g. for display or debugging). `npm run generate:mcp-data` runs after `npm install` and embeds `iconSvg` for heroicons, tabler, and custom icons when the files exist.

### cssClassStyles and design tokens

**cssClassStyles** in component JSON use design tokens (`var(--space-*)`, `var(--radius-*)`, etc.) where the source CSS does, so get_specs and build_component align on token-based values. Consumers should have design-token CSS loaded when using build_component output.

## Layout MCP Data

The `mcp-data/layouts/` directory contains comprehensive layout composition data that enables AI to build theme-specific applications correctly.

### ShellLayout Data

`shelllayout.json` includes:

**Theme-Specific Composition** - Exact component usage for each theme:
- **CP theme**: FloatingNav + no footer + 88px top padding
- **VP theme**: Footer + no FloatingNav + 20px top padding  
- **PPM theme**: Footer + no FloatingNav + 20px top padding
- **Maconomy theme**: Footer + no FloatingNav + 20px top padding

**Spacing Tokens** - All layout-specific spacing with CSS values:
- `--shell-header-height: 56px`
- `--shell-footer-height-default: 48px`
- `--shell-layout-padding-top: 88px` (CP with FloatingNav)
- `--shell-layout-padding-side-default: 52px`
- Responsive variants (tablet: 32px, mobile: 16px)

**Grid Structure** - CSS Grid configuration:
- With footer: `header 1fr footer` (VP/PPM/Maconomy)
- Without footer: `header 1fr` (CP)

**Component Positioning** - Fixed/relative positioning for all shell components:
- Header: Fixed at top, z-index 50
- FloatingNav: Fixed below header, z-index 40 (CP only)
- Sidebars: Fixed left/right, z-index 45
- Main: Relative, scrollable, grid row 2
- Footer: Relative, grid row 3 (VP/PPM/Maconomy only)
- Panels: Fixed, z-index 30 (optional)

**Responsive Behavior** - Breakpoint-specific changes:
- Mobile (`≤768px`): Hide sidebars, 16px side padding
- Tablet (`≤1024px`): Keep sidebars, 32px side padding
- Desktop: Full layout, 52px side padding

**Main Content Padding** - Different per theme:
- CP: `88px 72px 24px 72px` (accounts for FloatingNav)
- VP/PPM/Maconomy: `20px 72px 24px 72px` (no FloatingNav)

### How AI Uses Layout Data

When generating applications, AI should:

1. **Detect theme** from user requirements or context
2. **Read layout composition** from `shelllayout.json`
3. **Include correct components** based on theme (FloatingNav for CP, Footer for others)
4. **Apply proper spacing** using token references from layout data
5. **Set grid structure** matching theme requirements
6. **Handle responsive** breakpoints as specified

This ensures generated code matches Harmony's theme-specific layouts exactly.

## Troubleshooting

### "Harmony tools not available"

**Cause**: HarmonyDataAdapter couldn't find `mcp-data/`

**Solutions:**

1. **For remote users**: Ensure harmonycomponents repo is cloned
   ```bash
   ls /tmp/dsmanager-cache/harmonycomponents/mcp-data/
   ```

2. **For local dev**: Ensure projects are siblings
   ```bash
   ls /Users/francesmunoz/Desktop/harmonycomponents/mcp-data/
   ```

3. **Override path**: Set environment variable
   ```json
   "env": {
     "HARMONY_MCP_DATA_PATH": "/custom/path/mcp-data"
   }
   ```

### "Component data is stale"

Regenerate and commit:
```bash
cd harmonycomponents
npm run generate:mcp-data
git add mcp-data/
git commit -m "chore: update MCP data"
git push
```

## Benefits

✅ **Fast**: Pre-generated JSON is 10-100x faster than parsing .astro files
✅ **Rich Data**: Includes structure, slots, spacing, and dependencies
✅ **Git-Friendly**: Data is committed and versioned
✅ **Auto-Discovery**: Works for both local dev and remote designers
✅ **No Setup**: Designers get tools automatically when they clone

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DSManager (MCP Server)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐         ┌────────────────────────┐ │
│  │ Generic Tools      │         │ Harmony Tools          │ │
│  │ (13 tools)         │         │ (5 tools) ✨           │ │
│  ├────────────────────┤         ├────────────────────────┤ │
│  │ • list_components  │         │ • get_component_basic  │ │
│  │ • get_component    │         │ • get_dependencies     │ │
│  │ • save_component   │         │ • get_design_tokens    │ │
│  │ • preview_component│         │ • get_component_structure
│  │ • watch_component  │         │ • get_layout_data      │ │
│  │ • sync_now         │         │                        │ │
│  │ • etc...           │         │                        │ │
│  └────────────────────┘         └────────────────────────┘ │
│           │                               │                 │
│           ▼                               ▼                 │
│  ┌────────────────────┐         ┌────────────────────────┐ │
│  │ Parses .astro      │         │ Reads JSON             │ │
│  │ files on-the-fly   │         │ (pre-generated)        │ │
│  └────────────────────┘         └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│ Git Cloned Repo     │         │ mcp-data/                   │
│ /tmp/dsmanager-cache│         │ (in Git, auto-discovered)   │
│                     │         │                             │
│ harmonycomponents/  │         │ • design-tokens.json        │
│ ├── src/            │         │ • manifest.json             │
│ ├── components/     │         │ • components/*.json         │
│ ├── layouts/        │         │   (49 files)                │
│ └── ...             │         │ • layouts/*.json            │
│                     │         │   (ShellLayout)             │
└─────────────────────┘         └─────────────────────────────┘
```

## Handling Variant Data Display

Component JSON files have variant data stored in `visualSpecifications.colors.variants`, but not all components have complete variant data with all states. Additionally, many components have child element states stored separately in `cssClassStyles`.

### Understanding Variant Data Completeness

Components can have different levels of variant data completeness:

1. **Full Variants**: All variants have all states (default, hover, active, focus, disabled) - Example: Button
2. **Mixed Completeness**: Different variants have different state completeness - Example: Alert (some variants only have default, others have default + hover)
3. **Default-Only Variants**: All variants only have default state - Example: LeftSidebar, Card, Dialog
4. **Empty Variants**: Empty variants object `{}` - Example: Spinner, Toggle

See [VARIANT_DATA_PATTERNS.md](docs/VARIANT_DATA_PATTERNS.md) for detailed documentation of these patterns.

### How to Check if Variants Exist

```javascript
if (component.visualSpecifications?.colors?.variants && 
    Object.keys(component.visualSpecifications.colors.variants).length > 0) {
  // Variants exist
}
```

### How to Handle Per-Variant State Completeness

Check states per variant and only show states that exist:

```javascript
const variants = component.visualSpecifications?.colors?.variants || {};

if (Object.keys(variants).length > 0) {
  for (const [variantName, variantData] of Object.entries(variants)) {
    // Check states for a specific theme and mode
    const states = Object.keys(variantData.cp?.light || {});
    
    // Only show states that exist
    if (states.includes('default')) { /* show default */ }
    if (states.includes('hover')) { /* show hover */ }
    if (states.includes('active')) { /* show active */ }
    if (states.includes('focus')) { /* show focus */ }
    if (states.includes('disabled')) { /* show disabled */ }
    
    // Do NOT show empty state sections for states that don't exist
  }
}
```

### How to Handle Empty Variants

If variants object is empty:

```javascript
if (Object.keys(variants).length === 0) {
  // Option 1: Skip variant section entirely
  // Option 2: Show message: "No variant styling data available"
}
```

### Important: Check Both Variant Colors AND Child Element States

Many components have nested child components with their own states, even when variant colors only show default. These are stored in `cssClassStyles`, not in `colors.variants`.

**Component-level variant colors** (`colors.variants`):
- May only have default state
- Represents variant-level styling

**Child element states** (`cssClassStyles`):
- Hover, active, focus, disabled for nested components
- Examples: `.left-sidebar__item--active`, `.dialog__close:hover`, `.card--interactive:hover`

**Example Implementation**:

```javascript
// Check variant colors
const variantColors = component.visualSpecifications?.colors?.variants || {};
if (Object.keys(variantColors).length > 0) {
  // Display variant colors (only show states that exist)
  for (const [variantName, variantData] of Object.entries(variantColors)) {
    const states = Object.keys(variantData.cp?.light || {});
    // Display only existing states
  }
}

// Also check cssClassStyles for child element states
const cssClassStyles = component.cssClassStyles || {};
if (cssClassStyles) {
  // Look for child element states
  // Pattern: .component__child:hover, .component__child--active, etc.
  for (const [selector, styles] of Object.entries(cssClassStyles)) {
    if (selector.includes('__') || selector.includes('--')) {
      if (selector.includes(':hover') || selector.includes('--active')) {
        // This is a child element state
        // Display it appropriately
      }
    }
  }
}
```

### Common Patterns

**LeftSidebar Example**:
- Variant colors: Only default state (variants are theme configurations)
- Child element states: `.left-sidebar__item--active`, `.left-sidebar__item:hover`
- **Display both**: Variant colors (default only) AND child element states (active, hover)

**Alert Example**:
- `info` variant: Only default state
- `enhanced` variant: Default + hover states
- **Display**: Only show states that exist for each variant

**Button Example**:
- All variants: All states (default, hover, active, focus, disabled)
- **Display**: All states for all variants

### Validation

Run the validation script to see variant data completeness for all components:

```bash
node scripts/validate-variant-data.js
```

This generates `variant-data-report.json` with detailed analysis.

For more information, see [VARIANT_DATA_PATTERNS.md](docs/VARIANT_DATA_PATTERNS.md).

## Summary

**Designers** → Clone from Git → Get `mcp-data/` automatically → 5 Harmony tools work
**Developers** → Regenerate data → Commit to Git → Push → Designers get updates

No special setup required for designers! 🎉
