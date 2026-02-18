# Designer & Product Manager Guide

Quick reference for Cursor slash commands and design skills in this repo. Use these when working in Cursor to get consistent layouts, patterns, and Harmony-based UI.

---

## Slash commands

Invoke these in the Cursor chat to run a specific workflow.

| Command | What it does |
|--------|----------------|
| **/build-layout** | Compose a page layout inside an existing Harmony shell. You describe the page (e.g. "settings page with form inputs and toggles"), shell variant (e.g. "VP dark"), and framework (e.g. Vue). The agent uses converted ShellLayout and components; run `/convert-shell` first if the shell isn’t converted yet. |
| **/convert-component** | Convert a single Harmony (Astro) component to your target framework. You provide the component name (e.g. TabStrip, Button, RadioGroup) and framework (e.g. Vue, React). Works for any Harmony component — shell components use the component table, others are resolved directly from the Harmony package. Use when you need one component in React/Vue/Svelte/Angular/vanilla. |
| **/convert-shell** | Convert the full Harmony shell (header, footer, sidebars, page header, content slot) to your target framework. You provide shell variant (e.g. "VP dark", "CP dark") and framework. Converts leaf components first, then assembles ShellLayout, then runs integration verification. |
| **/convert-all** | Convert all Harmony components to the target framework. Provide framework (e.g. React, Vue); optionally shell variant (e.g. "VP dark") to convert shell first, or `--dry-run` to list components, `--skip-shell` to skip shell. Runs full converter + verifier per component; batch checkpoint every 5 components. Use when you need the full library in one go. |
| **/generate-llms-txt** | Generate `llms.txt` and `llms-full.txt` (and `llms/*.md` per component) for the converted component library so any LLM can understand APIs without Cursor. Optional: output dir, component dir, `--dry-run`. Run after converting (e.g. `/convert-all React`); requires converted components in the app output directory. |
| **/seed-patterns** | Generate draft pattern docs for common enterprise UI patterns from the seed list. Uses Harmony component docs and the pattern template; writes to design-patterns `reference/` and updates the registry. Review each draft, refine, and set status to `review` then `approved` so patterns appear in `/search-patterns` and can be used by `/build-layout`. |
| **/create-pattern** | Create a new design pattern doc from an existing component. You provide the component name (e.g. FloatingNav, WizardDialog) and optionally the product (e.g. CP, PPM). The script generates a pattern file in the design-patterns registry; you then fill TODOs and set status to review. |
| **/search-patterns** | Search the design-patterns registry. You can pass a query (e.g. wizard, sidebar), and/or `--product PPM`, `--category navigation`, or `--list` to list all. Results are shown in a table (Pattern, Product, Category, Status, Path). |
| **/harmony-critique** | Critique the current design or implementation against Harmony. Uses both **harmony-usage-rules** (components, accessibility, layout) and **harmony-ux-principles** (cognitive load, progressive disclosure, usability). Use on a file or screen to get specific findings and recommendations. |
| **/ux-review** | Run a standalone UX review on any UI (no Harmony required). Uses only the **harmony-ux-principles** checklist: interactive element count, cross-reference friction, entry point, system status, error-prone flows, user frequency. Works on any project; pass a file path or description of the UI to review. |

### Other Harmony actions (no slash command)

These don't require a slash command — just ask the agent directly (e.g. "audit this file for Harmony" or "look up the Button component"). Do not try `/harmony-audit` or similar; those are not defined slash commands. The **harmony** skill defines these capabilities and the agent will use the right rules when you ask in natural language:

- **First-time setup** — Discover and save Harmony root and optional theme/mode (e.g. "set up Harmony for this project").
- **Component lookup** — Look up a component or layout (props, variants, usage).
- **Tokens** — Look up colors, spacing, typography, elevation, theme/mode.
- **Audit** — Audit the current file for Harmony compliance (components, props, variants, tokens).
- **Normalize** — Suggest or apply edits to use Harmony components and tokens.
- **Accessibility** — Check semantics, ARIA, contrast, touch targets against Harmony patterns.
- **Extract** — Find repeated or ad-hoc UI that could use Harmony components or ShellLayout.
- **Onboard** — Design onboarding, empty states, or first-time UX with Harmony components.

---

## Skills (what they do)

Skills give the AI context and rules. They are used automatically when you run commands or ask related questions.

| Skill | What it does |
|-------|----------------|
| **design-patterns** | Manages UI/UX patterns across products (PPM, CP, VP, etc.). Use it to create patterns from components, document patterns for consistency, look up patterns by product or category, and search for reusable patterns. It includes a registry, creation script, and search script. When the project uses Harmony, it works with the harmony skill for the actual components and styling. Use `/seed-patterns` to bootstrap the registry with draft patterns for common enterprise patterns; then review and set status to approved. |
| **harmony** | Hub and source-of-truth for the Harmony design system. Explains when and how to use Harmony, where components and layouts live (including ShellLayout), docs and preview paths, theme/mode (e.g. theme-cp, .dark), and how to resolve the Harmony root. Lists all Harmony-related slash commands and points to usage-rules and ux-principles for detailed rules. |
| **harmony-usage-rules** | Design rules for Harmony: accessibility, component usage, and layout. Used when auditing, critiquing, or checking Harmony compliance. The agent reads rules from the Harmony repo (e.g. RULES.md) for do's and don'ts. Use when you need compliance checks or accessibility guidance. |
| **harmony-ux-principles** | General UX principles: cognitive load (e.g. 7±2 interactive elements per group), progressive disclosure, cross-reference friction, clear entry points, visible system status, error prevention, learnability vs efficiency. Used for design critique and usability feedback. Works with or without Harmony; for Harmony-specific component rules, the agent uses harmony-usage-rules. |
| **harmony-converter** | Converts Harmony Astro components to React, Vue, Svelte, Angular, or vanilla. Defines the component table (source, preview, output paths), shell conversion order, and exact-replica conversion rules. Used by `/convert-component`, `/convert-shell`, and `/convert-all`; includes reference examples per framework. |
| **layout-builder** | Composes page layouts inside an already-converted Harmony shell. Provides layout patterns (e.g. settings page, list/detail, dashboard, form page, empty state) and composition rules. Does not convert components or shell; use after `/convert-shell`. Used by `/build-layout`. |

---

## Typical workflows

1. **New page in Harmony shell**  
   Ensure shell is converted → `/convert-shell VP dark Vue` (or your variant/framework). Then compose the page → `/build-layout settings page with form inputs and toggles VP Vue`. The layout builder will tell you if any components (e.g. Toggle, RadioGroup) need converting first; run `/convert-component [name] [framework]` for each, then retry `/build-layout`. If you don't have the shell yet, you can run `/convert-all [framework]` with a shell variant to get the shell and all other components, or `/convert-shell` first for just the shell.

2. **Convert a single component**  
   Need one Harmony component in your framework (e.g. RadioGroup in Vue)? → `/convert-component RadioGroup Vue`. Works for any Harmony component, not only those in the shell.

3. **Convert entire component library**  
   Run `/convert-all React` (or Vue, Svelte, Angular, vanilla). Optionally provide shell variant (e.g. "VP dark") to convert the shell first, or `--dry-run` to see the list. Use `--skip-shell` if the shell is already converted. After conversion, run `/generate-llms-txt` to produce `llms.txt` and `llms-full.txt` so other LLMs (or docs) can use the component APIs without Cursor.

4. **Document a new pattern**  
   Built a new component or page that other designers should reuse? Run 
   `/create-pattern [ComponentName] [Product]` (e.g. `/create-pattern 
   ResourceAllocationTable PPM`). The script analyzes your component and 
   generates a pattern doc. Review the generated file, fill any TODOs, 
   and set status to `approved`. Once approved, the pattern appears in 
   `/search-patterns` results and `/build-layout` can use it for page 
   composition.

5. **Bootstrap pattern registry**  
   Run `/seed-patterns` to generate draft pattern docs for common enterprise patterns (navigation, dialogs, forms, data display, etc.). Review each draft in `reference/`, refine wording, then set status to `review` and later `approved`. Approved patterns appear in `/search-patterns` and can inform `/build-layout`.

6. **Find existing patterns**  
   `/search-patterns wizard` or `/search-patterns --product PPM` or `/search-patterns --category navigation`.

7. **Review design for Harmony and UX**  
   `/harmony-critique` on the current file or design.

8. **Review UX only (any project)**  
   `/ux-review` with a file path or description of the UI.
