/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dev from './generator/dev';

export default defineConfig(({ mode }) => {
  const baseConfig = defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      {
        ...checker({
          overlay: false,
          typescript: true,
          eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
        }),
        apply: 'serve',
      },
      dev(),
    ],
    resolve: {
      alias: {
        '@generator': path.resolve(__dirname, 'generator'),
        '@app': path.resolve(__dirname, 'src'),
        '~': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      reporters: 'verbose',
      setupFiles: ['./setupTests.ts'],
    },
  });

  switch (mode) {
    case 'ssr':
      return {
        ...baseConfig,
        build: {
          outDir: 'generator/_lib',
          ssr: 'generator/app/server.tsx',
          rollupOptions: {
            output: {
              format: 'es',
            },
          },
        },
      };
    default:
      return {
        ...baseConfig,
        server: {
          open: true,
        },
        build: {
          outDir: 'build',
        },
      };
  }
});
