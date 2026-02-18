# Plan: Why Default Dialog Shows Page Header Buttons and Fix (in this repo)

## Root cause (in the component)

**Dialog does not pass `buttonType` to its default footer Buttons.**

- [Dialog.astro](src/components/ui/Dialog.astro) default footer (slot fallback) renders:
  - `<Button type="button" ...>Confirm</Button>`
  - `<Button variant="ghost" type="button" ...>Cancel</Button>`
- Neither sets `buttonType`. So whatever renders those Buttons uses **the Button’s default** for `buttonType`.
- In **this** repo, [Button.astro](src/components/ui/Button.astro) defaults to `buttonType = 'theme'`. So when you run this repo’s Astro app, the dialog footer gets theme buttons.
- Your **other project** (the app that consumes this repo) has a Button—e.g. a React `Button.tsx`—that was generated or written with **default `buttonType = 'pageHeader'`**. So when that app renders the Dialog (or a Dialog built from this repo’s specs/recipes), the footer Buttons get no `buttonType` and therefore use that app’s default: pageHeader. Result: default dialog shows page header (dark blue) buttons.

So the cause is: **Dialog leaves buttonType to the Button default, and the consumer’s Button default is pageHeader.** The bug is visible in the consumer, but the fix in **this** repo is to stop relying on that default for the dialog.

---

## Why fix in Dialog (not only in Button default)

- This repo already sets Button default to `theme` (Button.astro line 34; mcp-data and inventory say the same). So any consumer that correctly uses that default would get theme. But if the consumer’s Button was built with a different default (e.g. pageHeader), or if a codegen that reads this repo emits Button with pageHeader default, the dialog will still show page header buttons unless the **Dialog** says otherwise.
- Dialog footers are **general UI**, not page header. So the Dialog component should **declare** that its default footer uses theme buttons, instead of depending on whatever the consumer’s Button default is.

---

## Fix (in this repo only)

**In [Dialog.astro](src/components/ui/Dialog.astro), set `buttonType="theme"` on both default footer Buttons.**

- Confirm: primary “Confirm” button and ghost “Cancel” button in the footer slot fallback.
- Add: `buttonType="theme"` to both `<Button ...>` so the dialog’s default footer always requests theme buttons.
- No change to Button.astro default (keep `theme`). No change to ShellPageHeader (keep `pageHeader`).

Result when the consumer pulls this repo and uses the updated Dialog (or a Dialog built from it): the default dialog footer will show theme buttons regardless of the consumer’s Button default, because the Dialog component explicitly requests theme for those buttons.

---

## Summary

| What | Current | After fix |
|------|--------|-----------|
| Button.astro default | `buttonType = 'theme'` | Unchanged |
| Dialog.astro default footer Buttons | No `buttonType` → use Button default | `buttonType="theme"` on both |
| ShellPageHeader | `buttonType="pageHeader"` | Unchanged |

**Root cause:** Dialog doesn’t pass `buttonType`, so footer buttons use the consumer’s Button default (which in your app is pageHeader).  
**Fix:** Dialog explicitly passes `buttonType="theme"` for its default footer Buttons so the dialog is correct regardless of the consumer’s Button default.
