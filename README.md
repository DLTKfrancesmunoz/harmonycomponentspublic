# Harmony Design System

A complete design system with foundation elements, shell layout components, and 25+ production-ready UI components with full multi-theme and dark/light mode support.

## Features

- 🎨 **Foundation System** - Colors, typography, spacing, and elevations
- 🏗️ **Shell Layout** - Complete application layout with header, sidebars, and footer
- ✅ **25+ UI Components** - From basic buttons to complex dialogs
- 🌓 **Multi-Theme Support** - CP, VP, PPM, and Maconomy themes with light/dark modes
- 📱 **Fully Responsive** - Optimized for all screen sizes
- ♿ **Accessible** - Built with semantic HTML and ARIA attributes
- ⚡ **Vanilla CSS** - No framework dependencies, uses CSS custom properties
- 🎯 **Production Ready** - Copy and use immediately

## Technology Stack

- **Astro** - Static site generator
- **Vanilla CSS** - Custom CSS with CSS variables (no Tailwind)
- **Tabler Icons** - For UI chrome and navigation
- **Custom Fonts**:
  - **Lexend** - Display and headings
  - **Figtree** - Body text and UI
  - **JetBrains Mono** - Code blocks

## Foundation System

### Design Tokens
1. **Colors** - Theme-specific palettes, semantic colors
2. **Typography** - Display, Headings, Body, Caption, Label, Overline scales
3. **Spacing** - Consistent spacing scale from 2px to 96px
4. **Border Radius** - Numbered convention (radius-04, radius-08, radius-12, radius-100)
5. **Elevations** - Shadow system for depth and hierarchy

## Theme System

The design system supports four product themes, each with light and dark modes:

| Theme | Primary Color | Description |
|-------|--------------|-------------|
| CP | #0073E6 | Changepoint |
| VP | #0073E6 | Vendor Portal |
| PPM | #0073E6 | Project Portfolio Management |
| Maconomy | #0073E6 | Maconomy |

## Shell Layout Components

5. **Shell Layout** - Complete application structure
6. **Shell Header** - Top navigation with branding and user controls
7. **Shell Footer** - Bottom tab bar for workspace navigation
8. **Page Content** - Main content area with header and layouts
9. **Left Sidebar** - Primary navigation with icon menu
10. **Right Sidebar** - Secondary actions and quick access panel

## UI Components

### Interactive Components
- Buttons (primary, secondary, outline, ghost, destructive, icon)
- Button Groups and segmented controls
- Accordion panels
- Tab Strip navigation
- Dialogs and modals
- Dropdowns and selects
- Toggle Switches

### Form Components
- Inputs (text, textarea, password with icons)
- Specialty Inputs (number, URL, currency, stepper, range)
- Checkboxes and Checkbox Groups
- Radio Buttons and Radio Groups
- Labels with helper text
- Date Picker

### Display Components
- Badges and status indicators
- Cards (basic, interactive, featured)
- Chips and tags
- Alerts (success, info, warning, error)
- Tooltips (top, bottom, left, right)
- Progress Bar
- Spinner

### Navigation Components
- Links with icons and variants
- List Menu
- Custom Scrollbar

## CSS Architecture

```
src/styles/
├── global.css      # Import orchestrator
├── tokens.css      # CSS custom properties (colors, spacing, typography)
├── reset.css       # CSS reset and base styles
├── layout.css      # Shell and page layout styles
├── components.css  # All component styles
└── utilities.css   # Utility classes
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## MCP Integration

The design system generates a `components.json` file for use with Model Context Protocol (MCP) tools like dsmanager.

### MCP Data Location

- **Location**: `mcp-data/components.json`
- **Purpose**: Component metadata (props, dependencies, CSS classes) for MCP tools
- **Generation**: Automatically generated before `npm run dev` or `npm run build`
- **Manual Generation**: Run `npm run generate:components`

### What Gets Generated

The `components.json` file contains:
- Component props (types, defaults, descriptions)
- Component dependencies
- CSS class names used by each component
- File paths and metadata

This file is **read-only** for MCP tools - it's generated from `component-props-inventory.json` and should not be edited manually.

### Change Detection

The generation script uses smart change detection:
- Only regenerates when component files, tokens, CSS, or inventory change
- Uses file hashing for accurate change detection
- Fast checks (~5-10ms) when nothing changed
- Full regeneration (~50-200ms) only when needed

**Note**: The `mcp-data/` folder is dedicated to MCP tooling and is separate from component code and design tokens.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Version

**v2.0.0** - Migrated to vanilla CSS architecture with multi-theme support

---

Built with ❤️ for designers and developers
