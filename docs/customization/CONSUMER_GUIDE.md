# Harmony Consumer Guide

**One guide for designers and developers using Harmony components in another project.** Covers install, use, customize, update, and deploy.

---

## Table of Contents

1. [Who This Is For](#who-this-is-for)
2. [Two Ways to Get Harmony](#two-ways-to-get-harmony)
3. [Setup](#setup)
4. [Using Harmony](#using-harmony)
5. [Customization (Four Tiers)](#customization-four-tiers)
6. [Component Patterns](#component-patterns)
7. [Updates](#updates)
8. [Deployment](#deployment)
9. [Quick Reference](#quick-reference)

---

## Who This Is For

- Designers and developers building an Astro app that uses Harmony (e.g. Startpoint or any Deltek Astro project)
- Teams that need to use Harmony components and tokens and optionally customize them without breaking production builds or losing upgrade paths

**Key principle:** Never edit `node_modules/@deltek/harmony-components/`. Changes there are wiped on `npm install` and break production. Use the four-tier customization system instead.

---

## Two Ways to Get Harmony

| Method | How | Updates | When to use |
|--------|-----|---------|-------------|
| **npm from Git** (recommended) | `npm install github:DLTKfrancesmunoz/harmonycomponents` | `npm update @deltek/harmony-components` and `npm run harmony:check-updates` | Most app projects; package lives in `node_modules` |
| **Sparse checkout** | Clone repo with `git sparse-checkout` (components, styles, tokens, public, preview + layouts) | `git pull` in that clone | When you need a clone on disk (e.g. embedding the folder or working on the design system itself) |

**Recommended path:** Install as a package from Git. Your app lists `@deltek/harmony-components` as a dependency; Harmony lives in `node_modules`. You get updates via npm and can use the helper scripts (`harmony:copy`, `harmony:check-updates`, `harmony:diff`).

**Sparse checkout:** If you clone the Harmony repo and only check out certain folders (no docs site), you have a git checkout. Updates are `git pull`, not npm. You must specify exactly which paths to include; otherwise Git may check out the full repo and you will see root-level files (e.g. changelogs) that are unrelated to components or previews. Use the steps below so only components, styles, tokens, public, and preview files are present.

### Sparse checkout: components, styles, tokens, public, and preview

Use this when you want a clone on disk that includes the preview pages (e.g. to run the dev server and view component previews) without the full documentation site or root-level docs (changelog, etc.).

**Option A – Fresh clone (recommended)**

```bash
git clone --filter=blob:none --sparse <repo-url> harmony-components
cd harmony-components
git sparse-checkout init --cone
git sparse-checkout set \
  src/components \
  src/styles \
  src/tokens \
  src/pages/preview \
  src/layouts \
  public \
  README.md \
  package.json \
  package-lock.json \
  astro.config.mjs
```

Replace `<repo-url>` with your repository URL (e.g. `https://github.com/DLTKfrancesmunoz/harmonycomponents.git`).

**Option B – You already cloned the full repo**

If you previously did a full clone and see root-level files (changelog, docs, etc.), set the sparse paths and refresh the working tree so only those paths remain:

```bash
git sparse-checkout init --cone
git sparse-checkout set \
  src/components \
  src/styles \
  src/tokens \
  src/pages/preview \
  src/layouts \
  public \
  README.md \
  package.json \
  package-lock.json \
  astro.config.mjs
git read-tree -mu HEAD
```

`git read-tree -mu HEAD` updates the working tree to match the sparse set and removes files that are no longer in it (e.g. root-level docs).

**What you get**

- `src/components/` – UI components  
- `src/styles/` – CSS and tokens  
- `src/tokens/` – Design token JSON  
- `src/pages/preview/` – Preview pages for each component/shell  
- `src/layouts/` – ShellLayout and any layouts used by previews  
- `public/` – Assets and icons  
- `README.md`, `package.json`, `package-lock.json`, `astro.config.mjs` – So you can run `npm install` and `npm run dev` to view previews  

Root-level files such as `CHANGELOG.md`, `docs/`, and `archive/` (MCP-related assets were moved to `archive/mcp/` and are not part of the consumer bundle) are **not** included.

**Components only (no preview pages):** Use the same sparse-checkout steps above but set only these paths: `src/components`, `src/styles`, `src/tokens`, `public`, `README.md`, `package.json`, `package-lock.json`. Omit `src/pages/preview`, `src/layouts`, and `astro.config.mjs`.

---

## Setup

### Step 1: Install Harmony

```bash
npm install github:DLTKfrancesmunoz/harmonycomponents
```

Or with a specific version:

```bash
npm install git+https://github.com/DLTKfrancesmunoz/harmonycomponents.git#v1.0.1
```

### Step 2: Peer Dependencies

```bash
npm install astro @tabler/icons heroicons
```

If you already have Astro, you only need the icon libraries (required for Icon, LeftSidebar, RightSidebar, ShellFooter, FloatingNav).

### Step 3: Copy Helper Scripts

```bash
mkdir -p scripts
cp node_modules/@deltek/harmony-components/scripts/copy-harmony-component.cjs scripts/
cp node_modules/@deltek/harmony-components/scripts/check-harmony-updates.cjs scripts/
cp node_modules/@deltek/harmony-components/scripts/diff-harmony-component.cjs scripts/
```

### Step 4: Add package.json Scripts

```json
{
  "scripts": {
    "harmony:copy": "node scripts/copy-harmony-component.cjs",
    "harmony:check-updates": "node scripts/check-harmony-updates.cjs",
    "harmony:diff": "node scripts/diff-harmony-component.cjs"
  }
}
```

### Step 5: Icons and Static Assets (Shell Layout / Sidebars)

If you use Shell Layout with default left or right sidebars, copy these assets from the package into your app’s `public/` folder:

| Asset | Purpose |
|-------|---------|
| `RS_DelaDefault.svg` | Dela AI logo default state (right sidebar) |
| `RS_Dela_Active.svg` | Dela AI logo active state |
| `DelaChat.svg` | Dela panel content |
| `Stars.svg` | Dela button variants |
| `Risk Shield.svg` | Left sidebar |
| `Report.svg` | Left sidebar |
| `Resource.svg` | Left sidebar |
| `related.svg` | Right sidebar |
| `template.svg` | Right sidebar |
| `DStar_LM.svg` | Right sidebar Dela AI icon (default item) |

Optional (default `logoSrc`): `logos/CPVPLogo.svg`, `logos/PPMLogo.svg`, `logos/MacLogo.svg`.

```bash
cp node_modules/@deltek/harmony-components/public/RS_DelaDefault.svg public/
cp node_modules/@deltek/harmony-components/public/RS_Dela_Active.svg public/
cp node_modules/@deltek/harmony-components/public/DelaChat.svg public/
cp node_modules/@deltek/harmony-components/public/Stars.svg public/
cp node_modules/@deltek/harmony-components/public/Risk\ Shield.svg public/
cp node_modules/@deltek/harmony-components/public/Report.svg public/
cp node_modules/@deltek/harmony-components/public/Resource.svg public/
cp node_modules/@deltek/harmony-components/public/related.svg public/
cp node_modules/@deltek/harmony-components/public/template.svg public/
cp node_modules/@deltek/harmony-components/public/DStar_LM.svg public/
```

**Re-copy after upgrading** the package so icons and logos stay in sync.

### Step 6: Directory Structure

Create (when needed):

```
your-project/
├── src/
│   ├── components/
│   │   ├── harmony/          # Tier 3: Forked components
│   │   │   ├── README.md
│   │   │   └── .harmony-sync.json
│   │   └── composed/         # Tier 2: Wrapper components
│   └── styles/
│       └── theme-myproject.css   # Tier 0: CSS overrides
└── scripts/                  # Helper scripts (from Harmony)
```

**Tier 0 theme file** – Create `src/styles/theme-myproject.css`:

```css
html.theme-myproject {
  --theme-primary: #4C92D9;
  --theme-primary-hover: #3D7BC4;
  --btn-border-radius: 8px;
  --card-padding: var(--space-6);
}
```

Apply in your layout:

```astro
---
import '@deltek/harmony-components/styles/reset.css';
import '@deltek/harmony-components/styles/tokens.css';
import '@deltek/harmony-components/styles/global.css';
import '@deltek/harmony-components/styles/components.css';
import '../styles/theme-myproject.css';
---

<html class="theme-myproject">
  <!-- Your content -->
</html>
```

**Tier 3 tracking** – When you first fork a component, create `src/components/harmony/.harmony-sync.json`:

```json
{
  "lastChecked": "2026-01-28",
  "harmonyVersion": "1.0.0",
  "overrides": []
}
```

The `harmony:copy` script updates this automatically.

**Helper scripts (what they do):**

- **harmony:copy** – Copies a component from the package to `src/components/harmony/`, adds a metadata header, and updates `.harmony-sync.json`. Example: `npm run harmony:copy Button` creates `src/components/harmony/Button.astro`.
- **harmony:check-updates** – Shows installed vs tracked Harmony version, lists forked components, and which forks are out of date.
- **harmony:diff** – Shows differences between your fork and the base component (your customizations and base changes).

**Optional folder READMEs:** You can add `src/components/composed/README.md` and `src/components/harmony/README.md` describing that wrappers live in composed (Tier 2) and forked components in harmony (Tier 3); point readers to this Consumer Guide.

### Step 7: Optional CI Script

For pre-release or CI validation (optional):

```json
{
  "scripts": {
    "build:validate": "npm run harmony:check-updates && astro check && astro build"
  }
}
```

Running `harmony:check-updates` on every build can be slow; use it in CI or before releases, not in daily development.

### Verification

After setup, verify everything works:

1. **Check scripts:** Run `npm run harmony:check-updates`. You should see installed and tracked Harmony versions.
2. **Test CSS:** Add an override in your theme file, use a Harmony component, confirm the override applies.
3. **Test production build:** Run `npm run build`; it should succeed.
4. **Optional – test wrapper:** Create a simple wrapper in `src/components/composed/` that passes props through to a Harmony component and confirm it works.

---

## Using Harmony

### Import Global Styles

Recommended order in your layout or `_app.astro`:

1. reset.css  
2. tokens.css  
3. global.css  
4. components.css  
5. layout.css (optional)  
6. utilities.css (optional)

```astro
---
import '@deltek/harmony-components/styles/reset.css';
import '@deltek/harmony-components/styles/tokens.css';
import '@deltek/harmony-components/styles/global.css';
import '@deltek/harmony-components/styles/components.css';
---
```

### Import Components

**Batch (recommended):**

```astro
---
import { Button, Card, Input, Alert, Badge } from '@deltek/harmony-components/ui';
---

<Button variant="primary">Click me</Button>
<Card>Content</Card>
```

**Individual:**

```astro
---
import Button from '@deltek/harmony-components/ui/Button.astro';
import Card from '@deltek/harmony-components/ui/Card.astro';
---
```

### Import Layouts

```astro
---
import ShellLayout from '@deltek/harmony-components/layouts/ShellLayout.astro';
import DocsLayout from '@deltek/harmony-components/layouts/DocsLayout.astro';
---
```

ShellLayout slots: `main-content`, `left-sidebar`, `right-sidebar`, `left-panel-content`, `right-panel-content`, `header-actions`, `footer-tabs`.

### Import Design Tokens

```astro
---
import * as tokens from '@deltek/harmony-components/tokens';
import colors from '@deltek/harmony-components/tokens/colors.json';
import spacing from '@deltek/harmony-components/tokens/spacing.json';
---
```

### Design Tokens (Tier 0 Overrides)

Harmony uses CSS custom properties you can override in your theme file.

**Colors:** `--theme-primary`, `--theme-primary-hover`, `--theme-primary-active`, `--theme-secondary`, `--theme-secondary-hover`, `--theme-success`, `--theme-warning`, `--theme-error`, `--theme-info`, `--bg-default`, `--bg-subtle`, `--bg-muted`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled`

**Buttons:** `--btn-border-radius`, `--btn-padding-x`, `--btn-padding-y`, `--btn-primary-bg`, `--btn-primary-text`, `--btn-primary-hover`, `--btn-secondary-bg`, `--btn-secondary-text`

**Cards:** `--card-bg`, `--card-border`, `--card-border-radius`, `--card-padding`, `--card-shadow`, `--card-shadow-hover`

**Inputs:** `--input-bg`, `--input-border`, `--input-border-radius`, `--input-padding-x`, `--input-padding-y`, `--input-focus-border`, `--input-placeholder-color`

**Spacing:** `--space-1` through `--space-16` (e.g. `--space-4: 1rem`)

**Typography:** `--font-sans`, `--font-mono`, `--font-weight-*`, `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, etc.

**Elevation:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

**Shell footer and sidebars:** `--shell-footer-tab-label-color` (default `#ffffff` – tab labels and default icons on the dark footer bar), `--shell-footer-tab-icon-color-active` (default `var(--theme-primary)` – active tab icon), `--shell-sidebar-icon-color-on-primary` (default `#ffffff` – icon on primary background, e.g. active sidebar item in dark mode). Override these in your theme so footer and sidebar icon/label colors stay correct in both light and dark modes and after rebuilds. Sidebar custom icons (img-based SVGs such as Risk, Reports, Resources, Related, Templates) are forced white in dark mode via a CSS filter so they match inline-SVG icons; override `filter` on `.left-sidebar__custom-icon` or `.right-sidebar__icon img` if you need different behavior.

**Rule:** Use Harmony components and tokens first. Override with CSS variables in your theme file; don’t invent new token names in pages or components.

**Checklist for adding new UI:** (1) Check if an existing Harmony component (or wrapper/override) can do the job. (2) If yes, use it and style only with tokens and theme overrides; no new token names, no hex in CSS. (3) If no, create a component that wraps or composes Harmony components and uses only the tokens above. (4) Fork (Tier 3) only when markup/behavior must change and wrappers aren’t enough; keep using Harmony tokens inside the fork.

**Token definitions (JSON in package):** `node_modules/@deltek/harmony-components/src/tokens/colors.json`, `spacing.json`, `typography.json`, `elevations.json` (or via `@deltek/harmony-components/tokens/...`).

### Complete Component List

**Form controls:** Button, ButtonGroup, Input, Textarea, NumberInput, RangeInput, Checkbox, RadioButton, Toggle, DateInput, Label  

**Display:** Card, Badge, NotificationBadge, Chip, Alert, Tooltip, Spinner, ProgressBar, Table, Icon  

**Navigation:** TabStrip, Stepper, Step, FloatingNav, Link  

**Layout:** LeftSidebar, RightSidebar, ShellPageHeader, ShellPanel  

**Interactive:** Dialog, Dropdown, Accordion, Kanban, KanbanCard  

**Shell:** ShellFooter, ShellHeader  

**Pickers:** DatePicker, DateTimePicker, MonthPicker, WeekPicker, TimePicker, PickerPopup  

**Other:** ListMenu  

### Public Assets

Reference logos/assets from the package or copy them to your `public/` (see [Setup – Icons and Static Assets](#step-5-icons-and-static-assets-shell-layout--sidebars)):

```astro
<img src="/logos/CPVPLogo.svg" alt="Logo" />
```

---

## Customization (Four Tiers)

Use the **lowest tier that works**. Try CSS first, then wrappers; fork only as last resort.

| Tier | Method | When to use | Maintenance |
|------|--------|-------------|-------------|
| **0** | CSS only | Colors, spacing, borders, shadows | None |
| **1** | Direct import | Component works as-is | None |
| **2** | Wrapper | Add tracking, defaults, behavior; no markup change | Low |
| **3** | Fork | Change markup or add props that need template changes | Medium |

### Decision Tree

```
Need to customize?
├─ Can you do it with CSS variables? → Tier 0 (theme file)
├─ Component works as-is? → Tier 1 (direct import)
├─ Add tracking, analytics, or extra props (no markup change)? → Tier 2 (wrapper)
└─ Need to modify markup or template? → Tier 3 (fork)
```

### Tier 0: CSS

Override CSS variables in `src/styles/theme-myproject.css`. No copying; survives Harmony updates.

### Tier 1: Direct Import

Import from `@deltek/harmony-components/ui` and use with props. No extra files.

### Tier 2: Wrapper

Create a component in `src/components/composed/` that imports the Harmony component and adds behavior or props. Pass-through with `{...props}`. Custom props live in your code and work in production.

### Tier 3: Fork

When you must change markup or add props that require template changes:

```bash
npm run harmony:copy ComponentName
```

This copies the component to `src/components/harmony/`, adds a metadata header, and updates `.harmony-sync.json`. Edit the copy and import from your project (e.g. `../components/harmony/ComponentName.astro`), not from the package.

**Cascade:** If you fork a component that another component imports (e.g. ShellHeader used by ShellLayout), fork the dependent too (e.g. ShellLayout) and have it import your forked ShellHeader.

**Import fallback:** If package subpath imports fail, use a direct path:

```astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';
```

### Common Pitfalls

- **Editing node_modules** – Don’t. Use Tier 0, 2, or 3.
- **Forking for styling only** – Use Tier 0 (CSS variables) instead.
- **Not tracking forks** – Use `npm run harmony:copy` so `.harmony-sync.json` stays updated.
- **Forgetting cascades** – Fork dependents (e.g. ShellLayout when you fork ShellHeader).
- **Skipping production build** – Always run `npm run build` after customizing.

### Troubleshooting (Customization)

- **Build fails in production** – Customizations in node_modules are wiped on deploy. Move them to Tier 2 (wrapper) or Tier 3 (fork) in `src/`.
- **Import errors** – Use the direct `node_modules/.../src/components/ui/...` path if subpath imports fail.
- **Custom props not working** – Add props in a wrapper (Tier 2) or in your fork (Tier 3), not in the base component.
- **Styles not applying** – Override the correct CSS variable in your theme file; check specificity in DevTools.
- **Scripts don’t run** – Ensure scripts are executable: `chmod +x scripts/*.cjs`.
- **Component not updating from Harmony** – If you forked, you’re using your fork; base changes won’t appear. To get base updates, remove the fork and import from the package again (or merge base changes into your fork).

---

## Component Patterns

### Prepopulated defaults

Components (especially shell) are **prepopulated** so that out of the box you see a full default: gradient bar, avatar, page header, page content area, and theme-specific sidebars. Consumers override via props and slot content.

- **Shell:** ShellHeader shows a default gradient bar (first company color when `companyColor` is not passed). ShellLayout shows a default page header (title "Page title") and default main content (a placeholder Card) when no slot content is passed. ShellPageHeader includes one primary and one outline secondary button by default; pass `showDefaultButtons={false}` to hide them, or pass `primaryButton` / `outlineButton1` to override. Shell layout structure is **theme-dependent**: CP theme includes floating nav and no footer by default; PPM (and VP, Maconomy) include a footer and different left/right sidebar sections.
- **Icons:** Default content uses icons that resolve per theme. Icon resolution (source and path) is defined in the theme-scoped **icon manifest** (`src/data/icon-manifest.json` in the package). Each theme (cp, vp, ppm, maconomy) has its own set of icon names and sources (hero, tabler, or custom with path). Do not assume all icons are Heroicons.
- **Canonical prepopulated shell:** The preview page `preview/shell-layout` (in the Harmony repo docs site) is the canonical example of the full prepopulated shell with all defaults visible. Default content and icon set depend on **theme**; **mode** (light/dark) does not change default structure or icon resolution.

Preview files and the npm package: Preview pages (e.g. `src/pages/preview/*.astro`) exist in the full Harmony repo; the published npm package may not include them. When they are absent, shell conversion should use ShellLayout.astro, ShellFooter.astro, layout.css, components.css, and tokens.css, plus the documented Shell layout defaults and dark-mode sources—conversion is still valid without preview files.

**Shell conversion: scoped styles and icons.** ShellPageHeader, ShellFooter, and TabStrip define **critical layout and background** in their Astro `<style>` blocks only; these rules are **not** in `components.css`. When converting to React, Vue, Angular, or another framework, copy the full `<style>` content from each of these components into the converted app’s CSS (e.g. ShellPageHeader.css, ShellFooter.css, TabStrip.css) and import them where those components are used. If you rely only on components.css and layout.css, the page header will stack vertically, the footer will have no background, and the footer tabs will stack instead of sitting in a horizontal row. For **icons:** Avatar uses the icon name `"user"`. The theme-scoped icon manifest includes `"user"` for themes that use it (e.g. cp). If your Icon implementation is manifest-only, ensure `"user"` is present in the manifest for the theme you use; otherwise implement the same resolution order as Icon.astro (Heroicons → Tabler → public/{name}.svg) so `"user"` resolves.

### Using Harmony in other frameworks (Angular, Vue, etc.)

Shell components (LeftSidebar, RightSidebar) use CSS selectors that depend on **document-level** theme classes: `html.theme-cp`, `html.theme-vp`, `html.theme-ppm`, `html.theme-maconomy`, and `html.dark`. In frameworks that use **view encapsulation** (e.g. Angular’s Emulated encapsulation), putting those rules only in the component’s stylesheet can prevent them from applying, because the selector is rewritten and the dependency on `html` may not match. The fix is to have theme-dependent rules in a **global** stylesheet.

Harmony’s `components.css` includes these rules (e.g. left sidebar variant visibility and dark-mode filters for sidebar icon images). When converting the shell to Angular or a similar framework, load `components.css` **globally** (e.g. in `styles.css` or `angular.json` styles), and do not rely only on the converted component CSS for `html.theme-*` or `html.dark` selectors. If you override or split styles, keep the dark-mode filter for right sidebar icon images (e.g. mic-slash) in a global stylesheet so those icons stay light in dark mode.

### Tier 0: Brand Colors

```css
html.theme-myproject {
  --theme-primary: #4C92D9;
  --theme-primary-hover: #3D7BC4;
  --btn-primary-bg: var(--theme-primary);
  --btn-border-radius: 8px;
}
```

### Tier 2: TrackedButton (Wrapper)

Wrapper that adds analytics without changing markup:

```astro
---
// src/components/composed/TrackedButton.astro
import Button from '../../../node_modules/@deltek/harmony-components/src/components/ui/Button.astro';

interface Props {
  trackEvent?: string;
  [key: string]: any;
}
const { trackEvent, ...buttonProps } = Astro.props;
---

<Button {...buttonProps} data-tracked={trackEvent ? 'true' : undefined}>
  <slot />
</Button>
```

Use: `<TrackedButton variant="primary" trackEvent="cta_click">Get Started</TrackedButton>`

### Tier 3: Fork with Custom Props

When the base component doesn’t have a prop you need and it requires markup changes (e.g. `userName` in ShellHeader):

1. `npm run harmony:copy ShellHeader`
2. Edit `src/components/harmony/ShellHeader.astro` – add `userName` (and any markup).
3. If ShellLayout uses ShellHeader, fork it too: `npm run harmony:copy ShellLayout`, then have ShellLayout import your local ShellHeader and pass `userName` through.
4. In pages, import from `../components/harmony/ShellLayout.astro` (or ShellHeader).

### Anti-patterns

- Don’t fork just to change colors – use Tier 0.
- Don’t edit files in node_modules – use Tier 2 or 3.
- Don’t skip `.harmony-sync.json` – use `harmony:copy` so forks are tracked.
- Don’t try to change markup with a wrapper only – use Tier 3 when structure must change.

**More examples:** The package includes full wrapper and fork examples (e.g. ProjectCard, LoginButton, StatusCard, ShellHeader/ShellLayout with custom props) in `node_modules/@deltek/harmony-components/examples/` (wrappers and composed folders).

---

## Updates

### When to Update

- **Regular:** New features, bug fixes, performance (e.g. quarterly).
- **Security:** As soon as patches are available.
- **Breaking changes:** Plan and test (e.g. major version bumps).

### Before Updating

1. Run `npm run harmony:check-updates` to see current version and forked components.
2. Review the Harmony repo CHANGELOG/releases for breaking changes, especially for components you’ve forked and props you use.
3. Commit or create a backup branch (e.g. `git checkout -b backup-before-harmony-update`).
4. Review `src/components/harmony/.harmony-sync.json` to note which components are forked and when they were last synced.

### Update Procedure

1. **Update the package:**
   ```bash
   npm update @deltek/harmony-components
   ```
   Or: `npm install @deltek/harmony-components@latest`

2. **Check forks:**
   ```bash
   npm run harmony:check-updates
   ```

3. **For each forked component, review diff:**
   ```bash
   npm run harmony:diff ComponentName
   ```
   Merge base changes into your fork if needed; keep your customizations. Update metadata header and `.harmony-sync.json` base version.

4. **Re-copy public assets** if you use Shell/sidebars (see [Setup – Step 5](#step-5-icons-and-static-assets-shell-layout--sidebars)).

5. **Test:** `npm run build` and `npm run preview`; verify forked and wrapped components.

**Testing checklist after update:** All pages load without errors; forked components render correctly; custom props still work; wrapper components work; CSS overrides still apply; no TypeScript or console errors; production build succeeds.

### Handling Forks During Updates

- **Base unchanged** – If `harmony:diff ComponentName` shows no base changes, no action needed; your fork is still current.
- **Base has minor changes** – Review the diff; merge bug fixes/improvements into your fork if you want them, or skip. Update metadata header and `.harmony-sync.json` if you merge.
- **Base has conflicting changes** – Decide: merge both (keep your customizations and add base changes), adapt your customization to use new base behavior, or keep your version and document why. Update metadata with merge notes.

### Breaking Changes

**Identifying:** Removed/renamed props, changed prop types, removed components, changed structure or CSS variable names.

**Handling:** (1) Read Harmony’s migration/changelog. (2) Find affected usage in your code (e.g. grep for old prop names). (3) Update Tier 1 imports, Tier 2 wrappers, and Tier 3 forks accordingly. (4) Test thoroughly.

### Wrappers (Tier 2)

Wrappers usually don’t need changes when Harmony updates; base fixes and new props flow through. Update a wrapper only if the base removed/renamed a prop you use or you want to expose new base behavior.

### Rollback

- **Option 1:** `npm install @deltek/harmony-components@<previous-version>` (e.g. `@1.0.0`).
- **Option 2:** `git revert HEAD` (or reset to the commit before the update).
- **Option 3:** Restore from a backup branch: `git checkout backup-before-harmony-update` and copy state back to main if needed.

Document why you rolled back and when you’ll retry.

### Best Practices

- Run `harmony:check-updates` periodically (e.g. monthly).
- Plan Harmony updates (e.g. quarterly); test thoroughly.
- In a team, announce updates, share a test checklist, and document what broke and how it was fixed.
- **Optional CI:** Add a job that runs `npm run harmony:check-updates` (e.g. weekly) to surface when forks need review.

### Troubleshooting (Updates)

- **Build fails after update** – Check changelog for breaking changes; update prop names/types and forked components as needed.
- **Components look different** – Base CSS or markup may have changed; update your theme overrides or review component changes.
- **Custom props not working after update** – Ensure you’re importing from your fork (`../components/harmony/...`), not from the package.
- **harmony:diff shows many changes** – If mostly formatting, you can ignore. If logic changed a lot, consider re-forking: back up your fork, run `harmony:copy ComponentName` again, then re-apply your customizations.
- **Wrapper breaks after update** – Base may have removed/renamed a prop; update the wrapper to use the new API or expose new base behavior.

---

## Deployment

The package is installed from a **private GitHub repository**. On the deployment server (Railway, Vercel, Netlify, etc.), `npm install` must be able to clone that repo.

**Configure a GitHub token on the deployment platform:**

1. Create a **Personal Access Token** (classic) with `repo` scope. Use it only for deployment; don’t commit it.
2. Add it as an environment variable, e.g. `GITHUB_TOKEN`, in your deployment project settings.
3. Ensure your app’s `package.json` dependency uses the HTTPS URL (e.g. `github:DLTKfrancesmunoz/harmonycomponents` or `git+https://...`). Many platforms use `GITHUB_TOKEN` automatically for `npm install` when installing from GitHub.

**Local development:** Developers use their own GitHub auth (SSH or HTTPS); they don’t need the deployment token.

**Rotation:** When the token expires, generate a new one and update the env var on the deployment platform.

---

## Quick Reference

### Scripts

```bash
npm run harmony:copy ComponentName    # Fork a component (Tier 3)
npm run harmony:check-updates         # Check for Harmony updates
npm run harmony:diff ComponentName   # Diff fork vs base
```

### Peer Dependencies

- `astro` ^5.0.0  
- `@tabler/icons` ^3.0.0  
- `heroicons` ^2.0.0  

### Key Paths

- **Theme overrides:** `src/styles/theme-myproject.css` (Tier 0)
- **Wrappers:** `src/components/composed/` (Tier 2)
- **Forks:** `src/components/harmony/` (Tier 3)
- **Fork tracking:** `src/components/harmony/.harmony-sync.json`

### Import Cheatsheet

```astro
import { Button, Card, Input } from '@deltek/harmony-components/ui';
import ShellLayout from '@deltek/harmony-components/layouts/ShellLayout.astro';
import '@deltek/harmony-components/styles/global.css';
import * as tokens from '@deltek/harmony-components/tokens';
```

### Documentation in Package

After install:

- **Docs:** `node_modules/@deltek/harmony-components/README.md` and `node_modules/@deltek/harmony-components/docs/customization/` (this guide).
- **Scripts:** `node_modules/@deltek/harmony-components/scripts/`.

### In Your Project README

You can add a short section to your app’s README, for example:

```markdown
## Customizing Harmony Components

This project uses Harmony with the four-tier customization system. See the [Consumer Guide](node_modules/@deltek/harmony-components/docs/customization/CONSUMER_GUIDE.md) in the package.

**Quick reference:** `npm run harmony:copy ComponentName` | `harmony:check-updates` | `harmony:diff ComponentName`  
**Local:** `src/styles/theme-*.css` (Tier 0) | `src/components/composed/` (Tier 2) | `src/components/harmony/` (Tier 3)
```

### Reference Implementation

Projects like Startpoint show this system in practice: Tier 0 overrides in `src/styles/theme-startpoint.css`, Tier 2 wrappers in `src/components/composed/`, Tier 3 forks in `src/components/harmony/`.

---

Sparse-checkout steps (with or without preview) are in the **Two Ways to Get Harmony** section above.
