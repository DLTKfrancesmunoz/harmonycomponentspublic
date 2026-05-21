# /convert-shell

Convert the full Harmony shell template to the target framework.

## Instructions

0. **Check Harmony installation (before resolving paths):**
   - If `.cursor/harmony.json` exists: Harmony paths are configured → proceed.
   - Else if `node_modules/@deltek/harmony-components/` exists: Harmony package is installed → proceed.
   - Else: Harmony is not set up. Tell the user: "Harmony package not found. Run `npm install github:DLTKfrancesmunoz/harmonycomponents` to install it, then retry. See the harmony-converter skill's CONSUMER_GUIDE for full setup instructions." Do NOT ask the user to choose between npm, git, or local path. Do NOT attempt to install it yourself. Do NOT proceed to conversion without the package.

1. **User input:** The user will supply a **shell variant** (e.g. "VP dark", "CP dark") and a **target framework** (e.g. "Vue"). Optional: if the user includes **--dry-run**, output the resolved paths and the sequence that would run, but do **not** run conversion or verifier. Stop after that output.

2. **Lookup:** Read the harmony-converter skill's **shell conversion order** (in the skill's SKILL.md). Map shell variant to preview file: e.g. "VP dark" → `shell-layout-dark-vp.astro`, "CP dark" → `shell-layout-dark-cp.astro`. Use the same path-resolution priority as in /convert-component for @harmony and @preview: (1) .cursor/harmony.json, (2) node_modules default, (3) ask user once.

3. **Leaf components (in order):** For each of: Icon, LeftSidebar, RightSidebar, TabStrip, ShellFooter, ShellPageHeader, Card, Avatar:
   - Run the **convert-component** flow for that component (table lookup → path resolution → delegate to converter → delegate to verifier until zero deviations, with the 3-round cap per component).
   - **Mandatory:** After the converter reports done, you MUST invoke the harmony-verifier agent before doing anything else. Do not summarize results, do not report to the user, do not proceed to the next component. The next action after the converter finishes is always: invoke the verifier. If you skip this step, the conversion is failed regardless of output quality.
   - Do not proceed to the next component until the verifier returns zero deviations for the current one (or STUCK).

4. **Shell assembly:** Run the convert-component flow for **ShellLayout** (same: delegate to converter, then verifier until zero deviations, with the 3-round cap).

5. **Integration verify:** Run the verifier **once** for the full shell integration. **Reference files for this step (state explicitly when delegating to the verifier):** compare the **full preview file** (e.g. `shell-layout-dark-vp.astro` for VP dark — the same file used for the shell variant) to the **assembled shell output** (the composed app shell in the target framework). Integration diff = preview file vs assembled output; this is not component-level source vs single output. Fix any integration deviations if needed; apply the same 3-round cap if re-running the verifier.

**Verifier execution:** If you cannot invoke the harmony-verifier as a separate agent, you MUST perform the verifier steps yourself before marking any component done. For each converted component: (1) Open the source Astro file. (2) Count the style rules in its <style> block. (3) Count the style rules in your converted output's CSS. (4) If the counts don't match, list every missing rule — that's your deviation list. (5) Compare DOM element count and order between source and output. (6) Check for behavior scripts in the source that have no corresponding handlers in the output. (7) Output the deviation list. (8) Fix every item. (9) Re-run steps 1–7. Do not proceed until zero deviations. "I can't invoke the verifier agent" is not a reason to skip verification — perform the steps yourself.

6. **Report:** Summarize for the user: shell variant, framework, components converted, and integration verification result (or STUCK with deviation list). If the verifier or converter reports missing/unresolved icons (e.g. "?" fallback), the converter must check the local project's Icon component and icon config (e.g. Icon.vue, iconPaths) and add missing path or inline data so every icon used is either custom img or inline SVG.

**Note:** The skill's order is: leaf components first (Icon through Avatar), then ShellLayout (assembly), then integration verify. The integration step uses the two reference inputs above so the verifier knows what "integration diff" means.
