# Handling Harmony Updates

**Complete guide for updating the @deltek/harmony-components package and managing your customizations.**

This guide covers how to safely update Harmony while preserving your customizations (wrappers and forks).

---

## Table of Contents

1. [When to Update Harmony](#when-to-update-harmony)
2. [Before Updating](#before-updating)
3. [Update Procedure](#update-procedure)
4. [Handling Forks During Updates](#handling-forks-during-updates)
5. [Wrapper Updates](#wrapper-updates)
6. [Breaking Changes](#breaking-changes)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

---

## When to Update Harmony

### Regular Updates

Update Harmony when:
- New features are released that you want to use
- Bug fixes are available
- Performance improvements are shipped
- Design system changes need to be reflected in your project

**Recommended frequency:** Quarterly or as needed

### Security Patches

Update immediately for:
- Security vulnerabilities
- Critical bug fixes
- Dependency security updates

**Recommended frequency:** As soon as available

### Breaking Changes

Plan updates carefully when:
- Major version changes (1.x → 2.x)
- Component API changes
- Removed or renamed props
- Structural changes to components

**Recommended frequency:** With thorough testing and planning

---

## Before Updating

### Step 1: Check Current State

Review what customizations you have:

```bash
npm run harmony:check-updates
```

This shows:
- Current Harmony version installed
- Components you've forked (from `.harmony-sync.json`)
- Whether updates are available

### Step 2: Review Changelog

Before updating, review the Harmony changelog:

1. Visit the [Harmony repository](https://github.com/DLTKfrancesmunoz/harmonycomponents)
2. Check the releases page or CHANGELOG.md
3. Look for:
   - Breaking changes
   - New features
   - Bug fixes
   - Deprecated features

**Key things to note:**
- Components you've forked - have they changed?
- Props you're using - have they been renamed/removed?
- New features that might replace your customizations

### Step 3: Backup Current State

Create a git commit before updating:

```bash
git add -A
git commit -m "chore: backup before Harmony update"
```

Or create a backup branch:

```bash
git checkout -b backup-before-harmony-update
git checkout main
```

### Step 4: Read `.harmony-sync.json`

Review your fork tracking file:

```bash
cat src/components/harmony/.harmony-sync.json
```

Note:
- Which components are forked
- Why they were forked (customizations list)
- When they were last updated

---

## Update Procedure

### Standard Update (No Breaking Changes)

**Step 1: Update the package**

```bash
npm update @deltek/harmony-components
```

Or for latest version:

```bash
npm install @deltek/harmony-components@latest
```

**Step 2: Check for updates to your forks**

```bash
npm run harmony:check-updates
```

This compares your forked components against the new base versions.

**Step 3: Review differences**

For each forked component:

```bash
npm run harmony:diff ComponentName
```

This shows:
- What changed in the base component
- Your custom modifications
- Potential conflicts

**Step 4: Merge base changes (if needed)**

If the base component has changes you want:

1. **Review the diff carefully**
   ```bash
   npm run harmony:diff ShellHeader
   ```

2. **Manually merge changes**
   - Open your fork in `src/components/harmony/ShellHeader.astro`
   - Review base changes
   - Integrate changes while preserving your customizations

3. **Update metadata header**
   ```astro
   /**
    * Base Version: 1.0.0 → 1.1.0  (update this)
    * Last Synced: 2026-01-28       (update this)
    */
   ```

4. **Update `.harmony-sync.json`**
   ```json
   {
     "component": "ShellHeader.astro",
     "baseVersion": "1.1.0",          // Update
     "lastSynced": "2026-01-28",      // Update
     "customizations": [...]
   }
   ```

**Step 5: Test everything**

```bash
# Run TypeScript check
npm run build

# Test in development
npm run dev
```

**Step 6: Test production build**

```bash
npm run build
npm run preview
```

Visit all pages that use customized components and verify they work correctly.

### Testing Checklist

After updating, verify:

- [ ] All pages load without errors
- [ ] Forked components render correctly
- [ ] Custom props still work
- [ ] Wrapper components function properly
- [ ] CSS overrides still apply
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Production build succeeds
- [ ] Deployed site works correctly

---

## Handling Forks During Updates

### When Base Component Hasn't Changed

If `npm run harmony:diff ComponentName` shows no changes in the base:

✅ **No action needed** - Your fork is still current

### When Base Component Has Minor Changes

If changes don't conflict with your customizations:

1. **Review the diff**
   ```bash
   npm run harmony:diff ShellHeader
   ```

2. **Decide: Merge or Skip**
   - **Merge** if changes are bug fixes or improvements
   - **Skip** if changes aren't relevant to your usage

3. **If merging:**
   - Copy relevant changes from base to your fork
   - Test thoroughly
   - Update version in metadata header
   - Update `.harmony-sync.json`

### When Base Component Has Conflicting Changes

If changes affect your customizations:

1. **Assess the conflict**
   - What changed in base?
   - Does it conflict with your custom code?
   - Can you resolve it?

2. **Resolution strategies:**

   **Option A: Merge both changes**
   ```astro
   <!-- Your custom prop -->
   userName?: string;

   <!-- New prop from base -->
   theme?: 'light' | 'dark';

   <!-- Both can coexist -->
   ```

   **Option B: Adapt your customization**
   If base provides similar functionality, consider removing your custom code.

   **Option C: Keep your version**
   If conflict is fundamental, keep your fork and document why.

3. **Document the resolution**
   ```astro
   /**
    * MERGE NOTES (2026-01-28):
    * - Base added 'theme' prop
    * - Kept our custom 'userName' prop
    * - Both props work together
    */
   ```

### Merge Strategy Example

**Before (Your Fork):**
```astro
interface Props {
  userName?: string;  // Your custom prop
  userRole?: string;  // Your custom prop
}
```

**Base Update:**
```astro
interface Props {
  theme?: 'light' | 'dark';     // New in base
  showAvatar?: boolean;          // New in base
}
```

**After Merge:**
```astro
interface Props {
  // Base props (new in 1.1.0)
  theme?: 'light' | 'dark';
  showAvatar?: boolean;

  // Custom props (kept from fork)
  userName?: string;
  userRole?: string;
}
```

---

## Wrapper Updates

### Good News

Wrapper components (Tier 2) usually don't need updates when Harmony updates:

✅ **Wrappers automatically benefit from base component updates**
- Bug fixes flow through
- New features become available
- No merge conflicts

### When Wrappers Need Updates

Update wrappers only if:

1. **Base component removes/renames props you're using**
   ```astro
   // Old base had 'type' prop, new base has 'variant'
   <Button variant={type} {...rest} />  // Update this
   ```

2. **You want to use new base features**
   ```astro
   // Base added 'loading' prop you want to expose
   interface Props {
     loading?: boolean;  // Add new prop
     [key: string]: any;
   }
   ```

3. **Breaking changes in base component API**

### Wrapper Update Example

**Scenario:** Harmony Button added a new `loading` prop.

**Before:**
```astro
<Button {...buttonProps} data-tracking={trackEvent}>
  <slot />
</Button>
```

**After:**
```astro
<Button
  {...buttonProps}
  data-tracking={trackEvent}
  loading={buttonProps.loading}  // Now supported
>
  <slot />
</Button>
```

No change needed if using `{...buttonProps}` - it passes through automatically!

---

## Breaking Changes

### Identifying Breaking Changes

Breaking changes include:
- Removed props
- Renamed props
- Changed prop types
- Removed components
- Changed component structure
- Changed CSS variable names

### Handling Breaking Changes

**Step 1: Read the migration guide**

Check Harmony's documentation for:
- What changed
- Why it changed
- How to migrate

**Step 2: Find affected usage**

Search your codebase:

```bash
# Example: Button 'type' prop renamed to 'variant'
grep -r "type=" src/
```

**Step 3: Update systematically**

1. **Update direct imports (Tier 1)**
   ```astro
   <!-- Before -->
   <Button type="primary">Click</Button>

   <!-- After -->
   <Button variant="primary">Click</Button>
   ```

2. **Update wrappers (Tier 2)**
   ```astro
   interface Props {
     variant?: string;  // Renamed from 'type'
     [key: string]: any;
   }
   ```

3. **Update forks (Tier 3)**
   - Update prop interfaces
   - Update prop usage in template
   - Update metadata header with breaking change notes

**Step 4: Test thoroughly**

Test every component and page that uses the changed feature.

---

## Rollback Procedure

If the update causes issues:

### Option 1: Revert Package Update

```bash
# Revert to previous version
npm install @deltek/harmony-components@<previous-version>

# Example
npm install @deltek/harmony-components@1.0.0
```

### Option 2: Git Revert

```bash
# Revert the commit
git revert HEAD

# Or reset to before update
git reset --hard HEAD~1
```

### Option 3: Restore from Backup

```bash
# Switch to backup branch
git checkout backup-before-harmony-update

# Copy to main
git checkout main
git reset --hard backup-before-harmony-update
```

### After Rollback

1. Document why you rolled back
2. Create an issue to track the problem
3. Plan when to retry the update
4. Communicate with team if applicable

---

## Troubleshooting

### Issue: Build Fails After Update

**Symptom:** TypeScript errors or build failures

**Possible Causes:**
- Breaking changes in Harmony
- Props renamed/removed
- Component structure changed

**Solution:**
1. Review error messages carefully
2. Check Harmony changelog for breaking changes
3. Update prop names/types as needed
4. Update forked components if they reference changed Harmony components

### Issue: Components Look Different

**Symptom:** Visual changes after update

**Possible Causes:**
- CSS variable changes in base
- Component markup changes
- Your CSS overrides not applying

**Solution:**
1. Check if base CSS variables changed
2. Update your theme file overrides if needed
3. Review component markup changes
4. Re-test responsive layouts

### Issue: Custom Props Not Working

**Symptom:** TypeScript errors on custom props after update

**Possible Causes:**
- Forked component not updated
- Importing from wrong location

**Solution:**
```astro
<!-- Wrong: importing from Harmony instead of fork -->
import Button from '@deltek/harmony-components/ui/Button.astro';

<!-- Right: importing from your fork -->
import Button from '../components/harmony/Button.astro';
```

### Issue: harmony:diff Shows Large Changes

**Symptom:** Diff tool shows many changes in base component

**Possible Causes:**
- Major refactor in base component
- Breaking changes
- Your fork is very outdated

**Solution:**
1. **If many changes are whitespace/formatting:** Safe to ignore
2. **If logic changed significantly:** Consider re-forking
   ```bash
   # Backup your customizations
   cp src/components/harmony/Button.astro src/components/harmony/Button.astro.backup

   # Copy fresh base
   npm run harmony:copy Button

   # Manually re-apply customizations from backup
   ```

### Issue: Wrapper Component Breaks

**Symptom:** Wrapper stops working after Harmony update

**Possible Causes:**
- Base component removed a prop you were using
- Base component changed behavior

**Solution:**
1. Check base component documentation for changes
2. Update wrapper to use new prop names/patterns
3. Consider if base component now provides the feature natively

---

## Best Practices

### Regular Maintenance

- **Monthly:** Run `npm run harmony:check-updates` to see what's available
- **Quarterly:** Plan and execute Harmony updates
- **As needed:** Update for security patches immediately

### Communication

When updating Harmony in a team:

1. **Announce the update**
   - What version you're updating to
   - What breaking changes exist
   - When you'll do it

2. **Share the checklist**
   - What needs to be tested
   - Who is responsible for testing what

3. **Document the results**
   - What broke
   - How it was fixed
   - Lessons learned

### Automation

Consider adding to CI/CD:

```yaml
# .github/workflows/harmony-check.yml
name: Check Harmony Updates
on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run harmony:check-updates
```

---

## Quick Reference Commands

```bash
# Check for updates
npm run harmony:check-updates

# Show diff for a component
npm run harmony:diff ComponentName

# Update Harmony package
npm install @deltek/harmony-components@latest

# Test build
npm run build

# Rollback to previous version
npm install @deltek/harmony-components@<version>
```

---

## Related Documentation

- [Customization Guide](CUSTOMIZATION_GUIDE.md) - Full customization system
- [Component Patterns](COMPONENT_PATTERNS.md) - Real-world examples
- [Harmony Forks README](../src/components/harmony/README.md) - Fork documentation
- [Wrappers README](../src/components/composed/README.md) - Wrapper documentation
