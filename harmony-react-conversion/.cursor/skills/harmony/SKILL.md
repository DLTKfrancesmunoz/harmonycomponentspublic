---
name: harmony
description: Hub and source-of-truth for the Harmony design system. Explains when to use Harmony, where to find components and layouts (including ShellLayout), docs and previews, theme/mode (theme-* and .dark), Harmony root resolution, allowed sources, and lists all Harmony slash commands. Use when the user mentions Harmony design system, Harmony components, or asks how to use Harmony in Cursor.
disable-model-invocation: false
---

# Harmony Design System (hub)

When the user is working with or asking about the **Harmony design system**, use this skill to orient them.

**First:** Use the **harmony-usage-rules** skill for design rules (accessibility, component usage, layout). Use the **harmony-ux-principles** skill for cognitive load analysis, progressive disclosure guidance, and general usability principles.

## Slash commands

Point the user to these when they want a specific action:

| Command | Use when |
|--------|----------|
| `/harmony-setup` | First-time or new project: discover and save Harmony root (and optional theme/mode). |
| `/harmony-component` | Look up a component or layout (props, variants, usage). |
| `/harmony-tokens` | Look up colors, spacing, typography, elevation and theme/mode usage. |
| `/harmony-audit` | Audit current file for Harmony compliance (components, props, variants, tokens). |
| `/harmony-normalize` | Suggest or apply edits to use Harmony components and tokens. |
| `/harmony-accessibility` | Check a11y (semantics, ARIA, contrast, touch targets) vs Harmony patterns. |
| `/harmony-critique` | Critique design/implementation against Harmony patterns. |
| `/harmony-extract` | Find repeated or ad-hoc UI that could use Harmony components or ShellLayout. |
| `/harmony-onboard` | Design onboarding, empty states, or first-time UX with Harmony components. |

Commands live in this package's **commands/** folder.

---

# Source of truth

This section defines where to read Harmony components, layouts, docs, and tokens. All Harmony commands should use these rules.

## Resolve Harmony root

1. If `.cursor/harmony.json` exists (from **harmony-setup**), use its `harmonyRoot` value.
2. Else: **Harmony repo** = workspace root; **Consumer project** = `node_modules/@deltek/harmony-components` or the path where components were copied (e.g. `src/harmony`).

All paths below are relative to `{harmonyRoot}`.

## Allowed sources only

- **Components:** `src/components/ui/*.astro`, `src/components/ui/index.ts`
- **Layouts:** `src/layouts/*.astro` (ShellLayout and app-shell pattern)
- **Docs:** `src/pages/components/*.astro`, `src/pages/shell/*.astro`, `docs/*.md` (especially CONSUMER_GUIDE.md)
- **Preview:** `src/pages/preview/*.astro`
- **Tokens:** `src/tokens/*.json`, `src/styles/tokens.css`, `src/styles/components.css` for class names

## Theme, mode, variants, props

- **Theme:** `cp`, `vp`, `ppm`, `maconomy`. In `src/tokens/colors.json`; applied via `html` class (e.g. `theme-cp`).
- **Mode:** `light` | `dark`. In `colors.json` per theme (`palette.light`, `palette.dark`); applied via `html.dark`.
- **Variants / props:** From each component's `Props` interface and doc page props tables. Use actual prop names, types, defaults, and allowed values.

## Do not use

- `mcp-data/` (any directory or files under it)
- MCP tools or generated spec JSON for skill behavior

## Reference docs

- **Full source-of-truth rules:** [reference/SOURCES.md](reference/SOURCES.md)
- **Component and layout list:** [reference/COMPONENT_LIST.md](reference/COMPONENT_LIST.md)
