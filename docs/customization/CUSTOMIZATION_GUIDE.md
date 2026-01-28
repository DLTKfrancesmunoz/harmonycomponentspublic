# Harmony Components Customization Guide

**Complete guide for designers who need to customize Harmony components for their projects.**

---

## Table of Contents

1. [Introduction](#introduction)
2. [The Four-Tier System](#the-four-tier-system)
3. [Decision Tree](#decision-tree)
4. [Tier 0: CSS Customization](#tier-0-css-customization)
5. [Tier 1: Direct Imports](#tier-1-direct-imports)
6. [Tier 2: Wrapper Components](#tier-2-wrapper-components)
7. [Tier 3: Component Forks](#tier-3-component-forks)
8. [Common Pitfalls](#common-pitfalls)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

### Why This Guide Exists

**The Problem:** Editing components in `node_modules/@deltek/harmony-components/` causes production build failures. Changes are wiped on `npm install`, and custom props don't exist in the published package.

**The Solution:** A formal four-tier customization system that keeps your changes safe, persistent, and production-ready.

### Who This Guide is For

- Designers starting new projects from Startpoint
- Teams customizing Harmony components
- Anyone who needs to modify or extend Harmony components

### Key Principle

**⚠️ NEVER edit `node_modules/@deltek/harmony-components/`**

Changes there are temporary and break production builds. Always customize using one of the four tiers.

---

## The Four-Tier System

| Tier | Method | When to Use | Complexity | Maintenance |
|------|--------|-------------|------------|-------------|
| **Tier 0** | CSS Only | Colors, spacing, styling | Low | Easy |
| **Tier 1** | Direct Import | Component works as-is | None | None |
| **Tier 2** | Wrapper | Add behavior/props | Medium | Easy |
| **Tier 3** | Fork | Modify markup/template | High | Medium |

**Guiding Principle:** Use the lowest tier possible. Try CSS first, then wrappers, fork only as last resort.

---

## Decision Tree

```
Need to customize a Harmony component?
│
├─ Can you achieve it with CSS variables (colors, spacing)?
│  └─ YES → Tier 0: Edit src/styles/theme-startpoint.css
│
├─ Component works perfectly as-is?
│  └─ YES → Tier 1: Import directly from @deltek/harmony-components
│
├─ Need to add tracking, analytics, or extra props?
│  └─ YES → Tier 2: Create wrapper in src/components/composed/
│
├─ Need to pass data via slots or data attributes?
│  └─ YES → Tier 2: Create wrapper in src/components/composed/
│
└─ Need to modify component markup or template structure?
   └─ YES → Tier 3: Fork to src/components/harmony/
```

---

## Tier 0: CSS Customization

### When to Use
- Changing colors, fonts, spacing
- Adjusting component sizes
- Modifying borders, shadows, or radii
- Any visual customization

### How It Works

Harmony components use CSS custom properties (variables) that you can override in your theme file.

### Step-by-Step

1. **Open your theme file:**
   ```
   src/styles/theme-startpoint.css
   ```

2. **Override CSS variables:**
   ```css
   html.theme-startpoint {
     /* Override primary color */
     --theme-primary: #4C92D9;
     --theme-primary-hover: #3D7BC4;

     /* Override button styling */
     --btn-border-radius: 8px;
     --btn-padding: var(--space-3) var(--space-6);

     /* Override card styling */
     --card-padding: var(--space-6);
     --card-border-radius: 12px;
   }
   ```

3. **Test in browser** - changes apply immediately

### Pros & Cons

✅ **Pros:**
- No component copying
- Survives Harmony updates automatically
- Minimal maintenance
- Production builds work perfectly

❌ **Cons:**
- Limited to styling only
- Can't add new props or behavior
- Can't change markup structure

### Examples

**Change button colors:**
```css
html.theme-startpoint {
  --btn-primary-bg: #FF6B35;
  --btn-primary-text: #FFFFFF;
}
```

**Change card elevation:**
```css
html.theme-startpoint {
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## Tier 1: Direct Imports

### When to Use
- Component works exactly as you need it
- No customization required
- Default styling and behavior are perfect

### How It Works

Import components directly from the Harmony package.

### Step-by-Step

1. **Import the component:**
   ```astro
   ---
   import { Button, Card, Input } from '@deltek/harmony-components/ui';
   ---
   ```

2. **Use with props:**
   ```astro
   <Button variant="primary" size="md">
     Click Me
   </Button>
   ```

### Pros & Cons

✅ **Pros:**
- Zero maintenance
- Automatic updates when Harmony updates
- No extra files to manage
- Clear that you're using base components

❌ **Cons:**
- Can't customize beyond what props allow
- Can't add custom behavior

---

## Tier 2: Wrapper Components

### When to Use
- Add analytics/tracking
- Add custom props without changing markup
- Set project-specific defaults
- Compose multiple Harmony components
- Add behavior without modifying core component

### How It Works

Create a new component that wraps the Harmony component and adds extra functionality.

### Step-by-Step

1. **Create wrapper file:**
   ```
   src/components/composed/TrackedButton.astro
   ```

2. **Import base component:**
   ```astro
   ---
   import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

   interface Props {
     trackEvent?: string;     // Custom prop
     [key: string]: any;      // Pass-through props
   }

   const { trackEvent, ...buttonProps } = Astro.props;
   ---
   ```

3. **Add custom logic:**
   ```astro
   <Button
     {...buttonProps}
     data-tracking={trackEvent}
     onclick={trackEvent ? `analytics.track('${trackEvent}')` : undefined}
   >
     <slot />
   </Button>
   ```

4. **Use your wrapper:**
   ```astro
   ---
   import TrackedButton from '../components/composed/TrackedButton.astro';
   ---

   <TrackedButton variant="primary" trackEvent="cta_click">
     Get Started
   </TrackedButton>
   ```

### Pros & Cons

✅ **Pros:**
- Original component untouched
- Easy to update when Harmony updates
- Custom props work in production
- No cascade effects
- Clear separation of concerns

❌ **Cons:**
- Extra file to maintain
- Can't modify base component template
- May need multiple wrappers for different use cases

### See Also
- `src/components/composed/README.md` - Full wrapper documentation
- `src/components/composed/TrackedButton.astro` - Example
- `src/components/composed/ProjectCard.astro` - Example

---

## Tier 3: Component Forks

### When to Use
- Need to add props that require template changes
- Need to modify component markup structure
- Can't achieve goal with CSS or wrappers
- Need to change component's internal logic

### ⚠️ Warning

Forking is the **last resort**. It creates:
- Maintenance burden (must review when Harmony updates)
- Cascade effects (may need to fork dependent components)
- Merge conflicts (your changes vs base changes)

Always try Tier 0, 1, or 2 first.

### Step-by-Step

#### Option A: Using Helper Script (Recommended)

1. **Run the copy command:**
   ```bash
   npm run harmony:copy ComponentName
   ```

2. **Script automatically:**
   - Copies component from node_modules
   - Adds metadata header
   - Updates tracking file
   - Shows next steps

3. **Edit the copied file:**
   - Add your customizations
   - Update metadata header (document changes)
   - Fix imports if needed

4. **Update imports in pages:**
   ```astro
   // BEFORE:
   import Component from '@deltek/harmony-components/...';

   // AFTER:
   import Component from '../components/harmony/Component.astro';
   ```

5. **Test:**
   ```bash
   npm run build
   ```

#### Option B: Manual Fork

1. **Copy component** from `node_modules/@deltek/harmony-components/src/`
2. **Add metadata header** (see template in `harmony/README.md`)
3. **Update `.harmony-sync.json`**
4. **Fix imports** (use node_modules paths if package subpaths fail)
5. **Update page imports**
6. **Test production build**

### Import Issues

**Problem:** Package subpath imports may fail:
```astro
import Icon from '@deltek/harmony-components/ui/Icon.astro';  // May fail
```

**Solution:** Use direct node_modules paths:
```astro
import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';
```

### Cascade Effects

**Important:** Forking one component may require forking others.

**Example:**
- You fork ShellHeader (to add `userName` prop)
- ShellLayout imports ShellHeader
- You must also fork ShellLayout (to import your local ShellHeader)

**Track cascades in `.harmony-sync.json`:**
```json
{
  "component": "ShellHeader.astro",
  "dependents": ["ShellLayout.astro"]
}
```

### Pros & Cons

✅ **Pros:**
- Full control over component
- Can add any props or modify any markup
- Custom props work in production
- Changes persist through npm install

❌ **Cons:**
- Must review when Harmony updates
- Merge conflicts possible
- Cascade effects
- Higher maintenance burden
- May drift from base over time

### See Also
- `src/components/harmony/README.md` - Full fork documentation
- `docs/HARMONY_UPDATES.md` - Update procedures
- `npm run harmony:diff ComponentName` - Check differences

---

## Common Pitfalls

### 1. Editing node_modules

**❌ Don't do this:**
```
Editing: node_modules/@deltek/harmony-components/src/.../Button.astro
```

**✅ Do this instead:**
- Tier 0: Edit `src/styles/theme-startpoint.css`
- Tier 2: Create wrapper in `src/components/composed/`
- Tier 3: Fork to `src/components/harmony/`

### 2. Forking for Styling Only

**❌ Don't fork just to change colors:**
```astro
// Don't copy Button.astro just to change button color
```

**✅ Use CSS variables:**
```css
--btn-primary-bg: #FF6B35;
```

### 3. Not Tracking Forks

**❌ Forking without updating `.harmony-sync.json`:**
- Team doesn't know what's forked
- Can't track when to review updates
- Loses context over time

**✅ Always update tracking:**
```bash
npm run harmony:copy ComponentName  // Does this automatically
```

### 4. Forgetting Cascade Effects

**❌ Forking ShellHeader but not ShellLayout:**
- ShellLayout still imports base ShellHeader
- Your custom props don't work

**✅ Fork dependents too:**
```bash
npm run harmony:copy ShellHeader
npm run harmony:copy ShellLayout  // Also fork this
```

### 5. Not Testing Production Builds

**❌ Only testing in dev:**
```bash
npm run dev  // Works locally
```

**✅ Always test production:**
```bash
npm run build  // Test this too!
```

---

## Troubleshooting

### Production Build Fails

**Symptom:** Build works locally, fails in production

**Cause:** Custom props in node_modules (wiped on CI)

**Solution:**
1. Check if you edited node_modules
2. Move customizations to src/ (wrapper or fork)
3. Test with `npm run build`

### Import Errors

**Symptom:** Can't import component, module not found

**Cause:** Package subpath imports may not work

**Solution:**
```astro
// Instead of:
import Icon from '@deltek/harmony-components/ui/Icon.astro';

// Use:
import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';
```

### Custom Props Not Working

**Symptom:** TypeScript error: Property 'myProp' does not exist

**Cause:** Adding props to base component (not in your code)

**Solution:**
- Tier 2: Add props in wrapper (your code)
- Tier 3: Fork component (add props in fork)

### Styles Not Applying

**Symptom:** CSS changes don't show up

**Cause:** CSS specificity or wrong selector

**Solution:**
1. Inspect element in browser DevTools
2. Check which styles are actually applied
3. Use `!important` if needed (sparingly)
4. Override correct CSS variable

### Component Not Updating

**Symptom:** Changes to Harmony component don't appear

**Cause:** Importing from local fork instead of base

**Solution:**
- If you forked: Changes won't appear (you're using your fork)
- If you want base updates: Delete fork, import from Harmony

---

## Next Steps

- **Examples:** See `docs/COMPONENT_PATTERNS.md`
- **Updates:** See `docs/HARMONY_UPDATES.md`
- **Wrappers:** See `src/components/composed/README.md`
- **Forks:** See `src/components/harmony/README.md`

---

## Getting Help

**Tools:**
```bash
npm run harmony:copy ComponentName      # Fork a component
npm run harmony:check-updates           # Check for Harmony updates
npm run harmony:diff ComponentName      # Show differences
```

**Documentation:**
- This guide: Comprehensive customization overview
- `COMPONENT_PATTERNS.md`: Real-world examples
- `HARMONY_UPDATES.md`: Update procedures
- Component READMEs: Tier-specific guides
