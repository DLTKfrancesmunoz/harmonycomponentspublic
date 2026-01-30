# AI Context Schema for Components

## Purpose
The `aiContext` field in component JSON files provides AI-friendly guidance for component usage, composition patterns, and best practices. It extends the existing `usagePatterns` field with higher-level semantic information.

## Relationship to usagePatterns
- **usagePatterns**: Technical layout/composition patterns (existing)
  - Example: "When buttonAlignment='left', primary action appears first"
  - Focus: HOW components work technically

- **aiContext**: Higher-level usage guidance (new)
  - Example: "Use for user confirmation before destructive actions"
  - Focus: WHEN and WHY to use components

Both fields serve different purposes and should coexist.

## Schema Definition

```typescript
interface AIContext {
  // Common use cases - when to use this component
  commonUseCases: string[];

  // Typical compositions with links to recipes
  typicalCompositions?: TypicalComposition[];

  // Detailed guidance for each prop
  propGuidance?: Record<string, PropGuidance>;

  // What NOT to do (anti-patterns)
  antiPatterns?: string[];

  // Related components
  relatedComponents?: string[];
}

interface TypicalComposition {
  pattern: string;           // Human-readable pattern description
  frequency: 'very common' | 'common' | 'occasional';
  recipeId?: string;         // Optional link to recipe
}

interface PropGuidance {
  purpose: string;           // What this prop does
  required?: boolean;        // Is it required?
  default?: string;          // Default value
  examples?: string[];       // Example values
  tips?: string;             // Usage tips
  recommendation?: string;   // Recommended value or approach
}
```

## Example: Dialog Component

```json
{
  "name": "Dialog",
  "usagePatterns": {
    "footer-buttons": "When buttonAlignment='left' (default), place primary action button first in footer slot, followed by secondary actions",
    "sticky-layout": "The dialog uses flexbox column layout with header and footer as flex-shrink: 0"
  },
  "aiContext": {
    "commonUseCases": [
      "Confirmation dialogs (delete, save, cancel)",
      "Form submission dialogs",
      "Alert dialogs with actions",
      "Multi-step wizards"
    ],
    "typicalCompositions": [
      {
        "pattern": "Dialog + 2 Buttons (primary + cancel)",
        "frequency": "very common",
        "recipeId": "dialog-with-form-actions"
      },
      {
        "pattern": "Dialog + Input + Buttons",
        "frequency": "common",
        "recipeId": "dialog-with-input-form"
      },
      {
        "pattern": "Dialog + single OK button",
        "frequency": "common",
        "recipeId": "dialog-confirmation"
      }
    ],
    "propGuidance": {
      "title": {
        "purpose": "Dialog heading text displayed in header",
        "required": true,
        "examples": ["Delete Item?", "Edit Profile", "Confirm Changes"],
        "tips": "Use question format for confirmations. Keep concise (2-5 words)."
      },
      "buttonAlignment": {
        "purpose": "Align footer buttons left or right",
        "default": "left",
        "recommendation": "Use 'left' (default) for most cases - primary action appears first visually, matching semantic importance"
      },
      "headerVariant": {
        "purpose": "Visual variant for dialog header",
        "default": "default",
        "examples": ["default", "primary"],
        "tips": "Use 'primary' for important actions that need emphasis"
      }
    },
    "antiPatterns": [
      "Don't nest dialogs - use multi-step pattern instead",
      "Don't use without footer buttons - dialogs need actions",
      "Don't exceed 3 buttons in footer - too many choices confuse users"
    ],
    "relatedComponents": ["Button", "Input", "Alert"]
  }
}
```

## Example: Button Component

```json
{
  "name": "Button",
  "aiContext": {
    "commonUseCases": [
      "Primary actions (save, submit, confirm)",
      "Secondary actions (cancel, close, back)",
      "Tertiary actions (learn more, view details)",
      "Destructive actions (delete, remove)"
    ],
    "typicalCompositions": [
      {
        "pattern": "Dialog footer with primary + secondary buttons",
        "frequency": "very common",
        "recipeId": "dialog-with-form-actions"
      },
      {
        "pattern": "Card footer with action buttons",
        "frequency": "common",
        "recipeId": "card-with-actions"
      },
      {
        "pattern": "Alert with action button",
        "frequency": "common",
        "recipeId": "alert-with-action"
      }
    ],
    "propGuidance": {
      "variant": {
        "purpose": "Visual style indicating button importance and action type",
        "default": "secondary",
        "examples": ["primary", "secondary", "tertiary", "danger", "ghost"],
        "recommendation": "Use 'primary' for main action, 'secondary' for cancel, 'danger' for destructive actions"
      },
      "size": {
        "purpose": "Button size",
        "default": "md",
        "examples": ["sm", "md", "lg"],
        "tips": "Use 'sm' in compact spaces like card footers"
      },
      "type": {
        "purpose": "HTML button type",
        "default": "button",
        "examples": ["button", "submit", "reset"],
        "tips": "Use 'submit' for form submission buttons"
      }
    },
    "antiPatterns": [
      "Don't use multiple primary buttons in the same context",
      "Don't use 'danger' variant for non-destructive actions",
      "Don't rely on icon-only buttons without labels for important actions"
    ],
    "relatedComponents": ["ButtonGroup", "Dialog", "Card", "Alert"]
  }
}
```

## Example: Card Component

```json
{
  "name": "Card",
  "aiContext": {
    "commonUseCases": [
      "Content container with header, body, and footer",
      "List items (user cards, product cards)",
      "Dashboard widgets",
      "Feature showcases"
    ],
    "typicalCompositions": [
      {
        "pattern": "Card + Badge (status indicator)",
        "frequency": "very common",
        "recipeId": "card-with-badge"
      },
      {
        "pattern": "Card + ButtonGroup (actions)",
        "frequency": "very common",
        "recipeId": "card-with-actions"
      }
    ],
    "propGuidance": {
      "variant": {
        "purpose": "Visual style of the card",
        "default": "default",
        "examples": ["default", "outlined", "elevated"],
        "recommendation": "Use 'elevated' for prominent cards, 'outlined' for subtle separation"
      },
      "padding": {
        "purpose": "Internal padding",
        "default": "md",
        "examples": ["none", "sm", "md", "lg"],
        "tips": "Use 'sm' for compact cards, 'lg' for spacious layouts"
      }
    },
    "antiPatterns": [
      "Don't nest cards inside cards - flatten the hierarchy",
      "Don't use more than 2-3 badges per card",
      "Don't overcrowd card footer with too many actions (max 2-3)"
    ],
    "relatedComponents": ["Badge", "Button", "ButtonGroup", "Avatar"]
  }
}
```

## Guidelines for Creating AI Context

### 1. Common Use Cases
- List 3-5 most common use cases
- Be specific and actionable
- Focus on WHEN to use the component
- Examples should reflect real-world scenarios

### 2. Typical Compositions
- List patterns sorted by frequency
- Link to recipes when available (use recipeId)
- Include frequency: "very common", "common", "occasional"
- Keep pattern descriptions concise (5-10 words)

### 3. Prop Guidance
- Focus on props that need explanation
- Don't document every prop - only non-obvious ones
- Include purpose, examples, and tips
- Add recommendations for best practices

### 4. Anti-Patterns
- List 3-5 common mistakes
- Be specific about what NOT to do
- Explain why when not obvious
- Provide alternatives when helpful

### 5. Related Components
- List components commonly used together
- Keep to 3-5 most relevant components
- Order by relevance/frequency

## Minimal vs Complete

### Start Minimal (Phase 2)
For top 5-10 components, include:
- commonUseCases (required)
- typicalCompositions with recipe links (required)
- relatedComponents (required)
- antiPatterns (optional but recommended)
- propGuidance for 1-3 key props only

### Expand Later (If Needed)
- Add propGuidance for more props
- Add more compositions
- Add more use cases
- Add state-specific guidance

## Integration with Recipes

The `typicalCompositions` array links components to recipes:

```json
{
  "typicalCompositions": [
    {
      "pattern": "Dialog + 2 Buttons",
      "frequency": "very common",
      "recipeId": "dialog-with-form-actions"  // Links to recipe
    }
  ]
}
```

This creates bidirectional links:
- Component → Recipe (via aiContext.typicalCompositions)
- Recipe → Component (via recipe.components)

## Component JSON Extensions (interactivity and examples)

Component JSON files may include two optional fields for MCP tooling (e.g. get_specs): **interactivity** and **examples**. These are merged at generation time from hand-maintained and recipe-derived data.

### interactivity (optional)

Describes client-side events and state for components that have meaningful interactive behavior.

```typescript
interface Interactivity {
  events?: Array<{ name: string; description?: string }>;   // e.g. click, close, change
  state?: Array<{ name: string; type?: string; description?: string }>;  // e.g. open (boolean), value (string)
}
```

- **events**: User-facing or DOM events (e.g. `click`, `close`, `change`). `description` explains when/how the event is triggered.
- **state**: Client-side state the component manages (e.g. `open` boolean, `value` string). `type` is optional; `description` explains how state is controlled (e.g. CSS class, attribute).

Only components with client-side behavior need this field. Source: **mcp-data/interactivity.json** (component name → interactivity object), merged by the generator.

### examples (optional)

Component-level examples for get_specs. Can be recipe-linked or standalone.

```typescript
interface ComponentExample {
  name: string;
  description?: string;
  recipeId?: string;   // Links to a recipe that uses this component (recipe examples resolved by MCP)
  snippet?: string;    // Optional short code or usage hint for component-only examples
}
```

- **recipeId**: References a recipe that uses this component; the recipe’s own `examples` can be resolved by MCP for full context.
- **snippet**: Optional inline code or usage hint when there is no recipe.

Source: (1) Derived from recipes (each recipe’s `examples` are attributed to every component used in that recipe); (2) optional **mcp-data/component-examples.json** for manual entries. The generator merges these into each component’s `examples` array.

## Version History

- **v1.0** (2026-01-28): Initial schema definition for Phase 2
- **v1.1** (2026-01-30): Component JSON extensions (interactivity, examples)
