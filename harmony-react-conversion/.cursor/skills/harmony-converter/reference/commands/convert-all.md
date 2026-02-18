# /convert-all

Convert all Harmony components to the target framework. Runs the full convert-component flow (pre-flight, converter, verifier) for each component in sequence.

## Instructions

0. **Check Harmony installation (before resolving paths).**
   - If `.cursor/harmony.json` exists: paths are configured → proceed.
   - Else if `node_modules/@deltek/harmony-components/` exists: package is installed → proceed.
   - Else (neither exists): stop. Tell the user: "Harmony package not found. Run `npm install github:DLTKfrancesmunoz/harmonycomponents` to install it, then retry. See the harmony-converter skill's CONSUMER_GUIDE for full setup instructions." Do not ask the user to choose between npm vs git vs local path. Do not attempt to install. Do not proceed.

1. **User input.** The user provides:
   - A **target framework** (e.g. React, Vue, Svelte, Angular, vanilla).
   - Optional: **shell variant** (e.g. "VP dark", "CP dark") — if provided, convert shell first using `/convert-shell` flow before converting remaining components.
   - Optional: `--dry-run` — list all components that would be converted without converting. Stop after that output.
   - Optional: `--skip-shell` — skip shell components even if they haven't been converted (useful if the shell was already converted separately).

2. **Build the component list.**
   - Scan `node_modules/@deltek/harmony-components/src/components/ui/*.astro` (or the resolved Harmony root) for all `.astro` files. Each file is one component (filename without extension = component name).
   - Also include layout components from `src/layouts/*.astro` (e.g. ShellLayout).
   - This is the full list.

3. **Check what's already converted.**
   - For each component, check whether the output file already exists in the app output directory for the target framework (e.g. `src/components/Button.tsx` for React, `src/components/Button.vue` for Vue).
   - Mark already-converted components as SKIP.
   - If ALL components are already converted, report "All components already converted for [framework]" and stop.

4. **Determine conversion order.**
   - **Shell components first** (unless `--skip-shell`): Use the harmony-converter skill's shell conversion order (Icon, LeftSidebar, RightSidebar, TabStrip, ShellFooter, ShellPageHeader, Card, Avatar, ShellLayout, integration verify). Run the `/convert-shell` flow for these — this handles the verifier per component and integration verify at the end.
   - **Remaining components after shell:** All non-shell components from the full list, in alphabetical order. Each one runs through the `/convert-component` flow individually.

5. **Dry-run (if `--dry-run`).**
   Output:
   - Total components found: [N]
   - Already converted (SKIP): [list]
   - Shell components to convert: [list or "skip-shell"]
   - Remaining components to convert: [list]
   - Estimated tasks: [count]
   - Do not convert anything. Stop here.

6. **Convert shell (unless `--skip-shell` or all shell components already converted).**
   - Run the `/convert-shell` flow with the user's shell variant and framework.
   - This converts all shell leaf components in order, assembles ShellLayout, and runs integration verify.
   - If any shell component hits STUCK (3-round verifier cap), log it and continue to the next shell component. Report all STUCK items at the end.
   - After shell is done (or skipped), proceed to remaining components.

7. **Convert remaining components (one at a time, in order).**
   For each remaining component (alphabetical):
   - Skip if already converted (from step 3).
   - Run the `/convert-component` flow:
     - Resolve source path: `@harmony/[ComponentName].astro` (table lookup or fallback).
     - No preview file required for non-shell components.
     - Delegate to converter subagent with pre-flight checklist.
     - **Mandatory:** After the converter reports done, invoke the harmony-verifier agent. Do not skip this step. Do not proceed to the next component until the verifier returns zero deviations (or STUCK after 3 rounds).
   - Log result: PASS, STUCK (with deviation count), or ERROR.
   - **Batch checkpoint:** After every 5 components, stop and output a summary table of those 5 (component name, verifier result: PASS / STUCK / not verified). Wait for the user to say "continue" before proceeding to the next 5. Do not convert more than 5 components without stopping for user confirmation.
   - Proceed to next component.

8. **Report.**
   Summary table:

   | Component | Status | Notes |
   |-----------|--------|-------|
   | Icon | PASS | Shell component |
   | LeftSidebar | PASS | Shell component |
   | ... | ... | ... |
   | ShellLayout | PASS | Shell assembly |
   | Integration | PASS | Shell integration verify |
   | Accordion | PASS | |
   | Badge | PASS | |
   | Checkbox | STUCK (2 deviations) | [brief description] |
   | ... | ... | ... |

   - Total: [N] components
   - Converted: [N]
   - Skipped (already existed): [N]
   - STUCK (needs manual review): [N] — [list with deviation summaries]
   - Errors: [N] — [list]

## Important

- This command runs the full converter + verifier pipeline for every component. It does not skip the verifier for speed. Every component must pass verification.
- Shell components use the shell conversion order and integration verify. Non-shell components use the fallback flow (source from package, no preview required).
- If the user's app has no output directory established, ask once for the output path (e.g. "Where should components be written? e.g. src/components/harmony/") and use it for all components.
- Do not open a browser or start a dev server. To verify compilation, use `npm run build` (not `npm run dev`).
- The harmony-converter skill is the guide for all conversion rules, pitfalls, and framework-specific notes. Read it before starting.
- If a component fails to convert (e.g. source file not found, build error that can't be resolved), log it as ERROR and continue to the next component. Do not stop the entire batch for one failure.
