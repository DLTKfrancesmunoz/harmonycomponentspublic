# Harmony Component Patterns

**Real-world examples of the four-tier customization system in action.**

This guide shows practical patterns for each tier with actual code you can use. Each example includes the problem, solution approach, and complete implementation.

---

## Table of Contents

1. [Tier 0: CSS Customization](#tier-0-css-customization)
2. [Tier 1: Direct Imports](#tier-1-direct-imports)
3. [Tier 2: Wrapper Components](#tier-2-wrapper-components)
4. [Tier 3: Component Forks](#tier-3-component-forks)
5. [Anti-Patterns](#anti-patterns)
6. [Decision Matrix](#decision-matrix)

---

## Tier 0: CSS Customization

### Example 1: Brand Colors Across All Components

**Problem:** Need to apply your project's brand colors to all Harmony components.

**Solution:** Override CSS custom properties in your theme file.

**File:** `src/styles/theme-startpoint.css`

```css
html.theme-startpoint {
  /* Brand primary color */
  --theme-primary: #4C92D9;
  --theme-primary-hover: #3D7BC4;
  --theme-primary-active: #2E66A9;

  /* Brand secondary color */
  --theme-secondary: #FF6B35;
  --theme-secondary-hover: #E65A2E;

  /* Apply to specific components */
  --btn-primary-bg: var(--theme-primary);
  --btn-primary-text: #FFFFFF;
  --link-color: var(--theme-primary);
  --badge-primary-bg: var(--theme-primary);
}
```

**Result:** All buttons, links, and badges automatically use your brand colors.

### Example 2: Button Radius Project-Wide

**Problem:** Your design system requires 8px border radius on all buttons (Harmony default is 4px).

**Solution:** Override button radius variable.

```css
html.theme-startpoint {
  --btn-border-radius: 8px;
}
```

**Result:** Every Harmony Button component uses 8px radius.

### Example 3: Card Elevation

**Problem:** Need more prominent card shadows for your design language.

**Solution:** Override card shadow variables.

```css
html.theme-startpoint {
  /* Elevated cards */
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.2);

  /* Increase card padding */
  --card-padding: var(--space-6);
}
```

**Result:** All Card components have deeper shadows and more padding.

---

## Tier 1: Direct Imports

### When to Use

Use Tier 1 when components work perfectly as-is with no customization needed.

### Example: Standard Page Layout

**Problem:** Need a docs page with navigation and content.

**Solution:** Import Harmony layouts and components directly.

**File:** `src/pages/docs.astro`

```astro
---
import DocsLayout from '@deltek/harmony-components/layouts/DocsLayout.astro';
import { Card, Button } from '@deltek/harmony-components/ui';
---

<DocsLayout title="Documentation">
  <Card>
    <h2>Getting Started</h2>
    <p>Welcome to our documentation...</p>
    <Button variant="primary" href="/docs/installation">
      Get Started
    </Button>
  </Card>
</DocsLayout>
```

**Result:** Clean, maintainable code using Harmony components as designed.

### Example: Form with Validation

```astro
---
import { Input, Button, Alert } from '@deltek/harmony-components/ui';
---

<form>
  <Input
    type="email"
    label="Email"
    placeholder="you@example.com"
    required
  />

  <Input
    type="password"
    label="Password"
    placeholder="Enter password"
    required
  />

  <Button type="submit" variant="primary">
    Sign In
  </Button>
</form>
```

**Result:** Standard form using Harmony's built-in validation and styling.

---

## Tier 2: Wrapper Components

### Example 1: TrackedButton (Analytics Tracking)

**Problem:** Need to track button clicks for analytics without modifying every button usage.

**Solution:** Create wrapper that adds tracking behavior.

**File:** `src/components/composed/TrackedButton.astro`

```astro
---
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

interface Props {
  trackEvent?: string;
  trackData?: Record<string, any>;
  trackCategory?: string;
  [key: string]: any;
}

const { trackEvent, trackData, trackCategory, ...buttonProps } = Astro.props;

const trackingPayload = trackEvent
  ? JSON.stringify({
      event: trackEvent,
      category: trackCategory || 'interaction',
      data: trackData || {},
      timestamp: new Date().toISOString()
    })
  : null;

const trackingHandler = trackEvent
  ? `
    (function(e) {
      if (window.analytics && window.analytics.track) {
        const payload = ${trackingPayload};
        window.analytics.track(payload.event, {
          category: payload.category,
          ...payload.data
        });
      }
    })(event)
  `.trim()
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

**Usage:**

```astro
---
import TrackedButton from '../components/composed/TrackedButton.astro';
---

<TrackedButton
  variant="primary"
  trackEvent="cta_click"
  trackData={{ page: 'home', section: 'hero' }}
  trackCategory="engagement"
>
  Get Started
</TrackedButton>
```

**Result:** Button clicks automatically tracked without modifying base component.

### Example 2: ProjectCard (Project-Specific Wrapper)

**Problem:** Need cards that display project status and metadata consistently.

**Solution:** Create specialized card wrapper.

**File:** `src/components/composed/ProjectCard.astro`

```astro
---
import Card from '../../../node_modules/@deltek/harmony-components/src/components/ui/Card.astro';
import Badge from '../../../node_modules/@deltek/harmony-components/src/components/ui/Badge.astro';

interface Props {
  projectStatus?: 'active' | 'archived' | 'draft';
  projectId?: string;
  elevated?: boolean;
  [key: string]: any;
}

const {
  projectStatus,
  projectId,
  elevated = true,
  ...cardProps
} = Astro.props;

const statusColors = {
  active: 'success',
  archived: 'neutral',
  draft: 'warning'
};
---

<Card elevated={elevated} {...cardProps}>
  {projectStatus && (
    <div slot="header-actions">
      <Badge variant={statusColors[projectStatus]}>
        {projectStatus.toUpperCase()}
      </Badge>
    </div>
  )}

  <slot />

  {projectId && (
    <div slot="footer" class="project-meta">
      <small>Project ID: {projectId}</small>
    </div>
  )}
</Card>

<style>
  .project-meta {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }
</style>
```

**Usage:**

```astro
<ProjectCard
  projectStatus="active"
  projectId="PRJ-2024-123"
>
  <h3>Website Redesign</h3>
  <p>Complete overhaul of company website with new brand guidelines.</p>
</ProjectCard>
```

**Result:** Consistent project card styling across the application.

### Example 3: LoginButton (Wrapper with Defaults)

**Problem:** Login button should always have consistent styling and icon.

**Solution:** Create wrapper with project-specific defaults.

**File:** `src/components/composed/LoginButton.astro`

```astro
---
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';

interface Props {
  href?: string;
  [key: string]: any;
}

const { href = '/login', ...buttonProps } = Astro.props;
---

<Button
  variant="primary"
  size="md"
  href={href}
  {...buttonProps}
>
  <Icon name="user" size="sm" />
  <slot>Sign In</slot>
</Button>
```

**Usage:**

```astro
<!-- Simple usage with defaults -->
<LoginButton />

<!-- Custom text -->
<LoginButton>Login to Continue</LoginButton>

<!-- Custom href -->
<LoginButton href="/auth/sso">SSO Login</LoginButton>
```

**Result:** Consistent login buttons with sensible defaults.

### Example 4: StatusCard (Composition Pattern)

**Problem:** Need cards that combine multiple Harmony components for status display.

**Solution:** Compose Card, Badge, and Icon into single component.

**File:** `src/components/composed/StatusCard.astro`

```astro
---
import Card from '../../../node_modules/@deltek/harmony-components/src/components/ui/Card.astro';
import Badge from '../../../node_modules/@deltek/harmony-components/src/components/ui/Badge.astro';
import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';

interface Props {
  title: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon?: string;
  [key: string]: any;
}

const { title, status, icon, ...cardProps } = Astro.props;

const statusConfig = {
  success: { variant: 'success', iconName: 'check-circle', label: 'Success' },
  warning: { variant: 'warning', iconName: 'alert-triangle', label: 'Warning' },
  error: { variant: 'destructive', iconName: 'x-circle', label: 'Error' },
  info: { variant: 'info', iconName: 'info-circle', label: 'Info' }
};

const config = statusConfig[status];
---

<Card {...cardProps}>
  <div class="status-card">
    <div class="status-card__header">
      <Icon name={icon || config.iconName} size="lg" />
      <h3>{title}</h3>
    </div>

    <div class="status-card__badge">
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    </div>

    <div class="status-card__content">
      <slot />
    </div>
  </div>
</Card>

<style>
  .status-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .status-card__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .status-card__header h3 {
    margin: 0;
    font-size: var(--text-lg);
  }
</style>
```

**Usage:**

```astro
<StatusCard title="Deployment Successful" status="success">
  <p>Your application has been deployed to production.</p>
  <a href="/deployments/123">View Details</a>
</StatusCard>

<StatusCard title="Build Failed" status="error" icon="x">
  <p>The build process encountered errors. Check logs for details.</p>
</StatusCard>
```

**Result:** Consistent status displays throughout the app.

---

## Tier 3: Component Forks

### When Forking is Necessary

Fork components (Tier 3) only when you need to:
- Modify component template structure
- Add props that require markup changes
- Change component internal logic

### Example: ShellHeader with User Info

**Problem:** Need to display user name and role in header, but base ShellHeader doesn't have these props.

**Solution:** Fork ShellHeader to `src/components/harmony/`

**File:** `src/components/harmony/ShellHeader.astro`

```astro
---
/**
 * STARTPOINT OVERRIDE
 *
 * Base: @deltek/harmony-components/ui/ShellHeader.astro
 * Base Version: 1.0.0
 * Forked Date: 2026-01-28
 *
 * CUSTOMIZATIONS:
 * - Added userName prop for displaying user name
 * - Added userRole prop for displaying user role
 * - Added user-info section to header__actions
 */

import Icon from '../../../node_modules/@deltek/harmony-components/src/components/ui/Icon.astro';
import Avatar from '../../../node_modules/@deltek/harmony-components/src/components/ui/Avatar.astro';

interface Props {
  logoSrc?: string;
  logoAlt?: string;
  userName?: string;    // CUSTOM
  userRole?: string;    // CUSTOM
  [key: string]: any;
}

const { logoSrc, logoAlt, userName, userRole, ...rest } = Astro.props;
---

<header class="shell-header" {...rest}>
  <div class="shell-header__logo">
    {logoSrc && <img src={logoSrc} alt={logoAlt || 'Logo'} />}
  </div>

  <div class="shell-header__actions">
    <slot name="actions" />

    {/* CUSTOM: User info display */}
    {userName && (
      <div class="user-info">
        <Avatar name={userName} size="sm" />
        <div class="user-info__details">
          <span class="user-info__name">{userName}</span>
          {userRole && <span class="user-info__role">{userRole}</span>}
        </div>
      </div>
    )}
  </div>
</header>

<style>
  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .user-info__details {
    display: flex;
    flex-direction: column;
  }

  .user-info__name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .user-info__role {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
</style>
```

**Usage in pages:**

```astro
---
// Import from local fork, not from Harmony package
import ShellLayout from '../components/harmony/ShellLayout.astro';
---

<ShellLayout
  userName="Sarah Chen"
  userRole="Senior Designer"
>
  <h1>Dashboard</h1>
</ShellLayout>
```

**Important Notes:**
- Update `.harmony-sync.json` to track this fork
- ShellLayout also needs to be forked (cascade effect)
- Must review when Harmony updates

### Cascade Effects: ShellLayout

**Problem:** ShellLayout imports ShellHeader, so forking ShellHeader requires forking ShellLayout.

**Solution:** Fork ShellLayout and import local ShellHeader.

**File:** `src/components/harmony/ShellLayout.astro`

```astro
---
/**
 * STARTPOINT OVERRIDE
 *
 * Base: @deltek/harmony-components/layouts/ShellLayout.astro
 * Base Version: 1.0.0
 * Forked Date: 2026-01-28
 *
 * CUSTOMIZATIONS:
 * - Updated to import local ShellHeader (cascade from ShellHeader fork)
 * - Passes through userName and userRole props to ShellHeader
 */

// Import local forked ShellHeader, not from Harmony package
import ShellHeader from './ShellHeader.astro';
import LeftSidebar from '../../../node_modules/@deltek/harmony-components/src/components/ui/LeftSidebar.astro';
import RightSidebar from '../../../node_modules/@deltek/harmony-components/src/components/ui/RightSidebar.astro';

interface Props {
  userName?: string;    // CUSTOM (pass to ShellHeader)
  userRole?: string;    // CUSTOM (pass to ShellHeader)
  [key: string]: any;
}

const { userName, userRole, ...rest } = Astro.props;
---

<div class="shell-layout">
  <ShellHeader userName={userName} userRole={userRole} {...rest} />

  <div class="shell-layout__body">
    <LeftSidebar>
      <slot name="sidebar-left" />
    </LeftSidebar>

    <main class="shell-layout__main">
      <slot />
    </main>

    <RightSidebar>
      <slot name="sidebar-right" />
    </RightSidebar>
  </div>
</div>
```

**Tracking in `.harmony-sync.json`:**

```json
{
  "lastChecked": "2026-01-28",
  "harmonyVersion": "1.0.0",
  "overrides": [
    {
      "component": "ShellHeader.astro",
      "baseVersion": "1.0.0",
      "forkedDate": "2026-01-28",
      "customizations": [
        "Added userName prop",
        "Added userRole prop"
      ],
      "dependents": ["ShellLayout.astro"]
    },
    {
      "component": "ShellLayout.astro",
      "baseVersion": "1.0.0",
      "forkedDate": "2026-01-28",
      "customizations": [
        "Updated to import local ShellHeader"
      ],
      "reason": "Cascade from ShellHeader fork"
    }
  ]
}
```

---

## Anti-Patterns

### Anti-Pattern 1: Forking for CSS Changes

**❌ Wrong:**

```astro
// Copying Button.astro just to change button color
---
interface Props {
  variant?: 'primary' | 'secondary';
}
const { variant = 'primary' } = Astro.props;
---

<button class={`btn btn--${variant}`}>
  <slot />
</button>

<style>
  .btn--primary {
    background: #FF6B35;  /* Just wanted to change this! */
  }
</style>
```

**✅ Right:**

```css
/* src/styles/theme-startpoint.css */
html.theme-startpoint {
  --btn-primary-bg: #FF6B35;
}
```

### Anti-Pattern 2: Editing node_modules

**❌ Wrong:**

```bash
# Editing the published package
vim node_modules/@deltek/harmony-components/src/components/ui/Button.astro
```

**Problems:**
- Changes wiped on `npm install`
- Breaks production builds
- Not tracked in git

**✅ Right:**

```bash
# Use the helper script to fork properly
npm run harmony:copy Button
```

### Anti-Pattern 3: Not Tracking Forks

**❌ Wrong:**

Copying files without updating `.harmony-sync.json` or adding metadata headers.

**✅ Right:**

```bash
# Use script (tracks automatically)
npm run harmony:copy ComponentName

# Or manually update .harmony-sync.json
```

### Anti-Pattern 4: Creating Wrappers for Structure Changes

**❌ Wrong:**

```astro
<!-- Trying to modify markup with a wrapper -->
<Button>
  <div class="custom-inner">  <!-- Can't insert this structure -->
    <slot />
  </div>
</Button>
```

**✅ Right:**

Fork the component (Tier 3) when you need to change markup structure.

### Anti-Pattern 5: Forgetting Cascade Effects

**❌ Wrong:**

Forking ShellHeader but not ShellLayout, causing imports to break.

**✅ Right:**

```bash
npm run harmony:copy ShellHeader
npm run harmony:copy ShellLayout  # Fork dependent too
```

---

## Decision Matrix

Quick reference for choosing the right tier:

| Need | Tier | Method | Example |
|------|------|--------|---------|
| Change colors | 0 | CSS variables | Brand colors, button color |
| Change spacing | 0 | CSS variables | Card padding, margins |
| Change borders/shadows | 0 | CSS variables | Border radius, shadows |
| Use as-is | 1 | Direct import | Standard forms, layouts |
| Add tracking | 2 | Wrapper | Analytics, logging |
| Add behavior | 2 | Wrapper | Custom click handlers |
| Set defaults | 2 | Wrapper | Project-specific defaults |
| Combine components | 2 | Wrapper | StatusCard, TaskCard |
| Add props (no markup change) | 2 | Wrapper | Pass via data attributes |
| Add props (requires markup) | 3 | Fork | userName in ShellHeader |
| Modify template structure | 3 | Fork | Add new sections |
| Change internal logic | 3 | Fork | Custom validation |

### Decision Flowchart

```
Start
  ↓
Is it just styling?
  ↓ Yes → Use Tier 0 (CSS)
  ↓ No
  ↓
Does component work as-is?
  ↓ Yes → Use Tier 1 (Direct)
  ↓ No
  ↓
Can you achieve it with wrapper?
  ↓ Yes → Use Tier 2 (Wrapper)
  ↓ No
  ↓
Use Tier 3 (Fork)
```

---

## Best Practices Summary

1. **Always try lower tiers first** - CSS → Direct → Wrapper → Fork
2. **Track all forks** - Use `.harmony-sync.json` and metadata headers
3. **Document customizations** - Explain why in comments
4. **Test production builds** - Custom props must be in your code
5. **Watch for cascades** - Forking may require forking dependents
6. **Use helper scripts** - `npm run harmony:copy ComponentName`
7. **Keep wrappers focused** - One clear purpose per wrapper
8. **Review on updates** - Check forks when Harmony updates

---

## Related Documentation

- [Customization Guide](CUSTOMIZATION_GUIDE.md) - Complete guide for all tiers
- [Harmony Updates](HARMONY_UPDATES.md) - Update procedures
- [Composed Components](../src/components/composed/README.md) - Wrapper documentation
- [Harmony Forks](../src/components/harmony/README.md) - Fork documentation
