# Shell Layout Sidebar Icons – Why Only Some Missing

## Why only some icons vs all?

Icons come from **two resolution paths**. In another project, only the ones that still resolve show up; the rest are missing.

### 1. Resolution split (main reason)

**Icon.astro** resolves in order: Heroicons → Tabler → `public/{name}.svg`. Names and sources are mixed:

| Source | Where it resolves | In consuming project |
|--------|-------------------|------------------------|
| **Heroicons/Tabler** (kebab-case names) | `node_modules/heroicons` or `@tabler/icons` | Work **only if** the app installs `heroicons` and `@tabler/icons` (peer deps). |
| **Design-system `public/`** (custom names or customSrc) | `public/Risk Shield.svg`, `public/Report.svg`, `public/Resource.svg`, `public/related.svg`, `public/template.svg`, `/D_64x64.svg` (right sidebar Dela logo) | Work **only if** the app copies those files into its own `public/`. |

**LeftSidebar:**

- **CP variant:** All kebab-case (`home`, `squares-2x2`, `star`, `clock`, `magnifying-glass`, etc.) → resolve from Heroicons/Tabler when peers are installed.
- **PPM/VP/Maconomy:** Mix of kebab-case (`rectangle-group`, `book-open`, `briefcase`, `calendar-days`, `wallet`, `cog-6-tooth`, `plus`) and **custom names** (`Risk Shield`, `Report`, `Resource`). Heroicons/Tabler use kebab-case filenames and do not have `Risk Shield.svg`, `Report.svg`, `Resource.svg`; those only exist in this repo’s `public/`. So in another project:
  - Kebab names → work if peers installed.
  - `Risk Shield`, `Report`, `Resource` → fall through to `public/` and **fail** unless the app has copied `public/Risk Shield.svg`, `Report.svg`, `Resource.svg`.

**RightSidebar:**

- First item in every variant: **customSrc** `'/D_64x64.svg'` → always loaded from the **app’s** `/D_64x64.svg` (Dela logo in public root). Missing unless the app copies `public/D_64x64.svg`.
- Other items: kebab names (`bell`, `printer`, `mic-slash`, `related`, `template`, etc.). Some exist in Heroicons/Tabler; `related` and `template` do not exist in Heroicons (checked), so they resolve from `public/related.svg`, `public/template.svg` in this repo and **fail** in another project if `public/` wasn’t copied.

**These design-system-only assets are the ones that are always missing** in another project until the consumer copies them.

So **“only some missing”** = icons that resolve from **node_modules** (Heroicons/Tabler) work when peers are installed; icons that resolve only from **public/** or **customSrc** fail unless the app copies the design-system assets. Import paths in the components are correct; the split is **which resolution path each icon uses**, not wrong paths.

### 2. JSON missing default section data (secondary)

The **MCP/recipe JSON does not list** the default sidebar section items (icon names, labels, customSrc).

- [mcp-data/layouts/shelllayout.json](mcp-data/layouts/shelllayout.json) – has `leftSidebarVariant` / `rightSidebarVariant` and layout regions (`leftSidebar`, `rightSidebar`) but **no** `sections` arrays with `{ icon, label }` or `{ customSrc, label }`.
- [mcp-data/components/leftsidebar.json](mcp-data/components/leftsidebar.json) and [rightsidebar.json](mcp-data/components/rightsidebar.json) – describe structure (nav → section → item → Tooltip → `span.left-sidebar__icon`) but the icon span has `children: []`; they **do not** enumerate the default CP/PPM/VP/Maconomy items or icon names.
- [mcp-data/recipes/layouts/shell-layout-standard.json](mcp-data/recipes/layouts/shell-layout-standard.json) – lists LeftSidebar/RightSidebar with generic props (`collapsible: true`), **no** `sections` or icon/asset list.

So:

- **Code paths are correct** – LeftSidebar/RightSidebar and Icon.astro use the right logic and paths; the default sections live only in the `.astro` source (e.g. `cpSections`, `ppmSections` in LeftSidebar.astro).
- **JSON does not contain** the list of icon names or required public assets. Any tooling or AI that “brings the template” from JSON cannot see which icons or files are required, so it can’t suggest “install heroicons + tabler and copy these N files from public/.” That doesn’t break imports; it **reinforces “only some”** because consumers may copy only what they stumble on (e.g. only D_64x64.svg) and miss `Risk Shield.svg`, `Report.svg`, `Resource.svg`, `related.svg`, `template.svg`, etc.

## Summary

| Question | Answer |
|----------|--------|
| Why only some vs all? | Some icons resolve from Heroicons/Tabler (work if peers installed); others resolve only from `public/` or `customSrc` (fail unless app copies those assets). |
| Is it missing from the JSON? | Yes – the default section items (icon names, customSrc) are **not** in the layout/component/recipe JSON, so tooling can’t discover the full icon/asset list. |
| Are import paths wrong? | No – component and Icon resolution paths are correct; the issue is **which** path each icon uses (node_modules vs public) and whether the consuming app has those deps/assets. |

## Explicit assets to copy (design-system-only, current list)

For shell layout default sidebars to show all icons in a consuming project, copy these from the design system’s `public/` into the app’s `public/` (paths relative to `public/`):

**Right sidebar (customSrc):**

- `D_64x64.svg` – Dela AI logo (first item in right sidebar; in public root)

**Left sidebar PPM/VP/Maconomy (Icon component fallback to public/):**

- `Risk Shield.svg`
- `Report.svg`
- `Resource.svg`

**Right sidebar PPM/VP/Maconomy (Icon component fallback to public/):**

- `related.svg`
- `template.svg`

**Optional (if using ShellHeader default logoSrc):** `logos/CPVPLogo.svg`, `logos/PPMLogo.svg`, `logos/MacLogo.svg` as needed.

When the design system adds or renames assets (e.g. logo replaced again), this list is the single source of truth to update in docs/JSON.

---

## How updates work when there are changes

When the design system changes (e.g. Dela logo replaced, new sidebar icons, renamed SVGs), consuming projects need a repeatable way to get the new assets.

**Recommended approach:**

1. **Single source of truth** – Keep the “assets to copy” list in one place: FOR_CONSUMING_PROJECTS.md (and optionally in MCP/layout JSON as `requiredIconAssets`). When the design system updates an asset (filename or content), update that list and the package’s `public/` in the same release.
2. **Copy from the package** – Document that consumers should copy from the **installed package** (e.g. `node_modules/@deltek/harmony-components/public/`), not from a one-off snapshot. That way, when they upgrade the package (`npm update @deltek/harmony-components` or reinstall), the new files are in node_modules; they just need to re-copy into their app’s `public/`.
3. **Re-copy on upgrade** – In FOR_CONSUMING_PROJECTS (and README), tell consumers: “After upgrading the design system package, re-copy the required public assets from the package into your app’s `public/` so you get updated logos and icons (e.g. D_64x64.svg).”
4. **Optional: copy script** – Provide a small script (e.g. `copy-harmony-assets.cjs` or extend an existing script) that copies the required list from `node_modules/@deltek/harmony-components/public/` to the app’s `public/`. Consumers run it after install/upgrade; when the list changes in the package, the script can be updated so one command keeps assets in sync.

No automatic sync is required: the canonical list lives in the repo; consumers re-copy (or run the script) after upgrading. That way logo/icon changes in the design system flow to consumers on their next upgrade and re-copy.

---

## Recommended changes

1. **Document in FOR_CONSUMING_PROJECTS.md** – Require peer deps (heroicons, @tabler/icons) and copying the **design-system-only** assets above (D_64x64.svg, Risk Shield.svg, Report.svg, Resource.svg, related.svg, template.svg, and optional logos). Add the “How updates work” note: re-copy from the package’s `public/` after upgrading.
2. **README** – In the Shell Layout section, state that default sidebars need peer icon libs and copying the required `public/` assets (list or link to FOR_CONSUMING_PROJECTS); mention re-copy after package upgrade for logo/icon updates.
3. **Optional: Enrich JSON** – Add to shell layout and/or sidebar MCP data a **requiredIconAssets** (or **requiredPublicAssets**) array with the exact filenames/paths above. When the list changes (e.g. logo filename), update the JSON in the same release so tooling/AI and any copy script stay in sync.
4. **Optional: Copy script** – Script that copies the required assets from `node_modules/@deltek/harmony-components/public/` to the app’s `public/`; document “run after install/upgrade.” Update the script’s file list when new assets are added or renamed.
