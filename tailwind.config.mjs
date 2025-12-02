/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        obsidian: '#09090b',
        charcoal: '#18181b',
        concrete: '#f4f4f5',
        acid: '#ccff00',
        danger: '#D14343',
        void: '#000000',
        surface: '#0a0a0a',
        panel: '#111111',
        border: '#222222',
        accent: '#043852',
        success: '#52BD94',
        error: '#D14343',
        lime: '#ccff00',
        dim: '#444444',
        muted: '#525252',
        text: '#e5e5e5',
        warning: '#FFB020',
        info: '#3366FF',
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-hover': 'var(--theme-primary-hover)',
        'theme-primary-light': 'var(--theme-primary-light)',
      },
    },
  },
  plugins: [],
};

