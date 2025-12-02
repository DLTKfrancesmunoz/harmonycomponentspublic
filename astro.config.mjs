import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://design-system.example.com',
  devToolbar: {
    enabled: false, // Hide the dev toolbar
  },
});

