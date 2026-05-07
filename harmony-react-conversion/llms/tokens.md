# Tokens

Harmony uses CSS custom properties (design tokens) for spacing, colors, typography, and elevation. Token definitions live in the `@dltkfrancesmunoz/harmony-design-system` package under `src/tokens/` (e.g. `colors.json`, `spacing.json`, `typography.json`, `elevations.json`).

Do not resolve tokens to hardcoded values in component code; use the custom properties so themes and dark mode apply correctly.
