# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Button**: Dela variants `dela` (4px radius) and `dela-pill` (fully rounded) with gradient background and Stars graphic for launching AI/Dela features.
- **ShellPanel**: Dela variant (`variant="dela"`) for the Digital Assistant panel. When used with the right sidebar's Dela (DStar_LM.svg) item, the panel shows gradient header with icons (edit, help, expand, close) and content with DelaChat.svg next to Dela messages and user avatar next to user messages (per Figma). RightSidebar only sets gradient and title and does not replace header/content when opening from DStar_LM.svg. Full example on the [Dela foundation page](/foundation/dela#demo). New design tokens: `--dela-bubble-bg`, `--dela-user-bubble-bg`. New public asset: `DelaChat.svg` for the Dela panel content.

### Changed
- **RightSidebar**: Dela AI icon now uses `DStar_LM.svg` (replacing `D_64x64.svg`). Active state: gradient background on item (--linear-new), 12px radius, white inverted icon, same pattern as other sidebar icons. New design token: `--linear-new`. Copy `DStar_LM.svg` to your app's `public/` when using the default right sidebar (see [Consumer Guide](/docs/customization/CONSUMER_GUIDE.md#step-5-icons-and-static-assets-shell-layout--sidebars)).
- **Card Component**: Fixed header styling to match documentation. Card headers now use neutral styling (normal text color, no colored background) as originally documented. The `withHeader` prop creates a neutral header section with standard text styling and a bottom border. The `primary` prop only adds a 6px top border in the theme primary color.

### Fixed
- **Button (Dela variants)**: Text and icon now stay white in dark mode by using `--dela-header-content-fg` instead of `--text-inverse`.
- **ShellPanel (Dela variant)**: Chat message box is now docked to the bottom of the panel. Content area and input box use a white background (no gray). Icons (attach/paperclip, microphone, send) are inside the single white input box. New structure: `dela-panel__body`, `dela-panel__scroll` for scrollable chat region; `dela-panel__input-box` containing input and `dela-panel__input-action` buttons. See [Dela foundation page](/foundation/dela#demo) and [Shell Panel](/shell/panel) docs.
- **ShellPanel (Dela variant)**: Scroll applies only to panel content; the right sidebar does not scroll. The shell panel scrollbar is between the header and the chat message box (scrollable region is `dela-panel__scroll`). Dela panel supports dark mode for CP, VP, PPM, and Maconomy via tokens. New tokens: `--dela-panel-avatar-bg`, `--dela-panel-content-bg`, `--dela-panel-input-bg`, `--dela-panel-card-bg`, `--shell-panel-width-full`. User avatar uses theme primary (container + Icon or token); content/suggested card/input backgrounds use design tokens only (no hardcoded colors). No top padding on the toolbar container (pencil/help icons sit directly under the header).
- **ShellPanel (Dela variant)**: Dela panel avatar uses rounded corners (`border-radius: var(--radius-lg)`), not circular and not square. Dela gradient header title and icons stay light/readable in dark mode via token `--dela-header-content-fg`.
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
