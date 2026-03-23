# Cursor Agent Skills (Design)

These are Cursor Agent Skills for design: patterns, Harmony design system, and Harmony component conversion.

**This folder (`.cursor/skills/`) is the single source of truth for skills in this repo.** Build and update skills here only. There are no duplicate skill folders elsewhere in the project.

The folder [`skills_frances_test/`](/skills_frances_test) at the repo root is a **portable export mirror** (skills, rules, agents) for packaging or copying into other projects without editing `.cursor/` here. When the two diverge, **refresh the mirror from `.cursor/`** — not the other way around.

- **They're active when you work in this repo.** Open this project in Cursor and the agent can use all skills below.
- **To use in another project:** Copy this entire `.cursor/skills/` folder (or the skill folders you need) into that project's root. Then open that project in Cursor.
- **To use in every project (personal):** Copy each skill folder from here to `~/.cursor/skills/<name>/` on your machine (Mac: `/Users/yourname/.cursor/skills/`, Windows: `C:\Users\yourname\.cursor\skills\`). Then the skills are available in all Cursor projects.

## Skills included

| Skill | Purpose |
|-------|---------|
| design-patterns | Pattern creation, registry, search |
| harmony | Hub and source-of-truth: when to use Harmony, slash commands, paths, theme/mode |
| harmony-usage-rules | Compliance, accessibility, do's and don'ts |
| harmony-ux-principles | Cognitive load, progressive disclosure, UX |
| harmony-converter | Astro → React/Vue/Svelte/Angular/vanilla |
| layout-builder | Compose pages inside a converted Harmony shell |

## Explicit playbooks (`disable-model-invocation: true`)

Invoke via `/` (e.g. `/build-layout`). Former project commands; bodies are verbatim in each `SKILL.md`.

| Skill | Purpose |
|-------|---------|
| build-all-patterns | One page per registry pattern + verifiers |
| build-layout | Compose a page inside a converted shell |
| convert-all | Batch convert Harmony components |
| convert-component | Single component convert + verifier |
| convert-shell | Full shell convert + integration verify |
| create-pattern | Run create_pattern.py from a component |
| generate-llms-txt | Generate llms.txt for converted library |
| harmony-critique | Usage rules + UX principles critique |
| search-patterns | Registry search CLI |
| seed-patterns | Seed draft pattern docs |
| ux-review | UX principles only |

Designer-facing overview: [`.cursor/DESIGNER_GUIDE.md`](../DESIGNER_GUIDE.md).
