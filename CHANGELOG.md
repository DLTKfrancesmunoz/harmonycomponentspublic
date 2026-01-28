# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Card Component**: Fixed header styling to match documentation. Card headers now use neutral styling (normal text color, no colored background) as originally documented. The `withHeader` prop creates a neutral header section with standard text styling and a bottom border. The `primary` prop only adds a 6px top border in the theme primary color.

### Fixed
- **Card Component**: Added missing neutral styles for header elements (`.card__header-title`, `.card__header-subtitle`, `.card__header-content`, `.card__header-actions`). Cards using `headerTitle` prop now have proper font-sizing (18px) instead of falling back to browser h2 defaults (24-32px).
- **CSS Reset**: Removed font-size declarations from h1-h6 in reset.css. Typography sizing is now controlled exclusively by component classes and design token utilities, preventing conflicts between semantic HTML tags and component styling. This architectural fix ensures components have full control over their typography without reset interference.

### Migration Guide
If you were using `withHeader` and expecting a colored header bar with white text, you can achieve this with custom styling:
1. Use the header slot with your own styled header element
2. Add inline styles: `style="background: var(--theme-primary); color: var(--text-inverse); padding: var(--space-4);"`

## [1.0.1] - 2026-01-28

### Changed
- **Dialog**: Sticky header and footer (always visible); only the body scrolls when content overflows.
- **Dialog**: Min width 600px, default max width 700px (design tokens).
- **Dialog**: All dialog styles use design tokens only (no hardcoded pixel/vw values in component CSS); new tokens: `--dialog-min-width`, `--dialog-max-width-default`, `--dialog-margin`, `--dialog-margin-horizontal`, `--dialog-margin-vertical`, `--dialog-max-width-medium`, `--dialog-footer-btn-min-width`.

## [1.0.0] - 2026-01-27

### Added
- Initial release of @deltek/harmony-components as an installable npm package
- 40+ production-ready UI components for Astro applications
- 2 layout templates (ShellLayout, DocsLayout)
- Complete design token system (colors, typography, spacing, elevations)
- Multi-theme support (CP, VP, PPM, Maconomy)
- Light and dark mode support for all themes
- Comprehensive CSS system with vanilla CSS (no framework dependencies)
- Public assets (logos, icons) included in package
- Git + npm installation support for private repositories

### Components Included

**Form Controls:**
- Button, ButtonGroup
- Input, Textarea, NumberInput, RangeInput
- Checkbox, RadioButton, Toggle
- DateInput, Label

**Display:**
- Card, Badge, NotificationBadge, Chip
- Alert, Tooltip, Spinner, ProgressBar
- Table, Icon

**Navigation:**
- TabStrip, Stepper, Step, FloatingNav, Link

**Layout:**
- LeftSidebar, RightSidebar
- ShellPageHeader, ShellPanel

**Interactive:**
- Dialog, Dropdown, Accordion
- Kanban, KanbanCard

### Design Tokens
- Colors: Theme-specific palettes, semantic colors, light/dark modes
- Typography: Font families (Figtree, Lexend, JetBrains Mono), sizes, weights
- Spacing: Consistent spacing scale from 2px to 96px, border radius values
- Elevations: Shadow system for depth and hierarchy

### Layouts
- **ShellLayout**: Enterprise application shell with configurable header, footer, sidebars, and floating navigation
- **DocsLayout**: Documentation page layout

### Distribution
- Installable via npm from private GitHub repository
- Supports version pinning with git tags
- Auto-updates available via npm update
- Documentation for developers on installation and usage

[1.0.1]: https://github.com/DLTKfrancesmunoz/harmonycomponents/releases/tag/v1.0.1
[1.0.0]: https://github.com/DLTKfrancesmunoz/harmonycomponents/releases/tag/v1.0.0
