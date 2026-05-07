import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@harmony-data': path.resolve(__dirname, './harmony-data'),
      '@dltkfrancesmunoz/harmony-design-system/styles': path.resolve(__dirname, './harmony-styles'),
    },
  },
})
