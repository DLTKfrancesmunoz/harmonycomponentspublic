# Harmony Components Examples

This folder contains reference implementations showing how to customize and extend Harmony components using the four-tier customization system.

## Overview

These examples demonstrate real-world patterns for:
- **Tier 2:** Wrapper components that add behavior without modifying base components
- **Composed components:** Complex combinations and data transformations

## Using These Examples

### Copy to Your Project

```bash
# Copy an individual example wrapper
cp node_modules/@deltek/harmony-components/examples/wrappers/TrackedButton.astro \
   src/components/composed/

# Copy all wrappers
cp node_modules/@deltek/harmony-components/examples/wrappers/*.astro \
   src/components/composed/
```

### Adapt for Your Needs

1. Update import paths to match your project structure
2. Modify prop interfaces for your use case
3. Adjust styling via CSS variables
4. Add project-specific logic

## Available Examples

### Wrappers (Tier 2)

**[examples/wrappers/TrackedButton.astro](./wrappers/TrackedButton.astro)**
- Wraps Harmony Button with analytics tracking
- Shows how to add custom props without forking
- Demonstrates onclick handler injection
- Use case: Track button clicks across your app

**[examples/wrappers/ProjectCard.astro](./wrappers/ProjectCard.astro)**
- Wraps Harmony Card for project status display
- Shows data transformation in wrapper
- Demonstrates status badge integration
- Use case: Standardize project card appearance

## Documentation

For complete customization guidance:

- **[Consumer Guide](../docs/customization/CONSUMER_GUIDE.md)** - Install, use, customize, update, deploy

## Creating Your Own Wrappers

### Basic Template

```astro
---
// Import base component from Harmony
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

// Define wrapper props (extends base props)
interface Props {
  customProp?: string;
  [key: string]: any; // Accept all base props
}

const { customProp, ...baseProps } = Astro.props;
---

<Button {...baseProps} data-custom={customProp}>
  <slot />
</Button>
```

### Best Practices

1. **Import Paths:** Use full node_modules path (package subpaths may not work in all environments)
2. **Prop Spreading:** Use `...baseProps` to pass through all base component props
3. **Type Safety:** Define clear interfaces for custom props
4. **Documentation:** Add metadata header documenting customizations
5. **Testing:** Test in production build, not just dev mode

## Related Directories

**In Consuming Projects:**

```
your-project/
├── src/
│   └── components/
│       └── composed/          # Your Tier 2 wrappers go here
│           ├── README.md
│           └── TrackedButton.astro  # Copied and adapted from examples
```

**In Harmony Package:**

```
@deltek/harmony-components/
├── docs/customization/        # Documentation
├── examples/                  # This folder - reference implementations
└── scripts/                   # Helper scripts for Tier 3 forks
```

## Questions?

See the [Consumer Guide](../docs/customization/CONSUMER_GUIDE.md) for complete setup instructions.
