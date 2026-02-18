# Installing Components Only

This guide explains how to clone only the Harmony Design System components without the full documentation site.

**When to use this:** Use sparse checkout when you need a clone of the repo (e.g. components-only embed or design-system work). For most app projects, install Harmony as a package from Git instead; see the [Consumer Guide](docs/customization/CONSUMER_GUIDE.md#two-ways-to-get-harmony).

## What is Sparse Checkout?

Git sparse checkout allows you to clone only specific directories from a repository, reducing download size and excluding files you don't need. This is perfect for when you only want the components, styles, and tokens without the documentation site.

## Quick Start

```bash
# Clone only components (not documentation site)
git clone --filter=blob:none --sparse <repo-url> harmony-components
cd harmony-components
git sparse-checkout init --cone
git sparse-checkout set src/components src/styles src/tokens public README.md package.json
```

Replace `<repo-url>` with your actual repository URL.

## What Gets Included

When you use sparse checkout with the command above, you'll get:

- **`src/components/`** - All UI components (48 components)
  - `src/components/ui/` - All component files
  - `src/components/ui/index.ts` - Component exports

- **`src/styles/`** - All CSS files
  - `global.css` - Main stylesheet (import this first)
  - `tokens.css` - Design tokens (colors, spacing, typography)
  - `components.css` - Component styles
  - `layout.css` - Layout styles
  - `reset.css` - CSS reset
  - `utilities.css` - Utility classes

- **`src/tokens/`** - Design tokens
  - `colors.json` - Color tokens
  - `typography.json` - Typography tokens
  - `spacing.json` - Spacing tokens
  - `elevations.json` - Shadow/elevation tokens

- **`public/`** - Assets and icons
  - `logos/` - Product logos
  - SVG icons and assets

- **`README.md`** - Documentation

- **`package.json`** - Dependencies

## Icons and assets

The `Icon` component resolves icons in this order:

1. **Heroicons (default)** – primary icon library (`heroicons` npm package).
2. **Tabler** – used only when a Hero icon is not mapped, the icon is not in the Hero library, or otherwise specified (`@tabler/icons` npm package).
3. **Custom** – `public/{name}.svg` for design-system–specific icons.
4. **Visual fallback** – "?" with `--icon-fallback-*` styling when none of the above resolve.

**Pin** is the only Tabler icon used so far. It appears in ShellFooter (active tab) and FloatingNav (pin button) and resolves from Tabler when `@tabler/icons` is installed.

**Required npm dependencies** when using Icon, LeftSidebar, RightSidebar, ShellFooter, or FloatingNav:

- `heroicons`
- `@tabler/icons`

**Required public assets** when using default section configs (filenames must match exactly):

- Custom SVGs: `Risk Shield.svg`, `Report.svg`, `Resource.svg`, `related.svg`, `template.svg`, `mic-slash.svg` (and `pin.svg` only if you do not install `@tabler/icons`).
- Logos: `D_64x64.svg` (right sidebar logo, in public root); `logos/CPVPLogo.svg` if using ShellHeader’s default `logoSrc`.

**Sparse checkout vs copy:**

- **Sparse checkout and build from repo root:** Include `public` in the sparse set and run `npm install` (so `heroicons` and `@tabler/icons` are present). No extra steps.
- **Copying components into another project:** Add `heroicons` and `@tabler/icons` to that project, and place the required SVGs above (or the full design-system `public/`) into that project’s `public/` (or equivalent static root).

## What Gets Excluded

The following are NOT included (documentation site files):

- `src/pages/` - Documentation pages
- `src/layouts/DocsLayout.astro` - Documentation layout
- `src/components/ComponentDoc.astro` - Documentation components
- `src/data/` - Documentation data
- `astro.config.mjs` - Astro configuration (for docs site)
- `scripts/` - Build scripts (optional, but not needed for components)

## Using the Components

### 1. Install Dependencies

```bash
npm install
```

### 2. Import Styles

Always import the global CSS file first to get all design tokens and component styles:

```astro
---
import '../styles/global.css';
---
```

Or in your main CSS file:

```css
@import './src/styles/global.css';
```

### 3. Import Components

Import components from the ui directory:

```astro
---
import { Button, Card, Dialog } from './src/components/ui';
---
```

### 4. Apply Theme

Set the theme and color mode:

```html
<html class="theme-cp dark">
  <!-- Your content -->
</html>
```

Or programmatically:

```javascript
// Apply theme
document.documentElement.classList.add('theme-cp');

// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

Available themes: `cp`, `vp`, `ppm`, `maconomy`

### 5. Use ShellLayout (Optional)

For full application shell:

```astro
---
import ShellLayout from './src/layouts/ShellLayout.astro';
import { Card } from './src/components/ui';
---

<ShellLayout
  productName="My App"
  logoSrc="/logos/CPVPLogo.svg"
  companyName="Acme Corp"
  pageHeaderTitle="Dashboard"
>
  <Card>
    <div class="card__body">
      Your content here
    </div>
  </Card>
</ShellLayout>
```

**Important**: When using ShellLayout, the component automatically applies correct spacing to the main content area. Do NOT add custom padding to content inside ShellLayout - use design tokens for internal spacing only.

## Key Rules

### Shell Layout Spacing

When using ShellLayout, content inside the main area MUST respect spacing tokens:

- **With FloatingNav** (CP theme):
  - Top: `var(--shell-layout-padding-top)` (88px)
  - Sides: `calc(var(--shell-layout-padding-side-default) + var(--space-5))` (72px)
  - Bottom: `var(--space-6)` (24px)

- **Without FloatingNav** (VP, PPM, Maconomy):
  - Top: `var(--space-5)` (20px)
  - Sides: `calc(var(--shell-layout-padding-side-default) + var(--space-5))` (72px)
  - Bottom: `var(--space-6)` (24px)

**Note**: ShellLayout automatically applies these paddings. Do NOT add custom padding to content inside ShellLayout.

### Design Tokens

Always use design tokens instead of fixed values:

- Spacing: `var(--space-1)` through `var(--space-24)`
- Colors: `var(--text-primary)`, `var(--theme-primary)`, etc.
- Typography: `var(--text-base)`, `var(--heading-xl)`, etc.

### Theming

- All components are theme-aware and support light/dark modes
- Test components in both light and dark modes
- Ensure components work with all 4 themes (cp, vp, ppm, maconomy)

## Alternative: Manual File Copy

If you prefer not to use sparse checkout, you can manually copy the needed directories:

```bash
# After cloning the full repo
cp -r src/components your-project/
cp -r src/styles your-project/
cp -r src/tokens your-project/
cp -r public your-project/
cp README.md your-project/
cp package.json your-project/
```

## Support

For questions or issues:
1. Review component examples in the documentation site (if you have access)
2. Check component source files in `src/components/ui/` for prop definitions and usage
