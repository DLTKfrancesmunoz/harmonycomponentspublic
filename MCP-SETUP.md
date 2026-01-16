# Harmony MCP Data Setup Guide

## Overview

The Harmony Design System includes pre-generated MCP data for fast component queries. This data is committed to Git and automatically discovered by DSManager.

## How It Works

### For Designers (Remote Access)

When designers configure DSManager to use the Harmony repo from GitHub:

```json
// Claude Desktop config
{
  "mcpServers": {
    "design-system-manager": {
      "command": "node",
      "args": ["/path/to/DSManager/build/index.js"],
      "env": {
        "DESIGN_SYSTEMS_PATH": "https://github.com/DLTKfrancesmunoz/harmonycomponents.git",
        "GITHUB_CLONE_CACHE": "/tmp/dsmanager-cache"
      }
    }
  }
}
```

**What happens:**
1. DSManager clones the repo to `/tmp/dsmanager-cache/harmonycomponents/`
2. The `mcp-data/` folder is included in the clone (committed to Git)
3. HarmonyDataAdapter auto-discovers: `/tmp/dsmanager-cache/harmonycomponents/mcp-data/`
4. All 5 Harmony tools become available instantly ✅

### For Developers (Local Development)

When you're developing locally with both projects on your machine:

```
/Users/francesmunoz/Desktop/
├── DSManager/
└── harmonycomponents/
    └── mcp-data/  ← Auto-discovered as sibling directory
```

**What happens:**
1. DSManager looks for `mcp-data/` in sibling directories first
2. Finds: `/Users/francesmunoz/Desktop/harmonycomponents/mcp-data/`
3. All 5 Harmony tools work with your local data ✅

## Data Discovery Priority

HarmonyDataAdapter searches in this order:

1. **Environment Variable** (highest priority)
   - `HARMONY_MCP_DATA_PATH=/custom/path/mcp-data`
   - Use this to override the auto-discovery

2. **Git Clone Cache** (for remote users)
   - `$GITHUB_CLONE_CACHE/harmonycomponents/mcp-data/`
   - Default: `/tmp/dsmanager-cache/harmonycomponents/mcp-data/`

3. **Sibling Directory** (for local dev)
   - `../harmonycomponents/mcp-data/`

4. **Parent Directory** (alternative local dev setup)
   - `../../harmonycomponents/mcp-data/`

## Available Harmony Tools

When Harmony data is successfully loaded, these 5 tools become available:

1. **get_component_basic** - Component metadata and props
2. **get_dependencies** - Component dependency graph
3. **get_design_tokens** - Design tokens (spacing, colors, typography, elevations)
4. **get_component_structure** - DOM structure and slots ✨ NEW
5. **get_layout_data** - Layout composition data ✨ NEW

## Regenerating MCP Data

Developers should regenerate the data when components change:

```bash
cd harmonycomponents
npm run generate:mcp-data
```

This updates:
- `mcp-data/design-tokens.json` (31.5 KB)
- `mcp-data/components/*.json` (49 component files)
- `mcp-data/manifest.json` (dependency graph)

**Then commit and push:**
```bash
git add mcp-data/
git commit -m "chore: regenerate MCP data"
git push
```

Designers will get the updated data on their next `git pull` or fresh clone.

## Data Structure

```
mcp-data/
├── design-tokens.json          # All design tokens (31.5 KB)
├── manifest.json               # Component index and stats
├── components.json             # Legacy: all components in one file
└── components/                 # Individual component files
    ├── button.json
    ├── card.json
    ├── dialog.json
    └── ... (49 total)
```

## Troubleshooting

### "Harmony tools not available"

**Cause**: HarmonyDataAdapter couldn't find `mcp-data/`

**Solutions:**

1. **For remote users**: Ensure harmonycomponents repo is cloned
   ```bash
   ls /tmp/dsmanager-cache/harmonycomponents/mcp-data/
   ```

2. **For local dev**: Ensure projects are siblings
   ```bash
   ls /Users/francesmunoz/Desktop/harmonycomponents/mcp-data/
   ```

3. **Override path**: Set environment variable
   ```json
   "env": {
     "HARMONY_MCP_DATA_PATH": "/custom/path/mcp-data"
   }
   ```

### "Component data is stale"

Regenerate and commit:
```bash
cd harmonycomponents
npm run generate:mcp-data
git add mcp-data/
git commit -m "chore: update MCP data"
git push
```

## Benefits

✅ **Fast**: Pre-generated JSON is 10-100x faster than parsing .astro files
✅ **Rich Data**: Includes structure, slots, spacing, and dependencies
✅ **Git-Friendly**: Data is committed and versioned
✅ **Auto-Discovery**: Works for both local dev and remote designers
✅ **No Setup**: Designers get tools automatically when they clone

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DSManager (MCP Server)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐         ┌────────────────────────┐ │
│  │ Generic Tools      │         │ Harmony Tools          │ │
│  │ (13 tools)         │         │ (5 tools) ✨           │ │
│  ├────────────────────┤         ├────────────────────────┤ │
│  │ • list_components  │         │ • get_component_basic  │ │
│  │ • get_component    │         │ • get_dependencies     │ │
│  │ • save_component   │         │ • get_design_tokens    │ │
│  │ • preview_component│         │ • get_component_structure
│  │ • watch_component  │         │ • get_layout_data      │ │
│  │ • sync_now         │         │                        │ │
│  │ • etc...           │         │                        │ │
│  └────────────────────┘         └────────────────────────┘ │
│           │                               │                 │
│           ▼                               ▼                 │
│  ┌────────────────────┐         ┌────────────────────────┐ │
│  │ Parses .astro      │         │ Reads JSON             │ │
│  │ files on-the-fly   │         │ (pre-generated)        │ │
│  └────────────────────┘         └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│ Git Cloned Repo     │         │ mcp-data/                   │
│ /tmp/dsmanager-cache│         │ (in Git, auto-discovered)   │
│                     │         │                             │
│ harmonycomponents/  │         │ • design-tokens.json        │
│ ├── src/            │         │ • manifest.json             │
│ ├── components/     │         │ • components/*.json         │
│ └── ...             │         │   (49 files)                │
└─────────────────────┘         └─────────────────────────────┘
```

## Summary

**Designers** → Clone from Git → Get `mcp-data/` automatically → 5 Harmony tools work
**Developers** → Regenerate data → Commit to Git → Push → Designers get updates

No special setup required for designers! 🎉
