/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const baseConfig = defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      !['ssr', 'build'].includes(mode) &&
        checker({
          overlay: false,
          typescript: true,
          eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
        }),
    ],
    resolve: {
      alias: {
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
          outDir: 'build/server',
          ssr: 'src/server.tsx',
        },
      };
    default:
      return {
        ...baseConfig,
        build: {
          outDir: 'build/client',
        },
      };
  }
});
