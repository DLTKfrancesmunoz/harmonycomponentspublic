# Cursor Agent Skills (Design)

These are Cursor Agent Skills for design: patterns, Harmony design system, and Harmony component conversion.

**This folder (`.cursor/skills/`) is the single source of truth for skills in this repo.** Build and update skills here only. There are no duplicate skill folders elsewhere in the project.

- **They're active when you work in this repo.** Open this project in Cursor and the agent can use all 5 skills.
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
