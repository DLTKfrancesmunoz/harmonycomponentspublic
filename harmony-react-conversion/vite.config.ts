import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      react(),
      ...(isLib
        ? [
            dts({
              insertTypesEntry: true,
              include: ['src/**/*.ts', 'src/**/*.tsx'],
              exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
            }),
          ]
        : []),
    ],
    server: {
      port: 5174,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@harmony-data': path.resolve(__dirname, '../src/data'),
        '@deltek/harmony-components/styles': path.resolve(__dirname, '../src/styles'),
      },
    },
    ...(isLib && {
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'HarmonyReact',
          formats: ['es'],
          fileName: 'index',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
          },
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    }),
  }
})
