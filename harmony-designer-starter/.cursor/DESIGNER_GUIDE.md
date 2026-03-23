# Designer guide (Harmony designer starter)

Quick reference for Cursor slash commands and skills **included in this kit**. This project is a **self-contained React** preview: `ShellLayout` and Harmony components live under `src/components/harmony/`. There is **no** Astro conversion workflow in this package.

---

## Slash commands

Invoke these in Cursor chat to run a workflow.

| Command | What it does |
|--------|----------------|
| **/build-layout** | Compose a page layout inside the existing React `ShellLayout`. Describe the page (e.g. "settings page with form inputs and toggles"). The agent uses components from `src/components/harmony/` and optional anatomy from **design-patterns** `reference/`. |
| **/create-pattern** | Create a new design pattern doc from a component. Uses `python .cursor/skills/design-patterns/scripts/create_pattern.py` (run from project root; see design-patterns skill). |
| **/search-patterns** | Search the design-patterns registry. Use `python .cursor/skills/design-patterns/scripts/search_patterns.py` with optional `--query`, `--product`, `--category`, or `--list` (defaults to `.cursor/skills/design-patterns/reference`). |
| **/harmony-critique** | Critique the current design or implementation against Harmony. Uses **harmony-usage-rules** and **harmony-ux-principles**. |
| **/ux-review** | Standalone UX review using **harmony-ux-principles** (works on any UI description or file). |

### Other Harmony actions (no slash command)

Ask in natural language (e.g. "audit this file for Harmony"). The **harmony** skill covers setup, component lookup, tokens, audit, normalize, accessibility, extract, and onboarding flows.

---

## Skills (what they do)

| Skill | What it does |
|-------|----------------|
| **design-patterns** | Pattern docs under `.cursor/skills/design-patterns/reference/`, registry, `create_pattern.py`, and `search_patterns.py`. |
| **harmony** | Hub for Harmony: components, ShellLayout, theme/mode (`theme-ppm`, `.dark`), paths in this repo. |
| **harmony-usage-rules** | Compliance and accessibility rules for Harmony usage. |
| **harmony-ux-principles** | UX principles for critique and reviews. |
| **layout-builder** | Compose pages inside the shell; React + `src/components/harmony/`. |

**Not included:** harmony-converter (Astro → other frameworks)—this kit is React-only.

---

## Typical workflows

1. **New page in the shell**  
   Use **/build-layout** with a description of the screen. The agent adds a page under `src/pages/` and a route in `src/App.tsx`.

2. **Document a pattern**  
   Run `python .cursor/skills/design-patterns/scripts/create_pattern.py <ComponentName>` from the project root, then review the generated file under `reference/`.

3. **Find patterns**  
   `python .cursor/skills/design-patterns/scripts/search_patterns.py --query wizard` or `--list`.

4. **Harmony + UX review**  
   **/harmony-critique** on a file or **/ux-review** for UX-only feedback.

---

## Theme and mode

The app defaults to **`theme-ppm`** and light mode (see `src/App.tsx`). To preview another brand or dark mode, adjust classes on `document.documentElement` (e.g. `theme-cp`, `theme-vp`, `theme-maconomy`, and `dark`)—there is no dev theme switcher in this starter.
