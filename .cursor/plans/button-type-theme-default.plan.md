# Plan: Theme as Default Button Type; Page Header Only in Shell Page Header

## Design rule

- **Theme buttons** = default for all general UI (dialogs, alerts, forms, toolbars, kanban, etc.). Use `buttonType="theme"` or rely on Button’s default.
- **Page header buttons** (dark blue #043852) = **only** in the shell page header. Use `buttonType="pageHeader"` explicitly there; nowhere else.

So: default is theme everywhere except the one place that is the shell page header component, which explicitly uses page header buttons.

---

## Current state in this repo

| Item | Current behavior | Intended |
|------|------------------|----------|
| **Button.astro** default | `buttonType = 'theme'` (line 34) | Keep as theme. |
| **Dialog.astro** default footer | Buttons now have `buttonType="theme"` (already updated) | Theme. Done. |
| **ShellPageHeader.astro** | Buttons use `buttonType="pageHeader"` (lines 80, 91) | Page header only here. Correct. |
| **Alert.astro** | Buttons do not set `buttonType` → get default theme | Theme. Optional: set `buttonType="theme"` explicitly for clarity and build safety. |
| **Kanban.astro** | Buttons do not set `buttonType` → get default theme | Theme. Optional: set `buttonType="theme"` explicitly. |

---

## Implementation checklist

1. **Button.astro**  
   - Confirm default remains `buttonType = 'theme'`.  
   - Optionally add a one-line comment above the default: e.g. “Default theme; page header buttons only in ShellPageHeader.”

2. **Dialog.astro**  
   - No further change. Default footer already uses `buttonType="theme"` on both buttons.

3. **ShellPageHeader.astro**  
   - No change. Continue using `buttonType="pageHeader"` for its Buttons.

4. **Alert.astro**  
   - Add `buttonType="theme"` to the primary and secondary `Button` usages (general UI, not page header).

5. **Kanban.astro**  
   - Add `buttonType="theme"` to every `Button` (action bar and “Add” / column actions). General UI, not page header.

6. **Docs**  
   - In [docs/RULES.md](docs/RULES.md) (or the script that generates it): ensure the rule is “Theme buttons default; page header buttons only in page headers” so future builds don’t flip the default.

---

## Summary

- **Default** = theme buttons in all components **except** the shell page header.
- **Shell page header** = only place that uses dark blue, via explicit `buttonType="pageHeader"`.
- **Dialog, Alert, Kanban** = use theme buttons (Dialog already explicit; Alert and Kanban get default theme, optionally make explicit).
- No code uses `pageHeader` outside ShellPageHeader.
