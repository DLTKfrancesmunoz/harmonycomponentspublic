---
name: harmony-converter
description: Converts Harmony Design System Astro components to React, Vue, Svelte, Angular, or vanilla. Use when converting @deltek/harmony-components or when working with Harmony Astro components in non-Astro projects.
---

# Harmony Design System Converter

**Install / Sharing:** This skill lives in a folder named `harmony-converter` containing this `SKILL.md`. Copy that folder to `~/.cursor/skills/harmony-converter/` (all projects) or to `.cursor/skills/harmony-converter/` (one repo). For an exact replica, the real Astro source is required; it lives inside the Harmony package. If the package is not in the project, install it (e.g. npm from registry or Git) so you can read the .astro files and convert from them. Only when the package cannot be installed, use the skill's reference examples (React in this doc; Vue, Svelte, Angular, vanilla in this skill at reference/vue/, reference/svelte/, reference/angular/, reference/vanilla/) and produce full components in the user's target framework from those—do not invent Astro files or stubs.

**When to use:** Converting a Harmony Astro component to another framework (React, Vue, Svelte, Angular, vanilla); auditing a component against Harmony conversion rules; validating DOM, BEM, and props against the reference implementation.

Convert Astro components from the Harmony Design System to other frameworks (React, Vue, Svelte, Angular, vanilla HTML/CSS/JS).

## Component table and conversion order

**Files to @-reference per task:** Use this table. Every converter task must @-mention the source, preview, and output for the component. Replace path prefixes with the actual paths in the project (e.g. Harmony package path, app output path).

| Component | Source | Preview | Output (example) |
|-----------|--------|---------|------------------|
| Icon | @harmony/Icon.astro | @preview/shell-layout-dark-vp.astro | @app/.../Icon.tsx (or .vue, .svelte) |
| LeftSidebar | @harmony/LeftSidebar.astro | @preview/shell-layout-dark-vp.astro | @app/.../LeftSidebar.tsx |
| RightSidebar | @harmony/RightSidebar.astro | @preview/shell-layout-dark-vp.astro | @app/.../RightSidebar.tsx |
| TabStrip | @harmony/TabStrip.astro | @preview/shell-layout-dark-vp.astro | @app/.../TabStrip.tsx |
| ShellFooter | @harmony/ShellFooter.astro | @preview/shell-layout-dark-vp.astro | @app/.../ShellFooter.tsx |
| ShellPageHeader | @harmony/ShellPageHeader.astro | @preview/shell-layout-dark-vp.astro | @app/.../ShellPageHeader.tsx (or .vue, .svelte) |
| Card | @harmony/Card.astro | @preview/shell-layout-dark-vp.astro | @app/.../Card.tsx (or .vue, .svelte) |
| Avatar | @harmony/Avatar.astro | @preview/shell-layout-dark-vp.astro | @app/.../Avatar.tsx (or .vue, .svelte) |
| ShellLayout | @harmony/ShellLayout.astro | @preview/shell-layout-dark-vp.astro | @app/.../ShellLayout.tsx |
| Button | @harmony/Button.astro | (component preview if any) | @app/.../Button.tsx |
| Alert | @harmony/Alert.astro | (component preview if any) | @app/.../Alert.tsx |

**Shell conversion order:** Issue one component per task in this order. Leaf components before composition.

1. Icon
2. LeftSidebar
3. RightSidebar
4. TabStrip
5. ShellFooter
6. ShellPageHeader
7. Card
8. Avatar
9. ShellLayout (assembly)
10. Integration verify

The Astro shell preview uses ShellPageHeader and a Card (primary, elevated) for the default page header and main content slot; converting them explicitly ensures the shell is not built with a placeholder div.

Components not in the table can still be converted via the convert-component command's fallback: locate the component's .astro source in the Harmony package, confirm the file exists, then run the same pre-flight and verifier flow; no preview file is required for non-shell components.

## Scoped styles (TabStrip pitfall)

Astro component `<style>` blocks contain **scoped styles** that are **not** in the global CSS. For every component you convert, you **must** extract and include the component's own `<style>` block in the output. If you only copy global CSS (e.g. from components.css), the conversion is **incomplete**. TabStrip is a named example: it has a `<style>` block with scoped rules that must appear in the converted component's CSS; omitting them causes layout and appearance deviations.

## ShellHeader (pitfall)

When converting ShellHeader, the converter and verifier must account for:

- **Gradient bar:** ShellHeader.astro contains a `<div class="header__gradient">` with an inline gradient style using the company color token. This element is easy to miss because it's a visual flourish, not a structural component. The converter must include it; the verifier must check for it.
- **Divider:** ShellHeader.astro renders a `<div class="divider">` between the company picker and the Avatar. This element is easy to miss because it looks like spacing, not a component. Include it in the converted header.
- **Behavior script:** ShellHeader.astro contains a client-side script (~lines 126–221) that handles: (1) company picker dropdown open/close with outside-click dismiss, (2) company selection updating the displayed name, indicator color, and gradient bar background. When converting ShellHeader, this script must be reimplemented in the target framework's idiom (e.g. Vue `@click` + reactive state, React `onClick` + `useState`). Structure-only conversion is incomplete.

## ShellFooter (pitfall)

- **Tab label colors:** In the Astro source, the dark footer bar uses `--text-inverse` (white) for all tab labels. Only the active tab's pin icon and underline use `--theme-primary`. When converting, parent-component style overrides (e.g. ShellFooter's `:deep()` rules in Vue) can be defeated by child-component scoped styles (e.g. TabStrip's `.tab.is-active { color: var(--theme-primary) }`) if the child styles load after the parent. Fix: put footer tab color overrides in global CSS (e.g. layout.css) with sufficient specificity to win over component-scoped styles. This is a CSS load-order issue, not a structural one.

## Icons: inline SVG vs img (pitfall)

- **Inline SVG vs `<img>` color inheritance:** Icons rendered as inline SVG with `stroke="currentColor"` inherit the sidebar's text color (e.g. white in dark mode). Icons rendered as `<img src="...svg">` do not — the browser paints the baked-in file colors, ignoring CSS `color`. Custom asset icons (e.g. Risk Shield.svg, Report.svg, Resource.svg, related.svg, template.svg) typically use `<img>` and will appear gray on dark backgrounds. Fix: use CSS `filter: brightness(0) invert(1)` on `<img>` icons in dark mode, or replace them with inline SVG using `currentColor` so they inherit the theme color like all other icons.

Note: As of February 2025, components.css includes `html.dark .right-sidebar__icon-img` filter rules. If the converted app loads the full components.css, this is handled. If styles are split or overridden, ensure the icon-img dark filter is included. For other components, the package may only include the dark-mode filter for specific named elements; when converting, check every `<img>`-rendered icon and add the dark-mode filter rule if it's not in the source CSS, and verify against the reference.

## Icon manifest is not complete (pitfall)

The theme-scoped icon manifest does not contain every icon used by Harmony components. Some icons (e.g. user in Avatar.astro) are not in the manifest but resolve successfully in Astro via the fallback chain: Heroicons → Tabler → public/{name}.svg. When converting, the Icon component in the target framework must implement the same fallback chain — manifest first, then Heroicons, then Tabler, then public path, then fallback "?". A manifest-only implementation will miss icons that Astro resolves through the fallback. This applies to every framework.

**Cross-theme fallback:** When an icon is not in the current theme's manifest section (e.g. chevron-down is in cp but not ppm), the fallback chain still applies. The converted Icon component should check: (1) current theme's manifest section, (2) other theme sections in the manifest (e.g. fall back to cp), (3) Heroicons, (4) Tabler, (5) public path, (6) fallback "?". Do not implement the fallback as a hardcoded list of ad-hoc SVG entries — implement it as an actual resolution chain that can resolve any icon name without manual additions per icon.

## Angular view encapsulation vs document-level selectors (pitfall)

Angular's default emulated view encapsulation rewrites component CSS selectors to scope them to the component's DOM. Selectors that depend on document-level classes (e.g. `html.theme-cp .left-sidebar__variant--cp`) will fail because the encapsulation attribute won't match elements outside the component. When converting components that use theme-dependent visibility or any selector targeting `html.*`, put those rules in a global stylesheet (e.g. styles.css) or use ViewEncapsulation.None on that specific style block. Vue and Svelte handle this with unscoped style blocks; Angular requires explicit global placement. As of February 2025, the Harmony package components.css includes global left sidebar theme visibility rules and right sidebar icon-img dark-mode filters. If the converted app loads components.css globally, these rules apply automatically. This pitfall only applies if the app splits or overrides components.css and omits these blocks.

## Host app root/body styles (pitfall)

Framework scaffolds (Vite, Create React App, Angular CLI, etc.) include default root/body styles (e.g. max-width, margin: auto, text-align: center, display: flex; justify-content: center on #root or #app). These override Harmony's shell layout and cause the shell to appear centered, narrow, or misaligned. When integrating the shell into a scaffolded app, remove or reset the scaffold's root/body styles so the shell layout fills the viewport as the Astro source does. Check index.css, App.css, or the equivalent for the framework and remove any max-width, margin, padding, text-align, or flex centering on the root element.

## Mandatory rules (read first)

- **Use the real source — do not skip:** When the user's project has the Harmony package installed (`node_modules/@deltek/harmony-components/` or `src/components/harmony/`), you MUST read the actual .astro files and CSS (components.css, layout.css) from that package for the component you are converting. When the package is not installed, you MUST read this skill's `reference/CONSUMER_GUIDE.md` and follow it to install the package so the source is available, then read the .astro and CSS from the package. Do not generate from the in-doc examples or memory when the package is or can be present; your output must be derived from the file contents you read.
- **Source of truth:** The spec is the Astro source (and package components.css / layout.css). You MUST derive DOM, classes, styles, and behavior only from that. Do not invent pipelines, manifests, or CSS that are not in the source.
- **Styles:** For each converted component you MUST have matching CSS. If the Astro component has a `<style>` block, copy every selector block (including every `html.dark` and `html.theme-*.dark`) into the converted component's CSS. If the Astro component has **no** `<style>` block (e.g. Card, ShellHeader), you MUST copy the rules from components.css (and layout.css when the component uses layout rules, e.g. `.header__gradient`) that apply to that component's selectors into the converted component's CSS. Do not rely on global Harmony CSS alone; framework encapsulation or load order may prevent it from applying.
- **Icons:** You MUST use the theme-scoped manifest from the package when present and implement icons the same way as the source (Icon.astro: e.g. inline SVG + currentColor or `<img src="…">` from manifest paths). The manifest is not exhaustive. The converted Icon component must also implement the Astro fallback chain (Heroicons → Tabler → public/{name}.svg) for icons not in the manifest. See the "Icon manifest is not complete" pitfall. The fallback chain must be a generic resolution mechanism (check manifest, then icon libraries, then public path), not a hardcoded map of individual icon names. If the conversion adds icons one at a time to a FALLBACK_SVG map, the implementation is wrong — it should resolve dynamically like Icon.astro does. Do not invent a new manifest or path scheme (e.g. custom `/icons/...`). Do not add dark-mode CSS for icons that is not in the source (e.g. no global `html.dark ... img { filter: ... }`).
- **Verification:** You MUST NOT mark the conversion complete until you have run the app, compared the result to the Astro source (diff or systematic check), and fixed any differences from the source. If the app does not run (e.g. dev server fails), you MUST fix the run failure first, then run and verify.

Dev server: To verify the app compiles, use the build command (e.g. npm run build), not npm run dev. A dev server is a long-running process that blocks the agent. Use build to check for errors, then stop.
- **Roadblocks:** When you cannot implement something the way the source does (e.g. framework limitation), you MUST NOT infer a workaround. Document the gap or ask the user. Do not invent pipelines, filters, or CSS that are not in the source.
- **Icons and shell/footer:** Icons = use the reference for the target framework (reference/vue, reference/svelte, reference/angular, reference/vanilla), same pattern as that reference; do not create a service/pipe/helper that returns URL paths for standard icons. When the package's icon manifest has a **svg** field (from `npm run inline:icon-manifest`), use it for inline SVG in the target framework instead of inventing paths or a URL-based service. Shell/footer = copy every style from ShellLayout.astro, ShellFooter.astro, layout.css, components.css, and tokens.css, including every `html.dark` and `html.theme-*.dark` block; use the same layout tokens (e.g. `--shell-layout-*`, `--space-*`); do not hardcode padding.
- **When icons don't resolve:** If any icon shows a fallback (e.g. "?") or the verifier reports missing icons, **check the local project's Icon component and icon config** (e.g. Icon.vue, iconPaths map). The converted app often only renders icons that are in that map or have inline path data; it does not load from node_modules at runtime. Add inline path data (or paths) for every icon used by the component/shell so that **every icon is either a custom `<img>` or inline SVG**. Do not leave any icon unresolved. Derive path/SVG data from the package manifest or the skill's reference for the target framework.

The rest of this skill is reference (source locations, syntax tables, examples). The rules above apply to every framework and every conversion.

### Conversion compliance by framework

Before marking conversion done, satisfy the requirements for your target framework:

| Requirement | Vue | Svelte | Angular | Vanilla |
|-------------|-----|--------|---------|---------|
| **Icons** | Use reference/vue (e.g. SidebarIcons.vue, AlertIcons.vue): same pattern. No URL-based icon source. | Use reference/svelte: same pattern. No invented icon service/paths. | Use reference/angular (inline SVG in template, see right-sidebar). No IconService/URLs for standard icons. | Use reference/vanilla (icons.js + createSvg / inline or img). No invented paths. |
| **Shell/footer** | Read ShellLayout.astro, ShellFooter.astro, tokens.css, components.css; copy every dark block and same tokens. | Same. | Same. | Same. |
| **Shell contract** | Main: padding-right when right sidebar present (match source). Footer dark: active tab and label white (override in footer, not --text-inverse). | Same. | Same. | Same. |
| **Dark mode** | App must set `theme-cp dark` or `theme-vp dark` on `<html>`. Converted CSS must include every dark block from source. | Same. | Same. | Same. |

### Angular gotchas

Document-level selectors (e.g. `html.theme-cp`) do not work under Angular's default view encapsulation; put those rules in a global stylesheet or use ViewEncapsulation.None. See the pitfall **Angular view encapsulation vs document-level selectors** above.

### Before you convert (do this first)

0. **Pre-implementation plan (before writing conversion code):** Output a short plan listing: (1) **Sources** — which Astro/layout files will be read (e.g. which .astro under components/ui or layouts). (2) **CSS** — which files (components.css, layout.css, etc.) and which selectors or sections apply to the component(s) being converted. (3) **Icon plan** — manifest vs reference; which icons and how they will be resolved (manifest path/svg field vs reference for target framework). Then implement from that plan.
1. **Identify target framework** (React, Vue, Svelte, Angular, or vanilla).
2. **Read the reference for that framework** — use the exact paths below; use that reference for icons and structure; do not invent.
   - **Angular:** `reference/angular/components/right-sidebar/right-sidebar.html`, `reference/angular/components/right-sidebar/right-sidebar.ts`, `reference/angular/styles/right-sidebar.css`; same for alert, button. `reference/angular/styles/` for CSS and tokens.
   - **Vue:** `reference/vue/components/` (Alert, Button, RightSidebar + icon components), `reference/vue/styles/` (alert.css, button.css, right-sidebar.css, tokens.css).
   - **Svelte:** `reference/svelte/lib/` (Alert, Button, RightSidebar), `reference/svelte/styles/`.
   - **Vanilla:** `reference/vanilla/css/`, `reference/vanilla/js/` (alert.js, button.js, right-sidebar.js, icons.js, app.js).
3. **For shell layout:** When the package has shell preview(s) (e.g. `src/pages/preview/shell-layout-dark-cp.astro`, `shell-layout-dark-vp.astro`), read them for structure; when the package has no `src/pages/preview/`, derive structure from ShellLayout.astro, ShellFooter.astro, layout.css, components.css, tokens.css, and the Shell layout defaults / Where shell layout dark lives sections in this skill. Copy all structure, footer (theme-conditional), every `html.dark` / `html.theme-*.dark` block, and same layout tokens. Use the reference's icon pattern and paths (e.g. `/RS_DelaDefault.svg`, `/mic-slash.svg` from public/); do not invent.

**Shell layout and dark:** The exact files and dark preview paths are in **Where shell layout dark lives** (under Design System Context below). Shell layout must also satisfy the **Shell layout build contract** (main right padding when right sidebar; footer active tab and label white in dark). Use that section when converting shell.

---

## Source Locations

The **real Astro source** is inside the Harmony package. You do not run Astro; the .astro files are source to read and convert. The package also provides CSS to import in this order: **reset.css** → **tokens.css** → **global.css** → **components.css** (optionally layout.css, utilities.css). Do not reorder or omit reset.

Components and dependencies are installed via npm:

```
node_modules/@deltek/harmony-components/
  src/
    components/
      ui/           ← All components (Button.astro, Alert.astro, etc.)
    layouts/
  styles/
    reset.css       ← Import first
    tokens.css      ← Design tokens
    global.css      ← Main stylesheet
    components.css  ← Component styles
    layout.css      ← Optional (e.g. shell)
    utilities.css   ← Optional
  tokens/
    colors.json
    typography.json
    spacing.json
```

Import in the order listed above; reset first.

**Check for local overrides first:**
```
src/components/harmony/   ← Overridden components (takes priority)
.harmony-sync.json        ← Tracks which components are overridden
```

If a component exists in `src/components/harmony/`, use that version. Otherwise use the package version.

### Getting the real source

**Before writing conversion code:** Resolve and read the source. If the package is absent, read `reference/CONSUMER_GUIDE.md` (in this skill) and install per the guide, then read the .astro and CSS from the installed package. If the package is present, read the .astro and relevant CSS files for the component you are converting. Do not proceed using only the in-doc examples when the package is or can be available.

- **If the Harmony package is not in the project:** Install it so the Astro source is available (e.g. `npm install @deltek/harmony-components` or from a Git URL / private registry). If needed, read the Consumer Guide in this skill at `reference/CONSUMER_GUIDE.md` for install commands (e.g. npm from Git) and setup steps. Then read the .astro files under `node_modules/@deltek/harmony-components/src/` (e.g. `src/components/ui/*.astro`, `src/layouts/*.astro`) and convert from that. The app stays in the user's target framework (React, Vue, Svelte, Angular, or vanilla); you do not install or run the Astro framework.
- **If the package is already present:** Read the actual files. The source of truth is the real Astro in `node_modules/@deltek/harmony-components/` or `src/components/harmony/`. Open and read those .astro files and the relevant rules in components.css / layout.css; copy default data, DOM, BEM, and icon names from what you read. Do not invent or simplify.
- **If the package truly cannot be installed** (no access to registry or Git): Use the skill's reference examples as the canonical DOM, props, and structure. **React:** use the in-doc examples in this skill. **Vue, Svelte, Angular, vanilla:** read the implementation in this skill at **reference/vue/**, **reference/svelte/**, **reference/angular/**, **reference/vanilla/** (paths relative to the skill folder) and produce full, buildable components from those references—not stubs. No external folder or repo is required. That output will not be an exact replica of the live design system.
- **Never:** Do not create stub or fake Astro files or a `harmony-source/` folder. Do not invent default section arrays, icon names, or DOM. Do not clone a separate repo and write your own .astro files. Installing the **npm package** (which contains the real .astro source) is correct and expected; "do not clone" means do not invent source, not "do not install the package."

### Reference examples (in this skill)

When the package cannot be installed, the skill's reference examples are the canonical source. All reference code lives inside this skill—there is no external repo to clone or open.

- **React:** In this doc (inlined). Button, Alert, RightSidebar + CSS + icons.
- **Vue:** In this skill at **reference/vue/**. Component files (Alert, Button, RightSidebar + icon components), **reference/vue/styles/** (alert.css, button.css, right-sidebar.css, tokens.css). Read those files when converting to Vue.
- **Svelte:** In this skill at **reference/svelte/**. **reference/svelte/lib/** (Alert, Button, RightSidebar), **reference/svelte/styles/** (same CSS + tokens). Read those files when converting to Svelte.
- **Angular:** In this skill at **reference/angular/**. **reference/angular/components/** (alert, button, right-sidebar: .ts, .html), **reference/angular/styles/** (same CSS + tokens). Read those files when converting to Angular.
- **Vanilla:** In this skill at **reference/vanilla/**. **reference/vanilla/css/** (component CSS + tokens), **reference/vanilla/js/** (alert.js, button.js, right-sidebar.js, icons.js, app.js with dark-mode toggle). Read those files when converting to vanilla HTML/CSS/JS.

**Two dark modes (required when using reference examples):** The design system documents **two dark modes**. **(1) CP dark** (`html.theme-cp.dark`) — dark mode for the CP theme only; it has its own distinct styles. **(2) VP dark** (`html.theme-vp.dark`) — one shared dark style set for VP, PPM, and Maconomy (when the user chooses dark for theme-vp, theme-ppm, or theme-maconomy, they all use the same VP dark styles; that is why it is documented as VP/PPM/Maconomy dark in tokens). The reference tokens in each framework folder (e.g. reference/vue/styles/tokens.css, reference/vanilla/css/tokens.css) include both `html.theme-cp.dark` and `html.theme-vp.dark` blocks. You must preserve or replicate both and verify conversions in light, CP dark, and VP dark. Do not invent dark-mode CSS that is not in the source or in these reference tokens.

### Consumer Guide (install and setup)

- **When the package is installed:** The canonical install, customization, and setup instructions are in the **Harmony Consumer Guide** at `node_modules/@deltek/harmony-components/docs/CONSUMER_GUIDE.md` or `node_modules/@deltek/harmony-components/docs/customization/CONSUMER_GUIDE.md`. Use it for full setup (scripts, peer deps, assets, tiers). When wiring Harmony CSS in the host app, use the order reset.css → tokens.css → global.css → components.css (see Source Locations).
- **When the package is not in the project:** A copy of the Consumer Guide is in this skill at `reference/CONSUMER_GUIDE.md` (relative to the skill folder). Read it and follow **"Two Ways to Get Harmony"** and **"Setup"** (e.g. `npm install github:DLTKfrancesmunoz/harmonycomponents`) to install the package so the Astro source is available in `node_modules`, then convert from that. Do not invent source; use the guide to get the real package first.

**Using sources for defaults and preview:** Default data (section arrays, icon names, default props) must be copied from the Astro component files (frontmatter, imported constants). Do not invent or simplify. If the package is not present, use the skill's reference examples as the only source (React in this doc; Vue/Svelte/Angular/vanilla in this skill at reference/vue/, reference/svelte/, reference/angular/, reference/vanilla/); do not create your own Astro source. Use preview pages (e.g. `src/pages/preview/*.astro` or the package’s preview structure) to see how the shell/layout is meant to look (page header, main content, cards). Icon resolution and per-theme shell structure are defined below (theme-scoped icon manifest, Shell layout defaults).

### After conversion: removing the package dependency

This is a **user-requested** step. Do not do it by default after conversion. Only when the user asks to detach, remove the package, remove Astro components, go package-free, or make the app standalone, follow the steps below.

- **When to use:** When the user wants the converted app to stand alone with no dependency on `@deltek/harmony-components`. The package is only needed at runtime for the CSS (and any assets) you import; the .astro files are not executed.
- **Steps:**
  1. Copy the Harmony CSS files the app uses (reset.css, tokens.css, global.css, components.css, and optionally layout.css, utilities.css) from the package into the app (e.g. `src/styles/` or `public/styles/`). Keep the same order when importing.
  2. Copy any assets the app uses (e.g. from the package `public/`) into the app's public or assets folder if not already there. If the app uses the icon manifest, ensure it lives in the app (e.g. `src/data/`).
  3. In the app, change all imports from `@deltek/harmony-components/styles/...` to the new local paths. Where those imports live depends on the framework (e.g. main entry, root component, or config).
  4. Run the app and confirm layout and styles match.
  5. Run `npm uninstall @deltek/harmony-components` (and any peer deps that were only for Harmony). The app then depends only on its own components, copied styles, and copied assets.
- **Result:** Styles and tokens are a **snapshot** from conversion time. Future design updates from the design system would need to be re-applied manually to these local files if you want to stay in sync. Optionally, you can later trim the copied CSS (e.g. purge unused rules) to reduce bundle size; keeping the full files is simpler and still removes the package dependency.

---

## Exact replica and no shortcuts

When the user asks for **"exact replica," "no shortcuts,"** or equivalent (e.g. "match the source exactly"), treat this skill as a **strict spec**:

- **Exact replica and no shortcuts:** Do not simplify default data, reduce menu/sidebar items, substitute icons (e.g. pin → something else), use a single icon library when the skill says to use the theme-scoped manifest, or omit optional layout pieces (page header, content card) from the demo. Default data and icon names must come from the Astro source or the theme-scoped icon manifest for the target theme (see below). Any such shortcut counts as a **violation**.
- **Mandatory verification step:** Before marking the conversion task complete, compare the converted result to the **source you used**: when you had real Astro (from the package), compare to that Astro source; when you used only the skill's examples (package not installable), compare to those reference examples (React: in-doc; Vue, Svelte, Angular, vanilla: this skill at **reference/vue/**, **reference/svelte/**, **reference/angular/**, **reference/vanilla/**). Never verify against invented or stub files. Same default section arrays and icon names, same icon resolution (per manifest when present, otherwise skill's order), same optional layout in the demo. Callouts: LeftSidebar/RightSidebar default sections, FloatingNav pin icon, ShellLayout page header + main content. If this step is skipped, the task is **not** complete.
- **Anti-deviation list (exact replica):** Do not use only Heroicons when the source uses Tabler or custom; do not reduce sidebar/section items relative to the Astro default arrays; do not substitute an icon when the source specifies a Tabler or custom icon; do not omit optional layout pieces from the demo; do not skip the source-diff verification step before marking the task complete.

### Exact replica: required sequence

When the user asked for **exact replica** (or equivalent), follow this sequence. Do not treat it as optional.

**Do not mark the conversion complete until all of the following are true:**

1. The **mandatory verification step** has been done: compare converted output to the Astro source (or the skill's reference examples if the package could not be installed), and fix any differences from the source.
2. The **verification callouts** have been checked: ShellLayout page header + main content visible; RightSidebar/LeftSidebar sections and spacing; icons resolving and rendering from the source/manifest; **DOM order** (sibling and child order as in source).
3. All fixes are **derived from the relevant .astro/CSS** (re-open the component and replicate), not invented.
4. You have run the app and verified against the Astro source (do not mark done if the app does not run or verification is skipped).
5. Dark mode follows the skill: tokens + all source dark-mode blocks copied; no invented mode handling.
6. Components with no Astro `<style>` block (e.g. Card, ShellHeader): styles copied from components.css/layout.css into the converted component's CSS; not relying on global CSS alone.

- **Step 0 — Pre-implementation plan (before writing conversion code):** List: sources (which .astro/components or layouts), CSS (components.css, layout.css, which selectors apply), icon plan (manifest vs reference, which icons). Output this plan, then implement from it.
- **Step 1 — Convert from Astro source:** Copy DOM, defaults, layout, and icon usage from the .astro files (and their `<style>` / CSS). Do not invent structure or icon rendering.
- **Step 2 — Verify and fix from source (mandatory before done):** (a) Run the app. (b) Compare converted output to the Astro source (diff or systematic comparison). (c) For each difference or visible bug (icons, sidebar spacing, page header + main content visibility, **element order**—sibling and child order as in the Astro template), **re-open the relevant Astro component and its CSS** and fix from that source—do not invent a new approach (e.g. do not substitute a custom fetch/sanitize for icons without mirroring how Icon.astro actually renders; do not reorder elements relative to the source).
- **Step 3 — Only after Step 2 and the checklist:** When the user asked for exact replica, you **must not** mark the conversion complete until Step 2 is done and the **Exact-replica verification checklist** (below) has been output and satisfied.

**Exact-replica verification checklist (you must output this before marking conversion complete):**

- Verification: compared to Astro source. **Icons:** [match / fixed from Icon.astro]. **RightSidebar spacing:** [match / fixed from RightSidebar.astro + CSS]. **ShellLayout page header + main content:** [visible / fixed from ShellLayout.astro]. **Shell contract:** [main has padding-right when right sidebar present / fixed from source]. [Footer active tab and label white in dark / fixed from ShellFooter.astro]. **DOM order:** [match / fixed from source — sibling and child order as in Astro template]. **Dark mode:** [tokens + all source `html.dark` / `html.theme-*.dark` blocks copied; no invented mode CSS]. **Any remaining differences:** [none / list].

Before saying "done," output a short diff or bullet list (e.g. "Converted Icon vs Icon.astro: …", "RightSidebar vs Astro: …", "ShellLayout main: …"). If you cannot point to the source and say "matches" or "fixed from source," the task is not complete.

When the user asked for exact replica, your **task list must include** this item and it **must not** be marked complete until verification is done and fixes are from source: **"Exact replica verification (required): Run app. Diff to Astro source. Fix icons, RightSidebar spacing, ShellLayout main/page header, DOM order from source. Check shell contract: (1) Main has padding-right when right sidebar present. (2) Footer active tab and label are white in dark mode (override in footer, not --text-inverse). Output verification checklist. Only then mark conversion done."** When the target is Vue, Svelte, Angular, or vanilla, also compare the converted output to the implementation in this skill at **reference/vue/**, **reference/svelte/**, **reference/angular/**, or **reference/vanilla/** (as applicable) as well as to the Astro source or in-doc React reference.

A Cursor rule example that reinforces this sequence is in **reference/cursor-rule-exact-replica.mdc.example**; users can copy it to their project's `.cursor/rules/` when doing conversions.

### Fixing from source

When implementing or fixing any converted shell/layout/icon piece, **derive the fix from the source component.** Re-open the relevant Astro component and its styles: the component's `<style>` block when present, or the rules for that component's selectors in the package's **components.css** and **layout.css** when the component has no scoped block (e.g. Card, ShellHeader). Replicate: structure, which element has which layout (e.g. gap), and how things are rendered (e.g. Icon: how it renders—e.g. `<img>` vs inline SVG, currentColor—and mirror that in the target framework). Do not assume global CSS or framework behavior; confirm against the component and copy or mirror its rules on the correct element in the converted app. Do not leave components like Card or ShellHeader with empty component CSS when their styles live only in components.css/layout.css—copy those rules into the converted component's CSS.

**Checklist before considering conversion done (exact replica):** (1) Icons: implementation matches or safely mirrors the Icon component's approach. (2) Sidebar: the element that has gap/flex in the source has equivalent layout in the converted DOM. (3) Shell layout: grid/main height and visibility match the ShellLayout component's layout. (4) DOM order: sibling and child order in the converted template match the Astro source (layout and CSS often depend on it). (5) Shell contract: main has padding-right when right sidebar present; footer active tab and label are white in dark mode (override in footer, not --text-inverse).

After any correction related to exact-replica verification or source-derived fixes, update the **project's** tasks/lessons.md with the pattern, per your task management rules.

### When scoping or planning a conversion

- **CSS in host app:** Use this order: reset.css → tokens.css → global.css → components.css (optionally layout.css, utilities.css). Do not omit reset or put global before tokens.
- **Icons:** Resolve name/source from the theme-scoped manifest when present; **preserve each Icon's `size` prop** from the Astro template (do not infer or default). Icon sizes are not in the manifest. Standard icon paths in the skill's reference are from public/ (e.g. `/mic-slash.svg`, `/RS_DelaDefault.svg`); do not invent a different path or service.
- **Source precedence:** When reading Astro source, use `src/components/harmony/` when a component exists there; otherwise use the package. Apply this in the project you are converting (e.g. `app/src/components/harmony/` when present).

---

## How Astro Components Are Structured

Every Astro component has these parts:

```astro
---
// FRONTMATTER (JavaScript, runs at build time)
import Icon from './Icon.astro';

interface Props {
  variant?: 'info' | 'success';
  title?: string;
}

const { variant = 'info', title } = Astro.props;
---

<!-- TEMPLATE (HTML with expressions) -->
<div class="alert alert--{variant}">
  <Icon name="check" />
  {title && <h2>{title}</h2>}
  <slot />
</div>

<style>
  /* SCOPED CSS */
  .alert { display: flex; }
</style>

<script>
  /* CLIENT-SIDE JAVASCRIPT */
  document.querySelector('.alert__close')?.addEventListener('click', () => {});
</script>
```

---

## Conversion Rules

### General Rules (All Frameworks)

1. **Keep all CSS variables** — Do not resolve `var(--space-4)` to `16px`. Keep variables.
2. **Keep BEM class names** — `.alert__icon`, `.alert--info` stay exactly the same.
3. **Keep all data-* attributes** — `data-panel-title`, `data-variant`, etc.
4. **Keep all aria-* attributes** — `aria-label`, `role`, etc.
5. **Include all dependencies** — If component imports Icon, Tooltip, etc., note them or convert them too.
6. **Match the exact DOM structure** — Same nesting, same elements, **same sibling and child order** as the Astro template; layout and CSS (e.g. flex/grid, selectors) can depend on it.

### Props

| Astro | React | Vue | Svelte | Angular |
|-------|-------|-----|--------|---------|
| `interface Props {}` | `interface ComponentProps {}` | `defineProps<{}>()` | `export let prop` | `@Input() prop` |
| `Astro.props` | Destructured props | Auto from defineProps | Direct access | `this.prop` |
| `class` prop | `className` prop | `class` prop | `class` prop | `class` prop |

### Template Syntax

| Astro | React | Vue | Svelte | Angular |
|-------|-------|-----|--------|---------|
| `{expression}` | `{expression}` | `{{ expression }}` | `{expression}` | `{{ expression }}` |
| `{condition && <el/>}` | `{condition && <el/>}` | `v-if="condition"` | `{#if condition}` | `*ngIf="condition"` |
| `{items.map(i => <li>{i}</li>)}` | `{items.map(i => <li key={i}>{i}</li>)}` | `v-for="i in items"` | `{#each items as i}` | `*ngFor="let i of items"` |
| `<slot />` | `{children}` | `<slot />` | `<slot />` | `<ng-content />` |
| `<slot name="x" />` | Named slots via props | `<slot name="x" />` | `<slot name="x" />` | `<ng-content select="[x]" />` |
| `class:list={[]}` | `clsx()` or template literal | `:class="[]"` | `class:name={cond}` | `[ngClass]` |
| `set:html={x}` | `dangerouslySetInnerHTML` | `v-html="x"` | `{@html x}` | `[innerHTML]` |

### Styles

| Astro | React | Vue | Svelte | Angular |
|-------|-------|-----|--------|---------|
| `<style>` (scoped) | CSS Modules (`.module.css`) | `<style scoped>` | `<style>` (scoped default) | Component CSS |

Scoped styles in each Astro component's `<style>` block are not part of the package's components.css; copy them into the converted component's CSS file (e.g. ComponentName.module.css) so layout, spacing, and appearance match the source.

**When the Astro component has no `<style>` block** (e.g. Card, ShellHeader), its styles exist only in the package's global **components.css** or **layout.css**. For those components, copy the rules from components.css (and layout.css when the component uses layout rules, e.g. `.header__gradient`) that apply to that component's selectors (e.g. `.card`, `.card__header`, `.card__body`, `.header`, `.header__brand`, `.header__gradient`) into the converted component's CSS file so layout, spacing, and appearance match the source. Do not leave the converted component without those styles; the host app may not load the full Harmony components.css, or framework style encapsulation may prevent global rules from applying to the converted DOM.

**React CSS Modules pattern:**
```tsx
import styles from './Alert.module.css';

<div className={styles.alert} />
<div className={styles['alert--info']} />  // For BEM modifiers
```

**Combining classes in React:**
```tsx
import clsx from 'clsx';

className={clsx(styles.alert, styles[`alert--${variant}`], className)}
```

### Client-Side JavaScript

| Astro | React | Vue | Svelte | Angular |
|-------|-------|-----|--------|---------|
| `<script>` | `useEffect()` | `onMounted()` | `onMount()` | `ngOnInit()` / `ngAfterViewInit()` |
| `document.querySelector` | `useRef()` | `ref()` | `bind:this` | `@ViewChild()` |
| Event listeners | Event props (`onClick`) | `@click` | `on:click` | `(click)` |
| `element.remove()` | State change + conditional render | State change | State change | State change |

**React pattern for Astro's DOM manipulation:**
```astro
<!-- Astro -->
<script>
  btn.addEventListener('click', () => {
    btn.closest('.alert')?.remove();
  });
</script>
```

```tsx
// React — Use state, not DOM manipulation
const [visible, setVisible] = useState(true);

if (!visible) return null;

<button onClick={() => setVisible(false)}>Dismiss</button>
```

---

## Framework-Specific Templates

### React

```tsx
import { useState, useEffect, useRef, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  variant?: 'a' | 'b';
  className?: string;
  children?: ReactNode;
}

export function ComponentName({
  variant = 'a',
  className = '',
  children,
}: ComponentNameProps) {
  const classes = clsx(
    styles.componentName,
    styles[`componentName--${variant}`],
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
```

### Vue

```vue
<script setup lang="ts">
interface Props {
  variant?: 'a' | 'b';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'a',
  class: '',
});
</script>

<template>
  <div 
    :class="[
      'component-name',
      `component-name--${props.variant}`,
      props.class
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.component-name {
  /* styles */
}
</style>
```

### Svelte

```svelte
<script lang="ts">
  export let variant: 'a' | 'b' = 'a';
  let className = '';
  export { className as class };
</script>

<div 
  class="component-name component-name--{variant} {className}"
>
  <slot />
</div>

<style>
  .component-name {
    /* styles */
  }
</style>
```

### Angular

```typescript
// component-name.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.css']
})
export class ComponentNameComponent {
  @Input() variant: 'a' | 'b' = 'a';
  @Input() class: string = '';
}
```

```html
<!-- component-name.component.html -->
<div 
  [ngClass]="[
    'component-name',
    'component-name--' + variant,
    class
  ]"
>
  <ng-content></ng-content>
</div>
```

### Vanilla HTML/CSS/JS

```html
<div class="component-name component-name--a">
  Content here
</div>

<style>
  .component-name { /* styles */ }
  .component-name--a { /* variant styles */ }
</style>

<script>
  // Event listeners, DOM manipulation
</script>
```

---

## Astro-Specific Mappings

| Astro | React | Vue | Svelte | Angular |
|-------|-------|-----|--------|---------|
| `<slot />` | `{children}` | `<slot />` | `<slot />` | `<ng-content></ng-content>` |
| `<slot name="x" />` | Named props / render props | `<slot name="x" />` | `<slot name="x" />` | `<ng-content select="[x]"></ng-content>` |
| `Astro.props` | Destructured function params | `defineProps<>()` return | `export let prop` | `@Input() prop` |
| `class` (prop) | `className` | `class` | `class` | `class` |

---

## When Conversion Isn't Straightforward

- **Preserve DOM and behavior first.** Match the Astro component’s structure and accessibility (roles, aria-*, data-*).
- **Document the gap.** If there’s no 1:1 mapping (e.g. Astro’s `set:html` vs framework sanitization), keep structure and note the exception in a comment or doc.
- **Prioritize:** structure and accessibility, then styling, then behavior. Avoid adding behavior that isn’t in the Astro source.

### Framework-specific notes: Angular (icons and innerHTML)

For **icons and SVG**, use the **same approach as reference/angular** (inline SVG in template, see right-sidebar). Do **not** create IconService or any URL-based icon source. Use inline SVG in the template (e.g. `@switch` / `@case` by icon name with `stroke="currentColor"`) or `<img src="…">` for custom assets only; add the dark-mode filter from reference/angular/styles (e.g. `html.dark .right-sidebar__icon-img { filter: ... }`) when using `<img>`. Angular sanitizes values bound to `[innerHTML]`; do **not** rely on `[innerHTML]` for SVG unless you explicitly mirror Icon.astro and document the gap. Do not invent a new pipeline (e.g. fetch + sanitizer) that isn't derived from the source component.

---

## Version Compatibility

Applies to Harmony components as documented here; check your `@deltek/harmony-components` package version for API or DOM divergence.

---

## Design System Context

### Themes

The design system has 4 themes applied on `<html>`:
- `theme-cp` (default)
- `theme-vp`
- `theme-ppm`
- `theme-maconomy`

Components don't have a `theme` prop. They use CSS variables that change per theme.

### Default state (prepopulated)

**Default state is what the component source shows.** Components are prepopulated with defaults (props and/or default slot content). When reading an Astro component, treat what you see as the full default—no empty holders. Copy default prop values and default slot content from the source. Applies to all components (shell, Dialog, Dropdown, sidebars, ShellFooter, FloatingNav, ShellPageHeader, etc.).

**Theme:** Default content is theme-aware in the source (e.g. cpSections vs ppmSections). Default sections and their icon names are defined per theme in the component or its imports; use the correct set for the target theme.

### Shell layout defaults

**Shell layout default is per theme.** Do not assume one universal shell layout. When reading ShellLayout.astro, treat "default" as theme-dependent:

| Theme | Default structure |
|-------|-------------------|
| **CP** | Floating nav shown, no footer, CP sidebars (effectiveShowFloatingNav, hasFooter, sidebar variant from theme/config). |
| **PPM** | No floating nav, footer shown, PPM sidebars. |
| **VP** | Theme-specific default (floating nav, footer, sidebar variant). |
| **Maconomy** | Theme-specific default (floating nav, footer, sidebar variant). |

Use theme detection / the same logic as in the Astro source when converting. The skill states which structure applies for each theme so the converter does not assume a single default.

**Single-theme vs multi-theme:** When the target is a single-theme app (e.g. CP only) or theme is fixed, emit only that theme's sidebar (and any other theme-variant shell pieces), so one sidebar is shown without depending on `html.theme-*` or package CSS. Only use the all-variants + theme-CSS pattern when the target app supports theme switching and will apply the same theme class and CSS. (The Astro source may render all four variants and use scoped CSS to show one; that design is correct for the package but brittle when the converted app does not ship that CSS or use the same selectors.)

### Where shell layout dark lives

Shell/footer dark mode is **not** in ShellLayout.astro or the preview markup alone. It is split across these files:

- **ShellLayout.astro** — layout and slots only; no dark rules.
- **ShellFooter.astro** — footer structure and, in its `<style>` block, the `html.dark .shell-footer` rules (footer tabs, icon colors in dark). You MUST read this file for footer/tab dark.
- **tokens.css** — all `html.dark` and `html.theme-vp.dark` / `html.theme-cp.dark` (etc.) blocks that set variables (e.g. `--text-primary`, `--theme-primary`, `--shell-footer-tab-hover-bg`). Shell and footer use these.
- **components.css** — `html.dark` and `html.theme-cp.dark` rules for sidebar (e.g. `.left-sidebar__item:hover`, `.right-sidebar__item`, `.right-sidebar__dela-logo--default`) and FloatingNav.
- **Preview** — main shell preview for structure. The package also has **dedicated dark previews** (use these as the dark reference; no theme toggle, fixed `theme-*` + `dark` on `<html>`):
  - **src/pages/preview/shell-layout-dark-cp.astro** — CP dark only (`<html class="theme-cp dark">`). FloatingNav, no footer (`showFooter={false}`, `tabs={[]}`). Sidebars CP. URL: /preview/shell-layout-dark-cp.
  - **src/pages/preview/shell-layout-dark-vp.astro** — VP dark only (`<html class="theme-vp dark">`). Footer with tabs (`tabs={sampleTabs}`, `showFloatingNav={false}`). Sidebars VP. URL: /preview/shell-layout-dark-vp.
  Both use the same content block as the main shell layout preview. Actual dark styles still come from ShellFooter.astro, tokens.css, and components.css.

**Preview files and the npm package:** Preview files live in the full Harmony repo under `src/pages/preview/`. The **published npm package** may not include `src/pages/` or `preview/`. When those preview files **are present** (e.g. full repo), use them for shell structure; when they **are not present** (e.g. after `npm install`), derive shell structure from ShellLayout.astro, ShellFooter.astro, layout.css, components.css, tokens.css, and the skill's "Shell layout defaults" and "Where shell layout dark lives" text—do not require preview files for conversion to be valid. Dark styles always come from ShellFooter.astro, tokens.css, and components.css, not from preview markup.

**For shell conversion you must read:** ShellLayout.astro, ShellFooter.astro, tokens.css, components.css (and layout.css if used), and the shell preview(s)—including the dark previews for CP and VP dark structure.

**Shell preview:** When converting shell layout, read the package's shell preview for structure when present; for dark, use the dedicated dark previews **shell-layout-dark-cp** and **shell-layout-dark-vp** when they exist (fixed `theme-cp dark` / `theme-vp dark` on `<html>`, same content block). If the package has no `src/pages/preview/`, use the layout/shell components and the sections above only; do not treat missing preview files as a conversion failure. Match structure and use the same padding/layout tokens from layout.css. Dark styles themselves come from ShellFooter.astro, tokens.css, and components.css (see above).

**Page content padding:** Main content area must use the same padding and layout tokens as the source (e.g. `--shell-layout-*` from layout.css); do not omit or replace with hardcoded values.

### Shell layout build contract

Shell layout conversion must satisfy this contract:

- **Main content padding when right sidebar:** When the shell has a right sidebar, main (and page header) must have right padding reserved so content does not sit under the sidebar. In the source this is typically something like `padding-right: calc(var(--shell-layout-padding-side-default) + var(--space-5))` when `data-has-right-sidebar="true"`. The converter must replicate this from ShellLayout.astro / layout.css; do not omit it.
- **Footer in dark mode:** The footer bar is always dark. The active tab and its label must stay **white** in dark mode. Do not rely on `--text-inverse` for the footer when `html.dark` is set; the footer component must override active tab (and label) to white. Copy the `html.dark .shell-footer` rules from ShellFooter.astro that achieve this.

### Contextual UI

**Preserve contextual behavior from data attributes and client script.** Some components change appearance by selection or context (e.g. ShellPanel header: gradient when the Dela AI item or any RightSidebar item with useGradientHeader is active, theme primary for other sidebar items). This is implemented via data attributes (e.g. data-use-gradient-header, data-gradient-header) and client script in RightSidebar.astro and ShellPanel.astro.

**Replicate both branches.** The source may show one representative case (e.g. panel closed or one panel open). The conditional logic (gradient vs theme primary) must be preserved in the converted template and logic so both states are possible in the target framework. Do **not** flatten to a single visual; replicate the conditional so the converter output supports both states.

### Modes

Light (default) and dark modes. The design system documents **two dark modes**: **(1) CP dark** (`html.theme-cp.dark`) — dark for the CP theme only (distinct styles). **(2) VP dark** (`html.theme-vp.dark`) — one shared dark style set for VP, PPM, and Maconomy (dark for theme-vp, theme-ppm, or theme-maconomy all use the same styles). When using the skill's reference examples (reference/vue/, reference/svelte/, reference/angular/, reference/vanilla/), the tokens in each include both blocks; preserve both and verify in light, CP dark, and VP dark.

- Light: `html.theme-cp` (or theme-vp, theme-ppm, theme-maconomy)
- Dark: `html.theme-cp.dark` (CP dark) or `html.theme-vp.dark` (VP/PPM/Maconomy dark)

Components don't have a `mode` prop. They use CSS variables that change per mode.

**Mode (light/dark) does not change default structure or icon resolution.** Default content, default layout, and which icon asset to use are the same in light and dark mode. Components use CSS variables for mode-specific colors; the converter does not need to vary defaults or icon resolution by mode.

When copying styles, you MUST copy every `html.dark` and `html.theme-*.dark` block from the source; do not skip dark-mode overrides. Do not invent dark-mode handling (e.g. global filter for icons); mode is handled by design-system tokens and the source's dark-mode rules only.

### Icons

**Icon resolution is explicit and theme-scoped when the manifest is present.** The installed package may include a theme-scoped icon manifest (per theme: CP, VP, PPM, Maconomy). For each icon name in default content, the manifest gives: **source** (hero | tabler | custom), **path** (e.g. node_modules path or public path), and for custom optionally **svg** (inline SVG string).

**Manifest optional; location:** When the installed package includes a theme-scoped icon manifest (e.g. at `node_modules/@deltek/harmony-components/src/data/icon-manifest.json`), use it for the target theme. The package may provide an **inline SVG manifest**: after running `npm run inline:icon-manifest`, the manifest has a **svg** field per icon (full `<svg>...</svg>` string). When present, use the **svg** field for inline SVG in the target framework so you do not need node_modules or public/ paths; do not invent a URL-based service. The manifest is **inside the installed package**—same place as the Astro components. No separate repo or pull is required. When the package is not present or the manifest is not there, use the skill's reference examples and the resolution order documented in the skill (Heroicons then Tabler then public). Do **not** create a fake manifest or fake icon set. Do **not** refuse to convert or output stubs because the manifest is missing. If no manifest: icon names and resolution come from the Astro source (when present) or from the skill's examples; use Heroicons to Tabler to public order. Always output full icon usage in the converted code—no placeholder stubs. The manifest path in the repo is e.g. `src/data/icon-manifest.json` with top-level keys cp, vp, ppm, maconomy; or one file per theme such as `icon-manifest-cp.json`. For each icon use the manifest source and path when the manifest is present (and for custom, path or svg). Do **not** substitute or assume Heroicons for all icons when the source uses Tabler or custom.

**Icon sizes are not in the manifest.** Icon size is defined per usage in the component template via the Icon component’s **size** prop (xs | sm | md | lg | xl). Read and preserve the size prop from each `<Icon name="…" size="…" />` usage in the Astro template; do not infer or default sizes. Icon sizes come from the component source, not from the manifest.

**Icon imports:** The reference examples in this skill are in React (in-doc) and in Vue, Svelte, Angular, and vanilla (this skill at reference/vue/, reference/svelte/, reference/angular/, reference/vanilla/). They may use inline SVG icons for portability. For the target framework (Vue, Svelte, Angular, vanilla), read the reference folder for that framework and use the same icon resolution (manifest when present, or Heroicons to Tabler to public) with that framework's import style; do not assume React-only icon libraries. When using the manifest, resolve each icon via the manifest’s source and path; `@heroicons/react` and `@tabler/icons-react` remain optional for non-manifest usage. When resolving Heroicons from manifest names (often kebab-case), normalize to the library's export name: e.g. a lowercase letter immediately after a digit must be capitalized (squares-2x2 → Squares2X2Icon, not Squares2x2Icon).

**Icon implementation must be derived from the Astro Icon component.** Read `Icon.astro` (or the package's Icon component) to see how it renders (e.g. `<img>`, inline SVG, currentColor). In the target framework, use the **same approach** as the reference for that framework (e.g. React in-doc, reference/angular for Angular—inline SVG in template—reference/vue, reference/svelte, reference/vanilla): component-based inline SVG or `<img src="…">` for custom assets. **Do not invent a new pipeline** (e.g. fetch SVG + sanitizer, or binding raw HTML via `[innerHTML]`/`v-html` without matching how the source actually renders). If the source uses `<img>`, mirror that; if it uses inline SVG, mirror that in a framework-safe way (e.g. Angular components, not raw innerHTML unless you match and document).

### Tokens

All spacing, colors, typography use CSS variables:
```css
var(--space-4)        /* spacing */
var(--color-info)     /* semantic colors */
var(--text-primary)   /* text colors */
var(--font-display)   /* font families */
var(--radius-lg)      /* border radius */
```

Do NOT resolve these to hardcoded values. Keep the variables.

---

## Anti-Patterns (NEVER Do These)

### Source of truth
- ❌ Don't create stub or fake Astro files (e.g. in a `harmony-source/` or similar folder).
- ❌ Don't invent default section arrays, icon names, or DOM structure; use only real Astro from the package or the skill's reference examples.
- ❌ Don't create a fake icon manifest or fake icon set; use the package manifest when present, otherwise the skill's examples and documented icon order.
- ❌ Don't output stub or placeholder components when the user asked for a conversion; always produce full, buildable code from one of the two allowed sources.
- ❌ Don't verify the conversion against anything other than real Astro (from the package) or the skill's reference examples.
- ❌ Don't implement icons via a custom fetch/sanitize/innerHTML pipeline without first reading Icon.astro and mirroring its approach.

### Icons, footer, layout (frequent failures)
- ❌ Don't create an IconService, IconPipe, or any service/helper that returns URL paths for standard icons. Use the reference for your target framework (inline SVG or manifest paths).
- ❌ Don't use only `<img [src]="...">` for standard icons without the reference's dark-mode handling (e.g. `html.dark .right-sidebar__icon-img { filter: ... }`).
- ❌ Don't skip `html.dark` or `html.theme-*.dark` blocks when copying component or shell/footer styles. Copy every dark block from the source.
- ❌ Don't replace layout tokens (`--sidebar-width`, `--space-*`, `--shell-layout-padding-*`) with hardcoded pixel values or different variable names.
- ❌ Don't assume the app will get dark styles if it only sets `dark` on `<html>`; the design system uses `theme-cp dark` and `theme-vp dark`. The app must set the correct theme+dark class on `<html>`.

### Structure
- ❌ Don't change the DOM structure, nesting, **or element order** (sibling/child order must match source).
- ❌ Don't rename BEM classes (`.alert__icon` stays `.alert__icon`)
- ❌ Don't remove `data-*` or `aria-*` attributes
- ❌ Don't skip elements that exist in the Astro source

### Styles
- ❌ Don't resolve CSS variables to hardcoded values
- ❌ Don't use inline styles instead of CSS classes
- ❌ Don't use styled-components, Tailwind, or other styling approaches
- ❌ Don't simplify or combine CSS properties
- ❌ Don't add one-off dark-mode CSS (e.g. `html.dark ... img { filter: ... }`) that is not in the source

### Props
- ❌ Don't add props that don't exist in the Astro component
- ❌ Don't remove props that exist in the Astro component
- ❌ Don't change prop names (except `class` → `className` for React)
- ❌ Don't change default values

### JavaScript
- ❌ Don't use DOM manipulation in React/Vue/Svelte (use state)
- ❌ Don't skip functionality from `<script>` blocks
- ❌ Don't add functionality that isn't in the Astro source

---

## Conversion Examples

Before converting, ensure you're not falling into any Anti-patterns (see above). Examples are provided in React. For other frameworks, follow the same structure using the framework-specific syntax from the conversion rules above.

**React as reference:** These React examples are the **reference implementation** (canonical DOM, BEM classes, CSS variables, props, behavior). The same reference implementation exists in this skill for **Vue, Svelte, Angular, and vanilla** at **reference/vue/**, **reference/svelte/**, **reference/angular/**, **reference/vanilla/**. When converting to one of those frameworks, read the corresponding reference folder for component structure, CSS, and dark mode (both CP dark and VP dark; see "Reference examples (in this skill)" and "Two dark modes"). You do **not** need React installed to convert to Vue/Svelte/Angular. Conversion is **Astro → target framework**; the React examples define what “correct” looks like so every framework can match it.

### Example 1: Button (Simple)

**Astro Source:** `node_modules/@deltek/harmony-components/src/components/ui/Button.astro`

**React: Button.tsx**

```tsx
import type { ReactNode } from 'react';
import type React from 'react';
import { getButtonIcon } from './icons';
import './Button.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'dela'
  | 'dela-pill';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonType = 'theme' | 'pageHeader';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  variant?: ButtonVariant;
  buttonType?: ButtonType;
  size?: ButtonSize;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  href?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

function Spinner() {
  return (
    <svg
      className="btn__spinner"
      width="var(--btn-spinner-size)"
      height="var(--btn-spinner-size)"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="var(--btn-spinner-stroke-width)"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  variant = 'primary',
  buttonType = 'theme',
  size = 'md',
  orientation = 'horizontal',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  type = 'button',
  fullWidth = false,
  href,
  className = '',
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const hasContent = Boolean(children);
  const isIconOnly = Boolean(icon && !hasContent && !loading);
  const isDelaVariant = variant === 'dela' || variant === 'dela-pill';

  const classes = [
    'btn',
    `btn--${variant}`,
    buttonType === 'pageHeader' && !isDelaVariant && 'btn--page-header',
    isIconOnly ? `btn--icon-${size}` : `btn--${size}`,
    orientation === 'vertical' && 'btn--vertical',
    (disabled || loading) && 'btn--disabled',
    loading && 'btn--loading',
    fullWidth && 'btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const IconComponent = icon ? getButtonIcon(icon) : null;

  const content = loading ? (
    <>
      <Spinner />
      {loadingText && <span>{loadingText}</span>}
    </>
  ) : (
    <>
      {isDelaVariant && (
        <img src="/Stars.svg" alt="" className="btn__dela-stars" />
      )}
      {IconComponent && iconPosition === 'left' && (
        <IconComponent style={{ width: '1em', height: '1em', flexShrink: 0 }} />
      )}
      {children}
      {IconComponent && iconPosition === 'right' && (
        <IconComponent style={{ width: '1em', height: '1em', flexShrink: 0 }} />
      )}
    </>
  );

  const commonProps = {
    ...rest,
    className: classes,
    'aria-busy': loading ? true : undefined,
    onClick,
  };

  if (href) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      {...commonProps}
    >
      {content}
    </button>
  );
}
```

**React: Button icon helper (icons.tsx)** — map icon names to components; use inline SVGs or `@heroicons/react`:

```tsx
import type { SVGProps } from 'react';

const svgProps: SVGProps<SVGSVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.5,
  stroke: 'currentColor',
  'aria-hidden': true,
};

// Add icon components (PlusIcon, ArrowRightIcon, etc.) and:
const iconMap = { plus: PlusIcon, 'arrow-right': ArrowRightIcon } as const;
export type ButtonIconName = keyof typeof iconMap;
export function getButtonIcon(name: string) {
  return iconMap[name as ButtonIconName] ?? null;
}
```

**React: Button.css** — full file; keep all CSS variables and BEM classes:

```css
/* BUTTON (Harmony Design System) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  text-decoration: none;
}
.btn:hover { text-decoration: none; }
.btn--xs { height: var(--button-height-xs); padding: 0 var(--space-2); font-size: var(--text-xs); gap: var(--space-1); --btn-spinner-size: var(--spinner-size-xs); --btn-spinner-stroke-width: var(--spinner-stroke-width-xs); }
.btn--sm { height: var(--button-height-sm); padding: 0 var(--space-3); font-size: var(--text-sm); gap: var(--space-1-5); --btn-spinner-size: var(--spinner-size-sm); --btn-spinner-stroke-width: var(--spinner-stroke-width-sm); }
.btn--md { height: var(--button-height-md); padding: 0 var(--space-4); font-size: var(--text-base); gap: var(--space-2); --btn-spinner-size: var(--spinner-size-md); --btn-spinner-stroke-width: var(--spinner-stroke-width-md); }
.btn--lg { height: var(--button-height-lg); padding: 0 var(--space-6); font-size: var(--text-lg); gap: var(--space-2); --btn-spinner-size: var(--spinner-size-lg); --btn-spinner-stroke-width: var(--spinner-stroke-width-lg); }
.btn--icon-xs { width: var(--button-height-xs); height: var(--button-height-xs); padding: 0; --btn-spinner-size: var(--spinner-size-xs); --btn-spinner-stroke-width: var(--spinner-stroke-width-xs); }
.btn--icon-sm { width: var(--button-height-sm); height: var(--button-height-sm); padding: 0; --btn-spinner-size: var(--spinner-size-sm); --btn-spinner-stroke-width: var(--spinner-stroke-width-sm); }
.btn--icon-md { width: var(--button-height-md); height: var(--button-height-md); padding: 0; --btn-spinner-size: var(--spinner-size-md); --btn-spinner-stroke-width: var(--spinner-stroke-width-md); }
.btn--icon-lg { width: var(--button-height-lg); height: var(--button-height-lg); padding: 0; --btn-spinner-size: var(--spinner-size-lg); --btn-spinner-stroke-width: var(--spinner-stroke-width-lg); }
.btn--primary { background-color: var(--theme-primary); color: var(--text-inverse); }
.btn--primary:hover { background-color: var(--theme-primary-hover); }
.btn--primary:active { box-shadow: var(--shadow-inset-md); }
.btn--primary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--primary:disabled, .btn--primary.btn--disabled { background-color: var(--theme-btn-primary-disabled-bg); color: var(--theme-btn-primary-disabled-fg); opacity: 1; }
.btn--secondary { background-color: var(--elevated-bg); color: var(--theme-btn-secondary-stroke); border: 1px solid var(--theme-btn-secondary-stroke); }
.btn--secondary:hover { background-color: var(--theme-btn-secondary-hover-bg); color: var(--theme-btn-secondary-hover-fg); border-color: var(--theme-btn-secondary-hover-stroke); }
.btn--secondary:active { box-shadow: var(--shadow-inset-sm); }
.btn--secondary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--secondary:disabled, .btn--secondary.btn--disabled { background-color: var(--elevated-bg); color: var(--theme-btn-secondary-disabled-fg); border-color: var(--theme-btn-secondary-disabled-fg); opacity: 0.5; }
.btn--tertiary { background-color: transparent; color: var(--theme-btn-tertiary-fg); border: none; }
.btn--tertiary:hover { background-color: var(--theme-btn-tertiary-hover-bg); }
.btn--tertiary:active { box-shadow: var(--shadow-inset-sm); }
.btn--tertiary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--tertiary:disabled, .btn--tertiary.btn--disabled { background-color: transparent; color: var(--theme-btn-tertiary-disabled-fg); opacity: 1; }
.btn--page-header.btn--primary { background-color: var(--page-header-btn-primary); color: var(--page-header-btn-primary-fg, var(--text-inverse)); }
.btn--page-header.btn--primary:hover { background-color: var(--page-header-btn-primary-hover); }
.btn--page-header.btn--primary:active { box-shadow: var(--shadow-inset-md); }
.btn--page-header.btn--primary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-page-header); }
.btn--page-header.btn--primary:disabled, .btn--page-header.btn--primary.btn--disabled { background-color: var(--page-header-btn-primary-disabled-bg); color: var(--page-header-btn-primary-disabled-fg); opacity: 1; }
.btn--page-header.btn--secondary { background-color: var(--elevated-bg); color: var(--page-header-btn-secondary-default-fg); border: 1px solid var(--page-header-btn-secondary-stroke); }
.btn--page-header.btn--secondary:hover { background-color: var(--page-header-btn-secondary-hover-bg); color: var(--page-header-btn-secondary-hover-fg); border-color: var(--page-header-btn-secondary-hover-stroke); }
.btn--page-header.btn--secondary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-page-header); }
.btn--page-header.btn--secondary:disabled, .btn--page-header.btn--secondary.btn--disabled { background-color: var(--elevated-bg); color: var(--page-header-btn-secondary-disabled-fg); border-color: var(--page-header-btn-secondary-disabled-fg); opacity: 1; }
.btn--page-header.btn--tertiary { background-color: transparent; color: var(--page-header-btn-tertiary-fg); border: none; }
.btn--page-header.btn--tertiary:hover { background-color: var(--page-header-btn-tertiary-hover-bg); }
.btn--page-header.btn--tertiary:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-page-header); }
.btn--page-header.btn--tertiary:disabled, .btn--page-header.btn--tertiary.btn--disabled { background-color: transparent; color: var(--page-header-btn-tertiary-disabled-fg); opacity: 1; }
.btn--outline { background-color: transparent; color: var(--text-primary); border: 1px solid var(--border-color); }
.btn--outline:hover { background-color: var(--hover-bg); }
.btn--outline:active { box-shadow: var(--shadow-inset-sm); }
.btn--outline:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--ghost { background-color: transparent; color: var(--text-primary); }
.btn--ghost:hover { background-color: var(--hover-bg); }
.btn--ghost:active { box-shadow: var(--shadow-inset-sm); }
.btn--ghost:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--destructive { background-color: var(--color-error); color: var(--text-inverse); }
.btn--destructive:hover { background-color: var(--color-error); filter: brightness(0.9); }
.btn--destructive:active { box-shadow: var(--shadow-inset-md); }
.btn--destructive:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-error); }
.btn--dela { position: relative; background: var(--gradient-dela); color: var(--dela-header-content-fg); border: none; border-radius: var(--radius-04); }
.btn--dela:hover::before { content: ''; position: absolute; inset: 0; background: var(--gradient-dela-hover-bg); border-radius: var(--radius-04); pointer-events: none; }
.btn--dela:active { box-shadow: var(--shadow-inset-md); }
.btn--dela:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--dela:disabled, .btn--dela.btn--disabled { opacity: 0.6; }
.btn--dela-pill { background: var(--gradient-dela); color: var(--dela-header-content-fg); border: none; border-radius: var(--radius-full); position: relative; }
.btn--dela-pill:hover::before { content: ''; position: absolute; inset: 0; background: var(--gradient-dela-hover-bg); border-radius: var(--radius-full); pointer-events: none; }
.btn--dela-pill:active { box-shadow: var(--shadow-inset-md); }
.btn--dela-pill:focus-visible { outline: 1px solid var(--card-bg); outline-offset: 0; box-shadow: var(--focus-ring-primary); }
.btn--dela-pill:disabled, .btn--dela-pill.btn--disabled { opacity: 0.6; }
.btn__dela-stars { width: 20px; height: 20px; flex-shrink: 0; filter: brightness(0) invert(1); }
.btn:disabled, .btn--disabled { cursor: not-allowed; pointer-events: none; }
.btn--outline:disabled, .btn--outline.btn--disabled, .btn--ghost:disabled, .btn--ghost.btn--disabled { opacity: 0.5; }
.btn--loading { pointer-events: none; }
.btn--full { width: 100%; }
.btn--vertical { flex-direction: column; padding: var(--space-2) var(--space-3); }
.btn--vertical.btn--xs { padding: var(--space-1-5) var(--space-2); }
.btn--vertical.btn--sm { padding: var(--space-2) var(--space-2-5); }
.btn--vertical.btn--md { padding: var(--space-2) var(--space-3); }
.btn--vertical.btn--lg { padding: var(--space-3) var(--space-4); }
.btn__spinner { animation: spin 1s linear infinite; flex-shrink: 0; max-width: var(--btn-spinner-size); max-height: var(--btn-spinner-size); width: var(--btn-spinner-size); height: var(--btn-spinner-size); }
.btn__spinner .opacity-25 { opacity: 0.25; }
.btn__spinner .opacity-75 { opacity: 0.75; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
```

---

### Example 2: Alert (Medium)

**Astro Source:** `node_modules/@deltek/harmony-components/src/components/ui/Alert.astro`

**React: Alert.tsx**

```tsx
import type { ReactNode } from 'react';
import { getAlertIcon, XMarkIcon, type AlertIconName } from './icons';
import './Alert.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertStyle = 'default' | 'enhanced';

export interface AlertButtonConfig {
  text: string;
  href?: string;
  onClick?: () => void;
}

export interface AlertProps {
  variant?: AlertVariant;
  style?: AlertStyle;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: AlertIconName;
  primaryButton?: AlertButtonConfig;
  secondaryButton?: AlertButtonConfig;
  linkText?: string;
  linkHref?: string;
  progressValue?: number;
  className?: string;
  children: ReactNode;
}

const DEFAULT_ICONS: Record<AlertVariant, AlertIconName> = {
  info: 'information-circle',
  success: 'check-circle',
  warning: 'exclamation-triangle',
  error: 'exclamation-circle',
};

export function Alert({
  variant = 'info',
  style = 'default',
  title,
  dismissible = false,
  onDismiss,
  icon,
  primaryButton,
  secondaryButton,
  linkText,
  linkHref,
  progressValue,
  className = '',
  children,
}: AlertProps) {
  const iconName = (icon ?? DEFAULT_ICONS[variant]) as AlertIconName;
  const IconComponent = getAlertIcon(iconName);
  const hasActions = primaryButton || secondaryButton || (linkText && linkHref);

  const classes = [
    'alert',
    `alert--${variant}`,
    style === 'enhanced' && 'alert--enhanced',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClose = () => onDismiss?.();

  const renderActions = () => {
    if (!hasActions || style !== 'enhanced') return null;
    return (
      <div className="alert__actions">
        {(primaryButton || secondaryButton) && (
          <div className="alert__buttons">
            {primaryButton && (
              primaryButton.href ? (
                <a href={primaryButton.href} className="alert__btn alert__btn--primary">{primaryButton.text}</a>
              ) : (
                <button type="button" className="alert__btn alert__btn--primary" onClick={primaryButton.onClick}>
                  {primaryButton.text}
                </button>
              )
            )}
            {secondaryButton && (
              secondaryButton.href ? (
                <a href={secondaryButton.href} className="alert__btn alert__btn--secondary">{secondaryButton.text}</a>
              ) : (
                <button type="button" className="alert__btn alert__btn--secondary" onClick={secondaryButton.onClick}>
                  {secondaryButton.text}
                </button>
              )
            )}
          </div>
        )}
        {linkText && linkHref && <a href={linkHref} className="alert__link">{linkText}</a>}
      </div>
    );
  };

  const renderProgress = () => {
    if (progressValue == null || style !== 'enhanced') return null;
    const value = Math.min(100, Math.max(0, progressValue));
    return (
      <div className="alert__progress">
        <div className="alert-progress__track">
          <div
            className="alert-progress__fill"
            style={{ width: `${value}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={classes} role="alert">
      {style === 'enhanced' && <div className="alert__border" />}
      {style === 'enhanced' ? (
        <div className="alert__content">
          <div className="alert__inner">
            <span className="alert__icon" aria-hidden>
              <IconComponent className="alert__icon-svg" />
            </span>
            <div className="alert__text">
              {title && <div className="alert__title">{title}</div>}
              <div className="alert__message">{children}</div>
            </div>
            {dismissible && (
              <button type="button" className="alert__close" aria-label="Dismiss" onClick={handleClose}>
                <XMarkIcon className="alert__icon-svg" />
              </button>
            )}
          </div>
          {renderActions()}
          {renderProgress()}
        </div>
      ) : (
        <>
          <span className="alert__icon" aria-hidden>
            <IconComponent className="alert__icon-svg" />
          </span>
          <div className="alert__content">
            {title && <div className="alert__title">{title}</div>}
            <div className="alert__message">{children}</div>
          </div>
          {dismissible && (
            <button type="button" className="alert__close" aria-label="Dismiss" onClick={handleClose}>
              <XMarkIcon className="alert__icon-svg" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

**React: Alert icons** — provide `getAlertIcon(name)`, `XMarkIcon`, and `AlertIconName`; use inline SVGs for information-circle, check-circle, exclamation-triangle, exclamation-circle, x-mark.

**React: Alert.css** — full file:

```css
/* ALERT (Harmony Design System) */
.alert { display: flex; gap: var(--space-3); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid; }
.alert--info { background-color: var(--color-info-light); border-color: var(--color-info-border); }
.alert--success { background-color: var(--color-success-light); border-color: var(--color-success-border); }
.alert--warning { background-color: var(--color-warning-light); border-color: var(--color-warning-border); }
.alert--error { background-color: var(--color-error-light); border-color: var(--color-error-border); }
.alert__icon { flex-shrink: 0; font-size: var(--text-xl); display: inline-flex; align-items: center; justify-content: center; }
.alert__icon-svg { width: 1em; height: 1em; }
.alert--info .alert__icon { color: var(--color-info); }
.alert--success .alert__icon { color: var(--color-success); }
.alert--warning .alert__icon { color: var(--color-warning); }
.alert--error .alert__icon { color: var(--color-error); }
.alert__content { flex: 1; min-width: 0; }
.alert__title { font-family: var(--font-display); font-weight: var(--font-semibold); color: var(--text-primary); margin-bottom: var(--space-1); }
.alert__message { font-size: var(--text-sm); color: var(--text-secondary); }
.alert__close { flex-shrink: 0; color: var(--text-muted); cursor: pointer; transition: color var(--transition-fast); background: none; border: none; padding: 0; }
.alert__close:hover { color: var(--text-primary); }
.alert--enhanced { position: relative; display: flex; padding: 0; border: none; border-radius: var(--radius-08); box-shadow: var(--shadow-md); background-color: var(--card-bg); overflow: hidden; }
.alert--enhanced .alert__border { width: var(--space-2); flex-shrink: 0; background-color: var(--color-info); border-radius: var(--radius-08) 0 0 var(--radius-08); }
.alert--enhanced.alert--success .alert__border { background-color: var(--color-success); }
.alert--enhanced.alert--warning .alert__border { background-color: var(--color-warning); }
.alert--enhanced.alert--error .alert__border { background-color: var(--color-error); }
.alert--enhanced.alert--info .alert__border { background-color: var(--color-info); }
.alert--enhanced .alert__content { display: flex; flex-direction: column; flex: 1; padding: var(--space-3); gap: var(--space-2); }
.alert--enhanced .alert__inner { display: flex; gap: var(--space-2); align-items: flex-start; }
.alert--enhanced .alert__text { flex: 1; min-width: 0; }
.alert--enhanced .alert__icon { flex-shrink: 0; font-size: var(--text-base); width: var(--space-5); height: var(--space-5); }
.alert--enhanced .alert__title { font-family: var(--font-display); font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); margin-bottom: var(--space-1); line-height: var(--space-5); }
.alert--enhanced .alert__message { font-size: 13px; font-weight: var(--font-normal); color: var(--text-primary); line-height: 18px; }
.alert--enhanced .alert__close { flex-shrink: 0; width: var(--space-4); height: var(--space-4); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); cursor: pointer; transition: color var(--transition-fast); }
.alert--enhanced .alert__close:hover { color: var(--text-primary); }
.alert__actions { display: flex; flex-direction: column; gap: var(--space-2); padding-left: calc(var(--space-5) + var(--space-2)); padding-top: var(--space-2); }
.alert__buttons { display: flex; gap: var(--space-2); align-items: center; }
.alert__btn { font-family: var(--font-sans); font-size: var(--text-xs); font-weight: var(--font-semibold); padding: var(--space-1) var(--space-2); border-radius: var(--radius-md); cursor: pointer; transition: background-color var(--transition-fast), color var(--transition-fast); text-decoration: none; border: none; }
.alert__btn--primary { background-color: var(--color-info); color: #fff; }
.alert__btn--primary:hover { opacity: 0.9; }
.alert__btn--secondary { background-color: transparent; color: var(--text-primary); border: 1px solid var(--text-muted); }
.alert__btn--secondary:hover { background-color: rgba(0, 0, 0, 0.05); }
.alert__link { font-size: var(--text-xs); font-weight: var(--font-normal); color: var(--link-color); text-decoration: none; line-height: var(--space-4); transition: color var(--transition-fast); }
.alert__link:hover { text-decoration: underline; }
.alert__progress { padding-top: var(--space-2); padding-left: calc(var(--space-5) + var(--space-2)); }
.alert-progress__track { height: 6px; border-radius: var(--radius-full, 9999px); background-color: var(--color-info-light); overflow: hidden; }
.alert-progress__fill { height: 100%; border-radius: var(--radius-full, 9999px); transition: width var(--transition-fast); }
.alert--info .alert-progress__fill { background-color: var(--color-info); }
.alert--success .alert-progress__fill { background-color: var(--color-success); }
.alert--warning .alert-progress__fill { background-color: var(--color-warning); }
.alert--error .alert-progress__fill { background-color: var(--color-error); }
```

---

### Example 3: RightSidebar (Complex)

**Astro Source:** `node_modules/@deltek/harmony-components/src/components/ui/RightSidebar.astro`

**React: RightSidebar.tsx**

```tsx
import { getSidebarIcon, isSidebarIconCustom } from './icons';
import './RightSidebar.css';

export type RightSidebarVariant = 'cp' | 'vp' | 'ppm' | 'maconomy';

export interface NavItem {
  icon?: string;
  label: string;
  href?: string;
  isCustom?: boolean;
  customSrc?: string;
  customSrcActive?: string;
}

export interface Section {
  items: NavItem[];
}

export interface RightSidebarProps {
  variant?: RightSidebarVariant;
  sections?: Section[];
  activeItemId?: string | null;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

export function RightSidebar({
  variant = 'cp',
  sections: sectionsProp,
  activeItemId = null,
  onItemClick,
  className = '',
}: RightSidebarProps) {
  const sections = sectionsProp ?? []; // or default cpSections

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: string) => {
    e.preventDefault();
    onItemClick?.(itemId);
  };

  return (
    <nav
      className={`right-sidebar right-sidebar--${variant} ${className}`.trim()}
      data-variant={variant}
    >
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="right-sidebar__section">
          {section.items.map((item, itemIndex) => {
            const itemId = `right-sidebar-${sectionIndex}-${itemIndex}`;
            const isActive = activeItemId === itemId;
            return (
              <a
                key={itemId}
                href={item.href ?? '#'}
                className="right-sidebar__item"
                data-panel-title={item.label}
                data-panel-icon={item.icon}
                data-item-id={itemId}
                data-active={isActive ? 'true' : undefined}
                data-right-sidebar-item
                title={item.label}
                onClick={(e) => handleItemClick(e, itemId)}
              >
                <span className="right-sidebar__label">{item.label}</span>
                <span className="right-sidebar__icon">
                  {item.isCustom && item.customSrc ? (
                    item.customSrcActive ? (
                      <>
                        <img src={item.customSrc} alt={item.label} className="right-sidebar__dela-logo right-sidebar__dela-logo--default" />
                        <img src={item.customSrcActive} alt={item.label} className="right-sidebar__dela-logo right-sidebar__dela-logo--active" />
                      </>
                    ) : (
                      <img src={item.customSrc} alt={item.label} className="right-sidebar__dela-logo" />
                    )
                  ) : item.icon ? (
                    isSidebarIconCustom(item.icon) ? (
                      <img src="/mic-slash.svg" alt="" className="right-sidebar__icon-img" width={24} height={24} />
                    ) : (
                      (() => {
                        const IconComponent = getSidebarIcon(item.icon);
                        return <IconComponent />;
                      })()
                    )
                  ) : null}
                </span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
```

**React: RightSidebar icons** — `getSidebarIcon(name)`, `isSidebarIconCustom(name)` (e.g. `name === 'mic-slash'`).

**React: RightSidebar.css** — full file:

```css
/* RIGHT SIDEBAR (Harmony Design System) */
.right-sidebar { position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: var(--z-sticky); display: flex; flex-direction: column; gap: var(--space-3); width: 52px; transition: width 0.2s ease; overflow: visible; }
.right-sidebar:hover { width: 220px; }
.right-sidebar__section { background-color: var(--nav-bg); border: 1px solid var(--border-color); border-right: none; border-radius: var(--radius-12) 0 0 var(--radius-12); box-shadow: var(--shadow-xl); padding: var(--space-3) var(--space-2); display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1-5); overflow: visible; }
.right-sidebar__item { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-2); padding: var(--space-1-5); border-radius: var(--radius-08); text-decoration: none; color: var(--text-primary); white-space: nowrap; width: 100%; transition: background-color var(--transition-fast); }
.right-sidebar__item:hover { background-color: var(--hover-bg); text-decoration: none; }
.right-sidebar__icon { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.right-sidebar__icon svg, .right-sidebar__icon-img { width: 24px; height: 24px; display: block; }
.right-sidebar__dela-logo { width: 36px; height: 36px; border-radius: 12px; }
.right-sidebar__dela-logo--active { display: none; }
.right-sidebar__item[data-active="true"]:has(.right-sidebar__dela-logo) .right-sidebar__dela-logo--default { display: none; }
.right-sidebar__item[data-active="true"]:has(.right-sidebar__dela-logo) .right-sidebar__dela-logo--active { display: block; }
.right-sidebar__label { font-family: var(--font-sans); font-size: var(--text-sm); font-weight: var(--font-normal); opacity: 0; visibility: hidden; transition: opacity 0.2s ease, visibility 0.2s ease; flex: 1; text-align: right; }
.right-sidebar:hover .right-sidebar__label { opacity: 1; visibility: visible; }
.right-sidebar__item[data-active="true"] { background-color: var(--theme-primary); color: var(--text-inverse); }
.right-sidebar__item[data-active="true"] .right-sidebar__icon { color: var(--text-inverse); }
.right-sidebar__item[data-active="true"]:hover { background-color: var(--theme-primary-hover); color: var(--text-inverse); }
.right-sidebar__item[data-active="true"]:has(.right-sidebar__dela-logo) { background: var(--linear-new); border-radius: 12px; color: var(--text-inverse); }
.right-sidebar__item[data-active="true"]:has(.right-sidebar__dela-logo):hover { background: var(--linear-new); color: var(--text-inverse); }
.right-sidebar__item[data-active="true"]:has(.right-sidebar__dela-logo) .right-sidebar__icon { color: var(--text-inverse); }
```

---

**For Vue/Svelte/Angular/Vanilla:**

- Same DOM structure as the React example.
- Same CSS (scoped per framework).
- Same props and logic.
- Use framework syntax from the conversion rules tables.

**Class binding (one example per framework):**

- **React:** `className={clsx(styles.alert, styles[\`alert--${variant}\`], className)}`
- **Vue:** `:class="['alert', \`alert--${variant}\`, class]"`
- **Svelte:** `class="alert alert--{variant} {className}"`
- **Angular:** `[ngClass]="['alert', 'alert--' + variant, class]"`
- **Vanilla:** `class="alert alert--info"` (same classes in HTML).

---

## Output File Structure

When converting, create these files:

**React:**
```
ComponentName.tsx          ← Component code
ComponentName.module.css   ← Styles (copy from Astro <style>)
```

**Vue:**
```
ComponentName.vue          ← Single file component (template + script + style)
```

**Svelte:**
```
ComponentName.svelte       ← Single file component
```

**Angular:**
```
component-name/
  component-name.component.ts
  component-name.component.html
  component-name.component.css
```

**Vanilla:**
```
component-name.html        ← Or integrate into existing HTML
component-name.css
component-name.js
```

---

## Dependencies to Install

**React:**
```bash
npm install clsx @heroicons/react @tabler/icons-react
```
(The React examples in this skill use inline SVG icons; heroicons/tabler are optional.)

**Vue:**
```bash
npm install @heroicons/vue @tabler/icons-vue
```

**Svelte:**
```bash
npm install @tabler/icons-svelte
```

---

## Validation Checklist

After conversion, verify. When the user asked for exact replica, also follow the **Exact replica: required sequence** (Steps 1–3) and output the **Exact-replica verification checklist** before marking done.

- [ ] **(When exact replica)** Verification step completed: diff the converted output against the **source you used**—real Astro (from the package) when present, or the skill's reference examples when the package could not be installed (React: in-doc; Vue/Svelte/Angular/vanilla: this skill at reference/vue/, reference/svelte/, reference/angular/, reference/vanilla/). Never verify against invented stubs. Check default section arrays and icon names, icon resolution (manifest when present, otherwise skill order), per-theme shell structure (floating nav, footer, sidebars), contextual UI branches (e.g. panel header gradient vs theme primary), optional layout in demo. Fix any missing or different items before marking done.
- [ ] **Shell contract:** (1) Main has padding-right when right sidebar present (match source). (2) Footer active tab and label are white in dark mode (override in footer component, not --text-inverse).
- [ ] Default state matches prepopulated source (no invented or simplified data)
- [ ] Icons resolved from theme-scoped manifest for target theme (no Heroicons-only substitution)
- [ ] Icon sizes from Icon size prop per usage in template (not inferred; not from manifest)
- [ ] Mode (light/dark) not used to change defaults or icon resolution
- [ ] All props from Astro source are present
- [ ] Default values match Astro source
- [ ] DOM structure and element order match exactly (same nesting, same elements, same sibling and child order as source).
- [ ] All BEM classes are preserved
- [ ] All CSS variables are kept (not resolved)
- [ ] Per-component layout/spacing: either copied from the Astro `<style>` block (when present) or from the relevant rules in components.css/layout.css for that component's selectors (when the component has no scoped block), so the converted component's CSS matches the source—do not rely only on global Harmony CSS being loaded.
- [ ] All data-* and aria-* attributes are present
- [ ] Client-side behavior works (converted to framework patterns)
- [ ] Component renders correctly in all variants
- [ ] Component works with themes (theme-cp, theme-vp, etc.)
- [ ] Component works in light and dark modes
- [ ] Dark mode: tokens + all source `html.dark` / `html.theme-*.dark` blocks copied into the converted component; no invented mode CSS
