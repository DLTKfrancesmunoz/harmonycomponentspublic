# Wrapper Component Examples (Tier 2)

This folder contains example wrapper components demonstrating Tier 2 customization patterns.

## What Are Wrapper Components?

Wrapper components (Tier 2) wrap Harmony components to add:
- Additional props
- Custom behavior (analytics, logging)
- Data transformation
- Project-specific defaults
- Slot content injection

**Key benefit:** Customize without forking. Wrappers maintain the base component's template, so you don't need to manually sync updates.

## When to Use Wrappers

✅ **Use wrappers when you need to:**
- Add analytics or tracking
- Inject additional props or data attributes
- Transform data before passing to base component
- Add project-specific behavior
- Set default prop values
- Compose multiple components together

❌ **Don't use wrappers when:**
- You need to modify component markup/structure → Use Tier 3 (fork)
- Pure CSS changes are enough → Use Tier 0 (CSS variables)
- Component works as-is → Use Tier 1 (direct import)

## Examples in This Folder

### TrackedButton.astro

**What it does:** Wraps Harmony Button to add analytics tracking.

**Use case:** You want to track button clicks across your app without editing every button instance.

**Key pattern:**
- Adds `trackEvent` prop
- Generates onclick handler automatically
- Passes through all other Button props

**Usage:**
```astro
---
import TrackedButton from '../components/composed/TrackedButton.astro';
---

<TrackedButton variant="primary" trackEvent="cta_signup">
  Sign Up Now
</TrackedButton>
```

### ProjectCard.astro

**What it does:** Wraps Harmony Card to display project information with status badges.

**Use case:** Standardize how projects are displayed across your app with consistent status indicators.

**Key pattern:**
- Accepts project data object
- Transforms data into Card props
- Adds status badge automatically
- Composes Card + Badge + other components

**Usage:**
```astro
---
import ProjectCard from '../components/composed/ProjectCard.astro';

const project = {
  name: "Website Redesign",
  description: "Modernize company website",
  status: "active",
  id: "PRJ-001"
};
---

<ProjectCard
  projectStatus={project.status}
  projectId={project.id}
>
  <h3>{project.name}</h3>
  <p>{project.description}</p>
</ProjectCard>
```

## Creating Your Own Wrappers

### Step 1: Copy Example

```bash
cp node_modules/@deltek/harmony-components/examples/wrappers/TrackedButton.astro \
   src/components/composed/MyButton.astro
```

### Step 2: Modify Props

```astro
---
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

interface Props {
  // Your custom props
  projectId?: string;
  category?: string;

  // Accept all Button props
  [key: string]: any;
}

const { projectId, category, ...buttonProps } = Astro.props;
---

<Button
  {...buttonProps}
  data-project-id={projectId}
  data-category={category}
>
  <slot />
</Button>
```

### Step 3: Use in Your Pages

```astro
---
import MyButton from '../components/composed/MyButton.astro';
---

<MyButton variant="primary" projectId="123" category="cta">
  Click Me
</MyButton>
```

## Import Path Considerations

**Option 1: Full node_modules path (recommended)**
```astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
```

**Option 2: Package subpath (may not work in all environments)**
```astro
import Button from '@deltek/harmony-components/ui/Button.astro';
```

If option 2 fails, use option 1. Some build tools don't support Astro file package subpaths.

## Testing Wrappers

### 1. Dev Mode
```bash
npm run dev
```
Test your wrapper in development.

### 2. Production Build
```bash
npm run build
```
**Critical:** Always test production builds. Dev mode can hide issues.

### 3. Verify Props
- Test all base component props work
- Test custom props work
- Test slot content renders
- Test data attributes appear in HTML

## Wrapper Best Practices

1. **Props Spreading:** Always spread `...baseProps` to pass through base component props
   ```astro
   <BaseComponent {...baseProps}>
   ```

2. **Type Safety:** Define interfaces for custom props
   ```typescript
   interface Props {
     customProp: string;
     [key: string]: any;
   }
   ```

3. **Documentation:** Add header comment explaining customizations
   ```astro
   ---
   /**
    * TrackedButton - Button wrapper with analytics
    * Custom props: trackEvent
    * Base: @deltek/harmony-components/ui/Button.astro
    */
   ```

4. **Defaults:** Set sensible defaults for custom props
   ```typescript
   const { trackEvent = 'generic_click', ...rest } = Astro.props;
   ```

5. **Slots:** Always include `<slot />` for content
   ```astro
   <BaseComponent {...props}>
     <slot />
   </BaseComponent>
   ```

## Common Patterns

### Pattern: Analytics Wrapper

```astro
---
import Button from '@deltek/harmony-components/ui/Button.astro';

interface Props {
  trackEvent?: string;
  [key: string]: any;
}

const { trackEvent, ...baseProps } = Astro.props;
---

<Button
  {...baseProps}
  onclick={trackEvent ? `analytics.track('${trackEvent}')` : undefined}
  data-tracked={trackEvent ? 'true' : undefined}
>
  <slot />
</Button>
```

### Pattern: Data Transformation

```astro
---
import Card from '@deltek/harmony-components/ui/Card.astro';
import Badge from '@deltek/harmony-components/ui/Badge.astro';

interface Props {
  item: {
    title: string;
    description: string;
    status: 'active' | 'pending' | 'inactive';
  };
}

const { item } = Astro.props;

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'neutral'
};
---

<Card headerTitle={item.title}>
  <div slot="header-actions">
    <Badge variant={statusColors[item.status]}>
      {item.status}
    </Badge>
  </div>

  <p>{item.description}</p>
</Card>
```

### Pattern: Composition

```astro
---
import Card from '@deltek/harmony-components/ui/Card.astro';
import Button from '@deltek/harmony-components/ui/Button.astro';
import Badge from '@deltek/harmony-components/ui/Badge.astro';

interface Props {
  title: string;
  tags?: string[];
  onAction?: string;
}

const { title, tags = [], onAction } = Astro.props;
---

<Card headerTitle={title}>
  <div slot="header-actions">
    {tags.map(tag => (
      <Badge>{tag}</Badge>
    ))}
  </div>

  <slot />

  <div slot="footer">
    {onAction && (
      <Button variant="primary" onclick={onAction}>
        Take Action
      </Button>
    )}
  </div>
</Card>
```

## Troubleshooting

**Problem: Import fails**
```
Cannot find module '@deltek/harmony-components/ui/Button.astro'
```

**Solution:** Use full node_modules path:
```astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
```

**Problem: Props not working**

**Cause:** Forgot to spread base props

**Solution:**
```astro
<BaseComponent {...baseProps}>  <!-- Add this -->
```

**Problem: Production build fails**

**Cause:** Component path not found in build

**Solution:** Check import path relative to build output

## Documentation

- [Consumer Guide](../../docs/customization/CONSUMER_GUIDE.md) - Install, use, customize, update, deploy

## Need to Modify Markup?

If you need to change the component's HTML structure, wrappers won't work. You need Tier 3 (Component Forks).

See:
- [CONSUMER_GUIDE.md](../../docs/customization/CONSUMER_GUIDE.md#customization-four-tiers)
- Helper scripts: `npm run harmony:copy ComponentName`
