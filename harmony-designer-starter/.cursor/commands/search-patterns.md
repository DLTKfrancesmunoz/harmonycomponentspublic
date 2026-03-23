# /search-patterns

Search the design-patterns registry for patterns by query, product, or category.

## Input

The user provides one or more of:
- **Query** (keyword search), e.g. `wizard`, `sidebar`, `accordion`
- **Product** (filter by product), e.g. `--product PPM`, `--product CP`
- **Category** (filter by category), e.g. `dialogs`, `navigation`, `forms`
- Or **list all** patterns (no filters)

Examples: `/search-patterns wizard`, `/search-patterns --product PPM`, `/search-patterns --category navigation`, `/search-patterns wizard --product PPM`

## Instructions

1. Use the **design-patterns** skill for context (registry location, script usage).
2. Run the search script with the design-patterns reference directory and the appropriate flags:
   - Base: `python .cursor/skills/design-patterns/scripts/search_patterns.py --patterns-dir .cursor/skills/design-patterns/reference`
   - Add flags from the user's message: `--query "..."`, `--product "..."`, `--category "..."`, or `--list` to list all patterns.
   - Use `--format table` (default) so results are returned in table format.
3. Present the script output to the user (table of Pattern | Product | Category | Status | Path).
