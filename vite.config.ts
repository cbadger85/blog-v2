/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import ssg from './generator/plugin';

export default defineConfig({
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
    ssg(),
  ],
  resolve: {
    alias: {
      '@generator': path.resolve(__dirname, 'generator'),
      '@app': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    manifest: true,
    ssrManifest: true,
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: 'verbose',
    setupFiles: ['./setupTests.ts'],
  },
});
