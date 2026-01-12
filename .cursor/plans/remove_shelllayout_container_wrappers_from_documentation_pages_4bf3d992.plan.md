---
name: Fix ShellLayout Container Stacking Context Issues
overview: Fix the `.shell-demo-container` CSS to keep visual styling (border, shadow, height) while removing properties that create stacking contexts and break fixed positioning.
todos: [{'id': 'fix-css-layout', 'content': 'Remove transform and isolation from .shell-demo-container in src/pages/shell/layout.astro', 'dependencies': []}, {'id': 'fix-css-page-header', 'content': 'Remove transform and isolation from .shell-demo-container in src/pages/shell/page-header.astro', 'dependencies': []}]
---

# Fix ShellLayout Container Stacking Context Issues

## Problem

The `.shell-demo-container` wrapper provides necessary visual styling (border, shadow, height constraint) but includes CSS properties that create new stacking contexts:
- `transform: translateZ(0)` - Creates a new containing block for fixed positioning
- `isolation: isolate` - Creates a new stacking context

These break:
- Fixed positioning (sidebars go behind header instead of below it)
- Z-index hierarchy (layering issues)
- Content layout (page content cards not positioned correctly)

The container itself is needed for the visual box/border around the demo.

## Solution

Keep the container and its visual styling, but remove the properties that break fixed positioning:
- Remove `transform: translateZ(0)`
- Remove `isolation: isolate`
- Keep `position: relative` (doesn't affect fixed positioning)
- Keep all visual styling (border, shadow, background, height, overflow)

## Files to Modify

### 1. `src/pages/shell/layout.astro`

**Update CSS (lines 321-332):**
```css
.shell-demo-container {
  height: 700px;
  width: 100%;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--page-bg);
  position: relative;
  /* Removed: transform: translateZ(0); - breaks fixed positioning */
  /* Removed: isolation: isolate; - breaks stacking context */
}
```

### 2. `src/pages/shell/page-header.astro`

**Update CSS (around line 449):**
```css
.shell-demo-container {
  height: 500px;
  width: 100%;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--page-bg);
  position: relative;
  /* Removed: transform: translateZ(0); - breaks fixed positioning */
  /* Removed: isolation: isolate; - breaks stacking context */
}
```

## Implementation Details

1. **Keep the container divs** - They provide necessary visual containment
2. **Remove only the problematic CSS properties:**
   - `transform: translateZ(0)` - This creates a new containing block that makes fixed elements position relative to the container instead of viewport
   - `isolation: isolate` - This creates a new stacking context that breaks z-index
3. **Keep all other properties:**
   - `position: relative` - Safe, doesn't affect fixed positioning
   - `height`, `width`, `border`, `box-shadow`, `background`, `overflow` - All needed for visual styling

## Expected Result

- Container still provides visual box/border around the demo
- Fixed positioning works correctly (sidebars appear below header, not behind it)
- Z-index hierarchy works correctly
- Page content cards are positioned correctly
- All layout issues resolved while maintaining visual containment
