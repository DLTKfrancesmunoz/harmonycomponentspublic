# Composed Components Directory

This directory is a **reference for consuming projects**, not part of the Harmony package source.

## For Consuming Projects

When you customize Harmony components using Tier 2 (wrappers), create your wrapper components in:

```
your-project/
└── src/
    └── components/
        └── composed/          # Create this folder
            ├── README.md
            ├── TrackedButton.astro
            └── ProjectCard.astro
```

## Getting Started

### Step 1: Create Directory

```bash
mkdir -p src/components/composed
```

### Step 2: Copy Example Wrappers

```bash
# Copy individual examples
cp node_modules/@deltek/harmony-components/examples/wrappers/TrackedButton.astro \
   src/components/composed/

# Or copy all examples
cp node_modules/@deltek/harmony-components/examples/wrappers/*.astro \
   src/components/composed/
```

### Step 3: Create README

```bash
cat > src/components/composed/README.md << 'EOF'
# Composed Components (Tier 2)

This folder contains wrapper components that extend Harmony components.

See: @deltek/harmony-components/docs/customization/CONSUMER_GUIDE.md#component-patterns

## Our Wrappers

- TrackedButton.astro - Button with analytics
- ProjectCard.astro - Project card with status
EOF
```

### Step 4: Adapt Examples

Edit copied components to match your:
- Import paths
- Custom props
- Business logic
- Styling needs

## Why "Composed"?

The name indicates these components **compose** Harmony base components with your project-specific behavior.

Alternative names used in other projects:
- `src/components/wrappers/`
- `src/components/extended/`
- `src/components/custom/`

Choose what makes sense for your team.

## Documentation

See the complete setup guide:
- [Consumer Guide](../../docs/customization/CONSUMER_GUIDE.md)

## Example Wrappers

Reference implementations are in:
```
node_modules/@deltek/harmony-components/examples/wrappers/
```

Copy and adapt these to your `src/components/composed/` folder.
