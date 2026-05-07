# Harmony Designer Starter — agent context

This repository is the **Harmony Designer Starter (React)**: a Vite app with bundled Harmony components under `src/components/harmony/`, vendored CSS (`harmony-styles/`), a full **downloaded icon SVG tree** at **`icons/`** (Tabler outline + custom; no npm icon library required to browse assets), and Cursor configuration under `.cursor/`.

## First steps for the human

1. `npm install` then `npm run dev` (port **5175** by default).
2. Read **[HARMONY_DESIGNER_HANDBOOK.md](HARMONY_DESIGNER_HANDBOOK.md)** for the full kit: skills, rules, agents, slash commands, and project layout.
3. Slash commands and a short skills index: **[.cursor/DESIGNER_GUIDE.md](.cursor/DESIGNER_GUIDE.md)**.

## Scope (do not assume)

- **React only** — Compose with `.tsx` under `src/components/harmony/`. There is **no** `harmony-converter` and no `/convert-shell` or `/convert-component` in this bundle.
- **`layout-builder`** is the domain skill (patterns, constraints). **`build-layout`** is the **`/build-layout`** playbook skill; they work together.

## Where things live

| Area | Path |
|------|------|
| Handbook | `HARMONY_DESIGNER_HANDBOOK.md` |
| Cursor skills | `.cursor/skills/` |
| Rules | `.cursor/rules/` |
| Verifier agents | `.cursor/agents/` |
| Kit version | `KIT_VERSION`, `CHANGELOG.md` |

## Parity with the main design system

When you change a **shared Harmony component** (props, DOM, or styles), apply the same change in **all three** places unless the edit is intentionally Astro-only:

1. **Astro source** — repo root `src/components/ui/` and global styles in `src/styles/` when needed.
2. **Harmony React conversion** — `harmony-react-conversion/src/components/harmony/`, plus `componentRegistry.tsx` demos and `src/llms/` / `llms/` when applicable.
3. **This kit (designer starter)** — mirror under `src/components/harmony/`, vendored `harmony-styles/`, and `src/componentRegistry.tsx`.

**VP-only doc demos:** wrap the example in `class="ds-demo-only-theme-vp"` (see root `src/styles/utilities.css` and `harmony-styles/utilities.css`). That hides the block unless `html` has `theme-vp`, so readers on CP/PPM/Maconomy do not see the demo.
