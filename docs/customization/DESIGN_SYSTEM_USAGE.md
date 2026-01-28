# Design System Usage - Quick Reference

Quick reference for using Harmony design tokens and CSS variables (Tier 0 customization).

## Available CSS Variables

Harmony components use CSS custom properties that you can override in your theme file.

### Colors

```css
/* Semantic colors */
--theme-primary
--theme-primary-hover
--theme-primary-active
--theme-secondary
--theme-secondary-hover
--theme-success
--theme-warning
--theme-error
--theme-info

/* Background colors */
--bg-default
--bg-subtle
--bg-muted
--bg-elevated

/* Text colors */
--text-primary
--text-secondary
--text-tertiary
--text-disabled
```

### Component-Specific Variables

#### Buttons
```css
--btn-border-radius
--btn-padding-x
--btn-padding-y
--btn-primary-bg
--btn-primary-text
--btn-primary-hover
--btn-secondary-bg
--btn-secondary-text
```

#### Cards
```css
--card-bg
--card-border
--card-border-radius
--card-padding
--card-shadow
--card-shadow-hover
```

#### Inputs
```css
--input-bg
--input-border
--input-border-radius
--input-padding-x
--input-padding-y
--input-focus-border
--input-placeholder-color
```

### Spacing

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Typography

```css
--font-sans
--font-mono
--font-weight-normal
--font-weight-medium
--font-weight-semibold
--font-weight-bold

--text-xs: 0.75rem   /* 12px */
--text-sm: 0.875rem  /* 14px */
--text-base: 1rem    /* 16px */
--text-lg: 1.125rem  /* 18px */
--text-xl: 1.25rem   /* 20px */
--text-2xl: 1.5rem   /* 24px */
--text-3xl: 1.875rem /* 30px */
```

### Elevation

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

## Usage Example

Create `src/styles/theme-myproject.css`:

```css
html.theme-myproject {
  /* Override brand colors */
  --theme-primary: #4C92D9;
  --theme-primary-hover: #3D7BC4;

  /* Override button styles */
  --btn-border-radius: 8px;
  --btn-padding-x: var(--space-6);

  /* Override card styles */
  --card-shadow: var(--shadow-lg);
  --card-padding: var(--space-6);

  /* Override spacing scale */
  --space-4: 1.125rem;  /* Make default spacing slightly larger */
}
```

Apply in your layout:

```astro
---
import '@deltek/harmony-components/styles/tokens.css';
import '@deltek/harmony-components/styles/global.css';
import '../styles/theme-myproject.css';
---

<html class="theme-myproject">
  <!-- Your content -->
</html>
```

## Component Rule

**For new UI, use a Harmony component first.** Only add custom components when necessary; they must use the tokens above.

- **Direct use:** Import from `@deltek/harmony-components/ui` or layouts
- **Wrappers:** Use wrappers (see [examples/](../../examples/)) when you need extra behavior (e.g. tracking) without changing markup
- **Forks:** Use component forks only when you must change component markup or props; keep using Harmony tokens inside the fork

## Theme Overrides

Project-specific token overrides should live in a dedicated theme file (e.g., `src/styles/theme-myproject.css`). Do not invent new token names in pages or components; override or use existing Harmony token names.

## Token Reference

For complete token definitions, see:
- `@deltek/harmony-components/src/tokens/colors.json`
- `@deltek/harmony-components/src/tokens/spacing.json`
- `@deltek/harmony-components/src/tokens/typography.json`
- `@deltek/harmony-components/src/tokens/elevations.json`

## Checklist for Adding New UI

1. **Check Harmony first:** Can an existing Harmony component (or a wrapper / override) do the job?
2. **If yes:** Use it and style only with tokens (and theme overrides). No new token names; no hex in CSS.
3. **If no:** Create a new component that wraps or composes Harmony components where possible and uses only the canonical tokens listed above.
4. **Fork (Tier 3) only when necessary:** Use component forks only when markup/behavior must change and wrappers aren't enough; keep using Harmony tokens inside the fork.

## Documentation

- [Customization Guide](./CUSTOMIZATION_GUIDE.md) - Full four-tier system
- [Component Patterns](./COMPONENT_PATTERNS.md) - Examples
- [For Consuming Projects](./FOR_CONSUMING_PROJECTS.md) - Setup guide
