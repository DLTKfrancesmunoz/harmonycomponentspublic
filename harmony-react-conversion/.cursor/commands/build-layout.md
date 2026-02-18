# /build-layout

Compose a page layout inside a Harmony shell using converted components.

## Instructions

1. **Parse the request.** The user provides:
   - A layout description (e.g. "settings page with form inputs and toggles")
   - A shell variant (e.g. "VP dark")
   - A target framework (e.g. "Vue")
   - Optional: `--dry-run` (output the composition plan without writing files)

2. **Check prerequisites.**
   - The shell must already be converted for the target framework. Check that ShellLayout.[vue|tsx|svelte|component.ts] exists in the app output directory.
   - If the shell is not converted, tell the user: "Shell not found. Run `/convert-shell [variant] [framework]` first."
   - Do NOT convert the shell as part of this command.

3. **Match to a layout pattern.**
   - Read the layout-builder skill's Layout Patterns section.
   - Find the closest match to the user's description.
   - If no pattern matches, compose from the description directly using the composition constraints from the skill.
   - If the user's description is ambiguous, ask ONE clarifying question (e.g. "Single card or multi-card layout?").

4. **Check for a documented pattern in design-patterns.**
   - Search the design-patterns registry for a matching pattern (e.g. "settings page" might match a documented pattern).
   - If found, use its anatomy (and Component Tree if present) as the structural reference.
   - If not found, use the layout-builder skill's reference pattern.

5. **Resolve components.**
   - For each component in the layout, look up the harmony-converter skill's component table.
   - If a component is not in the table, use the converter's fallback (locate `@harmony/[ComponentName].astro`, confirm exists).
   - If a component has not been converted yet for this framework, tell the user: "[Component] not yet converted. Run `/convert-component [name] [framework]` first."
   - Do NOT convert components as part of this command.

6. **Dry-run (if `--dry-run`).**
   Output:
   - Layout pattern used (or "custom from description")
   - Components needed and their resolved paths
   - Missing components (not yet converted)
   - Composition structure (indented tree):
     ```
     ShellLayout
       └── content slot
           ├── ShellPageHeader (title: "Settings")
           ├── Card (primary, elevated)
           │   ├── Label + Input (name)
           │   ├── Label + Toggle (notifications)
           │   └── Label + Toggle (dark mode)
           └── div.button-bar
               ├── Button (outline) "Cancel"
               └── Button (primary) "Save"
     ```
   - Do not write any files. Stop here.

7. **Compose the layout.**
   - Create a new page/view file in the app output directory (e.g. SettingsPage.vue, SettingsPage.tsx).
   - Import the resolved components.
   - Compose them according to the pattern anatomy and composition constraints (nesting, spacing, grid) from the layout-builder skill.
   - Use the correct framework idiom (Vue template, JSX, Angular template, Svelte).
   - Apply Harmony spacing tokens and classes only. Do not use arbitrary px values or non-token spacing.

8. **Wire into shell.**
   - If the shell uses a router, add a route for the new page.
   - If the shell uses a static content slot, replace the placeholder content with the new layout (or add alongside existing content).
   - Do not modify any converted shell component. If wiring requires a shell change, report it to the user.

9. **Verify.**
   - Delegate to the layout-verifier agent (or reuse harmony-verifier with layout checks):
     - All components from the pattern anatomy are present in the output.
     - Nesting follows composition constraints (no Card-in-Card, etc.).
     - Spacing uses Harmony tokens only.
     - No components are imported but unused.
     - No arbitrary/non-token styles.
   - If deviations found, fix and re-verify. Loop cap: 3 rounds. If after 3 rounds deviations remain, stop and report: `STUCK: [N] deviations remain after 3 fix rounds. Manual review needed.` (Include the deviation list.)

10. **Report.**
    - Page file created: [path]
    - Components used: [list]
    - Pattern used: [name or "custom"]
    - Wiring: [route added / slot content replaced / manual wiring needed]
    - Verification: [pass / STUCK with deviation list]

## Important

- This command composes layouts from already-converted components. It never converts components or shells. If prerequisites are missing, it tells the user which `/convert-*` command to run first.
- All spacing and layout must use Harmony design tokens. No arbitrary values.
- The layout-builder skill is the guide for patterns and constraints. The design-patterns registry is the optional source for documented pattern anatomy.
- If the user includes `--dry-run`, output the full composition plan but do not write any files or invoke the verifier.
