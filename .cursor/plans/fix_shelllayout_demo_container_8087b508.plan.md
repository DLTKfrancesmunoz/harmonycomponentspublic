---
name: Fix ShellLayout Demo Container
overview: Increase container height to show footer, remove transform/isolation to fix right sidebar positioning, and remove the content wrapper div to make cards full width.
todos: [{'id': 'fix-container-layout', 'content': 'Update container height to 100vh and remove transform/isolation in layout.astro', 'dependencies': []}, {'id': 'remove-content-wrapper-layout', 'content': 'Remove shell-demo-content wrapper div and CSS in layout.astro', 'dependencies': []}, {'id': 'fix-container-page-header', 'content': 'Update container height to 100vh and remove transform/isolation in page-header.astro', 'dependencies': []}]
---

# Fix ShellLayout Demo Container

## Problem

The container height of `700px` is constraining the shell layout which uses `height: 100vh` and grid layout. This causes:
- Main content area (`shell-layout__main`) to be constrained, cutting off content
- Footer to be hidden
- Right sidebar positioning broken due to transform creating new containing block

## Changes Needed

1. **Increase container height** - Change from `700px` to `100vh` so shell layout can use full viewport height
2. **Fix right sidebar** - Remove `transform: translateZ(0)` and `isolation: isolate` from container
3. **Full width content** - Remove the `<div class="shell-demo-content">` wrapper so cards span full width

## Files to Modify

### `src/pages/shell/layout.astro`

1. **Update `.shell-demo-container` CSS (lines 321-332):**
   - Change `height: 700px` to `height: 100vh`
   - Remove `transform: translateZ(0);`
   - Remove `isolation: isolate;`
   - Keep: border, shadow, background, overflow, position

2. **Remove content wrapper:**
   - Remove `<div class="shell-demo-content">` opening tag (line 66)
   - Remove `</div>` closing tag (line 104)
   - Keep all Card content directly inside ShellLayout slot

3. **Remove `.shell-demo-content` CSS (lines 334-337)**

### `src/pages/shell/page-header.astro`

1. **Update `.shell-demo-container` CSS (around line 449):**
   - Change `height: 500px` to `height: 100vh`
   - Remove `transform: translateZ(0);`
   - Remove `isolation: isolate;`

## Expected Result

- Container allows shell layout to use full viewport height
- Main content area (`shell-layout__main`) has full height available
- Footer is visible
- Right sidebar is vertically centered on viewport (not touching header/footer)
- Page content cards span full width like the actual component
