# Packagable Cursor bundle (Harmony / design)

Portable copy of **agents**, **skills**, **rules**, and the designer quick reference. Refreshed from this repo’s `.cursor/` — do not edit here first; change `.cursor/` then re-run the sync (see repo `.cursor/skills/README.md`).

## Contents

| Path | Maps to project |
|------|------------------|
| `skills/` | `<project>/.cursor/skills/` |
| `agents/` | `<project>/.cursor/agents/` |
| `rules/` | `<project>/.cursor/rules/` |
| `DESIGNER_GUIDE.md` | Optional: copy to `<project>/.cursor/DESIGNER_GUIDE.md` |

## Use in another project

1. Copy folders into the target repo’s `.cursor/` (merge; keep existing files you still need).
2. Restart Cursor or reload the window so skills/agents are picked up.

## Zip for distribution

From the repo root:

```bash
zip -r harmony-cursor-bundle.zip skills_frances_test/skills skills_frances_test/agents skills_frances_test/rules skills_frances_test/DESIGNER_GUIDE.md skills_frances_test/README.md
```

Recipients unzip and copy the inner folders into their `.cursor/` as above.
