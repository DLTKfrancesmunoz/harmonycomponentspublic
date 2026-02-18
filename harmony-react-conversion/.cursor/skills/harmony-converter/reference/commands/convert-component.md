# /convert-component

Convert a single Harmony component to the target framework.

## Instructions

0. **Check Harmony installation (before resolving paths):**
   - If `.cursor/harmony.json` exists: Harmony paths are configured → proceed.
   - Else if `node_modules/@deltek/harmony-components/` exists: Harmony package is installed → proceed.
   - Else: Harmony is not set up. Tell the user: "Harmony package not found. Run `npm install github:DLTKfrancesmunoz/harmonycomponents` to install it, then retry. See the harmony-converter skill's CONSUMER_GUIDE for full setup instructions." Do NOT ask the user to choose between npm, git, or local path. Do NOT attempt to install it yourself. Do NOT proceed to conversion without the package.

1. **User input:** The user will supply a **component name** and a **target framework** (e.g. "TabStrip" and "Vue").

2. **Lookup:** Read the harmony-converter skill's **component table** (in the skill's SKILL.md, section "Component table and conversion order"). Find the row for that component.

3. **Not in table:** Use the fallback path. (1) **Locate source:** Resolve the component's .astro file in the Harmony package as `@harmony/[ComponentName].astro` (same @harmony resolution: `.cursor/harmony.json` then `node_modules/@deltek/harmony-components/src/components/ui/` or equivalent; include `src/layouts/` for layout components). (2) **Confirm on disk:** Verify the resolved file exists. If it does not exist, report to the user (e.g. component not found at path, check spelling or install package) and stop. (3) **If it exists:** Proceed with the same pre-flight checklist, delegate to converter, verifier loop (up to 3 rounds), and single-component scope. **No preview file is required** for fallback; the source .astro file is the reference. Resolve Output path as usual (ask user once if app output dir unknown).

4. **Resolve paths:** For **in-table** components, get Source, Preview, and Output from the table row. For **fallback** components, Source comes from step 3, Preview is N/A (not required), Output is resolved the same way. Resolve placeholders using this **priority order** (do not guess or ask the user prematurely):
   - **@harmony/** — (1) Check `.cursor/harmony.json` for overridden paths (e.g. `harmonyRoot`, component paths). (2) Fall back to `node_modules/@deltek/harmony-components/src/components/ui/` (or equivalent; include `src/layouts/` for layout components). (3) If neither resolves to a valid path, ask the user once.
   - **@preview/** — (In-table only.) Path to the preview file (e.g. `shell-layout-dark-vp.astro` under package or sparse-checkout preview path). Use the same priority: config file first if it defines preview path, then default package/preview path. Omit for fallback; no preview is supplied.
   - **@app/...** — Project output path for that component; use the correct extension for the framework (e.g. Vue → `.vue`, React → `.tsx`). If the project has no obvious app output directory, ask the user once (e.g. "Where should Vue components be written? e.g. src/components") and derive the path.

5. **Dry-run:** If the user includes `--dry-run` (e.g. `/convert-component TabStrip Vue --dry-run`), output the resolved paths, the pre-flight checklist, and the converter prompt that would be sent — but do **not** run the conversion or invoke the verifier. Stop after that output.

6. **Delegate to converter:** Invoke the **harmony-converter** agent with a prompt that @-mentions the resolved Source and Output files (and Preview for in-table components; for fallback, no preview is supplied). State the target framework. The converter subagent uses the same pre-flight and verifier flow; for fallback, the source .astro file is the only structural reference.

**Mandatory:** After the converter reports done, you MUST invoke the harmony-verifier agent before doing anything else. Do not summarize results, do not report to the user, do not proceed to the next component. The next action after the converter finishes is always: invoke the verifier. If you skip this step, the conversion is failed regardless of output quality.

7. **When converter reports done:** Delegate to the **harmony-verifier** agent with the same output and source files. If the verifier returns any deviations, hand back to the converter with the deviation list. **Loop cap:** Repeat at most **3 rounds**. If after 3 rounds the verifier still reports deviations, stop and report to the user: **STUCK: [N] deviations remain after 3 fix rounds. Manual review needed.** (Include the deviation list.) Do not loop indefinitely.

**Verifier execution:** If you cannot invoke the harmony-verifier as a separate agent, you MUST perform the verifier steps yourself before marking any component done. For each converted component: (1) Open the source Astro file. (2) Count the style rules in its <style> block. (3) Count the style rules in your converted output's CSS. (4) If the counts don't match, list every missing rule — that's your deviation list. (5) Compare DOM element count and order between source and output. (6) Check for behavior scripts in the source that have no corresponding handlers in the output. (7) Output the deviation list. (8) Fix every item. (9) Re-run steps 1–7. Do not proceed until zero deviations. "I can't invoke the verifier agent" is not a reason to skip verification — perform the steps yourself.

8. **Report:** Summarize for the user: component converted, framework, files touched, and verification result (or STUCK message with the deviation list).

**Important:** Read the component table from the harmony-converter skill (SKILL.md); path resolution is your job from the table (or fallback) and project layout. For **in-table** components, if the preview file is missing, path resolution must point to an existing preview path or the user must run sparse-checkout/copy per the skill's CONSUMER_GUIDE; the converter subagent will output BLOCKED if the preview file is not found. For **non-table (fallback)** components, no preview file is required; supply only Source and Output. If the verifier or converter reports missing/unresolved icons (e.g. "?" fallback), the converter must check the local project's Icon component and icon config (e.g. Icon.vue, iconPaths) and add missing path or inline data so every icon used is either custom img or inline SVG.
