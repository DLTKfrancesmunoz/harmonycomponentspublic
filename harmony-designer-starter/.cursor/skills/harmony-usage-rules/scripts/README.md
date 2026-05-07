# harmony-usage-rules scripts (extraction helpers)

The files in this folder (**`HEADING_PATTERNS.md`**, related notes in **`PLAN_UPDATES.md`**) describe **automation for extracting usage rules from the full Harmony documentation site or documentation package** — not from the integration kit file tree.

In **this kit**, derive usage rules from the vendored files:

- **`harmony-styles/tokens.css`** + **`components.css`** — token and component styling rules
- **`reference-components/*.tsx`** — read-only spec for expected component behavior and accessibility

If a Harmony npm package is installed (e.g. `@dltkfrancesmunoz/harmony-design-system`), you can also read `docs/RULES.md` from that package. Use the heading-pattern docs here only when maintaining or running rule-extraction tooling against upstream HTML/markdown sources.
