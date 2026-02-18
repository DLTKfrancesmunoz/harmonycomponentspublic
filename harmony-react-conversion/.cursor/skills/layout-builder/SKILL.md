---
name: layout-builder
description: "Compose page layouts inside converted Harmony shell templates using verified components. Use when a designer wants to build a page (settings, dashboard, form, list/detail) inside an existing shell. Triggers on 'build layout', 'create page', 'compose page', 'settings page', 'dashboard layout', or any request to assemble Harmony components into a page layout inside a shell."
---

# Layout Builder Skill

Compose page layouts inside converted Harmony shell templates using verified components from the harmony-converter and pattern definitions from the design-patterns skill.

The layout builder does not convert components or shells. It assembles already-converted, verified components into page layouts. If a component or shell is not yet converted, the designer must run `/convert-shell` or `/convert-component` first.

## How it connects to other skills

- **design-patterns** → provides documented patterns (anatomy, variants, when to use). If a pattern exists in the registry, the layout builder uses its anatomy as the structural reference.
- **harmony-converter** → provides the component table (where each converted component file lives) and the fallback for components not in the table.
- **Shell template** → provides the outer wrapper. The layout goes inside the shell's content slot (where ShellPageHeader + Card currently live).

## Layout Patterns

Common page layout types with their expected component composition. These are starting points, not rigid templates. The designer can describe any layout and the builder composes it; these patterns give the AI a vocabulary of proven arrangements.

### Settings page

- ShellPageHeader (title, optional subtitle)
- Card (primary, elevated) containing:
  - Form groups: Label + Input, Label + Toggle, Label + Checkbox
  - Grouped in sections (optional Card subdivisions or dividers)
- Button bar at bottom: Cancel (outline) + Save (primary)

### List / detail

- ShellPageHeader (title, action buttons)
- Card containing:
  - Table or list view (sortable, filterable)
- Detail panel: Card or Drawer with form fields
- Optional: Floating action button

### Dashboard

- ShellPageHeader (title, date range picker)
- Grid layout (CSS grid or flex):
  - Stat cards (Card with Badge or value display)
  - Chart cards (Card containing chart placeholder)
  - Activity list (Card with table or list)

### Form page

- ShellPageHeader (title, subtitle)
- Card containing:
  - Stepper or accordion sections
  - Form fields per section
  - Inline validation
- Button bar: Cancel + Submit

### Empty state

- ShellPageHeader (title)
- Card (centered content):
  - Icon (large)
  - Heading + description
  - Primary action button

## Composition Constraints

### Nesting rules

- Card can contain: form fields (Input, Textarea, Toggle, Checkbox, RadioButton), Button, Badge, Table, any display component.
- Card cannot nest inside Card. Use dividers or sections instead.
- ShellPageHeader is always the first child in the content slot.
- Button bar is always the last child (inside or after the Card).
- TabStrip is shell-level only. Inside content, use a tab component or accordion.

### Dialog and overlay sizing

Dialogs, wizards, and panels with variable-length content must set both min-height and max-height on the container. Without min-height, the dialog collapses to content height and looks too small. Use `min-height: 80vh` and `max-height: 90vh` on the dialog container, `min-height: 60vh` and `max-height: 80vh` on the scrollable content area (`.dialog__body` or equivalent). Footer buttons must remain fixed at the bottom. Content area scrolls internally. (Max-height prevents overflow; min-height prevents collapse — document both or the AI will only set one.)

### Verification

Verification: no browser. Verification is file/source comparison and build command run (fix until it compiles) only. Do not open a browser, navigate to a URL, or attempt to view the running app. If the build runs without errors, verification passes. Visual comparison is done by the designer, not the AI.

Dev server: If you need to check that the app compiles, run the build command (e.g. npm run build or npx vite build), not npm run dev. The dev server is a long-running process that blocks the terminal. Use the build command to verify compilation, then stop. Do not start a dev server.

### Spacing

- Use Harmony spacing tokens: `var(--space-1)` through `var(--space-8)`.
- Between form groups: `var(--space-4)`.
- Between sections: `var(--space-6)`.
- Card padding: use `card__body` class (inherits from design system).
- Page-level gaps: `var(--space-6)` between ShellPageHeader and first Card.

### Grid

- Use CSS grid for multi-card layouts: `grid-template-columns`.
- 2-column: `repeat(2, 1fr)`.
- 3-column: `repeat(3, 1fr)`.
- Gap: `var(--space-4)` or `var(--space-6)`.
- Responsive: stack to single column below 768px.

### Props

- Card: `variant="primary"` `elevation="elevated"` (default for page content).
- Button: `variant="primary"` for main action, `variant="outline"` for secondary.
- ShellPageHeader: `title` (required), `subtitle` (optional), actions slot (optional).

## Framework Composition Notes

### Vue

- Use `<template>` with `v-for` for repeated items.
- Scoped slots for Card content.
- `v-if` for conditional sections.

### React

- JSX composition with `.map()` for repeated items.
- `children` or named props for Card content.
- Conditional rendering with `&&`.

### Angular

- `*ngFor` for repeated items.
- `ng-content` or `ng-template` for Card content.
- `*ngIf` for conditional sections.
- Document-level selectors need global CSS (see harmony-converter Angular view encapsulation pitfall).

### Svelte

- `{#each}` for repeated items.
- `<slot>` for Card content.
- `{#if}` for conditional sections.

## Design-patterns integration

When a documented pattern exists in the design-patterns registry, the layout builder uses its anatomy as the structural reference. For this to work:

- Pattern component names must match the converter's component table (or the fallback can find the `.astro` source).
- Patterns should include a "Component Tree" section with a machine-readable component hierarchy. Example:

```
### Component Tree
- ShellPageHeader (title, subtitle)
- Card (primary, elevated)
  - Label + Input (repeated per field)
  - Label + Toggle (repeated per toggle)
- ButtonBar
  - Button (outline) "Cancel"
  - Button (primary) "Save"
```

If no documented pattern exists in the registry, the builder uses the layout patterns in this skill as the reference.
