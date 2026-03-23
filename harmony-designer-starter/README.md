# Harmony designer starter

Self-contained **Harmony React** preview for designers: full shell (`ShellLayout`) and converted components under `src/components/harmony/`, vendored global CSS (`harmony-styles/`) and icon data (`harmony-data/`), plus curated **Cursor** skills and slash-command docs under `.cursor/`.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown (default Vite port **5175**). The home route is the **template shell** (no dev theme switcher). Default theme is **PPM** light; see `src/App.tsx` to change `document.documentElement` classes.

## Build

```bash
npm run build
npm run preview
```

## Pattern tools (optional)

Python **3** recommended for design-patterns scripts:

```bash
python3 .cursor/skills/design-patterns/scripts/search_patterns.py --list
python3 .cursor/skills/design-patterns/scripts/create_pattern.py --help
```

Search defaults to `.cursor/skills/design-patterns/reference`. For full frontmatter parsing: `pip install pyyaml`.

## Cursor

See [`.cursor/DESIGNER_GUIDE.md`](.cursor/DESIGNER_GUIDE.md) for slash commands and skill overview.

## Package this folder

From the **harmonycomponents** repo root:

```bash
./scripts/package-harmony-designer-kit.sh
```

Produces `dist-kit/harmony-designer-starter.zip` (excludes `node_modules` and `dist`).

## License

Internal / UNLICENSED — align distribution with your organization’s policy (same as parent Harmony packages).
