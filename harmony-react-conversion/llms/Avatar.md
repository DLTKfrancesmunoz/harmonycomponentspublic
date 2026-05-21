# Avatar

User avatar for shell header, tables, and cards: default user icon, initials, or photo. Uses theme primary background for icon/initials; interactive mode renders a button with hover, focus-visible, and disabled states.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | 24×24 / 32×32 / 40×40; radii 4px / 8px / 12px |
| variant | 'icon' \| 'initials' \| 'image' | 'icon' | Default user icon, initials, or image (needs `src`) |
| initials | string | — | For `initials` variant; normalized to up to two letters |
| src | string | — | Image URL for `image` variant |
| alt | string | '' | Used in aria-label for image variant |
| interactive | boolean | false | Renders `<button>` for menu triggers |
| disabled | boolean | false | When interactive, disables the button |
| className | string | '' | Extra classes on root |

## Usage

```tsx
import { Avatar } from '@deltek/harmony-react';

<Avatar size="sm" interactive />
<Avatar variant="initials" initials="Jane Doe" />
<Avatar variant="image" src="/photo.jpg" alt="User" size="lg" />
```

## CSS classes

- `.avatar`, `.avatar--sm|md|lg`, `.avatar--initials`, `.avatar--image`
- `.avatar__icon`, `.avatar__initials`
- Documentation only (interactive button): `.avatar--demo-hover`, `.avatar--demo-focus` mirror hover and focus-visible styles for static screenshots.

## Image examples

Use a real photo URL for `src` (e.g. JPEG/PNG/WebP). The React gallery uses a fixed Unsplash portrait URL so the image variant works without copying assets into `public/`.

## Dependencies

- Icon (icon variant)
