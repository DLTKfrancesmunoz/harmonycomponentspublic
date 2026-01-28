# Setting Up Customization in Your Project

**Guide for projects that consume `@deltek/harmony-components` and need to customize components safely.**

This guide explains how to set up the four-tier customization system in your project.

---

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Directory Structure](#directory-structure)
4. [Helper Scripts](#helper-scripts)
5. [Package.json Scripts](#packagejson-scripts)
6. [Your First Customization](#your-first-customization)
7. [Verification](#verification)

---

## Overview

The customization system allows you to:
- Override CSS design tokens (Tier 0)
- Use components directly (Tier 1)
- Create wrapper components (Tier 2)
- Fork components when necessary (Tier 3)

All while keeping your customizations **safe, persistent, and production-ready**.

---

## Initial Setup

### Step 1: Install Harmony Components

```bash
npm install github:DLTKfrancesmunoz/harmonycomponents
```

### Step 2: Copy Helper Scripts

Copy the helper scripts from Harmony to your project:

```bash
# Create scripts directory if it doesn't exist
mkdir -p scripts

# Copy the three helper scripts
cp node_modules/@deltek/harmony-components/scripts/copy-harmony-component.cjs scripts/
cp node_modules/@deltek/harmony-components/scripts/check-harmony-updates.cjs scripts/
cp node_modules/@deltek/harmony-components/scripts/diff-harmony-component.cjs scripts/
```

### Step 3: Add Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "harmony:copy": "node scripts/copy-harmony-component.cjs",
    "harmony:check-updates": "node scripts/check-harmony-updates.cjs",
    "harmony:diff": "node scripts/diff-harmony-component.cjs"
  }
}
```

---

## Directory Structure

Create the following directory structure in your project:

```
your-project/
├── src/
│   ├── components/
│   │   ├── harmony/          # Tier 3: Forked components (create when needed)
│   │   │   ├── README.md
│   │   │   └── .harmony-sync.json
│   │   │
│   │   └── composed/         # Tier 2: Wrapper components (create when needed)
│   │       └── README.md
│   │
│   └── styles/
│       └── theme-myproject.css   # Tier 0: CSS overrides (create this)
│
├── scripts/                  # Helper scripts (copied from Harmony)
│   ├── copy-harmony-component.cjs
│   ├── check-harmony-updates.cjs
│   └── diff-harmony-component.cjs
│
└── docs/                     # Optional: Link to Harmony docs
```

### Create Tier 0: Theme File

Create `src/styles/theme-myproject.css`:

```css
/**
 * Project Theme Overrides
 *
 * Tier 0 customization: Override Harmony design tokens with CSS variables.
 * This is the preferred customization method when possible.
 */

html.theme-myproject {
  /* Brand Colors */
  --theme-primary: #4C92D9;
  --theme-primary-hover: #3D7BC4;
  --theme-secondary: #FF6B35;

  /* Component Overrides */
  --btn-border-radius: 8px;
  --card-padding: var(--space-6);
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

Apply the theme in your layout:

```astro
---
import '@deltek/harmony-components/styles/global.css';
import '../styles/theme-myproject.css';
---

<html class="theme-myproject">
  <!-- Your content -->
</html>
```

### Create Tier 2: Composed Components Directory

Create `src/components/composed/README.md`:

```markdown
# Wrapper Components (Tier 2)

This folder contains wrapper components that extend Harmony components
with additional behavior, props, or project-specific defaults.

See: @deltek/harmony-components/docs/customization/COMPONENT_PATTERNS.md

## Examples
- TrackedButton.astro - Button with analytics tracking
- ProjectCard.astro - Card with project-specific status display
```

### Create Tier 3: Harmony Forks Directory (When Needed)

Only create this when you need to fork a component:

Create `src/components/harmony/README.md`:

```markdown
# Forked Harmony Components (Tier 3)

This folder contains forked Harmony components that have been modified
to add custom props or change markup structure.

**Use as last resort.** Try Tier 0, 1, or 2 first.

See: @deltek/harmony-components/docs/customization/CUSTOMIZATION_GUIDE.md

## Tracking
See .harmony-sync.json for tracking fork versions and customizations.
```

Create `src/components/harmony/.harmony-sync.json`:

```json
{
  "lastChecked": "2026-01-28",
  "harmonyVersion": "1.0.0",
  "overrides": []
}
```

---

## Helper Scripts

You now have three helper scripts available:

### harmony:copy

Copy a component from Harmony to your local `src/components/harmony/` folder:

```bash
npm run harmony:copy ComponentName
```

**What it does:**
- Copies the component from `node_modules/@deltek/harmony-components`
- Adds metadata header with version and fork date
- Updates `.harmony-sync.json` tracking file
- Shows next steps

**Example:**
```bash
npm run harmony:copy Button
# Creates: src/components/harmony/Button.astro
```

### harmony:check-updates

Check if Harmony has been updated and which forks need review:

```bash
npm run harmony:check-updates
```

**What it shows:**
- Current installed Harmony version
- Tracked version from `.harmony-sync.json`
- List of all forked components
- Which forks are out of date
- Recommendations for next steps

### harmony:diff

Show differences between your fork and the base component:

```bash
npm run harmony:diff ComponentName
```

**What it shows:**
- Your custom modifications
- Changes in base component since you forked
- Side-by-side comparison

**Example:**
```bash
npm run harmony:diff Button
```

---

## Package.json Scripts

Your final `package.json` scripts section should include:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",

    "harmony:copy": "node scripts/copy-harmony-component.cjs",
    "harmony:check-updates": "node scripts/check-harmony-updates.cjs",
    "harmony:diff": "node scripts/diff-harmony-component.cjs"
  }
}
```

**Optional CI script** (for pre-release checks):

```json
{
  "scripts": {
    "build:validate": "npm run harmony:check-updates && astro check && astro build"
  }
}
```

Note: Running `harmony:check-updates` on every build can be slow. Use it in CI or before releases, not in daily development.

---

## Your First Customization

Let's walk through a complete example: customizing button colors.

### Example 1: CSS Customization (Tier 0)

**Goal:** Change all button colors to match your brand.

**Solution:** Override CSS variables in your theme file.

1. **Edit `src/styles/theme-myproject.css`:**

```css
html.theme-myproject {
  --btn-primary-bg: #FF6B35;
  --btn-primary-text: #FFFFFF;
  --btn-primary-hover: #E65A2E;
}
```

2. **Use buttons normally in your pages:**

```astro
---
import { Button } from '@deltek/harmony-components/ui';
---

<Button variant="primary">My Branded Button</Button>
```

3. **Result:** All primary buttons use your brand color automatically.

### Example 2: Wrapper Component (Tier 2)

**Goal:** Add analytics tracking to buttons.

**Solution:** Create a wrapper component.

1. **Create `src/components/composed/TrackedButton.astro`:**

```astro
---
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

interface Props {
  trackEvent?: string;
  [key: string]: any;
}

const { trackEvent, ...buttonProps } = Astro.props;

const trackingHandler = trackEvent
  ? `analytics.track('${trackEvent}')`
  : undefined;
---

<Button
  {...buttonProps}
  data-tracked={trackEvent ? 'true' : undefined}
  onclick={trackingHandler}
>
  <slot />
</Button>
```

2. **Use in your pages:**

```astro
---
import TrackedButton from '../components/composed/TrackedButton.astro';
---

<TrackedButton variant="primary" trackEvent="cta_click">
  Get Started
</TrackedButton>
```

3. **Result:** Button clicks are tracked without modifying the base Button component.

### Example 3: Fork Component (Tier 3)

**Goal:** Add a `userName` prop to ShellHeader.

**Solution:** Fork the component (last resort).

1. **Copy the component:**

```bash
npm run harmony:copy ShellHeader
```

2. **Edit `src/components/harmony/ShellHeader.astro`:**

```astro
---
interface Props {
  // ... existing props ...
  userName?: string;  // Add this custom prop
}

const { userName, ...rest } = Astro.props;
---

<header class="shell-header" {...rest}>
  <!-- ... existing content ... -->

  {userName && (
    <div class="user-info">
      <span>{userName}</span>
    </div>
  )}
</header>
```

3. **Update imports in your pages:**

```astro
---
// Import from local fork, not from Harmony
import ShellHeader from '../components/harmony/ShellHeader.astro';
---

<ShellHeader userName="Sarah Chen" />
```

4. **Result:** ShellHeader now has a custom `userName` prop that works in production.

---

## Verification

After setup, verify everything works:

### 1. Check Scripts Work

```bash
npm run harmony:check-updates
```

Expected output:
```
🔍 Checking Harmony Component Updates...
📦 Installed Harmony Version: 1.0.0
📊 Tracked Harmony Version: 1.0.0
✅ Harmony version matches tracked version
```

### 2. Test CSS Customization

1. Add a CSS override to your theme file
2. Use a Harmony component
3. Verify the override applies

### 3. Test Production Build

```bash
npm run build
```

Should succeed without errors.

### 4. Create a Test Wrapper

Create a simple wrapper component and verify it works:

```astro
---
// src/components/composed/TestButton.astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
---

<Button {...Astro.props}>
  <slot />
</Button>
```

---

## Documentation

Reference the complete Harmony customization docs:

### In Your Project README

Add a section like this to your project's README.md:

```markdown
## Customizing Harmony Components

This project uses the Harmony Components design system with a four-tier customization system.

**Documentation:**
- [Customization Guide](node_modules/@deltek/harmony-components/docs/customization/CUSTOMIZATION_GUIDE.md)
- [Component Patterns](node_modules/@deltek/harmony-components/docs/customization/COMPONENT_PATTERNS.md)
- [Handling Updates](node_modules/@deltek/harmony-components/docs/customization/HARMONY_UPDATES.md)

**Quick Reference:**
```bash
npm run harmony:copy ComponentName      # Fork a component
npm run harmony:check-updates           # Check for updates
npm run harmony:diff ComponentName      # Show differences
```

**Local Structure:**
- `src/styles/theme-myproject.css` - Tier 0: CSS overrides
- `src/components/composed/` - Tier 2: Wrapper components
- `src/components/harmony/` - Tier 3: Forked components
```

---

## Getting Help

### Resources

1. **Harmony Documentation:** `node_modules/@deltek/harmony-components/docs/customization/`
2. **Scripts Source:** `node_modules/@deltek/harmony-components/scripts/`
3. **Harmony README:** `node_modules/@deltek/harmony-components/README.md`

### Common Issues

**Issue: Scripts don't work**

Solution: Check that scripts are executable:
```bash
chmod +x scripts/*.cjs
```

**Issue: Import paths fail**

If package subpath imports fail (`@deltek/harmony-components/ui/Button.astro`), use direct paths:
```astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
```

**Issue: Production build fails with custom props**

Cause: Custom props are in node_modules (wiped on deployment)

Solution: Use Tier 2 (wrapper) or Tier 3 (fork) to keep custom props in your code.

---

## Next Steps

1. ✅ Set up directory structure
2. ✅ Copy helper scripts
3. ✅ Add package.json scripts
4. ✅ Create theme CSS file
5. ✅ Test scripts work
6. 📖 Read [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) for detailed guidance
7. 📖 Review [COMPONENT_PATTERNS.md](COMPONENT_PATTERNS.md) for examples
8. 🎨 Start customizing!

---

## Project Examples

**Reference implementation:** See the Startpoint project for a complete working example of this system in action.

```bash
# Check out Startpoint to see the system in practice
/path/to/startpoint/src/components/harmony/        # Tier 3 forks
/path/to/startpoint/src/components/composed/       # Tier 2 wrappers
/path/to/startpoint/src/styles/theme-startpoint.css  # Tier 0 overrides
```
