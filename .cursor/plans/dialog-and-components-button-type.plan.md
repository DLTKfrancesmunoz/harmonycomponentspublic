# Dialog and all components: buttonType="theme" for general UI

## Rule

**Only the shell page header uses page header buttons.** Every other component that renders buttons must use theme buttons (`buttonType="theme"`). No other component should use `buttonType="pageHeader"`.

## Scope: Is this an issue in all components that use buttons?

**Yes.** In **reusable UI components** (`src/components/ui/`), any component that renders `<Button>` for general UI (not the shell page header) and does **not** set `buttonType` has the same class of issue: in a consumer app where Button defaults to `pageHeader`, those buttons will render as page header style instead of theme.

### Components that use Button

| Component | Button usage | Sets buttonType? | General UI? | Action |
|-----------|--------------|------------------|------------|--------|
| **Dialog.astro** | Default footer (Confirm, Cancel) | No | Yes | Add `buttonType="theme"` to both |
| **Alert.astro** | primaryButton, secondaryButton (action buttons) | No | Yes | Add `buttonType="theme"` to both |
| **Kanban.astro** | Action bar buttons, default actions, column “Add card”, “Add column” | No | Yes | Add `buttonType="theme"` to every `<Button>` |
| **ShellPageHeader.astro** | Primary and outline buttons | Yes (`pageHeader`) | No (page header only) | No change |

No other files in `src/components/ui/` import Button. So the fix applies to **Dialog**, **Alert**, and **Kanban** only. **ShellPageHeader** is already correct.

---

## Fix summary

1. **Dialog.astro** (lines 56–58)  
   Add `buttonType="theme"` to the two default footer Buttons.

2. **Alert.astro** (lines 89–95 and 98–104)  
   Add `buttonType="theme"` to the primary and secondary action Buttons.

3. **Kanban.astro**  
   Add `buttonType="theme"` to every `<Button>`:
   - Action bar (when using `actionButtons`): the mapped Button (around line 100).
   - Default action bar: the four Buttons (Delete, Group, Subcards, Customize Columns) around lines 111–122.
   - Per column: the “Add card” Button (around lines 203–214).
   - Add column: the single Button at the bottom (around lines 218–224).

4. **ShellPageHeader.astro**  
   No change; keep `buttonType="pageHeader"`.

---

## Rationale

- **Theme buttons:** Use for all general UI (dialogs, alerts, kanban, forms, toolbars, etc.). Every component that uses Button except ShellPageHeader must use theme buttons.
- **Page header buttons:** The single exception is **ShellPageHeader** only (dark blue #043852). No other component should use `buttonType="pageHeader"`.
- Button.astro in this repo defaults to `buttonType = 'theme'`, but consumers may use a Button with default `pageHeader`. Making each component pass `buttonType="theme"` ensures correct styling regardless of the consumer’s Button default.
