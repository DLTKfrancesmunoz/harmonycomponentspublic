import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://design-system.example.com',
  devToolbar: {
    enabled: false,
  },
  // Note: Astro only processes files in src/ and public/ by default
  // The ai/ directory at root is automatically excluded from builds
});
