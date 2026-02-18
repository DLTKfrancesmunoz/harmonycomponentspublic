# /generate-llms-txt

Generate `llms.txt` and `llms-full.txt` files for the Harmony React component library so any LLM can understand the component APIs without needing Cursor skills or agent workflows.

## Instructions

0. **Check prerequisites.**
   - Converted React components must exist in the app output directory (e.g. `src/components/harmony/*.tsx`). If no converted components are found, tell the user: "No converted components found. Run `/convert-all React` first."
   - Optional: Harmony package installed (`node_modules/@deltek/harmony-components/`) for Astro doc pages as a secondary source for descriptions and usage notes.

1. **User input.**
   - Optional: **output directory** for the generated files (default: project root).
   - Optional: **component directory** override (default: `src/components/harmony/`).
   - Optional: `--dry-run` — list all components that would be documented without generating files.

2. **Scan components.**
   - Read every `.tsx` (React), `.vue` (Vue), `.svelte` (Svelte), or `.component.ts` (Angular) file in the component directory.
   - For each component, extract:
     - **Component name** (from filename and export).
     - **Props interface** (all props with types, defaults, and JSDoc descriptions if present).
     - **Variant types** (e.g. `type ButtonVariant = 'primary' | 'secondary' | ...`).
     - **Size types** (e.g. `type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'`).
     - **Slot/children pattern** (what content the component accepts).
     - **Imports** (dependencies on other Harmony components).

3. **Enrich from Astro docs (optional).**
   - If `node_modules/@deltek/harmony-components/src/pages/components/` exists, read the corresponding doc page for each component (e.g. `buttons.astro` for Button).
   - Extract: description paragraph, usage guidelines, accessibility notes, "when to use / when not to use."
   - If the Astro docs are not available, generate descriptions from the Props interface and component structure. Mark these as "auto-generated" in a comment.

4. **Generate `llms.txt` (index file).**

   Format per the llms.txt spec:

   ```markdown
   # Harmony React Components

   > Harmony is Deltek's design system. This file documents the React component library converted from the Harmony Astro design system. Use these components with Harmony CSS tokens and themes (theme-cp, theme-vp, theme-ppm, theme-maconomy) with light and dark modes.

   Important notes:
   - All components use Harmony CSS custom properties (tokens). Do not resolve to hardcoded values.
   - All components use BEM class naming. Do not rename classes.
   - Themes are applied via HTML class (e.g. `html.theme-cp`). Dark mode via `html.theme-cp dark`.
   - CSS import order: reset.css → tokens.css → global.css → components.css.

   ## Components

   - [Button](./llms/Button.md): Primary action component with variants (primary, secondary, tertiary, outline, ghost, destructive, dela). Sizes xs–lg.
   - [Card](./llms/Card.md): Content container with optional header (headerTitle, headerSubtitle). Variants: default, primary, outlined, elevated.
   - [Alert](./llms/Alert.md): Feedback messages with variants (info, success, warning, error). Default and enhanced styles.
   ...

   ## Shell Components

   - [ShellLayout](./llms/ShellLayout.md): App shell template composing header, footer, sidebars, page header, and content area.
   - [ShellHeader](./llms/ShellHeader.md): Top header with app switcher, environment/company picker, avatar.
   ...

   ## Tokens and Theming

   - [Tokens](./llms/tokens.md): CSS custom properties for spacing, colors, typography, elevation.
   - [Themes](./llms/themes.md): Four themes (CP, VP, PPM, Maconomy) with light and dark modes.

   ## Optional

   - [Form Controls](./llms/form-controls.md): Input, Textarea, NumberInput, Checkbox, RadioButton, Toggle, DateInput, Label.
   - [Pickers](./llms/pickers.md): DatePicker, DateTimePicker, MonthPicker, WeekPicker, TimePicker, PickerPopup.
   ```

   Save to `[output directory]/llms.txt`.

5. **Generate per-component markdown files.**

   For each component, create `llms/[ComponentName].md` with:

   ```markdown
   # Button

   Primary action component for the Harmony design system.

   ## Props

   | Prop | Type | Default | Description |
   |------|------|---------|-------------|
   | variant | 'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'destructive' \| 'dela' \| 'dela-pill' | 'primary' | Visual style |
   | size | 'xs' \| 'sm' \| 'md' \| 'lg' | 'md' | Button size |
   | disabled | boolean | false | Disabled state |
   | loading | boolean | false | Loading state with spinner |
   | icon | string | undefined | Icon name (left or right of label) |
   | iconPosition | 'left' \| 'right' | 'left' | Icon placement |
   | fullWidth | boolean | false | Stretch to container width |
   | href | string | undefined | Renders as anchor instead of button |
   | children | ReactNode | — | Button label content |

   ## Usage

   ```tsx
   import { Button } from './components/harmony/Button';

   <Button variant="primary" size="md">Save</Button>
   <Button variant="secondary" icon="plus" iconPosition="left">Add Item</Button>
   <Button variant="destructive" loading loadingText="Deleting...">Delete</Button>
   ```

   ## Variants

   - **primary**: Filled background with theme primary color
   - **secondary**: Outlined with theme color border
   - **tertiary**: Text-only, no background or border
   - **outline**: Neutral outlined style
   - **ghost**: Transparent, hover reveals background
   - **destructive**: Error/red for dangerous actions
   - **dela**: Gradient background for AI features
   - **dela-pill**: Same as dela with full border radius

   ## CSS Classes

   Base: `.btn`. Modifiers: `.btn--primary`, `.btn--sm`, `.btn--icon-md`, `.btn--loading`, `.btn--full`, `.btn--vertical`, `.btn--page-header`.

   ## Dependencies

   None (standalone component).
   ```

   Save each to `[output directory]/llms/[ComponentName].md`.

6. **Generate `llms-full.txt` (expanded single file).**

   Concatenate all per-component markdown files into one file with XML-style section markers (following the llms.txt convention for expanded context):

   ```markdown
   # Harmony React Components — Full Documentation

   > Complete API reference for all Harmony React components.

   <component name="Button">
   [full Button.md content here]
   </component>

   <component name="Card">
   [full Card.md content here]
   </component>

   ...
   ```

   Save to `[output directory]/llms-full.txt`.

7. **Report.**
   - Files generated: `llms.txt`, `llms-full.txt`, and N component files in `llms/`.
   - Total components documented: [N].
   - Components with Astro doc enrichment: [N] (or "none — Astro docs not available").
   - Remind the user: "Review the generated files. Re-run `/generate-llms-txt` after converting new components or updating existing ones."

## Important

- Props, types, and defaults must come from the actual TypeScript interfaces in the component files. Do not invent props.
- Descriptions come from Astro doc pages when available, otherwise auto-generated from the code. Do not invent usage guidelines that aren't supported by the component API.
- The `llms.txt` index file follows the llms.txt spec: H1 title, blockquote summary, notes, H2 sections with linked file lists.
- The `llms-full.txt` is a single file for LLMs with small context windows or for pasting into a chat. It contains everything.
- Per-component files in `llms/` are for LLMs that support linked file resolution (following URLs from `llms.txt`).
- Do not include internal implementation details (state management, refs, effect hooks). Only document the public API (props, slots, variants, CSS classes).
- Keep each component doc concise. Props table + one usage example + variants list + CSS classes + dependencies. No tutorials.