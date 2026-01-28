# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
