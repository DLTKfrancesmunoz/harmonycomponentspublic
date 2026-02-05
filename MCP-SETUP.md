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

For **exact builds** (component, template, recipe, or apply tokens to a framework), use the canonical build spec so the AI applies values verbatim with no deviations. Global rules (fonts, icons, themes, modes, spacing, typography) are defined in [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md) and in component JSON under `specs` and root-level fields.

### Canonical spec and guidance (per component)

- **Location:** Each component JSON in `mcp-data/components-v2/*.json` uses the **canonical format** (see [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md) and [docs/COMPONENT_JSON_V2.md](docs/COMPONENT_JSON_V2.md)). Optional props with no default use `default: null` in the props schema; other defaults are the value as in source (e.g. `'primary'`, `'md'`, `false`). Spec payload values must not be null.
  - **specs** – One complete spec per dimension combination. When component JSON includes **specKeyOrder** and **dimensionDefaults**, keys are built by joining dimension values in that order (e.g. Alert `info-default-cp-light`, `info-enhanced-cp-light`; Button `primary-cp-light-md-theme`). When absent, keys follow `[variant]-[theme]-[mode]-[size]` (e.g. `primary-cp-light-md`, `cp-light`). Each value is one complete spec object: props, layout (with gap), spacing, dimensions, typography, borders, states (default, hover, active, focus, disabled, item/icon/label where applicable), icons; and when applicable **template** (exact default content, e.g. sections/items/icons) and **structure** (DOM + BEM classes). All values are resolved (no null, no transparent, no `var()`).
  - **guidance** – `patterns` (behavior: icon-only, loading, href) and `guidelines` (when to use, composition, anti-patterns).
- **get_specs / get_build_spec (intended behavior):** Read **only** `specs` and `guidance` from the component JSON. Accept full dimension params: componentName (required); variant, theme, mode, size, buttonType, **style**, **headerVariant**, **width** (all optional). When **specKeyOrder** is present, resolve dimensions from params then `dimensionDefaults` (or `defaults`), build the key in that order, and return `specs[key]`. When absent, use legacy key from variant, theme, mode, size. Return **one** spec plus **guidance**, e.g. `{ buildSpec: { ... }, defaultsUsed?: { variant, theme, mode, size, style?, ... }, guidance: { patterns: { ... }, guidelines: { ... } } }`.
- **build_component (intended behavior):** Apply the spec from get_specs **to the letter**: same structure (DOM + classes), same template (sections/items/icons when present), same layout/spacing/gaps, same states. Accept the same optional dimensions (style, headerVariant, width, etc.). Use **guidance** for behavior and composition only; no deviations from the spec.

### Spec contract

- **Location:** [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md)
- **Contents:** Canonical JSON schema, states contract (all states always documented), usage patterns and guidelines, defaults, and how MCP uses this for the four build targets (component, template, recipe, apply tokens to framework).

### Canonical spec data (no script regeneration)

The canonical format uses **specs** (not legacy `buildSpecs`) with hardcoded, resolved values. Component JSON files (e.g. `card.json`, `rightsidebar.json`) are the source of truth. They are authored manually from tokens + component CSS (see [docs/SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md) § 1.3 Provenance), or by one auditable script. **Do not** run `generate-build-specs` or other spec-extraction scripts for this data; get_specs reads `specs` and `guidance` directly from the component JSON.

## Regenerating MCP Data

**Automated:** When you push to `main` (e.g. after changing components, styles, tokens, or layouts), CI runs:

1. **components-v2** — `npm run generate:specs` (from Astro components + tokens)
2. **layouts** — `npm run generate:layouts` (from ShellLayout.astro)
3. **changelog** — `npm run changelog`

You do not need to run these scripts or commit `mcp-data/` or `changelog-data/` yourself—doing that can cause branch divergence.

**After you push:** Pull or sync once so your computer has CI's latest commit.

**Local regeneration:**

```bash
npm run generate:specs    # Regenerate mcp-data/components-v2/
npm run generate:layouts  # Regenerate mcp-data/layouts/
```

## What the MCP Reads

The Harmony MCP reads only these paths under `mcp-data/`:

| Path | Purpose |
|------|---------|
| **components-v2/*.json** | Component specs (get_specs, build_component). One file per component. |
| **layouts/** | Layout composition (e.g. shelllayout.json). Used for componentType: "layout". |
| **recipes/** | Recipe index and category files. Used for harmony://recipes and recipe helpers. |
| **icon-mappings/** | Theme-specific icon mappings (e.g. cp-default.json). Used during build. |

The **default-content/** folder is input to `generate-specs.js` (template content for sidebars, etc.); it is not read by the MCP at runtime.

## Data Structure

```
mcp-data/
├── components-v2/        # Component specs (MCP reads these)
│   ├── button.json
│   ├── card.json
│   ├── rightsidebar.json
│   └── ... (47 total)
├── default-content/      # Input to generate-specs; not read by MCP at runtime
├── layouts/              # Layout composition (MCP reads)
│   └── shelllayout.json
├── recipes/              # Recipe index and category files (MCP reads)
│   ├── index.json
│   └── ... (by category)
└── icon-mappings/        # Theme-specific icon mappings (MCP reads, e.g. cp-default.json)
```

### Icon handling in component JSON

Component JSON can include **iconPath** (repo-relative path) or **iconSvg** (embedded SVG). MCP consumers should prefer **iconSvg** when present. Icon content is embedded when running `npm run generate:specs`.

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
npm run generate:specs
npm run generate:layouts
git add mcp-data/ changelog-data/
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
│ harmonycomponents/  │         │ • components-v2/*.json      │
│ ├── src/            │         │ • layouts/*.json            │
│ ├── layouts/        │         │ • recipes/, icon-mappings/  │
│ └── ...             │         │                             │
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

See [SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md) for the canonical spec format and states contract.

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

For more information, see [SPEC_CONTRACT.md](docs/SPEC_CONTRACT.md).

## Summary

**Designers** → Clone from Git → Get `mcp-data/` automatically → 5 Harmony tools work
**Developers** → Regenerate data → Commit to Git → Push → Designers get updates

No special setup required for designers! 🎉
