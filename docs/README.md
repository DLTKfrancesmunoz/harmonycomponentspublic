# Design System Documentation

A multi-page documentation site built with Astro and Tailwind CSS for the Design System component library.

## Features

- **35 Documented Pages** - Foundation elements, shell layouts, and UI components
- **Live Examples** - Interactive component previews with all variants
- **Code Snippets** - Copy-ready HTML with syntax highlighting
- **Props Tables** - Comprehensive API documentation
- **Usage Guidelines** - Do's and don'ts for each component
- **Accessibility Notes** - ARIA attributes and keyboard navigation
- **Theme Support** - Dark/light mode with product themes (CP, VP, PPM, Maconomy)
- **Search** - Quick component finder with keyboard shortcut (⌘K)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd docs
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
docs/
├── src/
│   ├── components/       # Reusable Astro components
│   │   ├── CodeBlock.astro
│   │   ├── ComponentDoc.astro
│   │   ├── ExampleSection.astro
│   │   ├── PropsTable.astro
│   │   └── Search.astro
│   ├── data/
│   │   └── navigation.ts  # Navigation structure
│   ├── layouts/
│   │   └── DocsLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── foundation/
│   │   │   ├── colors.astro
│   │   │   ├── typography.astro
│   │   │   ├── spacing.astro
│   │   │   └── elevations.astro
│   │   ├── shell/
│   │   │   ├── layout.astro
│   │   │   ├── header.astro
│   │   │   ├── footer.astro
│   │   │   ├── page-content.astro
│   │   │   ├── left-sidebar.astro
│   │   │   └── right-sidebar.astro
│   │   └── components/
│   │       ├── accordion.astro
│   │       ├── alerts.astro
│   │       ├── badges.astro
│   │       ├── buttons.astro
│   │       └── ... (25 component pages)
│   └── styles/
│       └── global.css
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## Component Page Structure

Each component page includes:

1. **Header** - Component name, status badge, description
2. **Quick Links** - Jump to Examples, Props, Usage, Accessibility
3. **Examples** - Live component previews with variants
4. **Code Snippets** - Copyable HTML code
5. **Props Table** - Available options and defaults
6. **Usage Guidelines** - Best practices (Do's and Don'ts)
7. **Accessibility** - ARIA, keyboard, and screen reader notes

## Adding New Components

1. Create a new `.astro` file in `src/pages/components/`
2. Add navigation entry in `src/data/navigation.ts`
3. Use the component documentation pattern:

```astro
---
import DocsLayout from '../../layouts/DocsLayout.astro';
import CodeBlock from '../../components/CodeBlock.astro';
import PropsTable from '../../components/PropsTable.astro';
import ExampleSection from '../../components/ExampleSection.astro';

const props = [
  { name: 'variant', type: 'string', default: "'default'", description: 'Component variant' },
];
---

<DocsLayout title="Component Name" description="Brief description.">
  <article class="space-y-12">
    <!-- Header -->
    <header class="border-b border-slate-200 dark:border-slate-800 pb-8">
      <h1 class="font-display text-4xl font-bold">Component Name</h1>
      <p class="text-lg text-slate-600 dark:text-slate-400">Description.</p>
    </header>

    <!-- Examples -->
    <section id="examples" class="space-y-8">
      <ExampleSection title="Example Title" description="Example description.">
        <!-- Live example -->
      </ExampleSection>
      <CodeBlock language="html" filename="example.html" code={`<!-- Code -->`} />
    </section>

    <!-- Props -->
    <section id="props">
      <PropsTable props={props} />
    </section>

    <!-- Usage & Accessibility -->
  </article>
</DocsLayout>
```

## Technology Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Utility-first CSS
- **TypeScript** - Type safety
- **Tabler Icons** - Icon library

## License

MIT




